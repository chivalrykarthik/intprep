# Design Patterns — SOLID & GoF 🏛️

## 1. The "IKEA Furniture" Analogy

Imagine you are building IKEA furniture:

**Without Patterns (Chaos):**
- You build everything from scratch — raw wood, nails, and your imagination.
- Every time someone wants a slight variation (different color, bigger shelf), you demolish the whole thing and start over.
- The table leg is welded to the tabletop. Want to replace just the leg? Impossible — destroy the entire table.

**With Patterns (IKEA):**
- **Standard interfaces:** All legs use the same bolt pattern. Swap a wooden leg for a metal one — it just works.
- **Single Responsibility:** The instruction manual has one step per diagram. Each piece has ONE job.
- **Open/Closed:** Want a bigger shelf? Snap on an extension module. The existing shelf doesn't change.
- **Dependency Inversion:** The shelf doesn't care if it's mounted on a wooden frame or a metal one. It depends on the **bolt interface**, not the material.

**These are Design Patterns.** Proven blueprints for solving recurring software design problems without reinventing the wheel every time.

---

## 2. The Core Concept

Design Patterns fall into two categories for interviews:

1. **SOLID Principles** — The *rules* of good object-oriented design (Uncle Bob's Five Commandments)
2. **GoF Patterns** — The *recipes* for solving specific structural/behavioral problems (Gang of Four's 23 patterns)

> **At 15 YOE, interviewers don't ask "What is the Observer pattern?"** They ask: *"How would you design a notification system that can send emails, SMS, and push notifications without modifying existing code when we add Slack?"* — and they expect you to naturally apply Open/Closed + Strategy without naming the pattern first.

### SOLID at a Glance

```
S — Single Responsibility    One class = one reason to change
O — Open/Closed              Open for extension, closed for modification
L — Liskov Substitution      Subtypes must be substitutable for their base types
I — Interface Segregation    Many specific interfaces > one fat interface
D — Dependency Inversion     Depend on abstractions, not concretions
```

### GoF Patterns by Category

```
┌────────────────────────────────────────────────────────────────┐
│                   GANG OF FOUR PATTERNS                        │
├────────────────┬───────────────────┬───────────────────────────┤
│   CREATIONAL   │    STRUCTURAL     │       BEHAVIORAL          │
│   (How to      │    (How to        │       (How objects        │
│    create)     │     compose)      │        communicate)       │
├────────────────┼───────────────────┼───────────────────────────┤
│ • Singleton    │ • Adapter         │ • Strategy                │
│ • Factory      │ • Decorator       │ • Observer                │
│ • Abstract     │ • Facade          │ • Command                 │
│   Factory      │ • Proxy           │ • Chain of Responsibility │
│ • Builder      │ • Composite       │ • State                   │
│ • Prototype    │ • Bridge          │ • Template Method         │
│                │ • Flyweight       │ • Iterator                │
│                │                   │ • Mediator                │
│                │                   │ • Memento                 │
│                │                   │ • Visitor                 │
└────────────────┴───────────────────┴───────────────────────────┘

MOST ASKED IN INTERVIEWS (Senior/Staff):
  ⭐ Strategy, Observer, Factory, Decorator, Adapter, Singleton
  
MOST USED IN REAL CODE:
  ⭐ Strategy (payment processors), Observer (event systems),
     Factory (object creation), Decorator (middleware),
     Builder (complex configs), Proxy (caching/logging)
```

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────────────┐
│               SOLID PRINCIPLES — DECISION TREE                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  "My class is 500 lines and does 5 things"                        │
│   └──▶ S: Split into 5 classes with one job each                  │
│                                                                   │
│  "Adding a new payment method requires editing PaymentService"    │
│   └──▶ O: Create PaymentStrategy interface + new implementations  │
│                                                                   │
│  "My Square extends Rectangle but area() gives wrong results"     │
│   └──▶ L: Square is NOT a valid subtype of Rectangle              │
│          (Square can't independently set width/height)            │
│                                                                   │
│  "My interface has 20 methods but most classes use only 3"        │
│   └──▶ I: Split into focused interfaces (Readable, Writable)     │
│                                                                   │
│  "My controller directly calls MySQL — switching to Mongo breaks  │
│   everything"                                                     │
│   └──▶ D: Controller depends on Repository interface, not MySQL   │
│                                                                   │
│  ┌────────────────────────────────────────────┐                   │
│  │         DEPENDENCY DIRECTION                │                   │
│  │                                             │                   │
│  │  ❌ Wrong:                                  │                   │
│  │  Controller → MySQL                         │                   │
│  │  (high-level depends on low-level)          │                   │
│  │                                             │                   │
│  │  ✅ Right:                                  │                   │
│  │  Controller → IRepository ← MySQL           │                   │
│  │  (both depend on abstraction)               │                   │
│  └────────────────────────────────────────────┘                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: SOLID Principles in Action

**Real-Life Scenario:** You're building a notification system for an e-commerce platform. Users need notifications via Email, SMS, and Push. The business team tells you Slack integration is coming next quarter, and WhatsApp the quarter after that.

**Technical Problem:** Design a system where adding a new notification channel requires **zero changes** to existing code.

### TypeScript Implementation — Violating Then Fixing Each Principle

```typescript
/**
 * ═══════════════════════════════════════════════════
 * S — SINGLE RESPONSIBILITY PRINCIPLE (SRP)
 * "A class should have only ONE reason to change."
 * ═══════════════════════════════════════════════════
 */

// ❌ BAD: This class has 4 reasons to change
// (order logic, email logic, inventory logic, analytics logic)
class GodService {
  async processOrder(order: Order): Promise<void> {
    // Validate order
    if (!order.items.length) throw new Error("Empty order");
    
    // Calculate totals (business logic)
    const total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    // Send email (communication logic)
    const emailHtml = `<h1>Order Confirmed</h1><p>Total: $${total}</p>`;
    await smtp.sendMail({ to: order.email, html: emailHtml });
    
    // Update inventory (data logic)
    for (const item of order.items) {
      await db.query("UPDATE products SET stock = stock - $1 WHERE id = $2", 
        [item.qty, item.id]);
    }
    
    // Track analytics (reporting logic)
    await analytics.track("order_placed", { total, items: order.items.length });
  }
}

// ✅ GOOD: Each class has ONE job, ONE reason to change
class OrderValidator {
  validate(order: Order): void {
    if (!order.items.length) throw new Error("Empty order");
    if (order.items.some(i => i.qty <= 0)) throw new Error("Invalid quantity");
  }
}

class OrderCalculator {
  calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
}

class OrderNotifier {
  async notify(order: Order, total: number): Promise<void> {
    await smtp.sendMail({
      to: order.email,
      html: `<h1>Order Confirmed</h1><p>Total: $${total}</p>`
    });
  }
}

class InventoryService {
  async deductStock(items: OrderItem[]): Promise<void> {
    for (const item of items) {
      await db.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [item.qty, item.id]
      );
    }
  }
}

// Orchestrator (thin — delegates to specialists)
class OrderService {
  constructor(
    private validator: OrderValidator,
    private calculator: OrderCalculator,
    private notifier: OrderNotifier,
    private inventory: InventoryService,
  ) {}

  async processOrder(order: Order): Promise<void> {
    this.validator.validate(order);
    const total = this.calculator.calculateTotal(order.items);
    await this.inventory.deductStock(order.items);
    await this.notifier.notify(order, total);
  }
}
```

```typescript
/**
 * ═══════════════════════════════════════════════════
 * O — OPEN/CLOSED PRINCIPLE (OCP)
 * "Open for extension, closed for modification."
 * 
 * You should be able to add new behavior WITHOUT
 * changing existing, tested, production code.
 * ═══════════════════════════════════════════════════
 */

// ❌ BAD: Adding Slack requires modifying this function
function sendNotification(type: string, message: string): void {
  if (type === "email") {
    sendEmail(message);
  } else if (type === "sms") {
    sendSMS(message);
  } else if (type === "push") {
    sendPush(message);
  }
  // Adding Slack? Edit this function. Edit tests. Risk regression.
}

// ✅ GOOD: Strategy Pattern — extend without modification
interface NotificationChannel {
  send(recipient: string, message: string): Promise<void>;
  supports(type: string): boolean;
}

class EmailChannel implements NotificationChannel {
  supports(type: string): boolean { return type === "email"; }
  async send(recipient: string, message: string): Promise<void> {
    await smtp.sendMail({ to: recipient, subject: "Notification", text: message });
  }
}

class SMSChannel implements NotificationChannel {
  supports(type: string): boolean { return type === "sms"; }
  async send(recipient: string, message: string): Promise<void> {
    await twilioClient.messages.create({ to: recipient, body: message });
  }
}

class PushChannel implements NotificationChannel {
  supports(type: string): boolean { return type === "push"; }
  async send(recipient: string, message: string): Promise<void> {
    await firebase.messaging().send({ token: recipient, notification: { body: message } });
  }
}

// Adding Slack? Just add a new class. ZERO changes to existing code.
class SlackChannel implements NotificationChannel {
  supports(type: string): boolean { return type === "slack"; }
  async send(recipient: string, message: string): Promise<void> {
    await slackWebhook.send({ channel: recipient, text: message });
  }
}

// The notifier doesn't know (or care) about specific channels
class NotificationService {
  constructor(private channels: NotificationChannel[]) {}

  async notify(type: string, recipient: string, message: string): Promise<void> {
    const channel = this.channels.find(ch => ch.supports(type));
    if (!channel) throw new Error(`Unsupported channel: ${type}`);
    await channel.send(recipient, message);
  }

  async notifyAll(recipient: Map<string, string>, message: string): Promise<void> {
    const promises = Array.from(recipient.entries()).map(([type, target]) =>
      this.notify(type, target, message)
    );
    await Promise.allSettled(promises); // Don't fail if one channel fails
  }
}
```

```typescript
/**
 * ═══════════════════════════════════════════════════
 * L — LISKOV SUBSTITUTION PRINCIPLE (LSP)
 * "If S is a subtype of T, then objects of type T
 *  may be replaced with objects of type S without
 *  altering the correctness of the program."
 * ═══════════════════════════════════════════════════
 */

// ❌ BAD: Classic violation — Square extends Rectangle
class Rectangle {
  constructor(protected width: number, protected height: number) {}
  
  setWidth(w: number): void { this.width = w; }
  setHeight(h: number): void { this.height = h; }
  area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(w: number): void {
    this.width = w;
    this.height = w; // Must keep square constraint
  }
  setHeight(h: number): void {
    this.width = h;
    this.height = h;  // Must keep square constraint
  }
}

// This function BREAKS with Square:
function doubleWidth(rect: Rectangle): number {
  rect.setWidth(rect.area() / rect.height * 2); // Assumes width/height are independent
  return rect.area();
  // For Rectangle(3,4): setWidth(6) → area = 24 ✅
  // For Square(4,4): setWidth(8) → height also becomes 8 → area = 64 ❌
}

// ✅ GOOD: Use composition and interfaces
interface Shape {
  area(): number;
  perimeter(): number;
}

class RectangleShape implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number { return this.width * this.height; }
  perimeter(): number { return 2 * (this.width + this.height); }
}

class SquareShape implements Shape {
  constructor(private side: number) {}
  area(): number { return this.side * this.side; }
  perimeter(): number { return 4 * this.side; }
}

// Any function that takes Shape works correctly with both
function printArea(shape: Shape): void {
  console.log(`Area: ${shape.area()}`); // Always correct
}
```

```typescript
/**
 * ═══════════════════════════════════════════════════
 * I — INTERFACE SEGREGATION PRINCIPLE (ISP)
 * "No client should be forced to depend on methods
 *  it does not use."
 * ═══════════════════════════════════════════════════
 */

// ❌ BAD: Fat interface — forces implementors to add unused methods
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
  writeCode(): void;
  reviewCode(): void;
  managePeople(): void;
}

// A junior developer doesn't manage people!
// A robot worker doesn't eat or sleep!

// ✅ GOOD: Segregated interfaces — implement only what you need
interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
  sleep(): void;
}

interface Manageable {
  managePeople(): void;
  attendMeeting(): void;
}

interface Codeable {
  writeCode(): void;
  reviewCode(): void;
}

// Each role composes only the interfaces it needs
class SeniorDeveloper implements Workable, Feedable, Codeable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  writeCode(): void { /* ... */ }
  reviewCode(): void { /* ... */ }
}

class EngineeringManager implements Workable, Feedable, Manageable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  managePeople(): void { /* ... */ }
  attendMeeting(): void { /* ... */ }
}

class RobotWorker implements Workable {
  work(): void { /* ... */ }
  // No eat, sleep, or manage — not forced to implement them!
}
```

```typescript
/**
 * ═══════════════════════════════════════════════════
 * D — DEPENDENCY INVERSION PRINCIPLE (DIP)
 * "High-level modules should not depend on low-level
 *  modules. Both should depend on abstractions."
 * ═══════════════════════════════════════════════════
 */

// ❌ BAD: Controller directly depends on MySQL
class UserController {
  private db = new MySQLDatabase(); // Tight coupling!
  
  async getUser(id: string): Promise<User> {
    return this.db.query("SELECT * FROM users WHERE id = ?", [id]);
    // Want to switch to PostgreSQL? Rewrite the entire controller.
    // Want to unit test? Need a running MySQL instance.
  }
}

// ✅ GOOD: Both depend on an abstraction (Repository interface)
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

class MySQLUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await mysql.query("SELECT * FROM users WHERE id = ?", [id]);
    return result.rows[0] || null;
  }
  async save(user: User): Promise<void> { /* MySQL implementation */ }
  async delete(id: string): Promise<void> { /* MySQL implementation */ }
}

class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return await mongoCollection.findOne({ _id: id });
  }
  async save(user: User): Promise<void> { /* Mongo implementation */ }
  async delete(id: string): Promise<void> { /* Mongo implementation */ }
}

class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  async findById(id: string): Promise<User | null> { return this.users.get(id) || null; }
  async save(user: User): Promise<void> { this.users.set(user.id, user); }
  async delete(id: string): Promise<void> { this.users.delete(id); }
}

// Controller depends on INTERFACE, not implementation
class UserController {
  constructor(private repo: UserRepository) {}  // Injected!
  
  async getUser(id: string): Promise<User | null> {
    return this.repo.findById(id);
    // Switch DB? Change the injected implementation. Controller untouched.
    // Unit test? Inject InMemoryUserRepository. No database needed.
  }
}

// Composition Root (where wiring happens)
const repo = process.env.DB === 'mongo' 
  ? new MongoUserRepository()
  : new MySQLUserRepository();
  
const controller = new UserController(repo);
```

### Sample input and output
- **Input**: An order with 3 items, customer email, SMS number, and push token  
- **Output**: Notification sent through all 3 channels concurrently via `Promise.allSettled`. Adding Slack requires only `new SlackChannel()` — zero modifications to `NotificationService`.

---

## 5. Scenario B: Gang of Four Patterns — The Essential Six

**Real-Life Scenario:** You are designing a payment processing system. Different countries use different payment providers (Stripe in the US, Razorpay in India, Adyen in Europe). Payment methods include credit cards, UPI, bank transfers, and wallets. The system must be extensible without modifying core payment logic.

**Technical Problem:** Apply Factory, Strategy, Observer, Decorator, Adapter, and Singleton patterns to build a clean, extensible payment architecture.

### Pattern 1: Strategy — "Swappable Algorithms"

```typescript
/**
 * STRATEGY PATTERN
 * 
 * Define a family of algorithms, encapsulate each one,
 * and make them interchangeable.
 * 
 * USE WHEN: You have multiple ways to do the same thing
 * and want to switch between them at runtime.
 * 
 * REAL EXAMPLES: Payment processors, sorting algorithms,
 * compression strategies, authentication methods.
 * 
 * @timeComplexity O(1) to select strategy
 * @spaceComplexity O(N) where N = number of strategies
 */

interface PaymentStrategy {
  charge(amount: number, currency: string, details: PaymentDetails): Promise<PaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
  supports(method: string): boolean;
}

class StripeStrategy implements PaymentStrategy {
  supports(method: string): boolean {
    return ['credit_card', 'apple_pay', 'google_pay'].includes(method);
  }
  
  async charge(amount: number, currency: string, details: PaymentDetails): Promise<PaymentResult> {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      payment_method: details.token,
      confirm: true,
    });
    return { 
      success: intent.status === 'succeeded', 
      transactionId: intent.id,
      provider: 'stripe',
    };
  }
  
  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const refund = await stripe.refunds.create({
      payment_intent: transactionId,
      amount: Math.round(amount * 100),
    });
    return { success: refund.status === 'succeeded', refundId: refund.id };
  }
}

class RazorpayStrategy implements PaymentStrategy {
  supports(method: string): boolean {
    return ['upi', 'netbanking', 'wallet'].includes(method);
  }
  
  async charge(amount: number, currency: string, details: PaymentDetails): Promise<PaymentResult> {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: currency || 'INR',
    });
    return { success: true, transactionId: order.id, provider: 'razorpay' };
  }
  
  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const refund = await razorpay.payments.refund(transactionId, { amount: amount * 100 });
    return { success: true, refundId: refund.id };
  }
}

// Context — selects the right strategy at runtime
class PaymentProcessor {
  constructor(private strategies: PaymentStrategy[]) {}

  async processPayment(
    method: string, amount: number, currency: string, details: PaymentDetails
  ): Promise<PaymentResult> {
    const strategy = this.strategies.find(s => s.supports(method));
    if (!strategy) throw new Error(`Unsupported payment method: ${method}`);
    return strategy.charge(amount, currency, details);
  }
}
```

### Pattern 2: Factory — "Object Creation Without `new`"

```typescript
/**
 * FACTORY PATTERN
 * 
 * Create objects without exposing creation logic.
 * The caller doesn't know (or care) which concrete class
 * is instantiated. They just get an object that satisfies
 * the interface.
 * 
 * USE WHEN: Object creation is complex, conditional, or
 * you want to centralize instance creation.
 * 
 * REAL EXAMPLES: Logger factories, database connections,
 * UI component factories, service creation.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  log(level: LogLevel, message: string, meta?: Record<string, any>): void;
}

class ConsoleLogger implements Logger {
  log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, meta || '');
  }
}

class FileLogger implements Logger {
  constructor(private filePath: string) {}
  log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    const line = JSON.stringify({ timestamp: Date.now(), level, message, ...meta });
    fs.appendFileSync(this.filePath, line + '\n');
  }
}

class CloudLogger implements Logger {
  constructor(private serviceName: string) {}
  log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    // Send to DataDog, CloudWatch, or Splunk
    httpClient.post('/logs', {
      service: this.serviceName,
      level,
      message,
      ...meta,
      timestamp: Date.now(),
    });
  }
}

// Factory — hides creation logic
class LoggerFactory {
  static create(environment: string): Logger {
    switch (environment) {
      case 'development':
        return new ConsoleLogger();
      case 'test':
        return new FileLogger('/tmp/test.log');
      case 'staging':
        return new FileLogger('/var/log/app.log');
      case 'production':
        return new CloudLogger('payment-service');
      default:
        return new ConsoleLogger();
    }
  }
}

// Usage — caller doesn't know or care which logger is created
const logger = LoggerFactory.create(process.env.NODE_ENV || 'development');
logger.log('info', 'Payment processed', { orderId: '123', amount: 99.99 });
```

### Pattern 3: Observer — "Event-Driven Communication"

```typescript
/**
 * OBSERVER PATTERN
 * 
 * Define a one-to-many dependency. When one object (Subject)
 * changes state, all its dependents (Observers) are notified
 * automatically.
 * 
 * USE WHEN: Multiple components need to react to changes
 * in another component, without tight coupling.
 * 
 * REAL EXAMPLES: Event emitters, pub/sub, React state management,
 * webhook systems, DOM event listeners.
 * 
 * This is the pattern behind Node.js EventEmitter, React's
 * useState, Redux stores, and every pub/sub system.
 */

// Type-safe event system
type EventMap = {
  'order:placed': { orderId: string; total: number; userId: string };
  'order:shipped': { orderId: string; trackingNumber: string };
  'order:cancelled': { orderId: string; reason: string };
  'user:registered': { userId: string; email: string };
};

type EventHandler<T> = (data: T) => void | Promise<void>;

class TypedEventBus {
  private handlers = new Map<string, Set<EventHandler<any>>>();

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    if (!this.handlers.has(event as string)) {
      this.handlers.set(event as string, new Set());
    }
    this.handlers.get(event as string)!.add(handler);
    
    // Return unsubscribe function (cleanup)
    return () => this.handlers.get(event as string)?.delete(handler);
  }

  async emit<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void> {
    const handlers = this.handlers.get(event as string);
    if (!handlers) return;
    
    // Execute all handlers concurrently (don't let one slow handler block others)
    const results = await Promise.allSettled(
      Array.from(handlers).map(handler => handler(data))
    );
    
    // Log failures but don't crash
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Event handler failed for ${String(event)}:`, result.reason);
      }
    });
  }
}

// Usage — decoupled observers
const eventBus = new TypedEventBus();

// Observer 1: Send confirmation email
eventBus.on('order:placed', async ({ orderId, userId }) => {
  await emailService.sendOrderConfirmation(userId, orderId);
});

// Observer 2: Update analytics
eventBus.on('order:placed', ({ total }) => {
  analytics.track('revenue', { amount: total });
});

// Observer 3: Notify warehouse
eventBus.on('order:placed', async ({ orderId }) => {
  await warehouseService.queueForFulfillment(orderId);
});

// Observer 4: Deduct loyalty points
eventBus.on('order:placed', async ({ userId, total }) => {
  await loyaltyService.earnPoints(userId, Math.floor(total));
});

// Emitting event triggers ALL observers automatically
await eventBus.emit('order:placed', {
  orderId: 'ORD-42',
  total: 149.99,
  userId: 'USR-007'
});
```

### Pattern 4: Decorator — "Wrapping Behavior"

```typescript
/**
 * DECORATOR PATTERN
 * 
 * Attach additional responsibilities to an object dynamically.
 * Decorators provide a flexible alternative to subclassing.
 * 
 * USE WHEN: You want to add behavior (logging, caching, retry,
 * auth) without modifying the original class.
 * 
 * REAL EXAMPLES: Express middleware, Python decorators (@),
 * Java annotations, TypeScript decorators, Redux middleware.
 * 
 * This is the pattern behind middleware in every web framework.
 */

// Base interface
interface HttpClient {
  request(url: string, options?: RequestOptions): Promise<Response>;
}

// Concrete implementation
class FetchHttpClient implements HttpClient {
  async request(url: string, options?: RequestOptions): Promise<Response> {
    return fetch(url, options);
  }
}

// Decorator 1: Logging (wraps any HttpClient)
class LoggingHttpClient implements HttpClient {
  constructor(private inner: HttpClient) {}
  
  async request(url: string, options?: RequestOptions): Promise<Response> {
    const start = Date.now();
    console.log(`→ ${options?.method || 'GET'} ${url}`);
    
    try {
      const response = await this.inner.request(url, options);
      console.log(`← ${response.status} ${url} (${Date.now() - start}ms)`);
      return response;
    } catch (error) {
      console.error(`✗ FAILED ${url} (${Date.now() - start}ms):`, error);
      throw error;
    }
  }
}

// Decorator 2: Retry (wraps any HttpClient)
class RetryHttpClient implements HttpClient {
  constructor(
    private inner: HttpClient, 
    private maxRetries: number = 3
  ) {}
  
  async request(url: string, options?: RequestOptions): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.inner.request(url, options);
        if (response.status >= 500) throw new Error(`Server error: ${response.status}`);
        return response;
      } catch (error: any) {
        lastError = error;
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 100; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  }
}

// Decorator 3: Caching (wraps any HttpClient)
class CachingHttpClient implements HttpClient {
  private cache = new Map<string, { response: Response; expiry: number }>();
  
  constructor(private inner: HttpClient, private ttlMs: number = 60_000) {}
  
  async request(url: string, options?: RequestOptions): Promise<Response> {
    const method = options?.method || 'GET';
    if (method !== 'GET') return this.inner.request(url, options);
    
    const cached = this.cache.get(url);
    if (cached && cached.expiry > Date.now()) return cached.response.clone();
    
    const response = await this.inner.request(url, options);
    this.cache.set(url, { response: response.clone(), expiry: Date.now() + this.ttlMs });
    return response;
  }
}

// Compose decorators like layers of an onion:
// Cache → Retry → Logging → Fetch
const httpClient: HttpClient = 
  new CachingHttpClient(
    new RetryHttpClient(
      new LoggingHttpClient(
        new FetchHttpClient()
      ), 
      3  // retry 3 times
    ),
    60_000 // cache for 60 seconds
  );

// Every call now automatically gets: caching + retry + logging
const data = await httpClient.request('https://api.example.com/users');
```

### Pattern 5: Adapter — "Making Incompatible Things Work Together"

```typescript
/**
 * ADAPTER PATTERN
 * 
 * Convert the interface of a class into another interface
 * that clients expect. Lets classes work together that
 * couldn't otherwise because of incompatible interfaces.
 * 
 * USE WHEN: You're integrating a third-party library or
 * legacy system with a different interface than your code expects.
 * 
 * REAL EXAMPLES: Database drivers, payment gateway wrappers,
 * API version compatibility layers.
 */

// Your application's expected interface
interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

// Third-party Redis library has a DIFFERENT interface
class RedisClient {
  async GET(key: string): Promise<string | null> { /* ... */ return null; }
  async SET(key: string, value: string): Promise<void> { /* ... */ }
  async SETEX(key: string, seconds: number, value: string): Promise<void> { /* ... */ }
  async DEL(key: string): Promise<void> { /* ... */ }
}

// Third-party Memcached library has YET ANOTHER interface
class MemcachedClient {
  async fetch(key: string): Promise<{ value: string } | undefined> { return undefined; }
  async store(key: string, value: string, lifetime: number): Promise<void> { /* ... */ }
  async remove(key: string): Promise<void> { /* ... */ }
}

// Adapter: Redis → CacheStore
class RedisCacheAdapter implements CacheStore {
  constructor(private redis: RedisClient) {}
  
  async get(key: string): Promise<string | null> {
    return this.redis.GET(key);
  }
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.SETEX(key, ttlSeconds, value);
    } else {
      await this.redis.SET(key, value);
    }
  }
  async delete(key: string): Promise<void> {
    await this.redis.DEL(key);
  }
}

// Adapter: Memcached → CacheStore  
class MemcachedCacheAdapter implements CacheStore {
  constructor(private memcached: MemcachedClient) {}
  
  async get(key: string): Promise<string | null> {
    const result = await this.memcached.fetch(key);
    return result?.value || null;
  }
  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    await this.memcached.store(key, value, ttlSeconds);
  }
  async delete(key: string): Promise<void> {
    await this.memcached.remove(key);
  }
}

// Application code works with ANY cache — doesn't know or care
// which backend is used
class UserService {
  constructor(private cache: CacheStore) {} // ← Interface, not implementation

  async getUser(id: string): Promise<User> {
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return JSON.parse(cached);
    
    const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    await this.cache.set(`user:${id}`, JSON.stringify(user), 300);
    return user;
  }
}
```

### Pattern 6: Singleton — "One Instance, Global Access"

```typescript
/**
 * SINGLETON PATTERN
 * 
 * Ensure a class has only ONE instance and provide
 * a global point of access to it.
 * 
 * USE WHEN: You need exactly one instance of something
 * (database connection pool, config manager, logger).
 * 
 * ⚠️ WARNING: Singleton is often OVERUSED and considered
 * an anti-pattern because it:
 * - Creates hidden dependencies (hard to test)
 * - Makes mocking difficult
 * - Creates tight coupling
 * 
 * BETTER ALTERNATIVE: Dependency Injection (create once,
 * inject everywhere). Use Singleton sparingly.
 */

// TypeScript Singleton (thread-safe in Node.js — single-threaded)
class DatabasePool {
  private static instance: DatabasePool | null = null;
  private pool: Pool;

  private constructor(config: PoolConfig) {
    this.pool = new Pool(config);
    console.log('Database pool created (once)');
  }

  static getInstance(config?: PoolConfig): DatabasePool {
    if (!DatabasePool.instance) {
      if (!config) throw new Error('Config required for first initialization');
      DatabasePool.instance = new DatabasePool(config);
    }
    return DatabasePool.instance;
  }

  async query(sql: string, params?: any[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      return await client.query(sql, params);
    } finally {
      client.release(); // Always return connection to pool
    }
  }

  // For testing: allow resetting the singleton
  static resetForTesting(): void {
    DatabasePool.instance = null;
  }
}

// Modern alternative: Module-level singleton (simpler in Node.js/ES modules)
// Each module is cached after first import — naturally a singleton.

// db.ts
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  max: 20,
});

export const query = (sql: string, params?: any[]) => pool.query(sql, params);
// Every file that imports from 'db.ts' gets the SAME pool instance
```

---

## 6. Real World Applications 🌍

### Design Patterns in Production Codebases

| Pattern | Where You've Seen It | Framework/Library |
|---------|---------------------|-------------------|
| **Strategy** | `passport.use(new GoogleStrategy(...))` | Passport.js (Auth strategies) |
| **Observer** | `emitter.on('data', callback)` | Node.js EventEmitter |
| **Decorator** | `app.use(cors()); app.use(auth())` | Express.js Middleware |
| **Factory** | `React.createElement('div', props)` | React |
| **Adapter** | `mongoose` wrapping MongoDB driver | Mongoose ODM |
| **Singleton** | `mongoose.connection` (single pool) | Mongoose default connection |
| **Builder** | `query.select('*').from('users').where(...)` | Knex.js query builder |
| **Proxy** | `new Proxy(target, handler)` | ES6 Proxy (Vue.js reactivity) |
| **Iterator** | `for (const item of collection)` | ES6 Iterators / Generators |
| **Template Method** | React class components `componentDidMount` | React lifecycle |
| **Composite** | React component tree (`<App><Header/><Main/></App>`) | React |
| **Chain of Responsibility** | Express middleware chain | Express.js |

### When NOT to Use Patterns

| Anti-Pattern | Problem |
|--------------|---------|
| **Pattern for everything** | Over-engineering simple code with unnecessary abstractions |
| **Premature abstraction** | Creating Strategy pattern for ONE implementation |
| **Singleton abuse** | Using Singleton for everything → hidden dependencies, untestable |
| **Deep inheritance** | 5 levels of inheritance hierarchy → use composition instead |
| **Abstract-itis** | Interface → AbstractBase → ConcreteBase → Implementation → ???. Keep it simple. |

> **Rule of Three:** Don't abstract until you have THREE concrete cases. Two cases might be coincidence. Three is a pattern.

---

## 7. Complexity Analysis 🧠

### Pattern Selection Guide

```
"I need to swap algorithms at runtime"
  └──▶ Strategy Pattern

"I need to create objects without specifying exact classes"
  └──▶ Factory / Abstract Factory

"I need to notify multiple listeners of state changes"
  └──▶ Observer / Event Emitter

"I need to add behavior without modifying existing code"
  └──▶ Decorator (wrapping) or Strategy (swapping)

"I need to make an incompatible API work with my code"
  └──▶ Adapter

"I need exactly one instance of something"
  └──▶ Singleton (or better: module-level + DI)

"I need to construct complex objects step by step"
  └──▶ Builder

"I need to represent a tree structure uniformly"
  └──▶ Composite

"I need to cache/lazy-load/control access to an object"
  └──▶ Proxy

"I need to undo/redo operations"
  └──▶ Command + Memento

"I need to process a request through multiple handlers"
  └──▶ Chain of Responsibility (middleware pattern)
```

### SOLID Violation Detection Cheat Sheet

| Code Smell | Violated Principle | Fix |
|------------|-------------------|-----|
| Class has 500+ lines | **S** — Single Responsibility | Split into focused classes |
| `if/else` or `switch` on type | **O** — Open/Closed | Strategy or Factory pattern |
| Subclass breaks parent behavior | **L** — Liskov Substitution | Use composition + interfaces |
| Implement unused interface methods | **I** — Interface Segregation | Split into smaller interfaces |
| `new ConcreteClass()` inside another class | **D** — Dependency Inversion | Inject via constructor (DI) |

### Interview Tips 💡

1. **Don't name-drop patterns first.** Design the solution naturally, then say: *"This is essentially the Strategy pattern"* — it shows you think in solutions, not patterns.
2. **SOLID > GoF in interviews.** Interviewers care more about *why* your code is maintainable than whether you can name 23 patterns. Lead with SOLID principles.
3. **Composition over Inheritance.** If the interviewer sees you reach for `extends`, explain why. 90% of the time, composition (using interfaces + constructor injection) is better.
4. **Know when NOT to use patterns.** "I wouldn't add a Strategy interface here because we only have one implementation. If we add a second, I'd refactor then." This shows *engineering judgment*, not just pattern knowledge.
5. **The Rule of Three.** "I wait for three concrete use cases before abstracting. Two cases might be coincidence."
6. **Decorator = Middleware.** When asked about middleware, explain it as the Decorator pattern: `logging(auth(rateLimit(handler)))`. Each wrapper adds behavior without modifying the handler.
7. **Factory for testing.** "I use Factory methods so that in tests, I can create objects with test-specific defaults instead of repeating constructor arguments."
