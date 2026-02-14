# Greedy Algorithms 💰

## 1. The "All-You-Can-Eat Buffet" Analogy

Imagine you're at an **all-you-can-eat buffet** but you have a tiny plate (limited capacity). You want to get the **most calories for your plate size**.

**The Greedy Way:** You walk along the buffet and at each station, you grab **the most calorie-dense item that fits on your plate right now**. You never look ahead, you never reconsider what you already took. You just make the **best local choice at every step**.

**Does it work?** Usually, yes! If the pizza slice is denser than the salad, grabbing pizza first is smart. But sometimes it fails — maybe there's a legendary brownie at the end of the line worth more than everything you already grabbed. By then, your plate is full. You made a "locally optimal" but "globally suboptimal" choice.

**This is a Greedy Algorithm.** At each step, make the choice that looks best *right now*, without reconsidering past decisions or worrying about future consequences. When the **greedy choice property** holds (local best = global best), it's an incredibly efficient strategy — often O(N log N) or O(N) vs. DP's O(N²) or worse.

---

## 2. The Core Concept

In coding interviews, Greedy is used when making the locally optimal choice at each step provably leads to the globally optimal solution.

**The "DP" (Complete) Way:**
Explore *all* possible combinations and pick the best.
- Guarantees the optimal answer.
- But it's slow: often O(2^N) or O(N²).

**The "Greedy" (Fast) Way:**
At each step, commit to the single best option without looking back.
- **Much faster:** Often O(N log N) or O(N).
- **But only works when provably correct.** You must verify the **Greedy Choice Property**.

### When Greedy Works ✅
1. **Greedy choice property:** Choosing the locally best option at every step leads to a globally optimal solution.
2. **Optimal substructure:** The optimal solution contains optimal solutions to sub-problems.

### When Greedy Fails ❌
Classic trap: **Coin Change** with coins `[1, 3, 4]`, amount `6`:
- **Greedy:** Pick largest first → `4 + 1 + 1` = **3 coins** ❌
- **Optimal (DP):** `3 + 3` = **2 coins** ✅
- Why? Picking the locally "biggest" coin doesn't guarantee globally fewest coins for arbitrary denominations.

> **Rule of thumb:** If the problem asks for "minimum/maximum" and you're tempted to use Greedy, ask yourself: *"Can I construct a counter-example where the greedy choice fails?"* If yes, use DP instead.

---

## 3. Interactive Visualization 🎮
Click "Next" to see how we greedily select non-overlapping activities!

```visualizer
{
  "type": "intervals",
  "data": [[1, 3], [2, 5], [4, 6], [6, 8], [5, 7], [8, 9]]
}
```

---

## 4. Scenario A: Activity Selection (The Classic Greedy)
**Real-Life Scenario:** You are a conference room manager. Multiple teams have submitted meeting requests for **today**. Each meeting has a start and end time. You want to **maximize the number of meetings** that can happen in the room (no overlapping). Which meetings do you accept?

**Technical Problem:** Given `n` activities with start and finish times, select the maximum number of activities that can be performed by a single person, assuming that a person can only work on a single activity at a time. Activities are represented as `[start, end]`.

### TypeScript Implementation

```typescript
/**
 * Selects maximum number of non-overlapping activities.
 * 
 * Greedy Strategy: Always pick the activity that ENDS earliest.
 * Why? By finishing early, we leave the most room for future activities.
 * This is provably optimal (proof by exchange argument).
 * 
 * @param activities - Array of [start, end] pairs.
 * @returns Maximum number of non-overlapping activities.
 * 
 * @timeComplexity O(N log N) - Sorting dominates. The scan is O(N).
 * @spaceComplexity O(1) - Only a few tracking variables (ignoring sort's internal space).
 */
function activitySelection(activities: [number, number][]): number {
    if (activities.length === 0) return 0;

    // 1. Sort by END time (this is the greedy key!)
    activities.sort((a, b) => a[1] - b[1]);

    let count = 1; // We always take the first activity (earliest end)
    let lastEndTime = activities[0][1];

    // 2. Greedily select compatible activities
    for (let i = 1; i < activities.length; i++) {
        const [start, end] = activities[i];

        // If this activity starts AFTER the last selected one ends
        if (start >= lastEndTime) {
            count++;
            lastEndTime = end; // Update the "last booked" end time
        }
        // Otherwise, skip this activity (it overlaps)
    }

    return count;
}

// Example Usage:
const meetings: [number, number][] = [
    [1, 4], [3, 5], [0, 6], [5, 7], [3, 8], [5, 9],
    [6, 10], [8, 11], [8, 12], [2, 13], [12, 14]
];
console.log("Meeting requests:", meetings);
console.log("Max meetings possible:", activitySelection(meetings)); // 4
```

### Sample input and output
- **Input**: `[[1,4], [3,5], [0,6], [5,7], [3,8], [5,9], [6,10], [8,11], [8,12], [2,13], [12,14]]`
- **Output**: `4` (Selected: [1,4], [5,7], [8,11], [12,14])

---

## 5. Scenario B: Jump Game (Greedy Forward Pass)
**Real-Life Scenario:** You're playing a board game where each tile tells you the **maximum number of tiles you can jump forward** from it. Starting at the first tile, can you reach the last tile?

**Technical Problem:** Given an integer array `nums` where `nums[i]` represents the maximum jump length from position `i`, determine if you can reach the last index.

### TypeScript Implementation

```typescript
/**
 * Determines if the last index is reachable from the first.
 * 
 * Greedy Strategy: Track the farthest index reachable so far.
 * At each step, update the farthest reach. If we ever find ourselves
 * at an index beyond our farthest reach, we're stuck.
 * 
 * @param nums - Array where nums[i] = max jump from index i.
 * @returns True if the last index is reachable.
 * 
 * @timeComplexity O(N) - Single pass through the array.
 * @spaceComplexity O(1) - Only one tracking variable.
 */
function canJump(nums: number[]): boolean {
    let maxReach = 0; // The farthest index we can currently reach

    for (let i = 0; i < nums.length; i++) {
        // If current index is beyond our reach, we're stuck
        if (i > maxReach) return false;

        // Update farthest reachable index
        maxReach = Math.max(maxReach, i + nums[i]);

        // Early exit: if we can already reach the end
        if (maxReach >= nums.length - 1) return true;
    }

    return true;
}

// Example Usage:
console.log("Can jump [2,3,1,1,4]?", canJump([2, 3, 1, 1, 4])); // true
// Path: index 0 → index 1 (jump 2) → index 4 (jump 3). Reached!

console.log("Can jump [3,2,1,0,4]?", canJump([3, 2, 1, 0, 4])); // false
// Every path leads to index 3 which has 0 jumps. Stuck!
```

### Sample input and output
- **Input**: `[2, 3, 1, 1, 4]` → **Output**: `true`
- **Input**: `[3, 2, 1, 0, 4]` → **Output**: `false`

---

## 6. Scenario C: Fractional Knapsack (Greedy with Sorting)
**Real-Life Scenario:** You're a thief (sorry!) robbing a warehouse. You have a **bag that holds 50 kg**. Items have different weights and values. Unlike the 0/1 Knapsack, you *can break items apart* (take 60% of a gold bar). You want maximum value.

**Technical Problem:** Given items with weights and values, and a capacity `W`, maximize total value. Items can be fractionally taken.

### TypeScript Implementation

```typescript
/**
 * Solves the Fractional Knapsack problem.
 * 
 * Greedy Strategy: Sort items by value-to-weight ratio (bang-for-buck).
 * Always take the item with highest ratio first.
 * This ONLY works because we can take fractions. (0/1 Knapsack requires DP!)
 * 
 * @param items - Array of { weight, value } objects.
 * @param capacity - Maximum weight capacity.
 * @returns Maximum value achievable.
 * 
 * @timeComplexity O(N log N) - Sorting by ratio.
 * @spaceComplexity O(1) - In-place sort, constant extra space.
 */
function fractionalKnapsack(
    items: { weight: number; value: number }[],
    capacity: number
): number {
    // Sort by value/weight ratio (highest first)
    items.sort((a, b) => (b.value / b.weight) - (a.value / a.weight));

    let totalValue = 0;
    let remainingCapacity = capacity;

    for (const item of items) {
        if (remainingCapacity <= 0) break;

        if (item.weight <= remainingCapacity) {
            // Take the whole item
            totalValue += item.value;
            remainingCapacity -= item.weight;
        } else {
            // Take a fraction of it
            const fraction = remainingCapacity / item.weight;
            totalValue += item.value * fraction;
            remainingCapacity = 0;
        }
    }

    return Math.round(totalValue * 100) / 100; // Round to 2 decimal places
}

// Example Usage:
const items = [
    { weight: 10, value: 60 },   // ratio: 6.0
    { weight: 20, value: 100 },  // ratio: 5.0
    { weight: 30, value: 120 },  // ratio: 4.0
];
const capacity = 50;

console.log("Items:", items);
console.log("Capacity:", capacity);
console.log("Max Value:", fractionalKnapsack(items, capacity));
// Take all of item 1 (60) + all of item 2 (100) + 20/30 of item 3 (80) = 240
```

### Sample input and output
- **Input**: Items `[{10,60}, {20,100}, {30,120}]`, Capacity `50`
- **Output**: `240` (Take 10kg@60 + 20kg@100 + 20kg of 30kg@120 = 60+100+80)

---

## 7. Real World Applications 🌍

### 1. 📦 Huffman Coding (Data Compression)
ZIP files, JPEG images, and MP3 audio all use Huffman coding — a greedy algorithm that assigns shorter binary codes to more frequent characters. At each step, it greedily merges the two least frequent symbols. This is provably optimal for prefix-free codes and compresses data significantly.

### 2. 🗺️ Dijkstra's Algorithm (Shortest Path)
Google Maps, Uber routing, and network packet forwarding use Dijkstra's algorithm — a greedy approach where we always process the **closest unvisited node** next. Combined with a priority queue, it finds the shortest path in graphs with non-negative edge weights in O(E log V).

### 3. 💵 Coin Change (US Currency System)
For standard US denominations [25, 10, 5, 1], the greedy approach (always give the biggest coin that fits) produces the optimal result. This works because US denominations satisfy the **canonical property**. For arbitrary denominations, greedy fails — use DP instead.

### 4. 📅 Task Scheduling with Deadlines
In systems like Kubernetes pod scheduling or job queues, tasks have deadlines and profit/priority values. A greedy approach (sort by profit descending, schedule each in the latest available slot before its deadline) maximizes total profit.

---

## 8. Complexity Analysis 🧠

### Common Greedy Problems — Complexity Cheat Sheet

| Problem | Greedy Strategy | Time | Space |
|---------|----------------|------|-------|
| **Activity Selection** | Sort by end time, pick earliest | O(N log N) | O(1) |
| **Fractional Knapsack** | Sort by value/weight ratio | O(N log N) | O(1) |
| **Jump Game** | Track farthest reachable | O(N) | O(1) |
| **Huffman Coding** | Merge two smallest frequencies | O(N log N) | O(N) |
| **Dijkstra's Algorithm** | Process nearest unvisited node | O(E log V) | O(V) |
| **Minimum Spanning Tree (Kruskal)** | Add cheapest non-cycling edge | O(E log E) | O(V) |

### 🎯 Greedy vs. Dynamic Programming

| Aspect | Greedy | DP |
|--------|--------|-----|
| **Decision** | Make one choice (best now) | Consider all choices, compare |
| **Reconsideration** | Never undoes a choice | Evaluates all sub-problem solutions |
| **Speed** | Usually faster (O(N) or O(N log N)) | Usually slower (O(N²) or O(N × M)) |
| **Correctness** | **Not always optimal** — needs proof | **Always optimal** for well-defined recurrences |
| **Use when** | Greedy choice property is provable | Overlapping sub-problems exist |
| **Proof technique** | Exchange argument, contradiction | Induction on sub-problem size |

### 🧪 How to Verify Greedy Works
1. **Exchange Argument:** Assume there's a better solution. Show you can "exchange" a non-greedy choice with the greedy one without worsening the result.
2. **Proof by Contradiction:** Assume greedy gives a suboptimal answer. Derive a contradiction.
3. **Counter-example Test:** Try to construct an input where greedy fails. If you can't after serious effort, and the exchange argument holds, greedy is likely correct.

---

## 9. Interview Tips 💡

1. **Recognize the trigger words.** "Maximum number of non-overlapping", "minimum number of", "schedule to maximize", "jump game", "assign cookies" — all potentially Greedy. But ONLY if local optimization provably leads to global optimum. Always verify before committing.
2. **Try to disprove it first.** Before implementing Greedy, spend 30 seconds constructing a counter-example. If `coins = [1, 3, 4]` and `amount = 6`, Greedy gives `4+1+1 = 3 coins`, but optimal is `3+3 = 2 coins`. If you find a counter-example, switch to DP. If you can't, Greedy is likely correct.
3. **Sorting is almost always the first step.** Activity Selection → sort by end time. Fractional Knapsack → sort by value/weight ratio. Job Scheduling → sort by profit or deadline. If you're doing Greedy and haven't sorted, you're probably missing something. State your sort key explicitly.
4. **Know the Exchange Argument proof.** *"Assume there's an optimal solution that makes a different choice at step K. I can swap that choice with the greedy choice without worsening the result. Therefore the greedy solution is at least as good."* This is the standard proof technique. Being able to sketch it in 2 minutes is a staff-level skill.
5. **Greedy vs. DP — the classic trade-off.** Greedy: O(N log N) typically, but not always correct. DP: O(N²) or O(N × M) typically, but always correct for well-defined recurrences. If unsure, start with DP (guaranteed correct), then ask: *"Can I simplify this to Greedy?"*
6. **Edge cases to mention proactively.** Empty input, single element, all elements equal (many tie-breaking scenarios), elements already sorted (degenerates to simpler case), and very large inputs (Greedy's O(N log N) shines here vs DP's O(N²)).
7. **The "Exchange Argument" for Activity Selection.** *"Why sort by end time, not start time or duration?"* Answer: Finishing earliest leaves the maximum room for future activities. Sorting by start time or duration can be counter-exampled. Draw the counter-example on the whiteboard: short duration in the middle overlapping both long activities.
