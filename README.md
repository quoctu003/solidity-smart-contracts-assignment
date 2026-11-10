# Solidity Smart Contracts Assignment

**Name:** Đỗ Quốc Tú

**Student ID:** 30219034289

This assignment contains 15 Solidity exercises, from storing a number to building a staking contract. The contracts were compiled with Solidity 0.8.24 and tested locally with Ganache.

## Folder structure

```text
solidity-smart-contracts-assignment/
├── contracts/                  # Solidity source files
├── report/
│   ├── REPORT.md               # Short explanations for each contract
│   └── AUTOMATED_TEST_RESULTS.txt
├── screenshots/                # Remix and Ganache screenshots
├── tests/
│   └── run.cjs                 # Automated tests
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Completion status

All 15 exercises are implemented, and all 15 automated test groups passed. Exercise 04 includes two contracts: `Ownable` and `ProtectedVault`.

| No. | Contract | Implementation | Automated tests | Screenshots |
| --- | --- | --- | --- | --- |
| 01 | [Storage](contracts/01_Storage.sol) | Completed | Passed | Included |
| 02 | [Greeting](contracts/02_Greeting.sol) | Completed | Passed | Included |
| 03 | [Counter](contracts/03_Counter.sol) | Completed | Passed | Included |
| 04 | [Ownable / ProtectedVault](contracts/04_Ownable.sol) | Completed | Passed | Included |
| 05 | [SimpleBank](contracts/05_SimpleBank.sol) | Completed | Passed | Included |
| 06 | [Voting](contracts/06_Voting.sol) | Completed | Passed | Included |
| 07 | [MyToken](contracts/07_MyToken.sol) | Completed | Passed | Included |
| 08 | [Crowdfunding](contracts/08_Crowdfunding.sol) | Completed | Passed | Included |
| 09 | [Lottery](contracts/09_Lottery.sol) | Completed | Passed | Not added |
| 10 | [TimeLockVault](contracts/10_TimeLockVault.sol) | Completed | Passed | Not added |
| 11 | [Escrow](contracts/11_Escrow.sol) | Completed | Passed | Not added |
| 12 | [SimpleNFT](contracts/12_SimpleNFT.sol) | Completed | Passed | Not added |
| 13 | [EnglishAuction](contracts/13_EnglishAuction.sol) | Completed | Passed | Not added |
| 14 | [MultisigWallet](contracts/14_MultisigWallet.sol) | Completed | Passed | Not added |
| 15 | [StakingRewards](contracts/15_StakingRewards.sol) | Completed | Passed | Not added |

The screenshots for exercises 01–08 show selected manual tests, rather than every case in the automated suite. The [screenshot index](screenshots/README.md) lists the available images and remaining cases.

## Running the tests

With Node.js 20 or later installed, run these commands from the project folder:

```bash
npm ci
npm test
```

The test script compiles the contracts and deploys them to a local Ganache network. It checks normal transactions, rejected calls, balances, events, and time limits. A separate Ganache server is not needed.

Compiler settings: Solidity **0.8.24**, optimizer enabled with **200 runs**, EVM target **Paris**.

Results are saved in [report/AUTOMATED_TEST_RESULTS.txt](report/AUTOMATED_TEST_RESULTS.txt). The [report](report/REPORT.md) explains each contract and the cases tested.
