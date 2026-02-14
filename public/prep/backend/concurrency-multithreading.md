# Concurrency & Multithreading ⚡

## 1. The "Restaurant Kitchen" Analogy

Imagine a busy restaurant kitchen during dinner rush:

**Single-Threaded (One Chef):**
- One chef does **everything** sequentially: takes the order, chops vegetables, boils water, grills the steak, plates the dish.
- While the water is boiling (I/O wait), the chef just **stands there staring at the pot**. Nothing else gets done.
- Customers wait forever.

**Concurrent (One Chef, Smart Scheduling):**
- The same single chef starts boiling water, then **while waiting**, begins chopping vegetables. When the water boils, he drops in the pasta, then goes back to the grill.
- One person, but work is **interleaved** during idle moments.
- This is **Node.js**. One thread, but an **Event Loop** keeps things moving during I/O waits.

**Parallel (Multiple Chefs):**
- Four chefs work simultaneously. One grills, one chops, one plates, one handles desserts.
- True parallel execution on **multiple CPU cores**.
- But now they fight over shared resources: *"Who's using the cutting board?"* — this is a **race condition**.

**This is Concurrency vs. Parallelism.** Concurrency is about **dealing with** many things at once (structure). Parallelism is about **doing** many things at once (execution).

---

## 2. The Core Concept

At the Staff/Principal level, interviewers expect you to understand concurrency **deeply** — not just use `async/await`, but explain *why* it works, where it breaks, and how production systems handle millions of concurrent operations.

### The Key Distinction

```
CONCURRENCY ≠ PARALLELISM

Concurrency:
  "Two queues, one coffee machine."
  Tasks make progress by interleaving.
  Even ONE CPU core can be concurrent (time-slicing).

Parallelism:
  "Two queues, two coffee machines."
  Tasks execute SIMULTANEOUSLY on multiple cores.
  Requires multiple CPUs/threads.

Node.js:     Concurrent, NOT parallel (single-threaded event loop)
Java/Go:     Concurrent AND parallel (multiple threads/goroutines)
Worker Threads: Node.js gets parallelism via separate V8 isolates
```

### The "Brute Force" (Blocking) Way:

```typescript
// ❌ BLOCKING: Each operation waits for the previous one
const user = fetchUserFromDB("user-123");      // 50ms wait
const orders = fetchOrdersFromDB("user-123");  // 80ms wait
const recommendations = callMLService(user);    // 120ms wait
// Total: 250ms (serial execution)
```

### The "Concurrent" (Smart) Way:

```typescript
// ✅ CONCURRENT: All operations start simultaneously
const [user, orders, recommendations] = await Promise.all([
  fetchUserFromDB("user-123"),        // 50ms
  fetchOrdersFromDB("user-123"),      // 80ms
  callMLService({ userId: "user-123" }) // 120ms
]);
// Total: 120ms (limited by slowest operation)
```

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│            NODE.JS EVENT LOOP — THE HEARTBEAT                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────┐                                       │
│   │     CALL STACK        │  ← Executes synchronous code         │
│   │  (Single Thread)      │     ONE frame at a time              │
│   └──────────┬───────────┘                                       │
│              │                                                    │
│              ▼                                                    │
│   ┌──────────────────────┐    ┌─────────────────────┐            │
│   │     EVENT LOOP        │───▶│  Callback Queue     │            │
│   │  (Orchestrator)       │    │  (Macro Tasks)      │            │
│   │                       │    │  setTimeout, I/O    │            │
│   │  Checks queues in     │    └─────────────────────┘            │
│   │  priority order:      │                                       │
│   │  1. Microtasks        │    ┌─────────────────────┐            │
│   │  2. Macro tasks       │───▶│  Microtask Queue    │            │
│   │  3. I/O callbacks     │    │  (Priority Queue)   │            │
│   │  4. Timers            │    │  Promises, queueMT  │            │
│   └──────────┬───────────┘    └─────────────────────┘            │
│              │                                                    │
│              ▼                                                    │
│   ┌──────────────────────┐                                       │
│   │   THREAD POOL         │  ← libuv manages 4 threads           │
│   │   (libuv, 4 threads)  │     for blocking operations          │
│   │                       │                                       │
│   │  • File System I/O    │                                       │
│   │  • DNS lookups        │                                       │
│   │  • Compression        │                                       │
│   │  • Crypto operations  │                                       │
│   └──────────────────────┘                                       │
│                                                                  │
│   Network I/O (HTTP, TCP, DB) uses OS-level async (epoll/kqueue) │
│   and does NOT consume a thread pool thread.                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Event Loop Phases (in order)

```
┌───────────────────────────────────────────────────────┐
│                    EVENT LOOP PHASES                    │
│                                                        │
│   ┌─────────┐  ┌──────────┐  ┌─────────┐              │
│   │ Timers  │─▶│ Pending  │─▶│  Idle,  │              │
│   │setTimeout│  │ Callbacks│  │ Prepare │              │
│   └─────────┘  └──────────┘  └────┬────┘              │
│                                    │                   │
│   ┌─────────┐  ┌──────────┐  ┌────▼────┐              │
│   │  Close  │◀─│  Check   │◀─│  Poll   │              │
│   │Callbacks│  │setImmediate  │(I/O)    │              │
│   └─────────┘  └──────────┘  └─────────┘              │
│                                                        │
│   Between EVERY phase: drain the Microtask queue       │
│   (Promise.then, queueMicrotask, process.nextTick)     │
│                                                        │
│   nextTick > Promise.then > setTimeout > setImmediate  │
└───────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Event Loop Mastery — "What Prints When?"

**Real-Life Scenario:** Your production Node.js server processes 10,000 requests/second. An engineer adds a CPU-intensive synchronous loop inside a request handler, and the entire server freezes. Understanding the event loop is not academic — it's an operational survival skill.

**Technical Problem:** Predict execution order and explain why blocking the event loop is catastrophic.

### TypeScript Implementation

```typescript
/**
 * EVENT LOOP EXECUTION ORDER
 * 
 * This is the #1 JavaScript trivia question in senior interviews.
 * Understanding this deeply = understanding Node.js concurrency.
 * 
 * @explanation Each mechanism has a different priority:
 *   1. Synchronous code (Call Stack) — runs first, always
 *   2. process.nextTick — highest priority microtask  
 *   3. Promise.then — microtask queue (after nextTick)
 *   4. setTimeout(..., 0) — macro task (timer phase)
 *   5. setImmediate — check phase (after I/O poll)
 *   6. I/O callbacks — poll phase
 */

console.log("1. Synchronous — Start");

setTimeout(() => {
  console.log("6. setTimeout — Macro task (timer phase)");
}, 0);

setImmediate(() => {
  console.log("7. setImmediate — Check phase");
});

Promise.resolve().then(() => {
  console.log("4. Promise.then — Microtask queue");
}).then(() => {
  console.log("5. Promise.then (chained) — Still microtask queue");
});

process.nextTick(() => {
  console.log("3. nextTick — Highest priority microtask");
});

console.log("2. Synchronous — End");

/**
 * OUTPUT ORDER:
 * 1. Synchronous — Start
 * 2. Synchronous — End
 * 3. nextTick — Highest priority microtask
 * 4. Promise.then — Microtask queue
 * 5. Promise.then (chained) — Still microtask queue
 * 6. setTimeout — Macro task (timer phase)
 * 7. setImmediate — Check phase
 * 
 * WHY THIS ORDER:
 * - Sync code runs first (call stack must be empty before event loop kicks in)
 * - nextTick fires before promises (it's a separate, higher-priority queue)
 * - Promises drain the microtask queue
 * - setTimeout(0) and setImmediate order can vary in main module
 *   but inside an I/O callback, setImmediate always fires first
 */
```

### The Event Loop Killer — Blocking the Main Thread

```typescript
/**
 * WHY CPU-BOUND WORK KILLS NODE.JS
 * 
 * Node.js handles 10,000 concurrent connections on ONE thread.
 * If that thread is busy computing, ALL 10,000 connections freeze.
 * 
 * @realWorldImpact A single bad handler taking 100ms of CPU blocks
 *   all other requests for 100ms. At 10K RPS, that's 1,000 requests
 *   that experience 100ms+ added latency.
 */

// ❌ CATASTROPHIC: Blocks the event loop for seconds
function hashPasswordSync(password: string): string {
  // bcrypt.hashSync does 12 rounds of expensive computation
  // During this time, NO other request is processed.
  return bcryptSync.hash(password, 12); // ~250ms of CPU time
}

// ✅ CORRECT: Offload to thread pool
async function hashPasswordAsync(password: string): Promise<string> {
  // bcrypt.hash uses libuv thread pool internally
  // The event loop stays free to process other requests
  return bcrypt.hash(password, 12);
}

// ✅ BETTER: Use Worker Threads for custom CPU work
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

function computeInWorker(data: number[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: { numbers: data }
    });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

if (!isMainThread) {
  // This runs in a SEPARATE V8 isolate (separate thread)
  const { numbers } = workerData;
  const result = numbers.reduce((sum: number, n: number) => {
    // Expensive CPU computation here
    return sum + Math.pow(n, 2);
  }, 0);
  parentPort?.postMessage(result);
}

/**
 * RULE OF THUMB:
 * - CPU-bound work > 10ms? → Use Worker Threads.
 * - I/O-bound work (DB, HTTP, File)? → Use async/await (event loop handles it).
 * - Need parallelism for heavy computation? → Use Worker Threads or child_process.
 * - Need to scale across CPU cores? → Use cluster module (1 process per core).
 */
```

### Sample input and output
- **Input**: Run the event loop example above
- **Output**: Numbers 1-7 printed in the order shown in comments (sync → nextTick → promises → timers → setImmediate)

---

## 5. Scenario B: Race Conditions, Deadlocks & Safe Concurrency Patterns

**Real-Life Scenario:** Your e-commerce platform runs a flash sale. 1,000 users try to buy the last 10 items simultaneously. Without proper concurrency control, you oversell (sell 50 items when only 10 exist).

**Technical Problem:** Implement safe concurrent access patterns to prevent race conditions, and understand deadlock scenarios.

### Race Condition: The "Check-then-Act" Problem

```typescript
/**
 * RACE CONDITION — The #1 concurrency bug
 * 
 * A race condition occurs when two operations READ a value,
 * make a DECISION based on that value, and WRITE a new value,
 * but another operation changes the value between READ and WRITE.
 * 
 * Classic: "Check inventory, then decrement"
 * 
 * @timeComplexity O(1) per operation
 * @spaceComplexity O(1) per lock
 */

// ❌ BROKEN: Race condition in concurrent environment
class BrokenInventory {
  private stock: Map<string, number> = new Map();

  async purchase(itemId: string, quantity: number): Promise<boolean> {
    const currentStock = this.stock.get(itemId) || 0;
    
    // ⚠️ DANGER ZONE: Between this READ and the WRITE below,
    // another request could also read the SAME stock value.
    // Both think there's enough stock. Both decrement. Oversold!
    
    if (currentStock >= quantity) {
      // Simulate async DB write
      await this.updateDB(itemId, currentStock - quantity);
      this.stock.set(itemId, currentStock - quantity);
      return true; // "Purchase successful"
    }
    return false;
  }

  private async updateDB(itemId: string, newStock: number): Promise<void> {
    // Simulated DB call
  }
}

/**
 * TIMELINE OF THE BUG (stock = 1):
 * 
 * Request A:  READ stock → 1    (sees 1 item)
 * Request B:  READ stock → 1    (also sees 1 item!)
 * Request A:  WRITE stock → 0   (decrements to 0)
 * Request B:  WRITE stock → 0   (also decrements to 0)
 * 
 * Result: 2 customers got the item. Only 1 existed. OVERSOLD!
 */
```

### Solution 1: Mutex / Lock Pattern (In-Process)

```typescript
/**
 * MUTEX (Mutual Exclusion) — One at a time
 * 
 * A mutex ensures that a critical section of code is executed
 * by only ONE concurrent operation at a time.
 * 
 * In Node.js, even though it's single-threaded, async operations
 * CAN interleave at await points. A mutex prevents this.
 */

class AsyncMutex {
  private locked = false;
  private waitQueue: (() => void)[] = [];

  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }
    
    // Wait until the lock is released
    return new Promise<void>(resolve => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      // Wake up the next waiter (FIFO — fair ordering)
      const nextWaiter = this.waitQueue.shift()!;
      nextWaiter();
    } else {
      this.locked = false;
    }
  }
}

// ✅ FIXED: Thread-safe inventory with mutex
class SafeInventory {
  private stock: Map<string, number> = new Map();
  private locks: Map<string, AsyncMutex> = new Map();

  private getLock(itemId: string): AsyncMutex {
    if (!this.locks.has(itemId)) {
      this.locks.set(itemId, new AsyncMutex());
    }
    return this.locks.get(itemId)!;
  }

  async purchase(itemId: string, quantity: number): Promise<boolean> {
    const lock = this.getLock(itemId);
    await lock.acquire();
    
    try {
      const currentStock = this.stock.get(itemId) || 0;
      
      if (currentStock >= quantity) {
        this.stock.set(itemId, currentStock - quantity);
        return true;
      }
      return false;
    } finally {
      lock.release(); // ALWAYS release, even if error
    }
  }
}
```

### Solution 2: Distributed Lock (Multi-Server with Redis)

```typescript
/**
 * REDLOCK — Distributed Mutex for Multi-Server Environments
 * 
 * When your app runs on 10 servers, an in-memory mutex is useless.
 * You need a DISTRIBUTED lock — Redis is the standard choice.
 * 
 * Implementation: Redis SET with NX (Not Exists) + EX (Expiry)
 * 
 * @timeComplexity O(1) for lock/unlock (Redis SET/DEL)
 * @spaceComplexity O(1) per lock key
 */

class DistributedLock {
  private redis: RedisClient;
  
  /**
   * Acquire a distributed lock.
   * 
   * @param key - Lock identifier (e.g., "lock:inventory:item-42")
   * @param ttlMs - Auto-release after N milliseconds (prevents deadlock)
   * @param retries - Number of retry attempts
   */
  async acquire(
    key: string, 
    ttlMs: number = 5000, 
    retries: number = 3
  ): Promise<string | null> {
    const lockValue = crypto.randomUUID(); // Unique per acquisition
    
    for (let attempt = 0; attempt < retries; attempt++) {
      const acquired = await this.redis.set(
        key,
        lockValue,
        'NX',              // Only set if NOT exists
        'PX', ttlMs        // Auto-expire in milliseconds
      );
      
      if (acquired === 'OK') {
        return lockValue; // Return token to identify our lock
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(100 * Math.pow(2, attempt), 1000);
      const jitter = Math.random() * 50;
      await sleep(delay + jitter);
    }
    
    return null; // Failed to acquire
  }

  /**
   * Release the lock — but ONLY if we own it.
   * 
   * Uses Lua script for atomicity (check + delete in one operation).
   * Without Lua: Read → Check → Delete has a race condition!
   */
  async release(key: string, lockValue: string): Promise<boolean> {
    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await this.redis.eval(luaScript, 1, key, lockValue);
    return result === 1;
  }
}

// Usage: Safe distributed purchase
async function purchaseItem(itemId: string, userId: string): Promise<boolean> {
  const lock = new DistributedLock(redis);
  const lockKey = `lock:purchase:${itemId}`;
  
  const token = await lock.acquire(lockKey, 5000);
  if (!token) {
    throw new Error("System busy, please retry");
  }
  
  try {
    const stock = await db.query("SELECT stock FROM items WHERE id = $1", [itemId]);
    if (stock.rows[0].stock > 0) {
      await db.query(
        "UPDATE items SET stock = stock - 1 WHERE id = $1 AND stock > 0",
        [itemId]
      );
      return true;
    }
    return false;
  } finally {
    await lock.release(lockKey, token);
  }
}
```

### Deadlock: The Dining Philosophers

```typescript
/**
 * DEADLOCK — When everyone waits forever
 * 
 * A deadlock occurs when two or more processes each hold a resource
 * and are waiting for the other to release theirs.
 * 
 * Four conditions for deadlock (ALL must be true):
 * 1. Mutual Exclusion — Resource can only be held by one process
 * 2. Hold and Wait — Process holds one resource while waiting for another
 * 3. No Preemption — Resources can't be forcibly taken away
 * 4. Circular Wait — A → waits for B → waits for A
 * 
 * PREVENTION: Break any ONE of these conditions.
 */

// ❌ DEADLOCK SCENARIO: Transfer money between accounts
async function deadlockTransfer(
  fromAccount: string, 
  toAccount: string, 
  amount: number
): Promise<void> {
  // Thread 1: transfer(A → B): Locks A, then tries to lock B
  // Thread 2: transfer(B → A): Locks B, then tries to lock A
  // DEADLOCK! Both waiting for each other's lock.
  
  const lockFrom = await acquireLock(fromAccount); // Holds A
  const lockTo = await acquireLock(toAccount);     // Waits for B (held by Thread 2)
  // ...
}

// ✅ FIXED: Always acquire locks in CONSISTENT ORDER (breaks circular wait)
async function safeTransfer(
  fromAccount: string, 
  toAccount: string, 
  amount: number
): Promise<void> {
  // Sort account IDs to ensure consistent lock ordering
  const [first, second] = [fromAccount, toAccount].sort();
  
  const lock1 = await acquireLock(first);
  const lock2 = await acquireLock(second);
  
  try {
    await debit(fromAccount, amount);
    await credit(toAccount, amount);
  } finally {
    await releaseLock(lock2);
    await releaseLock(lock1);
  }
}

/**
 * OTHER DEADLOCK PREVENTION STRATEGIES:
 * 
 * 1. Lock Ordering — Always acquire locks in alphabetical/numerical order
 * 2. Lock Timeout — Give up if lock isn't acquired within N seconds
 * 3. Try-Lock — Non-blocking attempt, back off and retry if failed
 * 4. Single Lock — Use one coarse-grained lock (simpler but less throughput)
 * 5. Optimistic Concurrency — No locks; detect conflicts via versioning
 */
```

### Solution 3: Optimistic Concurrency Control (No Locks!)

```typescript
/**
 * OPTIMISTIC CONCURRENCY CONTROL (OCC)
 * 
 * Instead of locking, we assume conflicts are RARE.
 * We read a version number, do our work, and on write,
 * check if the version has changed. If it has, retry.
 * 
 * This is how most ORMs and databases handle concurrent updates.
 * PostgreSQL uses MVCC internally — this is the application-level equivalent.
 * 
 * @timeComplexity O(1) per attempt, O(R) with R retries
 * @spaceComplexity O(1)
 */

interface VersionedRecord {
  id: string;
  data: any;
  version: number;  // Incremented on every update
}

async function optimisticUpdate(
  id: string,
  transform: (data: any) => any,
  maxRetries: number = 3
): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // 1. READ current state + version
    const record = await db.query(
      "SELECT * FROM items WHERE id = $1",
      [id]
    );
    
    const currentVersion = record.rows[0].version;
    const newData = transform(record.rows[0].data);
    
    // 2. WRITE with version check (atomic compare-and-swap)
    const result = await db.query(
      `UPDATE items 
       SET data = $1, version = version + 1 
       WHERE id = $2 AND version = $3`,  // ← Only succeeds if version unchanged
      [newData, id, currentVersion]
    );
    
    if (result.rowCount > 0) {
      return true;  // Update succeeded
    }
    
    // Version changed — someone else updated. Retry.
    console.log(`Optimistic lock conflict, retry ${attempt + 1}/${maxRetries}`);
    await sleep(Math.random() * 100); // Jitter before retry
  }
  
  return false; // All retries failed
}
```

---

## 6. Real World Applications 🌍

### 1. 🌐 Node.js Cluster Module — Scaling to All CPU Cores

Node.js runs on a single core. A 16-core server wastes 93.75% of its CPU. The **Cluster module** forks the process to use all cores:

```
              ┌─────────────────┐
              │   Master Process │ ← Manages workers, doesn't serve requests
              └────────┬────────┘
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Worker 1 │  │ Worker 2 │  │ Worker 3 │  ...16 workers
   │ (Core 1) │  │ (Core 2) │  │ (Core 3) │
   │ Port 3000│  │ Port 3000│  │ Port 3000│  ← All share the same port!
   └──────────┘  └──────────┘  └──────────┘
```

### 2. 🍳 Go Goroutines — Lightweight Concurrency

Go spawns millions of goroutines (2KB stack each vs 1MB per OS thread). Go's scheduler multiplexes goroutines onto OS threads. Channels provide safe communication between goroutines without shared memory.

### 3. ☕ Java Virtual Threads (Project Loom)

Java 21 introduced Virtual Threads — lightweight threads managed by the JVM (similar to goroutines). A single JVM can handle millions of virtual threads, each blocking independently without tying up an OS thread.

### 4. 🔒 Database Connection Pools

Every web server uses a connection pool (e.g., `pg-pool` for PostgreSQL). Instead of creating a new DB connection per request (expensive: TCP handshake + auth), you maintain a pool of pre-established connections. Requests "borrow" a connection, use it, and return it. The pool has a maximum size to prevent overwhelming the database — this is a **Semaphore** pattern (a lock that allows N concurrent holders).

### 5. 📬 Message Queues — Decoupled Concurrency

Kafka, RabbitMQ, and SQS decouple producers from consumers. Instead of one service calling another synchronously (and waiting), it drops a message on a queue. Consumer processes pick messages up at their own pace. This is concurrency without shared memory — the safest model.

---

## 7. Complexity Analysis 🧠

### Concurrency Primitives Comparison

| Primitive | Use Case | Scope | Risk |
|-----------|----------|-------|------|
| **Mutex** | One-at-a-time access | Single process | Deadlock if not released |
| **Semaphore** | N-at-a-time access (e.g., connection pool) | Single process | Starvation (unfair scheduling) |
| **Read-Write Lock** | Many readers OR one writer | Single process | Writer starvation |
| **Distributed Lock (Redis)** | Cross-server mutual exclusion | Multi-server | Network partition → split brain |
| **Optimistic Locking** | Low-conflict updates | Database | Retry storms under high contention |
| **Atomic Operations** | Simple counters, flags | CPU-level | Limited to simple operations |
| **Actor Model** | Isolated message-passing (Erlang/Akka) | Cross-process | Mailbox overflow |
| **CSP (Channels)** | Go-style channel communication | Cross-goroutine | Channel deadlock if unbuffered |

### Node.js Concurrency Model — What Goes Where

```
┌────────────────────────────────────────────────────────┐
│              WHAT BLOCKS THE EVENT LOOP?                 │
│                                                         │
│  YES (CPU-Bound):              NO (I/O-Bound):          │
│  ─────────────────             ────────────────          │
│  • JSON.parse(hugeFile)        • HTTP requests           │
│  • Crypto hashing              • Database queries        │
│  • Image processing            • File reads/writes       │
│  • RegExp on large strings     • DNS lookups             │
│  • Sorting 1M+ elements        • Network sockets         │
│  • Template rendering          • Stream processing       │
│                                                          │
│  Solution:                     Handled by:               │
│  → Worker Threads              → Event Loop + libuv      │
│  → Child Process               → OS async (epoll/kqueue) │
│  → External microservice       → Thread pool (FS/DNS)    │
└────────────────────────────────────────────────────────┘
```

### Interview Tips 💡

1. **"What happens when you `await` a promise?"** — "The function suspends at the `await` point, yielding control back to the event loop. The event loop processes other callbacks and microtasks. When the promise resolves, the function's continuation is pushed onto the microtask queue and resumes."
2. **"Is Node.js single-threaded?"** — "The JavaScript execution is single-threaded (one call stack), but Node.js itself is NOT single-threaded. libuv maintains a thread pool (default 4 threads) for file I/O, DNS, and crypto. Network I/O uses OS-level async primitives (epoll on Linux, kqueue on macOS). Worker Threads provide true parallelism for CPU-bound work."
3. **"How do you prevent race conditions in Node.js?"** — "Even though Node.js is single-threaded, race conditions occur at `await` points where another async operation can interleave. Use mutexes (async-mutex), database-level transactions (SELECT FOR UPDATE), optimistic locking (version columns), or distributed locks (Redis NX) depending on scope."
4. **"Explain deadlock."** — "Four conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Break ANY one to prevent deadlock. In practice: use lock ordering (always acquire locks alphabetically), use timeouts, or avoid holding multiple locks."
5. **"When would you use Worker Threads vs Cluster?"** — "Worker Threads share memory (via SharedArrayBuffer) and are for CPU-intensive computation within one process. Cluster forks the entire process and is for scaling HTTP servers across all CPU cores. Use Cluster for web servers, Worker Threads for computation."
6. **"What's the difference between process.nextTick and Promise.then?"** — "Both are microtasks, but nextTick has HIGHER priority. nextTick callbacks drain before promise callbacks. Overusing nextTick can starve I/O because the event loop won't proceed to the next phase until all nextTick callbacks are processed."
7. **"How does a connection pool work?"** — "It's a Semaphore pattern. The pool maintains N pre-established connections. When a request needs a connection, it 'checks out' from the pool. If all N are in use, the request waits in a queue. When a connection is returned, the next waiter gets it. This prevents overwhelming the database (max connections) and amortizes connection setup cost."
