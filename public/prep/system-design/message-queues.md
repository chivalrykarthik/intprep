# Message Queues 📨

## 1. The "Post Office" Analogy

Imagine sending a package:
- **Direct Delivery (Synchronous):** You personally drive to the recipient. Wait until they're home. Slow.
- **Post Office (Asynchronous):** Drop package at post office. They handle delivery. You continue your day.

**This is Message Queuing.** Decouple producers and consumers for reliability and scalability.

---

## 2. The Core Concept

**Synchronous (Risky):**
Order Service → directly calls → Payment Service
If Payment is down, Order fails.

**Asynchronous (Resilient):**
Order Service → publishes to Queue → Payment Service consumes
If Payment is down, messages wait. No data loss.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Message Queue visualizer coming soon!"
}
```

---

## 4. Scenario A: Queue Patterns

### TypeScript Implementation

```typescript
/**
 * Point-to-Point Queue (Work Queue)
 * One message → One consumer
 * Use: Task distribution
 */
interface Task {
  id: string;
  type: 'email' | 'resize_image' | 'generate_report';
  payload: Record<string, unknown>;
}

// Producer
function enqueueTask(task: Task) {
  queue.push('tasks', task);
}

// Multiple consumers compete for tasks
function processTask(task: Task) {
  switch (task.type) {
    case 'email': sendEmail(task.payload); break;
    case 'resize_image': resizeImage(task.payload); break;
  }
}

/**
 * Pub/Sub (Fan-out)
 * One message → Multiple subscribers
 * Use: Notifications, event broadcasting
 */
interface OrderEvent {
  orderId: string;
  customerId: string;
  total: number;
}

// Publisher
pubsub.publish('order_created', orderEvent);

// Multiple subscribers receive same event
pubsub.subscribe('order_created', (e) => sendEmail(e));
pubsub.subscribe('order_created', (e) => updateAnalytics(e));
pubsub.subscribe('order_created', (e) => notifyWarehouse(e));
```

---

## 5. Scenario B: Delivery Guarantees

### Comparison

| Guarantee | Description | Use Case |
|-----------|-------------|----------|
| At-most-once | May lose messages | Logs, metrics |
| At-least-once | May duplicate | Most apps (with idempotency) |
| Exactly-once | No loss, no duplicates | Financial transactions |

```typescript
/**
 * Idempotent Consumer
 * Handle duplicates gracefully
 */
const processedIds = new Set<string>();

function processOrderIdempotent(event: OrderEvent) {
  if (processedIds.has(event.orderId)) {
    console.log('Already processed, skipping');
    return;
  }
  
  // Process the order
  processOrder(event);
  processedIds.add(event.orderId);
}
```

---

## 6. Real World Applications 🌍

### 1. 📧 Email Services - SQS
Deferred sending with retry logic.

### 2. 📊 Log Aggregation - Kafka
Collect logs from thousands of servers.

### 3. 🛒 E-commerce - RabbitMQ
Order processing, inventory updates.

---

## 7. Complexity Analysis 🧠

| Queue | Throughput | Ordering | Use Case |
|-------|------------|----------|----------|
| Kafka | Very High | Partition-ordered | Event streaming |
| RabbitMQ | High | Queue-ordered | Task queues |
| SQS | High | Best-effort | AWS integration |

### Interview Tips 💡
1. "Dead letter queues for failed messages"
2. "Partition by key for ordering (Kafka)"
3. "Backpressure handling is critical"
