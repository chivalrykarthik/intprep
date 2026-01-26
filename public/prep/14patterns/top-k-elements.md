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
 * Finds the Kth largest element using a Min Heap.
 * Note: TypeScript doesn't have a built-in MinPriorityQueue data structure in standard lib.
 * We act as if it exists.
 */
function findKthLargest(nums: number[], k: number): number {
    // Create a Min Heap
     const minHeap = new MinPriorityQueue();

     for (const num of nums) {
         minHeap.enqueue(num);
         
         // If heap exceeds K, remove the smallest element.
         // This ensures the heap always contains the "K largest seen so far".
         // The root of this heap is the smallest of the K largest, i.e., the Kth largest.
         if (minHeap.size() > k) {
             minHeap.dequeue();
         }
     }

     return minHeap.front().element; // The Kth largest
}
```

---

## 5. Scenario B: Top K Frequent Elements
**Real-Life Scenario:** Twitter Trending Topics. "What are the top 5 most used hashtags right now?" out of millions of tweets.

**Technical Problem:** Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.

### TypeScript Implementation

```typescript
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
    const minHeap = new MinPriorityQueue({ priority: (x) => x[1] });

    for (const [num, count] of frequencyMap) {
        minHeap.enqueue([num, count]);
        
        if (minHeap.size() > k) {
            minHeap.dequeue();
        }
    }

    // 3. Extract results
    return minHeap.toArray().map(x => x.element[0]);
}
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
