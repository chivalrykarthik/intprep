# Heaps & Priority Queues ⛰️

## 1. The "Emergency Room" Analogy

Imagine you're managing an Emergency Room:

**Without Priority Queue (Regular Queue):**
- Patients seen in arrival order
- Person with a paper cut (arrived at 9:00 AM) gets treated before a heart attack patient (arrived at 9:05 AM)
- Fair? Technically. Life-threatening? Absolutely.

**With Priority Queue (Heap):**
- Each patient gets a **severity score** (1 = critical, 10 = minor)
- The system always picks the **highest priority** (lowest number) patient next
- Heart attack = severity 1 → treated immediately
- Paper cut = severity 8 → waits until critical cases are handled
- A new critical patient arriving mid-day jumps to the front in O(log N), not O(N)

**This is a Heap.** A tree-based data structure that maintains the highest (or lowest) priority element at the root, enabling O(1) peek and O(log N) insertion/removal.

---

## 2. The Core Concept

In coding interviews, heaps are used for problems involving:
- **"Top K" anything** (largest, smallest, most frequent)
- **Streaming data** (median from data stream)
- **Merge K sorted things** (lists, arrays, streams)
- **Scheduling** (task scheduler, CPU scheduling)

### Heap Types

| Type | Property | Root Contains |
|------|----------|---------------|
| **Min-Heap** | Parent ≤ Children | Smallest element |
| **Max-Heap** | Parent ≥ Children | Largest element |

### Heap as Array

A heap is stored as a flat array using index math:

```
For node at index i:
  Parent:      Math.floor((i - 1) / 2)
  Left child:  2 * i + 1
  Right child: 2 * i + 2
```

```
        1                Array: [1, 3, 5, 7, 9, 8, 6]
       / \
      3    5             Index:  0  1  2  3  4  5  6
     / \  / \
    7  9 8   6           Parent of 4 (9): Math.floor((4-1)/2) = 1 (3) ✓
```

### Key Operations

| Operation | Time | Description |
|-----------|------|-------------|
| `peek()` / `findMin` | **O(1)** | Return root (min or max) |
| `push()` / `insert` | **O(log N)** | Add element, bubble up |
| `pop()` / `extractMin` | **O(log N)** | Remove root, sift down |
| `heapify` (build) | **O(N)** | Build heap from array |

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────┐
│           MIN-HEAP — Operations Visualization            │
│                                                          │
│  Initial Heap:       After push(2):     After pop():     │
│                                                          │
│       1                  1                  2            │
│      / \                / \                / \           │
│     3   5     →       2    5     →       3    5          │
│    / \               / \  /             / \  /           │
│   7   9             3   9 7            7   9 8           │
│                    /                                     │
│                   7                                      │
│                                                          │
│  push(2): Add at bottom, bubble UP:                      │
│  [1,3,5,7,9] → [1,3,5,7,9,2]                           │
│  2 < 5? Yes → swap → [1,3,2,7,9,5]                     │
│  2 < 1? No → done. → [1,2,5,7,9,3]... wait, let me     │
│  recalculate: parent of idx 5 is idx 2 (value 5).       │
│  2 < 5 → swap. parent of idx 2 is idx 0 (value 1).     │
│  2 < 1? No → stop. Final: [1, 3, 2, 7, 9, 5]           │
│                                                          │
│  pop(): Remove root (1), move last to root, sift DOWN:   │
│  [9, 3, 2, 7] → sift 9 down: swap with min child (2)   │
│  [2, 3, 9, 7] → sift 9 down: swap with 7               │
│  [2, 3, 7, 9] → done!                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: MinHeap Implementation (Foundation)

**Real-Life Scenario:** Build the foundation data structure that powers Dijkstra's, Top K, Median from Stream, and scheduling algorithms.

**Technical Problem:** Implement a complete MinHeap with push, pop, and peek operations.

### TypeScript Implementation

```typescript
/**
 * MinHeap — Complete binary heap implementation.
 * 
 * Why not just use .sort()? Because:
 * - Array.sort() is O(N log N) per call
 * - Heap insertion is O(log N) per element
 * - Heap peek is O(1)
 * - For streaming data, heap is dramatically faster
 * 
 * @timeComplexity push: O(log N), pop: O(log N), peek: O(1)
 * @spaceComplexity O(N)
 */
class MinHeap<T = number> {
  private data: T[] = [];
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number) {
    // Default: numeric comparison for MinHeap
    this.compareFn = compareFn || ((a: any, b: any) => a - b);
  }

  get size(): number { return this.data.length; }

  peek(): T | undefined { return this.data[0]; }

  push(val: T): void {
    this.data.push(val);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const min = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return min;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.compareFn(this.data[i], this.data[parent]) < 0) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.compareFn(this.data[left], this.data[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this.compareFn(this.data[right], this.data[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }

  /**
   * Build heap from array — O(N) not O(N log N)!
   * Why O(N)? Most nodes are near the bottom (low height).
   * Sum of (nodes × height) converges to O(N).
   */
  static fromArray<T>(arr: T[], compareFn?: (a: T, b: T) => number): MinHeap<T> {
    const heap = new MinHeap<T>(compareFn);
    heap.data = [...arr];
    // Heapify from last non-leaf node down to root
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
      heap.siftDown(i);
    }
    return heap;
  }
}

// Usage — MinHeap (default)
const minHeap = new MinHeap<number>();
minHeap.push(5);
minHeap.push(2);
minHeap.push(8);
minHeap.push(1);
console.log(minHeap.peek()); // 1 (smallest)
console.log(minHeap.pop());  // 1
console.log(minHeap.pop());  // 2

// Usage — MaxHeap (negate comparator)
const maxHeap = new MinHeap<number>((a, b) => b - a);
maxHeap.push(5);
maxHeap.push(2);
maxHeap.push(8);
console.log(maxHeap.peek()); // 8 (largest)

// Usage — Custom objects
const taskHeap = new MinHeap<{ name: string; priority: number }>(
  (a, b) => a.priority - b.priority
);
taskHeap.push({ name: "Fix bug", priority: 1 });
taskHeap.push({ name: "Write docs", priority: 5 });
taskHeap.push({ name: "Deploy", priority: 2 });
console.log(taskHeap.pop()); // { name: "Fix bug", priority: 1 }
```

---

## 5. Scenario B: Top K Frequent Elements

**Real-Life Scenario:** An analytics dashboard shows the "Top 10 most visited pages." With millions of page views, you need this efficiently without sorting the entire dataset.

**Technical Problem:** Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.

### TypeScript Implementation

```typescript
/**
 * Top K Frequent Elements.
 * 
 * Approach 1: Min-Heap of size K.
 * - Count frequencies with HashMap → O(N)
 * - Push all into min-heap of size K → O(N log K)
 * - Heap contains the K most frequent
 * 
 * Why min-heap, not max? We EVICT the smallest-frequency
 * element when heap exceeds size K. What remains = top K.
 * 
 * @timeComplexity O(N log K) — better than O(N log N) sorting
 * @spaceComplexity O(N) for frequency map
 */
function topKFrequent(nums: number[], k: number): number[] {
  // Step 1: Count frequencies
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  // Step 2: Use min-heap of size K
  const heap = new MinHeap<[number, number]>((a, b) => a[1] - b[1]);
  // Entries: [number, frequency]

  for (const [num, freq] of freqMap) {
    heap.push([num, freq]);
    if (heap.size > k) {
      heap.pop(); // Remove least frequent, keeping top K
    }
  }

  // Step 3: Extract results
  const result: number[] = [];
  while (heap.size > 0) {
    result.push(heap.pop()![0]);
  }
  return result;
}

/**
 * Alternative: Bucket Sort approach — O(N) time!
 * 
 * Insight: Max frequency is N, so create N+1 buckets.
 * bucket[freq] = list of numbers with that frequency.
 * Walk buckets from high to low.
 */
function topKFrequentBucket(nums: number[], k: number): number[] {
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  // Bucket sort: index = frequency, value = numbers with that freq
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, freq] of freqMap) {
    buckets[freq].push(num);
  }

  // Collect top K from highest frequency buckets
  const result: number[] = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    result.push(...buckets[i]);
  }
  return result.slice(0, k);
}

// Example:
console.log(topKFrequent([1,1,1,2,2,3], 2)); // [1, 2]
console.log(topKFrequentBucket([1,1,1,2,2,3], 2)); // [1, 2]
```

---

## 6. Scenario C: Median from Data Stream (Two Heaps)

**Real-Life Scenario:** A real-time stock ticker needs to display the median price at all times, even as new prices stream in every millisecond.

**Technical Problem:** Design a data structure that supports `addNum(num)` and `findMedian()` efficiently with streaming data.

### TypeScript Implementation

```typescript
/**
 * MedianFinder — Two Heaps approach.
 * 
 * Split numbers into two halves:
 *   maxHeap (lower half): stores smaller numbers, max at top
 *   minHeap (upper half): stores larger numbers, min at top
 * 
 * Invariant: |maxHeap.size - minHeap.size| ≤ 1
 * 
 * Median:
 *   If sizes equal: average of both tops
 *   If maxHeap larger: maxHeap.peek()
 * 
 *   [1, 2, 3]  |  [5, 6, 8]
 *    maxHeap↑       ↑minHeap
 *    top = 3        top = 5
 *    
 *    median = (3 + 5) / 2 = 4
 * 
 * @timeComplexity addNum: O(log N), findMedian: O(1)
 * @spaceComplexity O(N)
 */
class MedianFinder {
  private maxHeap: MinHeap<number>; // Lower half (max-heap via negate)
  private minHeap: MinHeap<number>; // Upper half (min-heap)

  constructor() {
    this.maxHeap = new MinHeap<number>((a, b) => b - a); // Max-heap
    this.minHeap = new MinHeap<number>();                  // Min-heap
  }

  addNum(num: number): void {
    // Step 1: Add to maxHeap (lower half)
    this.maxHeap.push(num);

    // Step 2: Balance — maxHeap's max should ≤ minHeap's min
    if (this.minHeap.size > 0 && this.maxHeap.peek()! > this.minHeap.peek()!) {
      this.minHeap.push(this.maxHeap.pop()!);
    }

    // Step 3: Size balance — maxHeap can be at most 1 larger
    if (this.maxHeap.size > this.minHeap.size + 1) {
      this.minHeap.push(this.maxHeap.pop()!);
    } else if (this.minHeap.size > this.maxHeap.size) {
      this.maxHeap.push(this.minHeap.pop()!);
    }
  }

  findMedian(): number {
    if (this.maxHeap.size > this.minHeap.size) {
      return this.maxHeap.peek()!;
    }
    return (this.maxHeap.peek()! + this.minHeap.peek()!) / 2;
  }
}

// Usage:
const mf = new MedianFinder();
mf.addNum(1);
console.log(mf.findMedian()); // 1
mf.addNum(2);
console.log(mf.findMedian()); // 1.5
mf.addNum(3);
console.log(mf.findMedian()); // 2
mf.addNum(10);
console.log(mf.findMedian()); // 2.5 → (2 + 3) / 2
```

---

## 7. Real World Applications 🌍

### 1. 🗺️ Dijkstra's Algorithm (Shortest Path)
The priority queue is the ENGINE of Dijkstra. Without it, Dijkstra is O(V²). With a binary heap, it's O((V+E) log V). With a Fibonacci heap, O(V log V + E).

### 2. 📊 Real-Time Analytics Dashboards
"Show me the top 10 most active users in the last hour." Use a min-heap of size 10 — any new user with activity count > heap's min gets added, old min evicted. O(N log 10) = O(N).

### 3. 🏥 Hospital Triage / Task Scheduling
Operating systems use priority queues for process scheduling. Patients in ER, tasks in Kubernetes, messages in RabbitMQ — all prioritized by urgency.

### 4. 🧬 Huffman Coding (Compression)
ZIP, GZIP, JPEG compression all start by building a Huffman tree. The algorithm repeatedly extracts the two minimum-frequency nodes from a min-heap and combines them.

### 5. 🔀 Merge K Sorted Lists/Streams
Given K sorted data streams, use a min-heap of size K to always pick the smallest next element. This is how database merge joins and external sort work. O(N log K).

---

## 8. Complexity Analysis 🧠

### Heap vs Other Priority Structures

| Structure | Insert | Extract Min | Peek | Decrease Key |
|-----------|--------|-------------|------|-------------|
| **Binary Heap** | O(log N) | O(log N) | O(1) | O(log N) |
| **Fibonacci Heap** | O(1)* | O(log N)* | O(1) | O(1)* |
| **Sorted Array** | O(N) | O(1) | O(1) | O(N) |
| **Unsorted Array** | O(1) | O(N) | O(N) | O(1) |
| **BST (balanced)** | O(log N) | O(log N) | O(log N) | O(log N) |

*Amortized

### Heap Problem Patterns

| Pattern | Description | Example Problems |
|---------|-------------|-----------------|
| **Top K** | Min-heap of size K | Top K Frequent, K Closest Points |
| **Kth Largest** | Min-heap of size K, peek = Kth | Kth Largest Element in Stream |
| **Two Heaps** | Max-heap + Min-heap split | Median from Data Stream |
| **K-Way Merge** | Min-heap of K elements | Merge K Sorted Lists |
| **Greedy + Heap** | Repeatedly pick optimal | Task Scheduler, Meeting Rooms II |
| **Sliding Window** | Heap + lazy deletion | Sliding Window Median |

### JavaScript/TypeScript Note

```typescript
// ⚠️ JavaScript has NO built-in heap/priority queue!
// You MUST implement one yourself (or mention that in interviews).
// 
// Python has heapq, Java has PriorityQueue, C++ has priority_queue.
// JS/TS devs need to bring their own MinHeap class.
//
// For LeetCode in JS, many people use a simple MinHeap class.
// In production, use a library like 'heap-js' or 'datastructures-js/priority-queue'.
```

### Interview Tips 💡

1. **"Top K" = Heap.** Whenever you see "find the K largest/smallest/most frequent", use a heap of size K. Time: O(N log K) instead of O(N log N) for full sort.
2. **Min-heap for Top K largest:** Counterintuitive but correct. A min-heap of size K keeps the K largest because you EVICT the smallest (root). The root is the Kth largest.
3. **Two heaps for streaming median:** Max-heap for lower half, min-heap for upper half. Median is at the boundary. Master this — it's asked at every FAANG.
4. **Build heap is O(N), not O(N log N):** Bottom-up heapify. Most nodes are near the leaves and need minimal work.
5. **Negate for max-heap:** In languages without max-heap (like JS), negate values or reverse the comparator. `(a, b) => b - a` turns MinHeap into MaxHeap.
6. **Lazy deletion:** If you can't efficiently remove from the middle of a heap, use "lazy deletion" — mark as deleted and skip when popping. Used in Dijkstra with stale entries.
7. **Know these problems cold:** Top K Frequent Elements, Merge K Sorted Lists, Find Median from Data Stream, Kth Largest Element, Task Scheduler, Meeting Rooms II.
