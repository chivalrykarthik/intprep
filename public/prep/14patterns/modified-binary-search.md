# Modified Binary Search 🔍

## 1. The "Dictionary Shortcut" Analogy

Imagine you are looking for the word "Zebra" in a physical dictionary.
- You don't start at "A" and read every word (Linear Search).
- You open the book roughly in the middle. You see "Monkey".
- "Zebra" comes after "Monkey", so you ignore the entire first half of the book (A-M).
- You split the second half (N-Z) in the middle.

**This is Binary Search.** You discard half of the search space at every step.
**Modified Binary Search** is when the book is a bit weird. Maybe it's "Rotated" (Zebra... A... Monkey) or infinite length. But the core logic—**discarding half**—remains.

---

## 2. The Core Concept

In coding interviews, we use this to find items in **Sorted** (or semi-sorted) arrays efficiently.

**The "Brute Force" (Dumb) Way:**
Scan from index 0 to N-1.
- Complexity: **O(N)**. If N is 1 million, that's 1 million checks.

**The "Binary Search" (Smart) Way:**
1. Check Middle.
2. If Target < Middle: Go Left.
3. If Target > Middle: Go Right.
- **Boom.** Found in **O(log N)** which is practically instant.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the search space shrink!

```visualizer
{
  "type": "binary-search", 
  "data": [1, 3, 5, 8, 12, 15, 19, 22, 28, 33],
  "target": 15
}
```

---

## 4. Scenario A: Binary Search (Standard)
**Real-Life Scenario:** Finding a contact in your phone list (which is sorted alphabetically).

**Technical Problem:** Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return -1.

### TypeScript Implementation

```typescript
/**
 * Standard Binary Search.
 * 
 * @param nums - Sorted array of integers.
 * @param target - The number to find.
 * @returns Index of target, or -1.
 * 
 * @timeComplexity O(log N) - Search space halves every step.
 * @spaceComplexity O(1) - Iterative approach uses constant space.
 */
function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
      // Avoid overflow with large numbers compared to (left + right) / 2
      const mid = Math.floor(left + (right - left) / 2);
      
      if (nums[mid] === target) {
          return mid;
      }
      
      if (nums[mid] < target) {
          left = mid + 1; // Target is in right half
      } else {
          right = mid - 1; // Target is in left half
      }
  }

  return -1;
}

// Example Usage:
const sortedArr = [-1, 0, 3, 5, 9, 12];
const targetVal = 9;
console.log("Array:", sortedArr);
console.log(`Index of ${targetVal}:`, search(sortedArr, targetVal));
```
### Sample input and output
- **Input**: `nums = [-1, 0, 3, 5, 9, 12]`, `target = 9`
- **Output**: `4` (nums[4] = 9)

---

## 5. Scenario B: Search in Rotated Sorted Array (Modified)
**Real-Life Scenario:** You have a sorted deck of cards, but someone "cut" the deck. So it goes `[4, 5, 6, 7, 0, 1, 2]`. It's still sorted, just shifted. You still want to find a card efficiently.

**Technical Problem:** Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.

### TypeScript Implementation

```typescript
/**
 * Search in Rotated Sorted Array.
 * The key is to find which half is SORTED, then decide if target is there.
 */
function searchRotated(nums: number[], target: number): number {
    let left = 0;
    let right = nums.length - 1;

    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        if (nums[mid] === target) return mid;

        // Check if Left Half is sorted
        if (nums[left] <= nums[mid]) {
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1; // Target is in this sorted left half
            } else {
                left = mid + 1; // Target is in the other half
            }
        } 
        // Otherwise, Right Half must be sorted
        else {
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1; // Target is in this sorted right half
            } else {
                right = mid - 1; // Target is in the other half
            }
        }
    }
    return -1;
}

// Example Usage:
const rotatedArr = [4, 5, 6, 7, 0, 1, 2];
const targetItem = 0;
console.log("Rotated Array:", rotatedArr);
console.log(`Index of ${targetItem}:`, searchRotated(rotatedArr, targetItem));
```
### Sample input and output
- **Input**: `nums = [4, 5, 6, 7, 0, 1, 2]`, `target = 0`
- **Output**: `4` (The array was rotated; 0 is at index 4)

---

## 6. Real World Applications 🌍

### 1. 🔍 Database Indexing
Databases (SQL) use B-Trees (a variation of binary search trees) to find records. When you query `WHERE id = 543`, it doesn't scan the whole table; it binary searches the index to jump straight to the data.

### 2. 🐛 Debugging Git (Git Bisect)
When you have a bug introduced sometime in the last 100 commits, you don't check every commit. You use `git bisect`. It checks the middle commit. Good? Ignore older half. Bad? The bug is in the older half. It finds the culprit in `log(100) ≈ 7` steps.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(log N) ⚡
- We cut the problem size in half every iteration. 
- For 1,000,000 items, it only takes ~20 steps.

### Space Complexity: O(1) 💾
- We only need 3 variables (`left`, `right`, `mid`).

---

## 8. Interview Tips 💡

1. **Recognize the trigger words.** "Sorted array", "rotated sorted array", "find minimum/peak", "search in sorted", "find the boundary" — all Modified Binary Search. Also watch for hidden binary search: "minimum speed to finish in H hours" (binary search on the answer space).
2. **Pick a convention and stick to it.** `[left, right]` inclusive vs. `[left, right)` exclusive — both work, but mixing them causes off-by-one bugs. State your convention explicitly: *"I'll use inclusive bounds, so my condition is `left <= right`."* This prevents the #1 binary search bug.
3. **The rotated array trick.** In a rotated sorted array, exactly one half is always sorted. Check which half is sorted (`nums[left] <= nums[mid]`?), then check if target falls in that sorted half. If yes, search there; otherwise, search the other half. Practice this until it's automatic.
4. **Binary search on the answer space is the advanced pattern.** Problems like "Koko Eating Bananas", "Split Array Largest Sum", and "Capacity to Ship Packages" aren't searching an array — they're binary searching over possible *answers* and checking feasibility. The `check()` function is the key. Mention this variant proactively.
5. **Edge cases to mention proactively.** Single element array, target at boundaries (first/last element), all elements identical, integer overflow in `mid = (left + right) / 2` (use `left + Math.floor((right - left) / 2)` instead), and empty array.
6. **Know the "first/last occurrence" template.** Standard binary search finds *any* occurrence. To find the *first* occurrence: when you find target, set `result = mid` and keep searching left (`right = mid - 1`). For *last* occurrence: search right (`left = mid + 1`). This is a very common follow-up.
7. **Recursive vs. Iterative — prefer iterative.** Iterative binary search uses O(1) space. Recursive uses O(log N) for the call stack. In production, iterative is always better. Code iterative, mention recursive exists. If asked about tail recursion, explain that JS/TS engines don't reliably optimize it.
