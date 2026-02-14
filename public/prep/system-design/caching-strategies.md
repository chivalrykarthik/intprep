# Caching Strategies 🚀

## 1. The "Coffee Shop Barista" Analogy

Imagine you're a barista at a busy coffee shop.

**Without Caching (Making Every Drink from Scratch):**
- Customer orders a Latte.
- You grind beans, steam milk, pull espresso, combine. (2 minutes)
- Next customer... same Latte. You repeat EVERYTHING.
- 100 Lattes = 200 minutes of grinding, steaming, pulling.

**With Caching (Pre-Prepared Ingredients):**
- You notice Lattes are 80% of orders.
- You pre-steam a pitcher of milk, pre-pull shots of espresso.
- Customer orders Latte? Combine pre-made ingredients. (15 seconds)
- 100 Lattes = ~25 minutes (vs 200 minutes!)

**This is Caching.** Store frequently accessed data closer to where it's needed, so you don't "make it from scratch" every time.

---

## 2. The Core Concept

In system design, caching is your **#1 performance optimization**. It reduces latency, database load, and costs.

**The "No Cache" (Naive) Way:**
Every request hits the database. 1 million users reading the same popular post = 1 million database queries.

**The "Cached" (Smart) Way:**
Store the popular post in a fast in-memory store (Redis):
1. **First request:** DB query → Store in cache → Return result.
2. **Next 999,999 requests:** Return from cache instantly.
- **Boom.** Database load drops by 99.9999%. Latency drops from 100ms to 1ms.

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                    CACHING PATTERNS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CACHE-ASIDE (Lazy Loading)      WRITE-THROUGH                  │
│  ═══════════════════════         ═══════════════                │
│                                                                 │
│    ┌─────┐    1. Check    ┌─────┐     ┌─────┐                   │
│    │ App │───────────────→│Cache│     │ App │                   │
│    └──┬──┘                └──┬──┘     └──┬──┘                   │
│       │                      │           │                      │
│       │ 2. Miss?             │           │ Write                │
│       │                      │           ▼                      │
│       ▼                      │      ┌─────────┐                 │
│    ┌──────┐                  │      │  Cache  │                 │
│    │  DB  │◄─────────────────┘      └────┬────┘                 │
│    └──────┘  3. Fetch & Cache            │ Sync                 │
│                                          ▼                      │
│                                      ┌──────┐                   │
│                                      │  DB  │                   │
│                                      └──────┘                   │
│                                                                 │
│  ✓ Only cache what's needed       ✓ Strong consistency          │
│  ✗ First request is slow          ✗ Higher write latency        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Caching Patterns

**Real-Life Scenario:** You're designing a caching layer for a social media feed.

**Technical Problem:** Choose the right caching pattern based on read/write characteristics.

### TypeScript Implementation

```typescript
/**
 * Caching Patterns Implementation
 */

interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

interface Database {
  read(key: string): Promise<string>;
  write(key: string, value: string): Promise<void>;
}

/**
 * PATTERN 1: Cache-Aside (Lazy Loading)
 * 
 * Read: App checks cache first. If miss, read from DB, then populate cache.
 * Write: App writes to DB. Cache is NOT updated (lazy).
 * 
 * Best for: Read-heavy workloads, data that can be slightly stale.
 * 
 * @pros Simple, cache only what's needed
 * @cons Cache misses are slow, potential stale data
 */
class CacheAside {
  constructor(private cache: CacheStore, private db: Database) {}

  async read(key: string): Promise<string> {
    // 1. Check cache
    const cached = await this.cache.get(key);
    if (cached !== null) {
      console.log(`Cache HIT for ${key}`);
      return cached;
    }

    // 2. Cache miss - read from DB
    console.log(`Cache MISS for ${key}`);
    const data = await this.db.read(key);

    // 3. Populate cache for next time
    await this.cache.set(key, data, 3600); // 1 hour TTL
    return data;
  }

  async write(key: string, value: string): Promise<void> {
    // Write to DB only, cache remains stale (or invalidate it)
    await this.db.write(key, value);
    await this.cache.delete(key); // Invalidate cache
  }
}

/**
 * PATTERN 2: Write-Through
 * 
 * Write: App writes to cache, cache synchronously writes to DB.
 * Read: Always read from cache.
 * 
 * Best for: Data that must be consistent.
 * 
 * @pros Data always consistent
 * @cons Write latency (two writes), cache may store rarely-read data
 */
class WriteThrough {
  constructor(private cache: CacheStore, private db: Database) {}

  async read(key: string): Promise<string> {
    const cached = await this.cache.get(key);
    if (cached !== null) return cached;
    
    // If not in cache, it means it was never written (or evicted)
    const data = await this.db.read(key);
    await this.cache.set(key, data);
    return data;
  }

  async write(key: string, value: string): Promise<void> {
    // Write to BOTH cache and DB
    await this.cache.set(key, value);
    await this.db.write(key, value);
  }
}

/**
 * PATTERN 3: Write-Behind (Write-Back)
 * 
 * Write: App writes to cache only. Cache async writes to DB later.
 * Read: Always read from cache.
 * 
 * Best for: Write-heavy workloads, batch writes.
 * 
 * @pros Very fast writes
 * @cons Risk of data loss if cache crashes before DB write
 */
class WriteBehind {
  private writeQueue: Array<{ key: string; value: string }> = [];
  private flushInterval: number = 5000; // 5 seconds

  constructor(private cache: CacheStore, private db: Database) {
    // Periodically flush to DB
    setInterval(() => this.flush(), this.flushInterval);
  }

  async read(key: string): Promise<string> {
    const cached = await this.cache.get(key);
    if (cached !== null) return cached;
    return this.db.read(key);
  }

  async write(key: string, value: string): Promise<void> {
    // Write to cache immediately
    await this.cache.set(key, value);
    // Queue for DB write
    this.writeQueue.push({ key, value });
  }

  private async flush(): Promise<void> {
    const batch = [...this.writeQueue];
    this.writeQueue = [];
    
    for (const { key, value } of batch) {
      await this.db.write(key, value);
    }
    console.log(`Flushed ${batch.length} writes to DB`);
  }
}
```

### Caching Pattern Comparison

| Pattern | Read Path | Write Path | Consistency | Best For |
|---------|-----------|------------|-------------|----------|
| Cache-Aside | Cache → DB (on miss) | DB → Invalidate Cache | Eventual | Read-heavy |
| Write-Through | Cache | Cache → DB (sync) | Strong | Consistency-critical |
| Write-Behind | Cache | Cache → DB (async) | Eventual | Write-heavy |
| Read-Through | Cache (auto-loads) | Varies | Eventual | Simplified client |

---

## 5. Scenario B: Cache Eviction Policies

**Real-Life Scenario:** Your cache has 10GB capacity but you have 100GB of cacheable data.

**Technical Problem:** When the cache is full, which entries should be removed?

### TypeScript Implementation

```typescript
/**
 * LRU Cache Implementation (Least Recently Used)
 * 
 * @description Evicts the item that hasn't been accessed the longest.
 * @timeComplexity O(1) for get and put operations
 * @spaceComplexity O(capacity)
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest (first item in Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      console.log(`Evicted: ${oldestKey}`);
    }
    this.cache.set(key, value);
  }
}

/**
 * LFU Cache Implementation (Least Frequently Used)
 * 
 * @description Evicts the item with the lowest access frequency.
 * @timeComplexity O(1) for get and put operations
 * @spaceComplexity O(capacity)
 */
class LFUCache<K, V> {
  private cache = new Map<K, { value: V; freq: number }>();
  private freqMap = new Map<number, Set<K>>(); // freq -> keys
  private minFreq = 0;
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    const item = this.cache.get(key)!;
    this.updateFrequency(key, item.freq);
    return item.value;
  }

  put(key: K, value: V): void {
    if (this.capacity <= 0) return;

    if (this.cache.has(key)) {
      const item = this.cache.get(key)!;
      item.value = value;
      this.updateFrequency(key, item.freq);
    } else {
      if (this.cache.size >= this.capacity) {
        this.evictLFU();
      }
      this.cache.set(key, { value, freq: 1 });
      
      if (!this.freqMap.has(1)) this.freqMap.set(1, new Set());
      this.freqMap.get(1)!.add(key);
      this.minFreq = 1;
    }
  }

  private updateFrequency(key: K, oldFreq: number): void {
    const item = this.cache.get(key)!;
    item.freq++;

    this.freqMap.get(oldFreq)!.delete(key);
    if (this.freqMap.get(oldFreq)!.size === 0) {
      this.freqMap.delete(oldFreq);
      if (this.minFreq === oldFreq) this.minFreq++;
    }

    if (!this.freqMap.has(item.freq)) this.freqMap.set(item.freq, new Set());
    this.freqMap.get(item.freq)!.add(key);
  }

  private evictLFU(): void {
    const keysWithMinFreq = this.freqMap.get(this.minFreq)!;
    const keyToEvict = keysWithMinFreq.values().next().value;
    
    keysWithMinFreq.delete(keyToEvict);
    if (keysWithMinFreq.size === 0) this.freqMap.delete(this.minFreq);
    
    this.cache.delete(keyToEvict);
    console.log(`Evicted LFU: ${keyToEvict}`);
  }
}

// Usage Example
const lru = new LRUCache<string, string>(3);
lru.put('a', 'apple');
lru.put('b', 'banana');
lru.put('c', 'cherry');
lru.get('a');           // Access 'a', now most recent
lru.put('d', 'date');   // Evicts 'b' (least recently used)
```

### Eviction Policy Comparison

| Policy | Evicts | Best For |
|--------|--------|----------|
| **LRU** | Least Recently Used | General purpose, temporal locality |
| **LFU** | Least Frequently Used | Stable popular items |
| **FIFO** | First In First Out | Simple, stateless |
| **TTL** | Expired items | Time-sensitive data |
| **Random** | Random item | Uniform access patterns |

---

## 6. Real World Applications 🌍

### 1. 🌐 CDN (Content Delivery Network)
Cloudflare, AWS CloudFront cache static assets at edge locations worldwide. A user in Tokyo gets images from a Tokyo cache, not from a US origin server.

### 2. 🗄️ Database Query Cache
MySQL Query Cache stores SELECT results. Identical queries return instantly without hitting disk.

### 3. 📱 Browser Caching
Your browser caches CSS, JS, and images. `Cache-Control: max-age=31536000` says "cache this for 1 year."

### 4. ⚡ Redis at Scale
Twitter caches:
- User profiles (avoid DB hits)
- Timelines (pre-computed feeds)
- Session data (authentication tokens)

### 5. 🔄 Facebook's Memcached
Facebook runs the world's largest Memcached deployment:
- Billions of queries per second
- Reduces database load by 99%+

---

## 7. Complexity Analysis 🧠

### Cache Hit Ratio Math

```
Hit Ratio = Cache Hits / (Cache Hits + Cache Misses)

Example:
- 95% hit ratio with 1ms cache latency
- 5% miss ratio with 100ms DB latency

Average Latency = (0.95 × 1ms) + (0.05 × 100ms) = 0.95 + 5 = 5.95ms

Without cache: 100ms
With 95% hit cache: 5.95ms (16x faster!)
```

### Cache Size Trade-offs

| Cache Size | Hit Ratio | Cost | Eviction Rate |
|------------|-----------|------|---------------|
| Small (1GB) | 70% | Low | High |
| Medium (10GB) | 90% | Medium | Medium |
| Large (100GB) | 99% | High | Low |

### Interview Tips 💡

1. **Always mention TTL:** "We set a 5-minute TTL for user profiles to balance freshness and performance. Shorter TTL = fresher data but more DB load."
2. **Discuss cache invalidation:** "Cache invalidation is one of the two hard problems in CS. We use event-driven invalidation — when the DB row changes, publish an event that invalidates the cache key."
3. **Know the thundering herd:** "If cache expires, thousands of requests hit DB simultaneously. We use mutex locking (only 1 request recomputes, others wait) or staggered TTLs with jitter to prevent synchronized expiration."
4. **Consider cache warming:** "On deploy, we pre-populate the cache with hot data from the previous instance. Cold cache after deployment is a common cause of outages."
5. **Multi-tier caching:** "We use L1 (in-process, ~microseconds) → L2 (Redis, ~1ms) → L3 (CDN, ~5ms) → DB (~50ms) for optimal latency at each layer."
6. **Cache-Aside is the default:** "In most systems, I'd use Cache-Aside (lazy loading). Write-Through and Write-Behind are for specific use cases — Write-Through when consistency is critical, Write-Behind when you can tolerate data loss."
7. **Know your eviction policies:** "LRU is the safe default. LFU is better when access patterns are stable (popular items stay popular). For time-sensitive data, TTL-based eviction is mandatory."
