# Solidity Smart Contracts Assignment

A collection of 15 Solidity exercises covering storage, access control, ETH payments, voting, tokens, crowdfunding, auctions, multisignature wallets, and staking.

## Student Information

| Field | Information |
| --- | --- |
| Full name | Đỗ Quốc Tú |
| Student ID | 30219034289 |
| Repository name | `solidity-smart-contracts-assignment` |
| Language | Solidity `^0.8.24` |

## Project Structure

```text
solidity-smart-contracts-assignment/
├── contracts/
│   ├── 01_Storage.sol
│   ├── 02_Greeting.sol
│   ├── 03_Counter.sol
│   ├── 04_Ownable.sol
│   ├── 05_SimpleBank.sol
│   ├── 06_Voting.sol
│   ├── 07_MyToken.sol
│   ├── 08_Crowdfunding.sol
│   ├── 09_Lottery.sol
│   ├── 10_TimeLockVault.sol
│   ├── 11_Escrow.sol
│   ├── 12_SimpleNFT.sol
│   ├── 13_EnglishAuction.sol
│   ├── 14_MultisigWallet.sol
│   └── 15_StakingRewards.sol
├── report/
│   ├── REPORT.md
│   └── AUTOMATED_TEST_RESULTS.txt
├── screenshots/
│   ├── README.md
│   └── *.PNG
├── tests/
│   └── run.cjs
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

There are 16 contract declarations across 15 source files: `04_Ownable.sol` contains both `Ownable` and its derived contract, `ProtectedVault`.

## Completion Status

**Verified result:** All 15 automated exercise groups passed; all 16 contract declarations compiled successfully.

Implementation means the source is present. Compilation and automated results refer to the local test suite. Available screenshots document the displayed operations; they do not establish complete manual test coverage.

| No. | Source / Contract | Implemented | Compiled | Automated tests | Remix / Ganache screenshots |
| --- | --- | --- | --- | --- | --- |
| 01 | [Storage](contracts/01_Storage.sol) | Yes | Yes | Pass | [Available](screenshots/01_test.PNG) |
| 02 | [Greeting](contracts/02_Greeting.sol) | Yes | Yes | Pass | [Available](screenshots/02_test.PNG) |
| 03 | [Counter](contracts/03_Counter.sol) | Yes | Yes | Pass | [Partial](screenshots/03_error-zero.PNG) |
| 04 | [Ownable / ProtectedVault](contracts/04_Ownable.sol) | Yes | Yes | Pass | [Available](screenshots/04_test.PNG) |
| 05 | [SimpleBank](contracts/05_SimpleBank.sol) | Yes | Yes | Pass | [Partial](screenshots/05_deposit.PNG) |
| 06 | [Voting](contracts/06_Voting.sol) | Yes | Yes | Pass | [Partial](screenshots/06_test.PNG) |
| 07 | [MyToken](contracts/07_MyToken.sol) | Yes | Yes | Pass | [Partial](screenshots/07_test.PNG) |
| 08 | [Crowdfunding](contracts/08_Crowdfunding.sol) | Yes | Yes | Pass | [Partial](screenshots/08_test.PNG) |
| 09 | [Lottery](contracts/09_Lottery.sol) | Yes | Yes | Pass | Not provided |
| 10 | [TimeLockVault](contracts/10_TimeLockVault.sol) | Yes | Yes | Pass | Not provided |
| 11 | [Escrow](contracts/11_Escrow.sol) | Yes | Yes | Pass | Not provided |
| 12 | [SimpleNFT](contracts/12_SimpleNFT.sol) | Yes | Yes | Pass | Not provided |
| 13 | [EnglishAuction](contracts/13_EnglishAuction.sol) | Yes | Yes | Pass | Not provided |
| 14 | [MultisigWallet](contracts/14_MultisigWallet.sol) | Yes | Yes | Pass | Not provided |
| 15 | [StakingRewards](contracts/15_StakingRewards.sol) | Yes | Yes | Pass | Not provided |

## Run the Automated Tests

Install Node.js 20 or later and npm, then run:

```bash
npm ci
npm test
```

The suite compiles every source with Solidity 0.8.24, optimizer enabled with 200 runs, and the Paris EVM target. It deploys to an isolated in-memory Ganache network using ethers 6 and checks successful operations, authorization failures, boundary conditions, events, balances, and deadlines. Expected failures check revert reasons; the multisignature test also checks rollback after an actual failed transaction. No external RPC server is needed. Time-dependent cases advance the local chain clock.

Each run writes [report/AUTOMATED_TEST_RESULTS.txt](report/AUTOMATED_TEST_RESULTS.txt). Short explanations and tested scenarios appear in [report/REPORT.md](report/REPORT.md).
