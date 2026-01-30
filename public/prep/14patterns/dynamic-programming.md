# Dynamic Programming 🧩

## 1. The "Climbing Stairs" Analogy

You're climbing a staircase with N steps. You can take 1 or 2 steps at a time.

**The Naive Way:**
Calculate every possible combination recursively. For 40 steps, you'd compute billions of paths!

**The DP Way:**
- To reach step 5, you come from step 4 (one step) or step 3 (two steps).
- `ways(5) = ways(4) + ways(3)`
- **Store results** so you never recompute. 40 steps → 40 calculations!

**This is Dynamic Programming.** Break problems into overlapping subproblems, solve each once, and store results.

---

## 2. The Core Concept

### Two Approaches

**Top-Down (Memoization):**
- Start from the answer, recurse down
- Cache results in a map/array

**Bottom-Up (Tabulation):**
- Start from base cases, build up
- Fill a DP table iteratively

### When to Use DP
1. **Optimal substructure:** Solution uses solutions of subproblems
2. **Overlapping subproblems:** Same subproblems solved repeatedly

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "tree-dfs",
  "data": {
    "val": "fib(5)",
    "left": { "val": "fib(4)", "left": { "val": "fib(3)" }, "right": { "val": "fib(2)" } },
    "right": { "val": "fib(3)", "left": { "val": "fib(2)" }, "right": { "val": "fib(1)" } }
  }
}
```

---

## 4. Scenario A: Fibonacci (Classic)

```typescript
// Top-Down with Memoization
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// Bottom-Up with Tabulation
function fibTab(n: number): number {
  if (n <= 1) return n;
  
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}
```

---

## 5. Scenario B: Coin Change

```typescript
/**
 * Minimum coins to make amount.
 * @timeComplexity O(amount * coins.length)
 * @spaceComplexity O(amount)
 */
function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

---

## 6. Real World Applications 🌍

### 1. 🧬 DNA Sequence Alignment
### 2. 📈 Stock Trading (Best time to buy/sell)
### 3. 🎒 Resource Allocation (Knapsack)
### 4. 📝 Text Editing (Edit distance)

---

## 7. Complexity Analysis 🧠

| Problem | Time | Space |
|---------|------|-------|
| Fibonacci | O(N) | O(1) optimized |
| Coin Change | O(N*M) | O(N) |
| Longest Common Subsequence | O(N*M) | O(N*M) |
| 0/1 Knapsack | O(N*W) | O(N*W) |

### Common DP Patterns
1. **Linear DP:** `dp[i]` depends on previous elements
2. **Grid DP:** 2D problems (paths, LCS)
3. **Interval DP:** Subproblems on ranges
4. **State Machine:** Multiple states per position
