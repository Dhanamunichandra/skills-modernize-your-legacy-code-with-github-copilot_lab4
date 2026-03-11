#!/usr/bin/env node

/**
 * Account Management System - Node.js Port
 * 
 * This is a Node.js modernization of the legacy COBOL Account Management System.
 * It preserves the original business logic, data integrity, and menu-driven user interface.
 * 
 * Original COBOL Structure:
 * - main.cob (MainProgram): User interface and menu handling
 * - operations.cob (Operations): Business logic for transactions
 * - data.cob (DataProgram): Data persistence layer
 * 
 * Node.js Architecture:
 * This single-file application consolidates all three COBOL programs while maintaining
 * the original data flow and business rules.
 */

const inquirer = require('inquirer');

// ============================================================================
// DATA LAYER - Equivalent to DataProgram
// ============================================================================

class DataLayer {
  /**
   * Data persistence layer managing the account balance.
   * Equivalent to DataProgram in the original COBOL application.
   */
  constructor() {
    // STORAGE-BALANCE - Initial balance set to $1000.00
    this.storageBalance = 1000.00;
  }

  /**
   * READ operation - Retrieve current balance
   * Equivalent to: IF OPERATION-TYPE = 'READ' MOVE STORAGE-BALANCE TO BALANCE
   * @returns {number} Current account balance
   */
  read() {
    return this.storageBalance;
  }

  /**
   * WRITE operation - Persist updated balance
   * Equivalent to: IF OPERATION-TYPE = 'WRITE' MOVE BALANCE TO STORAGE-BALANCE
   * @param {number} balance - Balance to persist
   */
  write(balance) {
    this.storageBalance = balance;
  }
}

// ============================================================================
// BUSINESS LOGIC LAYER - Equivalent to Operations Program
// ============================================================================

class OperationsLayer {
  /**
   * Operations layer implementing core business logic for transactions.
   * Equivalent to Operations program in the original COBOL application.
   */
  constructor(dataLayer) {
    this.dataLayer = dataLayer;
  }

  /**
   * TOTAL operation - View current balance
   * Equivalent to: IF OPERATION-TYPE = 'TOTAL'
   *   CALL 'DataProgram' USING 'READ' BALANCE
   *   DISPLAY "Current Balance: $" BALANCE
   */
  viewBalance() {
    const balance = this.dataLayer.read();
    console.log(`\nCurrent Balance: $${balance.toFixed(2)}\n`);
    return balance;
  }

  /**
   * CREDIT operation - Add funds to account
   * Equivalent to: ELSE IF OPERATION-TYPE = 'CREDIT'
   *   DISPLAY "Enter amount to credit: "
   *   ACCEPT AMOUNT
   *   CALL 'DataProgram' USING 'READ' BALANCE
   *   ADD AMOUNT TO BALANCE
   *   CALL 'DataProgram' USING 'WRITE' BALANCE
   *   DISPLAY "Account credited with $" AMOUNT
   * 
   * Business Rule: Credit transactions unrestricted (no validation)
   * 
   * @param {number} amount - Amount to credit
   */
  creditAccount(amount) {
    // Read current balance
    const currentBalance = this.dataLayer.read();

    // Perform credit operation (ADD AMOUNT TO BALANCE)
    const newBalance = currentBalance + amount;

    // Write updated balance to storage
    this.dataLayer.write(newBalance);

    console.log(`\nAccount credited with $${amount.toFixed(2)}`);
    console.log(`New Balance: $${newBalance.toFixed(2)}\n`);

    return newBalance;
  }

  /**
   * DEBIT operation - Remove funds from account
   * Equivalent to: ELSE IF OPERATION-TYPE = 'DEBIT '
   *   DISPLAY "Enter amount to debit: "
   *   ACCEPT AMOUNT
   *   CALL 'DataProgram' USING 'READ' BALANCE
   *   IF BALANCE >= AMOUNT
   *     SUBTRACT AMOUNT FROM BALANCE
   *     CALL 'DataProgram' USING 'WRITE' BALANCE
   *     DISPLAY "Account debited with $" AMOUNT
   *   ELSE
   *     DISPLAY "Insufficient funds. Debit not allowed."
   *   END-IF
   * 
   * Business Rule: Insufficient Funds Protection
   * - Debit transaction cannot exceed current account balance
   * - If balance < amount, transaction is rejected
   * 
   * @param {number} amount - Amount to debit
   * @returns {object} Result object with success flag and new balance
   */
  debitAccount(amount) {
    // Read current balance
    const currentBalance = this.dataLayer.read();

    // Validate sufficient funds (Business Rule: IF BALANCE >= AMOUNT)
    if (currentBalance >= amount) {
      // Perform debit operation (SUBTRACT AMOUNT FROM BALANCE)
      const newBalance = currentBalance - amount;

      // Write updated balance to storage
      this.dataLayer.write(newBalance);

      console.log(`\nAccount debited with $${amount.toFixed(2)}`);
      console.log(`New Balance: $${newBalance.toFixed(2)}\n`);

      return {
        success: true,
        newBalance: newBalance
      };
    } else {
      // Business Rule violation: Insufficient funds
      console.log(`\nInsufficient funds. Debit not allowed.`);
      console.log(`Current Balance: $${currentBalance.toFixed(2)}`);
      console.log(`Requested Debit: $${amount.toFixed(2)}\n`);

      return {
        success: false,
        newBalance: currentBalance
      };
    }
  }
}

// ============================================================================
// PRESENTATION LAYER - Equivalent to MainProgram
// ============================================================================

class AccountManagementSystem {
  /**
   * Main program presenting user interface and managing menu flow.
   * Equivalent to MainProgram in the original COBOL application.
   * 
   * PERFORM UNTIL CONTINUE-FLAG = 'NO'
   *   DISPLAY menu options
   *   ACCEPT USER-CHOICE
   *   EVALUATE USER-CHOICE
   *     WHEN 1: CALL 'Operations' USING 'TOTAL '
   *     WHEN 2: CALL 'Operations' USING 'CREDIT'
   *     WHEN 3: CALL 'Operations' USING 'DEBIT '
   *     WHEN 4: MOVE 'NO' TO CONTINUE-FLAG
   *   END-EVALUATE
   * END-PERFORM
   */
  constructor() {
    this.dataLayer = new DataLayer();
    this.operations = new OperationsLayer(this.dataLayer);
    this.continueFlag = true;
  }

  /**
   * Display main menu
   * Equivalent to: DISPLAY menu options
   */
  displayMenu() {
    console.clear();
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
  }

  /**
   * Prompt user for numeric input with validation
   * @param {string} message - Prompt message
   * @param {number} min - Minimum acceptable value
   * @param {number} max - Maximum acceptable value
   * @returns {Promise<number>} User input
   */
  async promptForNumber(message, min = null, max = null) {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: message,
        validate: (input) => {
          const num = parseFloat(input);
          if (isNaN(num)) {
            return 'Please enter a valid number';
          }
          if (min !== null && num < min) {
            return `Please enter a number >= ${min}`;
          }
          if (max !== null && num > max) {
            return `Please enter a number <= ${max}`;
          }
          return true;
        }
      }
    ]);
    return parseFloat(answer.value);
  }

  /**
   * Prompt user for menu choice
   * Equivalent to: ACCEPT USER-CHOICE
   */
  async promptForMenuChoice() {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Enter your choice:',
        choices: [
          { name: '1. View Balance', value: 1 },
          { name: '2. Credit Account', value: 2 },
          { name: '3. Debit Account', value: 3 },
          { name: '4. Exit', value: 4 }
        ]
      }
    ]);
    return answer.choice;
  }

  /**
   * Process menu selection
   * Equivalent to: EVALUATE USER-CHOICE ... END-EVALUATE
   */
  async processMenuChoice(choice) {
    switch (choice) {
      case 1:
        // WHEN 1: CALL 'Operations' USING 'TOTAL '
        this.operations.viewBalance();
        break;

      case 2:
        // WHEN 2: CALL 'Operations' USING 'CREDIT'
        const creditAmount = await this.promptForNumber('Enter amount to credit: $', 0);
        this.operations.creditAccount(creditAmount);
        break;

      case 3:
        // WHEN 3: CALL 'Operations' USING 'DEBIT '
        const debitAmount = await this.promptForNumber('Enter amount to debit: $', 0);
        this.operations.debitAccount(debitAmount);
        break;

      case 4:
        // WHEN 4: MOVE 'NO' TO CONTINUE-FLAG
        this.continueFlag = false;
        console.log('\nExiting the program. Goodbye!\n');
        break;

      default:
        // WHEN OTHER: DISPLAY "Invalid choice..."
        console.log('Invalid choice, please select 1-4.');
    }
  }

  /**
   * Main application loop
   * Equivalent to: PERFORM UNTIL CONTINUE-FLAG = 'NO' ... END-PERFORM
   */
  async run() {
    console.log('\n========================================');
    console.log('COBOL Account Management System - Node.js');
    console.log('========================================\n');

    // PERFORM UNTIL CONTINUE-FLAG = 'NO'
    while (this.continueFlag) {
      this.displayMenu();
      const choice = await this.promptForMenuChoice();
      await this.processMenuChoice(choice);

      // Pause before returning to menu (for visibility)
      if (this.continueFlag) {
        await inquirer.prompt([
          {
            type: 'input',
            name: 'pause',
            message: 'Press Enter to continue...'
          }
        ]);
      }
    }
  }
}

// ============================================================================
// APPLICATION ENTRY POINT
// ============================================================================

/**
 * Main entry point
 * Equivalent to: STOP RUN
 */
async function main() {
  try {
    const system = new AccountManagementSystem();
    await system.run();
    process.exit(0);
  } catch (error) {
    console.error('An error occurred:', error.message);
    process.exit(1);
  }
}

// Start the application
main();

module.exports = {
  DataLayer,
  OperationsLayer,
  AccountManagementSystem
};
