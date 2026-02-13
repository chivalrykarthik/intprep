# Two Pointers

## 1. The "Long-Distance High-Five" Analogy

Imagine you and a friend are at opposite ends of a long hallway. You want to high-five exactly in the middle.

**The Dumb Way:** You walk to every single tile, and for each tile you stand on, your friend walks to every other tile to see if you match. You'd be there all day.

**The Smart Way:** You both take one step forward at a time. If you are too far left, you step right. If your friend is too far right, they step left. You will meet in linear time.

**This is the Two Pointers pattern.** Instead of a nested loop checking every pair ($O(N^2)$), we use two references that move towards each other (or in parallel) to find the solution in one pass ($O(N)$).

---

## 2. The Core Concept

In coding interviews, we use this to **search for pairs in a sorted array** or **optimize subarray operations**.

**The "Brute Force" (Dumb) Way:**
Checking every single pair.
```javascript
const n = 100; // Example size
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    // Check every combination...
  }
}
```
**Time:** $O(N^2)$ - Terrible.

**The "Two Pointers" (Smart) Way:**
Start one pointer at the beginning (`left`) and one at the end (`right`).
- If sum is too small? Move `left` forward to increase it.
- If sum is too big? Move `right` backward to decrease it.
- **Boom.** Solution found in one pass.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the pointers move!

```visualizer
{
  "type": "two-pointer",
  "data": [1, 3, 4, 6, 8, 9, 11],
  "target": 10
}
```

---

## 4. Scenario A: Target Sum (Sorted Array)
**Real-Life Scenario:** You have a budget of exactly $20. You want to buy exactly two items from a catalog sorted by price. Find the pair quickly.

**Technical Problem:** Given a **sorted** array of integers, find two numbers such that they add up to a specific target number.

### TypeScript Implementation

```typescript
/**
 * Finds the indices of two numbers that add up to target.
 * 
 * @param numbers - Sorted array of integers
 * @param target - The target sum
 * @returns Indices of the two numbers (1-based for this specific LeetCode problem)
 * 
 * @timeComplexity O(N) - We touch each element at most once.
 * @spaceComplexity O(1) - We only store two integer variables.
 */
function twoSumSorted(numbers: number[], target: number): number[] {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const currentSum = numbers[left] + numbers[right];

    if (currentSum === target) {
      return [left + 1, right + 1]; // 1-based index
    } else if (currentSum < target) {
      // Need a bigger sum, move left pointer up
      left++;
    } else {
      // Need a smaller sum, move right pointer down
      right--;
    }
  }

  return [];
}

// Example Usage:
const numbers = [2, 7, 11, 15];
const targetSum = 9;
console.log("Numbers:", numbers);
console.log("Target Sum:", targetSum);
console.log("Indices found:", twoSumSorted(numbers, targetSum));
```
### Sample input and output
- **Input**: `numbers = [2, 7, 11, 15]`, `target = 9`
- **Output**: `[1, 2]` (numbers[0]=2 + numbers[1]=7 = 9, 1-based indices)

---

## 5. Scenario B: Container With Most Water
**Real-Life Scenario:** You have vertical walls of different heights. You want to place two walls such that they hold the most water between them (maximizing area).

**Technical Problem:** Given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container, such that the container contains the most water.

### TypeScript Implementation

```typescript
/**
 * Finds the maximum area of water that can be contained.
 * 
 * @param height - Array of wall heights
 * @returns The maximum area
 * 
 * @timeComplexity O(N) - Single pass with two pointers.
 * @spaceComplexity O(1) - Only constant extra space used.
 */
function maxArea(height: number[]): number {
  let left = 0;
  let right = height.length - 1;
  let maxWater = 0;

  while (left < right) {
    // Area = width * min(height of left wall, height of right wall)
    const width = right - left;
    const currentHeight = Math.min(height[left], height[right]);
    const area = width * currentHeight;

    maxWater = Math.max(maxWater, area);

    // Initial Thought: Which pointer do we move?
    // We want to try and find a taller wall to compensate for lesser width.
    // So we assume the shorter wall is the bottleneck and discard it.
    if (height[left] < height[right]) {
      left++;
    } else {
      right--;
    }
  }

  return maxWater;
};

// Example Usage:
const heights = [1, 8, 6, 2, 5, 4, 8, 3, 7];
console.log("Wall Heights:", heights);
console.log("Max Water Area:", maxArea(heights));
```
### Sample input and output
- **Input**: `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`
- **Output**: `49` (between heights 8 and 7, width = 7, area = 7 × 7 = 49)

---

## 6. Real World Applications 🌍

### 1. 🎵 Palindrome Detection (Strings & Playlists)
Checking if a string (or any sequence) reads the same forwards and backwards is a classic two-pointer problem. One pointer starts at the beginning, the other at the end, and they walk towards each other comparing characters. If they ever mismatch, it's not a palindrome. This is used in DNA sequence analysis, input validation, and playlist symmetry checks.

### 2. 💾 Memory Defragmentation (Move Zeroes)
Operating systems compact free memory blocks by moving used data to the front. One pointer (read) scans for used blocks, another (write) tracks where to place them. This is identical to the "Move Zeroes" problem — move all non-zero elements to the front while maintaining order, filling the rest with zeroes.

### 3. 🔗 Merging Sorted Arrays
When merging two sorted arrays (e.g., in Merge Sort's merge step), you maintain one pointer per array. Compare the elements at both pointers, take the smaller one, and advance that pointer. This runs in O(N+M) rather than the O((N+M) log(N+M)) of dumping everything and re-sorting.

### 4. 🧪 A/B Testing (Sorted Log Analysis)
When comparing two sorted event logs from variant A and variant B, two pointers let you walk through both logs simultaneously, identifying matching events, gaps, and divergences in a single pass — critical for real-time analytics pipelines at scale.

---

## 7. Complexity Analysis 🧠

Why do we care about Two Pointers?

### Time Complexity: O(N) ⚡
- **Brute Force:** O(N^2). Checking every pair is quadratic. For 10,000 items, that's 100,000,000 operations.
- **Two Pointers:** O(N). We touch each element constant times. For 10,000 items, that's ~10,000 operations. **10,000x faster.**

### Space Complexity: O(1) 💾
- We only need two variables (`left`, `right`) regardless of the input size. Very memory efficient.
