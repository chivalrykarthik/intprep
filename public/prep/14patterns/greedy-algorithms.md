# Greedy Algorithms 💰

## 1. The "Coin Collector" Analogy

You're at an arcade collecting dropped coins. You have limited time.

**The Greedy Way:**
Always grab the **closest coin** to you right now. Don't plan ahead—just take what's best at this moment.

**This is a Greedy Algorithm.** At each step, make the locally optimal choice, hoping it leads to a globally optimal solution.

---

## 2. The Core Concept

### When Greedy Works
1. **Greedy choice property:** Local optimal leads to global optimal
2. **Optimal substructure:** Problem can be broken into subproblems

### When Greedy Fails
- Coin Change with coins [1, 3, 4], amount 6
- Greedy: 4 + 1 + 1 = 3 coins
- Optimal: 3 + 3 = 2 coins ❌

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "interval",
  "data": [[1,3], [2,4], [3,5], [4,6], [5,7]]
}
```

---

## 4. Scenario A: Activity Selection

```typescript
/**
 * Select maximum non-overlapping activities.
 * Greedy: Always pick the activity that ends earliest.
 * 
 * @timeComplexity O(N log N) for sorting
 * @spaceComplexity O(1)
 */
function activitySelection(activities: [number, number][]): number {
  // Sort by end time
  activities.sort((a, b) => a[1] - b[1]);
  
  let count = 1;
  let lastEnd = activities[0][1];
  
  for (let i = 1; i < activities.length; i++) {
    if (activities[i][0] >= lastEnd) {
      count++;
      lastEnd = activities[i][1];
    }
  }
  
  return count;
}

console.log(activitySelection([[1,4], [3,5], [0,6], [5,7], [3,8], [5,9], [6,10], [8,11], [8,12], [2,13], [12,14]]));
// Output: 4
```

---

## 5. Scenario B: Jump Game

```typescript
/**
 * Can you reach the last index?
 * Greedy: Track the farthest reachable index.
 * 
 * @timeComplexity O(N)
 * @spaceComplexity O(1)
 */
function canJump(nums: number[]): boolean {
  let maxReach = 0;
  
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false; // Can't reach this index
    maxReach = Math.max(maxReach, i + nums[i]);
    if (maxReach >= nums.length - 1) return true;
  }
  
  return true;
}

console.log(canJump([2, 3, 1, 1, 4])); // true
console.log(canJump([3, 2, 1, 0, 4])); // false
```

---

## 6. Real World Applications 🌍

### 1. 📦 Huffman Coding (Data compression)
### 2. 🗺️ Dijkstra's Algorithm (Shortest path)
### 3. 💵 Making Change (US coins)
### 4. 📅 Task Scheduling

---

## 7. Complexity Analysis 🧠

| Problem | Approach | Time |
|---------|----------|------|
| Activity Selection | Sort + scan | O(N log N) |
| Fractional Knapsack | Sort by ratio | O(N log N) |
| Jump Game | Single pass | O(N) |
| Huffman Coding | Priority Queue | O(N log N) |

### Greedy vs DP

| Aspect | Greedy | DP |
|--------|--------|-----|
| Choices | One (best now) | All (compare) |
| Speed | Usually faster | Usually slower |
| Correctness | Not always optimal | Always optimal |
| Use when | Greedy choice property holds | Overlapping subproblems |
