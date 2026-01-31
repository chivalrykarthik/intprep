# Consistent Hashing 🔄

## 1. The "Pizza Delivery Zone" Analogy

Imagine a pizza chain with 3 delivery drivers covering a city.

**Traditional Hashing (Rigid Zones):**
- City divided into 3 fixed zones: North, Central, South.
- Driver assignment: `zone = address_hash % 3`
- **Problem:** When a 4th driver joins, you must **recalculate ALL zones**. Every customer's assigned driver changes. Chaos!

**Consistent Hashing (Flexible Ring):**
- Imagine the city as a circular highway (ring).
- Each driver is stationed at a random point on the ring.
- Each address is also mapped to a point on the ring.
- Rule: "Deliver to the nearest driver going clockwise."
- **Adding a 4th driver?** Only addresses between them and the previous driver change. ~25% redistribution, not 100%!

**This is Consistent Hashing.** A technique that minimizes data movement when nodes are added or removed from a distributed system.

---

## 2. The Core Concept

In system design interviews, consistent hashing is crucial for distributed caching, databases, and load balancing.

**The "Modulo Hash" (Naive) Way:**
```
server = hash(key) % num_servers
```
- Add or remove a server? **Almost ALL keys remap.** Massive cache invalidation.

**The "Consistent Hash Ring" (Smart) Way:**
1. **Hash Ring:** Arrange hash space as a circle (0 to 2^32-1).
2. **Server Placement:** Hash each server ID onto the ring.
3. **Key Placement:** Hash each key onto the ring.
4. **Lookup Rule:** Walk clockwise from key's position to find the first server.
5. **Node Changes:** Only keys between old and new node positions remap.
- **Boom.** Adding/removing a server only affects ~1/N of the keys!

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                  CONSISTENT HASH RING                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         0°                                      │
│                      ┌──────┐                                   │
│                ┌─────│ S1   │──────┐                            │
│               /      └──────┘       \                           │
│          ┌──────┐               ┌──────┐                        │
│    270°  │ S4   │               │ S2   │  90°                   │
│          └──────┘               └──────┘                        │
│               \      ┌──────┐       /                           │
│                └─────│ S3   │──────┘                            │
│                      └──────┘                                   │
│                        180°                                     │
│                                                                 │
│   Key "user:123" → hash → lands at 45° → walks clockwise → S2   │
│                                                                 │
│   Adding S5 at 135°: Only keys between S2 and S5 move!         │
│   Removing S3: Only keys between S2 and S3 move to S4!         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Basic Consistent Hashing

**Real-Life Scenario:** A distributed cache with 4 servers. Keys should be distributed evenly, and adding/removing servers should minimize cache invalidation.

**Technical Problem:** Implement a consistent hash ring that minimizes key redistribution.

### TypeScript Implementation

```typescript
/**
 * Basic Consistent Hash Ring
 * 
 * @description Maps keys to servers with minimal redistribution on changes.
 * 
 * @timeComplexity O(log N) for lookup (binary search)
 * @spaceComplexity O(N) where N = number of servers
 */
class ConsistentHashRing {
  private ring: Map<number, string> = new Map();
  private sortedHashes: number[] = [];

  /**
   * Hash function - in production use MD5/SHA1/MurmurHash
   */
  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Add a server to the ring
   */
  addServer(serverId: string): void {
    const hash = this.hash(serverId);
    
    if (!this.ring.has(hash)) {
      this.ring.set(hash, serverId);
      this.sortedHashes.push(hash);
      this.sortedHashes.sort((a, b) => a - b);
    }
  }

  /**
   * Remove a server from the ring
   */
  removeServer(serverId: string): void {
    const hash = this.hash(serverId);
    this.ring.delete(hash);
    this.sortedHashes = this.sortedHashes.filter(h => h !== hash);
  }

  /**
   * Find the server responsible for a key
   * Walks clockwise from key's hash to find first server
   */
  getServer(key: string): string | undefined {
    if (this.sortedHashes.length === 0) return undefined;

    const hash = this.hash(key);
    
    // Binary search for the first server hash >= key hash
    let left = 0;
    let right = this.sortedHashes.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.sortedHashes[mid] < hash) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    // Wrap around if we've gone past the last server
    const index = left % this.sortedHashes.length;
    return this.ring.get(this.sortedHashes[index]);
  }
}

// Example usage
const ring = new ConsistentHashRing();
ring.addServer('cache-server-1');
ring.addServer('cache-server-2');
ring.addServer('cache-server-3');

console.log(ring.getServer('user:1001')); // cache-server-2
console.log(ring.getServer('user:1002')); // cache-server-1
console.log(ring.getServer('user:1003')); // cache-server-3

// Add a new server - only ~25% of keys will remap
ring.addServer('cache-server-4');
console.log(ring.getServer('user:1001')); // might still be cache-server-2!
```

### Sample input and output
- 3 servers, 100 keys: Each server gets ~33 keys
- Add 4th server: Only ~25 keys move, not all 100

---

## 5. Scenario B: Virtual Nodes (Improved Distribution)

**Real-Life Scenario:** With only 3 physical servers, the distribution can be uneven. One server might get 50% of traffic due to hash clustering.

**Technical Problem:** Improve distribution by adding virtual nodes per physical server.

### TypeScript Implementation

```typescript
/**
 * Consistent Hash Ring with Virtual Nodes
 * 
 * Each physical server has multiple positions (virtual nodes) on the ring.
 * This improves distribution uniformity.
 * 
 * @param virtualNodes - Number of virtual nodes per server (100-200 recommended)
 * 
 * @timeComplexity O(log(N * V)) for lookup
 * @spaceComplexity O(N * V) where V = virtual nodes per server
 */
class ConsistentHashRingWithVNodes {
  private ring: Map<number, string> = new Map();
  private sortedHashes: number[] = [];
  private readonly virtualNodes: number;

  constructor(virtualNodes: number = 150) {
    this.virtualNodes = virtualNodes;
  }

  private hash(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  addServer(serverId: string): void {
    // Add multiple virtual nodes for each physical server
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualKey = `${serverId}#${i}`;
      const hash = this.hash(virtualKey);
      
      if (!this.ring.has(hash)) {
        this.ring.set(hash, serverId); // Maps to physical server
        this.sortedHashes.push(hash);
      }
    }
    this.sortedHashes.sort((a, b) => a - b);
  }

  removeServer(serverId: string): void {
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualKey = `${serverId}#${i}`;
      const hash = this.hash(virtualKey);
      this.ring.delete(hash);
    }
    this.sortedHashes = this.sortedHashes.filter(h => this.ring.has(h));
  }

  getServer(key: string): string | undefined {
    if (this.sortedHashes.length === 0) return undefined;

    const hash = this.hash(key);
    
    // Binary search
    let left = 0;
    let right = this.sortedHashes.length;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.sortedHashes[mid] < hash) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    const index = left % this.sortedHashes.length;
    return this.ring.get(this.sortedHashes[index]);
  }

  // Get distribution statistics
  getDistribution(keys: string[]): Map<string, number> {
    const distribution = new Map<string, number>();
    
    for (const key of keys) {
      const server = this.getServer(key);
      if (server) {
        distribution.set(server, (distribution.get(server) || 0) + 1);
      }
    }
    
    return distribution;
  }
}

// Example: Test distribution
const ring = new ConsistentHashRingWithVNodes(150);
ring.addServer('server-A');
ring.addServer('server-B');
ring.addServer('server-C');

// Generate 1000 random keys
const keys = Array.from({ length: 1000 }, (_, i) => `key-${i}`);
const dist = ring.getDistribution(keys);

console.log('Distribution:');
for (const [server, count] of dist) {
  console.log(`  ${server}: ${count} keys (${(count / 10).toFixed(1)}%)`);
}
// Without virtual nodes: might be 50%, 30%, 20%
// With 150 virtual nodes: closer to 33%, 33%, 34%
```

---

## 6. Real World Applications 🌍

### 1. 🗄️ Amazon DynamoDB

DynamoDB uses consistent hashing to:
- Partition data across storage nodes
- Enable horizontal scaling without full rebalancing
- Support automatic data replication

### 2. ⚡ Apache Cassandra

Cassandra's ring topology:
- Each node owns a range of the hash ring
- Virtual nodes (vnodes) for better distribution
- Adding a node only moves data from adjacent nodes

### 3. 🔴 Redis Cluster

Redis Cluster uses hash slots (similar concept):
- 16,384 hash slots distributed among nodes
- Keys hashed to slots: `CRC16(key) % 16384`
- Resharding moves specific slots between nodes

### 4. 📦 Akamai CDN

Akamai's content delivery:
- Consistent hashing routes users to edge servers
- Adding edge locations doesn't invalidate all caches
- Content stays "sticky" to specific servers

---

## 7. Complexity Analysis 🧠

### Comparison: Modulo vs Consistent Hashing

| Metric | Modulo Hash | Consistent Hash |
|--------|-------------|-----------------|
| **Lookup** | O(1) | O(log N) |
| **Add Node** | O(K) - all keys remap | O(K/N) - only 1/N keys remap |
| **Remove Node** | O(K) - all keys remap | O(K/N) - only 1/N keys remap |
| **Distribution** | Uniform | Improved with virtual nodes |

### Redistribution Math

```
Without Consistent Hashing:
  Servers: 3 → 4
  Keys remapped: ~100% (server = hash % N changes for almost all keys)

With Consistent Hashing:
  Servers: 3 → 4
  Keys remapped: ~K/N = 1/4 = 25%
  
With Virtual Nodes (V = 150):
  Distribution std deviation: ~5% (very uniform)
  Without vnodes: ~20-30% variance
```

### Interview Tips 💡

1. **Draw the ring:** Visually explain clockwise lookup.
2. **Know the redistribution benefit:** "Only K/N keys move when adding a node."
3. **Mention virtual nodes:** "We use 100-200 vnodes for uniform distribution."
4. **Real-world examples:** "This is how Cassandra and DynamoDB work."
5. **Discuss alternatives:** "Rendezvous hashing is another approach with similar benefits."
