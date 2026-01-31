# Distributed Transactions 🤝

## 1. The "Starbucks Order" Analogy

Imagine ordering a complex coffee while buying a pastry:
1.  **Register:** You pay for both.
2.  **Beverage Station:** Barista starts your Latte.
3.  **Food Station:** Partner warms your Croissant.

**The Transaction Problem:**
-   **Atomic:** You want *both* or *neither*. You don't want to pay if they are out of milk.
-   **Distributed:** The Register, Espresso Machine, and Oven are separate "services".

**Approaches:**
-   **2PC (Two-Phase Commit):** The manager shouts "FREEZE!" Everyone pauses. "Do we have milk? Do we have croissants? Okay, UNFREEZE and serve." (Slow, blocks everyone).
-   **Saga (Choreography):**
    -   Register: "Paid! Order #123."
    -   Barista: "I see Order #123. Making Latte... Oops, out of milk! Publishing 'Coffee Failed' event."
    -   Register: "I see 'Coffee Failed'. refunding money."
    -   Food Station: "I see 'Coffee Failed'. Canceling croissant."

**This is a Distributed Transaction.** Ensuring data consistency across multiple microservices where standard ACID database transactions don't exist.

---

## 2. The Core Concept

In a Monolith, you have `BEGIN TRANSACTION ... COMMIT`. In Microservices, you have unrelated databases. You cannot lock them all at once without killing performance (CAP theorem).

### The Two Main Solutions

| Feature | Two-Phase Commit (2PC) | Saga Pattern |
| :--- | :--- | :--- |
| **Type** | Strong Consistency (ACID) | Eventual Consistency (BASE) |
| **Mechanism** | Voting (Prepare -> Commit) | Sequence of local transactions |
| **Blocking** | Yes (Locks resources) | No (Asynchronous) |
| **Failure** | Rollback on any No vote | Compensating Transactions (Undo) |
| **Scalability** | Poor | High |
| **Use Case** | Banks (money transfer) | E-commerce, booking systems |

### Saga Implementation Styles
1.  **Choreography (Events):** Services talk to each other via events. No central coordinator.
    *   *Pros:* Simple, loose coupling.
    *   *Cons:* Hard to track complex flows (cyclic dependencies).
2.  **Orchestration (Command):** Central "Conductor" service tells others what to do.
    *   *Pros:* Central logic, easy to track state.
    *   *Cons:* Single point of failure (if not HA), tighter coupling.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "sequence-diagram",
  "content": "participant P as Payment\nparticipant S as Stock\nparticipant D as Delivery\n\nNote over P,S: Core Transaction Flow (Saga)\n\nP->S: Order Paid (Event)\nNote right of S: Local TX: Reserve Item\nS->D: Item Reserved (Event)\nNote right of D: Local TX: Schedule Delivery\nD-->P: Delivery Scheduled (Success)\n\nNote over P,S: Compensation Flow (Failure)\n\nP->S: Order Paid\nS->D: Item Reserved\nD-->S: Delivery Failed! (Event)\nNote left of S: COMPENSATING TX: Un-reserve Item\nS-->P: Item Un-reserved\nP-->User: Refund Issued"
}
```

---

## 4. Scenario A: Saga - Choreography (Event-Driven)

**Real-Life Scenario:** An e-commerce order system. Using Events to drive the flow.
**Technical Problem:** Implement a non-blocking transaction flow where `Order` -> `Inventory` -> `Payment`.

### TypeScript Implementation

```typescript
/**
 * SAGA PATTERN - CHOREOGRAPHY
 * 
 * Services listen to events and perform local transactions.
 * If a step fails, a "Compensation Event" is fired to undo previous steps.
 */

// 1. Events Definition
type OrderCreated = { type: 'ORDER_CREATED'; orderId: string; amount: number };
type InventoryReserved = { type: 'INVENTORY_RESERVED'; orderId: string };
type PaymentProcessed = { type: 'PAYMENT_PROCESSED'; orderId: string };
type PaymentFailed = { type: 'PAYMENT_FAILED'; orderId: string; reason: string };
type InventoryFailed = { type: 'INVENTORY_FAILED'; orderId: string };

// 2. Integration Bus (Mock)
class EventBus {
  listeners: Record<string, Function[]> = {};
  publish(event: any) {
    console.log(`[BUS] Published: ${event.type} for ${event.orderId}`);
    (this.listeners[event.type] || []).forEach(fn => fn(event));
  }
  subscribe(type: string, fn: Function) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(fn);
  }
}

// 3. Services

class OrderService {
  constructor(private bus: EventBus) {
    // Listen for failures to trigger compensations (Rollbacks)
    bus.subscribe('INVENTORY_FAILED', this.handleFailure.bind(this));
    bus.subscribe('PAYMENT_FAILED', this.handleFailure.bind(this));
  }

  createOrder(orderId: string, amount: number) {
    console.log(`[Order] Created ${orderId}. Status: PENDING`);
    // Start the Saga
    this.bus.publish({ type: 'ORDER_CREATED', orderId, amount });
  }

  handleFailure(event: any) {
    console.log(`[Order] Received failure: ${event.type}. CANCELLING Order ${event.orderId}`);
    // Local Transaction: Update DB to 'CANCELLED'
  }
}

class InventoryService {
  constructor(private bus: EventBus) {
    bus.subscribe('ORDER_CREATED', this.reserveStock.bind(this));
    bus.subscribe('PAYMENT_FAILED', this.compensate.bind(this)); // Compensation Listener
  }

  reserveStock(event: OrderCreated) {
    const hasStock = Math.random() > 0.2; // 80% success rate
    
    if (hasStock) {
      console.log(`[Inventory] Reserved stock for ${event.orderId}`);
      this.bus.publish({ type: 'INVENTORY_RESERVED', orderId: event.orderId });
    } else {
      console.error(`[Inventory] Out of stock!`);
      this.bus.publish({ type: 'INVENTORY_FAILED', orderId: event.orderId });
    }
  }

  compensate(event: PaymentFailed) {
    console.log(`[Inventory] COMPENSATING: Releasing stock for ${event.orderId} due to payment failure.`);
  }
}

class PaymentService {
  constructor(private bus: EventBus) {
    bus.subscribe('INVENTORY_RESERVED', this.processPayment.bind(this));
  }

  processPayment(event: InventoryReserved) {
    const success = Math.random() > 0.2; 

    if (success) {
      console.log(`[Payment] Charged card for ${event.orderId}`);
      this.bus.publish({ type: 'PAYMENT_PROCESSED', orderId: event.orderId });
    } else {
      console.error(`[Payment] Card declined!`);
      this.bus.publish({ type: 'PAYMENT_FAILED', orderId: event.orderId });
      // This failure triggers Inventory.compensate and Order.handleFailure
    }
  }
}

// 4. Execution
const bus = new EventBus();
new OrderService(bus);
new InventoryService(bus);
new PaymentService(bus);

console.log('--- Case 1: Success Flow ---');
// bus.publish triggers the chain
// Order -> Inventory -> Payment -> Done

console.log('--- Case 2: Failure Flow ---');
// Simulating failure would show:
// Order -> Inventory (Success) -> Payment (Fail) -> Inventory (Compensate) -> Order (Cancel)
```

---

## 5. Scenario B: 2PC (Two-Phase Commit)

**Real-Life Scenario:** A banking system transfer where MONEY MUST NOT be created or destroyed.
**Technical Problem:** Ensure strong consistency across two database shards.

### Two-Phase Concept (Logical Flow)

**Phase 1: Prepare (Voting)**
The Coordinator asks all participants: "Can you commit?"
1.  **Account A (Debit):** Checks balance. Locks row. Says "YES".
2.  **Account B (Credit):** Checks validity. Locks row. Says "YES".

**Phase 2: Commit (Action)**
If everyone voted YES:
1.  Coordinator sends "COMMIT".
2.  A and B apply changes and release locks.

If *anyone* voted NO or timed out:
1.  Coordinator sends "ABORT".
2.  Participants roll back and release locks.

**Why is this hated in Microservices?**
*   **Blocking:** If the coordinator crashes after Phase 1, Resources A and B remain LOCKED indefinitely.
*   **Throughput:** Throughput is limited by the slowest node.

---

## 6. Real World Applications 🌍

### 1. 🛫 Travel Booking (Expedia/Uber)
**Pattern:** Saga (Orchestration)
*   **Flow:** Book Flight -> Book Hotel -> Book Car.
*   **Process:** If "Book Car" fails, the orchestrator triggers "Cancel Hotel" and "Cancel Flight".
*   **Why Not 2PC?** Airline systems and Hotel systems are third-party APIs. You *cannot* lock their databases. You can only request a refund (Compensation).

### 2. 💰 Bank Transfers (Internal)
**Pattern:** 2PC / XA Transactions
*   **Context:** Moving money between ledgers *within* the same bank infrastructure.
*   **Why?** Strict regulatory requirement for consistency.
*   **Optimization:** Often implemented at the Database Layer (e.g., Oracle Tuxedo, Postgres Prepared Transactions).

### 3. 📦 Amazon Fulfillment
**Pattern:** Saga (Choreography)
*   **Flow:** Order Placed -> Warehouse Robot Assigned -> Item Picked -> Packaging -> Shipping Label.
*   **Why?** Massive scale. If a robot breaks, you don't roll back the customer's credit card charge immediately; you just assign a different robot (Retry) or delay the shipment.

---

## 7. Complexity Analysis 🧠

### Saga Consistency: ACD (No I)
Sagas lack **Isolation**.
*   **Problem:** "Dirty Reads". Between transaction 1 and 2, the system is in an inconsistent state (e.g., Inventory reserved but not paid).
*   **Solution:** semantic locking or "Pending" states (e.g., `ORDER_STATUS = 'ORDER_PENDING_PAYMENT'`).

### Comparison Table

| Pattern | Complexity | Latency | Consistency | Scalability |
| :--- | :--- | :--- | :--- | :--- |
| **Monolith TX** | Low | Very Low | Strong (ACID) | Low |
| **2PC** | High | High | Strong (ACID) | Very Low |
| **Saga (Choreo)** | Medium | Medium | Eventual | High |
| **Saga (Orch)** | High | Medium | Eventual | High |

### Interview Tips 💡
1.  **Default to Saga:** In 99% of System Design interviews, Saga is the correct answer for microservices.
2.  **Mention Compensation:** Always explain what happens when it *fails*. "If payment fails, we issue a refund command."
3.  **Idempotency:** "Since we use message queues, messages might be delivered twice. Our consumers must be idempotent."
4.  **The "Outbox Pattern":** How do you atomically update DB *and* publish an event? "We write the event to an 'Outbox' table in the same DB transaction, then a background worker pushes it to Kafka."
