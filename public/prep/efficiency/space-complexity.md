# Space Complexity 💾

## 1. The "Moving House" Analogy

Imagine you're moving to a new apartment. You have **two approaches**:

**The "Hoarder" Way (O(N) space):**
You photograph every single item (10,000 photos), print them all, label each one, and carry the catalog PLUS the items. Your moving truck needs to be twice as big. More stuff = bigger truck = higher cost.

**The "Minimalist" Way (O(1) space):**
You carry a clipboard with 3 columns: "Current Room", "Packed?", "Destination Room". Whether you have 50 items or 50,000, the clipboard stays the same size. You process one item at a time and reuse the same 3 columns.

**The "Smart Student" Way (O(log N) space):**
You divide your house into halves, process one half, then subdivide again. You only need to remember which subdivisions you're currently processing — about log₂(rooms) sticky notes on your clipboard.

**This is Space Complexity.** It measures how much **extra memory** your algorithm needs as the input grows. Less memory = lower cloud costs, fewer OOM crashes, and the ability to handle massive datasets.

---

## 2. The Core Concept

### Auxiliary Space vs Total Space

This distinction trips up experienced developers in interviews:

```typescript
/**
 * Auxiliary Space: EXTRA memory allocated by the algorithm
 *   (excludes the input itself)
 * 
 * Total Space: Input + Auxiliary
 * 
 * When we say "O(1) space", we mean AUXILIARY space.
 */

// O(1) auxiliary space — modifies input in-place
function reverseInPlace(arr: number[]): void {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++; right--;
  }
  // Extra memory: just 2 variables (left, right) → O(1)
}

// O(N) auxiliary space — creates a new array
function reverseCopy(arr: number[]): number[] {
  const result = new Array(arr.length);  // ← O(N) extra memory
  for (let i = 0; i < arr.length; i++) {
    result[i] = arr[arr.length - 1 - i];
  }
  return result;
}
```

### The Space Hierarchy

| Space | Name | What Uses It | Memory for 1M items |
|-------|------|-------------|---------------------|
| O(1) | Constant | Pointer swaps, counters | ~3 variables |
| O(log N) | Logarithmic | Recursion stack (balanced tree) | ~20 stack frames |
| O(N) | Linear | HashMap, copy of input | ~1M entries |
| O(N²) | Quadratic | 2D matrix, adjacency matrix | ~1T entries ❌ |

---

## 3. Interactive Visualization 🎮
Click "Next" to see Binary Search — O(1) auxiliary space, O(log N) recursion stack space!

```visualizer
{
  "type": "binary-search", 
  "data": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
  "target": 23
}
```

---

## 4. Scenario A: Recursion Stack Space — The Hidden Memory Cost

**Real-Life Scenario:** Your Node.js server crashes with "Maximum call stack size exceeded" on a large dataset. The code looks fine — no arrays, no objects allocated. But recursion itself uses memory.

**Technical Problem:** Understand and optimize the space consumed by recursive call stacks.

### TypeScript Implementation

```typescript
/**
 * THE HIDDEN COST OF RECURSION
 * 
 * Every function call pushes a stack frame onto the call stack.
 * Each frame stores: local variables, return address, parameters.
 * 
 * Stack frame ≈ 48-128 bytes in V8 (Node.js/Chrome)
 * Default stack size: ~15,000 frames (Node.js), ~10,000 (Chrome)
 */

// ═══════════════════════════════════════════════════════════════
// O(N) STACK SPACE — Crashes at ~15K depth!
// ═══════════════════════════════════════════════════════════════
function factorialRecursive(n: number): number {
  if (n <= 1) return 1;
  return n * factorialRecursive(n - 1); // N stack frames
}
// factorialRecursive(100000) → 💥 Stack Overflow!

// Call stack at factorial(5):
//   factorial(5) ← waiting for factorial(4)
//     factorial(4) ← waiting for factorial(3)
//       factorial(3) ← waiting for factorial(2)
//         factorial(2) ← waiting for factorial(1)
//           factorial(1) → returns 1
//         returns 2
//       returns 6
//     returns 24
//   returns 120
// Space: O(N) — N frames on the stack

// ═══════════════════════════════════════════════════════════════
// O(1) SPACE — Iterative conversion
// ═══════════════════════════════════════════════════════════════
function factorialIterative(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result; // O(1) space — just 2 variables
}
// factorialIterative(100000) → Works! (though the number overflows)

// ═══════════════════════════════════════════════════════════════
// TAIL CALL OPTIMIZATION (TCO) — O(N) → O(1) stack space
// ═══════════════════════════════════════════════════════════════
/**
 * Tail Call: The recursive call is the LAST operation.
 * If the engine supports TCO, it reuses the current stack frame.
 * 
 * ⚠️ Node.js/V8 does NOT support TCO (only Safari/JavaScriptCore does).
 * But it's important to know for interviews!
 */
function factorialTailCall(n: number, accumulator: number = 1): number {
  if (n <= 1) return accumulator;
  return factorialTailCall(n - 1, n * accumulator); // Tail position
}

// ═══════════════════════════════════════════════════════════════
// RECURSION SPACE ANALYSIS FOR TREES
// ═══════════════════════════════════════════════════════════════
/**
 * Tree recursion space = O(HEIGHT), not O(N)!
 * 
 * Balanced tree (height = log N):  O(log N) stack space
 * Skewed tree (height = N):        O(N) stack space
 * 
 * The stack only holds ONE path from root to current node.
 */
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
  // Space: O(H) where H = height of tree
  //   Balanced: O(log N)
  //   Skewed:   O(N)
}
```

### Recursion Space Summary

| Algorithm | Recursive Space | Can Convert to Iterative? |
|-----------|----------------|--------------------------|
| Factorial | O(N) | ✅ Yes — simple loop |
| Binary Search | O(log N) | ✅ Yes — while loop |
| Tree Traversal | O(H) | ✅ Yes — explicit stack |
| Merge Sort | O(log N) call stack + O(N) merge | ⚠️ Complex iteratively |
| DFS on graph | O(V) worst case | ✅ Yes — explicit stack |
| Quick Sort | O(log N) average | ⚠️ Tail-call optimize one branch |

---

## 5. Scenario B: In-Place vs Extra Space — The Trade-Off Decision

**Real-Life Scenario:** Your Lambda function has 256MB of memory. You're processing a 200MB CSV file. Creating a copy would OOM. You must process in-place or stream.

**Technical Problem:** Solve problems with O(1) extra space vs O(N) extra space, understanding the trade-offs.

### TypeScript Implementation

```typescript
// ═══════════════════════════════════════════════════════════════
//  TRADE-OFF 1: Finding Duplicates
// ═══════════════════════════════════════════════════════════════

/**
 * O(N) space — HashSet approach
 * + Preserves original array
 * + O(N) time
 * - Uses O(N) extra memory
 */
function hasDuplicateSet(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
  // Time: O(N) | Space: O(N)
}

/**
 * O(1) space — Sort-then-scan approach
 * + No extra memory
 * - Mutates the input array! ⚠️
 * - O(N log N) time instead of O(N)
 */
function hasDuplicateSort(nums: number[]): boolean {
  nums.sort((a, b) => a - b);  // In-place sort
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1]) return true;
  }
  return false;
  // Time: O(N log N) | Space: O(1)
}

/**
 * O(1) space — Cyclic sort (only for nums in range [1, N])
 * + No extra memory
 * + O(N) time
 * - Only works for specific input ranges
 * - Mutates the input
 */
function findDuplicateCyclic(nums: number[]): number {
  // Each number should be at index (number - 1)
  for (let i = 0; i < nums.length; i++) {
    while (nums[i] !== i + 1) {
      const target = nums[i] - 1;
      if (nums[target] === nums[i]) return nums[i]; // Duplicate!
      [nums[i], nums[target]] = [nums[target], nums[i]]; // Swap to correct position
    }
  }
  return -1;
  // Time: O(N) | Space: O(1) ✓
}

// ═══════════════════════════════════════════════════════════════
//  TRADE-OFF 2: Matrix Operations
// ═══════════════════════════════════════════════════════════════

/**
 * Rotate Matrix 90° — O(1) space (in-place)
 * 
 * Step 1: Transpose (swap rows and columns)
 * Step 2: Reverse each row
 * 
 * No new matrix needed!
 */
function rotateMatrix(matrix: number[][]): void {
  const n = matrix.length;
  
  // Step 1: Transpose
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  
  // Step 2: Reverse each row
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
  // Time: O(N²) | Space: O(1) ✓
}

// ═══════════════════════════════════════════════════════════════
//  TRADE-OFF 3: DP Space Optimization
// ═══════════════════════════════════════════════════════════════

/**
 * Fibonacci — Space optimization progression:
 * 
 * Naive recursive:   O(2^N) time, O(N) space (call stack)
 * Memoized:          O(N) time, O(N) space (memo array)
 * Bottom-up DP:      O(N) time, O(N) space (DP table)
 * Space-optimized:   O(N) time, O(1) space (two variables!)
 */
function fibSpaceOptimized(n: number): number {
  if (n <= 1) return n;
  
  let prev2 = 0; // fib(i-2)
  let prev1 = 1; // fib(i-1)
  
  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  
  return prev1;
  // Time: O(N) | Space: O(1) ✓
  // We only ever need the last TWO values!
}
```

### Space Trade-Off Decision Matrix

| Constraint | Approach | Time | Space |
|-----------|----------|------|-------|
| Memory is cheap, time matters | HashMap / memoization | Faster | O(N) |
| Memory is limited (embedded, Lambda) | In-place / streaming | Often slower | O(1) |
| Input must not be modified | Copy first or use HashSet | O(N) time | O(N) |
| Input can be modified | Sort in-place, modify array | O(N log N) | O(1) |
| DP with 2D table, ~only need prev row | Rolling array optimization | Same | O(N) → O(row) |
| DP with 1D table, ~only need prev 2 values | Two-variable optimization | Same | O(N) → O(1) |

---

## 6. Scenario C: Memory in JavaScript/TypeScript — What You Must Know

**Real-Life Scenario:** Your Express.js API leaks memory over time. After 24 hours, it's using 2GB and the pod gets OOM-killed by Kubernetes. You need to understand how JS allocates and frees memory.

**Technical Problem:** Understand JavaScript's memory model, closures, and garbage collection to write memory-efficient code.

### TypeScript Implementation

```typescript
// ═══════════════════════════════════════════════════════════════
//  1. CLOSURES CAPTURE REFERENCES — Memory Leak Risk
// ═══════════════════════════════════════════════════════════════

/**
 * This closure captures the ENTIRE `hugeData` array,
 * even though it only uses `hugeData.length`.
 */
function createProcessor(hugeData: number[]): () => number {
  // ❌ hugeData is captured by the closure — never garbage collected!
  return () => hugeData.length;
}

// ✅ FIX: Capture only what you need
function createProcessorFixed(hugeData: number[]): () => number {
  const length = hugeData.length; // Extract the value
  // hugeData can now be garbage collected
  return () => length;
}

// ═══════════════════════════════════════════════════════════════
//  2. EVENT LISTENERS — Common Memory Leak
// ═══════════════════════════════════════════════════════════════

/**
 * Adding listeners without removing them = memory leak.
 * Each listener holds a reference to its closure scope.
 */
// ❌ LEAK: Listeners accumulate
function badListener(): void {
  // Every call adds ANOTHER listener — they never get removed
  document.addEventListener('click', (e) => {
    console.log('clicked');
  });
}

// ✅ FIX: Use AbortController or named functions for removal
function goodListener(): AbortController {
  const controller = new AbortController();
  document.addEventListener('click', (e) => {
    console.log('clicked');
  }, { signal: controller.signal });
  
  return controller; // Call controller.abort() to clean up
}

// ═══════════════════════════════════════════════════════════════
//  3. STREAMS — O(1) Space for Large Data
// ═══════════════════════════════════════════════════════════════

/**
 * Processing a 10GB log file:
 * 
 * ❌ O(N) space: Read entire file into memory
 *    const data = fs.readFileSync('huge.log', 'utf-8');
 *    const lines = data.split('\n'); // 10GB in RAM!
 * 
 * ✅ O(1) space: Stream line by line
 */
async function processLargeFile(filePath: string): Promise<number> {
  // Node.js streaming — only 1 line in memory at a time
  const { createReadStream } = await import('fs');
  const { createInterface } = await import('readline');
  
  const rl = createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  for await (const line of rl) {
    // Process each line — O(1) memory
    lineCount++;
  }
  return lineCount;
  // Space: O(1) — only 1 line buffered at a time ✓
}

// ═══════════════════════════════════════════════════════════════
//  4. WEAKMAP/WEAKREF — Memory-Safe Caching
// ═══════════════════════════════════════════════════════════════

/**
 * Regular Map: holds STRONG references → prevents GC
 * WeakMap: holds WEAK references → allows GC when no other refs exist
 * 
 * Use WeakMap for caching metadata about objects.
 */
const regularCache = new Map<object, string>();  // Prevents GC ❌
const weakCache = new WeakMap<object, string>();  // Allows GC ✓

function cacheResult(obj: object, result: string): void {
  weakCache.set(obj, result);
  // When `obj` is no longer referenced elsewhere,
  // both `obj` and `result` become eligible for GC.
}
```

---

## 7. Real World Applications 🌍

### 1. 📱 Mobile App Development (2-8GB RAM)
Mobile devices have strict memory limits. Processing a user's 50K photo library with O(N) extra space = 50K × ~5MB = 250GB — impossible. Stream processing with O(1) auxiliary space makes it viable.

### 2. ☁️ Serverless Functions (128MB - 10GB)
AWS Lambda charges by memory allocation AND duration. An O(N) space algorithm processing 1GB of data requires a 2GB Lambda ($0.000033/GB-s). An O(1) streaming approach uses 128MB ($0.0000021/GB-s) — **16× cheaper**.

### 3. 🎮 Game Development (60fps Budget)
Game engines allocate memory per frame. Allocating O(N) objects per frame causes garbage collection pauses → stutter. O(1) "object pooling" pre-allocates objects and reuses them.

### 4. 🛢️ Database Join Strategies
```
Hash Join:   O(smaller table) space — fast, needs memory
Sort-Merge:  O(1) space — slower, but handles disk-bound data
Nested Loop: O(1) space — slowest, but minimal memory
```
The query optimizer chooses based on `work_mem` (PostgreSQL) or `sort_buffer_size` (MySQL).

### 5. 🧬 Bioinformatics (Genomic Data)
Human genome = 3 billion base pairs. Storing two sequences for comparison = O(N²) = 9 × 10^18 entries. Space-optimized alignment (Hirschberg's algorithm) reduces this to O(N) by only keeping two rows of the DP table.

---

## 8. Complexity Analysis 🧠

### Space Complexity of Common Algorithms

| Algorithm | Time | Auxiliary Space | Can Optimize? |
|-----------|------|----------------|---------------|
| Binary Search (iterative) | O(log N) | **O(1)** | Already optimal |
| Binary Search (recursive) | O(log N) | O(log N) | ✅ → Iterative |
| Merge Sort | O(N log N) | O(N) | ❌ Needs merge buffer |
| Quick Sort | O(N log N) | O(log N) | Already good |
| Heap Sort | O(N log N) | **O(1)** | Already optimal |
| BFS | O(V + E) | O(V) | ❌ Queue needed |
| DFS (recursive) | O(V + E) | O(V) | ✅ → Iterative stack |
| HashMap Two Sum | O(N) | O(N) | ❌ Needed for O(1) lookup |
| DP (2D table) | O(N × M) | O(N × M) | ✅ → Rolling array O(N) |
| DP (1D, prev only) | O(N) | O(N) | ✅ → Two variables O(1) |

### Memory Usage of JS/TS Data Structures

| Structure | Space Per Entry | Notes |
|-----------|----------------|-------|
| `number` | 8 bytes | 64-bit float (always) |
| `boolean` | 4-8 bytes | Not 1 bit — V8 uses tags |
| `string` | 2 bytes/char + overhead | UTF-16, ~40 byte header |
| `Array` (dense) | ~8 bytes/element | Backed by C++ array |
| `Array` (sparse) | ~100+ bytes/element | Becomes hash table! |
| `Map` | ~120 bytes/entry | Hash table + entry objects |
| `Set` | ~80 bytes/entry | Hash table |
| `Object` | ~80 bytes + properties | Hidden class overhead |
| `WeakMap` | ~80 bytes/entry | Allows GC of keys |
| `Buffer` | 1 byte/element | Raw binary, most efficient |

### Interview Tips 💡

1. **Always state auxiliary space, not total space.** "The auxiliary space is O(1) — I only use two pointers. The input itself is O(N) but I don't count that." This shows precision.
2. **Recursion uses O(depth) space.** Every recursive call pushes a stack frame. Tree DFS = O(height). If the tree is balanced, that's O(log N). If skewed, O(N). Always mention this.
3. **"Can I modify the input?"** This is a KEY interview question. If yes → sort in-place (O(1) space). If no → you need O(N) space for a copy. Ask the interviewer!
4. **DP space optimization is a must.** If your DP table only looks at the previous row, use a rolling array (O(M × N) → O(N)). If it only looks at prev and prev-prev, use two variables (O(N) → O(1)).
5. **Streaming > batch for large data.** "Instead of loading the entire file in memory, I'd process it as a stream — O(1) space." This is a senior/staff-level answer.
6. **Know the WeakMap trick.** "I'd use a WeakMap for caching — it allows garbage collection of keys, preventing memory leaks." This impresses interviewers.
7. **Memory leak patterns in JS.** Closures, detached DOM nodes, unremoved event listeners, global variables, and forgotten timers. Being able to identify these separates senior from staff engineers.
