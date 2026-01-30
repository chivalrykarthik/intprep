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

## 4. Scenario A: Two Sum (HashMap Optimization)

**Real-Life Scenario:** You have a shopping list with prices. Find two items that add up exactly to your budget.

**Technical Problem:** Given an array of integers `nums` and an integer `target`, return indices of two numbers that add up to `target`.

### TypeScript Implementation

```typescript
/**
 * Finds two numbers that add up to target using a HashMap.
 * 
 * @param nums - Array of numbers
 * @param target - Target sum
 * @returns Indices of the two numbers, or empty array if not found
 * 
 * @timeComplexity O(N) - Single pass through the array.
 * @spaceComplexity O(N) - HashMap stores up to N elements.
 */
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>(); // value -> index
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    
    seen.set(nums[i], i);
  }
  
  return [];
}

// Example Usage:
const nums = [2, 7, 11, 15];
const target = 9;
console.log("Input:", nums, "Target:", target);
console.log("Indices:", twoSum(nums, target)); // [0, 1]
```

### Sample input and output
- Input: `nums = [2, 7, 11, 15]`, `target = 9`
- Output: `[0, 1]` (because nums[0] + nums[1] = 2 + 7 = 9)

---

## 5. Scenario B: Rotate Array (In-Place)

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

## 6. Real World Applications 🌍

### 1. 🖼️ Image Processing
Images are 2D arrays of pixels. Filters, blurs, and transformations operate on array indices.

### 2. 📊 Time Series Data
Stock prices, sensor readings, and metrics are stored in arrays indexed by time.

### 3. 🎵 Audio Buffers
Audio data is processed as arrays of samples. Real-time effects manipulate these arrays.

### 4. 🎮 Game Grids
Chess boards, Sudoku, and tile-based games use 2D arrays for state management.

---

## 7. Complexity Analysis 🧠

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

### Common Array Patterns

1. **Two Pointers:** Start from both ends, converge.
2. **Sliding Window:** Fixed or dynamic window over contiguous elements.
3. **Prefix Sum:** Precompute cumulative sums for range queries.
4. **Kadane's Algorithm:** Maximum subarray sum in O(N).
5. **Dutch National Flag:** Three-way partitioning.

### Interview Tips 💡

- **Consider sorting first:** Many problems become easier on sorted arrays.
- **Use indices, not separate arrays:** Saves space.
- **Watch for off-by-one errors:** Arrays are 0-indexed.
- **Handle edge cases:** Empty arrays, single element, duplicates.
