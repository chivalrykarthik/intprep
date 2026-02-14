# Testing Strategy — Unit, Integration & E2E 🧪

## 1. The "Car Manufacturing" Analogy

Imagine you're building a car at a factory:

**Unit Testing (Testing Individual Parts):**
- You test the engine **alone** on a bench — does it start? Does it rev to 7000 RPM? Does it consume the right amount of fuel?
- You test the brakes **alone** on a rig — do the pads grip? Do they handle heat?
- You test the steering **alone** — does the wheel turn 2.5 rotations lock-to-lock?
- Each part works perfectly **in isolation**.

**Integration Testing (Parts Working Together):**
- You bolt the engine INTO the car. Does it connect properly to the transmission? Does the fuel line reach? Does the cooling system pipe fit?
- You connect the brakes to the brake pedal. Does pressing the pedal actually engage the calipers?
- Parts that worked alone might **fail together** (engine overheats because the radiator hose was the wrong diameter).

**E2E Testing (Drive the Whole Car):**
- A test driver sits in the finished car and drives it from New York to Boston.
- Turn on ignition ✅ → Shift into drive ✅ → Accelerate ✅ → Navigate highway ✅ → Brake at stop light ✅ → Park at destination ✅.
- This is what the **customer** experiences.

**This is the Testing Pyramid.** You want **lots** of unit tests (fast, cheap), **some** integration tests (medium speed), and **few** E2E tests (slow, expensive).

---

## 2. The Core Concept

### The Testing Pyramid

```
            ╱╲
           ╱  ╲         E2E Tests (UI/Browser)
          ╱ 🔺 ╲        • Few (5-10%)
         ╱      ╲       • Slow (minutes)
        ╱────────╲      • Expensive to maintain
       ╱          ╲     • Tests REAL user flows
      ╱  🔶 🔶 🔶  ╲    Integration Tests
     ╱              ╲   • Medium (15-25%)
    ╱────────────────╲  • Seconds each
   ╱                  ╲ • Tests component boundaries
  ╱  🟢 🟢 🟢 🟢 🟢 🟢 ╲  Unit Tests
 ╱                      ╲ • Many (70-80%)
╱────────────────────────╲ • Milliseconds each
                           • Tests individual functions

ANTI-PATTERN: "The Ice Cream Cone" (inverted pyramid)
  — Lots of E2E tests, few unit tests
  — Tests are slow, flaky, and expensive
  — Every change breaks something
```

### What Each Level Tests

```
┌─────────────────────────────────────────────────────────────┐
│                  TESTING SCOPE COMPARISON                     │
├──────────────┬──────────────────┬────────────────────────────┤
│   UNIT       │   INTEGRATION    │   E2E (End-to-End)         │
├──────────────┼──────────────────┼────────────────────────────┤
│ One function │ Multiple modules │ Entire application          │
│ No I/O       │ Real DB/API      │ Real browser + real server  │
│ Mocked deps  │ Some real deps   │ No mocks                   │
│ ~1-10ms      │ ~100ms-5s        │ ~10s-2min                  │
│ 100s of them │ 10s of them      │ ~5-20 of them              │
│ Dev runs     │ CI pipeline      │ Staging environment         │
│ always       │                  │                             │
├──────────────┼──────────────────┼────────────────────────────┤
│ "Does this   │ "Do these parts  │ "Can a user complete       │
│  function    │  work together?" │  their task?"              │
│  work?"      │                  │                             │
└──────────────┴──────────────────┴────────────────────────────┘
```

### The "Brute Force" (Bad Testing) Way:

```typescript
// ❌ BAD: Testing implementation details
test('sets loading to true', () => {
  const component = render(<UserProfile />);
  // Tests internal state, NOT behavior
  expect(component.state.loading).toBe(true);
  // This test breaks when you refactor state management
  // even if the feature still works perfectly
});

// ❌ BAD: Testing too much in one test
test('user flow', async () => {
  // Login, navigate, search, click, verify — 50 assertions
  // When this fails, WHERE is the bug?
});
```

### The "Strategic" (Smart Testing) Way:

```typescript
// ✅ GOOD: Test behavior, not implementation
test('displays user name after loading', async () => {
  // Arrange
  mockApi.getUser.mockResolvedValue({ name: 'Alice', email: 'alice@test.com' });
  
  // Act
  render(<UserProfile userId="123" />);
  
  // Assert — tests what the USER sees, not internal state
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});

// ✅ GOOD: One test, one concept
test('shows error message when API fails', async () => {
  mockApi.getUser.mockRejectedValue(new Error('Network error'));
  render(<UserProfile userId="123" />);
  expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
});
```

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────────────┐
│              TESTING DECISION FLOWCHART                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  "What should I test?"                                            │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────────┐   YES   ┌──────────────────────┐            │
│  │ Pure function?   │───────▶│ UNIT TEST             │            │
│  │ (no side effects)│        │ Mock nothing.          │            │
│  └────────┬────────┘        │ Test all edge cases.   │            │
│           │ NO               └──────────────────────┘            │
│           ▼                                                       │
│  ┌─────────────────┐   YES   ┌──────────────────────┐            │
│  │ Calls DB/API/   │───────▶│ INTEGRATION TEST       │            │
│  │ external service?│        │ Use test DB or         │            │
│  └────────┬────────┘        │ containers.            │            │
│           │ NO               └──────────────────────┘            │
│           ▼                                                       │
│  ┌─────────────────┐   YES   ┌──────────────────────┐            │
│  │ Multi-step user  │───────▶│ E2E TEST              │            │
│  │ workflow?         │        │ Use Playwright/Cypress │            │
│  └────────┬────────┘        │ Keep to critical paths. │            │
│           │ NO               └──────────────────────┘            │
│           ▼                                                       │
│  ┌─────────────────┐   YES   ┌──────────────────────┐            │
│  │ Visual output?   │───────▶│ SNAPSHOT / VISUAL TEST │            │
│  │ (UI component)   │        │ Storybook + Chromatic  │            │
│  └─────────────────┘        └──────────────────────┘            │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Unit Testing Mastery

**Real-Life Scenario:** Your team writes a pricing engine for an e-commerce platform. It calculates discounts, applies tax, handles coupons, rounds to 2 decimal places, and supports multiple currencies. A bug in the pricing logic caused $12,000 in wrong charges last month.

**Technical Problem:** Write comprehensive unit tests for a pricing function with edge cases.

### TypeScript Implementation

```typescript
/**
 * PRICING ENGINE — The system under test
 * 
 * @param items - Cart items with price and quantity
 * @param coupon - Optional coupon code
 * @param taxRate - Tax rate as decimal (0.08 = 8%)
 * @returns Breakdown of subtotal, discount, tax, and total
 * 
 * @timeComplexity O(N) where N = number of items
 * @spaceComplexity O(1) — constant extra space
 */
interface CartItem {
  id: string;
  name: string;
  price: number;    // Unit price in dollars
  quantity: number;
}

interface PriceBreakdown {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;          // 20 = 20% or $20
  minPurchase: number;    // Minimum subtotal required
  maxDiscount?: number;   // Cap for percentage discounts
}

function calculatePrice(
  items: CartItem[], 
  coupon: Coupon | null, 
  taxRate: number
): PriceBreakdown {
  // Input validation
  if (!items || items.length === 0) {
    return { subtotal: 0, discount: 0, tax: 0, total: 0 };
  }
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1');
  }
  
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    if (item.price < 0) throw new Error(`Negative price for item ${item.id}`);
    if (item.quantity <= 0) throw new Error(`Invalid quantity for item ${item.id}`);
    return sum + item.price * item.quantity;
  }, 0);
  
  // Apply coupon
  let discount = 0;
  if (coupon && subtotal >= coupon.minPurchase) {
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.value, subtotal); // Can't discount more than subtotal
    }
  }
  
  // Calculate tax on discounted amount
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * taxRate;
  
  // Round everything to 2 decimal places
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round((taxableAmount + tax) * 100) / 100,
  };
}
```

### Comprehensive Unit Tests

```typescript
/**
 * UNIT TESTS — Following AAA Pattern (Arrange, Act, Assert)
 * 
 * Test Organization:
 * 1. Happy path (normal usage)
 * 2. Edge cases (boundaries, empty inputs)
 * 3. Error cases (invalid inputs)
 * 4. Business rules (coupons, min purchase, caps)
 * 
 * Naming Convention: "should [expected behavior] when [condition]"
 */

describe('calculatePrice', () => {
  // ─── HAPPY PATH ───────────────────────────────────────
  describe('basic calculations', () => {
    it('should calculate subtotal for single item', () => {
      const items = [{ id: '1', name: 'Widget', price: 10.00, quantity: 3 }];
      const result = calculatePrice(items, null, 0.08);
      
      expect(result.subtotal).toBe(30.00);
      expect(result.discount).toBe(0);
      expect(result.tax).toBe(2.40);
      expect(result.total).toBe(32.40);
    });

    it('should calculate subtotal for multiple items', () => {
      const items = [
        { id: '1', name: 'Widget', price: 10.00, quantity: 2 },
        { id: '2', name: 'Gadget', price: 25.50, quantity: 1 },
      ];
      const result = calculatePrice(items, null, 0.10);
      
      expect(result.subtotal).toBe(45.50);
      expect(result.tax).toBe(4.55);
      expect(result.total).toBe(50.05);
    });
  });

  // ─── EDGE CASES ───────────────────────────────────────
  describe('edge cases', () => {
    it('should return zeros for empty cart', () => {
      const result = calculatePrice([], null, 0.08);
      expect(result).toEqual({ subtotal: 0, discount: 0, tax: 0, total: 0 });
    });

    it('should handle zero tax rate', () => {
      const items = [{ id: '1', name: 'Widget', price: 100, quantity: 1 }];
      const result = calculatePrice(items, null, 0);
      
      expect(result.tax).toBe(0);
      expect(result.total).toBe(100);
    });

    it('should handle floating point precision', () => {
      // 0.1 + 0.2 !== 0.3 in JavaScript!
      const items = [{ id: '1', name: 'Widget', price: 0.10, quantity: 3 }];
      const result = calculatePrice(items, null, 0);
      
      expect(result.subtotal).toBe(0.30); // Not 0.30000000000000004
    });

    it('should handle very large quantities', () => {
      const items = [{ id: '1', name: 'Penny item', price: 0.01, quantity: 1_000_000 }];
      const result = calculatePrice(items, null, 0.08);
      
      expect(result.subtotal).toBe(10_000.00);
    });
  });

  // ─── COUPON BUSINESS RULES ────────────────────────────
  describe('coupon application', () => {
    const percentageCoupon: Coupon = {
      code: 'SAVE20',
      type: 'percentage',
      value: 20,
      minPurchase: 50,
      maxDiscount: 30,
    };

    const fixedCoupon: Coupon = {
      code: 'FLAT10',
      type: 'fixed',
      value: 10,
      minPurchase: 25,
    };

    it('should apply percentage discount', () => {
      const items = [{ id: '1', name: 'Widget', price: 100, quantity: 1 }];
      const result = calculatePrice(items, percentageCoupon, 0);
      
      expect(result.discount).toBe(20); // 20% of 100
      expect(result.total).toBe(80);
    });

    it('should cap percentage discount at maxDiscount', () => {
      const items = [{ id: '1', name: 'Widget', price: 200, quantity: 1 }];
      const result = calculatePrice(items, percentageCoupon, 0);
      
      // 20% of 200 = 40, but maxDiscount = 30
      expect(result.discount).toBe(30);
      expect(result.total).toBe(170);
    });

    it('should NOT apply coupon below minPurchase', () => {
      const items = [{ id: '1', name: 'Widget', price: 20, quantity: 1 }];
      const result = calculatePrice(items, percentageCoupon, 0);
      
      expect(result.discount).toBe(0); // Below $50 min
      expect(result.total).toBe(20);
    });

    it('should not allow fixed discount to exceed subtotal', () => {
      const items = [{ id: '1', name: 'Widget', price: 5, quantity: 6 }];
      // Subtotal = $30, coupon = $10, min = $25
      const result = calculatePrice(items, fixedCoupon, 0);
      
      expect(result.discount).toBe(10);
      expect(result.total).toBe(20);
    });

    it('should calculate tax AFTER discount', () => {
      const items = [{ id: '1', name: 'Widget', price: 100, quantity: 1 }];
      const result = calculatePrice(items, fixedCoupon, 0.10);
      
      // Subtotal: 100, Discount: 10, Taxable: 90, Tax: 9
      expect(result.tax).toBe(9);
      expect(result.total).toBe(99);
    });
  });

  // ─── ERROR CASES ──────────────────────────────────────
  describe('validation errors', () => {
    it('should throw for negative price', () => {
      const items = [{ id: '1', name: 'Widget', price: -5, quantity: 1 }];
      expect(() => calculatePrice(items, null, 0.08)).toThrow('Negative price');
    });

    it('should throw for zero quantity', () => {
      const items = [{ id: '1', name: 'Widget', price: 10, quantity: 0 }];
      expect(() => calculatePrice(items, null, 0.08)).toThrow('Invalid quantity');
    });

    it('should throw for invalid tax rate', () => {
      const items = [{ id: '1', name: 'Widget', price: 10, quantity: 1 }];
      expect(() => calculatePrice(items, null, 1.5)).toThrow('Tax rate');
      expect(() => calculatePrice(items, null, -0.1)).toThrow('Tax rate');
    });
  });
});
```

### Sample input and output
- **Input**: `[{price: 100, qty: 1}]`, coupon `SAVE20` (20%, min $50, max $30), tax 10%
- **Output**: `{ subtotal: 100, discount: 20, tax: 8, total: 88 }`

---

## 5. Scenario B: Integration & E2E Testing

**Real-Life Scenario:** Your REST API has a user registration endpoint. It validates input, hashes the password, saves to PostgreSQL, sends a welcome email via an external service, and returns a JWT.

**Technical Problem:** Write integration tests that test the real database and API contract, plus E2E tests for the full user journey.

### Integration Test — API + Real Database

```typescript
/**
 * INTEGRATION TESTS
 * 
 * These tests use a REAL database (test instance or Testcontainers)
 * but mock EXTERNAL services (email, payment).
 * 
 * Setup: Before each test suite:
 *   1. Start a fresh test database (Docker / Testcontainers)
 *   2. Run migrations
 *   3. Seed minimal test data
 * 
 * Teardown: After each test:
 *   1. Truncate tables (fast) or rollback transaction
 *   2. Reset mocks
 * 
 * @framework Supertest + Jest + Testcontainers
 */

import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/database';
import { emailService } from '../src/services/email';

// Mock external services, NOT the database
jest.mock('../src/services/email');
const mockEmail = emailService as jest.Mocked<typeof emailService>;

describe('POST /api/users/register', () => {
  // Clean database between tests for isolation
  beforeEach(async () => {
    await db.query('TRUNCATE users CASCADE');
    mockEmail.sendWelcomeEmail.mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await db.end(); // Close connection pool
  });

  it('should register a new user and return 201', async () => {
    // Act
    const response = await request(app)
      .post('/api/users/register')
      .send({
        email: 'alice@example.com',
        password: 'SecurePass123!',
        name: 'Alice Johnson',
      });

    // Assert — API contract
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      user: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
      },
      token: expect.any(String), // JWT token returned
    });
    expect(response.body.user).not.toHaveProperty('password'); // Never expose password!

    // Assert — Database state
    const dbUser = await db.query('SELECT * FROM users WHERE email = $1', ['alice@example.com']);
    expect(dbUser.rows).toHaveLength(1);
    expect(dbUser.rows[0].name).toBe('Alice Johnson');
    expect(dbUser.rows[0].password_hash).not.toBe('SecurePass123!'); // Must be hashed

    // Assert — Side effects
    expect(mockEmail.sendWelcomeEmail).toHaveBeenCalledWith('alice@example.com', 'Alice Johnson');
  });

  it('should return 409 for duplicate email', async () => {
    // Arrange — Create the user first
    await request(app)
      .post('/api/users/register')
      .send({ email: 'bob@example.com', password: 'Pass123!', name: 'Bob' });

    // Act — Try to register again with same email
    const response = await request(app)
      .post('/api/users/register')
      .send({ email: 'bob@example.com', password: 'DifferentPass!', name: 'Bobby' });

    // Assert
    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/already exists/i);
  });

  it('should return 400 for weak password', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ email: 'weak@example.com', password: '123', name: 'Weak' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ field: 'password' })
    );
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ email: 'not-an-email', password: 'SecurePass123!', name: 'Test' });

    expect(response.status).toBe(400);
  });

  it('should handle email service failure gracefully', async () => {
    // Email service is down — registration should still succeed
    mockEmail.sendWelcomeEmail.mockRejectedValue(new Error('SMTP timeout'));

    const response = await request(app)
      .post('/api/users/register')
      .send({ email: 'eve@example.com', password: 'SecurePass123!', name: 'Eve' });

    // User is created even if email fails (email can be retried)
    expect(response.status).toBe(201);
    
    // Verify user was still persisted
    const dbUser = await db.query('SELECT * FROM users WHERE email = $1', ['eve@example.com']);
    expect(dbUser.rows).toHaveLength(1);
  });
});
```

### E2E Test — Full User Journey with Playwright

```typescript
/**
 * E2E TESTS — Playwright
 * 
 * These test the FULL application as a real user would use it.
 * - Real browser (Chromium)
 * - Real server
 * - Real database
 * - Mock only truly external services (payment gateways)
 * 
 * Keep E2E tests to CRITICAL PATHS only:
 * 1. User registration → login → profile
 * 2. Product search → add to cart → checkout → payment
 * 3. Admin creates product → user sees it
 * 
 * @framework Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('User Registration Journey', () => {
  test('should register, login, and view profile', async ({ page }) => {
    // Step 1: Navigate to registration page
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    // Step 2: Fill out the registration form
    await page.getByLabel('Full Name').fill('Alice Johnson');
    await page.getByLabel('Email').fill(`alice-${Date.now()}@test.com`);
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByLabel('Confirm Password').fill('SecurePass123!');
    
    // Step 3: Submit the form
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Step 4: Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Welcome, Alice')).toBeVisible();

    // Step 5: Navigate to profile
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByText('Alice Johnson')).toBeVisible();
    
    // Step 6: Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');
    
    // Submit empty form
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Verify Validation messages
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });
});

test.describe('Shopping Cart Journey', () => {
  test('should search, add to cart, and checkout', async ({ page }) => {
    // Login first (use a test account)
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@test.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Search for a product
    await page.getByPlaceholder('Search products').fill('TypeScript book');
    await page.keyboard.press('Enter');
    await expect(page.getByText(/results for/i)).toBeVisible();

    // Add to cart
    await page.getByText('TypeScript Handbook').first().click();
    await page.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.getByText('Added to cart')).toBeVisible();

    // Go to cart
    await page.getByRole('link', { name: /cart.*1/i }).click();
    await expect(page.getByText('TypeScript Handbook')).toBeVisible();

    // Proceed to checkout
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page.getByText('Order Summary')).toBeVisible();
  });
});
```

### Test Doubles Reference

```typescript
/**
 * TEST DOUBLES — The 5 Types
 * 
 * Understanding the difference is a common senior interview question.
 */

// 1. DUMMY — Passed but never used (fills a parameter)
const dummyLogger: Logger = { log: () => {} };
const service = new UserService(realDb, dummyLogger);

// 2. STUB — Returns hardcoded data (no logic)
const stubRepo: UserRepository = {
  findById: async () => ({ id: '1', name: 'Alice', email: 'a@b.com' }),
  save: async () => {},
  delete: async () => {},
};

// 3. SPY — Records how it was called (for verification)
const spyEmail = {
  calls: [] as any[],
  send: async function(to: string, body: string) {
    this.calls.push({ to, body });
  }
};
// After test: expect(spyEmail.calls).toHaveLength(1);

// 4. MOCK — Pre-programmed with expectations (auto-verifies)
const mockPayment = jest.fn();
mockPayment.mockResolvedValueOnce({ success: true, txId: 'TX-1' });
// jest.fn() auto-tracks: mockPayment.mock.calls, mock.results

// 5. FAKE — Working implementation (simplified)
class FakeUserRepository implements UserRepository {
  private users = new Map<string, User>(); // In-memory instead of DB
  async findById(id: string) { return this.users.get(id) || null; }
  async save(user: User) { this.users.set(user.id, user); }
  async delete(id: string) { this.users.delete(id); }
  // This ACTUALLY WORKS but doesn't use a real database
}
```

---

## 6. Real World Applications 🌍

### 1. 🏗️ TDD (Test-Driven Development) Workflow

```
   ┌─────────────────────┐
   │   1. Write a FAILING │
   │      test first      │ ← RED: Test fails (no code yet)
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │   2. Write MINIMAL   │
   │      code to pass    │ ← GREEN: Test passes (ugly code OK)
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │   3. REFACTOR the    │
   │      code & tests    │ ← REFACTOR: Clean up while tests pass
   └──────────┬──────────┘
              │
              └────▶ Repeat
```

**Why TDD works at 15 YOE:** You build confidence that refactoring won't break things. When you inherit a legacy codebase, you write *characterization tests* (tests that describe existing behavior) before changing anything.

### 2. 📊 Code Coverage — What Numbers to Aim For

| Coverage Type | What It Measures | Target |
|---------------|-----------------|--------|
| **Line Coverage** | % of lines executed | 80%+ |
| **Branch Coverage** | % of if/else branches taken | 75%+ |
| **Function Coverage** | % of functions called | 90%+ |
| **Statement Coverage** | % of statements executed | 80%+ |

**Important:** 100% coverage ≠ 100% correct. You can have 100% coverage and zero assertions. **Coverage measures what code ran, not whether the results are correct.**

### 3. 🐳 Testcontainers — Real Databases in CI

Instead of mocking the database (which hides SQL bugs), use **Testcontainers** to spin up a real PostgreSQL instance in Docker for each test suite. Tests run against real SQL, real constraints, real indexes. Teardown destroys the container. No state leaks between CI runs.

### 4. 🔄 Contract Testing — Microservice Boundaries

When Service A calls Service B's API, who tests the contract? **Pact** is a contract testing framework: Service A generates a "pact" (expected request/response). Service B verifies it can fulfill the pact. If either side changes, the pact test fails before production.

---

## 7. Complexity Analysis 🧠

### Testing Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| **Test implementation, not behavior** | Tests break on every refactor | Test public API outputs, not internal state |
| **Shared mutable state between tests** | Test B passes only if Test A runs first | Reset state in `beforeEach` |
| **Sleeping in tests** | `await sleep(5000)` — slow and flaky | Use `waitFor`, polling, or event-based assertions |
| **Too many E2E tests** | Slow CI (30+ min), flaky results | Follow the pyramid: 70% unit, 20% integration, 10% E2E |
| **Mocking what you don't own** | Mock drifts from real API behavior | Use integration tests or contract tests for external APIs |
| **Testing framework code** | Testing that React renders a `<div>` | Test YOUR logic, trust framework authors |
| **Giant test files** | 2000-line test file, impossible to navigate | One `describe` block per function, split into files |

### Interview Tips 💡

1. **"How do you decide what to test?"** — "I use the Testing Pyramid. Unit tests for business logic (pure functions, validators, calculators). Integration tests for API endpoints with real databases. E2E tests only for critical user journeys (registration, checkout)."
2. **"What's the difference between a mock and a stub?"** — "A stub returns hardcoded data but doesn't care how it's called. A mock has expectations — it verifies that specific methods were called with specific arguments. I prefer stubs for most tests and mocks only when verifying side effects (like 'email was sent')."
3. **"How do you test microservices?"** — "Contract testing with Pact. Service A defines what it expects from Service B (the contract). Service B verifies it can fulfill the contract. This catches breaking changes at CI time, not in production."
4. **"What code coverage target do you use?"** — "80% line coverage as a threshold, but I don't treat it as a goal. I focus on testing **decision points** (if/else branches) and **edge cases**. 100% coverage with weak assertions is worse than 70% coverage with strong assertions."
5. **"How do you handle flaky tests?"** — "I quarantine them immediately (move to a separate suite that doesn't block CI). Then I investigate: is it a timing issue? (use waitFor, not sleep). Shared state? (add beforeEach cleanup). External dependency? (use Testcontainers or stubs)."
6. **"Do you write tests first (TDD)?"** — "For pure business logic, yes — TDD forces me to think about the API before implementation. For UI components, I write the component first and test behavior after, because visual design is iterative."
