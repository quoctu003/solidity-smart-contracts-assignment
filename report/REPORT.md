# Smart Contract Report

**Name:** Đỗ Quốc Tú

**Student ID:** 30219034289

This report covers exercises 01–08, based on the manual tests shown in the Remix and Ganache screenshots.

## 01. Storage

`Storage` keeps an unsigned integer that can be read with `get()` and changed with `set()`.
It introduces state variables, `view` functions, and the `ValueSet` event.
The contract was compiled and deployed using Remix connected to Ganache.
After setting the value to 100, `get()` returned 100, as shown in [01_test.PNG](../screenshots/01_test.PNG).

## 02. Greeting

`Greeting` stores a message that only the owner can update or reset.
The `onlyOwner` modifier checks the caller before allowing a change.
The message was changed to `GM Ganache`, and an update from another account produced an [error](../screenshots/02_error.PNG).
Calling `resetGreeting()` restored `Hello, World!`, as shown in [02_reset.PNG](../screenshots/02_reset.PNG).

## 03. Counter

`Counter` supports increment, decrement, and reset operations within the range 0–100.
It uses `require` checks to prevent the value from going below zero or above the maximum.
The Remix transaction log shows successful calls to `increment()` and `decrement()`.
A further decrement at zero produced an error, recorded in [03_error-zero.PNG](../screenshots/03_error-zero.PNG).

## 04a. Ownable

`Ownable` assigns ownership to the deploying account and allows the owner to transfer it.
Its `onlyOwner` modifier is inherited by `ProtectedVault` to restrict access to protected functions.
Ownership was transferred to another Ganache account through `transferOwnership()`.
Calling `owner()` then returned the new address, as shown in [04_owner_changed.PNG](../screenshots/04_owner_changed.PNG).

## 04b. ProtectedVault

`ProtectedVault` accepts ETH deposits and allows only its owner to withdraw to a chosen address.
It combines inherited access control with payable functions and a reentrancy lock during withdrawal.
A [1 ETH deposit](../screenshots/04_deposit.PNG) was recorded, and a withdrawal attempt from a non-owner produced an [error](../screenshots/04_error.PNG).
After ownership was transferred, the new owner made a partial withdrawal and checked the remaining balance in [04_test.PNG](../screenshots/04_test.PNG).

## 05. SimpleBank

`SimpleBank` records each account's deposits and lets users withdraw from their own balance.
It uses an address mapping and updates the balance before sending ETH, following Checks-Effects-Interactions.
The screenshots show deposits and calls to `myBalance()` and `bankTotal()` in [05_deposit.PNG](../screenshots/05_deposit.PNG).
An attempt to withdraw more than the account's balance produced an error in [05_error.PNG](../screenshots/05_error.PNG).

## 06. Voting

`Voting` lets the chairperson authorize accounts, with each authorized account allowed one vote.
Structs and mappings store candidate details, voter permissions, and voting records.
The recorded test shows a successful vote and calls to check candidate vote totals.
The `winnerName()` query returned `Tu`, as shown in [06_test.PNG](../screenshots/06_test.PNG).

## 07. MyToken

`MyToken` implements token balances, transfers, approvals, and transfers by an approved spender.
It uses balance and allowance mappings, with 18 decimal places per token.
After compilation, `balanceOf()` was called for the deployer and another Ganache account.
The queried recipient's balance was zero in [07_test.PNG](../screenshots/07_test.PNG).

## 08. Crowdfunding

`Crowdfunding` collects contributions until a deadline and supports claims or refunds depending on whether the goal is reached.
It uses timestamps, a funding goal, and a mapping to track each account's contributions.
The contract was compiled and deployed, and a 1 ETH contribution completed successfully.
The contribution transaction and a query of the campaign goal are shown in [08_test.PNG](../screenshots/08_test.PNG).
