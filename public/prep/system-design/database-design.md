# Database Design 🗄️

## 1. The "Library" Analogy

Imagine you're designing a system to organize 10 million books.

**SQL (Relational) - The Card Catalog:**
- Every book has a card with fixed fields: Title, Author, ISBN, Genre.
- Cards are sorted in labeled drawers.
- Finding "all books by Author X" is fast—just go to the Author index.
- **BUT:** Adding a new field requires updating EVERY card.

**NoSQL (Document) - Manila Folders:**
- Each book gets a flexible folder. Put whatever notes you want inside.
- **BUT:** Finding "all books by Author X" requires checking EVERY folder.

**This is Database Design.** Choosing the right storage paradigm based on your data structure, query patterns, and scale requirements.

---

## 2. The Core Concept

**The "One Size Fits All" (Naive) Way:**
Use MySQL for everything. Struggle at scale.

**The "Right Tool for the Job" (Smart) Way:**
1. **Structured data?** → PostgreSQL, MySQL
2. **Flexible documents?** → MongoDB, DynamoDB
3. **Fast key-value?** → Redis
4. **High write throughput?** → Cassandra
5. **Graph relationships?** → Neo4j

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Database Design visualizer coming soon!"
}
```

---

## 4. Scenario A: SQL vs NoSQL Decision

### Decision Matrix

| Factor | SQL | NoSQL |
|--------|-----|-------|
| **Schema** | Fixed | Flexible |
| **Transactions** | ACID ✓ | Limited |
| **Scale** | Vertical | Horizontal |
| **Best For** | Banking, E-commerce | Content, Profiles |

### TypeScript Example

```typescript
// SQL Schema
const sqlSchema = `
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL
  );
  CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)
  );
`;

// MongoDB Document
interface UserProfile {
  _id: string;
  email: string;
  preferences: Record<string, unknown>;
}
```

---

## 5. Scenario B: Sharding Strategies

### TypeScript Implementation

```typescript
/**
 * Hash-Based Sharding
 * @timeComplexity O(1)
 */
function getHashShard(userId: number, totalShards: number): string {
  return `shard_${userId % totalShards}`;
}

/**
 * Consistent Hashing - Minimal redistribution on scale
 */
class ConsistentHashRing {
  private ring = new Map<number, string>();
  
  getShard(key: string): string {
    const hash = this.hash(key);
    // Find nearest shard on ring
    return this.ring.get(hash) || 'default';
  }
  
  private hash(key: string): number {
    return key.split('').reduce((h, c) => 
      ((h << 5) - h) + c.charCodeAt(0), 0);
  }
}
```

---

## 6. Real World Applications 🌍

### 1. 📺 Netflix - Cassandra
1M+ writes/second for viewing history.

### 2. 🛒 Amazon - DynamoDB
Infinite horizontal scaling, single-digit ms latency.

### 3. 🐦 Twitter - Hybrid
MySQL (tweets) + Redis (timelines).

---

## 7. Complexity Analysis 🧠

### CAP Theorem
- **CP Systems:** MongoDB, PostgreSQL
- **AP Systems:** Cassandra, DynamoDB

### Interview Tips 💡
1. "What's the read/write ratio?"
2. "Do we need ACID or is eventual consistency okay?"
3. "Plan sharding strategy early."
