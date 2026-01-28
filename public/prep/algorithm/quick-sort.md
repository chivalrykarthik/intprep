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
```

---

## 6. Real World Applications 🌍

### 1. ⚡ Language Libraries
Many standard libraries (C++ `std::sort`, Java `Arrays.sort`, JavaScript engines) use optimized versions of Quick Sort (often Introsort - a hybrid of Quick Sort and Heap Sort) because it is extremely fast in practice due to cache locality.

### 2. 📊 Big Data Processing
When you need to sort distributed data, principles of "Divide and Conquer" from Quick Sort are adapted (e.g., TeraSort) to partition data across different machines.

---

## 7. Complexity Analysis 🧠

Why is Quick Sort "Quick"?

### Time Complexity: O(N log N) ⚡
- **Average Case:** O(N log N). We divide the list in half roughly `log N` times, and iterate `N` times at each level.
- **Worst Case:** O(N²). If the array is already sorted (or reverse sorted) and we pick the last element as pivot, we only eliminate one element at a time (like worst-case recursion). *Fix:* Pick a random pivot.

### Space Complexity: O(log N) 💾
- Uses recursion stack space. It's better than Merge Sort's O(N) auxiliary space, which is why it's often preferred for in-memory sorting.
