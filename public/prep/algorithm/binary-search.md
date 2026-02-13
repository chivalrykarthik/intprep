# Binary Search

## 1. The "Dictionary" Analogy

Imagine you are looking for the word **"Planet"** in a physical dictionary.

**The "Brute Force" Way:**  
You start at the very first page and read every single word until you find "Planet". This would take forever.

**The "Binary Search" Way:**  
You open the dictionary exactly in the **middle**.
- You see the word "Magic". Since "Planet" comes *after* "Magic" alphabetically, you know the word cannot be in the first half. You **tear out** (mentally) the entire first half of the book.
- You now look at the middle of the remaining second half.
- You repeat this process—checking the middle, and eliminating half the possibilities—until you land right on "Planet".

**This is Binary Search.** Instead of checking items one by one, we eliminate half of the search space with every single decision.

---

## 2. The Core Concept

In coding interviews, we use this to **find an element in a SORTED collection** efficiently.

**The "Brute Force" (Dumb) Way:**
Iterate through the array from start to finish. If the array has 1 million items, you might have to check 1 million items.
- *Time Complexity:* O(N)

**The "Binary Search" (Smart) Way:**
Check the middle element. If it's the target, great! If not, determine which half the target *must* be in, and discard the other half instantly.
- **Step 1:** Find `mid` index.
- **Step 2:** Compare `arr[mid]` with `target`.
- **Step 3:** Adjust `left` or `right` pointers to narrow the range.
- **Boom.** You find items in massive datasets instantly.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the search in action!

```visualizer
{
  "type": "binary-search", 
  "data": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
  "target": 23
}
```

---

## 4. Scenario A: Standard Search (Classic)
**Real-Life Scenario:** finding a specific student ID in a sorted list of IDs.

**Technical Problem:** Given a sorted array of integers `nums` and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.

### TypeScript Implementation

```typescript
/**
 * binarySearch
 * Performs a standard binary search on a sorted array.
 * 
 * @param nums - A sorted array of numbers
 * @param target - The number to search for
 * @returns The index of the target, or -1 if not found
 * 
 * @timeComplexity O(log N) - We halve the search space in each step.
 * @spaceComplexity O(1) - We only store a few pointers.
 */
function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    // Avoid potential overflow with (left + right) / 2
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) {
      return mid; // Target found
    } else if (nums[mid] < target) {
      left = mid + 1; // Target is in the right half
    } else {
      right = mid - 1; // Target is in the left half
    }
  }

  return -1; // Target not found
}

// Usage Example
const nums = [-1, 0, 3, 5, 9, 12];
const target = 9;
console.log("Input:", nums, "Target:", target);
console.log("Index:", binarySearch(nums, target)); // Output: 4
```

### Sample input and output
Input: `nums = [-1,0,3,5,9,12]`, `target = 9`
Output: `4` (Explanation: 9 exists in nums and its index is 4)

---

## 5. Scenario B: First Bad Version (Boundary Finding)
**Real-Life Scenario:** You are a product manager leading a team to develop a new quality check. Since each version is developed based on the previous version, all the versions after a bad version are also bad. You want to find the **first** bad one to know when the bug was introduced.

**Technical Problem:** You have `n` versions `[1, 2, ..., n]` and you want to find out the first bad one, which causes all the following ones to be bad. You are given an API `isBadVersion(version)` which returns whether `version` is bad.

### TypeScript Implementation

```typescript
/**
 * solution
 * Finds the first bad version using binary search.
 * 
 * @param isBadVersion - An API that returns true if a version is bad
 * @returns A function that takes n and returns the first bad version
 * 
 * @timeComplexity O(log N)
 * @spaceComplexity O(1)
 */
const solution = function(isBadVersion: any) {
    return function(n: number): number {
        let left = 1;
        let right = n;
        
        while (left < right) {
            const mid = left + Math.floor((right - left) / 2);
            
            if (isBadVersion(mid)) {
                // Determine if this is the *first* one, or if there's one before it.
                // We don't exclude 'mid' because it could be the first one.
                right = mid;
            } else {
                // If it's strictly not bad, the first bad one must be after mid.
                left = mid + 1;
            }
        }
        
        // When left == right, we have found the boundary
        return left;
    };
};

// Usage Example
// Let's say version 4 is the first bad version
const isBadVersion = (version: number) => version >= 4;
const findFirstBad = solution(isBadVersion);

const n = 5; // Total 5 versions
console.log("Total versions:", n);
console.log("First bad version:", findFirstBad(n)); // Output: 4
```

---

## 6. Scenario C: Search in Rotated Sorted Array (Most Asked!)
**Real-Life Scenario:** Imagine a circular conveyor belt at an airport carousel. Bags were loaded in order (1-100), but the belt rotated — so it now looks like `[56, 57, ... 100, 1, 2, ... 55]`. You need to find your bag quickly without scanning the entire belt.

**Technical Problem:** An ascending sorted array was rotated at some unknown pivot. Given a target, return its index or -1.

### TypeScript Implementation

```typescript
/**
 * searchRotatedArray
 * Searches for a target in a rotated sorted array.
 * 
 * Key Insight: Even after rotation, at least ONE half is always sorted.
 * We determine which half is sorted, then check if target is in that range.
 * 
 * @timeComplexity O(log N)
 * @spaceComplexity O(1)
 */
function searchRotatedArray(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);

    if (nums[mid] === target) return mid;

    // Determine which half is sorted
    if (nums[left] <= nums[mid]) {
      // LEFT half is sorted [left...mid]
      if (target >= nums[left] && target < nums[mid]) {
        right = mid - 1; // Target is in the sorted left half
      } else {
        left = mid + 1;  // Target must be in the right half
      }
    } else {
      // RIGHT half is sorted [mid...right]
      if (target > nums[mid] && target <= nums[right]) {
        left = mid + 1;  // Target is in the sorted right half
      } else {
        right = mid - 1; // Target must be in the left half
      }
    }
  }

  return -1;
}

// Usage Example
const rotated = [4, 5, 6, 7, 0, 1, 2];
console.log("Array:", rotated);
console.log("Search 0:", searchRotatedArray(rotated, 0)); // Output: 4
console.log("Search 3:", searchRotatedArray(rotated, 3)); // Output: -1
```

### Sample input and output
Input: `nums = [4,5,6,7,0,1,2]`, `target = 0`
Output: `4`

---

## 7. Real World Applications 🌍

### 1. 🚦 Database Indexing (B-Trees)
When you run `SELECT * FROM Users WHERE ID = 54321`, the database doesn't scan millions of rows. B-Trees use binary search at each node to navigate to the correct leaf in O(log N) disk reads.

### 2. 🐛 Git Bisect
`git bisect` uses binary search to find the exact commit that introduced a regression bug. It halves the commit history with each check — finding the culprit in ~20 checks among 1M commits.

### 3. 📦 Package Version Resolution
Package managers (npm, pip) use binary search to find compatible version ranges. Given semver constraints like `>=2.0.0 <3.0.0`, they binary-search through published versions.

### 4. 🎮 Game Physics (Collision Detection)
Binary search over time intervals to pinpoint the exact frame when two objects collide (`t=0` no collision, `t=1` collision → search `[0, 1]`).

### 5. 📊 Rate Limiting / Throttling
Binary search through timestamp arrays to count requests within a sliding window. "How many requests in the last 60 seconds?" → binary search for the boundary timestamp.

---

## 8. Complexity Analysis 🧠

Why do we care about Binary Search?

### Time Complexity: O(log N) ⚡
- **Brute Force:** O(N). Scanning a telephone directory with 1,000,000 names takes 1,000,000 checks.
- **Binary Search:** O(log N). For 1,000,000 names, it takes only ~20 checks. It's incredibly fast.

### Space Complexity: O(1) 💾
- We only need variables to store our `left`, `right`, and `mid` pointers. We don't copy the array.

### Binary Search Patterns Quick Reference

| Pattern | Loop Condition | Return | When to Use |
|---------|---------------|--------|-------------|
| **Exact Match** | `left <= right` | `mid` when found | Find specific element |
| **Left Boundary** | `left < right` | `left` | First occurrence / lower bound |
| **Right Boundary** | `left < right` | `left - 1` | Last occurrence / upper bound |
| **Rotated Array** | `left <= right` | `mid` when found | Rotated sorted array |
| **Answer Space** | `left < right` | `left` | Min/max feasibility problems |

### Interview Tips 💡

1. **Overflow:** Always use `left + Math.floor((right - left) / 2)` instead of `(left + right) / 2` to prevent integer overflow.
2. **Off-by-one:** The #1 source of bugs. Decide upfront: `left <= right` vs `left < right`, and `right = mid` vs `right = mid - 1`.
3. **Monotonic predicate:** If you can phrase the problem as "find the first X where condition is true" and the condition is monotonic (FFFFTTTTT), it's binary search.
4. **Answer space binary search:** For problems like "minimum capacity to ship packages in D days" — binary search on the ANSWER, not the input array.
5. **Rotated arrays:** At least one half is ALWAYS sorted. Check which, then decide.
6. **Duplicates change everything:** With duplicates, worst case becomes O(N) — you can't safely eliminate a half when `nums[left] == nums[mid] == nums[right]`.
7. **Real interview frequency:** Binary search appears in ~30% of coding interviews. Master all 5 patterns above.
