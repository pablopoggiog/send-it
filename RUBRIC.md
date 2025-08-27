# Rubric

Candidates will receive a score in each category. The score is defined as the highest completed number in the list, under which all other numbers are also completed. For example, in order to receive a score of 4 in the Product Requirements category, requirements 1-4 must all be met.

For this reason, it is recommended that candidates complete the tasks in priority order.

## Glossary

- Fuji - The Avalanche C-Chain Testnet chain. https://subnets-test.avax.network/c-chain/
- AVAX - The native token on Fuji, needed to pay for transaction fees.
- USDC - The ERC20 Token contract on Fuji. https://subnets-test.avax.network/c-chain/token/0x5425890298aed601595a70AB815c96711a31Bc65
- TX - Transaction

## Product Requirements (In Priority Order, Highest to Lowest)

1. Submit the code for review
2. Deploy the app where it can be tested without a local installation/deployment.
3. Connect web3 wallet
4. Disconnect web3 wallet
5. Accurately display connected Address and AVAX balance on Fuji
6. Accurately display USDC balance on Fuji
7. Send USDC on Fuji
8. Display link to TX on subnet explorer
9. Max button for sending USDC on Fuji (BONUS)

Please do not attempt the BONUS requirements until completing the primary requirements.

Please leave time to test your app in a deployed environment. We cannot advance submissions which do not meet the product requirements in a deployed environment.

Try not to include broken/incomplete components in your submission, otherwise you may lose points on UI/UX categories.

## Common Bugs (with Severity labels)

You will receive points for the absence of these bugs.

1. App causes loss of funds by sending unintended transactions (CRITICAL)
2. App causes inaccessible funds by preventing valid transaction construction (SEVERE)
3. App connects to/emits transactions on the wrong chain (not Fuji) (SEVERE)
4. App never displays correct balances (SEVERE)
5. Form freezes preventing issuing transactions (SEVERE)
6. Form does not reset after successful transaction (MEDIUM)
7. App displays stale balances after transactions (MEDIUM)
8. App wastes funds by allowing 0 value transactions (MINOR)
9. If included, max button doesn't work (MINOR)

## UI/UX (In Priority Order, Highest to Lowest)

1. There is a button to connect + disconnect the web wallet
2. There is a form which accepts user inputs and sends transactions
3. Error states are clearly indicated to the user
4. The form is enabled and disabled at the appropriate times.
5. All included components function as expected (no dead components)
6. Loading states are clearly indicated to the user
7. The styling is consistent throughout the app
8. The styling is visually appealing throughout the app
9. The styling is responsive, supports multiple devices

## Code Quality (In Priority Order, Highest to Lowest)

1. Code uses the provided libraries - React, TypeScript, Viem and Wagmi to complete the task.
2. Code avoids pulling in unnecessary dependencies. (Feel free to pull in a UI dependency to help with styles.)
3. Code minimally satisfies the product requirements (no unnecessary complexity, dead code, etc)
4. Naming and organization of code displays an understanding of the domain
5. React code is modular and idiomatic
6. React code avoids use of unnecessary state and side effects
7. Code avoids bypassing linter/typescript guard
8. Code is covered by unit test cases
9. Code is well documented with comments, as needed
