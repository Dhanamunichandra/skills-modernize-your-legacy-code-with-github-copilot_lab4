# COBOL Account Management System - Test Plan

## Overview
This test plan documents the test cases for validating the COBOL Account Management System's business logic and functionality. These test cases can be used for both manual testing and as reference for creating automated unit and integration tests in Node.js.

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Verify application starts and displays main menu | Application compiled successfully | 1. Run the compiled application executable | Main menu displays with 4 options: 1. View Balance, 2. Credit Account, 3. Debit Account, 4. Exit | | | |
| TC-002 | Verify menu accepts valid user choice (1) | Application running and menu displayed | 1. Select option 1 (View Balance) | Application calls Operations program and displays current balance | | | |
| TC-003 | Verify menu accepts valid user choice (2) | Application running and menu displayed | 1. Select option 2 (Credit Account) | Application calls Operations program and prompts for credit amount | | | |
| TC-004 | Verify menu accepts valid user choice (3) | Application running and menu displayed | 1. Select option 3 (Debit Account) | Application calls Operations program and prompts for debit amount | | | |
| TC-005 | Verify menu accepts valid user choice (4) | Application running and menu displayed | 1. Select option 4 (Exit) | Application displays "Exiting the program. Goodbye!" and terminates | | | |
| TC-006 | Verify menu rejects invalid input | Application running and menu displayed | 1. Enter an invalid choice (e.g., 5, 0, or non-numeric character) | Application displays error message "Invalid choice, please select 1-4." and returns to menu | | | |
| TC-007 | Verify initial balance is $1000.00 | Application running, no prior transactions | 1. Select option 1 (View Balance) | Current balance displays as $1000.00 | | | Verifies initial STORAGE-BALANCE value of 1000 with 2 decimal places |
| TC-008 | Verify View Balance operation (TOTAL) | Application running and menu displayed | 1. Select option 1 (View Balance) | Application displays "Current Balance: $1000.00" | | | |
| TC-009 | Credit Account - Valid positive amount | Application running, balance = $1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount 500.00 | 1. Prompt displays "Enter amount to credit:" 2. Application adds $500.00 to balance 3. Displays "Account credited with $500.00" 4. New balance = $1500.00 | | | |
| TC-010 | Credit Account - Multiple sequential credits | Application running, balance = $1000.00 | 1. Credit $100.00 2. Credit $200.00 3. Credit $150.00 4. View Balance | Each credit operation succeeds sequentially; Final balance = $1450.00 | | | Tests balance persistence across multiple transactions |
| TC-011 | Credit Account - Large amount | Application running, balance = $1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount 999999.99 | Credit succeeds; New balance = $1000999.99 | | | Tests maximum field width (PIC 9(6)V99) |
| TC-012 | Credit Account - Zero amount | Application running, balance = $1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount 0.00 | Credit succeeds (no validation restriction); Balance remains $1000.00 | | | Credit has no business rule validation |
| TC-013 | Credit Account - Decimal amount | Application running, balance = $1000.00 | 1. Select option 2 (Credit Account) 2. Enter amount 250.50 | Credit succeeds; New balance = $1250.50 | | | Tests 2-decimal precision handling |
| TC-014 | Debit Account - Valid amount less than balance | Application running, balance = $1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount 300.00 | 1. Prompt displays "Enter amount to debit:" 2. System validates balance >= amount (1000 >= 300: TRUE) 3. Deducts $300.00 from balance 4. Displays "Account debited with $300.00" 5. New balance = $700.00 | | | Business rule: Sufficient funds validation passes |
| TC-015 | Debit Account - Exact balance amount | Application running, balance = $1000.00 | 1. Select option 3 (Debit Account) 2. Enter exact balance amount 1000.00 | 1. System validates balance >= amount (1000 >= 1000: TRUE) 2. Deducts $1000.00 from balance 3. Displays "Account debited with $1000.00" 4. New balance = $0.00 | | | Edge case: Balance reduced to zero |
| TC-016 | Debit Account - Amount exceeds balance (Insufficient Funds) | Application running, balance = $1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount 1500.00 | 1. System validates balance >= amount (1000 >= 1500: FALSE) 2. Transaction is rejected 3. Displays "Insufficient funds. Debit not allowed." 4. Balance remains $1000.00 | | | Business rule: Insufficient Funds Protection enforced |
| TC-017 | Debit Account - Amount slightly exceeds balance | Application running, balance = $1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount 1000.01 | 1. System validates balance >= amount (1000 >= 1000.01: FALSE) 2. Transaction rejected 3. Displays "Insufficient funds. Debit not allowed." 4. Balance remains $1000.00 | | | Edge case: Validates precision in comparison |
| TC-018 | Debit Account - Zero amount | Application running, balance = $1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount 0.00 | 1. System validates balance >= amount (1000 >= 0: TRUE) 2. Deducts $0.00 from balance 3. Displays "Account debited with $0.00" 4. Balance remains $1000.00 | | | Valid but unusual transaction |
| TC-019 | Debit Account - Decimal amount | Application running, balance = $1000.00 | 1. Select option 3 (Debit Account) 2. Enter amount 250.50 | 1. Balance validation passes (1000 >= 250.50) 2. Deducts $250.50 from balance 3. Displays "Account debited with $250.50" 4. New balance = $749.50 | | | Tests 2-decimal precision in debit operations |
| TC-020 | Debit after Credit - Verify balance persistence | Application running, balance = $1000.00 | 1. Credit $500.00 (balance = $1500.00) 2. Debit $200.00 | 1. First operation: Balance becomes $1500.00 2. Second operation: Validates $1500.00 >= $200.00 (TRUE) 3. Final balance = $1300.00 | | | Tests DataProgram READ/WRITE cycle for balance persistence |
| TC-021 | Multiple operations sequence - Complex scenario | Application running, balance = $1000.00 | 1. Credit $300.00 2. Debit $400.00 3. View Balance 4. Debit $1000.00 (exceeds) 5. Credit $100.00 6. View Balance | 1. After credit: $1300.00 2. After first debit: $900.00 3. Display shows $900.00 4. Debit rejected (insufficient funds) 5. After credit: $1000.00 6. Display shows $1000.00 | | | Integration test: Validates entire business logic flow |
| TC-022 | Debit after insufficient funds rejection | Application running, balance = $500.00 | 1. Attempt debit $600.00 (rejected) 2. View Balance | 1. First operation rejected with error message 2. Balance still shows $500.00 (unchanged) | | | Verifies rejected transactions don't modify balance |
| TC-023 | Multiple failed debit attempts | Application running, balance = $500.00 | 1. Attempt debit $600.00 (rejected) 2. Attempt debit $550.00 (rejected) 3. Debit $400.00 (accepted) | 1. Two rejections with error messages 2. Balance unchanged after rejections: $500.00 3. Third debit succeeds: balance = $100.00 | | | Validates repeated insufficient funds checks |
| TC-024 | Menu continues after each transaction | Application running, any balance | 1. Perform a transaction (credit or debit) 2. Verify menu returns after operation | After each transaction completes, main menu redisplays automatically | | | Verifies CONTINUE-FLAG loop logic |
| TC-025 | Exit from menu - No pending transactions | Application running, menu displayed | 1. Select option 4 (Exit) | 1. Display "Exiting the program. Goodbye!" 2. Application terminates cleanly 3. Program process ends | | | Validates graceful program termination |
| TC-026 | DataProgram READ operation - Retrieve stored balance | Balance previously set to $750.00 | 1. Select View Balance 2. Observe Operations calls DataProgram READ | DataProgram retrieves STORAGE-BALANCE value and returns $750.00 to Operations | | | Verifies data persistence mechanism |
| TC-027 | DataProgram WRITE operation - Persist updated balance | Balance = $1000.00, about to credit $250.00 | 1. Perform credit of $250.00 2. Operations calls DataProgram WRITE with $1250.00 | DataProgram updates STORAGE-BALANCE to $1250.00; Value persists for next READ | | | Verifies write-through persistence |
| TC-028 | Balance precision - 2 decimal places | Any transaction with decimal amounts | 1. Perform operations with various decimal amounts (e.g., 123.45, 67.89) | All calculations maintain exactly 2 decimal places; No rounding errors | | | Validates PIC 9(6)V99 decimal handling |
| TC-029 | Large balance operations | Balance = $999999.99 | 1. View Balance | Display shows "Current Balance: $999999.99" | | | Tests maximum representable value (PIC 9(6)V99) |
| TC-030 | Boundary test - Balance at $0.00 | Balance = $0.00 after debit | 1. View Balance 2. Attempt to debit $1.00 3. Credit $100.00 | 1. Display shows $0.00 2. Debit rejected (insufficient funds) 3. New balance = $100.00 | | | Tests zero balance edge cases |

---

## Test Coverage Summary

### Functionality Covered:
- ✓ Main Menu Display and Navigation
- ✓ User Input Validation (Valid and Invalid)
- ✓ Menu Option 1: View Balance (TOTAL operation)
- ✓ Menu Option 2: Credit Account (CREDIT operation)
- ✓ Menu Option 3: Debit Account (DEBIT operation)
- ✓ Menu Option 4: Exit Program
- ✓ Insufficient Funds Business Rule
- ✓ Balance Persistence (DataProgram READ/WRITE)
- ✓ Decimal Precision Handling
- ✓ Boundary Value Testing
- ✓ Multiple Sequential Operations
- ✓ Error Handling and User Feedback

### Business Rules Validated:
1. **Insufficient Funds Protection**: Tests TC-016, TC-017, TC-023
2. **Credit Transactions Unrestricted**: Tests TC-009, TC-010, TC-011, TC-012, TC-013
3. **Balance Persistence**: Tests TC-020, TC-022, TC-026, TC-027
4. **Single Account Storage**: Tests TC-001 through TC-030 (all test single account)

---

## Notes for Node.js Implementation

When migrating this test plan to Node.js unit and integration tests:

1. **Unit Tests**: Create separate test suites for each operation type (TOTAL, CREDIT, DEBIT)
2. **Integration Tests**: Test complete transaction flows combining multiple operations
3. **Data Persistence**: Mock or use actual storage layer (database, file, etc.)
4. **Validation Tests**: Separate validation logic into testable functions
5. **Error Handling**: Create dedicated tests for edge cases and error messages
6. **Mocking**: Mock user input and DataProgram calls in unit tests
7. **Fixtures**: Use test data fixtures for various balance states
8. **Assertion Framework**: Use Node.js testing frameworks (Jest, Mocha, etc.) for assertions

### Recommended Test Structure in Node.js:
```
tests/
├── unit/
│   ├── operations.test.js (TOTAL, CREDIT, DEBIT logic)
│   ├── validation.test.js (business rule validation)
│   └── dataAccess.test.js (storage layer)
├── integration/
│   ├── transaction-flow.test.js (multi-operation sequences)
│   └── menu-navigation.test.js (UI flow)
└── fixtures/
    └── test-data.json (balance states, expected results)
```
