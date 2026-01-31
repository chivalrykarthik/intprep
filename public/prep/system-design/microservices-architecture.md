# Microservices Architecture 🏗️

## 1. The "Food Court" Analogy

Imagine a **giant restaurant** vs a **food court**.

**Monolith (Giant Restaurant):**
- One kitchen handles: Pizza, Sushi, Burgers, Salads.
- If the pizza oven breaks, the ENTIRE restaurant closes.
- Adding Thai food? Renovate the whole kitchen.

**Microservices (Food Court):**
- Separate stalls: Pizza Place, Sushi Bar, Burger Joint.
- Pizza oven breaks? Only pizza is unavailable. Others keep serving.
- Adding Thai food? Just open a new stall.

**This is Microservices.** Break your application into small, independent services that can be developed, deployed, and scaled independently.

---

## 2. The Core Concept

**Monolith (Simple but Limiting):**
Everything in one codebase, one deployment.

**Microservices (Complex but Scalable):**
1. **Single Responsibility:** Each service does one thing well.
2. **Independent Deployment:** Deploy pizza service without touching sushi.
3. **Technology Freedom:** Pizza uses Node.js, Sushi uses Go.
4. **Fault Isolation:** One service down ≠ system down.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Microservices visualizer coming soon!"
}
```

---

## 4. Scenario A: Service Communication

### TypeScript Implementation

```typescript
/**
 * Synchronous Communication (REST/gRPC)
 * @pros Simple, request-response
 * @cons Tight coupling, cascading failures
 */
async function getOrderWithUser(orderId: string) {
  const order = await fetch(`/order-service/orders/${orderId}`);
  const user = await fetch(`/user-service/users/${order.userId}`);
  return { order, user };
}

/**
 * Asynchronous Communication (Message Queue)
 * @pros Loose coupling, resilient
 * @cons Eventually consistent, complex debugging
 */
interface OrderEvent {
  type: 'ORDER_CREATED';
  orderId: string;
  userId: string;
}

// Producer (Order Service)
function publishOrderCreated(order: Order) {
  messageQueue.publish('orders', {
    type: 'ORDER_CREATED',
    orderId: order.id,
    userId: order.userId
  });
}

// Consumer (Notification Service)
messageQueue.subscribe('orders', (event: OrderEvent) => {
  if (event.type === 'ORDER_CREATED') {
    sendEmail(event.userId, 'Order confirmed!');
  }
});
```

---

## 5. Scenario B: Service Discovery & Circuit Breaker

### TypeScript Implementation

```typescript
/**
 * Circuit Breaker Pattern
 * Prevents cascading failures when a service is down.
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailure: Date | null = null;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 30000
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure!.getTime() > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = new Date();
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

---

## 6. Real World Applications 🌍

### 1. 📺 Netflix
1000+ microservices. Each can be deployed independently.

### 2. 🛒 Amazon
Two-pizza teams: If a team can't be fed by two pizzas, it's too big.

### 3. 🎵 Spotify
Squads own services end-to-end.

---

## 7. Complexity Analysis 🧠

### Monolith vs Microservices

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Deployment | All or nothing | Independent |
| Scaling | Entire app | Per service |
| Complexity | Low (at start) | High |
| Team Size | Any | Large teams |

### Interview Tips 💡
1. "Start with monolith, extract services when needed."
2. "Each service should have its own database."
3. "Use async communication for loose coupling."
