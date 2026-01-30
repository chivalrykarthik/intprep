# Big O Notation 📐

## 1. The "Restaurant Kitchen" Analogy

Imagine you own a restaurant. You want to know: **How will my kitchen cope as more customers arrive?**

**Chef Alice (O(1) - Constant):**
She makes instant coffee. Whether 1 customer or 1000 customers order, she presses ONE button. Time is always the same.

**Chef Bob (O(N) - Linear):**
He personally grills each steak. 10 steaks = 10 minutes. 100 steaks = 100 minutes. Time grows directly with orders.

**Chef Carol (O(N²) - Quadratic):**
For each dish, she asks EVERY other chef if they need ingredients. 10 chefs = 100 conversations. 100 chefs = 10,000 conversations. She's a bottleneck.

**Chef Dave (O(log N) - Logarithmic):**
He uses a binary system to find ingredients. In a warehouse of 1000 items, he only checks ~10 shelves (halving each time). He's lightning fast.

**This is Big O Notation.** It describes how an algorithm's performance **scales** as input size grows. It's not about exact seconds—it's about the **growth pattern**.

---

## 2. The Core Concept

In coding interviews, we use Big O to compare algorithms and predict how they'll behave with large datasets.

**Key Insight:** We always care about the **worst case** and we **drop constants**.
- O(2N) → O(N) (constants don't matter at scale)
- O(N + 1000) → O(N) (we care about the dominant term)
- O(N² + N) → O(N²) (N² dominates as N grows)

### The Big O Hierarchy (Fast to Slow)

```
O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N) < O(N!)
```

---

## 3. Interactive Visualization 🎮
Click "Next" to see O(log N) Binary Search in action!

```visualizer
{
  "type": "binary-search", 
  "data": [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29],
  "target": 19
}
```

---

## 4. Scenario A: Finding an Element (O(1) vs O(N) vs O(log N))

**Real-Life Scenario:** Finding a book in a library.

**Technical Problem:** Given a collection, find if a specific element exists.

### TypeScript Implementation

```typescript
/**
 * O(1) - Constant Time: HashMap Lookup
 * Like knowing the exact shelf number instantly.
 */
function findInHashMap(map: Map<number, boolean>, target: number): boolean {
  return map.has(target); // Direct access, always 1 operation
}

/**
 * O(N) - Linear Time: Array Search
 * Like checking every book on every shelf.
 */
function findInArray(arr: number[], target: number): boolean {
  for (const num of arr) {
    if (num === target) return true;
  }
  return false;
}

/**
 * O(log N) - Logarithmic Time: Binary Search
 * Like using the Dewey Decimal System to halve your search each time.
 */
function findWithBinarySearch(sortedArr: number[], target: number): boolean {
  let left = 0;
  let right = sortedArr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedArr[mid] === target) return true;
    if (sortedArr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return false;
}

// Performance Comparison
const size = 1000000;
const arr = Array.from({ length: size }, (_, i) => i);
const map = new Map(arr.map(n => [n, true]));
const target = 999999;

console.time("O(1) HashMap");
findInHashMap(map, target);
console.timeEnd("O(1) HashMap");

console.time("O(N) Array");
findInArray(arr, target);
console.timeEnd("O(N) Array");

console.time("O(log N) Binary");
findWithBinarySearch(arr, target);
console.timeEnd("O(log N) Binary");
```

### Sample input and output
- HashMap: ~0.01ms (constant)
- Array: ~5-10ms (depends on position)
- Binary Search: ~0.02ms (always fast)

---

## 5. Scenario B: Sorting Algorithms Compared

**Real-Life Scenario:** Organizing a deck of cards from low to high.

**Technical Problem:** Sort an array of numbers.

### TypeScript Implementation

```typescript
/**
 * O(N²) - Bubble Sort
 * Compare every pair, bubble up largest. Slow but simple.
 * 
 * @timeComplexity O(N²) - Nested loops comparing all pairs.
 */
function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

/**
 * O(N log N) - Merge Sort
 * Divide and conquer. Split, sort halves, merge.
 * 
 * @timeComplexity O(N log N) - log N levels, N work per level.
 */
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  
  return [...result, ...left.slice(i), ...right.slice(j)];
}

// Comparison for 10,000 elements
const testData = Array.from({ length: 10000 }, () => Math.random() * 10000);

console.time("O(N²) Bubble Sort");
bubbleSort([...testData]);
console.timeEnd("O(N²) Bubble Sort"); // ~seconds

console.time("O(N log N) Merge Sort");
mergeSort([...testData]);
console.timeEnd("O(N log N) Merge Sort"); // ~milliseconds
```

---

## 6. Real World Applications 🌍

### 1. 🔍 Google Search (O(log N) Index Lookups)
Google doesn't scan billions of pages for every search. They use inverted indexes with O(log N) lookups to return results in milliseconds.

### 2. 📱 Social Media Feeds (O(N log N) Sorting)
Your feed is sorted by relevance/time. Platforms use efficient O(N log N) algorithms to rank thousands of posts instantly.

### 3. 🎮 Pathfinding in Games (O(N²) vs O(N log N))
Early games used O(N²) algorithms for enemy AI pathfinding. Modern games use A* algorithm (O(N log N)) for smooth real-time navigation.

### 4. 🧬 DNA Sequencing (Avoiding O(N!) )
Brute-force genome alignment would take O(N!) time—longer than the age of the universe. Dynamic programming reduces it to O(N²) or better.

---

## 7. Complexity Analysis 🧠

### The Big O Cheat Sheet

| Complexity | Name | Example | 1000 items | 1M items |
|------------|------|---------|------------|----------|
| O(1) | Constant | Array access | 1 op | 1 op |
| O(log N) | Logarithmic | Binary Search | 10 ops | 20 ops |
| O(N) | Linear | Single loop | 1K ops | 1M ops |
| O(N log N) | Linearithmic | Merge Sort | 10K ops | 20M ops |
| O(N²) | Quadratic | Nested loops | 1M ops | 1 Trillion ops ❌ |
| O(2^N) | Exponential | Subsets | 10^300 ops ❌ | ∞ |
| O(N!) | Factorial | Permutations | 4×10^2567 ❌ | ∞ |

### How to Determine Big O

1. **Count the loops:**
   - Single loop → O(N)
   - Nested loop → O(N²)
   - Loop halving each iteration → O(log N)

2. **Identify the dominant term:**
   - O(N² + N + 100) → O(N²)

3. **Consider input structure:**
   - HashMap operations → O(1) average
   - Sorted array with binary search → O(log N)

### Interview Tips 💡

- **Always mention trade-offs:** "This is O(N) time but O(N) space"
- **Discuss best/average/worst case:** "Quick Sort is O(N log N) average but O(N²) worst"
- **Know your data structures:** Arrays, HashMaps, Trees, Heaps all have different Big O for operations
