# Quick Sort

## 1. The "Classroom Height Line" Analogy

Imagine a teacher needs to line up students by height.

**The "Brute Force" Way:**  
The teacher measures everyone against everyone else, swapping them endlessly. (Bubble Sort style). Chaos ensues.

**The "Quick Sort" Way:**  
The teacher picks one student (let's call him "Pivot Paul") and stands him in the middle of the room.
- She shouts: *"Everyone shorter than Paul, go to the left wall! Everyone taller, go to the right wall!"*
- Now Paul is in his **perfect, final spot**. He never needs to move again.
- The teacher then ignores Paul and repeats the exact same process for the "Short Group" and the "Tall Group", picking a new pivot for each.
- Eventually, everyone is locked into their correct spot.

**This is Quick Sort.** It's a "Divide and Conquer" strategy. Partition the array around a pivot, then recursively sort the sub-arrays.

---

## 2. The Core Concept

In coding interviews, we use this to **sort arrays efficiently** or find the **Kth smallest/largest element**.

**The "Brute Force" (Dumb) Way:**
Bubble Sort or Insertion Sort.
- *Time Complexity:* O(N²) - Painfully slow for large datasets.

**The "Quick Sort" (Smart) Way:**
- **Step 1:** Pick a **pivot** element (usually the last element).
- **Step 2:** **Partition** the array: move all smaller elements to the left of the pivot, and all larger ones to the right.
- **Step 3:** Recursively repeat for left and right partitions.
- **Boom.** Sorted.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the partitioning magic!

```visualizer
{
  "type": "quick-sort", 
  "data": [8, 3, 1, 7, 0, 10, 2]
}
```

---

## 4. Scenario A: Standard Quick Sort
**Real-Life Scenario:** Sorting a list of transaction timestamps to display history chronologically.

**Technical Problem:** Given an array of integers `nums`, sort the array in ascending order using the Quick Sort algorithm.

### TypeScript Implementation

```typescript
/**
 * quickSort
 * Sorts an array using the Quick Sort algorithm.
 * 
 * @param nums - The array to sort
 * @returns The sorted array
 * 
 * @timeComplexity O(N log N) - Average case.
 * @spaceComplexity O(log N) - Recursion stack space.
 */
function quickSort(nums: number[]): number[] {
    // Helper function to handle recursion
    function sort(arr: number[], low: number, high: number) {
        if (low < high) {
            // pi is partitioning index, arr[pi] is now at right place
            const pi = partition(arr, low, high);

            // Recursively sort elements before partition and after partition
            sort(arr, low, pi - 1);
            sort(arr, pi + 1, high);
        }
    }

    function partition(arr: number[], low: number, high: number): number {
        const pivot = arr[high];
        let i = (low - 1); // Index of smaller element

        for (let j = low; j < high; j++) {
            // If current element is smaller than the pivot
            if (arr[j] < pivot) {
                i++;
                // Swap arr[i] and arr[j]
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        // Swap pivot to its correct position
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        return i + 1;
    }

    sort(nums, 0, nums.length - 1);
    return nums;
}

// Usage Example
const input = [5, 2, 9, 1, 5, 6];
console.log("Original:", input);
console.log("Sorted:", quickSort([...input])); // Pass copy since it sorts in-place
```

### Sample input and output
Input: `nums = [5,2,3,1]`
Output: `[1,2,3,5]`

---

## 5. Scenario B: Kth Largest Element (Quick Select)
**Real-Life Scenario:** You want to find the 3rd highest score in a leaderboard of millions of players, without sorting the entire list (which is expensive).

**Technical Problem:** Find the `k`th largest element in an unsorted array.

### TypeScript Implementation

```typescript
/**
 * findKthLargest
 * Uses Quick Select (Variation of Quick Sort) to find the Kth largest element.
 * 
 * @param nums - Unsorted array
 * @param k - The rank to find
 * @returns The Kth largest element
 * 
 * @timeComplexity O(N) - Average case (we only recurse into one half).
 * @spaceComplexity O(1) - Can be done iteratively.
 */
function findKthLargest(nums: number[], k: number): number {
    const targetIndex = nums.length - k;
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        const pivotIndex = partition(nums, left, right);

        if (pivotIndex === targetIndex) {
            return nums[pivotIndex];
        } else if (pivotIndex < targetIndex) {
            left = pivotIndex + 1;
        } else {
            right = pivotIndex - 1;
        }
    }
    
    return -1;
    
    // Standard partition function (same as above)
    function partition(arr: number[], low: number, high: number): number {
        const pivot = arr[high];
        let i = low;
        for (let j = low; j < high; j++) {
            if (arr[j] < pivot) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                i++;
            }
        }
        [arr[i], arr[high]] = [arr[high], arr[i]];
        return i;
    }
}

// Usage Example
const scores = [3, 2, 1, 5, 6, 4];
const k = 2;
console.log("Scores:", scores);
console.log(`${k}nd Largest Element:`, findKthLargest(scores, k)); // Output 5
```

---

## 6. Real World Applications 🌍

### 1. ⚡ Language Standard Libraries
Many standard libraries (C++ `std::sort`, Java `Arrays.sort`, JavaScript engines) use optimized versions of Quick Sort. Modern implementations use **Introsort** — Quick Sort that falls back to Heap Sort if recursion depth exceeds O(log N), guaranteeing O(N log N) worst case.

### 2. 📊 Big Data Processing (TeraSort)
Distributed sorting algorithms partition data across machines using Quick Sort's partitioning strategy. Each machine gets a range of values, sorts locally, then the results are concatenated.

### 3. 🎯 Quick Select (Order Statistics)
"Find the Kth smallest element without fully sorting" — Quick Select uses Quick Sort's partition to narrow down to the Kth element in O(N) average time. Used in database query optimizers for `ORDER BY ... LIMIT K`.

### 4. 🔒 Dutch National Flag (3-Way Partition)
Sort an array of 0s, 1s, and 2s in one pass using 3-way partitioning. This is a direct application of the partition step and a classic interview question.

### 5. 🧮 Randomized Algorithms
Quick Sort is one of the most studied randomized algorithms. It demonstrates how randomization can turn a worst-case O(N²) algorithm into expected O(N log N) — a key concept in algorithm design.

---

## 7. Complexity Analysis 🧠

Why is Quick Sort "Quick"?

### Time Complexity: O(N log N) ⚡
- **Average Case:** O(N log N). We divide the list in half roughly `log N` times, and iterate `N` times at each level.
- **Worst Case:** O(N²). If the array is already sorted (or reverse sorted) and we pick the last element as pivot, we only eliminate one element at a time. *Fix:* Pick a random pivot or use median-of-three.
- **Best Case:** O(N log N). When the pivot always lands in the middle.

### Space Complexity: O(log N) 💾
- Uses recursion stack space. It's better than Merge Sort's O(N) auxiliary space, which is why it's often preferred for in-memory sorting.
- Worst case space: O(N) — when the recursion is maximally unbalanced.

### Why Quick Sort is Fastest in Practice

```
Cache Locality:  Quick Sort wins!
──────────────────────────────────
Quick Sort: Scans array sequentially (cache-friendly)
  [████████████████████]  → CPU prefetcher loves this
  
Merge Sort: Creates new arrays, copies back and forth
  [████████] → new[] → [████████████████████]
  
Heap Sort: Jumps parent → child → sibling (random access pattern)
  [█ ← → █ ← → █]  → cache misses
```

### Randomized Pivot (Fixing Worst Case)

```typescript
/**
 * Randomized partition — prevents O(N²) on sorted input.
 * Swap a random element with the last, then partition normally.
 */
function randomizedPartition(arr: number[], low: number, high: number): number {
  const randomIndex = low + Math.floor(Math.random() * (high - low + 1));
  [arr[randomIndex], arr[high]] = [arr[high], arr[randomIndex]];
  return partition(arr, low, high); // Standard Lomuto partition
}
```

### Interview Tips 💡

1. **Always use random pivot:** If an interviewer mentions "worst case", show you know about randomized Quick Sort. Swap `arr[random]` with `arr[high]` before partitioning.
2. **Lomuto vs Hoare partition:** Lomuto (shown above) is simpler to implement. Hoare uses two pointers from both ends and is ~3x faster in practice (fewer swaps). Know both.
3. **3-Way partition for duplicates:** When the array has many duplicate values, standard Quick Sort degrades. Use Dutch National Flag (3-way partition: `< pivot | == pivot | > pivot`) to handle duplicates in O(N).
4. **Quick Select for Kth element:** Don't sort the whole array. Partition once, recurse into only ONE side. Average O(N), worst O(N²). This is the basis of `std::nth_element` in C++.
5. **Tail recursion optimization:** Recurse into the SMALLER partition first, then use a loop for the larger one. This reduces the stack depth from O(N) to O(log N) in the worst case.
6. **Not stable:** Quick Sort is NOT stable. If you need stability, use Merge Sort or TimSort.
7. **When NOT to use Quick Sort:** Linked lists (no random access for partition), already sorted data (without randomization), and when worst case must be guaranteed O(N log N) — use Merge Sort or Heap Sort.
