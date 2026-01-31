# Message Queues 📨

## 1. The "Post Office" Analogy

Imagine you need to send an important package across the country.

**Direct Delivery (Synchronous):**
- You personally drive 500 miles to the recipient.
- You wait at their door until they're home.
- If they're not home? You wait. And wait. Trip wasted.
- **Problem:** Your entire day is blocked.

**Post Office (Asynchronous):**
- You drop your package at the post office.
- They handle routing, tracking, and delivery.
- You continue your day immediately.
- Package delivered while you're doing other things.
- If recipient isn't home? Package waits safely. No data loss.

**This is Message Queuing.** Decoupling producers (senders) from consumers (receivers) for reliability, scalability, and resilience.

---

## 2. The Core Concept

In system design interviews, message queues are essential for building scalable, fault-tolerant systems.

**Synchronous (Risky/Fragile):**
```
Order Service ──directly calls──► Payment Service ──calls──► Inventory Service
```
- If Payment Service is down → Order fails
- If Inventory is slow → Everything waits
- Cascading failures bring down the entire system

**Asynchronous (Resilient/Scalable):**
```
Order Service ──publishes──► [Queue] ◄──consumes── Payment Service
                              [Queue] ◄──consumes── Inventory Service
                              [Queue] ◄──consumes── Notification Service
```
- Payment down? Messages queue up. Processed when it recovers.
- Traffic spike? Add more consumers.
- No data loss, no cascading failures.
- **Boom.** Loosely coupled, independently scalable.

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                    MESSAGE QUEUE PATTERNS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POINT-TO-POINT                  PUBLISH/SUBSCRIBE              │
│  ═══════════════                 ═════════════════              │
│                                                                 │
│  ┌──────────┐                    ┌──────────┐                   │
│  │ Producer │                    │Publisher │                   │
│  └────┬─────┘                    └────┬─────┘                   │
│       │                               │                         │
│       ▼                               ▼                         │
│  ┌──────────┐                    ┌──────────┐                   │
│  │  QUEUE   │                    │  TOPIC   │                   │
│  │ [1][2][3]│                    │  (Fan)   │                   │
│  └────┬─────┘                    └────┬─────┘                   │
│       │                          ┌────┼────┐                    │
│       ▼                          ▼    ▼    ▼                    │
│  ┌──────────┐               ┌────┐ ┌────┐ ┌────┐                │
│  │ Consumer │               │Sub1│ │Sub2│ │Sub3│                │
│  └──────────┘               └────┘ └────┘ └────┘                │
│                                                                 │
│  One consumer gets           ALL subscribers get                │
│  each message                each message                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Messaging Patterns

**Real-Life Scenario:** You're designing an e-commerce order system that triggers multiple downstream processes.

**Technical Problem:** Choose the right messaging pattern for each use case.

### TypeScript Implementation

```typescript
/**
 * PATTERN 1: Point-to-Point Queue (Work Queue / Task Queue)
 * 
 * One message → One consumer (competing consumers)
 * Use case: Task distribution, background jobs
 * 
 * @example Order processing, image resizing, report generation
 */
interface Task {
  id: string;
  type: 'send_email' | 'resize_image' | 'generate_report' | 'process_payment';
  payload: Record<string, unknown>;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  createdAt: Date;
}

// Producer: Enqueue tasks
class TaskProducer {
  constructor(private queue: MessageQueue) {}

  async enqueueEmailTask(to: string, subject: string, body: string): Promise<void> {
    const task: Task = {
      id: crypto.randomUUID(),
      type: 'send_email',
      payload: { to, subject, body },
      priority: 'normal',
      retryCount: 0,
      createdAt: new Date(),
    };
    
    await this.queue.push('email_tasks', task);
    console.log(`Enqueued email task: ${task.id}`);
  }
}

// Consumer: Process tasks (multiple workers competing for tasks)
class TaskWorker {
  constructor(private queue: MessageQueue) {}

  async startProcessing(): Promise<void> {
    while (true) {
      const task = await this.queue.pop('email_tasks');
      
      try {
        await this.processTask(task);
        await this.queue.acknowledge(task.id);
      } catch (error) {
        await this.handleFailure(task, error);
      }
    }
  }

  private async processTask(task: Task): Promise<void> {
    switch (task.type) {
      case 'send_email':
        await this.sendEmail(task.payload);
        break;
      case 'resize_image':
        await this.resizeImage(task.payload);
        break;
    }
  }

  private async handleFailure(task: Task, error: Error): Promise<void> {
    if (task.retryCount < 3) {
      // Retry with exponential backoff
      task.retryCount++;
      const delay = Math.pow(2, task.retryCount) * 1000;
      await this.queue.pushDelayed('email_tasks', task, delay);
    } else {
      // Move to Dead Letter Queue
      await this.queue.push('email_tasks_dlq', { task, error: error.message });
    }
  }
}

/**
 * PATTERN 2: Pub/Sub (Publish-Subscribe / Fan-out)
 * 
 * One message → Multiple subscribers (all receive a copy)
 * Use case: Event broadcasting, notifications, data sync
 * 
 * @example Order created → Email service, Analytics, Warehouse, Fraud detection
 */
interface OrderEvent {
  eventType: 'ORDER_CREATED' | 'ORDER_PAID' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED';
  orderId: string;
  customerId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  total: number;
  timestamp: Date;
}

// Publisher: Emit events
class OrderEventPublisher {
  constructor(private pubsub: PubSubClient) {}

  async publishOrderCreated(order: Order): Promise<void> {
    const event: OrderEvent = {
      eventType: 'ORDER_CREATED',
      orderId: order.id,
      customerId: order.customerId,
      items: order.items,
      total: order.total,
      timestamp: new Date(),
    };

    // Publish to topic - all subscribers receive the event
    await this.pubsub.publish('order_events', event);
  }
}

// Subscribers: Each gets a copy of every message
class EmailNotificationSubscriber {
  constructor(private pubsub: PubSubClient) {
    this.pubsub.subscribe('order_events', this.handleEvent.bind(this));
  }

  private async handleEvent(event: OrderEvent): Promise<void> {
    if (event.eventType === 'ORDER_CREATED') {
      await sendOrderConfirmationEmail(event.customerId, event.orderId);
    }
  }
}

class AnalyticsSubscriber {
  constructor(private pubsub: PubSubClient) {
    this.pubsub.subscribe('order_events', this.handleEvent.bind(this));
  }

  private async handleEvent(event: OrderEvent): Promise<void> {
    await trackOrderEvent(event);
    await updateDashboard(event);
  }
}

class InventorySubscriber {
  constructor(private pubsub: PubSubClient) {
    this.pubsub.subscribe('order_events', this.handleEvent.bind(this));
  }

  private async handleEvent(event: OrderEvent): Promise<void> {
    if (event.eventType === 'ORDER_CREATED') {
      for (const item of event.items) {
        await reserveInventory(item.productId, item.quantity);
      }
    }
  }
}
```

### Pattern Comparison

| Pattern | Messages | Consumers | Use Case |
|---------|----------|-----------|----------|
| **Point-to-Point** | Each processed once | Competing | Task distribution |
| **Pub/Sub** | Each delivered to all | Independent | Event broadcasting |
| **Request-Reply** | Response expected | Specific | RPC over queue |
| **Saga** | Orchestrated steps | Coordinated | Distributed transactions |

---

## 5. Scenario B: Delivery Guarantees & Idempotency

**Real-Life Scenario:** Your payment processing must never lose messages OR double-charge customers.

**Technical Problem:** Implement reliable message delivery with exactly-once semantics (or at-least-once with idempotency).

### TypeScript Implementation

```typescript
/**
 * DELIVERY GUARANTEES
 * 
 * | Guarantee     | Risk            | Performance | Use Case                |
 * |---------------|-----------------|-------------|-------------------------|
 * | At-most-once  | May LOSE msgs   | Fastest     | Logs, metrics           |
 * | At-least-once | May DUPLICATE   | Medium      | Most apps               |
 * | Exactly-once  | No loss/dups    | Slowest     | Financial transactions  |
 */

/**
 * At-Most-Once Delivery
 * Fire and forget. No acknowledgment.
 * 
 * @useCase Non-critical logging, analytics events
 */
class AtMostOnceProducer {
  async send(message: any): Promise<void> {
    try {
      await this.queue.push('logs', message);
      // No waiting for acknowledgment
    } catch (error) {
      // Log and move on - message may be lost
      console.error('Failed to send, moving on:', error);
    }
  }
}

/**
 * At-Least-Once Delivery with Idempotent Consumer
 * 
 * Producer retries until acknowledged.
 * Consumer handles duplicates gracefully.
 * 
 * @useCase Most applications - order processing, notifications
 */
class IdempotentPaymentProcessor {
  private processedTransactions = new Set<string>();
  private transactionStore: TransactionStore;

  constructor(private queue: MessageQueue) {}

  async processMessage(message: PaymentMessage): Promise<void> {
    const idempotencyKey = message.transactionId;

    // Check if already processed (in memory + database)
    if (this.processedTransactions.has(idempotencyKey)) {
      console.log(`Duplicate detected (memory): ${idempotencyKey}, skipping`);
      return;
    }

    // Check database for persistence across restarts
    const existingTx = await this.transactionStore.findById(idempotencyKey);
    if (existingTx) {
      console.log(`Duplicate detected (DB): ${idempotencyKey}, skipping`);
      this.processedTransactions.add(idempotencyKey);
      return;
    }

    // Process the payment
    try {
      // Use database transaction to ensure atomicity
      await this.transactionStore.runInTransaction(async (tx) => {
        // 1. Record that we're processing this transaction
        await tx.insert('processed_transactions', {
          id: idempotencyKey,
          status: 'processing',
          createdAt: new Date(),
        });

        // 2. Actually process the payment
        await this.chargeCustomer(message);

        // 3. Update status to completed
        await tx.update('processed_transactions', idempotencyKey, {
          status: 'completed',
          completedAt: new Date(),
        });
      });

      this.processedTransactions.add(idempotencyKey);
    } catch (error) {
      // If processing failed, remove from processed set
      // Next retry will reprocess
      throw error;
    }
  }

  private async chargeCustomer(message: PaymentMessage): Promise<void> {
    // Call payment gateway
    await paymentGateway.charge(message.customerId, message.amount);
  }
}

/**
 * Exactly-Once with Transactional Outbox Pattern
 * 
 * Ensures message is sent if and only if database transaction commits.
 * 
 * @useCase Financial transactions, critical event sourcing
 */
class TransactionalOutbox {
  /**
   * Instead of:
   *   1. Save to DB
   *   2. Send to queue (might fail, data inconsistent!)
   * 
   * We do:
   *   1. Save to DB + Save to outbox table (same transaction)
   *   2. Background worker reads outbox and sends to queue
   *   3. Worker marks as sent after successful publish
   */
  async createOrderWithEvent(orderData: OrderData): Promise<Order> {
    return await this.db.transaction(async (tx) => {
      // 1. Create the order
      const order = await tx.insert('orders', orderData);

      // 2. Write event to outbox (same transaction!)
      await tx.insert('outbox', {
        id: crypto.randomUUID(),
        aggregateType: 'Order',
        aggregateId: order.id,
        eventType: 'OrderCreated',
        payload: JSON.stringify(order),
        createdAt: new Date(),
        processedAt: null,
      });

      return order;
    });
    // Transaction commits atomically
    // Either BOTH order and outbox entry exist, or NEITHER
  }
}

// Background worker polls outbox and publishes
class OutboxProcessor {
  async processOutbox(): Promise<void> {
    while (true) {
      const events = await this.db.query(`
        SELECT * FROM outbox 
        WHERE processedAt IS NULL 
        ORDER BY createdAt 
        LIMIT 100
      `);

      for (const event of events) {
        try {
          await this.queue.publish(event.eventType, JSON.parse(event.payload));
          await this.db.update('outbox', event.id, { processedAt: new Date() });
        } catch (error) {
          // Will retry on next poll
          console.error(`Failed to process outbox event ${event.id}`, error);
        }
      }

      await sleep(1000); // Poll every second
    }
  }
}
```

---

## 6. Real World Applications 🌍

### 1. 📧 SendGrid/Mailgun - Email Delivery

**Queue:** SQS + custom processing
**Pattern:** Work queue with retry and DLQ
- Emails queued for sending
- Workers process at controlled rate (prevent IP blacklisting)
- Failures go to Dead Letter Queue for manual review

### 2. 📊 LinkedIn - Kafka for Activity Feed

**Queue:** Apache Kafka
**Scale:** 7 trillion messages per day
**Pattern:** Event sourcing + pub/sub
- Every action (like, comment, share) is an event
- Multiple consumers: feed generation, notifications, analytics, search indexing

### 3. 🛒 Amazon - SQS for Order Processing

**Queue:** Amazon SQS
**Pattern:** Work queue with visibility timeout
- Order placed → SQS → Payment processor
- If processor crashes, message becomes visible again (reprocessed)
- DLQ for poisonous messages

### 4. 🎮 Discord - Real-time Messaging

**Queue:** Custom + Erlang/Elixir
**Pattern:** Pub/Sub with presence
- Messages broadcast to all channel subscribers
- Typing indicators, online status via pub/sub

---

## 7. Complexity Analysis 🧠

### Queue Technology Comparison

| Queue | Throughput | Ordering | Persistence | Use Case |
|-------|------------|----------|-------------|----------|
| **Kafka** | 1M+/sec | Partition-ordered | ✓ Disk | Event streaming, logs |
| **RabbitMQ** | 100K/sec | Queue-ordered | ✓ | Task queues, RPC |
| **Amazon SQS** | 300K/sec | Best-effort | ✓ | AWS integration |
| **Redis Streams** | 500K/sec | Per-stream | ✓ | Real-time, lightweight |
| **NATS** | 10M+/sec | None | Optional | Microservices, IoT |

### Kafka Architecture Deep Dive

```
┌──────────────────────────────────────────────────────────────┐
│                     KAFKA CLUSTER                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Topic: "order-events"                                       │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │ Partition 0 │ Partition 1 │ Partition 2 │ Partition 3 │   │
│  │ (user_id%4=0)│(user_id%4=1)│(user_id%4=2)│(user_id%4=3)│  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
│        │             │             │             │           │
│        ▼             ▼             ▼             ▼           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Consumer Group: "payment-service"          │  │
│  │   Consumer 1    Consumer 2    Consumer 3    Consumer 4  │  │
│  │   (Part 0)      (Part 1)      (Part 2)      (Part 3)    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Consumer Group: "analytics-service"        │  │
│  │   Consumer A    Consumer B                              │  │
│  │   (Part 0,1)    (Part 2,3)                             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Key Concepts:
- Partition = unit of ordering (messages within a partition are ordered)
- Consumer Group = logical subscriber (each message delivered once per group)
- Multiple groups = pub/sub (each group gets all messages)
```

### Interview Tips 💡

1. **Know when to use queues:** "Decouple services, handle traffic spikes, ensure reliability."
2. **Discuss Dead Letter Queues:** "DLQ for messages that repeatedly fail processing."
3. **Understand ordering:** "Kafka orders within partitions, partition by key for ordering."
4. **Mention idempotency:** "At-least-once delivery requires idempotent consumers."
5. **Backpressure:** "Rate limit consumers or use circuit breakers for downstream services."
6. **Monitoring:** "Track queue depth, processing latency, DLQ size."
