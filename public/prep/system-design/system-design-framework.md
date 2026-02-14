# ⭐ System Design Interview Framework 🏗️

## 1. The "Architect Building a House" Analogy

Imagine a client walks into your architecture firm and says: *"Build me a house."*

A junior architect grabs a hammer and starts building. A senior architect asks questions first:

**Step 1 — Requirements:** "How many people will live here? Do you need a garage? What's the climate — do we need insulation or just shade? What's the budget?"

**Step 2 — Estimation:** "A family of 4 needs ~2,000 sq ft. At $150/sq ft, that's ~$300K. We need 3 bedrooms, 2 bathrooms, kitchen, living room."

**Step 3 — Blueprint:** "Here's the floor plan. Living room connects to kitchen. Master bedroom has an en-suite. Garage is on the north side for shade."

**Step 4 — Material Selection:** "For the foundation, reinforced concrete. For walls in earthquake zones, steel frame. For the roof, slate tiles for durability."

**This is a System Design Interview.** The interviewer doesn't want you to build the house — they want to see *how you think about building* it. The process matters more than the final answer.

---

## 2. The Core Concept

A system design interview is a **45-60 minute conversation** where you design a large-scale distributed system. It tests your ability to:

- **Break down ambiguous problems** into concrete requirements
- **Make and justify trade-offs** (there are no "right" answers)
- **Communicate clearly** (this is a collaboration, not a solo lecture)
- **Apply real-world experience** (not just textbook knowledge)

### Why Most Candidates Fail

| ❌ Anti-Pattern | ✅ What to Do Instead |
| :--- | :--- |
| Jump straight into database schema | Start with requirements and estimation |
| Design in silence for 5 minutes | Think out loud — narrate your reasoning |
| Try to design everything perfectly | Focus on the core flow, then iterate |
| Give one solution without alternatives | Present options with trade-offs |
| Never mention failures or edge cases | Proactively discuss what can go wrong |
| Draw boxes without explaining data flow | Describe what happens at each step |
| Ignore non-functional requirements | Always discuss scale, latency, availability |

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│            THE 4-STEP SYSTEM DESIGN FRAMEWORK                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STEP 1: REQUIREMENTS (5 min)                                   │
│  ══════════════════════════════                                  │
│  "What are we building? For whom? What's the scale?"            │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ Functional    │ Non-Functional   │ Out of Scope     │        │
│  │ • Core CRUD   │ • Scale (DAU)    │ • Admin panel    │        │
│  │ • User flows  │ • Latency (SLA)  │ • Analytics      │        │
│  │ • Key APIs    │ • Availability   │ • Billing        │        │
│  │               │ • Consistency    │                  │        │
│  └─────────────────────────────────────────────────────┘        │
│                          │                                      │
│                          ▼                                      │
│  STEP 2: ESTIMATION (5 min)                                     │
│  ══════════════════════════                                      │
│  "Let me do some back-of-envelope math..."                      │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ • QPS (reads & writes)                              │        │
│  │ • Storage (per day, per year, 5 years)              │        │
│  │ • Bandwidth (ingress/egress)                        │        │
│  │ • Cache size (80/20 rule)                           │        │
│  └─────────────────────────────────────────────────────┘        │
│                          │                                      │
│                          ▼                                      │
│  STEP 3: HIGH-LEVEL DESIGN (15 min)                             │
│  ═══════════════════════════════════                             │
│  "Here's the architecture at 30,000 feet..."                    │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ Client → CDN → LB → App Servers → Cache → DB       │        │
│  │           │                         │               │        │
│  │       Static Assets          Message Queue          │        │
│  │                              → Workers              │        │
│  └─────────────────────────────────────────────────────┘        │
│                          │                                      │
│                          ▼                                      │
│  STEP 4: DEEP DIVE (20 min)                                     │
│  ═══════════════════════════                                    │
│  "Let me zoom into the most interesting component..."           │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ • Database schema + indexing                        │        │
│  │ • API design (endpoints, contracts)                 │        │
│  │ • Scaling bottlenecks + solutions                   │        │
│  │ • Failure modes + recovery                          │        │
│  │ • The ONE hard problem (this is your spotlight)     │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  ⏱️ Total: 45 minutes                                           │
│  💡 Rule: Spend 60% of your time on the deep dive.             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Step-by-Step Walkthrough — "Design a Chat App"

**Real-Life Scenario:** An interviewer says: "Design a chat application like WhatsApp."

**Technical Problem:** Walk through the 4-step framework in real-time.

### Step 1: Gather Requirements (5 minutes)

```typescript
/**
 * STEP 1: REQUIREMENTS GATHERING
 * 
 * Don't assume. Ask. The interviewer is testing whether you can
 * scope a vague problem into a concrete spec.
 * 
 * Framework: Functional → Non-Functional → Clarifications → Out of Scope
 */

// FUNCTIONAL REQUIREMENTS (What does it DO?)
// Ask these questions out loud:
const functionalRequirements = {
  messaging: {
    ask: "1:1 messaging or group chats or both?",
    answer: "Both. Groups up to 200 members.",
  },
  mediaSupport: {
    ask: "Text only, or images/videos too?",
    answer: "Text + images. Video can be out of scope.",
  },
  delivery: {
    ask: "Do we need read receipts and delivery status?",
    answer: "Yes. Sent → Delivered → Read.",
  },
  onlineStatus: {
    ask: "Do we need 'last seen' / online indicators?",
    answer: "Yes, but can be approximate.",
  },
  persistence: {
    ask: "Should messages persist forever or expire?",
    answer: "Persist forever. Users can delete their own messages.",
  },
  encryption: {
    ask: "Do we need end-to-end encryption?",
    answer: "Yes, for 1:1. Nice-to-have for groups.",
  },
};

// NON-FUNCTIONAL REQUIREMENTS (How does it PERFORM?)
const nonFunctionalRequirements = {
  scale: "500 million DAU, 2 billion registered users",
  latency: "Message delivery < 500ms for online users",
  availability: "99.99% uptime (< 52 minutes downtime/year)",
  consistency: "Messages must never be lost or reordered",
  concurrency: "50 million concurrent WebSocket connections",
};

// OUT OF SCOPE (What are we NOT building?)
const outOfScope = [
  "Voice/video calling",
  "Stories/status updates", 
  "Payment integration",
  "Admin dashboard",
  "Content moderation (mention but don't design)",
];

/**
 * 💡 PRO TIP: Write these on the whiteboard/screen as you go.
 * The interviewer should be able to glance at your requirements
 * at any point during the interview.
 * 
 * ⚠️ ANTI-PATTERN: Don't spend 15 minutes on requirements.
 * 5 minutes max. Get alignment and move on.
 */
```

### Step 2: Back-of-Envelope Estimation (5 minutes)

```typescript
/**
 * STEP 2: BACK-OF-ENVELOPE ESTIMATION
 * 
 * This shows the interviewer you think about SCALE.
 * It also guides your architecture decisions.
 * 
 * Framework:
 *   1. Start with DAU
 *   2. Calculate QPS (queries per second)
 *   3. Calculate Storage
 *   4. Calculate Bandwidth
 */

const estimation = {
  // TRAFFIC
  dau: 500_000_000,
  messagesPerUserPerDay: 40,
  totalMessagesPerDay: "500M × 40 = 20 billion messages/day",
  
  writeQPS: {
    average: "20B / 86,400 ≈ 230,000 messages/sec",
    peak: "230K × 3 = 700,000 messages/sec (peak hours)",
    // "That's a LOT. We need horizontal scaling and async writes."
  },
  
  readQPS: {
    note: "With WebSocket push, reads are minimal (no polling).",
    historicalReads: "~50K QPS for scrolling up / searching",
  },
  
  // STORAGE
  storage: {
    avgMessageSize: "100 bytes (text) + 50 bytes (metadata) = 150 bytes",
    dailyStorage: "20B × 150 bytes = 3 TB/day",
    yearlyStorage: "3 TB × 365 = ~1 PB/year",
    fiveYears: "~5 PB (need distributed storage — Cassandra/HBase)",
    mediaStorage: "If 5% of messages have images (avg 200KB): 20B × 0.05 × 200KB = 200 TB/day (separate blob storage — S3)",
  },
  
  // BANDWIDTH
  bandwidth: {
    ingress: "700K msg/sec × 150 bytes = 105 MB/sec (trivial for text)",
    egress: "Similar, plus media downloads",
    note: "Media dominates bandwidth. Text is negligible.",
  },
  
  // CACHE
  cache: {
    recentMessages: "Last 30 messages per active conversation",
    activeConversations: "500M DAU × 10 active convos × 30 msgs × 150 bytes",
    cacheSize: "500M × 10 × 30 × 150 = ~22 TB (distributed Redis cluster)",
  },
};

/**
 * 💡 PRO TIP: Round aggressively. 86,400 ≈ 100,000.
 * The interviewer wants to see your PROCESS, not exact arithmetic.
 * 
 * 💡 PRO TIP: State your assumptions. "I'm assuming 40 messages
 * per user per day based on WhatsApp's public data."
 * 
 * 💡 PRO TIP: These numbers should DRIVE your decisions.
 * "700K writes/sec means a single DB won't work. We need Cassandra."
 */
```

### Step 3: High-Level Design (15 minutes)

```typescript
/**
 * STEP 3: HIGH-LEVEL ARCHITECTURE
 * 
 * Draw the big picture first. Don't go deep yet.
 * Explain the FLOW of a message from sender to receiver.
 * 
 * Architecture Diagram:
 * 
 * ┌────────┐        ┌──────────────┐       ┌──────────────┐
 * │Sender  │───WS───│  WebSocket   │──────▶│   Message    │
 * │(App)   │        │  Gateway     │       │   Service    │
 * └────────┘        │  (Stateful)  │       └──────┬───────┘
 *                   └──────┬───────┘              │
 *                          │                ┌─────┼─────────┐
 *                          │                ▼     ▼         ▼
 *                          │          ┌────────┐ ┌────┐  ┌──────┐
 *                          │          │Cassandra│ │Redis│  │Kafka │
 *                          │          │(Messages│ │Cache│  │(Async│
 *                          │          │ Store)  │ │     │  │ Fanout)
 *                          │          └────────┘ └────┘  └──┬───┘
 *                          │                                │
 *                   ┌──────▼───────┐                   ┌────▼────┐
 * ┌────────┐        │  WebSocket   │◀──────────────────│ Fanout  │
 * │Receiver│◀──WS───│  Gateway     │                   │ Worker  │
 * │(App)   │        │  (Stateful)  │                   └─────────┘
 * └────────┘        └──────────────┘
 * 
 *          (If receiver is OFFLINE)
 *                          │
 *                   ┌──────▼───────┐
 *                   │    Push      │
 *                   │ Notification │
 *                   │ (APNs/FCM)  │
 *                   └──────────────┘
 * 
 * KEY COMPONENTS:
 * 1. WebSocket Gateway — Persistent connections (stateful)
 * 2. Message Service — Business logic, validation, routing
 * 3. Cassandra — Message persistence (write-heavy, partitioned by chatId)
 * 4. Redis — Session store (which gateway has which user?)
 * 5. Kafka — Async fanout for group messages
 * 6. Push Service — APNs/FCM for offline users
 */

// Walk through the message flow:
const messageFlow = {
  step1: "User A sends message via WebSocket to Gateway Server 3",
  step2: "Gateway forwards to Message Service",
  step3: "Message Service validates + persists to Cassandra",
  step4: "Message Service looks up User B's session in Redis",
  step5a: "If User B is ONLINE: Route to their Gateway → deliver via WebSocket",
  step5b: "If User B is OFFLINE: Enqueue push notification + store for later",
  step6: "Return ACK to User A (message sent ✓)",
  step7: "When User B comes online, pull undelivered messages from Cassandra",
};

/**
 * 💡 PRO TIP: ALWAYS walk through the data flow.
 * "When User A sends a message, here's what happens step by step..."
 * This shows the interviewer you understand ends-to-end, not just boxes.
 * 
 * 💡 PRO TIP: Explain WHY you chose each component.
 * "I chose Cassandra because we have 700K writes/sec and need 
 * horizontal scaling. Cassandra is optimized for write-heavy workloads."
 */
```

### Step 4: Deep Dive (20 minutes)

```typescript
/**
 * STEP 4: DEEP DIVE
 * 
 * The interviewer will often say: "Let's dig deeper into [X]."
 * If they don't, YOU pick the most interesting component.
 * 
 * Good deep-dive topics for a chat app:
 * 1. WebSocket connection management at scale
 * 2. Message ordering and delivery guarantees
 * 3. Group messaging fan-out
 * 4. End-to-end encryption (Signal Protocol)
 * 5. Offline message delivery
 * 
 * Let's deep-dive into #1: WebSocket at Scale
 */

// PROBLEM: 50M concurrent WebSocket connections.
// One server handles ~50K connections.  
// 50M / 50K = 1,000 WebSocket gateway servers.

/**
 * WebSocket Gateway — The Hard Problem
 * 
 * Challenge: WebSocket connections are STATEFUL.
 * User A is connected to Gateway-47.
 * User B is connected to Gateway-312.
 * How does the message from A reach B's specific gateway?
 * 
 * Solution: Session Registry (Redis)
 * 
 * When User A connects:
 *   Redis SET "session:userA" → "gateway-47"
 * 
 * When a message arrives for User A:
 *   1. Redis GET "session:userA" → "gateway-47"
 *   2. Route message to gateway-47 via internal service mesh
 *   3. gateway-47 pushes via WebSocket to User A
 */

interface SessionRegistry {
  // Map userId → gatewayId
  connect(userId: string, gatewayId: string): Promise<void>;
  disconnect(userId: string): Promise<void>;
  getGateway(userId: string): Promise<string | null>;
}

class RedisSessionRegistry implements SessionRegistry {
  async connect(userId: string, gatewayId: string): Promise<void> {
    // SET with TTL for heartbeat-based cleanup
    await this.redis.set(
      `session:${userId}`, 
      gatewayId,
      'EX', 300 // 5 min TTL, renewed by heartbeat
    );
  }

  async disconnect(userId: string): Promise<void> {
    await this.redis.del(`session:${userId}`);
  }

  async getGateway(userId: string): Promise<string | null> {
    return this.redis.get(`session:${userId}`);
  }
}

/**
 * Handling Gateway Failures
 * 
 * What if gateway-47 crashes? All 50K users on it lose connection.
 * 
 * Solution:
 * 1. Client-side reconnection with exponential backoff
 * 2. Load balancer routes reconnection to a different gateway
 * 3. New gateway registers the session in Redis
 * 4. Client requests undelivered messages since last received message ID
 * 
 * "The system self-heals within 2-5 seconds."
 */

/**
 * Message Ordering Guarantee
 * 
 * Problem: Messages arrive out of order due to network jitter.
 * 
 * Solution: Server-assigned monotonic sequence numbers per chat.
 *   Each chat has an atomic counter: chat:{chatId}:seq
 *   When a message is saved, it gets the next sequence number.
 *   Client renders messages sorted by sequence number, not arrival time.
 * 
 * @timeComplexity O(1) for sequence assignment (Redis INCR)
 * @spaceComplexity O(1) per chat for the counter
 */
```

---

## 5. Scenario B: The Communication Playbook — What to Say and When

**Real-Life Scenario:** You know the concepts but freeze in the interview. You need a script.

**Technical Problem:** Map interview moments to specific phrases and strategies.

### The Communication Framework

```typescript
/**
 * COMMUNICATION PLAYBOOK
 * 
 * The difference between a "hire" and "strong hire" at the senior level
 * is NOT knowledge — it's communication. Here are exact phrases
 * to use at each stage.
 */

// ============================================
// PHASE 1: OPENING (First 30 seconds)
// ============================================

const openingScript = {
  // ✅ DO: Set the stage
  good: [
    "Before I start drawing, let me make sure I understand the requirements.",
    "I'll approach this in 4 phases: requirements, estimation, high-level design, then a deep dive into the most interesting component.",
    "Can I take 2 minutes to gather requirements before I start designing?",
  ],
  // ❌ DON'T: Jump in
  bad: [
    "OK so first we need a database...",             // No requirements!
    "Let me think..." *silence for 2 minutes*,       // Think out loud!
    "This is just like the system at my company...",  // Too specific
  ],
};

// ============================================
// PHASE 2: REQUIREMENTS (Minutes 1-5)
// ============================================

const requirementsScript = {
  // Functional requirements
  functional: [
    "What are the core user actions? Can users [X, Y, Z]?",
    "Do we need to support [specific feature] or is that out of scope?",
    "Who are the users? Internal team? Public-facing? B2B?",
  ],
  // Non-functional requirements
  nonFunctional: [
    "What's the expected scale? How many DAU are we targeting?",
    "What's the latency SLA? Sub-100ms? Sub-second?",
    "What's more important here — consistency or availability?",
    "Do we need to be globally distributed or single-region?",
  ],
  // Scoping
  scoping: [
    "For the scope of this interview, I'll focus on [X] and mention [Y] at a high level.",
    "I'm going to intentionally leave [Z] out of scope. We can discuss it if time permits.",
  ],
};

// ============================================
// PHASE 3: ESTIMATION (Minutes 5-10)
// ============================================

const estimationScript = {
  transitions: [
    "Now let me do some quick math to understand the scale we're dealing with.",
    "These numbers will help me decide what kind of database and caching layer we need.",
  ],
  assumptions: [
    "I'll assume [X] based on industry benchmarks. Does that sound reasonable?",
    "A typical user [does X activity Y times per day].",
  ],
  conclusions: [
    "So we're looking at about [X] QPS for reads and [Y] for writes.",
    "That rules out a single SQL database — we'll need sharding or a distributed store.",
    "With the 80/20 rule, a [X] GB Redis cache handles 95% of reads.",
  ],
};

// ============================================
// PHASE 4: HIGH-LEVEL DESIGN (Minutes 10-25)
// ============================================

const designScript = {
  structure: [
    "Let me start with the happy path: what happens when a user [core action]?",
    "I'll draw the architecture from left to right: client → through our system → storage.",
  ],
  componentJustification: [
    "I'm choosing [X] here because [reason]. An alternative would be [Y], but [trade-off].",
    "For the database, I'd use [X] because our workload is [read/write]-heavy with [consistency model].",
    "We need a message queue here to decouple [A] from [B] — otherwise [failure scenario].",
  ],
  tradeoffs: [
    "There's a trade-off here between [X] and [Y]. Given our requirements, I'd lean toward [X] because...",
    "The downside of this approach is [X]. We mitigate it by [Y].",
    "In a real production system, we might also want [X], but for this interview let's focus on [Y].",
  ],
};

// ============================================
// PHASE 5: DEEP DIVE (Minutes 25-45)
// ============================================

const deepDiveScript = {
  initiation: [
    "The most interesting technical challenge here is [X]. Let me dig deeper.",
    "Is there a specific component you'd like me to elaborate on?",
    "The bottleneck in this system is [X]. Let me show how we'd handle it.",
  ],
  scaling: [
    "At our scale of [X] QPS, a single [component] won't work. Here's how we scale it...",
    "We'd shard [X] by [key] using consistent hashing to distribute load evenly.",
    "We need [X] replicas for read throughput and [Y] replicas for fault tolerance.",
  ],
  failures: [
    "What if [component] goes down? We have [fallback] with [recovery time].",
    "For data durability, we replicate across [X] availability zones.",
    "We'd detect this failure via [health checks/heartbeats] and auto-failover within [X] seconds.",
  ],
  monitoring: [
    "We'd monitor [X metric] and alert if it exceeds [threshold].",
    "Key SLOs: p99 latency < [X]ms, error rate < [Y]%, availability > [Z]%.",
  ],
};

// ============================================
// PHASE 6: CLOSING (Last 2 minutes)
// ============================================

const closingScript = {
  summary: [
    "To summarize: we designed a system that handles [X] QPS with [Y] availability...",
    "The key trade-off we made was [X] over [Y] because of our requirements.",
  ],
  futureImprovements: [
    "If I had more time, I'd add [monitoring/analytics/ML ranking].",
    "For V2, we could improve [X] by introducing [Y].",
    "We didn't discuss [edge case]. In production, we'd handle it by [Z].",
  ],
};
```

---

## 6. Real World Applications 🌍

### 1. 🎯 The "Interviewer Signals" Cheat Sheet

Interviewers drop hints. Learn to read them:

| What They Say | What They Mean | What to Do |
| :--- | :--- | :--- |
| "How would you handle 10x traffic?" | Test your scaling instincts | Discuss horizontal scaling, caching, sharding |
| "What if this component fails?" | Test fault tolerance thinking | Add redundancy, failover, circuit breakers |
| "Can you go deeper on this part?" | They want technical depth HERE | This is your time to shine — schema, algorithms, trade-offs |
| "What are the trade-offs?" | They want you to think critically | Never just pick one option — compare 2-3 alternatives |
| "How would you deploy this?" | Test operational maturity | Canary deployments, blue-green, feature flags |
| "What would you monitor?" | Test production readiness | SLOs, dashboards, alerting, on-call runbooks |
| "Interesting..." (then silence) | You said something wrong | Pause. Re-examine your last statement. Self-correct. |

### 2. 📐 The "Building Blocks" Quick Reference

Every system design uses a combination of these 12 building blocks:

| Block | When to Use | Example |
| :--- | :--- | :--- |
| **Load Balancer** | Multiple app servers | NGINX, ALB |
| **API Gateway** | Microservices entry point | Kong, AWS APIGW |
| **CDN** | Static assets, global users | CloudFront, Cloudflare |
| **Application Server** | Business logic | Node.js, Java Spring |
| **Cache (Redis)** | Read-heavy, hot data | User sessions, feed cache |
| **SQL Database** | ACID, relational data | PostgreSQL, MySQL |
| **NoSQL Database** | Write-heavy, flexible schema | Cassandra, DynamoDB, MongoDB |
| **Message Queue** | Async processing, decoupling | Kafka, SQS, RabbitMQ |
| **Object Storage** | Images, videos, files | S3, GCS |
| **Search Engine** | Full-text search, analytics | Elasticsearch, Algolia |
| **WebSocket Server** | Real-time bidirectional | Chat, live updates |
| **Notification Service** | Push/email/SMS | APNs, FCM, SendGrid |

### 3. 🗺️ Common Architectures by Problem Type

| Problem Type | Architecture Pattern | Key Components |
| :--- | :--- | :--- |
| **Read-heavy** (URL shortener, CDN) | Cache-first + SQL | Redis → PostgreSQL |
| **Write-heavy** (Chat, IoT, Logs) | Append-only + NoSQL | Kafka → Cassandra |
| **Real-time** (Chat, Notifications) | WebSocket + Pub/Sub | WS Gateway → Redis Pub/Sub |
| **Feed/Timeline** (Twitter, Instagram) | Hybrid fan-out | Redis Sorted Sets + Cassandra |
| **Search** (Autocomplete, Product search) | Inverted index | Elasticsearch + Redis |
| **Geospatial** (Uber, Maps) | QuadTree/GeoHash | Redis GEO + PostgreSQL/PostGIS |
| **Collaborative** (Google Docs) | OT/CRDT + WebSocket | OT Engine + Redis + PostgreSQL |
| **Media** (YouTube, Instagram) | Upload pipeline + CDN | S3 → Transcoding → CDN |
| **E-commerce** (Cart, Orders) | Event-driven + ACID | Kafka + PostgreSQL + Redis |

### 4. 🧮 Numbers Every Engineer Should Know

```
Latency:
  L1 cache reference:              0.5 ns
  RAM reference:                   100 ns
  SSD random read:                 16 μs
  HDD seek:                        4 ms
  Network round trip (same DC):    0.5 ms
  Network round trip (cross-US):   40 ms
  Network round trip (US → Europe): 80 ms
  Network round trip (US → Asia):  150 ms

Throughput:
  Single PostgreSQL:               5,000-10,000 QPS
  Single MySQL:                    5,000-10,000 QPS
  Single Redis:                    100,000+ QPS
  Single Cassandra node:           10,000-50,000 QPS
  Single Kafka broker:             100,000+ msg/sec
  Single NGINX server:             10,000+ concurrent connections

Storage:
  1 million users × 1KB profile  = 1 GB
  1 billion messages × 100 bytes = 100 GB
  1 million images × 200KB       = 200 GB
  1 million videos × 50MB        = 50 TB

Useful Conversions:
  86,400 seconds/day   ≈ ~100,000 (use for quick math)
  2.5 million seconds/month
  1 million requests/day ≈ ~12 QPS
  1 billion requests/day ≈ ~12,000 QPS
```

---

## 7. Complexity Analysis 🧠

### Time Allocation Guide

```
45-Minute Interview:
  ┌─────────────────────────────────────────────────────────┐
  │ Requirements     5 min  ███░░░░░░░░░░░░░░░░░░░░░░  11% │
  │ Estimation       5 min  ███░░░░░░░░░░░░░░░░░░░░░░  11% │
  │ High-Level      15 min  █████████░░░░░░░░░░░░░░░░  33% │
  │ Deep Dive       20 min  ████████████░░░░░░░░░░░░░  45% │
  └─────────────────────────────────────────────────────────┘

60-Minute Interview:
  ┌─────────────────────────────────────────────────────────┐
  │ Requirements     5 min  ██░░░░░░░░░░░░░░░░░░░░░░░   8% │
  │ Estimation       5 min  ██░░░░░░░░░░░░░░░░░░░░░░░   8% │
  │ High-Level      15 min  ██████░░░░░░░░░░░░░░░░░░░  25% │
  │ Deep Dive       30 min  ████████████████░░░░░░░░░  50% │
  │ Q&A / Polish     5 min  ██░░░░░░░░░░░░░░░░░░░░░░░   8% │
  └─────────────────────────────────────────────────────────┘
```

### Evaluation Criteria (What Interviewers Score)

| Criteria | Weight | What "Strong Hire" Looks Like |
| :--- | :--- | :--- |
| **Problem Solving** | 25% | Breaks down ambiguity. Identifies the hard problem. |
| **Technical Depth** | 25% | Deep knowledge of at least one area (DB, caching, messaging). |
| **Trade-off Analysis** | 20% | Never gives one option. Always presents alternatives with pros/cons. |
| **Communication** | 15% | Thinks out loud. Structures answers. Draws clear diagrams. |
| **Scalability** | 15% | Designs for growth. Knows when to optimize vs. keep simple. |

### The "Senior vs. Staff" Difference

```
SENIOR (L5/L6):
  ✓ Designs a working system
  ✓ Considers scale and performance
  ✓ Makes reasonable trade-offs
  ✓ Handles the "happy path" well

STAFF (L6/L7):
  ✓ Everything above, PLUS:
  ✓ Identifies the ONE hard problem and deep-dives
  ✓ Discusses failure modes BEFORE being asked
  ✓ References real-world systems ("This is how Netflix does it")
  ✓ Considers operational concerns (monitoring, deployment, on-call)
  ✓ Proposes iterative design ("V1 is simple, V2 adds...")
  ✓ Drives the conversation (doesn't wait for prompts)

PRINCIPAL (L7+):
  ✓ Everything above, PLUS:
  ✓ Considers organizational impact ("Which team owns this service?")
  ✓ Discusses data privacy, compliance, and regulatory concerns
  ✓ Proposes a migration strategy (not just greenfield)
  ✓ Thinks about cost optimization and ROI
```

### Interview Tips 💡

1. **The 4-step framework is non-negotiable:** Requirements → Estimation → High-Level → Deep Dive. Skipping any step signals inexperience. Even if the interviewer says "skip estimation," briefly say "At 100M DAU, we're looking at ~10K QPS" — it takes 10 seconds and shows maturity.
2. **Drive the conversation:** At the Staff+ level, YOU lead the design. Don't wait for the interviewer to ask "what about caching?" — proactively say "Let's add a caching layer here because our read:write ratio is 100:1."
3. **Trade-offs are the #1 signal:** Never say "I'd use PostgreSQL." Say "I'd use PostgreSQL for ACID compliance on financial data. If we needed higher write throughput, I'd consider Cassandra, but we'd lose strong consistency." The interviewer is testing your judgment, not your memorization.
4. **Acknowledge what you don't design:** "I'm intentionally leaving the admin panel out of scope, but in production we'd need content moderation, user reports, and audit logging." This shows breadth without wasting time.
5. **Bring up failures BEFORE you're asked:** "What happens if this Redis cache node goes down? We have a cluster with replicas, and the app falls back to the database with slightly higher latency. No data loss." Proactively discussing failure modes is the single biggest differentiator between Senior and Staff.
6. **Use the "V1 → V2" technique:** "For V1, we'll use a simple polling approach. Once we validate the product, V2 upgrades to WebSocket for real-time updates." This shows pragmatism — you don't over-engineer from day one.
7. **End with a summary:** In the last 2 minutes, summarize: "We designed a system handling 10K QPS with 99.99% availability. The key trade-off was AP over CP for the feed cache. The hardest problem was [X] and we solved it with [Y]." This leaves a strong final impression.
