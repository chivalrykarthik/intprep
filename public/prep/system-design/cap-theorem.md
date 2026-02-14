# CAP Theorem & Consistency Models 🔺

## 1. The "Emergency Room vs Walk-in Clinic" Analogy

Imagine a hospital network with branches across a city.

**The Dilemma:**
A patient's medical records are stored at Branch A. Suddenly, the network cable between Branch A and Branch B is cut (a **Partition**).

Now a doctor at Branch B needs the patient's allergy list before administering medication. You have two choices:

**Choice 1: Consistency (CP) — "Wait for Accurate Data"**
- Doctor at Branch B says: "I REFUSE to treat until I have the exact, up-to-date allergy list from Branch A."
- The patient waits. Maybe hours. The system is **unavailable** but **correct**.
- *Like a bank: "I'd rather reject your transaction than give you wrong balance."*

**Choice 2: Availability (AP) — "Use Best Available Data"**
- Doctor at Branch B says: "I'll use the last known copy of the records I have locally."
- Treatment starts immediately. But the local copy might be outdated — maybe the patient developed a new allergy yesterday at Branch A.
- *Like a social media feed: "I'd rather show a slightly stale post than show nothing."*

**This is the CAP Theorem.** In any distributed system experiencing a network partition, you must choose between **Consistency** and **Availability**. You cannot have both.

---

## 2. The Core Concept

The CAP Theorem (Brewer's Theorem, 2000) states that a distributed data store can only provide **two out of three** guarantees simultaneously:

### The Three Properties

| Property | Definition | Example |
| :--- | :--- | :--- |
| **Consistency (C)** | Every read receives the most recent write or an error. | All nodes see the same data at the same time. |
| **Availability (A)** | Every request receives a non-error response (no guarantee it's the latest). | System always responds, even with stale data. |
| **Partition Tolerance (P)** | System continues operating despite network partitions between nodes. | Nodes can't talk to each other but keep working. |

### Why You MUST Pick P

In the real world, **network partitions WILL happen** (cables cut, switches fail, cloud AZs disconnect). So `P` is non-negotiable. The real choice is:

```
CP: Consistent + Partition Tolerant (sacrifice Availability)
AP: Available + Partition Tolerant (sacrifice Consistency)

CA: Consistent + Available (single-node only — not distributed)
```

### The PACELC Extension (More Nuanced)

CAP only describes behavior **during** a partition. PACELC extends it:

> "If there is a **P**artition, choose **A** or **C**; **E**lse (normal operation), choose **L**atency or **C**onsistency."

| System | During Partition (PAC) | Normal Operation (ELC) |
| :--- | :--- | :--- |
| **DynamoDB** | AP (Available) | EL (Low Latency) |
| **Cassandra** | AP (Available) | EL (Low Latency) |
| **MongoDB** | CP (Consistent) | EC (Consistent) |
| **PostgreSQL** | CP (Consistent) | EC (Consistent) |
| **CockroachDB** | CP (Consistent) | EC (Consistent) |
| **Cosmos DB** | Configurable | Configurable |

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAP THEOREM TRIANGLE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                        Consistency                              │
│                           /\                                    │
│                          /  \                                   │
│                         / CP \                                  │
│                        /      \                                 │
│                       / Mongo  \                                │
│                      / Postgres \                               │
│                     / HBase      \                              │
│                    / Redis Cluster \                            │
│                   /________________\                            │
│                  /        CA        \                           │
│                 /  (Single Node)     \                          │
│                /  MySQL (standalone)  \                         │
│               /________________________\                       │
│    Availability ──────── AP ──────── Partition                  │
│                     Cassandra         Tolerance                 │
│                     DynamoDB                                    │
│                     CouchDB                                    │
│                     Riak                                        │
│                                                                 │
│  ⚠️ REALITY: P is mandatory in distributed systems.            │
│  The real choice is: CP (banks) vs AP (social media)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Consistency Models Deep Dive

**Real-Life Scenario:** You're designing a distributed database for a global e-commerce platform.

**Technical Problem:** Choose the right consistency model for different parts of your system.

### TypeScript Implementation

```typescript
/**
 * CONSISTENCY MODELS SPECTRUM
 * 
 * From Strongest to Weakest:
 * 
 * 1. Linearizability (Strongest)
 *    - Every operation appears to happen at a single instant in time.
 *    - "As if there's one copy of the data."
 *    - Used by: Zookeeper, etcd (Raft)
 * 
 * 2. Sequential Consistency
 *    - All nodes see operations in the same order.
 *    - But the order might differ from real-time wall-clock order.
 * 
 * 3. Causal Consistency
 *    - If operation A "caused" B, everyone sees A before B.
 *    - Concurrent/unrelated operations can appear in any order.
 *    - Used by: MongoDB (default), Cosmos DB
 * 
 * 4. Eventual Consistency (Weakest)
 *    - If no new writes happen, all nodes will EVENTUALLY converge.
 *    - No guarantee about how long "eventually" is.
 *    - Used by: Cassandra, DynamoDB (default), DNS
 */

// ============================================
// EXAMPLE: Showing the Consistency Problem
// ============================================

interface ReplicaNode {
  id: string;
  data: Map<string, { value: any; version: number; timestamp: number }>;
}

/**
 * Demonstrates how different consistency levels affect reads.
 */
class ConsistencyDemo {
  private nodes: ReplicaNode[] = [
    { id: 'node-1', data: new Map() },
    { id: 'node-2', data: new Map() },
    { id: 'node-3', data: new Map() },
  ];

  /**
   * STRONG CONSISTENCY (Linearizable)
   * 
   * Write: Wait for ALL replicas to acknowledge before returning.
   * Read: Read from the leader (or verify with quorum).
   * 
   * @tradeoff Higher latency, lower availability
   */
  async writeStrong(key: string, value: any): Promise<void> {
    const version = Date.now();

    // Write to ALL nodes synchronously (blocks until all confirm)
    const results = await Promise.all(
      this.nodes.map(node => this.writeToNode(node, key, value, version))
    );

    // If ANY node fails, the write fails (strict)
    if (results.some(r => !r)) {
      throw new Error('Write failed: not all replicas confirmed.');
    }
    console.log(`[STRONG] Write "${key}" confirmed by ALL ${this.nodes.length} nodes.`);
  }

  async readStrong(key: string): Promise<any> {
    // Read from quorum (majority) and return highest version
    const quorumSize = Math.floor(this.nodes.length / 2) + 1;
    const reads = await Promise.all(
      this.nodes.slice(0, quorumSize).map(n => n.data.get(key))
    );

    // Return the value with the highest version
    const latest = reads
      .filter(Boolean)
      .sort((a, b) => b!.version - a!.version)[0];

    return latest?.value;
  }

  /**
   * EVENTUAL CONSISTENCY
   * 
   * Write: Write to ONE node, return immediately. 
   *        Background replication spreads the change.
   * Read: Read from ANY node (might be stale!).
   * 
   * @tradeoff Lower latency, higher availability, but stale reads possible
   */
  async writeEventual(key: string, value: any): Promise<void> {
    const version = Date.now();
    const primaryNode = this.nodes[0];

    // Write to primary ONLY — return immediately
    await this.writeToNode(primaryNode, key, value, version);
    console.log(`[EVENTUAL] Write "${key}" to primary. Replication async.`);

    // Background replication (async, non-blocking)
    setTimeout(() => {
      this.nodes.slice(1).forEach(node => {
        this.writeToNode(node, key, value, version);
      });
      console.log(`[EVENTUAL] Background replication complete for "${key}".`);
    }, 100); // 100ms replication lag
  }

  async readEventual(key: string): Promise<any> {
    // Read from ANY node (could be stale during replication)
    const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
    const entry = randomNode.data.get(key);
    return entry?.value;
  }

  /**
   * QUORUM-BASED CONSISTENCY (Tunable)
   * 
   * R + W > N guarantees strong consistency.
   * 
   * N = Number of replicas
   * W = Write quorum (number of nodes that must confirm write)
   * R = Read quorum (number of nodes to read from)
   * 
   * Examples:
   *   N=3, W=2, R=2 → R+W=4 > 3 → Strong consistency
   *   N=3, W=1, R=1 → R+W=2 < 3 → Eventual consistency (fast!)
   *   N=3, W=3, R=1 → R+W=4 > 3 → Strong consistency (slow writes)
   */
  async writeQuorum(key: string, value: any, W: number): Promise<void> {
    const version = Date.now();
    let acks = 0;

    const writePromises = this.nodes.map(async (node) => {
      const success = await this.writeToNode(node, key, value, version);
      if (success) acks++;
    });

    await Promise.all(writePromises);

    if (acks < W) {
      throw new Error(`Write failed: only ${acks}/${W} acks received.`);
    }

    console.log(`[QUORUM] Write "${key}" confirmed by ${acks}/${this.nodes.length} nodes (W=${W}).`);
  }

  private async writeToNode(
    node: ReplicaNode, key: string, value: any, version: number
  ): Promise<boolean> {
    // Simulate occasional network failure
    if (Math.random() < 0.05) return false; // 5% failure rate

    node.data.set(key, { value, version, timestamp: Date.now() });
    return true;
  }
}
```

### The Quorum Formula

```
┌──────────────────────────────────────────────────────────┐
│                  QUORUM CONSISTENCY                       │
│                                                          │
│   N = 3 replicas                                         │
│                                                          │
│   Strong Consistency: R + W > N                          │
│   ───────────────────────────                            │
│   W=2, R=2 → 2+2=4 > 3 ✓                                │
│   W=3, R=1 → 3+1=4 > 3 ✓ (slow writes, fast reads)     │
│   W=1, R=3 → 1+3=4 > 3 ✓ (fast writes, slow reads)     │
│                                                          │
│   Eventual Consistency: R + W ≤ N                        │
│   ────────────────────────────                           │
│   W=1, R=1 → 1+1=2 ≤ 3 ✗ (fastest, but stale reads!)   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Scenario B: Choosing CP vs AP for Your System

**Real-Life Scenario:** You're a Staff Engineer deciding consistency models for different services.

**Technical Problem:** Match the right consistency model to each business requirement.

### Decision Framework

```typescript
/**
 * CP vs AP Decision Guide
 * 
 * Ask yourself: "What happens if the user sees stale data?"
 */

interface ConsistencyDecision {
  service: string;
  consequence_of_stale_data: string;
  choice: 'CP' | 'AP';
  database: string;
  reasoning: string;
}

const decisions: ConsistencyDecision[] = [
  {
    service: 'Payment Service',
    consequence_of_stale_data: 'Double charging, money creation/destruction',
    choice: 'CP',
    database: 'PostgreSQL (ACID)',
    reasoning: 'Financial data MUST be correct. Better to reject a transaction than process it wrong.',
  },
  {
    service: 'Inventory Count',
    consequence_of_stale_data: 'Overselling (selling item that is out of stock)',
    choice: 'CP',
    database: 'PostgreSQL with row-level locking',
    reasoning: 'Critical for e-commerce. Overselling costs more than briefly showing "out of stock".',
  },
  {
    service: 'User Profile',
    consequence_of_stale_data: 'User sees old avatar for 2 seconds',
    choice: 'AP',
    database: 'DynamoDB / MongoDB',
    reasoning: 'Nobody cares if their bio update takes 2 seconds to propagate.',
  },
  {
    service: 'Social Media Feed',
    consequence_of_stale_data: 'Post appears 5 seconds late',
    choice: 'AP',
    database: 'Cassandra + Redis cache',
    reasoning: 'Availability > Consistency. Better to show a slightly stale feed than show nothing.',
  },
  {
    service: 'Shopping Cart',
    consequence_of_stale_data: 'Item appears/disappears briefly',
    choice: 'AP',
    database: 'DynamoDB',
    reasoning: 'Amazon chose AP for carts: "We never want to tell a customer they cant add to cart."',
  },
  {
    service: 'Leader Election / Config',
    consequence_of_stale_data: 'Split brain, two leaders, data corruption',
    choice: 'CP',
    database: 'etcd (Raft) / ZooKeeper',
    reasoning: 'Cluster coordination MUST be consistent. Sacrifice availability during partitions.',
  },
  {
    service: 'DNS',
    consequence_of_stale_data: 'User hits old server IP for a few minutes',
    choice: 'AP',
    database: 'Distributed DNS (eventual)',
    reasoning: 'DNS updates propagate in minutes/hours. Availability is paramount.',
  },
];
```

### Database Classification Table

| Database | CAP | Default Consistency | Tunable? | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | CP | Strong (ACID) | No | Banking, E-commerce |
| **MySQL** | CP | Strong (ACID) | No | Traditional CRUD apps |
| **MongoDB** | CP | Causal (default) | Yes | Documents, profiles |
| **Cassandra** | AP | Eventual | Yes (tunable quorum) | Time-series, IoT, logs |
| **DynamoDB** | AP | Eventual | Yes (strong reads) | Shopping carts, sessions |
| **CockroachDB** | CP | Serializable | No | Global SQL, fintech |
| **Redis** | AP | Eventual (async repl) | No | Cache, sessions |
| **etcd** | CP | Linearizable (Raft) | No | Config, leader election |
| **Cosmos DB** | Configurable | 5 levels available | Yes | Multi-model, global apps |

---

## 6. Real World Applications 🌍

### 1. 🛒 Amazon Dynamo Paper (AP)

The 2007 Dynamo paper is one of the most influential in distributed systems. Amazon chose **AP** for their shopping cart:
- *"We'd rather show an item in your cart that you already removed than lose an item you added."*
- Uses vector clocks for conflict detection and "last writer wins" or application-level merge.
- Inspired DynamoDB, Cassandra, Riak.

### 2. 💰 Google Spanner (CP with Global Consistency)

Google Spanner achieves the "impossible" — **globally consistent** SQL at scale:
- Uses **TrueTime** (atomic clocks + GPS in every data center) to timestamp transactions.
- Provides **external consistency** (stronger than linearizability).
- Trade-off: Higher latency (cross-continent transactions ~150ms).
- Used for Google Ads billing (money must be correct).

### 3. 📺 Netflix (AP with Read-Your-Writes)

Netflix uses Cassandra (AP) but adds **Read-Your-Writes consistency**:
- When you rate a movie, the NEXT page load reads from the primary replica.
- After 2 seconds, subsequent reads can go to any replica (eventual).
- This gives the *illusion* of strong consistency without the cost.

### 4. 🐦 Twitter (Hybrid: CP + AP)

Twitter uses different models for different data:
- **Tweets DB (MySQL):** CP — tweets must not be lost or duplicated.
- **Timeline Cache (Redis):** AP — stale feed for 2 seconds is fine.
- **Follower Graph (FlockDB):** AP — eventually consistent relationship updates.

---

## 7. Complexity Analysis 🧠

### Consistency vs Performance

```
Strong Consistency (Linearizable):
  - Write latency:  ~150ms (cross-region quorum)
  - Read latency:   ~50ms (quorum read)
  - Throughput:      ~1,000-5,000 writes/sec
  - Availability:    Lower (rejects writes during partition)

Eventual Consistency:
  - Write latency:  ~5ms (local replica only)
  - Read latency:   ~1ms (any replica)
  - Throughput:      ~100,000+ writes/sec
  - Availability:    Higher (always accepts writes)

The speed difference is 10-100x!
```

### Conflict Resolution Strategies

| Strategy | How It Works | Used By |
| :--- | :--- | :--- |
| **Last Writer Wins (LWW)** | Highest timestamp wins | Cassandra, DynamoDB |
| **Vector Clocks** | Track causal ordering, detect conflicts | Riak, Dynamo |
| **CRDTs** | Merge mathematically (no conflicts possible) | Redis Enterprise, Figma |
| **Application-Level** | App decides how to merge (custom logic) | Shopping carts |

### Interview Tips 💡

1. **Don't say "CAP means pick 2 of 3":** Say "P is non-negotiable in distributed systems, so the real choice is CP vs AP."
2. **Know PACELC:** "Even without partitions, there's a Latency vs Consistency trade-off."
3. **Be specific:** "For payments, I'd choose CP (PostgreSQL). For the activity feed, AP (Cassandra)."
4. **Mention tunable consistency:** "Cassandra lets you choose per-query: `QUORUM` for important reads, `ONE` for fast reads."
5. **Reference the Dynamo paper:** "Amazon's 2007 Dynamo paper defined AP for shopping carts and inspired an entire generation of databases."
6. **Quorum formula:** "R + W > N guarantees overlap between read and write sets, ensuring strong consistency."
7. **Real systems are hybrid:** "Most production systems use different consistency models for different data. E.g., in an e-commerce app: CP for inventory/payments (PostgreSQL), AP for product catalog/reviews (DynamoDB), and tunable for search (Elasticsearch). Show the interviewer you think in terms of per-component trade-offs, not one-size-fits-all."
