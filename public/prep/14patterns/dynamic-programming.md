# Dynamic Programming 🧩

## 1. The "Climbing Stairs with a Notebook" Analogy

You're climbing a long staircase with **100 steps**. At each step, you can take either **1 or 2 steps**. Your friend asks: *"How many different ways can you reach the top?"*

**The Naive Way (No Notebook):**
You start calculating from the top. "To reach step 100, I either came from step 99 or step 98. So I need to calculate both of those." But step 99 *also* depends on step 98 and step 97. And step 98 depends on step 97 and step 96. You're calculating **step 97 over and over again** — millions of times. Your brain melts.

**The DP Way (With a Notebook):**
You pull out a notebook. You start from the bottom:
- Step 1: **1 way** (just take 1 step). Write it down.
- Step 2: **2 ways** (1+1 or 2). Write it down.
- Step 3: `ways(2) + ways(1)` = **3 ways**. You just *look up* steps 1 and 2 from your notebook. No re-calculation.
- Step 4: `ways(3) + ways(2)` = **5 ways**. Look it up. Instant.
- ...continue to Step 100.

You solved a problem that would take **billions of recursive calls** in just **100 simple additions** because you **never solved the same sub-problem twice**.

**This is Dynamic Programming.** Break a complex problem into overlapping sub-problems, solve each sub-problem only once, store the result (in a "notebook"), and look it up when you need it again.

---

## 2. The Core Concept

In coding interviews, DP is used for **optimization problems** (min/max), **counting problems** (how many ways?), and **decision problems** (is it possible?).

### Two Key Properties
1. **Optimal Substructure:** The optimal solution to the big problem uses optimal solutions of smaller sub-problems.
2. **Overlapping Sub-problems:** The same smaller problem appears multiple times during computation.

### Two Approaches

**Top-Down (Memoization) — "Ask, then Remember":**
- Start from the *answer* you want, recurse down to base cases.
- Cache (memoize) every result in a Map or Array.
- Natural to write (follows the recursive formula directly).

**Bottom-Up (Tabulation) — "Build from the Ground Up":**
- Start from the base cases, iteratively build up to the answer.
- Fill a DP table row by row.
- Often more space-efficient (can optimize to use only previous row/values).

### When to Use DP
- "What is the **minimum** cost to...?"
- "How many **ways** to...?"
- "What is the **longest/shortest** sequence that...?"
- You can define a **recurrence relation** like `dp[i] = f(dp[i-1], dp[i-2], ...)`.

---

## 3. Interactive Visualization 🎮
Click "Next" to see how the recursion tree has overlapping sub-problems!

```visualizer
{
  "type": "tree-dfs",
  "data": {
    "val": 5,
    "left": {
      "val": 4,
      "left": { "val": 3, "left": { "val": 2 }, "right": { "val": 1 } },
      "right": { "val": 2 }
    },
    "right": {
      "val": 3,
      "left": { "val": 2 },
      "right": { "val": 1 }
    }
  }
}
```

---

## 4. Scenario A: Climbing Stairs (The Classic Gateway)
**Real-Life Scenario:** You're designing an onboarding flow with N steps. Users can skip 1 step or 2 steps at a time. Product wants to know how many distinct user paths exist through the onboarding funnel.

**Technical Problem:** You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

### TypeScript Implementation

```typescript
/**
 * Calculates number of distinct ways to climb n stairs.
 * 
 * Approach 1: Top-Down with Memoization
 * 
 * @param n - Number of stairs
 * @returns Number of distinct ways
 * 
 * @timeComplexity O(N) - Each sub-problem solved once, cached.
 * @spaceComplexity O(N) - Memo map + recursion stack.
 */
function climbStairsMemo(n: number, memo: Map<number, number> = new Map()): number {
    // Base cases
    if (n <= 1) return 1;

    // Check notebook (memo)
    if (memo.has(n)) {
        console.log(`  Memo hit for n=${n}: ${memo.get(n)}`);
        return memo.get(n)!;
    }

    // Recurrence: ways(n) = ways(n-1) + ways(n-2)
    const result = climbStairsMemo(n - 1, memo) + climbStairsMemo(n - 2, memo);

    // Write to notebook
    memo.set(n, result);
    console.log(`  Computed n=${n}: ${result}`);
    return result;
}

/**
 * Approach 2: Bottom-Up with Tabulation (Space-Optimized)
 * 
 * Instead of an entire array, we only need the last two values.
 * 
 * @param n - Number of stairs
 * @returns Number of distinct ways
 * 
 * @timeComplexity O(N) - Single loop.
 * @spaceComplexity O(1) - Only two variables.
 */
function climbStairsTab(n: number): number {
    console.log(`\n--- climbStairsTab ---`);
    console.log(`Input: n = ${n}`);
    if (n <= 1) return 1;

    let prev2 = 1; // ways(0)
    let prev1 = 1; // ways(1)

    for (let i = 2; i <= n; i++) {
        const curr = prev1 + prev2;
        console.log(`  i=${i}: prev2=${prev2} + prev1=${prev1} = ${curr}`);
        prev2 = prev1;
        prev1 = curr;
    }

    console.log(`  Result: ${prev1}`);
    return prev1;
}

// Example Usage:
console.log("Top-Down (n=10):", climbStairsMemo(10));  // 89
console.log("Bottom-Up (n=10):", climbStairsTab(10));  // 89
console.log("Bottom-Up (n=40):", climbStairsTab(40));  // 165580141
```

### Sample input and output
- **Input**: `n = 5`
- **Output**: `8` (The 8 ways: 11111, 1112, 1121, 1211, 2111, 122, 212, 221)

---

## 5. Scenario B: Coin Change (Optimization DP)
**Real-Life Scenario:** You're building a vending machine. A customer inserts $11 and wants exact change. Your machine has coins of denominations [1, 5, 6, 9]. You need to return the **fewest coins possible** — not the greedy answer (which would be 9+1+1 = 3 coins) but the optimal (5+6 = **2 coins**).

**Technical Problem:** Given an array of coin denominations `coins` and an integer `amount`, return the fewest number of coins that make up that amount. If it's not possible, return -1.

### TypeScript Implementation

```typescript
/**
 * Finds the minimum number of coins to make the given amount.
 * 
 * Recurrence: dp[amount] = min(dp[amount - coin] + 1) for each coin
 * 
 * @param coins - Available coin denominations.
 * @param amount - Target amount.
 * @returns Minimum number of coins, or -1 if impossible.
 * 
 * @timeComplexity O(amount * coins.length) - For each amount 1..N, we try each coin.
 * @spaceComplexity O(amount) - DP array of size amount+1.
 */
function coinChange(coins: number[], amount: number): number {
    console.log(`\n--- coinChange ---`);
    console.log(`Input: coins = [${coins}], amount = ${amount}`);
    const dp = new Array(amount + 1).fill(Infinity);

    // Base case: 0 coins needed for amount 0
    dp[0] = 0;

    // Build up from 1 to amount
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i && dp[i - coin] !== Infinity) {
                const prev = dp[i];
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                if (dp[i] !== prev) {
                    console.log(`  dp[${i}] = ${dp[i]} (using coin ${coin}, dp[${i-coin}]+1=${dp[i-coin]+1})`);
                }
            }
        }
    }

    const result = dp[amount] === Infinity ? -1 : dp[amount];
    console.log(`  Result: ${result}`);
    return result;
}

// Example Usage:
const coins = [1, 5, 6, 9];
const amount = 11;
console.log("Coins:", coins);
console.log("Amount:", amount);
console.log("Min coins needed:", coinChange(coins, amount)); // 2 (5+6)

// Edge case: impossible
console.log("Coins [2], Amount 3:", coinChange([2], 3)); // -1
```

### Sample input and output
- **Input**: `coins = [1, 5, 6, 9]`, `amount = 11`
- **Output**: `2` (5 + 6 = 11)
- **Input**: `coins = [2]`, `amount = 3`
- **Output**: `-1` (impossible)

---

## 6. Scenario C: Longest Common Subsequence (String DP — 2D Table)
**Real-Life Scenario:** You're building a **diff tool** (like Git). You need to find the longest common subsequence between two versions of a file to determine what stayed the same and what changed.

**Technical Problem:** Given two strings `text1` and `text2`, return the length of their longest common subsequence (LCS). A subsequence is a sequence that appears in the same relative order, but not necessarily contiguous.

### TypeScript Implementation

```typescript
/**
 * Finds the length of the Longest Common Subsequence.
 * 
 * dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]
 * 
 * @param text1 - First string.
 * @param text2 - Second string.
 * @returns Length of the LCS.
 * 
 * @timeComplexity O(M * N) - M = text1.length, N = text2.length.
 * @spaceComplexity O(M * N) - 2D DP table. Can be optimized to O(min(M, N)) with rolling array.
 */
function longestCommonSubsequence(text1: string, text2: string): number {
    console.log(`\n--- longestCommonSubsequence ---`);
    console.log(`Input: text1 = "${text1}", text2 = "${text2}"`);
    const m = text1.length;
    const n = text2.length;

    // Create (m+1) x (n+1) table, filled with 0
    const dp: number[][] = Array.from({ length: m + 1 }, () =>
        new Array(n + 1).fill(0)
    );

    // Fill table bottom-up
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                // Characters match → extend the LCS by 1
                dp[i][j] = dp[i - 1][j - 1] + 1;
                console.log(`  dp[${i}][${j}]: '${text1[i-1]}' == '${text2[j-1]}' → ${dp[i][j]} (match!)`);
            } else {
                // Characters don't match → take best of skipping either character
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    console.log(`  Result: ${dp[m][n]}`);
    return dp[m][n];
}

// Example Usage:
console.log("LCS of 'abcde' and 'ace':", longestCommonSubsequence("abcde", "ace")); // 3 ("ace")
console.log("LCS of 'abc' and 'def':", longestCommonSubsequence("abc", "def"));     // 0
```

### Sample input and output
- **Input**: `text1 = "abcde"`, `text2 = "ace"`
- **Output**: `3` (The LCS is `"ace"`)

---

## 7. Real World Applications 🌍

### 1. 🧬 DNA Sequence Alignment
Bioinformatics uses DP (specifically the Needleman-Wunsch algorithm) to align DNA/protein sequences. It finds the optimal alignment between two sequences by maximizing matches and minimizing gaps — essentially a 2D DP table problem, very similar to LCS.

### 2. 📈 Stock Trading (Best Time to Buy/Sell)
The classic "buy low, sell high" problem with constraints (cooldown periods, transaction limits) maps directly to **state machine DP**. At each day, you track states like "holding stock", "just sold", "cooldown" — and transition between them optimally.

### 3. 🎒 Resource Allocation (0/1 Knapsack)
Cloud computing, logistics, and portfolio optimization all face the same problem: given limited capacity (weight/budget), select items (servers/shipments/stocks) to maximize value. The 0/1 Knapsack is one of the most important DP problems in industry.

### 4. 📝 Text Editing (Edit Distance / Levenshtein)
Spell-checkers, autocorrect, and plagiarism detectors use **Edit Distance** — the minimum number of insertions, deletions, or substitutions to transform one string into another. It's computed with 2D DP, exactly like LCS.

---

## 8. Complexity Analysis 🧠

### Common DP Problems — Complexity Cheat Sheet

| Problem | Time | Space | Space (Optimized) |
|---------|------|-------|-------------------|
| **Climbing Stairs / Fibonacci** | O(N) | O(N) | O(1) — rolling variables |
| **Coin Change** | O(N × M) | O(N) | O(N) |
| **Longest Common Subsequence** | O(M × N) | O(M × N) | O(min(M, N)) — rolling row |
| **0/1 Knapsack** | O(N × W) | O(N × W) | O(W) — rolling row |
| **Edit Distance** | O(M × N) | O(M × N) | O(min(M, N)) |
| **Longest Increasing Subsequence** | O(N²) | O(N) | O(N log N) w/ binary search |

### The Four Common DP Patterns

1. **Linear DP:** `dp[i]` depends on previous elements (Climbing Stairs, House Robber, LIS).
2. **Grid/2D DP:** Two dimensions — strings, grids, or two sequences (LCS, Edit Distance, Unique Paths).
3. **Interval DP:** Sub-problems defined on ranges `[i..j]` (Matrix Chain Multiplication, Burst Balloons).
4. **State Machine DP:** Multiple states at each position with transitions (Stock Buy/Sell with Cooldown, Regular Expression Matching).

### 🎯 How to Identify DP Problems
- **"Find the minimum/maximum..."** → Likely DP.
- **"Count all ways to..."** → Likely DP.
- **"Is it possible to..."** → Could be DP or Greedy.
- **You notice the same sub-problem being solved repeatedly** → Definitely DP (add memoization).
- **Problem has choices at each step that affect future choices** → DP if choices overlap, Greedy if locally optimal = globally optimal.

---

## 9. Interview Tips 💡

1. **Recognize the trigger words.** "Minimum cost", "maximum profit", "number of ways", "longest/shortest sequence", "is it possible to", "optimal strategy" — all likely DP. If the problem has choices at each step and asks for the *best* outcome, DP is your first guess.
2. **Start with the recurrence relation — always.** Before touching code, write the recurrence: `dp[i] = min(dp[i-coin] + 1) for each coin`. Say it out loud. This is the single most important step. If you can't define the recurrence, you can't solve the problem. Interviewers often care more about this than the code.
3. **Top-Down vs. Bottom-Up — know the trade-offs.** Top-Down (memoization): natural recursive thinking, only computes needed subproblems, but O(N) stack space. Bottom-Up (tabulation): no recursion overhead, easier to optimize space, but requires you to figure out the iteration order. Implement whichever you're stronger at, mention the other.
4. **Space optimization is the follow-up they'll ask.** If `dp[i]` only depends on `dp[i-1]`, you don't need an array — just two variables. If `dp[i][j]` only depends on the previous row, use a rolling array (two rows). Going from O(N²) → O(N) → O(1) is the progression they want to see. Volunteer this: *"I can optimize to O(1) space since I only need the previous two values."*
5. **The 4 DP patterns cover 90% of problems.** (a) **Linear DP**: `dp[i]` depends on previous elements (Fibonacci, House Robber, LIS). (b) **Grid/2D DP**: two dimensions (LCS, Edit Distance, Unique Paths). (c) **Interval DP**: ranges `[i..j]` (Matrix Chain, Burst Balloons). (d) **State Machine DP**: multiple states with transitions (Stock Buy/Sell). Identify which pattern your problem fits.
6. **Edge cases to mention proactively.** Empty input, single element (often the base case), negative numbers (min-cost problems might have negative edges), amount = 0 (return 0 or 1 depending on the problem), and integer overflow (DP values can grow large — use `BigInt` or modulo).
7. **Don't jump to DP.** First, try brute-force recursion. Draw the recursion tree. If you see repeated subproblems (same `f(n)` computed multiple times), *then* add memoization. This "recursive → observe overlap → memoize → tabulate → optimize space" progression is the story interviewers want to hear. It shows you derive DP, not just memorize it.
