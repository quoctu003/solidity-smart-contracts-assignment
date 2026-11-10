# Smart Contract Report

**Name:** Đỗ Quốc Tú

**Student ID:** 30219034289

The contracts were tested on a local Ganache network. All 15 automated test groups passed; the results are in [AUTOMATED_TEST_RESULTS.txt](AUTOMATED_TEST_RESULTS.txt).

## 01. Storage

`Storage` keeps an unsigned integer that can be read with `get()` and changed with `set()`.
It introduces state variables, `view` functions, and events through `ValueSet`.
The tests checked the initial value of 42, changed it to 100 from another account, and then stored zero.
The returned values and the event's sender and value matched the expected results.

## 02. Greeting

`Greeting` stores a message and lets its owner change it or reset it to `Hello, World!`.
The `onlyOwner` modifier checks the caller before allowing either change.
The tests read the initial message, updated it to `GM Ganache`, checked the change event, and reset it.
Both update and reset calls from a different account were rejected.

## 03. Counter

`Counter` supports increment, decrement, and reset operations within the range 0–100.
The `require` checks prevent the value from going below zero or above the maximum.
The tests rejected decrement at zero, incremented to 100, and rejected one more increment.
Decrementing to 99 and resetting to zero also produced the expected values and events.

## 04a. Ownable

`Ownable` assigns ownership to the deploying account and allows that owner to transfer it.
Its `onlyOwner` modifier can be reused by contracts that inherit from it.
The tests used `ProtectedVault` to check the initial owner, transfer ownership, and inspect `OwnershipTransferred`.
A zero-address owner was rejected, and the previous owner could no longer withdraw after the transfer.

## 04b. ProtectedVault

`ProtectedVault` inherits `Ownable`, accepts ETH deposits, and restricts withdrawals to the owner.
It uses payable functions, a low-level ETH transfer, and a reentrancy lock during withdrawal.
The tests deposited 1 ETH, transferred ownership, and let the new owner withdraw the full amount.
Zero deposits, non-owner withdrawals, and withdrawals to the zero address were rejected; the final balance was zero.

## 05. SimpleBank

`SimpleBank` records each account's deposits and lets users withdraw from their own balance.
It uses a mapping and updates the balance before sending ETH, following Checks-Effects-Interactions.
The tests deposited 2 ETH and 3 ETH from two accounts, then withdrew 1 ETH from the first account.
The remaining balances were correct, the bank held 4 ETH, and zero or excessive withdrawals were rejected.

## 06. Voting

`Voting` lets the chairperson authorize accounts, with each authorized account allowed one vote.
Structs and mappings store candidates and voters; a tie is resolved in favor of the first candidate in the list.
The tests checked a tied result and then a result where Bob won with two votes.
They also rejected unauthorized voters, repeated votes, invalid candidate indices, and authorization by a non-chairperson.

## 07. MyToken

`MyToken` implements the main ERC-20 operations: transfers, approvals, and transfers made by an approved spender.
Balances and allowances use mappings, with 18 decimal places per token.
The tests created 1,000 tokens, transferred 500, and approved another account to spend 200 of them.
Balances and the remaining allowance were checked; spending beyond the allowance, sending to zero, and overspending were rejected.

## 08. Crowdfunding

`Crowdfunding` accepts contributions until a deadline, then allows an owner claim or contributor refunds depending on the goal.
It uses timestamps and contribution mappings, with separate conditions for successful and failed campaigns.
The tests covered both outcomes, including an owner claim and a contributor refund after the deadline.
Early settlement, late contributions, unauthorized claims, and repeated claims or refunds were rejected.

## 09. Lottery

`Lottery` collects a fixed entry fee and lets the manager select a winner once enough players have joined.
It stores players in an array and selects an index using the previous block hash, which is not secure randomness.
The tests entered five players, checked the 0.05 ETH prize and winner event, and confirmed that a new round could start.
They also rejected the wrong fee, manager entry, selection with too few players, and selection by another account.

## 10. TimeLockVault

`TimeLockVault` holds ETH until an unlock time, after which only the beneficiary can withdraw it.
The beneficiary can extend the existing deadline, while new deposits leave that deadline unchanged.
The tests checked these rules, advanced the local chain time, and withdrew the balance after expiry.
Early withdrawals, withdrawals by another account, and a second withdrawal from the empty vault were rejected.

## 11. Escrow

`Escrow` holds the buyer's payment until delivery is confirmed, a refund is agreed, or the arbiter resolves a dispute.
An enum tracks the state, and modifiers restrict each action to the correct participant and state.
Separate deployments tested delivery confirmation, a seller-issued refund, and dispute decisions in favor of either party.
Incorrect roles and state transitions were rejected, and completed settlements left no ETH in escrow.

## 12. SimpleNFT

`SimpleNFT` mints up to 100 tokens at 0.01 ETH each and supports direct transfers and transfers by an approved account.
It uses ownership, balance, and approval mappings; its custom interface does not implement the full ERC-721 standard.
The tests minted tokens, transferred them through both methods, checked that approvals were cleared, and withdrew the proceeds.
Incorrect payments, unauthorized actions, and minting beyond the 100-token limit were rejected.

## 13. EnglishAuction

`EnglishAuction` accepts bids until a deadline and pays the seller when the auction ends.
Each bid must increase the reference price by at least 5%, rounded upward; outbid users withdraw their refunds separately.
The tests accepted bids of 0.11 and 0.12 ETH, rejected 0.121 ETH, checked a refund, and settled the auction.
They also covered early ending, late bids, repeated ending, an auction with no bids, and rounding for small amounts.

## 14. MultisigWallet

`MultisigWallet` sends ETH only after a transaction receives enough confirmations from different owners.
Submitting a transaction counts as the first confirmation, and reaching the threshold triggers execution automatically.
The tests funded the wallet, executed a transfer with two confirmations, and rejected duplicate or non-owner calls.
A failed transfer rolled back its final confirmation; adding funds and confirming again allowed it to complete.

## 15. StakingRewards

`StakingRewards` accepts ETH stakes and calculates rewards from the amount staked, elapsed time, and reward rate.
It keeps earlier earnings when the owner changes the rate and separates reward funding from staked principal.
The tests checked rewards across a rate change, claimed rewards, added to a stake, and withdrew another account's stake.
Unauthorized owner actions and repeated unstaking were rejected; an empty reward pool blocked both claiming and unstaking.
