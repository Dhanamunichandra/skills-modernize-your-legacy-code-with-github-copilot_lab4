/**
 * Unit Tests for Account Management System
 * 
 * These tests mirror the test cases documented in docs/TESTPLAN.md
 * and validate that the Node.js implementation preserves the original
 * COBOL business logic, data integrity, and functionality.
 * 
 * Test mapping:
 * - DataLayer Suite: TC-026, TC-027 (Data persistence)
 * - OperationsLayer - View Balance Suite: TC-001-008 (TOTAL operation)
 * - OperationsLayer - Credit Suite: TC-009-013 (CREDIT operation)
 * - OperationsLayer - Debit Suite: TC-014-019 (DEBIT operation)
 * - Complex Scenarios: TC-020-023 (Integration tests)
 * - Edge Cases: TC-024-030 (Boundary and precision tests)
 */

const {
  DataLayer,
  OperationsLayer,
  AccountManagementSystem
} = require('../index.js');

// ============================================================================
// TC-026, TC-027: DataLayer Tests - Data Persistence
// ============================================================================

describe('DataLayer - Data Persistence (TC-026, TC-027)', () => {
  let dataLayer;

  beforeEach(() => {
    dataLayer = new DataLayer();
  });

  test('TC-026: Initial storage balance should be $1000.00', () => {
    // TC-007: Verify initial balance is $1000.00
    const balance = dataLayer.read();
    expect(balance).toBe(1000.00);
  });

  test('TC-027: WRITE operation should persist updated balance', () => {
    // Write a new balance
    const newBalance = 1250.00;
    dataLayer.write(newBalance);

    // Read should return the written value
    const readBalance = dataLayer.read();
    expect(readBalance).toBe(1250.00);
  });

  test('Multiple READ operations should return same value', () => {
    const firstRead = dataLayer.read();
    const secondRead = dataLayer.read();
    expect(firstRead).toBe(secondRead);
    expect(firstRead).toBe(1000.00);
  });

  test('Sequential WRITE operations should overwrite previous values', () => {
    dataLayer.write(500.00);
    expect(dataLayer.read()).toBe(500.00);

    dataLayer.write(750.50);
    expect(dataLayer.read()).toBe(750.50);

    dataLayer.write(1234.56);
    expect(dataLayer.read()).toBe(1234.56);
  });
});

// ============================================================================
// TC-001-008: OperationsLayer - View Balance (TOTAL operation)
// ============================================================================

describe('OperationsLayer - View Balance / TOTAL Operation (TC-001-008)', () => {
  let dataLayer;
  let operations;

  beforeEach(() => {
    dataLayer = new DataLayer();
    operations = new OperationsLayer(dataLayer);
  });

  test('TC-001: Application should initialize with valid starting state', () => {
    expect(operations).toBeDefined();
    expect(dataLayer).toBeDefined();
  });

  test('TC-007: Initial balance should display as $1000.00', () => {
    const balance = operations.viewBalance();
    expect(balance).toBe(1000.00);
  });

  test('TC-008: View Balance should return current balance from DataLayer', () => {
    const balance = operations.viewBalance();
    expect(balance).toBe(1000.00);
  });

  test('TC-029: Large balance should be properly handled (max value test)', () => {
    // Test maximum representable value: PIC 9(6)V99 = 999999.99
    dataLayer.write(999999.99);
    const balance = operations.viewBalance();
    expect(balance).toBe(999999.99);
    expect(balance.toFixed(2)).toBe('999999.99');
  });

  test('TC-030: View Balance at $0.00 should display correctly', () => {
    dataLayer.write(0.00);
    const balance = operations.viewBalance();
    expect(balance).toBe(0.00);
    expect(balance.toFixed(2)).toBe('0.00');
  });

  test('View Balance should maintain precision with decimal values', () => {
    dataLayer.write(750.50);
    const balance = operations.viewBalance();
    expect(balance).toBe(750.50);
    expect(balance.toFixed(2)).toBe('750.50');
  });
});

// ============================================================================
// TC-009-013: OperationsLayer - Credit Account (CREDIT operation)
// ============================================================================

describe('OperationsLayer - Credit Account / CREDIT Operation (TC-009-013)', () => {
  let dataLayer;
  let operations;

  beforeEach(() => {
    dataLayer = new DataLayer();
    operations = new OperationsLayer(dataLayer);
  });

  test('TC-009: Credit valid positive amount - should add to balance', () => {
    // Initial balance: $1000.00
    // Credit: $500.00
    // Expected: $1500.00
    const newBalance = operations.creditAccount(500.00);
    expect(newBalance).toBe(1500.00);
    expect(dataLayer.read()).toBe(1500.00);
  });

  test('TC-010: Multiple sequential credits should accumulate', () => {
    // Credit1: $100.00 -> $1100.00
    let balance = operations.creditAccount(100.00);
    expect(balance).toBe(1100.00);

    // Credit2: $200.00 -> $1300.00
    balance = operations.creditAccount(200.00);
    expect(balance).toBe(1300.00);

    // Credit3: $150.00 -> $1450.00
    balance = operations.creditAccount(150.00);
    expect(balance).toBe(1450.00);

    // Final verification
    expect(dataLayer.read()).toBe(1450.00);
  });

  test('TC-011: Large credit amount should succeed', () => {
    // Initial balance: $1000.00
    // Credit: $999999.99
    // Expected: $1000999.99
    const newBalance = operations.creditAccount(999999.99);
    expect(newBalance).toBe(1000999.99);
  });

  test('TC-012: Credit zero amount should succeed (no restriction)', () => {
    // Initial balance: $1000.00
    // Credit: $0.00
    // Expected: $1000.00 (unchanged)
    const newBalance = operations.creditAccount(0.00);
    expect(newBalance).toBe(1000.00);
  });

  test('TC-013: Credit decimal amount should maintain precision', () => {
    // Initial balance: $1000.00
    // Credit: $250.50
    // Expected: $1250.50
    const newBalance = operations.creditAccount(250.50);
    expect(newBalance).toBe(1250.50);
    expect(newBalance.toFixed(2)).toBe('1250.50');
  });

  test('TC-028: Credit operations should maintain 2 decimal precision', () => {
    const balance1 = operations.creditAccount(123.45);
    expect(balance1.toFixed(2)).toBe('1123.45');

    const balance2 = operations.creditAccount(67.89);
    expect(balance2.toFixed(2)).toBe('1191.34');
  });
});

// ============================================================================
// TC-014-019: OperationsLayer - Debit Account (DEBIT operation)
// ============================================================================

describe('OperationsLayer - Debit Account / DEBIT Operation (TC-014-019)', () => {
  let dataLayer;
  let operations;

  beforeEach(() => {
    dataLayer = new DataLayer();
    operations = new OperationsLayer(dataLayer);
  });

  test('TC-014: Debit valid amount less than balance should succeed', () => {
    // Initial balance: $1000.00
    // Debit: $300.00
    // Expected: $700.00
    const result = operations.debitAccount(300.00);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(700.00);
    expect(dataLayer.read()).toBe(700.00);
  });

  test('TC-015: Debit exact balance amount should succeed', () => {
    // Initial balance: $1000.00
    // Debit: $1000.00
    // Expected: $0.00
    const result = operations.debitAccount(1000.00);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(0.00);
    expect(dataLayer.read()).toBe(0.00);
  });

  test('TC-016: Debit exceeding balance should be rejected (Insufficient Funds)', () => {
    // Initial balance: $1000.00
    // Debit: $1500.00 (exceeds balance)
    // Expected: Transaction rejected, balance unchanged
    const result = operations.debitAccount(1500.00);
    expect(result.success).toBe(false);
    expect(result.newBalance).toBe(1000.00);
    expect(dataLayer.read()).toBe(1000.00);
  });

  test('TC-017: Debit slightly exceeding balance should be rejected', () => {
    // Initial balance: $1000.00
    // Debit: $1000.01 (exceeds balance by $0.01)
    // Expected: Transaction rejected, balance unchanged
    const result = operations.debitAccount(1000.01);
    expect(result.success).toBe(false);
    expect(result.newBalance).toBe(1000.00);
    expect(dataLayer.read()).toBe(1000.00);
  });

  test('TC-018: Debit zero amount should succeed', () => {
    // Initial balance: $1000.00
    // Debit: $0.00
    // Expected: $1000.00 (unchanged)
    const result = operations.debitAccount(0.00);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(1000.00);
  });

  test('TC-019: Debit decimal amount should maintain precision', () => {
    // Initial balance: $1000.00
    // Debit: $250.50
    // Expected: $749.50
    const result = operations.debitAccount(250.50);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(749.50);
    expect(result.newBalance.toFixed(2)).toBe('749.50');
  });

  test('Business Rule: Insufficient Funds Protection enforced', () => {
    // Test Insufficient Funds Rule validation
    dataLayer.write(500.00);

    // Debit exceeding balance
    const result1 = operations.debitAccount(600.00);
    expect(result1.success).toBe(false);

    // Debit equal to balance (should succeed)
    const result2 = operations.debitAccount(500.00);
    expect(result2.success).toBe(true);
    expect(result2.newBalance).toBe(0.00);
  });
});

// ============================================================================
// TC-020-023: Complex Scenarios - Integration Tests
// ============================================================================

describe('Complex Scenarios - Integration Tests (TC-020-023)', () => {
  let dataLayer;
  let operations;

  beforeEach(() => {
    dataLayer = new DataLayer();
    operations = new OperationsLayer(dataLayer);
  });

  test('TC-020: Credit then Debit should verify balance persistence', () => {
    // Step 1: Credit $500.00 (balance = $1500.00)
    let balance = operations.creditAccount(500.00);
    expect(balance).toBe(1500.00);

    // Step 2: Debit $200.00 (balance = $1300.00)
    const result = operations.debitAccount(200.00);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(1300.00);

    // Verify persisted balance
    expect(dataLayer.read()).toBe(1300.00);
  });

  test('TC-021: Multiple operations sequence - Complex scenario', () => {
    // Step 1: Credit $300.00 -> $1300.00
    let balance = operations.creditAccount(300.00);
    expect(balance).toBe(1300.00);

    // Step 2: Debit $400.00 -> $900.00
    let result = operations.debitAccount(400.00);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(900.00);

    // Step 3: View Balance -> $900.00
    balance = operations.viewBalance();
    expect(balance).toBe(900.00);

    // Step 4: Attempt Debit $1000.00 (exceeds balance) -> Rejected
    result = operations.debitAccount(1000.00);
    expect(result.success).toBe(false);
    expect(result.newBalance).toBe(900.00);

    // Step 5: Credit $100.00 -> $1000.00
    balance = operations.creditAccount(100.00);
    expect(balance).toBe(1000.00);

    // Step 6: View Balance -> $1000.00
    balance = operations.viewBalance();
    expect(balance).toBe(1000.00);
  });

  test('TC-022: Debit after insufficient funds rejection', () => {
    dataLayer.write(500.00);

    // Step 1: Attempt debit $600.00 (rejected)
    let result = operations.debitAccount(600.00);
    expect(result.success).toBe(false);

    // Step 2: View Balance should show $500.00 (unchanged)
    let balance = operations.viewBalance();
    expect(balance).toBe(500.00);
    expect(dataLayer.read()).toBe(500.00);
  });

  test('TC-023: Multiple failed debit attempts followed by successful debit', () => {
    dataLayer.write(500.00);

    // Step 1: Attempt debit $600.00 (rejected)
    let result = operations.debitAccount(600.00);
    expect(result.success).toBe(false);
    expect(dataLayer.read()).toBe(500.00);

    // Step 2: Attempt debit $550.00 (rejected)
    result = operations.debitAccount(550.00);
    expect(result.success).toBe(false);
    expect(dataLayer.read()).toBe(500.00);

    // Step 3: Debit $400.00 (accepted)
    result = operations.debitAccount(400.00);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(100.00);
    expect(dataLayer.read()).toBe(100.00);
  });

  test('Balance persistence across multiple READ/WRITE cycles', () => {
    // Cycle 1: Credit -> Read
    operations.creditAccount(200.00);
    expect(dataLayer.read()).toBe(1200.00);

    // Cycle 2: Debit -> Read
    operations.debitAccount(150.00);
    expect(dataLayer.read()).toBe(1050.00);

    // Cycle 3: Credit -> Read
    operations.creditAccount(75.00);
    expect(dataLayer.read()).toBe(1125.00);

    // Cycle 4: Debit -> Read
    operations.debitAccount(25.00);
    expect(dataLayer.read()).toBe(1100.00);
  });
});

// ============================================================================
// TC-024-030: Edge Cases and Boundary Tests
// ============================================================================

describe('Edge Cases and Boundary Tests (TC-024-030)', () => {
  let dataLayer;
  let operations;

  beforeEach(() => {
    dataLayer = new DataLayer();
    operations = new OperationsLayer(dataLayer);
  });

  test('TC-030: Balance at $0.00 - Edge case tests', () => {
    dataLayer.write(0.00);

    // View Balance at $0
    let balance = operations.viewBalance();
    expect(balance).toBe(0.00);

    // Attempt to debit from $0
    let result = operations.debitAccount(1.00);
    expect(result.success).toBe(false);
    expect(result.newBalance).toBe(0.00);

    // Credit to $0
    balance = operations.creditAccount(100.00);
    expect(balance).toBe(100.00);
  });

  test('TC-028: Decimal precision - 2 decimal places maintained', () => {
    // Test various decimal combinations
    const testCases = [
      { amount: 123.45, expected: 1123.45 },
      { amount: 67.89, expected: 1191.34 },
      { amount: 0.01, expected: 1191.35 },
      { amount: 0.99, expected: 1192.34 }
    ];

    let currentBalance = 1000.00;
    for (const testCase of testCases) {
      currentBalance = operations.creditAccount(testCase.amount);
      expect(currentBalance.toFixed(2)).toBe(testCase.expected.toFixed(2));
    }
  });

  test('Precision handling under repeated operations', () => {
    // Perform operations that might accumulate floating point errors
    for (let i = 0; i < 10; i++) {
      operations.creditAccount(0.1);
    }

    const balance = dataLayer.read();
    // Should be approximately 1001.00 (1000 + 10*0.1)
    expect(Math.round(balance * 100) / 100).toBe(1001.00);
  });

  test('Very small amounts (cents)', () => {
    // Credit $0.01
    let balance = operations.creditAccount(0.01);
    expect(balance.toFixed(2)).toBe('1000.01');

    // Debit $0.01
    let result = operations.debitAccount(0.01);
    expect(result.success).toBe(true);
    expect(result.newBalance.toFixed(2)).toBe('1000.00');
  });

  test('Large amounts near maximum', () => {
    // Start with max balance
    dataLayer.write(999999.99);

    // View should work
    let balance = operations.viewBalance();
    expect(balance.toFixed(2)).toBe('999999.99');

    // Debit should work
    let result = operations.debitAccount(999999.99);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(0.00);
  });

  test('Transaction result object structure', () => {
    // Successful debit
    let result = operations.debitAccount(100.00);
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('newBalance');
    expect(result.success).toBe(true);
    expect(typeof result.newBalance).toBe('number');

    // Failed debit
    dataLayer.write(50.00);
    result = operations.debitAccount(100.00);
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('newBalance');
    expect(result.success).toBe(false);
    expect(result.newBalance).toBe(50.00);
  });

  test('Rejected transactions should not modify balance', () => {
    dataLayer.write(100.00);

    // Reject many debit attempts
    for (let i = 0; i < 5; i++) {
      const result = operations.debitAccount(200.00);
      expect(result.success).toBe(false);
    }

    // Balance should remain unchanged
    expect(dataLayer.read()).toBe(100.00);
  });

  test('Precision with rounding - ensure no accumulation errors', () => {
    // Test that operations maintain proper decimal handling
    operations.creditAccount(1.11);
    operations.creditAccount(2.22);
    operations.creditAccount(3.33);

    let balance = dataLayer.read();
    expect(balance.toFixed(2)).toBe('1006.66');

    // Debit with precision
    let result = operations.debitAccount(0.66);
    expect(result.success).toBe(true);
    expect(result.newBalance.toFixed(2)).toBe('1006.00');
  });
});

// ============================================================================
// Integration with AccountManagementSystem
// ============================================================================

describe('AccountManagementSystem - Application Structure (TC-001)', () => {
  test('TC-001: Application should initialize properly', () => {
    const system = new AccountManagementSystem();
    expect(system).toBeDefined();
    expect(system.dataLayer).toBeDefined();
    expect(system.operations).toBeDefined();
    expect(system.continueFlag).toBe(true);
  });

  test('System layers should be properly initialized', () => {
    const system = new AccountManagementSystem();
    expect(system.dataLayer instanceof DataLayer).toBe(true);
    expect(system.operations instanceof OperationsLayer).toBe(true);
  });

  test('Initial balance should be accessible from system', () => {
    const system = new AccountManagementSystem();
    const balance = system.dataLayer.read();
    expect(balance).toBe(1000.00);
  });

  test('Operations layer should have required methods', () => {
    const system = new AccountManagementSystem();
    expect(typeof system.operations.viewBalance).toBe('function');
    expect(typeof system.operations.creditAccount).toBe('function');
    expect(typeof system.operations.debitAccount).toBe('function');
  });
});
