# Database Internals: The Engine Room ⚙️

## 1. The "Library Filing System" Analogy

Imagine two ways to organize a library:

1.  **B-Tree (The Ordered Bookshelf):**
    *   Books are strictly sorted A-Z.
    *   **Read:** Fast! Use binary search to find "Harry Potter".
    *   **Write:** Slow! To insert "Harry Potter", you must shift all books from 'H' to 'Z' to make space.
    *   *Analogy:* SQL Databases (Postgres, MySQL). Good for Reading.

2.  **LSM Tree (The Pile of Notes):**
    *   You don't shelve books immediately. You write the title on a sticky note and stick it on the fast "Reception Desk" (MemTable).
    *   When the desk is full, you dump all notes into a box (SSTable) and seal it.
    *   **Write:** Instant! Just stick a note.
    *   **Read:** Slow! You have to check the Desk, then Box 1, then Box 2...
    *   *Analogy:* NoSQL (Cassandra, RocksDB). Good for Writing.

---

## 2. Storage Engines: B-Tree vs LSM Tree

### B-Tree (Balanced Tree)
*   **Structure:** A wide tree where every node has multiple children. Kept sorted.
*   **Pros:** FAST Reads ($O(\log N)$). Consistent performance.
*   **Cons:** SLOW Writes (Random I/O). Inserting requires rebalancing the tree and page splits.
*   **Fragmentation:** Deleting rows leaves empty holes in pages (wasted space).
*   **Used By:** PostgreSQL, MySQL (InnoDB), Oracle.

### LSM Tree (Log-Structured Merge Tree)
*   **Structure:**
    1.  **MemTable:** In-memory balanced tree (Fast write).
    2.  **WAL:** Write Ahead Log (Wait, what if power fails? Record it here first).
    3.  **SSTables (Sorted String Tables):** Immutable files on disk.
    4.  **Compaction:** Background process merges old SSTables, removing deleted keys.
*   **Pros:** FAST Writes (Sequential I/O). No random seeking.
*   **Cons:** Slower Reads (Need to check MemTable + multiple SSTables). Space Amplification (Duplicates exist until compaction).
*   **Used By:** Cassandra, ScyllaDB, LevelDB, RocksDB, Kafka (Log segments).

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "architecture-diagram",
  "content": "graph TD\n    Client-->|Write| WAL[Write Ahead Log (Disk)]\n    Client-->|Write| Mem[MemTable (RAM)]\n    \n    Mem-->|Flush (Full)| L0[SSTable L0]\n    L0-->|Compact| L1[SSTable L1]\n    L1-->|Compact| L2[SSTable L2]\n    \n    subgraph LSM Tree Structure\n    Mem\n    L0\n    L1\n    L2\n    end"
}
```

---

## 4. Scenario A: ACID & Isolation Levels

**Technical Problem:** Two transactions try to modify the same bank account.
`Tx1: Balance = 100 -> 150`
`Tx2: Balance = 100 -> 50`

If not isolated, `Tx2` might overwrite `Tx1`, resulting in `$50` (Lost Update).

### The 4 Levels of Isolation (SQL Standard)

| Level | Dirty Read? | Non-Repeatable Read? | Phantom Read? | Performance |
| :--- | :--- | :--- | :--- | :--- |
| **Read Uncommitted** | ✅ Yes | ✅ Yes | ✅ Yes | 🚀 Fastest |
| **Read Committed** | ❌ No | ✅ Yes | ✅ Yes | ⚡ Fast (Default PG) |
| **Repeatable Read** | ❌ No | ❌ No | ✅ Yes | 🐢 Moderate (Default MySQL) |
| **Serializable** | ❌ No | ❌ No | ❌ No | 🐌 Slowest |

*   **Dirty Read:** Tx1 writes 50 but hasn't committed. Tx2 reads 50. Tx1 rolls back. Tx2 has BAD data.
*   **Non-Repeatable Read:** Tx1 reads 100. Tx2 writes 200. Tx1 reads again and gets 200. (Changed mid-transaction).
*   **Phantom Read:** Tx1 reads "All users where age > 10" (Count: 5). Tx2 inserts a new User (age 12). Tx1 reads again (Count: 6). A "Phantom" row appeared.

### TypeScript Simulation

```typescript
// Implementing MVCC (Multi-Version Concurrency Control) logic
// This is how Postgres handles isolation without locking everything.

type RowVersion = {
    xmin: number; // Transaction ID that CREATED this version
    xmax: number; // Transaction ID that DELETED this version (or null)
    data: any;
}

class MVCCDatabase {
    currentTxId: number = 0;
    storage: Map<string, RowVersion[]> = new Map();

    startTransaction(): number {
        return ++this.currentTxId;
    }

    insert(txId: number, key: string, value: any) {
        if (!this.storage.has(key)) this.storage.set(key, []);
        
        // Add new version visible ONLY to transactions >= txId
        this.storage.get(key)!.push({
            xmin: txId,
            xmax: -1, // Active
            data: value
        });
    }

    delete(txId: number, key: string) {
        const versions = this.storage.get(key) || [];
        // Find latest version
        const latest = versions[versions.length - 1];
        if (latest) {
            // Mark as deleted by setting xmax
            latest.xmax = txId; 
        }
    }

    read(txId: number, key: string) {
        const versions = this.storage.get(key) || [];
        
        // Find version that is:
        // 1. Created by a committed transaction (xmin < current)
        // 2. NOT deleted by a committed transaction (xmax > current or -1)
        return versions.find(v => v.xmin <= txId && (v.xmax === -1 || v.xmax > txId));
    }
}
```

---

## 5. Write Ahead Log (WAL) 📝

**The Problem:** Writing to disk (B-Tree) is random and slow. If power fails before `fsync`, data is lost.
**The Solution:**
1.  Append the change to a **Log File** (Sequential Write = Fast).
2.  Acknowledge "Success" to user.
3.  Update the actual B-Tree in memory.
4.  Background process syncs Memory -> Disk later.

**Crash Recovery:**
*   Reboot Database.
*   Read WAL from start.
*   Replay every action.
*   Now Memory matches what was lost.

---

## 6. Real World Applications 🌍

### 1. 🐘 PostgreSQL (MVCC + TOAST)
*   **Heap:** Stores rows.
*   **TOAST:** Compress large text/JSON and store separately.
*   **Vacuum:** The janitor. Since Postgres doesn't overwrite rows (it creates new versions), the old versions (dead tuples) pile up. Vacuum cleans them.

### 2. ⚡ Redis (AOF vs RDB)
*   **RDB (Snapshot):** Save dump every 5 minutes. (Fast restart, potential data loss).
*   **AOF (Append Only File):** It's a WAL! Logs every `SET` command. (Zero data loss, slower restart).

### 3. 🕸️ Kafka (The Ultimate WAL)
*   Kafka IS a WAL.
*   It doesn't have a B-Tree or Indexes.
*   It just appends bytes to a file. That's why it's so fast.

---

## 7. Complexity Analysis 🧠

### Read Amplification
In LSM Trees (Check MemTable -> Check L0 -> Check L1...), finding a key that *doesn't exist* is expensive.
*   **Solution:** **Bloom Filters**.
*   A probabilistic data structure that tells you: "Key definitely doesn't exist" or "Key *might* exist".
*   Checks takes $O(1)$ memory lookup before touching disk.

### Write Amplification
*   In B-Trees: Changing 1 byte requires rewriting 4KB (Page size).
*   In LSM: Compaction re-writes data multiple times as it moves from L0 to L1 to L2. (SSD killer).

### Interview Tips 💡
1.  **Explain the Trade-off:** "I choose LSM for Write-Heavy (Logs, IoT) and B-Tree for Read-Heavy (E-commerce products)."
2.  **Vacuum:** Mention Postgres Vacuuming when discussing updates. "Updates in PG are actually Insert + Delete."
3.  **Isolation:** "For Financial apps, use Serializable (or optimistic locking). For Social feeds, Read Committed is fine."
