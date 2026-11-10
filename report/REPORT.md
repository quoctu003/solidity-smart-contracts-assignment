# Smart Contract Report

**Student:** Đỗ Quốc Tú | **Student ID:** 30219034289

These summaries describe the implementation and scenarios in `tests/run.cjs`. All 15 automated exercise groups passed. Execution results appear in [AUTOMATED_TEST_RESULTS.txt](AUTOMATED_TEST_RESULTS.txt). Existing Remix/Ganache screenshots cover selected operations in exercises 01–08; manual evidence for exercises 09–15 has not been provided.

## 01. Storage

- **Function:** Stores an unsigned integer initialized by the constructor and exposes `set` and `get`.
- **Concepts:** Persistent state, public functions, read-only `view` access, and event emission.
- **Tests:** Initialize to 42, update to 100 from another account, verify `ValueSet`, and store zero.
- **Manual evidence:** [01_test.PNG](../screenshots/01_test.PNG) shows `get()` returning 100.

## 02. Greeting

- **Function:** Stores a greeting that the deployer can update or reset to `Hello, World!`.
- **Concepts:** Strings, constructor ownership, reusable modifiers, access control, and change events.
- **Tests:** Read the initial greeting, update and reset as owner, inspect the event, and reject both operations from a non-owner.
- **Manual evidence:** The [update](../screenshots/02_test.PNG), [access error](../screenshots/02_error.PNG), and [reset](../screenshots/02_reset.PNG) are recorded.

## 03. Counter

- **Function:** Increments, decrements, and resets a counter restricted to the range 0–100.
- **Concepts:** Constants, unsigned arithmetic, `require` guards, boundary conditions, and operation events.
- **Tests:** Reject decrement at zero; increment to 100; reject the next increment; decrement to 99 and reset to zero.
- **Manual evidence:** [03_error-zero.PNG](../screenshots/03_error-zero.PNG) shows the lower-bound error; the upper-bound case is covered by automation.

## 04a. Ownable

- **Function:** Assigns ownership to the deployer and allows the current owner to transfer it.
- **Concepts:** The `onlyOwner` modifier, nonzero-address validation, inheritance, and `OwnershipTransferred` events.
- **Tests:** Through `ProtectedVault`, verify the initial owner, transfer ownership, inspect the event, and reject a zero owner and old-owner withdrawal.
- **Manual evidence:** [04_owner_changed.PNG](../screenshots/04_owner_changed.PNG) shows the ownership change on the derived contract.

## 04b. ProtectedVault

- **Function:** Accepts ETH deposits from any account and permits only its owner to withdraw to a chosen recipient.
- **Concepts:** Inherited access control, payable functions, low-level ETH transfers, and a reentrancy guard.
- **Tests:** Deposit 1 ETH; reject zero deposits, non-owner withdrawals, and a zero recipient; transfer ownership and withdraw the full balance.
- **Manual evidence:** [04_test.PNG](../screenshots/04_test.PNG) shows a partial withdrawal by the new owner; the automated test separately empties the vault.

## 05. SimpleBank

- **Function:** Maintains individual ETH balances and lets each depositor withdraw their own funds.
- **Concepts:** Address mappings and Checks-Effects-Interactions: update the ledger before transferring ETH.
- **Tests:** Deposit 2/3 ETH from separate accounts; reject zero deposits and zero/excess withdrawals; withdraw 1 ETH and verify a 4 ETH bank total.
- **Manual evidence:** [05_deposit.PNG](../screenshots/05_deposit.PNG) and [05_error.PNG](../screenshots/05_error.PNG) show deposits and an invalid withdrawal, with amounts separate from the automated scenario.

## 06. Voting

- **Function:** Lets a chairperson authorize voters, records one vote per authorized account, and reports the winner.
- **Concepts:** Structs, arrays, mappings, role checks, and tie-breaking in favor of the earliest candidate.
- **Tests:** Check authorization, invalid indices, duplicate/unauthorized votes, a tied result, and Bob winning with two votes.
- **Manual evidence:** [06_test.PNG](../screenshots/06_test.PNG) shows a separately configured election returning `Tu` as the winner.

## 07. MyToken

- **Function:** Implements token supply, balances, transfers, approvals, and delegated transfers with 18 decimal places.
- **Concepts:** Core ERC-20 operations, nested allowance mappings, base units, and `Transfer`/`Approval` events.
- **Tests:** Create 1,000 tokens, transfer 500, approve and spend 200, verify balances/exhausted allowance, and reject invalid transfers.
- **Manual evidence:** [07_test.PNG](../screenshots/07_test.PNG) shows balance queries; the full allowance workflow is verified by automation.

## 08. Crowdfunding

- **Function:** Collects ETH until a deadline, then permits an owner claim if the goal is met or contributor refunds otherwise.
- **Concepts:** Timestamp conditions, contribution accounting, exclusive settlement paths, and effects before interactions.
- **Tests:** Run successful/failed campaigns; reject premature settlement, late contributions, unauthorized/double claims, and repeat refunds; verify historical `raised`.
- **Manual evidence:** [08_test.PNG](../screenshots/08_test.PNG) shows a contribution; deadline settlement and refunds are covered by automation.

## 09. Lottery

- **Function:** Collects a fixed entry fee and lets the manager award the pot after reaching the minimum player count.
- **Concepts:** Payable address arrays, role restrictions, round reset, and previous-block-hash pseudorandomness.
- **Tests:** Reject manager entry, incorrect fees, insufficient players, and unauthorized selection; verify a valid winner, 0.05 ETH payout, reset, and new-round entry.
- **Limitation:** Block-hash selection is manipulable; a winner rejecting ETH prevents settlement. No manual screenshots are supplied.

## 10. TimeLockVault

- **Function:** Holds ETH until an unlock timestamp; only the beneficiary can extend the lock or withdraw.
- **Concepts:** Time-based access, payable deposits, beneficiary modifiers, and extensions added to the existing deadline.
- **Tests:** Verify deposits preserve the deadline; reject unauthorized/early withdrawal; extend the lock, advance time, withdraw, and reject an empty-vault withdrawal.
- **Manual evidence:** Not supplied; automation advances the local chain clock to test expiry.

## 11. Escrow

- **Function:** Holds a buyer's payment for a seller and allows an independent arbiter to settle disputes.
- **Concepts:** An enum state machine, distinct participant roles, guarded transitions, and state updates before payment.
- **Tests:** On separate deployments, confirm delivery, refund through the seller, and resolve disputes to either party; reject invalid roles and transitions.
- **Implementation detail:** Constructor funding starts in `AwaitingDelivery`; `AwaitingPayment` is not entered. No manual screenshots are supplied.

## 12. SimpleNFT

- **Function:** Mints up to 100 tokens at 0.01 ETH each, supports transfers/approvals, and lets the owner withdraw proceeds.
- **Concepts:** Token identifiers, ownership/balance mappings, delegated transfers, approval clearing, and a supply cap; this is not full ERC-721.
- **Tests:** Mint, transfer directly/through approval, reject incorrect prices and unauthorized calls, verify approval clearing, reach the 100-token cap, and withdraw proceeds.
- **Manual evidence:** Not supplied; minting, permissions, supply limits, and proceeds are checked automatically.

## 13. EnglishAuction

- **Function:** Accepts increasing bids until a deadline, supports separate refunds for losing bids, and pays the seller on settlement.
- **Concepts:** A minimum 5% increase rounded upward, pull payments, deadline guards, and one-time settlement.
- **Tests:** Accept 0.11/0.12 ETH bids, reject 0.121 ETH, withdraw an outbid amount, check early/late actions, settle, and test no-bid/tiny-value auctions.
- **Implementation detail:** The first bid must also exceed the starting price by 5%; no manual screenshots are supplied.

## 14. MultisigWallet

- **Function:** Stores ETH and executes a proposed transfer automatically when enough distinct owners confirm it.
- **Concepts:** Owner membership, transaction structs, nested confirmations, threshold authorization, and rollback on failure.
- **Tests:** Deposit 2 ETH, submit with one confirmation, execute at two, reject duplicate/non-owner calls, and verify failed-execution rollback before funding and retrying.
- **Implementation detail:** Submission counts as the first confirmation; `executed` is set before payment. No manual screenshots are supplied.

## 15. StakingRewards

- **Function:** Accepts ETH stakes, accrues rewards, supports claims/full unstaking, and lets the owner fund rewards and change the rate.
- **Concepts:** Reward wei per ETH per second, accumulated-rate checkpoints, fractional remainders, and reentrancy protection.
- **Tests:** Stake 1/2 ETH, verify timed rewards across a rate change, claim, add stake, unstake, reject invalid roles/repeat unstaking, and check pool exhaustion.
- **Implementation detail:** Rate changes preserve prior earnings; insufficient reward funding also blocks unstaking. No manual screenshots are supplied.
