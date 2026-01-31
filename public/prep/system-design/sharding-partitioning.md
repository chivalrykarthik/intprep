# Data Partitioning & Sharding 🧩

## 1. The "Phone Book" Analogy

Imagine printing a phone book for the entire world (8 billion names).
1.  **Too Heavy:** One book is physically impossible to carry (Disk full).
2.  **Too Crowded:** Only one person can read it at a time (Throughput bottleneck).

**Partitioning (Sharing) Solutions:**
*   **Range (Volumes):** Vol 1 (A-K), Vol 2 (L-Z).
    *   *Problem:* 'S' (Smith) is huge. Vol 2 is 3x thicker than Vol 1.
*   **Directory (Lookup Service):** A librarian tells you "Smith is in Shelf 4, Book 2".
*   **Hash (Algorithmic):** `Hash(Name) % 10`. Last digit of your ID determines the book.

**This is Sharding.** Splitting a large dataset into smaller, manageable chunks (shards) distributed across multiple servers.

---

## 2. The Core Concept

**Vertical Scaling (Scale Up):** Buy a bigger server (more RAM/CPU).
*   *Limit:* Hardware limits, VERY expensive.

**Horizontal Scaling (Scale Out / Sharding):** Buy more cheap servers.
*   *Limit:* Complexity of data distribution and cross-shard queries.

### Sharding Strategies

| Strategy | Description | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **Key-Range** | Partition by ID (1-1000, 1001-2000) | Easy implementation, efficiently range scans. | **Hotspots** (Sequential IDs go to one shard). |
| **Hash** | `hash(id) % N` | Uniform distribution. | Resharding is painful (N changes? Moves key). **No range queries**. |
| **Directory** | Lookup table `Key -> Server` | Highly flexible. Can move individual keys. | Single point of failure (the lookup DB). Added latency. |
| **Geo** | By Region (US-User -> US-DB) | Low latency, Data Laws (GDPR). | Imbalanced load (NY vs Wyoming). |

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "architecture-diagram",
  "content": "graph TD\n    User-->LB[Load Balancer]\n    LB-->App[App Server]\n    App-->|hash(id)| Router[Request Router]\n    \n    Router-->|0-33| S1[(Shard 1: User A-I)]\n    Router-->|34-66| S2[(Shard 2: User J-R)]\n    Router-->|67-100| S3[(Shard 3: User S-Z)]\n    \n    subgraph Shard 1\n    S1 --- R1[Replica]\n    end"
}
```

---

## 4. Scenario A: The "Celebrity" Problem (Hot Keys)

**Real-Life Scenario:** Twitter.
*   Most users have < 1000 followers.
*   Katy Perry has 100 Million followers.
*   If we shard by `User ID`, the shard containing Katy Perry will melt down anytime she tweets (Write/Read spike).

**Technical Problem:** Handling skewed workloads in partitioned systems.

### Workarounds Implementation

```typescript
/**
 * HANDLING HOT KEYS (SKEW)
 * 
 * Strategy: Append a random value to "Hot" keys to spread them out.
 */

class ShardingRouter {
    shardCount: number = 10;
    
    // List of known hot keys (maintained by analytics)
    hotKeys: Set<string> = new Set(['katy_perry', 'justin_bieber']);

    /**
     * WRITE path
     * If hot, write to a random shard (or multiple).
     */
    getWriteShards(key: string, data: any): number[] {
        if (this.hotKeys.has(key)) {
            // Hot Key Strategy 1: Write to one random shard?
            // No, then reads are hard. 
            // Better Strategy: Hot Key Isolation or Salting.
            
            // Example: Isolate hot key to dedicated high-performance hardware
            // return [DEDICATED_SHARD_ID];

            // Example: Write to *one* shard using salt, tracking current sequence
            // For simple "Tweet" inserts, just salt it randomly 
            // because writes don't conflict.
            const salt = Math.floor(Math.random() * this.shardCount);
            return [this.hash(`${key}:${salt}`)];
        }
        
        return [this.hash(key)];
    }

    /**
     * READ path
     * If hot, we might need to query ALL shards (Scatter-Gather).
     */
    async readData(key: string) {
        if (this.hotKeys.has(key)) {
            // SCATTER-GATHER: Read from all potential locations
            const promises = [];
            for(let i=0; i<this.shardCount; i++) {
                promises.push(this.queryShard(`${key}:${i}`));
            }
            return Promise.all(promises);
        } else {
            // Direct lookup
            const shardId = this.hash(key);
            return this.queryShardAt(shardId, key);
        }
    }
    
    // Helper
    hash(key: string): number {
        // ... simple modulo hash
        return 0; 
    }
}
```

---

## 5. Scenario B: The ID Generation Problem

**Problem:** In a single DB, `AUTO_INCREMENT` works fine. In 10 shards, `1, 2, 3` will collide.
**Goal:** Generate unique, sortable IDs across distributed systems without coordination.

### Snowflake ID (Twitter Standard)

Structure (64 bits):
*   **Sign bit:** 1 bit (Unused)
*   **Timestamp:** 41 bits (Milliseconds since epoch)
*   **Datacenter ID:** 5 bits
*   **Machine ID:** 5 bits
*   **Sequence:** 12 bits (For collisions in same millisecond)

**Result:**
*   Sortable by time (because Timestamp is high bits).
*   Unique globally.
*   No centralized DB needed.

```typescript
class Snowflake {
  private datacenterId: number;
  private machineId: number;
  private sequence: number = 0;
  private lastTimestamp: number = -1;

  generate(): bigint {
    let timestamp = Date.now();

    if (timestamp === this.lastTimestamp) {
      // Same ms, increment sequence
      this.sequence = (this.sequence + 1) & 4095;
      if (this.sequence === 0) {
        // Sequence overflow, wait for next ms
        while (timestamp <= this.lastTimestamp) {
          timestamp = Date.now();
        }
      }
    } else {
      this.sequence = 0;
    }

    this.lastTimestamp = timestamp;

    // Shift and combine (Pseudocode for BigInt ops)
    // (Timestamp << 22) | (Datacenter << 17) | (Machine << 12) | Sequence
    return BigInt(timestamp); 
  }
}
```

---

## 6. Real World Applications 🌍

### 1. 👾 Discord (Messages)
*   **Problem:** Billions of messages.
*   **Strategy:** Key-Range Sharding by `ChannelID`.
*   **Why?** All messages for one channel stay together. Read queries are "Give me last 50 msgs in Channel X". This hits ONE shard.
*   **Pitfall:** A massive public server (Millions of users) becomes a hot shard.

### 2. 🚕 Uber (Trips)
*   **Problem:** Geo-queries. "Find drivers near me".
*   **Strategy:** Geohash / H3 (Hexagonal Grid).
*   **Sharding:** Shard by City/Cell.
*   **Pitfall:** New Year's Eve in NYC. One shard melts. Auto-scaling specific shards is required.

### 3. 🖼️ Instagram (Photos)
*   **ID Gen:** Uses Postgres implementation of Snowflake (PL/PGSQL).
*   **Sharding:** Directory Based. Users specific mapping to logical shards.

---

## 7. Challenges & Complexity 🧠

### 1. Joins are Dead 💀
*   **Problem:** `SELECT * FROM Orders o JOIN Users u ON o.uid = u.id`
*   If `User 1` is on Shard A and `Order 1` is on Shard B, the DB **cannot** join them.
*   **Solution:**
    *   **Denormalization:** Store `User Name` inside the `Order` table.
    *   **App-Side Join:** App queries Shard A, then queries Shard B, then combines variables in memory.

### 2. Resharding (The Nightmare)
Moving data from 10 shards to 20 shards while the site is LIVE.
*   **Consistent Hashing:** Reduces movement.
*   **Hierarchical Sharding:** Use logical shards (1000) mapped to physical servers (10). Move logical shards, not rows.

### Interview Tips 💡
1.  **Don't start with Sharding:** "I would scale vertically first, then Read Replicas, then Cache. Sharding is the last resort due to complexity."
2.  **Choose the Shard Key:** This is the most critical decision.
    *   *By UserID:* Good for "Show my data". Bad for "Show all posts".
    *   *By Time:* Good for logs. Bad for load balancing (all writes hit the 'Today' shard).
3.  **Global Secondary Indexes:** "If I shard by UserID, how do I lookup by Email? I need a separate Lookup Table (Index) mapped to UserIDs."
