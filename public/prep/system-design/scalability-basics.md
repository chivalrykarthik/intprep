# Scalability Basics 📈

## 1. The "Restaurant Chain" Analogy

Imagine you own a small, popular restaurant. Every night, there's a 2-hour wait for a table. You have two choices:

**Option A: Buy a BIGGER Kitchen (Vertical Scaling)**
- Knock down walls, add more stoves, hire more chefs in the SAME location.
- Works until you hit the building's physical limits.
- One fire? The whole restaurant shuts down.

**Option B: Open MORE Restaurants (Horizontal Scaling)**
- Open identical branches across the city.
- Each handles its own crowd independently.
- One branch closes? Others keep serving.

**This is Scalability.** It's about designing systems that handle growing demand—either by making one machine more powerful (vertical) or by adding more machines (horizontal).

---

## 2. The Core Concept

In system design interviews, scalability questions test if you understand how real-world systems handle millions of users.

**The "Brute Force" (Naive) Way:**
Buy the most expensive, powerful server money can buy. Hope it never crashes. Pray traffic doesn't spike.

**The "Scalable" (Smart) Way:**
Design your system to:
1. **Scale Out:** Add more servers behind a load balancer.
2. **Stay Stateless:** Don't store user sessions on one server.
3. **Cache Aggressively:** Reduce database hits.
4. **Partition Data:** Spread data across multiple databases.
- **Boom.** Your system handles 10x, 100x, or 1000x traffic seamlessly.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "System Design visualizer coming soon!"
}
```

---

## 4. Scenario A: Vertical vs Horizontal Scaling

**Real-Life Scenario:** Your e-commerce site gets featured on national TV. Traffic jumps from 1,000 to 100,000 users per hour.

**Technical Problem:** How do you handle the sudden 100x increase in traffic?

### Comparison Table

| Aspect | Vertical Scaling | Horizontal Scaling |
|--------|-----------------|-------------------|
| **How** | Upgrade CPU, RAM, SSD | Add more servers |
| **Cost** | Expensive hardware | Cheaper commodity servers |
| **Limit** | Physical hardware limit | Virtually unlimited |
| **Downtime** | Required for upgrade | Zero downtime (add while running) |
| **Complexity** | Simple (one machine) | Complex (distributed system) |
| **Failure** | Single point of failure | Fault tolerant |

### TypeScript Implementation (Conceptual)

```typescript
/**
 * Demonstrates the concept of horizontal scaling with a simple load distribution.
 * 
 * @param requests - Array of incoming user requests
 * @param serverCount - Number of available servers
 * @returns Distribution of requests to servers
 * 
 * @timeComplexity O(N) - Process each request once
 * @spaceComplexity O(S) - Store queue per server
 */
function distributeLoad(requests: string[], serverCount: number): Map<number, string[]> {
  const serverQueues = new Map<number, string[]>();
  
  // Initialize server queues
  for (let i = 0; i < serverCount; i++) {
    serverQueues.set(i, []);
  }
  
  // Round-robin distribution (simplest form of load balancing)
  requests.forEach((request, index) => {
    const serverIndex = index % serverCount;
    serverQueues.get(serverIndex)!.push(request);
  });
  
  return serverQueues;
}

// Example: 10 requests across 3 servers
const requests = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10'];
const distribution = distributeLoad(requests, 3);

console.log('Server 0:', distribution.get(0)); // [R1, R4, R7, R10]
console.log('Server 1:', distribution.get(1)); // [R2, R5, R8]
console.log('Server 2:', distribution.get(2)); // [R3, R6, R9]
```

### Sample input and output
- Input: 10 requests, 3 servers
- Output: Evenly distributed requests (3-4 per server)

---

## 5. Scenario B: Designing for Scale

**Real-Life Scenario:** You're architecting a new social media platform expected to grow from 1,000 to 10 million users in 2 years.

**Technical Problem:** Design an architecture that scales with growth.

### The Scalability Checklist

```typescript
/**
 * Scalability Design Checklist
 * 
 * Use this as a mental framework when designing systems.
 */
interface ScalableSystem {
  // 1. Stateless Application Servers
  applicationTier: {
    stateless: true;           // No session data on servers
    horizontallyScalable: true; // Can add/remove servers
    behindLoadBalancer: true;   // Traffic distributed evenly
  };
  
  // 2. Data Layer Strategy
  dataTier: {
    readReplicas: boolean;      // Scale reads with replicas
    sharding: boolean;          // Partition data horizontally
    caching: 'Redis' | 'Memcached'; // Cache hot data
  };
  
  // 3. Async Processing
  asyncProcessing: {
    messageQueue: 'Kafka' | 'RabbitMQ' | 'SQS';
    workerPools: boolean;       // Background job processing
  };
  
  // 4. CDN for Static Content
  cdn: {
    enabled: boolean;
    provider: 'CloudFront' | 'Cloudflare' | 'Akamai';
  };
}

// Example: Scalable Social Media Architecture
const socialMediaArch: ScalableSystem = {
  applicationTier: {
    stateless: true,
    horizontallyScalable: true,
    behindLoadBalancer: true,
  },
  dataTier: {
    readReplicas: true,    // 5 read replicas for feed queries
    sharding: true,        // Shard by user_id
    caching: 'Redis',      // Cache user profiles, feed
  },
  asyncProcessing: {
    messageQueue: 'Kafka', // Fan-out for notifications
    workerPools: true,     // Process image uploads async
  },
  cdn: {
    enabled: true,
    provider: 'CloudFront', // Serve images, videos globally
  },
};
```

---

## 6. Real World Applications 🌍

### 1. 🛒 Amazon Prime Day
Every July, Amazon handles **300 million+ requests per second**. They achieve this by:
- Auto-scaling EC2 instances across multiple regions
- Aggressive caching with ElastiCache
- Pre-warming services before the event

### 2. 🎮 Fortnite Concurrent Players
Epic Games handles **12+ million concurrent players** by:
- Horizontally scaling game servers across AWS regions
- Using dedicated matchmaking services
- Sharding player data by region

### 3. 📺 Netflix Streaming
Netflix serves **250+ million subscribers** globally by:
- Caching content at ISP edge locations (Open Connect)
- Microservices architecture (1,000+ services)
- Regional failover with multi-region deployment

### 4. 🐦 Twitter's Tweet Fanout
When a celebrity tweets to 50M followers:
- Kafka queues distribute the write
- Timeline caches are updated asynchronously
- Read replicas handle the spike in timeline fetches

---

## 7. Complexity Analysis 🧠

### Key Metrics to Discuss in Interviews

| Metric | Definition | Target |
|--------|------------|--------|
| **Throughput** | Requests per second (RPS) | Depends on SLA |
| **Latency** | Response time (p50, p95, p99) | < 200ms (p99) |
| **Availability** | Uptime percentage | 99.9% or 99.99% |
| **Fault Tolerance** | Recovery from failures | Automatic failover |

### Scaling Formulas (Back-of-Envelope)

```
Daily Active Users (DAU) → Requests per Second (RPS)

Example: 10 million DAU
- Average user makes 10 requests/day
- Total: 100 million requests/day
- Per second: 100M / 86400 ≈ 1,157 RPS (average)
- Peak (assume 3x): ~3,500 RPS

Server Capacity (assuming 500 RPS/server):
- Servers needed: 3500 / 500 = 7 servers
- With redundancy (2x): 14 servers
```

### Interview Tips 💡

1. **Always mention trade-offs:** "Horizontal scaling adds complexity but removes single points of failure."
2. **Know the numbers:** Memorize rough estimates—1 server handles ~1K-10K RPS depending on workload.
3. **Start simple, then scale:** "We'd start with a monolith, then extract services as we scale."
4. **Discuss data consistency:** "With distributed systems, we trade consistency for availability (CAP theorem)."
