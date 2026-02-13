# Monotonic Stack 📚

## 1. The "Tallest Building View" Analogy

Imagine you're standing in a city, looking at a row of buildings of different heights. For each building, you want to know: **"What is the next building to my right that is taller than me?"**

**The Dumb Way:** For every building, scan right through every remaining building until you find a taller one.
- Building 1? Scan right... found taller at position 5.
- Building 2? Scan right from scratch... found at position 3.
- That's **O(N²)** — terrible for a skyline of 1,000 buildings (1,000,000 comparisons).

**The Smart Way (Monotonic Stack):** Walk through the buildings **once**, right to left. Maintain a **stack** of buildings you've seen, but keep it **monotonically decreasing** (tallest at bottom, shortest at top).
- When you see a new building, **pop** all shorter buildings off the stack (they can never be "next taller" for anyone further left — the new building blocks them).
- The building now on top of the stack IS the next taller building.
- Push the new building onto the stack.
- **Boom.** One pass. O(N).

**This is a Monotonic Stack.** A stack where elements are always in sorted order (monotonically increasing or decreasing). It's the secret weapon for "next greater/smaller element" problems.

---

## 2. The Core Concept

In coding interviews, we use this to solve problems where we need to find the **next greater**, **next smaller**, **previous greater**, or **previous smaller** element for every item in an array.

**The "Brute Force" (Dumb) Way:**
For each element, scan in one direction until you find the answer.
- Complexity: **O(N²)**. Nested loops.

**The "Monotonic Stack" (Smart) Way:**
1. Iterate through the array (left-to-right or right-to-left depending on the problem).
2. Maintain a stack that is always in **monotonic order**.
3. For each new element, **pop** all elements that violate the monotonic property — each popped element has just found its "answer" (the current element).
4. Push the current element onto the stack.
- **Boom.** Each element is pushed once and popped at most once. Total: **O(N)**.

### Monotonic Increasing vs. Decreasing
- **Monotonic Increasing Stack** (bottom → top: small → large): Used for **Next Greater Element**.
- **Monotonic Decreasing Stack** (bottom → top: large → small): Used for **Next Smaller Element**.

---

## 3. Interactive Visualization 🎮
Click "Next" to see how the stack processes elements!

```visualizer
{
  "type": "subsets",
  "data": [4, 2, 1, 5, 3]
}
```

---

## 4. Scenario A: Next Greater Element
**Real-Life Scenario:** You're a stock trader. For each day, you want to know: **"How many days until the stock price is higher than today?"** This is the classic "Daily Temperatures" problem.

**Technical Problem:** Given an array of daily temperatures, return an array where `answer[i]` is the number of days you have to wait after the `i`th day to get a warmer temperature. If there is no future warmer day, use `0`.

### TypeScript Implementation

```typescript
/**
 * For each day, finds how many days until a warmer temperature.
 * Uses a Monotonic Decreasing Stack (stores indices).
 *
 * @param temperatures - Array of daily temperatures.
 * @returns Array of wait times.
 *
 * @timeComplexity O(N) - Each element pushed and popped at most once.
 * @spaceComplexity O(N) - Stack can hold up to N elements.
 */
function dailyTemperatures(temperatures: number[]): number[] {
    const n = temperatures.length;
    const answer = new Array(n).fill(0);
    const stack: number[] = []; // Stores INDICES (not values)

    for (let i = 0; i < n; i++) {
        // Pop all days that are cooler than today
        // (today IS the "next warmer day" for them)
        while (
            stack.length > 0 &&
            temperatures[i] > temperatures[stack[stack.length - 1]]
        ) {
            const prevDay = stack.pop()!;
            answer[prevDay] = i - prevDay; // Days waited
        }

        // Push today's index onto the stack
        stack.push(i);
    }

    // Any remaining indices in stack have no warmer future day (answer stays 0)
    return answer;
}

// Example Usage:
const temps = [73, 74, 75, 71, 69, 72, 76, 73];
console.log("Temperatures:", temps);
console.log("Wait times:", dailyTemperatures(temps));
```

### Sample input and output
- **Input**: `[73, 74, 75, 71, 69, 72, 76, 73]`
- **Output**: `[1, 1, 4, 2, 1, 1, 0, 0]`
  - Day 0 (73°): next warmer is Day 1 (74°) → wait 1 day
  - Day 2 (75°): next warmer is Day 6 (76°) → wait 4 days
  - Day 6 (76°): no warmer day → 0

---

## 5. Scenario B: Largest Rectangle in Histogram
**Real-Life Scenario:** You're an architect. You have a row of buildings (histogram bars) and you want to find the **largest rectangular billboard** that can fit across consecutive buildings. The billboard's height is limited by the shortest building in the stretch.

**Technical Problem:** Given an array of integers `heights` representing the histogram's bar heights (width of each bar is 1), find the area of the largest rectangle in the histogram.

### TypeScript Implementation

```typescript
/**
 * Finds the largest rectangular area in a histogram.
 *
 * Key insight: For each bar, the max rectangle using that bar's height
 * extends left/right until a shorter bar is encountered.
 * A monotonic increasing stack helps find these boundaries efficiently.
 *
 * @param heights - Array of bar heights.
 * @returns The area of the largest rectangle.
 *
 * @timeComplexity O(N) - Each bar pushed and popped once.
 * @spaceComplexity O(N) - Stack storage.
 */
function largestRectangleArea(heights: number[]): number {
    const stack: number[] = []; // Stores indices, monotonically increasing heights
    let maxArea = 0;

    // Append 0 to flush remaining bars from the stack at the end
    const extended = [...heights, 0];

    for (let i = 0; i < extended.length; i++) {
        // Pop bars that are taller than current (they can't extend further right)
        while (stack.length > 0 && extended[i] < extended[stack[stack.length - 1]]) {
            const height = extended[stack.pop()!];

            // Width: from the bar after the new stack top, to current index
            const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;

            maxArea = Math.max(maxArea, height * width);
        }

        stack.push(i);
    }

    return maxArea;
}

// Example Usage:
const bars = [2, 1, 5, 6, 2, 3];
console.log("Histogram:", bars);
console.log("Largest Rectangle Area:", largestRectangleArea(bars));
```

### Sample input and output
- **Input**: `[2, 1, 5, 6, 2, 3]`
- **Output**: `10` (Rectangle of height 5, width 2 spanning bars at index 2 and 3)

---

## 6. Real World Applications 🌍

### 1. 📈 Stock Span Problem
Financial platforms calculate "stock span" — for each day, how many consecutive previous days had a price less than or equal to today? This is a direct application of a monotonic decreasing stack tracking prices.

### 2. 🏗️ Trapping Rain Water
Civil engineers use elevation profiles to calculate how much rainwater is trapped between buildings. While solvable with two pointers, the monotonic stack approach processes each bar once, computing trapped water layer by layer.

### 3. 🖥️ Browser Tab Management
When you open many tabs and close intermediate ones, the "next visible tab" logic resembles a monotonic stack — each tab knows which tab will be visible next based on z-order or position.

### 4. 🧮 Expression Evaluation
Compilers use stacks to evaluate mathematical expressions respecting operator precedence. A monotonic approach ensures higher-precedence operators are evaluated before lower ones (shunting-yard algorithm).

---

## 7. Complexity Analysis 🧠

Why is this O(N) and not O(N²)?

### Time Complexity: O(N) ⚡
- **Key insight:** Every element is pushed onto the stack **exactly once** and popped **at most once**.
- Total push operations: N. Total pop operations: at most N.
- Total work: **O(N) + O(N) = O(N)**.
- The `while` loop inside the `for` loop is misleading — it doesn't make it O(N²) because the total number of pops across ALL iterations of the outer loop is bounded by N.

### Space Complexity: O(N) 💾
- In the worst case (monotonically increasing array), the stack holds all N elements.
- In practice, it's often much less.
