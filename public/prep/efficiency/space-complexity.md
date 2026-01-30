# Space Complexity 💾

## 1. The "Moving House" Analogy

Imagine you're moving to a new apartment. You have **two options**:

**The "Lazy" Way:**
You bring ALL your furniture from your old house—even duplicates. You also buy new furniture just to be safe. Soon, your new apartment is so stuffed you can barely move. If you move to a bigger house, you buy even MORE stuff. Your storage grows with your house size.

**The "Minimalist" Way:**
You only bring what you absolutely need: a chair, a bed, a table. Whether you move to a studio or a mansion, you keep the same essentials. Your storage stays constant.

**This is Space Complexity.** It measures how much **memory** your algorithm needs as the input grows. Less memory = faster programs, lower costs, and the ability to handle massive datasets.

---

## 2. The Core Concept

In coding interviews, we use **Big O Notation** to describe memory usage.

**The "Brute Force" (O(N)) Way:**
Create a new array that is the same size as the input.
- 10 items → 10 memory slots.
- 1,000,000 items → 1,000,000 memory slots.
- **Linear Growth.** Your memory bill explodes with data size.

**The "In-Place" (O(1)) Way:**
Use only a few variables, regardless of input size.
- 10 items → 3 variables (e.g., `left`, `right`, `temp`).
- 1,000,000 items → Still just 3 variables.
- **Constant Use.** Your memory bill stays fixed.

---

## 3. Interactive Visualization 🎮
Click "Next" to see how memory is used in Binary Search (O(1) space)!

```visualizer
{
  "type": "binary-search", 
  "data": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
  "target": 23
}
```

---

## 4. Scenario A: The Copy vs. In-Place Reversal

**Real-Life Scenario:** You have a deck of cards and want to reverse the order. You can either use a new empty deck (copy) or swap cards in place.

**Technical Problem:** Reverse an array of numbers.

### TypeScript Implementation (O(N) Space - The Copy Way)

```typescript
/**
 * Reverses an array by creating a new one.
 * 
 * @param arr - The array to reverse
 * @returns A new reversed array
 * 
 * @timeComplexity O(N) - We iterate through each element once.
 * @spaceComplexity O(N) - We create a brand new array of the same size.
 */
function reverseArrayCopy(arr: number[]): number[] {
  const result: number[] = []; // NEW array takes O(N) space
  
  for (let i = arr.length - 1; i >= 0; i--) {
    result.push(arr[i]);
  }
  
  return result;
}

// Usage
const original = [1, 2, 3, 4, 5];
console.log("Original:", original);
console.log("Reversed (Copy):", reverseArrayCopy(original));
console.log("Original after:", original); // Unchanged
```

### TypeScript Implementation (O(1) Space - The In-Place Way)

```typescript
/**
 * Reverses an array in-place using two pointers.
 * 
 * @param arr - The array to reverse (mutated in place)
 * @returns The same array, now reversed
 * 
 * @timeComplexity O(N) - We touch each element once.
 * @spaceComplexity O(1) - We only use two pointer variables, regardless of array size.
 */
function reverseArrayInPlace(arr: number[]): number[] {
  let left = 0;
  let right = arr.length - 1;
  
  while (left < right) {
    // Swap using destructuring (no temp variable needed in modern JS)
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
  
  return arr;
}

// Usage
const data = [1, 2, 3, 4, 5];
console.log("Original:", [...data]);
console.log("Reversed (In-Place):", reverseArrayInPlace(data));
console.log("Data after:", data); // MUTATED
```

### Sample input and output
- Input: `[1, 2, 3, 4, 5]`
- Output: `[5, 4, 3, 2, 1]`

---

## 5. Scenario B: Finding Duplicates

**Real-Life Scenario:** You're checking a guest list for duplicate names. You can use a notebook (HashSet) or get clever with sorting.

**Technical Problem:** Find if an array contains any duplicates.

### TypeScript Implementation (O(N) Space - HashSet)

```typescript
/**
 * Finds duplicates using a HashSet.
 * 
 * @param nums - Array of numbers
 * @returns True if duplicates exist
 * 
 * @timeComplexity O(N) - One pass through the array.
 * @spaceComplexity O(N) - HashSet can grow to hold all unique elements.
 */
function containsDuplicateHashSet(nums: number[]): boolean {
  const seen = new Set<number>(); // O(N) space in worst case
  
  for (const num of nums) {
    if (seen.has(num)) {
      return true;
    }
    seen.add(num);
  }
  
  return false;
}
```

### TypeScript Implementation (O(1) Space - Sorting)

```typescript
/**
 * Finds duplicates by sorting first.
 * 
 * @param nums - Array of numbers (will be mutated)
 * @returns True if duplicates exist
 * 
 * @timeComplexity O(N log N) - Dominated by the sort.
 * @spaceComplexity O(1) - In-place sort, only comparing adjacent elements.
 */
function containsDuplicateSorting(nums: number[]): boolean {
  nums.sort((a, b) => a - b); // In-place sort
  
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) {
      return true;
    }
  }
  
  return false;
}

// Example Usage:
console.log("HashSet:", containsDuplicateHashSet([1, 2, 3, 1])); // true
console.log("Sorting:", containsDuplicateSorting([1, 2, 3, 4])); // false
```

---

## 6. Real World Applications 🌍

### 1. 📱 Mobile App Development
Mobile devices have limited RAM (2-8GB). An algorithm that uses O(N²) space could crash the app when processing large photo libraries. In-place algorithms keep apps responsive.

### 2. 🎮 Game Development
Game physics engines process thousands of objects per frame. O(1) space algorithms for collision detection ensure smooth 60fps gameplay without memory spikes.

### 3. 🌐 Serverless Functions (AWS Lambda)
Cloud functions are billed by memory usage. An O(N) space algorithm processing 1GB of data costs money. An O(1) space streaming approach processes chunks and saves costs.

### 4. 🛢️ Database Query Optimization
Database engines choose between "hash joins" (O(N) space, fast) and "nested loop joins" (O(1) space, slower). The optimizer picks based on available memory.

---

## 7. Complexity Analysis 🧠

Why do we care about **Space Complexity**?

### Common Space Complexities (Best to Worst)

| Notation | Name | Example | Memory for 1M items |
|----------|------|---------|---------------------|
| O(1) | Constant | Pointer swaps | ~3 variables |
| O(log N) | Logarithmic | Recursion stack (Binary Search) | ~20 stack frames |
| O(N) | Linear | HashMap, Copy array | 1 million slots |
| O(N²) | Quadratic | 2D matrix | 1 trillion slots ❌ |

### Trade-offs: Time vs Space ⚖️

- **O(1) space often means O(N²) time** — You re-compute instead of caching.
- **O(N) space often means O(N) time** — You cache results for speed (memoization).

**The Golden Rule:** Optimize for the constraint that matters most. If memory is cheap but time is critical, use caching. If memory is limited (embedded systems), go in-place.

### Auxiliary vs Total Space

- **Auxiliary Space:** Extra space used by the algorithm (excluding input).
- **Total Space:** Input + Auxiliary.

When we say "O(1) space," we usually mean **auxiliary space**.
