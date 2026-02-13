# Dynamic Programming (DP) 🧩

## 1. The "Smart Student" Analogy

Imagine a math student taking an exam with 100 questions. Each question builds on the answer to a previous question.

**The "Brute Force" Way:**
Every time a question references "the answer to Q5", the student re-solves Q5 from scratch. Then Q5 references Q3, so they re-solve Q3. Then Q3 references Q1, re-solve Q1. For each of the 100 questions, they're re-solving dozens of sub-problems. Exam takes days.

**The "DP" Way:**
The smart student **writes down every answer** on a scratch sheet. When Q50 references Q5, they just look at their notes. No re-computation.

**This is Dynamic Programming.** Break a problem into overlapping sub-problems, solve each sub-problem ONCE, and store the result for future reference. It turns exponential brute force into polynomial time.

**The two key ingredients:**
1. **Optimal Substructure:** The optimal solution contains optimal solutions to sub-problems.
2. **Overlapping Sub-problems:** The same sub-problems are solved repeatedly.

---

## 2. The Core Concept

In coding interviews, DP appears in:
- **Optimization problems** ("minimum", "maximum", "longest", "shortest")
- **Counting problems** ("how many ways", "number of paths")
- **Decision problems** ("is it possible", "can you...")

### The Two Approaches

**Top-Down (Memoization):**
Write the recursive solution naturally, then cache results.
```
fib(n) = fib(n-1) + fib(n-2)     ← Natural recursion
       + memo[n] = result           ← Cache to avoid re-computation
```

**Bottom-Up (Tabulation):**
Build the answer iteratively from the smallest sub-problem up.
```
dp[0] = 0, dp[1] = 1
for i = 2 to n:
    dp[i] = dp[i-1] + dp[i-2]     ← Build from base cases up
```

### The DP Framework (Works for 90% of problems)

```
1. Define STATE:     What information do I need to solve a sub-problem?
2. Define TRANSITION: How do I combine smaller sub-problems?  
3. Define BASE CASE:  What's the smallest sub-problem I can solve directly?
4. Define ANSWER:     Which cell in my DP table is the final answer?
5. Optimize SPACE:    Do I need the whole table, or just the last row?
```

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────┐
│         DYNAMIC PROGRAMMING — fib(5) Call Tree           │
│                                                          │
│  WITHOUT MEMOIZATION (Exponential — O(2^N)):             │
│                                                          │
│                    fib(5)                                 │
│                   /      \                               │
│              fib(4)       fib(3)                          │
│             /    \        /    \                          │
│          fib(3) fib(2) fib(2) fib(1)                     │
│          /   \                                           │
│       fib(2) fib(1)    ← fib(2) computed 3 times!        │
│                                                          │
│  WITH MEMOIZATION (Linear — O(N)):                       │
│                                                          │
│       fib(5) → fib(4) → fib(3) → fib(2) → fib(1)       │
│         ↓         ↓         ↓         ↓         ↓        │
│        memo      memo     memo     memo     base         │
│                                                          │
│  Each sub-problem solved exactly ONCE.                   │
│                                                          │
│  BOTTOM-UP TABULATION:                                   │
│  ┌───┬───┬───┬───┬───┬───┐                               │
│  │ 0 │ 1 │ 1 │ 2 │ 3 │ 5 │   dp[i] = dp[i-1] + dp[i-2] │
│  └───┴───┴───┴───┴───┴───┘                               │
│   f0  f1  f2  f3  f4  f5                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Climbing Stairs (1D DP — Foundation)

**Real-Life Scenario:** You're climbing a staircase with N steps. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?

**Technical Problem:** Given `n`, return the number of distinct ways to climb to the top.

### TypeScript Implementation

```typescript
/**
 * climbStairs — Bottom-Up DP with space optimization.
 * 
 * State:     dp[i] = number of ways to reach step i
 * Transition: dp[i] = dp[i-1] + dp[i-2]
 *             (arrive from 1 step below OR 2 steps below)
 * Base:      dp[0] = 1 (one way to stand at ground)
 *            dp[1] = 1 (one way to reach step 1)
 * Answer:    dp[n]
 * 
 * @timeComplexity O(N) — Single pass
 * @spaceComplexity O(1) — Only need previous two values
 */
function climbStairs(n: number): number {
  if (n <= 1) return 1;

  let prev2 = 1; // dp[i-2]
  let prev1 = 1; // dp[i-1]

  for (let i = 2; i <= n; i++) {
    const current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }

  return prev1;
}

// Usage Example
console.log("Ways to climb 2 stairs:", climbStairs(2)); // 2
console.log("Ways to climb 3 stairs:", climbStairs(3)); // 3
console.log("Ways to climb 5 stairs:", climbStairs(5)); // 8

// Explanation for n=3:
// 1+1+1, 1+2, 2+1 → 3 ways
```

### Top-Down (Memoization) Version

```typescript
/**
 * climbStairsMemo — Top-Down with memoization.
 * 
 * Same logic but recursive. Useful as a template.
 * 
 * @timeComplexity O(N) — Each state computed once
 * @spaceComplexity O(N) — Memo array + recursion stack
 */
function climbStairsMemo(n: number): number {
  const memo = new Map<number, number>();

  function dp(i: number): number {
    if (i <= 1) return 1;          // Base case
    if (memo.has(i)) return memo.get(i)!;  // Cache hit

    const result = dp(i - 1) + dp(i - 2);  // Transition
    memo.set(i, result);           // Cache result
    return result;
  }

  return dp(n);
}
```

### Sample input and output
Input: `n = 5`
Output: `8` (1+1+1+1+1, 1+1+1+2, 1+1+2+1, 1+2+1+1, 2+1+1+1, 1+2+2, 2+1+2, 2+2+1)

---

## 5. Scenario B: Longest Common Subsequence (2D DP — Classic)

**Real-Life Scenario:** Git diff computes the "longest common subsequence" between two file versions to show what changed. This is also how DNA sequence alignment works in bioinformatics.

**Technical Problem:** Given two strings `text1` and `text2`, return the length of their longest common subsequence (LCS). A subsequence is a sequence that can be derived by deleting some characters without changing the order.

### TypeScript Implementation

```typescript
/**
 * longestCommonSubsequence — 2D Bottom-Up DP.
 * 
 * State:      dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]
 * Transition: If text1[i-1] === text2[j-1]:
 *                dp[i][j] = dp[i-1][j-1] + 1   (characters match, extend LCS)
 *             Else:
 *                dp[i][j] = max(dp[i-1][j], dp[i][j-1])  (skip one char)
 * Base:       dp[0][j] = 0, dp[i][0] = 0  (empty string has LCS 0)
 * Answer:     dp[m][n]
 * 
 * @param text1 - First string
 * @param text2 - Second string
 * @returns Length of longest common subsequence
 * 
 * @timeComplexity O(M × N) where M, N are string lengths
 * @spaceComplexity O(M × N) — Can be optimized to O(min(M, N))
 */
function longestCommonSubsequence(text1: string, text2: string): number {
  const m = text1.length;
  const n = text2.length;

  // Create 2D DP table: (m+1) × (n+1), initialized to 0
  const dp: number[][] = Array.from({ length: m + 1 }, () => 
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        // Characters match — extend the LCS
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        // Characters don't match — take the best of skipping either
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// Usage Example
console.log(longestCommonSubsequence("abcde", "ace"));   // 3 ("ace")
console.log(longestCommonSubsequence("abc", "abc"));     // 3 ("abc")
console.log(longestCommonSubsequence("abc", "def"));     // 0

// DP Table for "abcde" vs "ace":
//     ""  a  c  e
// ""   0  0  0  0
//  a   0  1  1  1
//  b   0  1  1  1
//  c   0  1  2  2
//  d   0  1  2  2
//  e   0  1  2  3  ← Answer
```

---

## 6. Scenario C: 0/1 Knapsack (Decision DP — Most Asked!)

**Real-Life Scenario:** You're packing for a camping trip. Your backpack holds 10 kg. Each item has a weight and a "usefulness" value. You want to maximize usefulness without exceeding 10 kg.

**Technical Problem:** Given `N` items with `weights[]` and `values[]`, and a knapsack capacity `W`, find the maximum value you can carry.

### TypeScript Implementation

```typescript
/**
 * knapsack01 — Classic 0/1 Knapsack with space optimization.
 * 
 * State:      dp[w] = max value achievable with capacity w
 * Transition: For each item i with weight wi, value vi:
 *             dp[w] = max(dp[w], dp[w - wi] + vi)
 * Base:       dp[0] = 0 (no capacity = no value)
 * Answer:     dp[W]
 * 
 * CRITICAL: Iterate capacity RIGHT-TO-LEFT to prevent using
 * the same item twice. (Left-to-right = unbounded knapsack.)
 * 
 * @timeComplexity O(N × W) — Pseudo-polynomial
 * @spaceComplexity O(W) — Single array
 */
function knapsack01(
  weights: number[], 
  values: number[], 
  capacity: number
): number {
  const n = weights.length;
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    // MUST iterate right-to-left to avoid reusing item i
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(
        dp[w],                          // Don't take item i
        dp[w - weights[i]] + values[i]  // Take item i
      );
    }
  }

  return dp[capacity];
}

// Usage Example
const weights = [2, 3, 4, 5];
const values  = [3, 4, 5, 6];
const capacity = 8;

console.log("Max value:", knapsack01(weights, values, capacity)); // 10
// Take items with weights [3, 5] → values [4, 6] = 10
// Or items with weights [2, 3] → values [3, 4] = 7 — not as good
```

---

## 7. Real World Applications 🌍

### 1. 🔍 Git Diff / File Comparison
`git diff` uses Longest Common Subsequence (LCS) to find what changed between two file versions. The unchanged lines are the LCS; everything else is an insertion or deletion.

### 2. 🧬 DNA Sequence Alignment (Bioinformatics)
Comparing two DNA sequences to find similarities uses a variant of LCS called the Needleman-Wunsch algorithm — the same 2D DP table.

### 3. 📦 Resource Allocation (Knapsack)
Cloud providers allocate VMs to servers (bin packing), ad platforms select ads to display (budget constraints), and investment portfolios optimize returns under risk limits.

### 4. 🗺️ Shortest Paths (Floyd-Warshall)
All-pairs shortest path is a 3D DP problem: `dp[k][i][j] = shortest path from i to j using nodes 1..k`. Used in network routing.

### 5. 📝 Autocomplete / Spell Check
Edit Distance (Levenshtein) uses DP to find the minimum insertions, deletions, and substitutions to transform one word into another. Powers spell checkers and fuzzy search.

### 6. 💰 Stock Trading Problems
"Best Time to Buy and Sell Stock" variants are classic DP problems involving state machines (hold/not-hold/cooldown).

---

## 8. Complexity Analysis 🧠

### DP Problem Categories

| Category | Example | State | Time |
|----------|---------|-------|------|
| **1D Linear** | Climbing Stairs, House Robber | `dp[i]` | O(N) |
| **1D with decisions** | Coin Change, Word Break | `dp[i]` | O(N × K) |
| **2D Grid** | Unique Paths, Min Path Sum | `dp[i][j]` | O(M × N) |
| **2D String** | LCS, Edit Distance | `dp[i][j]` | O(M × N) |
| **Knapsack** | 0/1 Knapsack, Subset Sum | `dp[w]` or `dp[i][w]` | O(N × W) |
| **Interval** | Matrix Chain, Burst Balloons | `dp[i][j]` | O(N³) |
| **Bitmask** | TSP, Assign Tasks | `dp[mask]` | O(2^N × N) |
| **State Machine** | Stock Trading, Regex | `dp[i][state]` | O(N × S) |

### Top-Down vs Bottom-Up

| Aspect | Top-Down (Memo) | Bottom-Up (Tab) |
|--------|:-:|:-:|
| Implementation | Recursive + cache | Iterative loops |
| Computes all states? | ❌ Only needed | ✅ All states |
| Stack overflow risk? | ✅ Deep recursion | ❌ No recursion |
| Space optimization? | Hard | ✅ Easy (rolling array) |
| Debugging? | Harder (call stack) | Easier (table values) |
| When to use? | Sparse state space | Dense state space |

### Space Optimization Patterns

```typescript
// PATTERN: If dp[i] only depends on dp[i-1], use two variables
// Before: O(N) space
const dp = new Array(n);
dp[0] = 1; dp[1] = 1;
for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];

// After: O(1) space
let prev2 = 1, prev1 = 1;
for (let i = 2; i <= n; i++) {
  const curr = prev1 + prev2;
  prev2 = prev1;
  prev1 = curr;
}

// PATTERN: If dp[i][j] only depends on dp[i-1][*], use one row
// Before: O(M×N) space
const dp = Array.from({length: m}, () => new Array(n));

// After: O(N) space (reuse single row)
const row = new Array(n).fill(0);
```

### Interview Tips 💡

1. **Recognition:** If a problem asks for "minimum/maximum/count/is-possible" AND has overlapping sub-problems → likely DP. If it asks for "all combinations/permutations" → more likely backtracking.
2. **Start with recursion:** Write the brute-force recursive solution FIRST. Then add memoization. Then optionally convert to bottom-up. Don't jump to bottom-up directly.
3. **Define the state clearly:** Before coding, tell the interviewer: "Let dp[i] represent ___". This is the most important step. Get this wrong and everything falls apart.
4. **0/1 Knapsack trick:** Iterate capacity RIGHT-TO-LEFT to prevent reusing items. LEFT-TO-RIGHT gives you UNBOUNDED knapsack (each item can be used multiple times).
5. **Space optimization:** If your DP only looks at the previous row/column, you can reduce from O(N²) → O(N). Always mention this optimization even if you don't implement it.
6. **Common transitions:** `dp[i] = dp[i-1] + dp[i-2]` (Fibonacci-like), `dp[i] = max(dp[j] + cost)` (LIS-like), `dp[i][j] = dp[i-1][j-1] + 1` (2D diagonal).
7. **Pseudo-polynomial:** Knapsack is O(N × W). If W is huge (e.g., 10^9), this is NOT efficient. Know when DP doesn't apply and you need greedy or other approaches.
8. **Must-know problems:** Climbing Stairs → Coin Change → House Robber → LCS → Edit Distance → 0/1 Knapsack → Longest Increasing Subsequence → Word Break. Master these in this order.
