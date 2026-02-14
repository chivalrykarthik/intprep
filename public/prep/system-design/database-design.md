# Database Design 🗄️

## 1. The "Library vs Warehouse" Analogy

Imagine you're building a storage system for 10 million books.

**SQL (Relational) - The Organized Library:**
- Every book has a catalog card with **fixed fields**: Title, Author, ISBN, Genre, Year.
- Cards are cross-referenced: "Author A" links to all their books.
- Finding "all books by Author X published after 2020" is **instant**—the index does the work.
- **BUT:** Adding a new field like "Mood" requires updating the ENTIRE catalog system.
- **STRENGTH:** Relationships, consistency, complex queries.

**NoSQL (Document) - The Flexible Warehouse:**
- Each book gets its own **manila folder**. Put whatever you want inside.
- One folder has `{title, author}`, another has `{title, author, reviews, mood, audioVersion}`.
- **FLEXIBILITY:** Schema can evolve without migrations.
- **BUT:** Finding "all books by Author X" might require scanning EVERY folder (unless you index).
- **STRENGTH:** Scalability, flexibility, high write throughput.

**This is Database Design.** Choosing the right storage paradigm based on your data structure, query patterns, consistency requirements, and scale.

---

## 2. The Core Concept

In system design interviews, database choice is often THE pivotal decision that shapes everything else.

**The "One Size Fits All" (Naive) Way:**
Use MySQL for everything. Store JSON in text columns. Fight with ORM for document storage. Struggle at scale.

**The "Right Tool for the Job" (Smart) Way:**
Analyze your requirements, then choose:
1. **Structured, relational data with complex queries?** → PostgreSQL, MySQL
2. **Flexible documents, rapid iteration?** → MongoDB, DynamoDB
3. **Sub-millisecond key-value access?** → Redis, Memcached
4. **Massive write throughput, time-series?** → Cassandra, ScyllaDB
5. **Highly connected data, relationship traversal?** → Neo4j, Neptune
- **Boom.** Each database excels at what it's designed for.

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                    SQL vs NoSQL COMPARISON                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SQL (Relational)                NoSQL (Document)               │
│  ════════════════                ═══════════════                │
│                                                                 │
│  ┌──────────────────┐            ┌──────────────────┐           │
│  │ users            │            │ {                │           │
│  ├──────────────────┤            │   _id: "u123",   │           │
│  │ id │ name │ age  │            │   name: "John",  │           │
│  ├────┼──────┼──────┤            │   age: 30,       │           │
│  │ 1  │ John │ 30   │            │   orders: [...]  │           │
│  │ 2  │ Jane │ 25   │            │ }                │           │
│  └──────────────────┘            └──────────────────┘           │
│                                                                 │
│  ✓ ACID Transactions             ✓ Flexible Schema              │
│  ✓ Complex JOINs                 ✓ Horizontal Scaling           │
│  ✓ Strong Consistency            ✓ High Write Throughput        │
│  ✗ Harder to Scale               ✗ Eventual Consistency         │
│                                                                 │
│  Use: Banking, E-commerce        Use: Profiles, CMS, IoT        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: SQL vs NoSQL Deep Dive

**Real-Life Scenario:** You're designing the database for a new e-commerce platform.

**Technical Problem:** Choose the right database type based on specific requirements.

### TypeScript Implementation

```typescript
/**
 * SQL (PostgreSQL) - Structured, Relational Data
 * 
 * Best for: E-commerce, Banking, ERP, anything with:
 * - Complex relationships (users → orders → items → products)
 * - Need for ACID transactions
 * - Complex reporting queries (JOINs, aggregations)
 * 
 * @example E-commerce schema
 */
const ecommerceSQL = `
  -- Users table with strict schema
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexing for fast lookups
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
  );

  -- Orders with foreign key relationship
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered')),
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Order items (many-to-many through junction)
  CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL
  );

  -- Complex query: Monthly revenue by category
  SELECT 
    c.name AS category,
    DATE_TRUNC('month', o.created_at) AS month,
    SUM(oi.quantity * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  JOIN products p ON oi.product_id = p.id
  JOIN categories c ON p.category_id = c.id
  WHERE o.status = 'delivered'
  GROUP BY c.name, DATE_TRUNC('month', o.created_at)
  ORDER BY month DESC, revenue DESC;
`;

/**
 * NoSQL (MongoDB) - Flexible, Document-Based
 * 
 * Best for: Content management, User profiles, Catalogs with:
 * - Varying schema per document
 * - Embedded/denormalized data
 * - Horizontal scaling needs
 * 
 * @example User profile with flexible fields
 */
interface UserProfileDocument {
  _id: string;
  email: string;
  profile: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  preferences: {
    theme: 'dark' | 'light';
    notifications: {
      email: boolean;
      push: boolean;
      frequency: 'instant' | 'daily' | 'weekly';
    };
    language: string;
  };
  // Flexible - different users can have different social links
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  // Embedded - no JOIN needed
  recentOrders?: Array<{
    orderId: string;
    total: number;
    date: Date;
  }>;
  // Analytics embedded per user
  activityStats?: {
    lastLogin: Date;
    totalOrders: number;
    lifetimeValue: number;
  };
}

/**
 * Key-Value (Redis) - Ultra-Fast Caching
 * 
 * Best for: Sessions, caching, rate limiting, leaderboards
 * 
 * @example Common patterns
 */
const redisPatterns = {
  // Session storage
  'session:abc123': JSON.stringify({ userId: 'u1', role: 'admin', exp: 1234567890 }),
  
  // Caching (with TTL)
  'cache:user:1': JSON.stringify({ id: 1, name: 'John' }), // TTL: 5 minutes
  
  // Rate limiting (sliding window)
  'ratelimit:api:user:1': '45', // 45 requests in current window
  
  // Leaderboard (Sorted Set)
  'leaderboard:game:scores': [
    { score: 1000, member: 'player1' },
    { score: 950, member: 'player2' },
  ],
  
  // Pub/Sub for real-time
  'channel:notifications': 'subscribe for real-time updates',
};
```

### Decision Matrix

| Factor | SQL (PostgreSQL) | Document (MongoDB) | Key-Value (Redis) |
|--------|------------------|--------------------|--------------------|
| **Schema** | Fixed, strict | Flexible | None |
| **Relationships** | Excellent (JOINs) | Embedded or manual | N/A |
| **Transactions** | Full ACID ✓ | Document-level | Limited |
| **Scale** | Vertical (primarily) | Horizontal ✓ | Horizontal ✓ |
| **Query Power** | Complex SQL ✓ | JSON queries | Simple get/set |
| **Latency** | 1-10ms | 1-10ms | <1ms ✓ |
| **Best For** | Banking, E-commerce | Profiles, CMS | Cache, Sessions |

### Sample input and output
- **Input:** "Need ACID transactions for payments" → **Output:** PostgreSQL
- **Input:** "User profiles with varying fields" → **Output:** MongoDB
- **Input:** "Session storage with 100K concurrent users" → **Output:** Redis

---

## 5. Scenario B: Scaling Databases (Sharding & Replication)

**Real-Life Scenario:** Your user table has grown to 1 billion rows. Single database can't handle the load.

**Technical Problem:** Design a sharding and replication strategy to distribute data and handle failures.

### TypeScript Implementation

```typescript
/**
 * Database Scaling Strategies
 * 
 * @timeComplexity Varies by strategy
 * @spaceComplexity O(N) where N = total data
 */

// ============================================
// REPLICATION: High Availability & Read Scaling
// ============================================

/**
 * Master-Replica (Read Replicas)
 * 
 * Pattern:
 * - All WRITES go to Master
 * - READS distributed across Replicas
 * - Async replication (eventual consistency)
 * 
 * Use case: Read-heavy workloads (90% reads, 10% writes)
 */
class ReadReplicaRouter {
  private master: DatabaseConnection;
  private replicas: DatabaseConnection[];
  private currentReplica = 0;

  async query(sql: string, isWrite: boolean = false): Promise<any> {
    if (isWrite) {
      // Writes always go to master
      return this.master.execute(sql);
    }
    
    // Round-robin across replicas for reads
    const replica = this.replicas[this.currentReplica];
    this.currentReplica = (this.currentReplica + 1) % this.replicas.length;
    return replica.execute(sql);
  }
}

// ============================================
// SHARDING: Horizontal Partitioning
// ============================================

/**
 * Range-Based Sharding
 * 
 * Split data by ID ranges.
 * @pros Simple to implement and understand
 * @cons Hot spots if one range is more active (e.g., new users)
 */
function getRangeShard(userId: number): string {
  if (userId < 1_000_000) return 'shard_1';       // Users 0-999,999
  if (userId < 5_000_000) return 'shard_2';       // Users 1M-4.99M
  if (userId < 10_000_000) return 'shard_3';      // Users 5M-9.99M
  return 'shard_4';                                // Users 10M+
}

/**
 * Hash-Based Sharding
 * 
 * Distribute evenly using hash of user ID.
 * @pros Even distribution across shards
 * @cons Resharding is expensive (all data moves when adding shards)
 * 
 * @timeComplexity O(1)
 */
function getHashShard(userId: number, totalShards: number): string {
  const shardIndex = userId % totalShards;
  return `shard_${shardIndex}`;
}

/**
 * Geographic Sharding
 * 
 * Shard by user region for data locality.
 * @pros Data stays close to users, GDPR compliance
 * @cons Cross-region queries are complex
 */
interface User {
  id: number;
  email: string;
  region: 'US' | 'EU' | 'APAC';
}

function getGeoShard(user: User): string {
  const mapping: Record<string, string> = {
    'US': 'shard_us_east',
    'EU': 'shard_eu_frankfurt',
    'APAC': 'shard_ap_singapore',
  };
  return mapping[user.region] || 'shard_default';
}

/**
 * Directory-Based Sharding (Lookup Service)
 * 
 * A separate service maps keys to shards.
 * @pros Flexible, can move data without changing hash
 * @cons Extra hop for every query, single point of failure
 */
class ShardDirectory {
  private directory: Map<string, string> = new Map();

  async getShard(key: string): Promise<string> {
    // Check directory first
    if (this.directory.has(key)) {
      return this.directory.get(key)!;
    }
    
    // Default to hash-based for new keys
    const shard = `shard_${this.hash(key) % 4}`;
    this.directory.set(key, shard);
    return shard;
  }

  private hash(key: string): number {
    return key.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0) >>> 0;
  }
}
```

### Replication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MASTER-REPLICA SETUP                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ┌─────────────┐         WRITES                           │
│    │   Master    │◄────────────────┐                        │
│    │   (Primary) │                 │                        │
│    └──────┬──────┘           ┌─────┴─────┐                  │
│           │                  │Application│                  │
│    Async Replication         └─────┬─────┘                  │
│           │                        │                        │
│    ┌──────┴──────┐                 │ READS                  │
│    │             │                 │                        │
│    ▼             ▼                 ▼                        │
│ ┌──────┐    ┌──────┐    Load Balancer                       │
│ │Replica│   │Replica│         │                             │
│ │  #1  │   │  #2  │◄─────────┘                             │
│ └──────┘    └──────┘                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Real World Applications 🌍

### 1. 📺 Netflix - Cassandra for Viewing History

**Scale:** 1 million+ writes per second
**Choice:** Cassandra (wide-column NoSQL)
**Why:**
- Time-series data (what you watched, when)
- Write-heavy workload
- Eventual consistency is fine (no one dies if viewing history is 2 seconds stale)

### 2. 🛒 Amazon - DynamoDB for Cart & Sessions

**Scale:** Infinite horizontal scaling
**Choice:** DynamoDB (key-value + document)
**Why:**
- Single-digit millisecond latency at any scale
- Fully managed, auto-scaling
- Perfect for session data and shopping carts

### 3. 🐦 Twitter - Hybrid Approach

**Combination:**
- **MySQL:** Source of truth for tweets, users (ACID)
- **Redis:** Timeline caching (sub-ms reads)
- **Manhattan (custom):** Low-latency tweet storage

**Lesson:** Real systems often use MULTIPLE databases.

### 4. 💳 Stripe - PostgreSQL for Payments

**Choice:** PostgreSQL
**Why:**
- Financial data REQUIRES ACID transactions
- Complex queries for fraud detection
- Strong consistency is non-negotiable
- Regulatory compliance (audit trails)

---

## 7. Complexity Analysis 🧠

### CAP Theorem

In a distributed database, you can only guarantee 2 of 3:

```
                 Consistency
                    /\
                   /  \
                  /    \
                 /  CP  \
                /________\
               /          \
              /     CA     \
             /______________\
      Availability ──────── Partition Tolerance
                      AP
```

| System | Type | Trade-off |
|--------|------|-----------|
| **PostgreSQL** | CP | Sacrifices availability during partition |
| **MongoDB** | CP | Configurable, defaults to consistency |
| **Cassandra** | AP | Eventual consistency, always available |
| **DynamoDB** | AP | Configurable with strong consistency option |

### Query Performance Comparison

| Operation | SQL (Indexed) | MongoDB | Redis | Cassandra |
|-----------|---------------|---------|-------|-----------|
| Point lookup | O(log N) | O(log N) | O(1) ✓ | O(1) |
| Range query | O(log N + K) | O(log N + K) | N/A | O(log N + K) |
| Full-text | Specialized | Built-in | N/A | N/A |
| JOIN | O(N × M) | Manual | N/A | N/A |
| Aggregation | Excellent ✓ | Good | Limited | Limited |

### Interview Tips 💡

1. **Start with requirements:** "What's the read/write ratio? What consistency level?"
2. **Discuss ACID vs BASE:** "Banking needs ACID; social feeds can be eventually consistent."
3. **Consider indexing:** "We'll create indexes on frequently queried columns."
4. **Plan for growth:** "We'll shard by user_id when we hit 10M users."
5. **Mention backups:** "Daily snapshots + point-in-time recovery with WAL."
6. **Know the numbers:** "PostgreSQL handles ~5K QPS; Redis handles ~100K QPS."
7. **Read replicas and connection pooling:** "For read-heavy workloads, add read replicas (up to 5 in AWS RDS). Always use connection pooling (PgBouncer) — without it, each new connection costs ~10ms and consumes a process slot."
