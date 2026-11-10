# Remix and Ganache Evidence

These are the original screenshots supplied with the assignment. Filenames use uppercase `.PNG`; links preserve that spelling for GitHub compatibility. An image documents the operation visible in it and does not establish complete test coverage.

| Exercise | Existing screenshots | Evidence still needed |
| --- | --- | --- |
| 01 Storage | [Compile](01_compile.PNG), [Ganache](01_ganache.PNG), [Set/get](01_test.PNG) | Initial constructor value and event details, if required |
| 02 Greeting | [Compile](02_compile.PNG), [Update](02_test.PNG), [Non-owner error](02_error.PNG), [Reset](02_reset.PNG) | Additional cases if required by the rubric |
| 03 Counter | [Compile](03_compile.PNG), [Ganache](03_ganache.PNG), [Decrement at zero](03_error-zero.PNG) | Upper limit at 100 and reset |
| 04 Ownable / ProtectedVault | [Compile](04_compile.PNG), [Deposit](04_deposit.PNG), [Access error](04_error.PNG), [Ownership transfer](04_owner_changed.PNG), [Withdrawal](04_test.PNG) | Full withdrawal to zero, if required |
| 05 SimpleBank | [Compile](05_compile.PNG), [Deposit/balance](05_deposit.PNG), [Invalid withdrawal](05_error.PNG) | Successful partial withdrawal with individual/total balances |
| 06 Voting | [Compile](06_compile.PNG), [Winner query](06_test.PNG) | Unauthorized/duplicate-vote reverts and vote totals |
| 07 MyToken | [Compile](07_compile.PNG), [Balance queries](07_test.PNG) | Transfer, approval, delegated transfer, and exhausted-allowance revert |
| 08 Crowdfunding | [Compile](08_compile.PNG), [Contribution](08_test.PNG) | Successful claim, failed-campaign refund, and deadline/repeat-refund errors |
| 09–15 | No screenshots supplied | Compilation, successful scenarios, and expected reverts for each exercise |

For new evidence, use `NN_compile.PNG`, `NN_test.PNG`, and descriptive names such as `NN_error.PNG` or `NN_refund.PNG`. Capture real Remix operations connected to local Ganache. Automated results appear separately in [../report/AUTOMATED_TEST_RESULTS.txt](../report/AUTOMATED_TEST_RESULTS.txt).
