# Microservices Architecture 🏗️

## 1. The "Food Court vs Restaurant" Analogy

Imagine you want to open a food business.

**Monolith (Giant Restaurant):**
- One massive kitchen handles: Pizza, Sushi, Burgers, Salads, Desserts.
- One chef calls in sick? Entire kitchen is understaffed.
- Pizza oven breaks? Restaurant closes while you fix it.
- Want to add Thai food? Renovate the entire kitchen.
- Night shift cook spills sauce on the grill? Everything smells like pizza-sushi-burgers.

**Microservices (Food Court):**
- Separate stalls: 🍕 Pizza Place, 🍣 Sushi Bar, 🍔 Burger Joint, 🥗 Salad Station.
- Pizza oven breaks? Only pizza is unavailable. Others keep serving.
- Sushi bar gets popular? Clone that stall, not the entire food court.
- Adding Thai food? Open a new stall. Zero impact on existing ones.
- Each stall has its own recipe book, inventory, and staff.

**This is Microservices Architecture.** Breaking your application into small, independent services that can be developed, deployed, and scaled independently.

---

## 2. The Core Concept

In system design interviews, understanding when and how to use microservices is essential for senior roles.

**Monolith (Simple but Limiting):**
- Everything in one codebase, one deployment
- Easy to start, hard to scale
- One bad deploy affects everything
- Technology locked (everyone uses same language/framework)

**Microservices (Complex but Powerful):**
1. **Single Responsibility:** Each service does ONE thing well
2. **Independent Deployment:** Deploy payment service without touching orders
3. **Technology Freedom:** Payments uses Go for speed, ML uses Python
4. **Fault Isolation:** Payment service crash ≠ entire system down
5. **Independent Scaling:** Scale only the services under load
- **BUT:** Network complexity, distributed debugging, operational overhead

**When to use Microservices?**
- Team size > 20-30 engineers
- Need independent deployments
- Different scaling requirements per component
- Clear domain boundaries exist

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                 MICROSERVICES ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      ┌─────────────┐                            │
│                      │ API Gateway │                            │
│                      └──────┬──────┘                            │
│            ┌────────────────┼────────────────┐                  │
│            ▼                ▼                ▼                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│   │   User      │  │   Order     │  │  Payment    │             │
│   │   Service   │  │   Service   │  │  Service    │             │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│          │                │                │                    │
│          ▼                ▼                ▼                    │
│      ┌──────┐         ┌──────┐         ┌──────┐                 │
│      │ DB 1 │         │ DB 2 │         │ DB 3 │                 │
│      └──────┘         └──────┘         └──────┘                 │
│                                                                 │
│  ──────── Message Bus (Kafka/RabbitMQ) ────────                 │
│                                                                 │
│  ✓ Independent deployment    ✓ Technology diversity             │
│  ✓ Fault isolation           ✗ Network complexity               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Service Communication Patterns

**Real-Life Scenario:** You're breaking a monolith e-commerce app into microservices.

**Technical Problem:** Design communication patterns between services.

### TypeScript Implementation

```typescript
/**
 * PATTERN 1: Synchronous Communication (Request-Reply)
 * 
 * HTTP/REST or gRPC calls
 * 
 * @pros Simple, immediate response, familiar
 * @cons Tight coupling, cascading failures, latency adds up
 * 
 * Use when: Need immediate response (checkout flow)
 */
interface OrderService {
  async createOrder(items: Item[]): Promise<Order> {
    // Synchronous call to User Service
    const user = await fetch('http://user-service/users/current');
    
    // Synchronous call to Inventory Service
    const available = await fetch('http://inventory-service/check', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    
    if (!available.ok) {
      throw new Error('Items not available');
    }
    
    // Synchronous call to Payment Service
    const payment = await fetch('http://payment-service/charge', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id, amount: total }),
    });
    
    return { orderId, status: 'created' };
  }
}

// Problems with synchronous calls:
// - If Payment Service is slow → entire checkout is slow
// - If Inventory Service is down → checkout fails
// - Each hop adds latency: 50ms + 30ms + 100ms = 180ms minimum

/**
 * PATTERN 2: Asynchronous Communication (Event-Driven)
 * 
 * Message queues / Event bus
 * 
 * @pros Loose coupling, resilient, scalable
 * @cons Eventual consistency, complex debugging
 * 
 * Use when: Don't need immediate response, want decoupling
 */
interface OrderCreatedEvent {
  eventId: string;
  eventType: 'ORDER_CREATED';
  timestamp: Date;
  payload: {
    orderId: string;
    userId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    total: number;
  };
}

// Order Service: Publishes event
class OrderServiceAsync {
  constructor(private eventBus: EventBus) {}

  async createOrder(items: Item[]): Promise<Order> {
    // Save order to database
    const order = await this.orderRepository.save({
      items,
      status: 'pending',
    });

    // Publish event - returns immediately
    await this.eventBus.publish<OrderCreatedEvent>({
      eventId: crypto.randomUUID(),
      eventType: 'ORDER_CREATED',
      timestamp: new Date(),
      payload: {
        orderId: order.id,
        userId: order.userId,
        items: order.items,
        total: order.total,
      },
    });

    // Return immediately - don't wait for downstream processing
    return order;
  }
}

// Inventory Service: Subscribes to event
class InventoryServiceSubscriber {
  constructor(private eventBus: EventBus) {
    this.eventBus.subscribe('ORDER_CREATED', this.handleOrderCreated.bind(this));
  }

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    for (const item of event.payload.items) {
      await this.reserveInventory(item.productId, item.quantity);
    }
    
    // Emit its own event when done
    await this.eventBus.publish({
      eventType: 'INVENTORY_RESERVED',
      payload: { orderId: event.payload.orderId },
    });
  }
}

// Notification Service: Also subscribes (Fan-out)
class NotificationServiceSubscriber {
  constructor(private eventBus: EventBus) {
    this.eventBus.subscribe('ORDER_CREATED', this.handleOrderCreated.bind(this));
  }

  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.sendOrderConfirmationEmail(event.payload.userId, event.payload.orderId);
    await this.sendPushNotification(event.payload.userId, 'Order confirmed!');
  }
}

/**
 * PATTERN 3: API Gateway (Entry Point)
 * 
 * Single entry point that routes to appropriate services
 * 
 * Responsibilities:
 * - Authentication / Authorization
 * - Rate limiting
 * - Request routing
 * - Response aggregation
 * - Protocol translation
 */
class ApiGateway {
  private authService: AuthService;
  private rateLimiter: RateLimiter;
  private serviceRegistry: ServiceRegistry;

  async handleRequest(req: Request): Promise<Response> {
    // 1. Rate limiting
    const allowed = await this.rateLimiter.check(req.ip);
    if (!allowed) {
      return new Response(null, { status: 429 });
    }

    // 2. Authentication
    const user = await this.authService.validateToken(req.headers.authorization);
    if (!user) {
      return new Response(null, { status: 401 });
    }

    // 3. Route to appropriate service
    const service = await this.serviceRegistry.discover(req.path);
    const response = await service.forward(req);

    // 4. Transform/aggregate response if needed
    return this.transformResponse(response);
  }
}
```

---

## 5. Scenario B: Service Discovery & Resilience Patterns

**Real-Life Scenario:** In production, services crash, networks fail, and deployments happen constantly.

**Technical Problem:** Build resilient service-to-service communication.

### TypeScript Implementation

```typescript
/**
 * SERVICE DISCOVERY
 * 
 * Problem: How does Order Service know where Payment Service is?
 * IP addresses change, containers scale up/down.
 */

// Option 1: Client-Side Discovery (Eureka, Consul)
class ServiceDiscoveryClient {
  private serviceRegistry: Map<string, string[]> = new Map();
  private currentIndex: Map<string, number> = new Map();

  constructor(private registryUrl: string) {
    // Periodically refresh service locations
    setInterval(() => this.refreshRegistry(), 30000);
  }

  async getServiceUrl(serviceName: string): Promise<string> {
    const instances = this.serviceRegistry.get(serviceName) || [];
    if (instances.length === 0) {
      throw new Error(`No instances of ${serviceName} available`);
    }

    // Round-robin load balancing
    const index = (this.currentIndex.get(serviceName) || 0) % instances.length;
    this.currentIndex.set(serviceName, index + 1);
    return instances[index];
  }

  private async refreshRegistry(): Promise<void> {
    const response = await fetch(`${this.registryUrl}/services`);
    const services = await response.json();
    for (const [name, instances] of Object.entries(services)) {
      this.serviceRegistry.set(name, instances as string[]);
    }
  }
}

// Option 2: Server-Side Discovery (Kubernetes, AWS ELB)
// Just call `http://payment-service/` and Kubernetes DNS resolves it

/**
 * CIRCUIT BREAKER PATTERN
 * 
 * Prevents cascading failures when a service is unhealthy.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, reject requests immediately
 * - HALF_OPEN: Test with few requests to see if recovered
 */
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number = 0;

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly successThreshold: number = 3,
    private readonly timeout: number = 30000, // 30 seconds
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // If circuit is OPEN, check if we should try again
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        console.log('Circuit HALF_OPEN: Testing service...');
      } else {
        throw new Error('Circuit is OPEN - failing fast');
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

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        console.log('Circuit CLOSED: Service recovered');
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      console.log('Circuit OPEN: Service still failing');
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('Circuit OPEN: Too many failures');
    }
  }

  getState(): string {
    return this.state;
  }
}

// Usage with actual service call
const paymentCircuit = new CircuitBreaker(5, 3, 30000);

async function chargePayment(userId: string, amount: number): Promise<PaymentResult> {
  return paymentCircuit.execute(async () => {
    const response = await fetch('http://payment-service/charge', {
      method: 'POST',
      body: JSON.stringify({ userId, amount }),
    });
    
    if (!response.ok) {
      throw new Error('Payment failed');
    }
    
    return response.json();
  });
}

/**
 * BULKHEAD PATTERN
 * 
 * Isolate failures using separate thread pools/connection pools.
 * Like compartments in a ship - one leak doesn't sink the whole ship.
 */
class BulkheadExecutor {
  private semaphores: Map<string, Semaphore> = new Map();

  constructor(private limits: Record<string, number>) {
    for (const [service, limit] of Object.entries(limits)) {
      this.semaphores.set(service, new Semaphore(limit));
    }
  }

  async execute<T>(service: string, fn: () => Promise<T>): Promise<T> {
    const semaphore = this.semaphores.get(service);
    if (!semaphore) {
      throw new Error(`Unknown service: ${service}`);
    }

    const acquired = await semaphore.tryAcquire(5000); // 5s timeout
    if (!acquired) {
      throw new Error(`Bulkhead for ${service} is full`);
    }

    try {
      return await fn();
    } finally {
      semaphore.release();
    }
  }
}

// Separate pools prevent one slow service from affecting others
const bulkhead = new BulkheadExecutor({
  'payment-service': 20,     // Max 20 concurrent calls
  'inventory-service': 50,   // Max 50 concurrent calls
  'notification-service': 10,// Max 10 concurrent calls
});

/**
 * RETRY WITH EXPONENTIAL BACKOFF
 * 
 * Retry failed requests with increasing delays.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000;
        await sleep(delay + jitter);
      }
    }
  }
  
  throw lastError!;
}
```

---

## 6. Real World Applications 🌍

### 1. 📺 Netflix - 1000+ Microservices

**Architecture:**
- Each service owned by a small team (2-pizza rule)
- Zuul API Gateway for routing
- Eureka for service discovery
- Hystrix for circuit breaking (now Resilience4j)
- Chaos Monkey for fault testing

**Lesson:** "You build it, you run it" - teams own services end-to-end.

### 2. 🛒 Amazon - Service-Oriented Since 2002

**Architecture:**
- Every team exposes data via services
- Internal services must be usable externally
- No shared databases (service owns its data)

**Famous Bezos Mandate (2002):**
> "All teams will henceforth expose their data and functionality through service interfaces... Anyone who doesn't do this will be fired."

### 3. 🎵 Spotify - Squad Model

**Architecture:**
- "Squads" own microservices end-to-end
- Feature flags for gradual rollouts
- Decentralized data ownership

### 4. 🚗 Uber - Domain-Driven Microservices

**Architecture:**
- Services aligned with business domains (Riders, Drivers, Trips, Payments)
- Approximately 2,500 microservices
- Custom service mesh for observability

---

## 7. Complexity Analysis 🧠

### Monolith vs Microservices Trade-offs

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| **Initial Development** | Fast ✓ | Slow (infrastructure overhead) |
| **Deployment** | All or nothing | Independent ✓ |
| **Scaling** | Entire application | Per service ✓ |
| **Technology** | Single stack | Polyglot ✓ |
| **Data Consistency** | Transactions ✓ | Eventual consistency |
| **Debugging** | Single process ✓ | Distributed tracing needed |
| **Team Size** | Small teams | Large organizations ✓ |
| **Operational Complexity** | Low ✓ | High (many moving parts) |

### Decision Framework

```
Start with Monolith IF:
├── Team size < 20 engineers
├── Domain not well understood
├── Startup/MVP phase
└── Need quick iteration

Consider Microservices IF:
├── Clear domain boundaries (DDD)
├── Different scaling requirements
├── Teams stepping on each other's toes
├── Need independent deployments
└── Organizational growth demands it
```

### Interview Tips 💡

1. **Start simple:** "We'd start with a modular monolith, then extract services."
2. **Discuss trade-offs:** "Microservices add network complexity and operational overhead."
3. **Emphasize ownership:** "Each service should have a single team owner."
4. **Know the patterns:** Circuit breaker, bulkhead, retry, service discovery.
5. **Database per service:** "Each service owns its data - no shared databases."
6. **Observability:** "We need distributed tracing and centralized logging."
7. **Define service boundaries wisely:** "Use Domain-Driven Design bounded contexts to split services. Wrong boundaries cause excessive inter-service communication. A good rule: if two services always change together, they should be one service."
