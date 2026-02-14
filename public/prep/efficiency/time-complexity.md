# Time Complexity ⏱️

## 1. The "Highway Toll" Analogy

Imagine a highway with different toll systems:

**Manual Toll Booth (O(N)):**
Every car stops, the attendant counts coins, gives change. One car at a time. 100 cars = 100 waits. Rush hour? Traffic jams for miles.

**Electronic Toll (O(1)):**
Every car has an RFID tag. The sensor reads it at full speed — *zero* stopping. 100 cars or 10,000 cars, throughput is the same.

**Now imagine your boss says: "Make the highway handle 10× more cars."**
- Manual toll: You need 10× more booths, 10× more attendants, 10× the cost.
- Electronic toll: Same infrastructure. It already scales.

**This is why Time Complexity matters.** It's not about how fast your code runs TODAY — it's about what happens when your data grows 10×, 100×, 1000×. The algorithm that's "fast enough" at 1,000 users might **kill your servers** at 1,000,000.

---

## 2. The Core Concept

Time complexity measures the **number of operations** an algorithm performs as a function of input size N. We care about the growth rate, not exact counts.

### Why Experienced Devs Still Get This Wrong

```typescript
// ❌ "This is O(N), right?" — WRONG. It's O(N²).
function removeDuplicates(arr: string[]): string[] {
  const result: string[] = [];
  for (const item of arr) {                    // O(N)
    if (!result.includes(item)) {              //   × O(N) — includes() scans!
      result.push(item);
    }
  }
  return result;
}

// ✅ O(N) — Use a Set
function removeDuplicatesFixed(arr: string[]): string[] {
  return [...new Set(arr)];                    // Set.has() is O(1)
}
```

This is the mistake that separates a **mid-level** "it works" mindset from a **senior** "it scales" mindset.

---

## 3. Interactive Visualization 🎮
Click "Next" to see how **Binary Search** cuts the problem in half each step — O(log N) vs O(N).

```visualizer
{
  "type": "binary-search", 
  "data": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
  "target": 23
}
```

---

## 4. Scenario A: Hidden O(N) Operations in JavaScript/TypeScript

**Real-Life Scenario:** Your Node.js API response time jumps from 50ms to 5 seconds as the user base grows. The code looks clean — a single loop. But *inside* the loop, there's a hidden linear scan.

**Technical Problem:** Identify and fix hidden O(N) operations that silently turn O(N) code into O(N²).

### TypeScript Implementation

```typescript
// ═══════════════════════════════════════════════════════════════
//  HIDDEN O(N) OPERATIONS YOU MUST KNOW
// ═══════════════════════════════════════════════════════════════

/**
 * 1. Array.includes() / Array.indexOf() — O(N), NOT O(1)!
 * 
 * Think you're doing O(N)? You're doing O(N²).
 */
function badSearch(arr: number[], targets: number[]): number[] {
  const found: number[] = [];
  for (const t of targets) {            // O(M)
    if (arr.includes(t)) {              //   × O(N) ← linear scan!
      found.push(t);
    }
  }
  return found;  // Total: O(M × N) 💀
}

function goodSearch(arr: number[], targets: number[]): number[] {
  const set = new Set(arr);             // O(N) build once
  return targets.filter(t => set.has(t)); // O(M) × O(1) = O(M)
  // Total: O(N + M) ✓
}

/**
 * 2. String Concatenation in Loop — O(N²) in many engines
 * 
 * Strings are IMMUTABLE. Each += creates a new string + copies.
 */
function badConcat(words: string[]): string {
  let result = "";
  for (const word of words) {
    result += word + " ";  // O(result.length) per iteration!
  }
  return result;  // Total: O(1 + 2 + 3 + ... + N) = O(N²) 💀
}

function goodConcat(words: string[]): string {
  return words.join(" ");  // Single pass, O(N) total ✓
}

/**
 * 3. Array.shift() / Array.unshift() — O(N), NOT O(1)!
 * 
 * Removes/adds at the front → shifts ALL elements.
 */
function badQueue(items: number[]): void {
  const queue: number[] = [];
  for (const item of items) queue.push(item);     // O(1) each ✓
  while (queue.length > 0) {
    queue.shift();  // O(N)! Shifts everything left 💀
  }
  // Total: O(N²) for draining the queue
}

// Fix: Use a proper queue or read with index
function goodQueue(items: number[]): void {
  let front = 0;
  const queue = [...items];
  while (front < queue.length) {
    const item = queue[front]; // O(1)
    front++;
  }
  // Total: O(N) ✓
}

/**
 * 4. Object.keys() / Object.values() / Object.entries() — O(N)
 * 
 * Each call iterates ALL properties.
 */
function badObjectLoop(obj: Record<string, number>): number {
  let sum = 0;
  for (let i = 0; i < Object.keys(obj).length; i++) {  // O(N) per call!
    sum += Object.values(obj)[i];                       // O(N) again!
  }
  return sum;  // Total: O(N²) 💀
}

function goodObjectLoop(obj: Record<string, number>): number {
  let sum = 0;
  for (const val of Object.values(obj)) {  // O(N) once
    sum += val;
  }
  return sum;  // Total: O(N) ✓
}

/**
 * 5. Array.sort() — O(N log N), NOT free!
 * 
 * Sorting inside a loop multiplies complexity.
 */
function badSortInLoop(matrix: number[][]): number[][] {
  const result: number[][] = [];
  for (const row of matrix) {            // O(M rows)
    result.push([...row].sort((a, b) => a - b));  // O(N log N) per row!
  }
  return result;  // Total: O(M × N log N) — is this intentional?
}
```

---

## 5. Scenario B: Optimizing from O(N²) → O(N) — Real Refactoring

**Real-Life Scenario:** Your team's API endpoint takes 8 seconds for a customer with 50K transactions. The PM says "make it fast." You profile and find an O(N²) bottleneck.

**Technical Problem:** Find all pairs in an array that sum to a target — the classic O(N²) → O(N) optimization.

### TypeScript Implementation

```typescript
/**
 * BEFORE: Brute Force — O(N²) time, O(1) space
 * 
 * The "obvious" solution that every junior dev writes.
 * At N = 50,000: 2.5 BILLION comparisons.
 */
function twoSumBrute(nums: number[], target: number): [number, number] | null {
  for (let i = 0; i < nums.length; i++) {           // O(N)
    for (let j = i + 1; j < nums.length; j++) {      //  × O(N)
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return null;
  // Time: O(N²) | Space: O(1)
}

/**
 * AFTER: HashMap — O(N) time, O(N) space
 * 
 * Trade space for time. The "senior engineer" solution.
 * At N = 50,000: exactly 50,000 lookups.
 */
function twoSumOptimal(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // value → index
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  return null;
  // Time: O(N) | Space: O(N)
}

/**
 * COMPARISON at scale:
 * 
 * N = 1,000    → Brute: 500K ops,    Optimal: 1K ops     (500× faster)
 * N = 50,000   → Brute: 1.25B ops,   Optimal: 50K ops    (25,000× faster)  
 * N = 1,000,000 → Brute: 500B ops,   Optimal: 1M ops     (500,000× faster)
 * 
 * The HashMap approach scales. The brute force doesn't.
 */

// ═══════════════════════════════════════════════════════════════
//  MORE O(N²) → O(N) PATTERNS
// ═══════════════════════════════════════════════════════════════

/**
 * Pattern: "Check if B is a subset of A"
 * 
 * Bad:  O(A × B) — nested loop with includes()
 * Good: O(A + B) — build Set from A, then iterate B
 */
function isSubset(arrA: number[], arrB: number[]): boolean {
  const setA = new Set(arrA);
  return arrB.every(b => setA.has(b)); // O(A + B) ✓
}

/**
 * Pattern: "Find most frequent element"
 * 
 * Bad:  O(N²) — for each element, count occurrences
 * Good: O(N) — frequency counter with Map
 */
function mostFrequent(arr: string[]): string {
  const freq = new Map<string, number>();
  let maxCount = 0, result = arr[0];
  
  for (const item of arr) {
    const count = (freq.get(item) || 0) + 1;
    freq.set(item, count);
    if (count > maxCount) {
      maxCount = count;
      result = item;
    }
  }
  return result; // O(N) ✓
}
```

---

## 6. Real World Applications 🌍

### 1. 🚦 Database Query Plans — O(N) vs O(N²) Joins
```
Nested Loop Join: O(N × M) — scans both tables fully
Hash Join:        O(N + M) — builds hash table, probes once
```
When PostgreSQL shows `Hash Join` instead of `Nested Loop`, it's choosing O(N+M) over O(N×M). Use `EXPLAIN ANALYZE` to see this.

### 2. 🔍 Autocomplete & Typeahead — O(N × L) vs O(L)
Naive: scan 100K words checking each prefix → O(N × L).
Trie: traverse L characters → O(L), independent of dictionary size.
This is why Google suggestions feel instant even with billions of queries.

### 3. 📱 React Rendering — O(N) Reconciliation
React's diffing algorithm is O(N) — it compares nodes at the same level only. A naive tree diff would be O(N³). This design choice is why React can re-render thousands of components per frame.

### 4. 🏗️ API Rate Limiting — O(1) with Sliding Window
Redis-based rate limiters use O(1) operations (INCR + EXPIRE). An O(N) approach tracking every request timestamp would collapse under load.

### 5. 📊 Event Processing (Kafka, Kinesis)
Consumer processing must be O(1) or O(log N) per message. If processing is O(N) where N = total messages, you'll never catch up with the stream. This is called "consumer lag."

---

## 7. Complexity Analysis 🧠

### JavaScript/TypeScript Method Cheat Sheet

| Method | Time Complexity | Gotcha |
|--------|----------------|--------|
| `Array.push()` | O(1) amortized | Occasional resize |
| `Array.pop()` | O(1) | ✓ |
| `Array.shift()` | **O(N)** ⚠️ | Shifts all elements |
| `Array.unshift()` | **O(N)** ⚠️ | Shifts all elements |
| `Array.includes()` | **O(N)** ⚠️ | Linear scan |
| `Array.indexOf()` | **O(N)** ⚠️ | Linear scan |
| `Array.find()` | O(N) | Linear scan |
| `Array.filter()` | O(N) | Creates new array |
| `Array.map()` | O(N) | Creates new array |
| `Array.sort()` | **O(N log N)** | Not free! |
| `Array.splice()` | **O(N)** ⚠️ | Shifts elements |
| `Array.slice()` | O(N) | Copies section |
| `Array.concat()` | O(N) | Creates new array |
| `Set.has()` | O(1) | ✓ Use instead of includes |
| `Map.get()` | O(1) | ✓ Use for lookups |
| `Object.keys()` | O(N) | Collects all keys |
| `string += str` | **O(N)** ⚠️ | Creates new string each time |
| `JSON.parse/stringify` | O(N) | Deep clone is O(N) |

### Complexity Optimization Quick Reference

| From | To | Technique |
|------|----|-----------|
| O(N²) → O(N) | Two loops → one loop | HashMap/Set for O(1) lookup |
| O(N²) → O(N log N) | Scan all pairs → sort first | Sort + two pointers |
| O(N) → O(log N) | Linear scan → binary search | Requires sorted input |
| O(N) → O(1) | Scan → direct access | Precompute / math formula |
| O(2^N) → O(N×2^N) → O(N²) | Brute force → memoize → DP | Dynamic Programming |
| O(N log N) → O(N) | Compare-based sort → counting sort | Only for bounded integer ranges |

### Interview Tips 💡

1. **Profile before optimizing.** "I'd first use `console.time()` or a profiler to find the actual bottleneck." This shows you think like a production engineer, not a LeetCode grinder.
2. **Know your JS methods.** `Array.includes()` is O(N), not O(1). This is the #1 hidden complexity bug in JS codebases. Replace with `Set.has()`.
3. **"Can we sort first?"** Sorting is O(N log N) and enables O(log N) binary search, O(N) two-pointer, and O(N) merge. It's the Swiss Army knife optimization.
4. **Trade space for time.** The HashMap pattern (O(N) space for O(1) lookup) is the most common optimization in interviews. State the trade-off explicitly.
5. **Watch for loop-inside-loop on SAME data.** Two nested loops over N items = O(N²). But N outer × M inner (different data) = O(N×M). Don't confuse them.
6. **Explain WHY, not just WHAT.** Don't say "O(N log N)". Say "O(N log N) because we recurse log N levels deep and each level does O(N) work across all partitions." This is what senior interviews expect.
7. **Consider the constraints.** N ≤ 100? O(N³) is fine. N ≤ 10^5? Need O(N log N). N ≤ 10^7? Need O(N). The constraint tells you which complexity you need.
