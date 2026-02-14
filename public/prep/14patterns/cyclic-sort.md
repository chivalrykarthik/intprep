# Cyclic Sort 🔄

## 1. The "Assigned Parking Spot" Analogy

Imagine a company parking lot where every employee has a specifically numbered spot matching their ID badge.
- Employee #1 gets Spot #1.
- Employee #3 gets Spot #3.

One day, everyone parks randomly.
- Valid Approach: You walk to Spot #1. You find Employee #3 there.
- You tell Employee #3: "Go to your real spot, Spot #3."
- If someone else is in Spot #3, you kick them out too, until everyone is in their correct place.

**This is Cyclic Sort.** When you are given numbers ranging from **1 to N**, you don't need a complex algorithm (like Merge Sort) to sort them. You know *exactly* where each number belongs. Number `x` belongs at index `x-1`.

---

## 2. The Core Concept

In coding interviews, we use this to solve problems involving **arrays containing numbers in a given range** (like 1 to N, or 0 to N).

**The "Brute Force" (Dumb) Way:**
Use a standard sort like QuickSort.
- Complexity: **O(N log N)**.
- Then iterate to find missing/duplicate numbers.

**The "Cyclic Sort" (Smart) Way:**
Iterate through the array.
- If `nums[i]` is not at the index `nums[i] - 1`, **SWAP** it with the number that IS there.
- Keep swapping the current position until the correct number sits there.
- **Boom.** Sorted in **O(N)** time with **O(1)** space.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the numbers swap to their homes!

```visualizer
{
  "type": "cyclic-sort", 
  "data": [3, 1, 5, 4, 2]
}
```

---

## 4. Scenario A: The Missing Number (0 to N)
**Real-Life Scenario:** You check a deck of cards (numbered 0 to N) to see which one fell under the couch.

**Technical Problem:** Given an array containing `n` distinct numbers taken from `0, 1, 2, ..., n`, find the one that is missing.

### TypeScript Implementation

```typescript
/**
 * Finds the missing number in the range [0, n].
 * 
 * @param nums - Array of n distinct numbers.
 * @returns The missing number.
 * 
 * @timeComplexity O(N) - Use Cyclic Sort to place elements.
 * @spaceComplexity O(1) - In-place modification.
 */
function missingNumber(nums: number[]): number {
  console.log(`\n--- missingNumber ---`);
  console.log(`Input: nums = [${nums}]`);
  let i = 0;
  const n = nums.length;

  while (i < n) {
      const correctIdx = nums[i]; 

      if (nums[i] < n && nums[i] !== nums[correctIdx]) {
          console.log(`  i=${i}: swapping nums[${i}]=${nums[i]} with nums[${correctIdx}]=${nums[correctIdx]}`);
          [nums[i], nums[correctIdx]] = [nums[correctIdx], nums[i]];
          console.log(`    Array after swap: [${nums}]`);
      } else {
          console.log(`  i=${i}: nums[${i}]=${nums[i]} is in place (or out of range), moving on`);
          i++;
      }
  }

  console.log(`  Sorted array: [${nums}]`);
  // Find the first index that doesn't match its value
  for (let j = 0; j < n; j++) {
      if (nums[j] !== j) {
          console.log(`  Missing number found at index ${j}: ${j}`);
          return j;
      }
  }

  console.log(`  Missing number is ${n} (all indices filled)`);
  return n;
}

// Example Usage:
const inputNums = [3, 0, 1];
console.log("Input Array:", inputNums);
console.log("Missing Number:", missingNumber(inputNums));
```
### Sample input and output
- **Input**: `[3,0,1]`
- **Output**: `2` (Sorted: `[0, 1, 3]`. Index 2 has 3, not 2).

---

## 5. Scenario B: Find the Duplicate Number
**Real-Life Scenario:** You are handing out tickets #1 to #N. Someone snuck in a counterfeit ticket, so there are two tickets with the same number.

**Technical Problem:** Given an array of integers containing `n + 1` integers where each integer is in the range `[1, n]`, prove that at least one duplicate exists using constant extra space.

### TypeScript Implementation

```typescript
/**
 * Finds the duplicate number.
 */
function findDuplicate(nums: number[]): number {
    console.log(`\n--- findDuplicate ---`);
    console.log(`Input: nums = [${nums}]`);
    let i = 0;
    while (i < nums.length) {
        const correctIdx = nums[i] - 1;

        if (nums[i] !== nums[correctIdx]) {
             console.log(`  i=${i}: swapping nums[${i}]=${nums[i]} with nums[${correctIdx}]=${nums[correctIdx]}`);
             [nums[i], nums[correctIdx]] = [nums[correctIdx], nums[i]];
             console.log(`    Array after swap: [${nums}]`);
        } else {
            if (i !== correctIdx) {
                console.log(`  i=${i}: nums[${i}]=${nums[i]} already at correct spot but i≠correctIdx → DUPLICATE found!`);
                return nums[i];
            }
            console.log(`  i=${i}: nums[${i}]=${nums[i]} is in correct place, moving on`);
            i++;
        }
    }
    return -1;
}

// Example Usage:
const dupNums = [1, 3, 4, 2, 2];
console.log("Array with duplicate:", dupNums);
console.log("Duplicate Number:", findDuplicate(dupNums));
```
### Sample input and output
- **Input**: `[1, 3, 4, 2, 2]`
- **Output**: `2` (After cyclic sorting, index 4 still holds 2 — it's the duplicate)

---

## 6. Real World Applications 🌍

### 1. 📦 Warehouse Inventory
If every shelf has a dedicated slot for a specific Product ID (1-1000), you can quickly audit the warehouse by moving items to their slot. Any slot that ends up empty or has the wrong item reveals inventory errors immediately.

### 2. 🧩 Data Integrity & Cryptography
Certain hashing algorithms or checksum validations rely on permutations of numbers 1..N. Cyclic sort logic is used to verify that a permutation is valid or to restore a canonical ordering.

---

## 7. Complexity Analysis 🧠

Why is this faster than normal sorting?

### Time Complexity: O(N) ⚡
- **Wait, isn't there a loop inside a loop?** No.
- In the `while` loop, every time we swap, we place **at least one number** in its correct position.
- Once a number is correct, we never move it again.
- A number is moved at most once to its home. So we do at most `N` swaps. Total operations: `O(N) + O(N) = O(N)`.

### Space Complexity: O(1) 💾
- We sort the array in-place. No extra `HashMap` or `Set` needed.

---

## 8. Interview Tips 💡

1. **Recognize the trigger words.** "Numbers in the range 1 to N", "missing number", "find duplicate", "first missing positive", "array of length N with values in [0, N]" — all Cyclic Sort territory. The moment you see a bounded range, think placement.
2. **Don't confuse with general sorting.** Cyclic Sort works ONLY when values map to indices (value `x` → index `x-1` or `x`). If values are arbitrary, use Merge/Quick Sort. If you can place every number "home" in O(1) with a known address, it's Cyclic Sort.
3. **Watch the index mapping carefully.** 0-indexed range `[0, N]`: value `x` goes to index `x`. 1-indexed range `[1, N]`: value `x` goes to index `x-1`. Getting this wrong leads to infinite loops. State your mapping explicitly before coding.
4. **First Missing Positive is the hardest variant.** Given an unsorted array with any integers, find the smallest missing positive integer in O(N) time, O(1) space. The trick: ignore negatives and values > N, then use Cyclic Sort on the positives. This is a common Google/Meta question.
5. **Edge cases to mention proactively.** Value N in a 0-indexed range (has no valid position), negative numbers in the input, zeros, duplicates (what happens when `nums[i] === nums[correctIdx]`), and empty array.
6. **Explain the O(N) time proof.** The inner `while` loop looks like O(N²) but it's not — every swap places at least one element in its correct position, and once placed, it's never moved again. Total swaps ≤ N. This amortized argument is important to articulate.
7. **Compare with XOR/Math approaches.** Missing Number can also be solved with `XOR(0..N) ^ XOR(array)` or `sum(0..N) - sum(array)`. These are O(N)/O(1) but only find ONE missing number. Cyclic Sort generalizes — it can find ALL missing numbers, ALL duplicates, and the duplicate-and-missing pair. Name these alternatives to show breadth.
