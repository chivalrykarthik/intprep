# Two Heaps ⚖️

## 1. The "Median Calculator" Analogy

Imagine you are a teacher. You have a class of students and you constantly want to know the **Median Score** (the middle student's grade) as you grade papers one by one.

You don't want to re-sort the entire pile of 100 exams every time you grade one new paper. That takes forever.
Instead, you keep two piles:
1.  **The Lower Half Pile:** The students with bad grades. You keep the "best of the worst" (Max) at the top.
2.  **The Upper Half Pile:** The students with good grades. You keep the "worst of the best" (Min) at the top.

When you grade a new paper `85`:
- If it's better than the "best bad student", it goes to the Upper Pile.
- If piles get uneven, you move the top paper to balance them.
- To find the median, you just look at the **top** of one (or both) piles.

**This is the Two Heaps pattern.** By maintaining two priority queues (a Max Heap and a Min Heap), we can find the median of a data stream in **O(1)** time, while adding new numbers in **O(log N)**.

---

## 2. The Core Concept

In coding interviews, we use this to solve problems where we need to find the **Median**, items in a certain range, or balance two sets of data dynamically.

**The "Brute Force" (Dumb) Way:**
Store numbers in an array.
- Every time you need the median: `array.sort()`.
- Return the middle element.
- Complexity: **O(N log N)** for *every* insertion. If you insert N times, it's **O(N² log N)**. Too slow.

**The "Two Heaps" (Smart) Way:**
1. **Max Heap** stores the smaller half of numbers.
2. **Min Heap** stores the larger half.
3. Balance them so their size difference is at most 1.
- **Boom.** Median is always at the top.

---

## 3. Interactive Visualization 🎮
Click "Add" to insert numbers and watch them balance!

```visualizer
{
  "type": "two-heaps", 
  "data": [5, 2, 8, 1, 9]
}
```

---

## 4. Scenario A: Find Median from Data Stream
**Real-Life Scenario:** Netflix wanting to know the median watch time of a video in real-time as millions of users pause/stop watching.

**Technical Problem:** Design a class `MedianFinder` that supports `addNum(int num)` and `findMedian()`.

### TypeScript Implementation

```typescript
/**
 * Generic Heap Implementation
 */
class Heap<T> {
    heap: T[];
    compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.heap = [];
        this.compare = compare;
    }

    size(): number { return this.heap.length; }
    peek(): T { return this.heap[0]; }

    enqueue(val: T): void {
        this.heap.push(val);
        this.bubbleUp();
    }

    dequeue(): T | undefined {
        if (this.size() === 0) return undefined;
        const root = this.heap[0];
        const last = this.heap.pop();
        if (this.size() > 0 && last !== undefined) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return root;
    }

    private bubbleUp(): void {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    private bubbleDown(): void {
        let idx = 0;
        while (true) {
            const leftIdx = 2 * idx + 1;
            const rightIdx = 2 * idx + 2;
            let targetIdx = idx;

            if (leftIdx < this.heap.length && this.compare(this.heap[leftIdx], this.heap[targetIdx]) < 0) {
                targetIdx = leftIdx;
            }
            if (rightIdx < this.heap.length && this.compare(this.heap[rightIdx], this.heap[targetIdx]) < 0) {
                targetIdx = rightIdx;
            }

            if (targetIdx !== idx) {
                [this.heap[idx], this.heap[targetIdx]] = [this.heap[targetIdx], this.heap[idx]];
                idx = targetIdx;
            } else {
                break;
            }
        }
    }
}

class MedianFinder {
    minHeap: Heap<number>; // Stores larger half (Min Heap)
    maxHeap: Heap<number>; // Stores smaller half (Max Heap)

    constructor() {
        // Min Heap: a - b < 0 means a is smaller (standard)
        this.minHeap = new Heap<number>((a, b) => a - b);
        // Max Heap: b - a < 0 means b is smaller (reverse, so larger comes first)
        // Actually, for Max Heap logic in a generic structure:
        // We want parent > child.
        // Our Heap bubbles up if compare returns < 0.
        // So for Max Heap, we want compare(bigger, smaller) < 0.
        // So (a, b) => b - a.
        this.maxHeap = new Heap<number>((a, b) => b - a);
    }

    addNum(num: number): void {
        console.log(`  addNum(${num})`);
        // 1. Add to Max Heap (Small half)
        this.maxHeap.enqueue(num);

        // 2. Move largest of small half to Min Heap (to keep order)
        this.minHeap.enqueue(this.maxHeap.dequeue()!);

        // 3. Balance sizes: Max Heap can have at most 1 more element than Min Heap
        if (this.maxHeap.size() < this.minHeap.size()) {
            this.maxHeap.enqueue(this.minHeap.dequeue()!);
        }
        console.log(`    maxHeap size=${this.maxHeap.size()}, minHeap size=${this.minHeap.size()}`);
    }

    findMedian(): number {
        let median: number;
        if (this.maxHeap.size() > this.minHeap.size()) {
            median = this.maxHeap.peek();
        } else {
            median = (this.maxHeap.peek() + this.minHeap.peek()) / 2;
        }
        console.log(`    Median = ${median}`);
        return median;
    }
}

// Example Usage:
const medianFinder = new MedianFinder();
// addNum(5)  → median: 5
// addNum(2)  → median: (2+5)/2 = 3.5
// addNum(8)  → median: 5
// addNum(1)  → median: (2+5)/2 = 3.5
// addNum(9)  → median: 5
const stream = [5, 2, 8, 1, 9];

console.log("Streaming numbers:", stream);
for (const num of stream) {
    medianFinder.addNum(num);
    console.log(`Added ${num}, Median is: ${medianFinder.findMedian()}`);
}
```
### Sample input and output
- **Input**: Stream `[5, 2, 8, 1, 9]`
- **Output (medians after each add)**: `[5, 3.5, 5, 3.5, 5]`

---

## 5. Scenario B: Sliding Window Median
**Real-Life Scenario:** A stock trading bot needs the median price of a stock over the last 30 days (sliding window), updated every day.

**Technical Problem:** Given an array `nums` and integer `k`, return the median of the subarray of size `k` at each position.

### TypeScript Implementation

> **⚠️ Interview Note:** The brute-force approach below sorts each window independently at O(K log K), giving O(N × K log K) total. The **optimal** approach uses **Two Heaps (Max Heap + Min Heap) with lazy deletion** (using a HashMap to track invalidated elements), achieving **O(N log K)**. In an interview, explain both — implement the simpler version first, then discuss the optimal upgrade.

```typescript
/**
 * Finds median of each sliding window of size k.
 * 
 * @param nums - The array of numbers.
 * @param k - Window size.
 * @returns Array of medians for each window position.
 * 
 * @timeComplexity O(N * K log K) - Sort each window. 
 *   Optimal: O(N log K) using dual heaps with lazy deletion.
 * @spaceComplexity O(K) - For the window copy.
 */
function medianSlidingWindow(nums: number[], k: number): number[] {
    console.log(`\n--- medianSlidingWindow ---`);
    console.log(`Input: nums = [${nums}], k = ${k}`);
    const result: number[] = [];
    
    for (let i = 0; i <= nums.length - k; i++) {
        // 1. Extract window
        const window = nums.slice(i, i + k);
        
        // 2. Sort window (O(K log K))
        window.sort((a, b) => a - b);
        
        // 3. Find median
        const mid = Math.floor(window.length / 2);
        const median = (window.length % 2 === 1)
            ? window[mid]
            : (window[mid - 1] + window[mid]) / 2;
        
        console.log(`  Window [${i}..${i+k-1}]: sorted=[${window}], median=${median}`);
        result.push(median);
    }
    
    console.log(`  Result: [${result}]`);
    return result; 
}

// Example Usage:
const stockPrices = [1, 3, -1, -3, 5, 3, 6, 7];
const windowSize = 3;
console.log("Prices:", stockPrices);
console.log(`Medians (window size ${windowSize}):`, medianSlidingWindow(stockPrices, windowSize));
```

### Optimal Approach Outline (O(N log K))
1. Maintain a **Max Heap** (lower half) and **Min Heap** (upper half) — just like Scenario A.
2. As the window slides, **add** the new element and **remove** the outgoing element.
3. **Lazy deletion:** Don't remove immediately from the heap. Instead, track "invalidated" elements in a HashMap. When they bubble to the top during future operations, discard them.
4. Rebalance heaps after each add/remove to maintain the median property.

### Sample input and output
- **Input**: `nums = [1, 3, -1, -3, 5, 3, 6, 7]`, `k = 3`
- **Output**: `[1, -1, -1, 3, 5, 6]`
  - Window `[1,3,-1]` sorted `[-1,1,3]` → median `1`
  - Window `[3,-1,-3]` sorted `[-3,-1,3]` → median `-1`
  - Window `[-1,-3,5]` sorted `[-3,-1,5]` → median `-1`
  - Window `[-3,5,3]` sorted `[-3,3,5]` → median `3`
  - Window `[5,3,6]` sorted `[3,5,6]` → median `5`
  - Window `[3,6,7]` sorted `[3,6,7]` → median `6`

---

## 6. Real World Applications 🌍

### 1. 📊 Real-time Analytics
Dashboards showing "Median Latency" or "Median Cart Value" use stream processing algorithms based on this pattern (or approximations like T-Digest for massive scale).

### 2. 🎮 Matchmaking Systems
Video games (like Dota 2 or LoL) need to create balanced teams from a queue of players. They might use heap-like structures to quickly pair the highest-ranked available player with a matching opponent.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(log N) ⚡
- **Add Number:** O(log N). Heap insertions/deletions take logarithmic time relative to the number of elements.
- **Find Median:** O(1). Just accessing the root of the heaps.

### Space Complexity: O(N) 💾
- We store every number in one of the two heaps.

---

## 8. Interview Tips 💡

1. **Recognize the trigger words.** "Find the median", "streaming data", "balance between two halves", "sliding window median" — all Two Heaps. The moment you see "median" in any context, Two Heaps should be your first instinct.
2. **Explain the intuition before coding.** *"I'll split numbers into two halves: a max-heap for the smaller half and a min-heap for the larger half. The median is the top of the max-heap (odd count) or the average of both tops (even count). Insertion maintains the split."* This 3-sentence explanation wins the interviewer over before you write a line of code.
3. **The rebalancing logic is where bugs happen.** Rule: `maxHeap.size() - minHeap.size() ∈ {0, 1}`. After every insertion, check: if `maxHeap` has 2 more elements, move its top to `minHeap`, and vice versa. Get this wrong and medians are wrong. Practice until it's muscle memory.
4. **JavaScript has no built-in heap.** Unlike Java (`PriorityQueue`) or Python (`heapq`), JS/TS has NO heap. You must implement one (or use a sorted array for small inputs). In interviews, say: *"I'll implement a MinHeap class first — it takes 2 minutes."* Then write the standard `bubbleUp`/`bubbleDown` implementation.
5. **Sliding Window Median is the hard follow-up.** This requires Two Heaps + lazy deletion (mark elements as deleted but only remove them when they surface at the heap top). It's O(N log K) amortized. Mention this variant proactively to show depth.
6. **Edge cases to mention proactively.** Single number (median is itself), two numbers (average), all same numbers, very large/small values (number precision), and the order of add vs. findMedian calls.
7. **Alternative approaches to mention.** Sorted array with binary insertion: O(N) insertion, O(1) median — better for small streams. Self-balancing BST (AVL/Red-Black): O(log N) for both, but complex to implement. Two Heaps is the sweet spot: O(log N) insertion, O(1) median, reasonable complexity. Name all three to show you considered trade-offs.
