const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const solc = require('solc');
const ganache = require('ganache');
const { BrowserProvider, ContractFactory, parseEther: eth, ZeroAddress } = require('ethers');

const root = path.resolve(__dirname, '..');
const sources = Object.fromEntries(fs.readdirSync(path.join(root, 'contracts'))
  .filter(file => file.endsWith('.sol')).sort()
  .map(file => [file, { content: fs.readFileSync(path.join(root, 'contracts', file), 'utf8') }]));
const output = JSON.parse(solc.compile(JSON.stringify({
  language: 'Solidity', sources,
  settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris',
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
})));
const errors = (output.errors || []).filter(error => error.severity === 'error');
assert.equal(errors.length, 0, errors.map(error => error.formattedMessage).join('\n'));

// Advance time explicitly to keep gas estimation and mining deterministic.
const chain = ganache.provider({ logging: { quiet: true }, miner: { timestampIncrement: 0 },
  wallet: { totalAccounts: 8, defaultBalance: 1000 }, chain: { hardfork: 'shanghai' } });
const provider = new BrowserProvider(chain, undefined, { cacheTimeout: -1 });
provider.pollingInterval = 10;
const lines = [
  'Solidity Smart Contracts Assignment - Automated Test Results',
  `Executed: ${new Date().toISOString()}`,
  `Compiler: ${solc.version()}; optimizer: 200 runs; EVM target: paris`,
  'Network: isolated, in-memory Ganache; ethers 6; no real funds or external RPC',
  `Compilation: PASS (${Object.keys(sources).length} source files)`, '',
];
let passed = 0;
let failed = 0;
const tx = async promise => (await promise).wait();
const equal = (actual, expected) => assert.equal(actual, expected);
async function revert(call, reason) {
  await assert.rejects(call, error => error.code === 'CALL_EXCEPTION' &&
    String(error.reason || error.shortMessage || error.message).includes(reason));
}
async function advance(seconds) {
  await provider.send('evm_increaseTime', [seconds]);
  await provider.send('evm_mine', []);
}
async function balance(contract) {
  return BigInt(await provider.send('eth_getBalance', [await contract.getAddress(), 'latest']));
}
function event(contract, receipt, name) {
  const parsed = receipt.logs.map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
    .find(log => log && log.name === name);
  assert.ok(parsed, `Missing ${name} event`);
  return parsed.args;
}
async function main() {
  const signers = await Promise.all(Array.from({ length: 8 }, (_, i) => provider.getSigner(i)));
  const [a, b, c, d, e] = signers;
  const addresses = await Promise.all(signers.map(signer => signer.getAddress()));
  const [A, B, C, D, E] = addresses;
  async function deploy(name, args = [], value = 0n) {
    const file = Object.keys(output.contracts).find(file => output.contracts[file][name]);
    const artifact = output.contracts[file][name];
    const contract = await new ContractFactory(artifact.abi, artifact.evm.bytecode.object, a)
      .deploy(...args, { value });
    await contract.waitForDeployment();
    return contract;
  }
  async function test(name, details, run) {
    try {
      await run(); passed++;
      const line = `PASS ${name}: ${details}`;
      lines.push(line); console.log(line);
    } catch (error) {
      failed++;
      const line = `FAIL ${name}: ${error.stack || error}`;
      lines.push(line); console.error(line);
    }
  }
  await test('01 Storage', 'initial value, set/get, ValueSet event, zero value', async () => {
    const s = await deploy('Storage', [42]);
    equal(await s.get(), 42n);
    const log = event(s, await tx(s.connect(b).set(100)), 'ValueSet');
    equal(log.who, B); equal(log.newValue, 100n); equal(await s.get(), 100n);
    await tx(s.set(0)); equal(await s.get(), 0n);
  });
  await test('02 Greeting', 'initial greeting, owner update/reset, event, non-owner rejection', async () => {
    const s = await deploy('Greeting', ['Hello']);
    equal(await s.greet(), 'Hello'); equal(await s.owner(), A);
    equal(event(s, await tx(s.setGreeting('GM Ganache')), 'GreetingChanged').newGreeting, 'GM Ganache');
    equal(await s.greet(), 'GM Ganache');
    await revert(s.connect(b).setGreeting.staticCall('bad'), 'Not the owner');
    await revert(s.connect(b).resetGreeting.staticCall(), 'Not the owner');
    await tx(s.resetGreeting()); equal(await s.greet(), 'Hello, World!');
  });
  await test('03 Counter', 'zero decrement rejection, increments to 100, upper limit, decrement/reset events', async () => {
    const s = await deploy('Counter'); equal(await s.count(), 0n);
    await revert(s.decrement.staticCall(), 'Count is zero');
    for (let i = 0; i < 100; i++) await tx(s.increment());
    equal(await s.count(), 100n);
    await revert(s.increment.staticCall(), 'Max limit reached');
    equal(event(s, await tx(s.decrement()), 'Decremented').newCount, 99n);
    event(s, await tx(s.reset()), 'Reset'); equal(await s.count(), 0n);
  });
  await test('04 Ownable / ProtectedVault', 'deposit, access control, ownership transfer, zero-address checks, withdrawal', async () => {
    const s = await deploy('ProtectedVault'); equal(await s.owner(), A);
    await tx(s.connect(b).deposit({ value: eth('1') })); equal(await s.contractBalance(), eth('1'));
    await revert(s.deposit.staticCall(), 'Zero deposit');
    await revert(s.connect(b).withdraw.staticCall(B, 1), 'Not the owner');
    await revert(s.transferOwnership.staticCall(ZeroAddress), 'Zero owner');
    const log = event(s, await tx(s.transferOwnership(B)), 'OwnershipTransferred');
    equal(log.previousOwner, A); equal(log.newOwner, B); equal(await s.owner(), B);
    await revert(s.withdraw.staticCall(A, 1), 'Not the owner');
    await revert(s.connect(b).withdraw.staticCall(ZeroAddress, 1), 'Zero recipient');
    await tx(s.connect(b).withdraw(B, eth('1'))); equal(await s.contractBalance(), 0n);
  });
  await test('05 SimpleBank', 'independent deposits, excess/zero withdrawal rejection, partial withdrawal, totals', async () => {
    const s = await deploy('SimpleBank');
    await tx(s.deposit({ value: eth('2') })); await tx(s.connect(b).deposit({ value: eth('3') }));
    equal(await s.myBalance(), eth('2')); equal(await s.connect(b).myBalance(), eth('3'));
    await revert(s.deposit.staticCall(), 'Zero deposit');
    await revert(s.withdraw.staticCall(eth('10')), 'Invalid withdrawal');
    await revert(s.withdraw.staticCall(0), 'Invalid withdrawal');
    event(s, await tx(s.withdraw(eth('1'))), 'Withdrawn');
    equal(await s.myBalance(), eth('1')); equal(await s.bankTotal(), eth('4'));
  });
  await test('06 Voting', 'authorization, duplicate/unauthorized votes, invalid index, winner and tie behavior', async () => {
    const s = await deploy('Voting', [['Alice', 'Bob']]); equal(await s.winnerName(), 'Alice');
    await revert(s.connect(b).authorize.staticCall(B), 'Not chairperson');
    for (const who of [A, B, C]) await tx(s.authorize(who));
    await revert(s.authorize.staticCall(B), 'Already authorized');
    await revert(s.connect(d).vote.staticCall(0), 'Not authorized');
    await revert(s.vote.staticCall(2), 'Invalid index');
    await tx(s.vote(0)); await tx(s.connect(b).vote(1)); equal(await s.winnerName(), 'Alice');
    await tx(s.connect(c).vote(1)); equal(await s.winnerName(), 'Bob'); equal(await s.totalVotes(1), 2n);
    await revert(s.vote.staticCall(1), 'Already voted');
  });
  await test('07 MyToken', '18-decimal supply, transfers, approvals, allowance consumption, invalid transfers', async () => {
    const s = await deploy('MyToken', ['Assignment Token', 'AST', 1000]);
    equal(await s.totalSupply(), eth('1000')); equal(await s.decimals(), 18n);
    event(s, await tx(s.transfer(B, eth('500'))), 'Transfer');
    await tx(s.connect(b).approve(C, eth('200')));
    await tx(s.connect(c).transferFrom(B, D, eth('200')));
    equal(await s.balanceOf(A), eth('500')); equal(await s.balanceOf(B), eth('300'));
    equal(await s.balanceOf(D), eth('200')); equal(await s.allowance(B, C), 0n);
    await revert(s.connect(c).transferFrom.staticCall(B, D, 1), 'Insufficient allowance');
    await revert(s.transfer.staticCall(ZeroAddress, 1), 'Zero address');
    await revert(s.connect(e).transfer.staticCall(A, 1), 'Insufficient balance');
  });
  await test('08 Crowdfunding', 'successful claim, failed-goal refund, deadlines, double claim/refund rejection', async () => {
    const success = await deploy('Crowdfunding', [eth('1'), 60]);
    const failure = await deploy('Crowdfunding', [eth('2'), 60]);
    await tx(success.connect(b).contribute({ value: eth('1') }));
    await tx(failure.connect(b).contribute({ value: eth('1') }));
    await revert(success.claimFunds.staticCall(), 'Not ended');
    await revert(failure.connect(b).refund.staticCall(), 'Refund unavailable');
    await advance(61); equal(await success.getRemainingTime(), 0n);
    await revert(success.connect(b).contribute.staticCall({ value: 1 }), 'Campaign ended');
    await revert(success.connect(b).claimFunds.staticCall(), 'Not owner');
    await tx(success.claimFunds()); equal(await success.claimed(), true); equal(await balance(success), 0n);
    await revert(success.claimFunds.staticCall(), 'Already claimed');
    await revert(failure.claimFunds.staticCall(), 'Goal not reached');
    await tx(failure.connect(b).refund()); equal(await failure.contributions(B), 0n);
    equal(await failure.raised(), eth('1')); equal(await balance(failure), 0n);
    await revert(failure.connect(b).refund.staticCall(), 'Nothing to refund');
  });
  await test('09 Lottery', 'entry fee/manager/minimum checks, winner event and payout, round reset', async () => {
    const s = await deploy('Lottery', [eth('0.01'), 5]);
    await revert(s.enter.staticCall({ value: eth('0.01') }), 'Manager cannot enter');
    await revert(s.connect(b).enter.staticCall({ value: 1 }), 'Wrong entry fee');
    await revert(s.pickWinner.staticCall(), 'Too few players');
    for (const signer of signers.slice(1, 6)) await tx(s.connect(signer).enter({ value: eth('0.01') }));
    await revert(s.connect(b).pickWinner.staticCall(), 'Not manager');
    const log = event(s, await tx(s.pickWinner()), 'WinnerSelected');
    assert.ok(addresses.slice(1, 6).includes(log.winner)); equal(log.amount, eth('0.05'));
    equal(await s.playersCount(), 0n); equal(await balance(s), 0n);
    await tx(s.connect(b).enter({ value: eth('0.01') })); equal(await s.playersCount(), 1n);
  });
  await test('10 TimeLockVault', 'deposit preserves deadline, beneficiary restrictions, extension and timed withdrawal', async () => {
    const s = await deploy('TimeLockVault', [B, 60]); const original = await s.unlockTime();
    await tx(s.deposit({ value: eth('1') })); equal(await s.unlockTime(), original);
    await revert(s.withdraw.staticCall(), 'Not beneficiary');
    await revert(s.connect(b).withdraw.staticCall(), 'Vault is still locked');
    await revert(s.extendLock.staticCall(60), 'Not beneficiary');
    await tx(s.connect(b).extendLock(60)); equal(await s.unlockTime(), original + 60n);
    await advance(121); equal(await s.timeRemaining(), 0n);
    await tx(s.connect(b).withdraw()); equal(await balance(s), 0n);
    await revert(s.connect(b).withdraw.staticCall(), 'Empty vault');
  });
  await test('11 Escrow', 'delivery, seller refund, both dispute resolutions, roles and state restrictions', async () => {
    const make = () => deploy('Escrow', [B, C], eth('1'));
    const direct = await make(); equal(await direct.state(), 1n);
    await revert(direct.connect(b).confirmDelivery.staticCall(), 'Not buyer');
    await tx(direct.confirmDelivery()); equal(await direct.state(), 2n); equal(await balance(direct), 0n);
    await revert(direct.confirmDelivery.staticCall(), 'Wrong state');
    const refund = await make(); await tx(refund.connect(b).refundBuyer()); equal(await refund.state(), 3n);
    for (const toSeller of [true, false]) {
      const disputed = await make();
      await tx(disputed.connect(toSeller ? a : b).raiseDispute()); equal(await disputed.state(), 4n);
      await revert(disputed.confirmDelivery.staticCall(), 'Wrong state');
      await revert(disputed.resolveToSeller.staticCall(), 'Not arbiter');
      await tx(toSeller ? disputed.connect(c).resolveToSeller() : disputed.connect(c).resolveToBuyer());
      equal(await disputed.state(), toSeller ? 2n : 3n); equal(await balance(disputed), 0n);
    }
  });
  await test('12 SimpleNFT', 'mint price, ownership, direct/approved transfers, approval clearing, supply cap, proceeds', async () => {
    const s = await deploy('SimpleNFT', ['Assignment NFT', 'ANFT']);
    await revert(s.mint.staticCall({ value: 1 }), 'Wrong price');
    await tx(s.mint({ value: eth('0.01') })); await tx(s.connect(b).mint({ value: eth('0.01') }));
    equal(await s.ownerOf(0), A); equal(await s.ownerOf(1), B);
    await revert(s.connect(b).transferNFT.staticCall(C, 0), 'Not token owner');
    await tx(s.transferNFT(C, 0)); await tx(s.connect(b).approve(A, 1));
    await tx(s.transferFrom(B, D, 1)); equal(await s.ownerOf(1), D); equal(await s.approvals(1), ZeroAddress);
    await revert(s.transferFrom.staticCall(D, A, 1), 'Not approved');
    for (let i = 2; i < 100; i++) await tx(s.mint({ value: eth('0.01') }));
    equal(await s.nextTokenId(), 100n);
    await revert(s.mint.staticCall({ value: eth('0.01') }), 'Sold out');
    await revert(s.connect(b).withdrawPayments.staticCall(), 'Not owner');
    await tx(s.withdrawPayments()); equal(await balance(s), 0n);
  });
  await test('13 EnglishAuction', 'minimum bid, pull refund, early/late ending, seller payout, no-bid auction, rounding', async () => {
    const s = await deploy('EnglishAuction', [60, eth('0.1')]);
    await revert(s.connect(b).bid.staticCall({ value: eth('0.1') }), 'Bid too low');
    await tx(s.connect(b).bid({ value: eth('0.11') })); await tx(s.connect(c).bid({ value: eth('0.12') }));
    await revert(s.connect(d).bid.staticCall({ value: eth('0.121') }), 'Bid too low');
    equal(await s.pendingReturns(B), eth('0.11')); await tx(s.connect(b).withdrawPending());
    equal(await s.pendingReturns(B), 0n);
    await revert(s.connect(b).withdrawPending.staticCall(), 'No pending refund');
    await revert(s.endAuction.staticCall(), 'Auction active');
    const empty = await deploy('EnglishAuction', [60, 1]);
    const tiny = await deploy('EnglishAuction', [60, 1]);
    await revert(tiny.connect(b).bid.staticCall({ value: 1 }), 'Bid too low');
    await tx(tiny.connect(b).bid({ value: 2 }));
    await advance(61);
    event(s, await tx(s.connect(d).endAuction()), 'AuctionEnded');
    equal(await s.ended(), true); equal(await balance(s), 0n);
    await revert(s.connect(b).bid.staticCall({ value: eth('1') }), 'Auction ended');
    await revert(s.endAuction.staticCall(), 'Already ended');
    await tx(empty.endAuction()); equal(await empty.ended(), true); equal(await balance(empty), 0n);
  });
  await test('14 MultisigWallet', 'deposit, initial approval, threshold execution, duplicate/non-owner checks, failed-execution rollback', async () => {
    const s = await deploy('MultisigWallet', [[A, B, C], 2]);
    await tx(a.sendTransaction({ to: await s.getAddress(), value: eth('2') }));
    await tx(s.submitTransaction(D, eth('1'))); equal(await s.getConfirmations(0), 1n);
    await revert(s.executeTransaction.staticCall(0), 'Insufficient confirmations');
    await revert(s.confirmTransaction.staticCall(0), 'Already confirmed');
    await revert(s.connect(e).submitTransaction.staticCall(D, 1), 'Not owner');
    event(s, await tx(s.connect(b).confirmTransaction(0)), 'Execution');
    equal((await s.transactions(0)).executed, true); equal(await balance(s), eth('1'));
    await revert(s.connect(c).confirmTransaction.staticCall(0), 'Already executed');
    await tx(s.submitTransaction(D, eth('2')));
    // Send an actual failing transaction to verify persisted state is rolled back.
    await assert.rejects(tx(s.connect(b).confirmTransaction(1, { gasLimit: 300000 })),
      error => error.code === 'CALL_EXCEPTION');
    equal(await s.getConfirmations(1), 1n); equal(await s.confirmed(1, B), false);
    await tx(a.sendTransaction({ to: await s.getAddress(), value: eth('1') }));
    await tx(s.connect(b).confirmTransaction(1)); equal((await s.transactions(1)).executed, true);
    equal(await balance(s), 0n);
  });
  await test('15 StakingRewards', 'time-based rewards, rate checkpoints, claim, added stake, unstake, owner checks, pool exhaustion', async () => {
    const s = await deploy('StakingRewards', [1000], eth('1'));
    const stakeB = await tx(s.connect(b).stake({ value: eth('1') }));
    await tx(s.connect(c).stake({ value: eth('2') })); equal(await s.totalStaked(), eth('3'));
    await advance(60);
    const now = (await provider.getBlock('latest')).timestamp;
    const start = (await provider.getBlock(stakeB.blockNumber)).timestamp;
    equal(await s.pendingReward(B), BigInt(now - start) * 1000n);
    const changed = await tx(s.setRewardRate(2000));
    const changeTime = (await provider.getBlock(changed.blockNumber)).timestamp;
    await advance(30);
    const later = (await provider.getBlock('latest')).timestamp;
    equal(await s.pendingReward(B), BigInt(changeTime - start) * 1000n + BigInt(later - changeTime) * 2000n);
    const claimed = event(s, await tx(s.connect(b).claimReward()), 'RewardClaimed'); assert.ok(claimed.reward > 0n);
    equal((await s.stakes(B)).amount, eth('1'));
    await tx(s.connect(b).stake({ value: eth('0.5') })); equal((await s.stakes(B)).amount, eth('1.5'));
    await tx(s.connect(c).unstake()); equal((await s.stakes(C)).amount, 0n);
    await revert(s.connect(c).unstake.staticCall(), 'No stake');
    await revert(s.connect(b).setRewardRate.staticCall(1), 'Not owner');
    await revert(s.connect(b).fundRewards.staticCall({ value: 1 }), 'Not owner');
    const poolBefore = await s.rewardPool(); await tx(s.fundRewards({ value: 100 }));
    equal(await s.rewardPool(), poolBefore + 100n);
    const empty = await deploy('StakingRewards', [1000]);
    await tx(empty.connect(b).stake({ value: eth('1') })); await advance(2);
    await revert(empty.connect(b).claimReward.staticCall(), 'Insufficient reward pool');
    await revert(empty.connect(b).unstake.staticCall(), 'Insufficient reward pool');
    equal((await empty.stakes(B)).amount, eth('1'));
  });
  lines.push('', `Summary: ${passed}/${passed + failed} contract groups passed; ${failed} failed.`);
  console.log(lines.at(-1));
  fs.writeFileSync(path.join(root, 'report', 'AUTOMATED_TEST_RESULTS.txt'), lines.join('\n') + '\n');
  if (failed) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => { provider.destroy(); await chain.disconnect(); });
