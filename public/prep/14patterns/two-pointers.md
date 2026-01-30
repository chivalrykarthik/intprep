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

---

## 6. Real World Applications 🌍

### 1. 🎵 Playlist Shuffling
Verifying if a playlist is a palindrome or reversing a generic list in place involves swapping elements from ends towards the center.

### 2. 💾 Memory Management
Compact free space blocks. One pointer reads used blocks, another writes them to the front to defragment memory (similar to "Move Zeroes" problem).

---

## 7. Complexity Analysis 🧠

Why do we care about Two Pointers?

### Time Complexity: O(N) ⚡
- **Brute Force:** O(N^2). Checking every pair is quadratic. For 10,000 items, that's 100,000,000 operations.
- **Two Pointers:** O(N). We touch each element constant times. For 10,000 items, that's ~10,000 operations. **10,000x faster.**

### Space Complexity: O(1) 💾
- We only need two variables (`left`, `right`) regardless of the input size. Very memory efficient.
