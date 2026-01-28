# Heap Sort

## 1. The "Corporate Hierarchy" Analogy

Imagine a company where the boss MUST always be more capable (larger value) than their direct reports.

**The "Brute Force" Way:**  
You try to arrange the entire company by swapping random employees until it works. Disaster.

**The "Heap Sort" Way:**  
1. **Promote the Best:** You organize everyone into a "Max Heap" structure where every manager is better than their subordinates. The CEO (root) is now guaranteed to be the best (lazgest value).
2. **Retire the CEO:** You take the CEO and move them to a "Hall of Fame" (the end of the sorted array).
3. **Re-organize:** You accidentally promote the intern (last element) to CEO. 
4. **Sift Down:** The intern realizes they are unqualified and swaps with the most capable VP below them. That VP swaps with a Director, and so on, until order is restored.
5. Repeat until everyone is in the Hall of Fame.

**This is Heap Sort.** Build a Max Heap, extract the max, rebuild, repeat.

---

## 2. The Core Concept

In coding interviews, we use this to **sort in-place with O(N log N) time complexity**, avoiding the worst-case O(N^2) of Quick Sort and the O(N) space of Merge Sort.

**The "Brute Force" Way:**
Scan array for max, move to end. Repeat N times.
- *Time Complexity:* O(N²).

**The "Heap Sort" (Smart) Way:**
- **Step 1 (Heapify):** Transform the unsorted array into a Max Heap. Now `arr[0]` is the max.
- **Step 2 (Sort):** Swap `arr[0]` (max) with `arr[end]`.
- **Step 3 (Sift Down):** The new root is likely small. "Sift" it down to its correct position to restore the Max Heap property.
- **Repeat:** Reduce the "heap size" by 1 and repeat until heap size is 1.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the heapify and extraction process!

```visualizer
{
  "type": "heap-sort", 
  "data": [4, 10, 3, 5, 1]
}
```

---

## 4. Scenario A: Standard Heap Sort
**Real-Life Scenario:** You are managing a priority queue of tasks where the most urgent task must always be processed next.

**Technical Problem:** Sort an array of integers `nums` in ascending order without using extra space (O(1) space).

### TypeScript Implementation

```typescript
/**
 * heapSort
 * Sorts an array using the Heap Sort algorithm.
 * 
 * @param nums - The array to sort
 * @returns The sorted array
 * 
 * @timeComplexity O(N log N) - Building heap is O(N), extraction is N * log N.
 * @spaceComplexity O(1) - Done entirely in-place.
 */
function heapSort(nums: number[]): number[] {
  const n = nums.length;

  // 1. Build Max Heap
  // Start from the last non-leaf node and move up
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(nums, n, i);
  }

  // 2. Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    // Move current root (max) to end
    [nums[0], nums[i]] = [nums[i], nums[0]];

    // Call max heapify on the reduced heap
    heapify(nums, i, 0);
  }

  return nums;
}

/**
 * heapify
 * A utility function to maintain the Max Heap property.
 * Bubbles down the element at index i.
 */
function heapify(arr: number[], n: number, i: number) {
  let largest = i; // Initialize largest as root
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  // If left child is larger than root
  if (left < n && arr[left] > arr[largest]) {
    largest = left;
  }

  // If right child is larger than largest so far
  if (right < n && arr[right] > arr[largest]) {
    largest = right;
  }

  // If largest is not root
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];

    // Recursively heapify the affected sub-tree
    heapify(arr, n, largest);
  }
}

// Usage Example
const input = [12, 11, 13, 5, 6, 7];
console.log("Original:", input);
console.log("Sorted:", heapSort([...input]));
```

### Sample input and output
Input: `nums = [12, 11, 13, 5, 6, 7]`
Output: `[5, 6, 7, 11, 12, 13]`

---

## 5. Scenario B: Sort a Nearly Sorted Array (K-Sorted)
**Real-Life Scenario:** You receive data packets that are mostly in order but some arrive slightly out of sequence (e.g., within 5 seconds of their correct time).

**Technical Problem:** Sort an array where each element is at most `k` positions away from its target definition.

### TypeScript Implementation

```typescript
/**
 * sortKSortedArray
 * Uses a Min Heap of size k+1 to efficiently sort.
 * 
 * @timeComplexity O(N log K) - Much faster than O(N log N) if k is small.
 */
function sortKSortedArray(nums: number[], k: number): number[] {
    const heap = new MinHeap();
    const result: number[] = [];

    // Add first k+1 items to heap
    for(let i = 0; i <= k && i < nums.length; i++) {
        heap.push(nums[i]);
    }

    // Process remaining elements
    for(let i = k + 1; i < nums.length; i++) {
        result.push(heap.pop());
        heap.push(nums[i]);
    }

    // Empty the heap
    while(heap.size() > 0) {
        result.push(heap.pop());
    }

    return result;
}

// Usage Example

// Mock MinHeap for demonstration
class MinHeap {
    data: number[] = [];
    push(val: number) { 
        this.data.push(val); 
        this.data.sort((a,b) => a-b); // Simple Sort for demo
    }
    pop(): number { return this.data.shift()!; }
    size(): number { return this.data.length; }
}

const nearlySorted = [6, 5, 3, 2, 8, 10, 9];
const k = 3; 
// Each element is at most 3 positions away from sorted position
console.log("Nearly Sorted:", nearlySorted);
console.log("Fully Sorted:", sortKSortedArray(nearlySorted, k));
```

---

## 6. Real World Applications 🌍

### 1. 🖥️ Operating Systems process scheduling
OS schedulers often use heaps (Priority Queues) to decide which process to run next based on priority, not just arrival time.

### 2. 🎮 A* Pathfinding Algorithm
Games use heaps to store "nodes to explore next", ordered by their estimated cost/distance to the destination.

---

## 7. Complexity Analysis 🧠

Why Heap Sort?

### Time Complexity: O(N log N) ⚡
- **Consistent:** Unlike Quick Sort which can degrade to O(N²), Heap Sort is strictly O(N log N) in all cases (Best, Average, Worst).

### Space Complexity: O(1) 💾
- **In-Place:** Unlike Merge Sort which needs O(N) extra array space, Heap Sort shuffles items within the same array. This is critical for embedded systems with limited memory.
