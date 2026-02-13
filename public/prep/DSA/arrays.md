# Arrays 📦

## 1. The "Egg Carton" Analogy

Imagine an **egg carton** with 12 slots.

- **Each slot has a number** (index): 0, 1, 2, ... 11.
- **Each slot holds exactly one egg** (element).
- You can instantly grab the egg in slot #7 without checking slots 0-6.
- If you want to add an egg in the middle, you must shift all eggs after it to make room.

**This is an Array.** A contiguous block of memory where elements are stored at fixed indices. Direct access is instant (`O(1)`), but insertions/deletions can be expensive (`O(N)`).

---

## 2. The Core Concept

In coding interviews, arrays are the **foundation** of most problems. Understanding their strengths and weaknesses is critical.

**Strengths:**
- **O(1) Random Access:** Jump directly to any index.
- **Cache-Friendly:** Elements are stored together in memory.
- **Simple:** No pointers or complex structures.

**Weaknesses:**
- **O(N) Insertion/Deletion:** Shifting elements is expensive.
- **Fixed Size (in some languages):** Must resize manually.
- **No Built-in Key Lookup:** Finding by value is O(N).

### Key Operations Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| Access by index | O(1) | `arr[5]` |
| Search by value | O(N) | Must scan linearly |
| Insert at end | O(1)* | Amortized (may need resize) |
| Insert at middle | O(N) | Shift elements right |
| Delete at end | O(1) | Just reduce length |
| Delete at middle | O(N) | Shift elements left |

---

## 3. Interactive Visualization 🎮
Click "Next" to see array operations in a sliding window context!

```visualizer
{
  "type": "sliding-window",
  "data": [10, 20, 30, 40, 50, 60, 70],
  "k": 3
}
```

---

## 4. Scenario A: Kadane's Algorithm — Maximum Subarray Sum

**Real-Life Scenario:** You're a stock analyst looking at daily profit/loss. Find the best consecutive stretch of days to maximize total profit.

**Technical Problem:** Given an integer array `nums`, find the contiguous subarray with the largest sum and return its sum.

### TypeScript Implementation

```typescript
/**
 * Kadane's Algorithm — Maximum Subarray Sum.
 * 
 * Key Insight: At each position, decide: "Should I START a new
 * subarray here, or EXTEND the existing one?"
 * 
 * If the running sum goes negative, drop it and start fresh.
 * 
 * @param nums - Array of integers (can include negatives)
 * @returns Maximum subarray sum
 * 
 * @timeComplexity O(N) - Single pass
 * @spaceComplexity O(1) - Only two variables
 */
function maxSubArray(nums: number[]): number {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // Either extend the current subarray or start new from here
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// Usage Example:
const profits = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log("Array:", profits);
console.log("Max Subarray Sum:", maxSubArray(profits)); // 6

// Walkthrough:
// i=0: current=-2, max=-2
// i=1: current=max(1, -2+1)=1, max=1
// i=2: current=max(-3, 1-3)=-2, max=1
// i=3: current=max(4, -2+4)=4, max=4
// i=4: current=max(-1, 4-1)=3, max=4
// i=5: current=max(2, 3+2)=5, max=5
// i=6: current=max(1, 5+1)=6, max=6  ← [4, -1, 2, 1]
// i=7: current=max(-5, 6-5)=1, max=6
// i=8: current=max(4, 1+4)=5, max=6
```

### Variant: Return the subarray itself

```typescript
function maxSubArrayWithIndices(nums: number[]): { sum: number; start: number; end: number } {
  let maxSum = nums[0], currentSum = nums[0];
  let start = 0, end = 0, tempStart = 0;

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > currentSum + nums[i]) {
      currentSum = nums[i];
      tempStart = i;
    } else {
      currentSum += nums[i];
    }

    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }

  return { sum: maxSum, start, end };
}
```

### Sample input and output
- Input: `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]`
- Output: `6` (subarray `[4, -1, 2, 1]`)

---

## 5. Scenario B: Prefix Sum — Range Sum Queries

**Real-Life Scenario:** You're an analytics engineer who gets thousands of queries per second: "What's the total revenue between day 15 and day 300?" You can't re-sum every time.

**Technical Problem:** Given an array, answer multiple range sum queries efficiently using prefix sums.

### TypeScript Implementation

```typescript
/**
 * PrefixSum class — Precomputes cumulative sums for O(1) range queries.
 * 
 * Instead of summing on each query (O(N)), precompute once (O(N))
 * then answer each query in O(1).
 * 
 * prefix[i] = sum of nums[0..i-1]
 * rangeSum(l, r) = prefix[r+1] - prefix[l]
 * 
 * @timeComplexity O(N) build, O(1) per query
 * @spaceComplexity O(N)
 */
class PrefixSum {
  private prefix: number[];

  constructor(nums: number[]) {
    this.prefix = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
      this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
  }

  /**
   * Sum of elements from index left to right (inclusive).
   * @timeComplexity O(1)
   */
  rangeSum(left: number, right: number): number {
    return this.prefix[right + 1] - this.prefix[left];
  }
}

// Usage Example:
const revenue = [5, 2, 8, 3, 1, 7, 4];
const ps = new PrefixSum(revenue);

console.log("Revenue array:", revenue);
console.log("Sum [1..3]:", ps.rangeSum(1, 3)); // 2+8+3 = 13
console.log("Sum [0..6]:", ps.rangeSum(0, 6)); // 5+2+8+3+1+7+4 = 30
console.log("Sum [4..5]:", ps.rangeSum(4, 5)); // 1+7 = 8
```

### 2D Prefix Sum (Matrix Range Sum)

```typescript
/**
 * 2D Prefix Sum for matrix region queries.
 * 
 * Used in image processing and spreadsheet calculations.
 * 
 * @timeComplexity O(M×N) build, O(1) per query
 */
class PrefixSum2D {
  private prefix: number[][];

  constructor(matrix: number[][]) {
    const m = matrix.length, n = matrix[0].length;
    this.prefix = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        this.prefix[i][j] = matrix[i-1][j-1]
          + this.prefix[i-1][j] + this.prefix[i][j-1]
          - this.prefix[i-1][j-1]; // Inclusion-exclusion
      }
    }
  }

  /**
   * Sum of sub-matrix from (r1,c1) to (r2,c2).
   */
  regionSum(r1: number, c1: number, r2: number, c2: number): number {
    return this.prefix[r2+1][c2+1] - this.prefix[r1][c2+1]
         - this.prefix[r2+1][c1] + this.prefix[r1][c1];
  }
}
```

---

## 6. Scenario C: Rotate Array (In-Place Reversal Trick)

**Real-Life Scenario:** A conveyor belt with packages. Rotate all packages to the right by K positions.

**Technical Problem:** Given an array, rotate it to the right by `k` steps in-place.

### TypeScript Implementation

```typescript
/**
 * Rotates array to the right by k steps using the reversal algorithm.
 * 
 * @param nums - Array to rotate (mutated in place)
 * @param k - Number of positions to rotate right
 * 
 * @timeComplexity O(N) - Three reversal passes.
 * @spaceComplexity O(1) - In-place reversal.
 */
function rotate(nums: number[], k: number): void {
  const n = nums.length;
  k = k % n; // Handle k > n
  
  if (k === 0) return;
  
  // Reverse entire array
  reverse(nums, 0, n - 1);
  // Reverse first k elements
  reverse(nums, 0, k - 1);
  // Reverse remaining elements
  reverse(nums, k, n - 1);
}

function reverse(arr: number[], start: number, end: number): void {
  while (start < end) {
    [arr[start], arr[end]] = [arr[end], arr[start]];
    start++;
    end--;
  }
}

// Example Usage:
const arr = [1, 2, 3, 4, 5, 6, 7];
console.log("Original:", [...arr]);
rotate(arr, 3);
console.log("After rotating by 3:", arr); // [5, 6, 7, 1, 2, 3, 4]
```

### The Reversal Trick Explained:
```
Original:     [1, 2, 3, 4, 5, 6, 7], k=3
Reverse all:  [7, 6, 5, 4, 3, 2, 1]
Reverse 0-2:  [5, 6, 7, 4, 3, 2, 1]
Reverse 3-6:  [5, 6, 7, 1, 2, 3, 4] ✓
```

---

## 7. Real World Applications 🌍

### 1. 🖼️ Image Processing
Images are 2D arrays of pixels. Filters, blurs, and transformations operate on array indices. Convolution kernels slide across the pixel array.

### 2. 📊 Time Series Data & Analytics
Stock prices, sensor readings, and metrics are stored in arrays indexed by time. Prefix sums enable O(1) range queries for dashboards.

### 3. 🎵 Audio Buffers
Audio data is processed as arrays of samples. Real-time effects (reverb, EQ) manipulate these arrays using sliding windows.

### 4. 🎮 Game Grids
Chess boards, Sudoku, and tile-based games use 2D arrays for state management. Collision detection uses spatial arrays.

### 5. 🧮 Spreadsheets
Every cell is an element in a 2D array. Formulas like `=SUM(A1:A100)` use prefix sums under the hood.

---

## 8. Complexity Analysis 🧠

### Array vs Other Structures

| Operation | Array | Linked List | HashMap |
|-----------|-------|-------------|---------|
| Access by index | O(1) ✓ | O(N) | N/A |
| Search by value | O(N) | O(N) | O(1) ✓ |
| Insert at end | O(1)* | O(1) | O(1) |
| Insert at start | O(N) | O(1) ✓ | O(1) |
| Delete by index | O(N) | O(1)** | O(1) |

*Amortized (may need resize)
**If you have a pointer to the node

### Common Array Patterns (Must-Know for Interviews)

| # | Pattern | Key Idea | Example Problem |
|---|---------|----------|-----------------|
| 1 | **Two Pointers** | Start from both ends, converge | Container With Most Water, 3Sum |
| 2 | **Sliding Window** | Fixed or dynamic window | Max Sum Subarray, Longest Substring |
| 3 | **Prefix Sum** | Precompute cumulative sums | Range Sum Query, Subarray Sum = K |
| 4 | **Kadane's Algorithm** | Max subarray in O(N) | Maximum Subarray, Max Product |
| 5 | **Dutch National Flag** | 3-way partitioning | Sort Colors (0s, 1s, 2s) |
| 6 | **Boyer-Moore Voting** | Majority element in O(1) space | Majority Element |
| 7 | **Cyclic Sort** | Place each number at correct index | Find Missing Number, Find Duplicate |
| 8 | **Merge Intervals** | Sort by start, merge overlapping | Meeting Rooms, Insert Interval |

### JavaScript/TypeScript Array Gotchas

```typescript
// 1. Array.sort() is lexicographic by default!
[10, 9, 2, 30].sort()              // [10, 2, 30, 9] ❌
[10, 9, 2, 30].sort((a, b) => a - b) // [2, 9, 10, 30] ✓

// 2. .splice() is O(N), not O(1)
arr.splice(2, 0, 'new');  // Insert at index 2 — shifts all after

// 3. .shift() and .unshift() are O(N)
arr.shift();    // Remove from front — shifts everything
arr.unshift(1); // Add to front — shifts everything

// 4. .slice() creates a SHALLOW copy
const copy = arr.slice(); // O(N) copy

// 5. TypedArrays for performance-critical code
const buffer = new Float64Array(1000); // Fixed-type, no boxing
```

### Interview Tips 💡

1. **Sort first:** Many array problems become dramatically easier on sorted input. O(N log N) sort + O(N) scan = O(N log N) total. Worth considering.
2. **Use indices, not extra arrays:** When the problem says "in-place", use index manipulation (two pointers, swap) to avoid O(N) space.
3. **Prefix sum for range queries:** If you see "sum between i and j", immediately think prefix sums.
4. **Kadane's for max subarrays:** The single most important array algorithm. Extend or start new? That's the only decision at each step.
5. **Watch for off-by-one errors:** Arrays are 0-indexed. `for (let i = 0; i < n; i++)` — not `<=`.
6. **Handle edge cases:** Empty array, single element, all negatives (for Kadane's), all duplicates.
7. **Know when arrays aren't enough:** Need O(1) lookup by value? HashMap. Need O(1) insert at front? Linked List. Need sorted + fast insert? BST/TreeSet.
