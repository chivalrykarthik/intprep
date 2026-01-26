# Top K Elements 🏆

## 1. The "VIP Bouncer" Analogy

Imagine a nightclub that only allows **3 people** inside at a time. It wants the **3 Richest People**.

A line of 100 people waits outside.
- The bouncer lets the first 3 people in.
- The 4th person arrives.
- The Bouncer compares them to the **poorest** person currently inside.
- If the new person is richer than the poorest person inside, he kicks the poor guy out and lets the new rich guy in.
- If the new person is poorer, he is rejected immediately.

**This is the Top K Elements pattern.** By maintaining a **Min Heap** of size `K`, we can efficiently track the "Top K Largest" items. If a new item is larger than the *smallest* of our top K, it deserves a spot.

---

## 2. The Core Concept

In coding interviews, we use this to find the **K largest**, **K smallest**, or **K most frequent** elements in a large dataset.

**The "Brute Force" (Dumb) Way:**
Sort the entire array of N items.
- Complexity: **O(N log N)**.
- If N is 1 billion and K is 10, sorting everything is huge overkill.

**The "Top K Heap" (Smart) Way:**
1. Use a **Min Heap** of size `K` (to find K Largest).
2. Add first K elements.
3. For every subsequent element, compare with the Heap Root (Minimum of the Top K).
4. If `New > Root`, remove Root and add New.
- **Boom.** Complexity drops to **O(N log K)**. Since K is usually small, this is much faster.

---

## 3. Interactive Visualization 🎮
Click "Next" to filter the top K items!

```visualizer
{
  "type": "top-k", 
  "data": [10, 5, 20, 8, 25, 30, 2, 100],
  "k": 3
}
```

---

## 4. Scenario A: K Largest Elements
**Real-Life Scenario:** A leaderboard showing the "Top 10 Players" in a game with millions of users.

**Technical Problem:** Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.

### TypeScript Implementation

```typescript
/**
 * Minimal MinHeap Implementation
 */
class MinHeap {
    heap: number[];
    constructor() { this.heap = []; }
    
    size(): number { return this.heap.length; }
    peek(): number { return this.heap[0]; }

    enqueue(val: number): void {
        this.heap.push(val);
        this.bubbleUp();
    }

    dequeue(): number | undefined {
        if (this.size() === 0) return undefined;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.size() > 0 && last !== undefined) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return min;
    }

    private bubbleUp(): void {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.heap[idx] < this.heap[parentIdx]) {
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
            let smallest = idx;

            if (leftIdx < this.heap.length && this.heap[leftIdx] < this.heap[smallest]) smallest = leftIdx;
            if (rightIdx < this.heap.length && this.heap[rightIdx] < this.heap[smallest]) smallest = rightIdx;

            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

/**
 * Finds the Kth largest element using a Min Heap.
 */
function findKthLargest(nums: number[], k: number): number {
     const minHeap = new MinHeap();

     for (const num of nums) {
         minHeap.enqueue(num);
         if (minHeap.size() > k) {
             minHeap.dequeue();
         }
     }

     return minHeap.peek(); 
}

// Example Usage:
const kNums = [3, 2, 1, 5, 6, 4];
const K = 2;
console.log("Array:", kNums);
console.log(`${K}nd Largest Element:`, findKthLargest(kNums, K));
```

---

## 5. Scenario B: Top K Frequent Elements
**Real-Life Scenario:** Twitter Trending Topics. "What are the top 5 most used hashtags right now?" out of millions of tweets.

**Technical Problem:** Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.

### TypeScript Implementation

```typescript
/**
 * Minimal MinHeap Implementation (Generic)
 */
class MinHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }
    
    size(): number { return this.heap.length; }

    enqueue(val: T): void {
        this.heap.push(val);
        this.bubbleUp();
    }

    dequeue(): T | undefined {
        if (this.size() === 0) return undefined;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.size() > 0 && last !== undefined) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return min;
    }
    
    toArray(): T[] { return this.heap; }

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
            let smallest = idx;

            if (leftIdx < this.heap.length && this.compare(this.heap[leftIdx], this.heap[smallest]) < 0) {
                smallest = leftIdx;
            }
            if (rightIdx < this.heap.length && this.compare(this.heap[rightIdx], this.heap[smallest]) < 0) {
                smallest = rightIdx;
            }

            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

/**
 * Finds top K frequent elements.
 */
function topKFrequent(nums: number[], k: number): number[] {
    const frequencyMap = new Map<number, number>();

    // 1. Count frequencies: O(N)
    for (const num of nums) {
        frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    }

    // 2. Use Min Heap to keep top K. 
    // Heap stores [num, frequency], ordered by frequency.
    const minHeap = new MinHeap<[number, number]>((a, b) => a[1] - b[1]);

    for (const [num, count] of frequencyMap) {
        minHeap.enqueue([num, count]);
        
        if (minHeap.size() > k) {
            minHeap.dequeue();
        }
    }

    // 3. Extract results
    return minHeap.toArray().map(x => x[0]);
}

// Example Usage:
const freqNums = [1, 1, 1, 2, 2, 3];
const kFreq = 2;
console.log("Array:", freqNums);
console.log(`Top ${kFreq} Frequent Elements:`, topKFrequent(freqNums, kFreq));
```

---

## 6. Real World Applications 🌍

### 1. 🔍 Search Suggestions
When you type "React", Google shows the top 5 most popular queries starting with "React". It doesn't sort every possible query; it keeps the top K most relevant ones.

### 2. 🚨 Uber/Lyft Nearest Drivers
Finding the K nearest drivers to your location. Instead of calculating distance to every driver on earth and sorting, use a geospatial heap (or quadtree) to find the nearest K efficiently.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(N log K) ⚡
- We iterate N items.
- Heap operations take O(log K).
- `log K` is much smaller than `log N`.

### Space Complexity: O(K) 💾
- We only store K elements in memory at any time (plus map storage for frequency problems).
