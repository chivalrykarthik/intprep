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

Big O is the **universal language** of algorithm efficiency. Every technical interview starts with: "What's the time and space complexity?"

### Three Rules of Big O

**Rule 1: Drop Constants**
```
O(2N) → O(N)     — Constants don't matter at scale
O(100) → O(1)    — 100 operations is still "constant"
O(N/2) → O(N)    — Half of N still grows linearly
```

**Rule 2: Drop Non-Dominant Terms**
```
O(N² + N) → O(N²)           — N² overwhelms N as N grows
O(N + log N) → O(N)          — N overwhelms log N
O(N³ + N² + N + 1000) → O(N³)  — Only the biggest term matters
```

**Rule 3: Different Inputs = Different Variables**
```typescript
// This is O(A + B), NOT O(N²)
function twoArrays(arrA: string[], arrB: string[]): void {
  for (const a of arrA) console.log(a);  // O(A)
  for (const b of arrB) console.log(b);  // O(B)
}

// THIS is O(A × B) — nested loops over DIFFERENT inputs
function crossProduct(arrA: string[], arrB: string[]): void {
  for (const a of arrA) {      // O(A)
    for (const b of arrB) {    //   × O(B)
      console.log(a, b);
    }
  }
}
```

### The Big O Hierarchy (Fast → Slow)

```
O(1) < O(log N) < O(N) < O(N log N) < O(N²) < O(2^N) < O(N!)
 ↑        ↑         ↑         ↑           ↑        ↑        ↑
Hash    Binary    Single   Merge Sort  Nested    Subsets  Permu-
lookup  Search    loop                 loops              tations
```

### Best / Average / Worst Case

| Algorithm | Best | Average | Worst | Which to State? |
|-----------|------|---------|-------|----------------|
| Quick Sort | O(N log N) | O(N log N) | O(N²) | Always state **worst** unless asked |
| HashMap lookup | O(1) | O(1) | O(N) | State average + mention worst |
| Binary Search | O(1) | O(log N) | O(log N) | State worst |
| Insertion Sort | O(N) | O(N²) | O(N²) | Mention best case (nearly sorted) |

> **Interview tip:** "The time complexity is O(N log N) in the average and worst case" is more impressive than just "O(N log N)."

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

## 4. Scenario A: Analyzing Real Code for Big O

**Real-Life Scenario:** Your interviewer writes code on the whiteboard and asks: "What's the complexity?" You need to analyze it instantly.

**Technical Problem:** Determine the Big O of various code patterns.

### TypeScript Implementation

```typescript
// ═══════════════════════════════════════════════════════════
// PATTERN 1: Sequential Loops → O(N) + O(N) = O(N)
// ═══════════════════════════════════════════════════════════
function sequential(arr: number[]): number {
  let sum = 0;
  for (const num of arr) sum += num;     // O(N)
  for (const num of arr) sum += num * 2; // O(N)
  return sum;
  // Total: O(N) + O(N) = O(2N) → O(N) ✓
}

// ═══════════════════════════════════════════════════════════
// PATTERN 2: Nested Loops (same array) → O(N²)
// ═══════════════════════════════════════════════════════════
function nested(arr: number[]): number[][] {
  const pairs: number[][] = [];
  for (let i = 0; i < arr.length; i++) {        // O(N)
    for (let j = i + 1; j < arr.length; j++) {   //  × O(N)
      pairs.push([arr[i], arr[j]]);
    }
  }
  return pairs;
  // Total: O(N²) — even though j starts at i+1 (it's N*(N-1)/2)
}

// ═══════════════════════════════════════════════════════════
// PATTERN 3: Loop with halving → O(log N)
// ═══════════════════════════════════════════════════════════
function halving(n: number): number {
  let count = 0;
  let i = n;
  while (i > 1) {
    i = Math.floor(i / 2);
    count++;
  }
  return count;
  // Total: O(log N) — how many times can you halve N?
}

// ═══════════════════════════════════════════════════════════
// PATTERN 4: Loop inside loop, but inner depends on outer → O(N log N)
// ═══════════════════════════════════════════════════════════
function nLogN(n: number): number {
  let count = 0;
  for (let i = 0; i < n; i++) {          // O(N) outer
    for (let j = 1; j < n; j *= 2) {     // O(log N) inner (doubling)
      count++;
    }
  }
  return count;
  // Total: O(N) × O(log N) = O(N log N) ✓
}

// ═══════════════════════════════════════════════════════════
// PATTERN 5: Recursion with branching → O(2^N)
// ═══════════════════════════════════════════════════════════
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
  // Two recursive calls per level → O(2^N)
  // With memoization: O(N) time, O(N) space ✓
}

// ═══════════════════════════════════════════════════════════
// PATTERN 6: String/Array building in loop → Hidden O(N²)!
// ═══════════════════════════════════════════════════════════
function buildString(n: number): string {
  let result = "";
  for (let i = 0; i < n; i++) {
    result += "x";  // ← Each += creates a NEW string! O(N) per concat
  }
  return result;
  // Total: O(N²) in many implementations!
  // Fix: use Array.join() → result = Array(n).fill("x").join("");
}
```

---

## 5. Scenario B: Amortized Analysis — The "Piggy Bank" Concept

**Real-Life Scenario:** You put $1 in a piggy bank every day. Every 365 days, you "pay" $365 for a vacation. Single-day cost is sometimes $1, sometimes $366. But *averaged over time*, it's always ~$2/day.

**Technical Problem:** How do dynamic arrays (like JavaScript's `Array.push()`) achieve O(1) amortized time despite occasional O(N) resizing?

### TypeScript Implementation

```typescript
/**
 * Amortized Analysis — Dynamic Array Resize.
 * 
 * Key insight: resizing happens RARELY.
 * - push() is O(1) most of the time
 * - When capacity is full, we double and copy: O(N)
 * - But doubling happens at sizes 1, 2, 4, 8, 16, ... N
 * - Total copy cost: 1 + 2 + 4 + 8 + ... + N = 2N - 1 ≈ O(N)
 * - Spread across N pushes: O(N) / N = O(1) amortized ✓
 */
class DynamicArray<T> {
  private data: (T | undefined)[];
  private count: number = 0;
  private capacity: number;
  private resizeCount: number = 0;

  constructor(initialCapacity: number = 4) {
    this.capacity = initialCapacity;
    this.data = new Array(initialCapacity);
  }

  /**
   * Push — O(1) amortized.
   * Worst case is O(N) when resize triggers, but that's rare.
   */
  push(val: T): void {
    if (this.count === this.capacity) {
      this.resize(); // O(N) — but happens only log₂(N) times total
    }
    this.data[this.count] = val;
    this.count++;
  }

  private resize(): void {
    this.resizeCount++;
    const newCapacity = this.capacity * 2; // Double capacity
    const newData = new Array(newCapacity);
    for (let i = 0; i < this.count; i++) {
      newData[i] = this.data[i]; // Copy all existing elements
    }
    this.data = newData;
    this.capacity = newCapacity;
    console.log(`  Resize #${this.resizeCount}: ${this.capacity / 2} → ${this.capacity}`);
  }

  get size(): number { return this.count; }
}

// Demo: Push 1000 elements, count resizes
const arr = new DynamicArray<number>(1);
for (let i = 0; i < 1000; i++) {
  arr.push(i);
}
// Output: Only ~10 resizes (at 1, 2, 4, 8, 16, 32, 64, 128, 256, 512)
// 1000 pushes, ~10 resizes → 99% of pushes are O(1)
```

### Amortized Analysis Summary

| Operation | Worst Case | Amortized | Example |
|-----------|-----------|-----------|---------|
| `Array.push()` | O(N) | **O(1)** | Dynamic array resize |
| Hash table insert | O(N) | **O(1)** | HashMap rehashing |
| Splay tree access | O(N) | **O(log N)** | Self-balancing tree |
| Union-Find (with path compression) | O(log N) | **O(α(N)) ≈ O(1)** | Disjoint set |

---

## 6. Real World Applications 🌍

### 1. 🔍 Google Search (O(log N) Index Lookups)
Google doesn't scan billions of pages for every search. They use inverted indexes with O(log N) lookups to return results in milliseconds. The difference between O(N) and O(log N) at Google's scale: O(N) = scanning 50 billion pages (~hours). O(log N) = ~36 steps (~microseconds).

### 2. 📱 Social Media Feeds (O(N log N) Ranking)
Your feed is ranked by relevance/time. Platforms use O(N log N) sorting algorithms to rank thousands of posts instantly. An O(N²) algorithm on 50K posts would take 2.5 billion operations — unacceptable for a page load.

### 3. 🎮 Pathfinding in Games (O(V²) vs O((V+E) log V))
Naive Dijkstra is O(V²). With a binary heap, it's O((V+E) log V). In a game map with 10,000 nodes, that's the difference between 100 million operations and ~130,000.

### 4. 🧬 DNA Sequencing (O(N!) → O(N²) → O(N log N))
Brute-force genome alignment would take O(N!) time — longer than the universe's age. Dynamic programming reduces it to O(N²), and optimized algorithms (BLAST) to near O(N log N).

### 5. 📦 Amazon Order Processing (Amortized O(1))
Amazon's cart uses hash tables for O(1) amortized lookups. During peak load (Prime Day: 300M items/day), the difference between O(1) and O(log N) per lookup saves millions of server-seconds.

---

## 7. Complexity Analysis 🧠

### The Big O Cheat Sheet

| Complexity | Name | Example | 1,000 items | 1M items | Viable? |
|------------|------|---------|-------------|----------|---------|
| O(1) | Constant | HashMap lookup | 1 op | 1 op | ✅ Always |
| O(log N) | Logarithmic | Binary Search | 10 ops | 20 ops | ✅ Always |
| O(N) | Linear | Single loop | 1K ops | 1M ops | ✅ Fine |
| O(N log N) | Linearithmic | Merge Sort | 10K ops | 20M ops | ✅ Fine |
| O(N²) | Quadratic | Nested loops | 1M ops | 1T ops | ⚠️ N < 10K |
| O(N³) | Cubic | 3 nested loops | 1B ops | ∞ | ⚠️ N < 500 |
| O(2^N) | Exponential | All subsets | 10^300 ops | ∞ | ❌ N < 25 |
| O(N!) | Factorial | All permutations | 4×10^2567 | ∞ | ❌ N < 12 |

### How to Determine Big O — Decision Tree

```
START: Look at the code
│
├─ No loops/recursion? → O(1)
│
├─ Single loop (0..N)? → O(N)
│   └─ Loop variable halves/doubles? → O(log N)
│
├─ Two nested loops (same input)?
│   ├─ Both 0..N? → O(N²)
│   └─ Inner halves? → O(N log N)
│
├─ Recursion?
│   ├─ One recursive call, halves input? → O(log N)
│   ├─ One recursive call, N-1? → O(N)
│   ├─ Two recursive calls, N-1? → O(2^N)
│   └─ Two recursive calls, N/2? → O(N log N) [Merge Sort]
│
└─ Different inputs A, B?
    ├─ Sequential? → O(A + B)
    └─ Nested? → O(A × B)
```

### Master Theorem — Recurrence Cheat Sheet

For recurrences of the form `T(N) = a × T(N/b) + O(N^d)`:

| Recurrence | a | b | d | Result | Algorithm |
|-----------|---|---|---|--------|-----------|
| T(N) = T(N/2) + O(1) | 1 | 2 | 0 | **O(log N)** | Binary Search |
| T(N) = 2T(N/2) + O(N) | 2 | 2 | 1 | **O(N log N)** | Merge Sort |
| T(N) = 2T(N/2) + O(1) | 2 | 2 | 0 | **O(N)** | Tree Traversal |
| T(N) = T(N/2) + O(N) | 1 | 2 | 1 | **O(N)** | Quickselect (avg) |
| T(N) = 2T(N/2) + O(N²) | 2 | 2 | 2 | **O(N²)** | Naive matrix multiply |
| T(N) = 3T(N/2) + O(N) | 3 | 2 | 1 | **O(N^1.58)** | Karatsuba multiplication |

### Interview Tips 💡

1. **State complexity proactively.** Don't wait to be asked. After writing code, say: "This is O(N) time and O(1) space." It shows confidence and rigor.
2. **Always mention trade-offs.** "I can do O(N) time with O(N) space using a HashMap, or O(N log N) time with O(1) space by sorting." Interviewers LOVE this.
3. **Watch for hidden costs.** `string += char` in a loop is O(N²), not O(N). `Array.includes()` is O(N). `Array.sort()` is O(N log N). Know your library methods.
4. **Different inputs → different variables.** Two arrays of sizes A and B? It's O(A × B), NOT O(N²). This mistake costs points.
5. **Know amortized analysis.** "Push is O(1) amortized because resizing doubles capacity, spreading the O(N) cost." This separates senior from junior candidates.
6. **Best/Average/Worst matters.** "QuickSort is O(N log N) average but O(N²) worst case with bad pivot. Randomized pivot gives O(N log N) expected."
7. **Use the Master Theorem.** When asked about recursive complexity: identify a, b, d, and derive the answer in seconds.
