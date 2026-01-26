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
 * Note: TypeScript/JS doesn't have a built-in Heap/PriorityQueue. 
 * We assume a MinPriorityQueue and MaxPriorityQueue class exists for this example.
 */

class MedianFinder {
    minHeap: MinPriorityQueue<number>; // Stores larger half
    maxHeap: MaxPriorityQueue<number>; // Stores smaller half

    constructor() {
        this.minHeap = new MinPriorityQueue();
        this.maxHeap = new MaxPriorityQueue();
    }

    /**
     * Adds a number to the data stream.
     * @timeComplexity O(log N) - Heap insertion
     */
    addNum(num: number): void {
        // 1. Add to Max Heap (Small half)
        this.maxHeap.enqueue(num);

        // 2. Move largest of small half to Min Heap (to keep order)
        this.minHeap.enqueue(this.maxHeap.dequeue().element);

        // 3. Balance sizes: Max Heap can have at most 1 more element than Min Heap
        if (this.maxHeap.size() < this.minHeap.size()) {
            this.maxHeap.enqueue(this.minHeap.dequeue().element);
        }
    }

    /**
     * Returns the median of all elements so far.
     * @timeComplexity O(1) - calculating from tops
     */
    findMedian(): number {
        if (this.maxHeap.size() > this.minHeap.size()) {
            return this.maxHeap.front().element;
        } else {
            return (this.maxHeap.front().element + this.minHeap.front().element) / 2;
        }
    }
}
```

---

## 5. Scenario B: Sliding Window Median
**Real-Life Scenario:** A stock trading bot needs the median price of a stock over the last 30 days (sliding window), updated every day.

**Technical Problem:** Given an array `nums` and integer `k`, return the median of the subarray of size `k` at each position.

### TypeScript Implementation

```typescript
/**
 * Finds median of sliding window. (Conceptual implementation)
 * Doing this efficiently requires a HashHeap (Heap + HashMap) to remove arbitrary elements in O(log N).
 */
function medianSlidingWindow(nums: number[], k: number): number[] {
    const result: number[] = [];
    // Conceptual:
    // 1. Init Two Heaps with first k elements.
    // 2. Record median.
    // 3. Slide:
    //    - Remove nums[i-k] (Requires lazy removal or HashHeap)
    //    - Add nums[i]
    //    - Rebalance
    //    - Record new median.
    
    return result; 
}
```

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
