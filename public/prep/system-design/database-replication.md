# Database Replication 🔄

## 1. The "Newspaper Press" Analogy

Imagine you run a newspaper in 1950.

**The Original Press (Primary/Master):** One printing press in New York produces the master copy. Every journalist submits edits to THIS press. It's the single source of truth.

**The Problem:** Readers in Los Angeles, Chicago, and London can't all read from the New York press. They'd form a line that stretches across the country.

**The Solution: Make Copies**

**Copy Presses (Replicas/Slaves):** You set up identical printing presses in LA, Chicago, and London. Every time the New York press prints a new edition, it ships the plates (the "Write-Ahead Log") to the copy presses. They reproduce the exact same newspaper.

- **One-way copying (Primary-Replica):** Journalists only submit to New York. Copy presses only reproduce. Simple and reliable.
- **Two-way editing (Multi-Master):** Journalists can submit to ANY press. But now what happens if a New York journalist changes a headline at the same time a London journalist changes the SAME headline? **Conflict.** This is the hardest problem in replication.

**This is Database Replication.** The primary database handles writes. Replicas handle reads. The mechanism that ships changes is the **Write-Ahead Log (WAL)** — a sequential record of every change, shipped to replicas and replayed in order.

---

## 2. The Core Concept

Database replication serves three goals:

1. **High Availability:** If the primary dies, a replica takes over (failover). Downtime < 30 seconds.
2. **Read Scalability:** 1 primary handles writes, 5 replicas handle reads → 5× read throughput.
3. **Geographic Distribution:** Replica in Europe serves European users with < 50ms latency instead of 200ms cross-Atlantic.

### Replication Topologies

| Topology | How It Works | Writes | Conflicts? | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Single-Leader (Primary-Replica)** | One primary, N replicas | Primary only | No | Most applications (default) |
| **Multi-Leader (Multi-Master)** | Multiple primaries, cross-replicate | Any primary | ✅ Yes | Multi-region active-active |
| **Leaderless (Dynamo-style)** | Any node accepts reads/writes | Any node | ✅ Yes | Cassandra, DynamoDB, Riak |

```
SINGLE-LEADER (Most Common)
┌──────────┐      WAL Stream       ┌──────────┐
│ Primary  │ ───────────────────▶  │ Replica 1│ ← Reads
│ (Writes) │ ───────────────────▶  │ Replica 2│ ← Reads
│          │ ───────────────────▶  │ Replica 3│ ← Reads
└──────────┘                       └──────────┘

MULTI-LEADER (Multi-Region)
┌──────────┐ ◄──── Conflict ────▶ ┌──────────┐
│ Primary  │      Resolution      │ Primary  │
│ US-EAST  │ ◄─── Bi-directional  │ EU-WEST  │
│          │      Replication ───▶ │          │
└─────┬────┘                      └─────┬────┘
      │                                 │
  ┌───▼────┐                        ┌───▼────┐
  │Replicas│                        │Replicas│
  └────────┘                        └────────┘

LEADERLESS (Dynamo-Style)
  ┌────────┐   ┌────────┐   ┌────────┐
  │ Node A │◄─▶│ Node B │◄─▶│ Node C │
  └────────┘   └────────┘   └────────┘
      Write to 2 of 3 nodes (W=2)
      Read from 2 of 3 nodes (R=2)
      W + R > N → Guaranteed fresh read (Quorum)
```

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                  WRITE-AHEAD LOG (WAL) REPLICATION               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Client sends WRITE to Primary                               │
│  ┌────────┐     INSERT INTO orders (id, total)                  │
│  │ Client │──── VALUES ('ord_1', 49.99) ──────┐                 │
│  └────────┘                                   │                 │
│                                               ▼                 │
│  2. Primary writes to WAL FIRST, then to table                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ PRIMARY DATABASE                                    │        │
│  │                                                     │        │
│  │  WAL (Write-Ahead Log):                             │        │
│  │  ┌──────┬──────┬──────┬──────┬──────┐               │        │
│  │  │LSN=1 │LSN=2 │LSN=3 │LSN=4 │LSN=5 │               │        │
│  │  │INSERT│UPDATE│DELETE│INSERT│UPDATE│ ← Append-only  │        │
│  │  │users │users │cart  │orders│orders│   sequential   │        │
│  │  └──────┴──────┴──────┴──────┴──────┘               │        │
│  │       │                                             │        │
│  │       ▼                                             │        │
│  │  Table (materialized):                              │        │
│  │  ┌────────┬────────┐                                │        │
│  │  │ ord_1  │ $49.99 │                                │        │
│  │  └────────┴────────┘                                │        │
│  └─────────────────────────────────────────────────────┘        │
│                     │                                           │
│  3. WAL entries streamed to replicas                            │
│                     │ streaming replication                     │
│           ┌─────────┼─────────┐                                 │
│           ▼         ▼         ▼                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │REPLICA 1 │ │REPLICA 2 │ │REPLICA 3 │                        │
│  │ LSN=5 ✅  │ │ LSN=4 ⏳  │ │ LSN=3 ⏳  │ ← Replication lag   │
│  │ (caught   │ │ (1 entry │ │ (2 entries│                       │
│  │  up)      │ │  behind) │ │  behind)  │                       │
│  └──────────┘ └──────────┘ └──────────┘                        │
│                                                                 │
│  4. Client reads from Replica                                   │
│  ┌────────┐     SELECT * FROM orders                            │
│  │ Client │──── WHERE id = 'ord_1' ───▶ Replica 2              │
│  └────────┘                                                     │
│  ⚠️ Replica 2 is at LSN=4, but ord_1 was written at LSN=5      │
│  → Client reads STALE data (order not found!)                   │
│  → This is "replication lag" — the core challenge               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Primary-Replica Replication with Failover

**Real-Life Scenario:** Your PostgreSQL primary database handles 5,000 writes/sec and 20,000 reads/sec. The reads are overwhelmed. You need to scale reads without sacrificing write consistency, and handle primary failure gracefully.

**Technical Problem:** Implement streaming replication with automatic failover and read-your-own-writes consistency.

### TypeScript Implementation

```typescript
/**
 * PRIMARY-REPLICA REPLICATION
 * 
 * Architecture:
 *   1 Primary (writes) → WAL stream → N Replicas (reads)
 * 
 * Write Path:
 *   Client → Primary → WAL → Table → ACK
 *                        └──→ Stream to Replicas (async)
 * 
 * Read Path:
 *   Client → Load Balancer → Random Replica → Response
 * 
 * Failover:
 *   Primary dies → Sentinel/Patroni promotes a Replica → New Primary
 * 
 * @timeComplexity O(1) for routing decisions
 * @spaceComplexity O(W) for WAL retention where W = lag buffer
 */

// ============================================
// DATABASE CONNECTION ROUTER
// ============================================

interface DatabaseNode {
  host: string;
  port: number;
  role: 'primary' | 'replica';
  replicationLag: number;    // In milliseconds
  isHealthy: boolean;
  region: string;
}

class DatabaseRouter {
  private primary: DatabaseNode;
  private replicas: DatabaseNode[];
  private healthChecker: HealthChecker;

  /**
   * Route writes to primary, reads to replicas.
   * This is the fundamental routing logic for all read-scalable databases.
   */
  getConnection(operation: 'read' | 'write'): DatabaseNode {
    if (operation === 'write') {
      // Writes ALWAYS go to primary
      if (!this.primary.isHealthy) {
        throw new Error('Primary database is unavailable. Write rejected.');
      }
      return this.primary;
    }

    // Reads go to a healthy replica with acceptable lag
    const healthyReplicas = this.replicas.filter(
      r => r.isHealthy && r.replicationLag < 5000 // Max 5 seconds lag
    );

    if (healthyReplicas.length === 0) {
      // No healthy replicas — fall back to primary
      console.warn('No healthy replicas available. Falling back to primary.');
      return this.primary;
    }

    // Simple round-robin (production: use least-connections or latency-based)
    return this.selectReplica(healthyReplicas);
  }

  /**
   * READ-YOUR-OWN-WRITES CONSISTENCY
   * 
   * Problem: User creates an order (writes to primary),
   * then refreshes the page (reads from replica).
   * The replica hasn't received the WAL entry yet.
   * User sees "No orders" — panic!
   * 
   * Solution 1: Read from primary for N seconds after a write.
   * Solution 2: Track user's last write LSN, only read from
   *             replicas that have caught up past that LSN.
   */
  getConnectionWithConsistency(
    operation: 'read' | 'write',
    userId?: string
  ): DatabaseNode {
    if (operation === 'write') {
      return this.getConnection('write');
    }

    // Check if user recently wrote
    if (userId) {
      const lastWriteTime = this.userWriteCache.get(userId);
      if (lastWriteTime && Date.now() - lastWriteTime < 5000) {
        // User wrote < 5 seconds ago — read from primary
        // to guarantee they see their own write
        return this.primary;
      }

      // Alternative: Track LSN instead of time
      const lastWriteLSN = this.userLSNCache.get(userId);
      if (lastWriteLSN) {
        // Find a replica that has replicated past this LSN
        const caughtUpReplica = this.replicas.find(
          r => r.isHealthy && r.currentLSN >= lastWriteLSN
        );
        if (caughtUpReplica) return caughtUpReplica;
        // No replica caught up — read from primary
        return this.primary;
      }
    }

    // No consistency requirement — any replica is fine
    return this.getConnection('read');
  }

  /**
   * Record that a user just wrote to the database.
   * Used by the "read-your-own-writes" consistency guarantee.
   */
  recordUserWrite(userId: string): void {
    this.userWriteCache.set(userId, Date.now());
    // Expire after 10 seconds (replicas should catch up by then)
    setTimeout(() => this.userWriteCache.delete(userId), 10000);
  }

  private selectReplica(replicas: DatabaseNode[]): DatabaseNode {
    // Least-lag selection: prefer replicas closest to primary
    return replicas.sort((a, b) => a.replicationLag - b.replicationLag)[0];
  }
}

// ============================================
// AUTOMATIC FAILOVER
// ============================================

/**
 * When the primary database fails, we need to:
 * 1. DETECT the failure (health checks)
 * 2. SELECT a replica to promote (most up-to-date)
 * 3. PROMOTE the replica to primary
 * 4. RECONFIGURE other replicas to follow the new primary
 * 5. UPDATE the router to point to the new primary
 * 
 * This must happen in < 30 seconds to minimize downtime.
 * 
 * Tools:
 *   PostgreSQL: Patroni (etcd-based leader election)
 *   MySQL: MySQL Group Replication, Orchestrator
 *   Redis: Redis Sentinel
 * 
 * @timeComplexity O(R) for failover where R = number of replicas
 */

class FailoverManager {
  private healthCheckInterval = 1000; // Check every 1 second
  private failureThreshold = 3;       // 3 consecutive failures = dead

  /**
   * Monitor primary health and trigger failover if needed.
   */
  async monitorPrimary(): Promise<void> {
    let consecutiveFailures = 0;

    setInterval(async () => {
      const isAlive = await this.healthCheck(this.primary);

      if (isAlive) {
        consecutiveFailures = 0;
        return;
      }

      consecutiveFailures++;
      console.warn(
        `Primary health check failed (${consecutiveFailures}/${this.failureThreshold})`
      );

      if (consecutiveFailures >= this.failureThreshold) {
        console.error('Primary is DOWN. Initiating failover...');
        await this.performFailover();
        consecutiveFailures = 0;
      }
    }, this.healthCheckInterval);
  }

  /**
   * Failover procedure:
   * 
   * 1. Fence the old primary (prevent split-brain)
   * 2. Select best replica (least replication lag = most data)
   * 3. Promote it to primary
   * 4. Reconfigure other replicas
   * 5. Update routing
   */
  async performFailover(): Promise<void> {
    // Step 1: Fence old primary (STONITH — "Shoot The Other Node In The Head")
    // Prevents split-brain: old primary might not be dead, just slow
    await this.fenceNode(this.primary);

    // Step 2: Select best replica
    const bestReplica = this.selectBestReplica();
    console.log(
      `Selected ${bestReplica.host} for promotion ` +
      `(lag: ${bestReplica.replicationLag}ms, LSN: ${bestReplica.currentLSN})`
    );

    // Step 3: Promote
    await this.promote(bestReplica);
    console.log(`${bestReplica.host} promoted to PRIMARY`);

    // Step 4: Reconfigure other replicas to follow new primary
    for (const replica of this.replicas) {
      if (replica !== bestReplica) {
        await this.reconfigureReplica(replica, bestReplica);
      }
    }

    // Step 5: Update routing
    this.primary = bestReplica;
    this.replicas = this.replicas.filter(r => r !== bestReplica);
    await this.router.updatePrimary(bestReplica);

    console.log(`Failover complete. New primary: ${bestReplica.host}`);
    await this.alerting.notify('FAILOVER_COMPLETE', {
      newPrimary: bestReplica.host,
      dataLoss: bestReplica.replicationLag > 0 ? 'POSSIBLE' : 'NONE',
    });
  }

  /**
   * Select the replica with the LEAST replication lag.
   * This replica has the most data and minimizes potential data loss.
   */
  private selectBestReplica(): DatabaseNode {
    const healthyReplicas = this.replicas.filter(r => r.isHealthy);
    if (healthyReplicas.length === 0) {
      throw new Error('CRITICAL: No healthy replicas available for failover!');
    }

    // Sort by replication lag (ascending) — least lag = most data
    return healthyReplicas.sort(
      (a, b) => a.replicationLag - b.replicationLag
    )[0];
  }
}

// ============================================
// BACK-OF-ENVELOPE: REPLICATION COST
// ============================================

/**
 * Replication Overhead:
 * 
 *   PostgreSQL WAL size: ~16 MB per WAL segment
 *   Typical write workload: 100-500 WAL segments/hour
 *   Replication bandwidth: 100 MB/s to 1 GB/s
 *   
 *   Replication lag (async): 1ms - 100ms (same region)
 *   Replication lag (sync): 0ms (but adds write latency)
 *   Replication lag (cross-region): 50ms - 200ms
 * 
 * Read Scalability:
 *   1 Primary:   5,000 writes/sec + 20,000 reads/sec
 *   + 3 Replicas: 5,000 writes/sec + 80,000 reads/sec (4× reads)
 *   + 5 Replicas: 5,000 writes/sec + 120,000 reads/sec (6× reads)
 *   
 *   Writes DON'T scale with replicas (still 1 primary).
 *   For write scaling → Sharding (see sharding-partitioning.md)
 * 
 * Failover Time:
 *   Detection: 3 × 1 sec = 3 seconds
 *   Promotion: 2-5 seconds
 *   DNS/routing update: 5-10 seconds
 *   Total: 10-20 seconds (with Patroni/Sentinel)
 */
```

---

## 5. Scenario B: Multi-Master Replication & Conflict Resolution

**Real-Life Scenario:** Your application needs active-active deployments in US and Europe so that users in both regions get < 50ms write latency. A single primary in US means European writes cross the Atlantic (200ms).

**Technical Problem:** Design multi-master replication with conflict resolution for a globally distributed database.

### TypeScript Implementation

```typescript
/**
 * MULTI-MASTER REPLICATION
 * 
 * Multiple nodes accept writes. They replicate to each other.
 * The HARD PROBLEM: What happens when two nodes modify the same row
 * at the same time?
 * 
 * Example Conflict:
 *   Time T1: US Primary sets user.name = "Alice" (from Alice's browser)
 *   Time T2: EU Primary sets user.name = "Alicia" (from Alice's phone in Spain)
 *   Both replicate to each other → CONFLICT! Which value wins?
 * 
 * Conflict Resolution Strategies:
 *   1. Last-Write-Wins (LWW)     — Timestamp-based, may lose data
 *   2. Application-level merge   — Custom logic per data type
 *   3. CRDTs                     — Mathematically guaranteed convergence
 *   4. Human resolution          — Flag conflicts for manual review
 * 
 * @timeComplexity O(1) for LWW, O(N) for custom merge where N = conflicting values
 * @spaceComplexity O(V) for version vectors where V = number of versions
 */

// ============================================
// CONFLICT DETECTION
// ============================================

interface VersionedRow {
  id: string;
  data: Record<string, unknown>;
  version: VersionVector;      // Tracks which node wrote which version
  timestamp: number;           // Wall clock time (for LWW fallback)
  nodeId: string;              // Which node last wrote this row
}

/**
 * Version Vectors track causality across nodes.
 * 
 * Example:
 *   Node A writes → version: { A: 1, B: 0 }
 *   Node B writes → version: { A: 0, B: 1 }
 *   Neither version dominates the other → CONFLICT
 *   
 *   Node A writes, then B reads A's write and writes:
 *   → version: { A: 1, B: 1 } — this dominates { A: 1, B: 0 }
 *   → No conflict: B's write happened AFTER A's write
 */
type VersionVector = Map<string, number>;

class ConflictDetector {
  /**
   * Detect whether two versions of a row conflict.
   * 
   * If version A dominates B → A is newer, no conflict.
   * If version B dominates A → B is newer, no conflict.
   * If neither dominates → CONCURRENT writes → CONFLICT.
   */
  detectConflict(local: VersionedRow, remote: VersionedRow): ConflictResult {
    const comparison = this.compareVersions(local.version, remote.version);
    
    switch (comparison) {
      case 'LOCAL_DOMINATES':
        // Local is newer — keep local, discard remote
        return { hasConflict: false, winner: local, action: 'KEEP_LOCAL' };
      
      case 'REMOTE_DOMINATES':
        // Remote is newer — accept remote
        return { hasConflict: false, winner: remote, action: 'ACCEPT_REMOTE' };
      
      case 'CONCURRENT':
        // Both were written independently — CONFLICT!
        return { hasConflict: true, local, remote, action: 'RESOLVE' };
      
      case 'EQUAL':
        // Same version — no conflict
        return { hasConflict: false, winner: local, action: 'KEEP_LOCAL' };
    }
  }

  /**
   * Compare two version vectors.
   * 
   * A dominates B if every component of A >= every component of B,
   * AND at least one component is strictly greater.
   */
  private compareVersions(a: VersionVector, b: VersionVector): string {
    let aGreater = false;
    let bGreater = false;

    const allNodes = new Set([...a.keys(), ...b.keys()]);

    for (const node of allNodes) {
      const aVersion = a.get(node) || 0;
      const bVersion = b.get(node) || 0;

      if (aVersion > bVersion) aGreater = true;
      if (bVersion > aVersion) bGreater = true;
    }

    if (aGreater && !bGreater) return 'LOCAL_DOMINATES';
    if (bGreater && !aGreater) return 'REMOTE_DOMINATES';
    if (aGreater && bGreater) return 'CONCURRENT';
    return 'EQUAL';
  }
}

// ============================================
// CONFLICT RESOLUTION STRATEGIES
// ============================================

class ConflictResolver {
  /**
   * Strategy 1: LAST-WRITE-WINS (LWW)
   * 
   * Simple: Higher timestamp wins.
   * 
   * Pros: Simple, deterministic, no data structures needed.
   * Cons: SILENTLY LOSES DATA. If two users edit the same document,
   *       one edit disappears without warning.
   * 
   * Use when: Data is not critical (session tokens, caches).
   * Avoid when: User data, financial records, medical records.
   * 
   * ⚠️ Clock skew: Node A's clock is 5 seconds ahead of Node B.
   * Node A's writes ALWAYS beat Node B's, even if B wrote later.
   * Mitigation: Use hybrid logical clocks (HLC) instead of wall clocks.
   */
  resolveWithLWW(local: VersionedRow, remote: VersionedRow): VersionedRow {
    return local.timestamp >= remote.timestamp ? local : remote;
  }

  /**
   * Strategy 2: APPLICATION-LEVEL MERGE
   * 
   * Custom merge logic per data type.
   * 
   * Example: Shopping cart
   *   US adds "Book" → cart: ["Book"]
   *   EU adds "Pen"  → cart: ["Pen"]
   *   Merge: Union → cart: ["Book", "Pen"] ← No data loss!
   * 
   * Example: Counter
   *   US increments likes by 5 → likes: 105
   *   EU increments likes by 3 → likes: 103
   *   Merge: Base (100) + 5 + 3 = 108 ← Correct!
   */
  resolveWithMerge(
    local: VersionedRow, 
    remote: VersionedRow,
    dataType: string
  ): VersionedRow {
    switch (dataType) {
      case 'shopping_cart':
        // Merge strategy: union of items
        const localItems = local.data.items as string[];
        const remoteItems = remote.data.items as string[];
        return {
          ...local,
          data: { items: [...new Set([...localItems, ...remoteItems])] },
          version: this.mergeVersionVectors(local.version, remote.version),
        };

      case 'counter':
        // Merge strategy: add deltas from both sides
        const baseValue = this.getCommonAncestorValue(local, remote);
        const localDelta = (local.data.value as number) - baseValue;
        const remoteDelta = (remote.data.value as number) - baseValue;
        return {
          ...local,
          data: { value: baseValue + localDelta + remoteDelta },
          version: this.mergeVersionVectors(local.version, remote.version),
        };

      case 'user_profile':
        // Merge strategy: field-level LWW (each field has its own timestamp)
        const merged: Record<string, unknown> = {};
        const allFields = new Set([
          ...Object.keys(local.data),
          ...Object.keys(remote.data),
        ]);
        for (const field of allFields) {
          const localFieldTs = (local.data[`${field}_ts`] as number) || 0;
          const remoteFieldTs = (remote.data[`${field}_ts`] as number) || 0;
          merged[field] = localFieldTs >= remoteFieldTs
            ? local.data[field]
            : remote.data[field];
        }
        return {
          ...local,
          data: merged,
          version: this.mergeVersionVectors(local.version, remote.version),
        };

      default:
        // Fallback: LWW
        return this.resolveWithLWW(local, remote);
    }
  }

  private mergeVersionVectors(a: VersionVector, b: VersionVector): VersionVector {
    const merged = new Map(a);
    for (const [node, version] of b) {
      merged.set(node, Math.max(merged.get(node) || 0, version));
    }
    return merged;
  }
}

// ============================================
// SYNCHRONOUS vs ASYNCHRONOUS REPLICATION
// ============================================

/**
 * Synchronous Replication:
 *   Primary waits for replica ACK before confirming the write.
 *   
 *   Client → Primary → Replica → ACK_to_Primary → ACK_to_Client
 *   
 *   Pros: Zero data loss. Replica is ALWAYS up-to-date.
 *   Cons: Write latency = primary_write + network_round_trip + replica_write
 *         If replica is slow/down, writes are BLOCKED.
 *   
 *   Use when: Financial data, medical records, legal compliance.
 *   Example: PostgreSQL "synchronous_commit = on"
 *
 *
 * Asynchronous Replication:
 *   Primary confirms the write immediately. Replica catches up later.
 *   
 *   Client → Primary → ACK_to_Client (immediate)
 *                    → Replica (eventually)
 *   
 *   Pros: Fast writes. Replica failure doesn't affect primary.
 *   Cons: Data loss risk — if primary dies before replica catches up,
 *         uncommitted WAL entries are lost.
 *         Replication lag — replicas serve stale data.
 *   
 *   Use when: Performance matters more than consistency.
 *   Example: PostgreSQL "synchronous_commit = off"
 *
 *
 * Semi-Synchronous (Best of Both):
 *   Wait for at least ONE replica to ACK. Others are async.
 *   
 *   Client → Primary → Replica_1(sync) → ACK
 *                    → Replica_2(async, catches up later)
 *   
 *   Pros: Durability (at least 2 copies) + reasonable performance.
 *   Cons: Still slower than pure async. If the sync replica dies,
 *         must promote an async replica to sync role.
 *   
 *   Use when: Default for production databases.
 *   Example: MySQL "semi-sync replication", PostgreSQL "synchronous_standby_names"
 */
```

---

## 6. Real World Applications 🌍

### 1. 🐘 PostgreSQL Streaming Replication

**Architecture:**
- **WAL-based:** Primary writes WAL files. Replicas stream them in real-time using `pg_receivewal`.
- **Synchronous options:** `off` (fastest), `on` (durable), `remote_write` (middle ground).
- **Failover:** Managed by **Patroni** (etcd-based leader election + auto-failover).
- **Logical Replication:** Instead of shipping raw WAL bytes, sends SQL-level changes. Enables subset replication (replicate only specific tables).
- **pg_stat_replication:** Built-in view showing replication lag for each replica.

**Scale:** Instagram uses PostgreSQL with multiple replicas serving 2B+ users. Sharding via Vitess, replication for HA.

### 2. 🐬 MySQL Group Replication

**Architecture:**
- **Group Replication:** Multi-master mode where all nodes can accept writes.
- **Paxos-based consensus** for conflict detection — conflicting transactions are rolled back automatically.
- **InnoDB Cluster:** MySQL Group Replication + MySQL Router (connection routing) + MySQL Shell (management).
- **Row-level conflict detection:** If two nodes modify the same row, the one that committed second is rolled back.

**Scale:** Facebook uses MySQL with custom replication (TAO) serving billions of users. Semi-sync replication across data centers.

### 3. 📊 Amazon Aurora

**Architecture:**
- **Storage-level replication** — decoupled compute and storage.
- **6 copies of data** across 3 Availability Zones (6-way replication at the storage layer).
- **Writes quorum:** 4 of 6 storage nodes must ACK (W=4).
- **Reads quorum:** 3 of 6 (R=3). W + R > N → guaranteed up-to-date reads.
- **Replication lag: < 10ms** (within the same region, shared storage layer).
- **Global Database:** Cross-region replication with < 1 second lag for read replicas.

**Scale:** Handles up to 128 TB per database, 15 read replicas with < 10ms lag.

### 4. 🌍 CockroachDB (Multi-Region Active-Active)

**Architecture:**
- **Raft consensus** per range (partition) — ensures strong consistency.
- **Automatic multi-region:** Data is distributed across regions. Reads are served locally if data has a local replica.
- **Follows-the-Sun:** Data locality follows user activity patterns across time zones.
- **No manual sharding:** CockroachDB automatically splits and rebalances ranges.
- **Serializable isolation** with multi-region writes (configurable latency vs. consistency).

---

## 7. Complexity Analysis 🧠

### Replication Strategy Comparison

| Aspect | Async | Semi-Sync | Sync | Multi-Master |
| :--- | :--- | :--- | :--- | :--- |
| **Write latency** | Lowest | Medium | Highest | Medium (per-region) |
| **Data durability** | At risk | Good | Best | Config-dependent |
| **Replication lag** | Seconds | < 1 second | Zero | Seconds (cross-region) |
| **Failover data loss** | Possible | Minimal | None | None (but conflicts) |
| **Complexity** | Simple | Medium | Medium | Very High |
| **Read scaling** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Write scaling** | ❌ No | ❌ No | ❌ No | ✅ Yes (per-region) |
| **Conflict handling** | N/A | N/A | N/A | Required! |
| **Best for** | Analytics | Production default | Financial | Global active-active |

### Replication Lag Problems & Solutions

| Problem | Description | Solution |
| :--- | :--- | :--- |
| **Stale reads** | User writes, then reads from lagging replica → sees old data | Read-your-own-writes (route to primary after write) |
| **Monotonic reads** | User reads from replica A (fresh), then replica B (stale) → time travel | Session-based routing (sticky replica per user session) |
| **Causal ordering** | User A posts, User B replies. Replica shows reply before original post | Causal consistency (track dependencies between writes) |
| **Phantom inventory** | E-commerce shows "In Stock" on replica, but primary has 0 stock | Critical reads go to primary (read-after-write for inventory) |

### Interview Tips 💡

1. **Start with WHY replicate:** "Replication serves three purposes: high availability (failover if primary dies), read scalability (distribute reads across replicas), and geographic proximity (replica near users for lower latency). Always clarify which goal drives the design."
2. **WAL is the mechanism:** "PostgreSQL writes every change to the Write-Ahead Log (WAL) first, then to the table. Replicas receive the WAL stream and replay it. This is why it's 'ahead' — the log is written before the data."
3. **Sync vs Async is the key trade-off:** "Synchronous replication guarantees zero data loss (replica ACKs before client gets OK) but adds write latency. Asynchronous is fast but risks losing data if the primary fails. Most production systems use semi-sync — wait for one replica, rest are async."
4. **Read-your-own-writes is the most common consistency problem:** "User creates an order, refreshes the page, and doesn't see it — because they read from a lagging replica. Solution: route reads to primary for 5 seconds after a write. Track this per-user with a simple in-memory cache."
5. **Replication scales reads, NOT writes:** "Adding 5 replicas gives you 5× read throughput but writes still go to one primary. If you need to scale writes, you need sharding — splitting data across multiple primaries."
6. **Multi-master is hard — avoid unless necessary:** "Multi-master means any node can accept writes. This WILL create conflicts — two users editing the same row on different nodes. You need conflict resolution (LWW, CRDTs, or application-level merge). Only use multi-master for true global active-active requirements."
7. **Failover is where things really go wrong:** "Automatic failover sounds great until you get split-brain — old primary comes back and both think they're primary. Use fencing (STONITH), leader election (Patroni/etcd), and always test failover in staging. The best failover is the one you've practiced."
