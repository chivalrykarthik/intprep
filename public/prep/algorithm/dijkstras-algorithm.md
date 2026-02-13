# Dijkstra's Algorithm 🗺️

## 1. The "GPS Navigation" Analogy

Imagine you're planning a road trip and want the **fastest** route from your house to a concert venue.

**The "Brute Force" Way:**
You physically drive every single possible route — highways, backroads, dead ends — time each one, then pick the shortest. You'd arrive next year.

**The "Dijkstra" Way:**
Your GPS does something smarter:
1. It starts at your house (distance = 0) and looks at every road leaving your house.
2. It picks the **closest** intersection it hasn't visited yet.
3. From that intersection, it checks all outgoing roads: "Can I reach a neighbor faster through HERE than any route I've found so far?"
4. If yes, it updates the faster route. If no, it moves on.
5. It repeats until it reaches the concert venue.

**This is Dijkstra's Algorithm.** It's a greedy algorithm that always picks the closest unvisited node, guaranteeing the shortest path in graphs with non-negative edge weights.

---

## 2. The Core Concept

In coding interviews, Dijkstra's is used for:
- **Shortest path** in weighted graphs (unlike BFS which is unweighted only)
- **Network routing** (OSPF protocol)
- **Social network connections** with weighted relationships
- **Game pathfinding** with terrain costs

**The "Brute Force" (Dumb) Way:**
Try all possible paths from source to target. For a graph with V vertices, this could be O(V!) paths — worse than impossible.

**The "Dijkstra" (Smart) Way:**
- **Step 1:** Set distance to source = 0, everything else = ∞.
- **Step 2:** Use a **Priority Queue (Min-Heap)** to always process the closest unvisited node.
- **Step 3:** For each neighbor, check: is the path through the current node shorter than the known distance? If yes, update (this is called **relaxation**).
- **Step 4:** Mark node as visited. Never revisit.
- **Boom.** Shortest paths to ALL nodes, not just the target.

### Key Constraint: Non-Negative Weights Only!
Dijkstra FAILS with negative edge weights because it assumes "visiting a node = done." With negative edges, a later path could be shorter — violating this assumption.

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────┐
│         DIJKSTRA'S ALGORITHM — Step by Step              │
│                                                          │
│   Graph:                   Priority Queue (Min-Heap):    │
│                                                          │
│          4                                               │
│   A ─────────▶ B           Step 0: [(A, 0)]             │
│   │            │           Step 1: Process A → [(B,4),   │
│   │2           │3                                (C,2)]  │
│   │            │           Step 2: Process C → [(B,3),   │
│   ▼     1      ▼                                (D,7)]  │
│   C ─────────▶ D           Step 3: Process B → [(D,6)]  │
│   │            │           Step 4: Process D → [(E,8)]   │
│   │5           │2          Step 5: Process E → Done!     │
│   │            │                                         │
│   ▼            ▼           Result:                       │
│   E ◀────────── ·          A→A: 0                       │
│                            A→C: 2                       │
│                            A→B: 3 (via C→B? No, A→B=4,  │
│   Shortest A→E: 8                A→C→D=... depends)     │
│   Path: A → C → D → E     A→D: 6                       │
│                            A→E: 8                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Shortest Path (Classic Dijkstra)

**Real-Life Scenario:** Finding the cheapest flight route between two cities with varying ticket prices.

**Technical Problem:** Given a weighted directed graph, find the shortest distance from a source to all other nodes.

### TypeScript Implementation

```typescript
/**
 * Dijkstra's Algorithm — Shortest path in weighted graph.
 * 
 * Uses a Min-Heap (Priority Queue) for optimal performance.
 * 
 * @param graph - Adjacency list: Map<node, [neighbor, weight][]>
 * @param source - Starting node
 * @returns Map of shortest distances from source to all nodes
 * 
 * @timeComplexity O((V + E) log V) — Each node/edge processed once,
 *                 heap operations are O(log V)
 * @spaceComplexity O(V) — Distance map + heap
 */

// Simple MinHeap for Dijkstra
class MinHeap<T> {
  private data: { value: T; priority: number }[] = [];

  push(value: T, priority: number): void {
    this.data.push({ value, priority });
    this.bubbleUp(this.data.length - 1);
  }

  pop(): { value: T; priority: number } | undefined {
    if (this.data.length === 0) return undefined;
    const min = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  get size(): number { return this.data.length; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent].priority > this.data[i].priority) {
        [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
        i = parent;
      } else break;
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.data[left].priority < this.data[smallest].priority) smallest = left;
      if (right < n && this.data[right].priority < this.data[smallest].priority) smallest = right;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

function dijkstra(
  graph: Map<string, [string, number][]>,
  source: string
): Map<string, number> {
  const dist = new Map<string, number>();
  const visited = new Set<string>();
  const heap = new MinHeap<string>();

  // Initialize all distances to Infinity
  for (const node of graph.keys()) {
    dist.set(node, Infinity);
  }
  dist.set(source, 0);
  heap.push(source, 0);

  while (heap.size > 0) {
    const { value: current, priority: currentDist } = heap.pop()!;

    // Skip if already visited (we may have stale entries in the heap)
    if (visited.has(current)) continue;
    visited.add(current);

    // Relax all neighbors
    for (const [neighbor, weight] of graph.get(current) || []) {
      const newDist = currentDist + weight;

      if (newDist < (dist.get(neighbor) ?? Infinity)) {
        dist.set(neighbor, newDist);
        heap.push(neighbor, newDist);
        // Note: We don't remove old entries. Visited check handles duplicates.
      }
    }
  }

  return dist;
}

// Usage Example
const graph = new Map<string, [string, number][]>([
  ['A', [['B', 4], ['C', 2]]],
  ['B', [['D', 3]]],
  ['C', [['B', 1], ['D', 5]]],
  ['D', [['E', 2]]],
  ['E', []]
]);

const distances = dijkstra(graph, 'A');
console.log("Shortest distances from A:");
for (const [node, dist] of distances) {
  console.log(`  A → ${node}: ${dist}`);
}
// A → A: 0
// A → B: 3 (A→C→B)
// A → C: 2 (A→C)
// A → D: 6 (A→C→B→D)
// A → E: 8 (A→C→B→D→E)
```

### Sample input and output
- Input: Weighted graph with 5 nodes, source='A'
- Output: `{A: 0, B: 3, C: 2, D: 6, E: 8}`

---

## 5. Scenario B: Network Delay Time (LeetCode 743)

**Real-Life Scenario:** You send a signal from a server to all other servers in a network. How long until ALL servers receive it?

**Technical Problem:** Given a network of N nodes and weighted edges (`times[i] = [source, target, time]`), and a starting node `k`, return the minimum time for all nodes to receive the signal. Return -1 if impossible.

### TypeScript Implementation

```typescript
/**
 * networkDelayTime
 * Uses Dijkstra to find the max shortest distance (latest arrival).
 * 
 * @param times - Edges as [from, to, weight]
 * @param n - Number of nodes (1-indexed)
 * @param k - Source node
 * @returns Time for ALL nodes to receive signal, or -1
 * 
 * @timeComplexity O((V + E) log V)
 * @spaceComplexity O(V + E)
 */
function networkDelayTime(times: number[][], n: number, k: number): number {
  // Build adjacency list
  const graph = new Map<number, [number, number][]>();
  for (let i = 1; i <= n; i++) graph.set(i, []);
  for (const [u, v, w] of times) {
    graph.get(u)!.push([v, w]);
  }

  // Run Dijkstra
  const dist = new Map<number, number>();
  const heap = new MinHeap<number>();
  heap.push(k, 0);

  while (heap.size > 0) {
    const { value: node, priority: d } = heap.pop()!;
    if (dist.has(node)) continue; // Already finalized
    dist.set(node, d);

    for (const [neighbor, weight] of graph.get(node) || []) {
      if (!dist.has(neighbor)) {
        heap.push(neighbor, d + weight);
      }
    }
  }

  // If we didn't reach all nodes, return -1
  if (dist.size < n) return -1;

  // The answer is the MAX of all shortest distances
  // (the last node to receive the signal)
  return Math.max(...dist.values());
}

// Usage Example
const times = [[2,1,1], [2,3,1], [3,4,1]];
const n = 4, k = 2;
console.log("Network delay:", networkDelayTime(times, n, k)); // Output: 2
// Node 2 → Node 1: 1
// Node 2 → Node 3: 1
// Node 2 → Node 3 → Node 4: 2
// All nodes reached by time 2
```

---

## 6. Real World Applications 🌍

### 1. 🗺️ GPS Navigation (Google Maps, Waze)
The core of turn-by-turn navigation. In practice, they use Contraction Hierarchies (a Dijkstra optimization) to make continental-scale queries in milliseconds.

### 2. 🌐 Network Routing (OSPF)
The Open Shortest Path First protocol uses Dijkstra's algorithm to compute shortest paths in IP networks. Every router maintains a link-state database and runs Dijkstra independently.

### 3. 🎮 Game AI — Weighted Pathfinding
Unlike BFS (which handles uniform cost), Dijkstra handles terrain costs: walking on road (cost 1) vs. swamp (cost 5) vs. mountain (cost 10). A* extends this with heuristics.

### 4. ✈️ Flight Route Optimization
Airlines find cheapest routes with layovers. Edges = flights with prices, nodes = airports. Dijkstra finds cheapest route considering connections.

### 5. 📡 CDN Request Routing
Content Delivery Networks route user requests to the nearest/fastest edge server, considering network latency (weighted edges between data centers).

---

## 7. Complexity Analysis 🧠

### Time & Space Complexity

| Implementation | Time | Space | When to Use |
|---------------|------|-------|-------------|
| **Min-Heap (Binary)** | O((V+E) log V) | O(V) | Default choice |
| **Fibonacci Heap** | O(V log V + E) | O(V) | Dense graphs (E >> V) |
| **Simple Array** | O(V²) | O(V) | Small/dense graphs |

### Dijkstra vs Other Shortest Path Algorithms

| Algorithm | Negative Weights? | Single Source? | Time | Use Case |
|-----------|:-:|:-:|------|----------|
| **Dijkstra** | ❌ | ✅ | O((V+E) log V) | Non-negative weighted graphs |
| **Bellman-Ford** | ✅ | ✅ | O(V × E) | Graphs with negative weights |
| **Floyd-Warshall** | ✅ | ❌ (all pairs) | O(V³) | All-pairs shortest path |
| **BFS** | N/A (unweighted) | ✅ | O(V + E) | Unweighted graphs only |
| **A\*** | ❌ | ✅ | O((V+E) log V) | With admissible heuristic |

### A* = Dijkstra + Heuristic

```
Dijkstra:  priority = distance_so_far
A*:        priority = distance_so_far + estimated_remaining

The heuristic must be "admissible" (never overestimates).
Examples: Manhattan distance, Euclidean distance.

A* explores fewer nodes than Dijkstra when heading toward a specific target.
Dijkstra explores ALL directions equally (like a circle expanding).
A* explores in a cone toward the target.
```

### Interview Tips 💡

1. **Negative weights = NOT Dijkstra:** If the interviewer mentions negative weights, switch to Bellman-Ford. Dijkstra's greedy assumption breaks because "visited" nodes might get shorter paths later.
2. **Lazy deletion:** Don't try to update priorities in the heap. Just add duplicate entries and skip already-visited nodes when popping. This is simpler and still O((V+E) log V).
3. **Reconstruct the path:** Use a `previous` map alongside distances. When relaxing, store `previous[neighbor] = current`. Trace back from target to source.
4. **BFS is Dijkstra with all weights = 1:** If all edges have equal weight, BFS is optimal and simpler. Don't use Dijkstra for unweighted graphs.
5. **0-1 BFS:** If edges have weight 0 or 1, use a deque (push weight-0 neighbors to front, weight-1 to back). O(V + E) instead of O((V+E) log V).
6. **Dense vs Sparse:** For dense graphs (E ≈ V²), the simple array version O(V²) can be faster than the heap version O(V² log V) because of lower overhead.
7. **Common interview problems:** Network Delay Time, Cheapest Flights Within K Stops, Path With Minimum Effort, Swim in Rising Water.
