# Tree DFS (Depth First Search) 🌲

## 1. The "Maze Explorer" Analogy

Imagine you are exploring a maze. You want to find the exit.
- You pick a path and keep walking **forward** until you hit a dead end.
- Once you hit a wall, you **backtrack** to the last intersection.
- Then you try the next available path.

You don't take one step in path A, then one step in path B (that's BFS). You commit to path A all the way to the bitter end before you even think about path B.

**This is Tree DFS.** It dives as deep as possible into one branch before backtracking. It creates a "stack" of where you've been.

---

## 2. The Core Concept

In coding interviews, we use this to solve problems where we need to find a **specific path**, check **root-to-leaf** properties, or exhaustively search combinations.

**The "BFS" (Queue) Way:**
Good for "shortest path" or near neighbors. Bad if the target is uniquely deep in a leaf node, as BFS wastes memory holding all the shallow nodes.

**The "DFS" (Stack/Recursion) Way:**
1. Process the Node.
2. Recursively call DFS on the **Left** child.
3. Recursively call DFS on the **Right** child.
- **Boom.** You effectively visit nodes in Pre-order (or In-order/Post-order depending on when you process).

---

## 3. Interactive Visualization 🎮
Click "Next" to see the recursion stack grow and shrink!

```visualizer
{
  "type": "tree-dfs", 
  "data": {
    "val": 1,
    "left": {
      "val": 2,
      "left": { "val": 4 },
      "right": { "val": 5 }
    },
    "right": {
      "val": 3,
      "left": { "val": 6 },
      "right": { "val": 7 }
    }
  }
}
```

---

## 4. Scenario A: Path Sum (Root to Leaf)
**Real-Life Scenario:** You are looking for a specific budget allocation. You want to see if any sequence of department approvals (Nodes) adds up exactly to $10,000.

**Technical Problem:** Given the root of a binary tree and an integer `targetSum`, return `true` if the tree has a root-to-leaf path such that adding up all the values along the path equals `targetSum`.

### TypeScript Implementation

```typescript
/**
 * Definition for a binary tree node.
 */
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
        this.val = (val===undefined ? 0 : val);
        this.left = (left===undefined ? null : left);
        this.right = (right===undefined ? null : right);
    }
}

/**
 * Checks if a path with the given sum exists.
 * 
 * @param root - The root of the tree.
 * @param targetSum - The sum we are looking for.
 * @returns boolean
 * 
 * @timeComplexity O(N) - We might visit every node.
 * @spaceComplexity O(H) - Recursion stack depth equals tree height (H).
 */
function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (!root) return false;

  // Subtract current value from the target
  const remainingWeight = targetSum - root.val;

  // Check if it's a leaf node AND sum matches
  if (!root.left && !root.right && remainingWeight === 0) {
      return true;
  }

  // Recursively check left or right subtrees
  return hasPathSum(root.left, remainingWeight) || hasPathSum(root.right, remainingWeight);
}

// Example Usage:
//      5
//     / \
//    4   8
//   /   / \
//  11  13  4
// /  \      \
// 7   2      1
const root = new TreeNode(5,
    new TreeNode(4, new TreeNode(11, new TreeNode(7), new TreeNode(2))),
    new TreeNode(8, new TreeNode(13), new TreeNode(4, null, new TreeNode(1)))
);

const target = 22; // 5 -> 4 -> 11 -> 2
console.log(`Has path sum ${target}?`, hasPathSum(root, target));
```
### Sample input and output
- **Input**: Tree `[5,4,8,11,null,13,4,7,2,null,null,null,1]`, `targetSum = 22`
- **Output**: `true` (Path: 5 → 4 → 11 → 2 = 22)

---

## 5. Scenario B: Count All Paths Sum (Complex)
**Real-Life Scenario:** Find **all possible** spending chains that equal exactly $500, even if the chain doesn't start at the CEO (Root) or end at an intern (Leaf).

**Technical Problem:** Given the root of a binary tree and an integer `k`, return the number of paths where the sum of the values along the path equals `k`.

### TypeScript Implementation

```typescript
/**
 * Definition for a binary tree node.
 */
class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
        this.val = (val===undefined ? 0 : val);
        this.left = (left===undefined ? null : left);
        this.right = (right===undefined ? null : right);
    }
}

/**
 * Counts all paths summing to k (using Prefix Sum map for O(N)).
 * 
 * @param root - Current node
 * @param k - Target sum
 * @returns Total count of valid paths
 */
function pathSum(root: TreeNode | null, k: number): number {
    let count = 0;
    const map = new Map<number, number>();
    map.set(0, 1); // Base case: one path with sum 0 (empty)

    function dfs(node: TreeNode | null, currSum: number) {
        if (!node) return;

        currSum += node.val;

        // Check if there is a prefix sum such that currSum - oldSum = k
        if (map.has(currSum - k)) {
            count += map.get(currSum - k)!;
        }

        // Add current sum to map for children
        map.set(currSum, (map.get(currSum) || 0) + 1);

        dfs(node.left, currSum);
        dfs(node.right, currSum);

        // Backtrack: Remove current sum from map so cross-branch paths aren't counted
        map.set(currSum, map.get(currSum)! - 1);
    }

    dfs(root, 0);
    return count;
}

// Example Usage:
//      10
//     /  \
//    5   -3
//   / \    \
//  3   2   11
// / \   \
// 3 -2   1
const rootSum = new TreeNode(10,
    new TreeNode(5, 
        new TreeNode(3, new TreeNode(3), new TreeNode(-2)), 
        new TreeNode(2, null, new TreeNode(1))
    ),
    new TreeNode(-3, null, new TreeNode(11))
);

const kVal = 8;
// Paths: 
// 5 -> 3
// 5 -> 2 -> 1
// -3 -> 11
console.log(`Number of paths summing to ${kVal}:`, pathSum(rootSum, kVal));
```
### Sample input and output
- **Input**: Tree `[10,5,-3,3,2,null,11,3,-2,null,1]`, `k = 8`
- **Output**: `3` (Paths: 5→3, 5→2→1, -3→11)

---

## 6. Real World Applications 🌍

### 1. 📂 File System Traversal
A file system is a tree. To calculate the total size of a folder, you DFS into subfolders, summing up file sizes, and bringing the total back up to the parent.

### 2. 🧩 Dependency Resolution
Build tools (like Webpack or Maven) use DFS (Topological Sort) to determine the order of compilation. If Library A depends on B, and B depends on C, we must build C, then B, then A.

### 3. 🤖 Game AI (Chess/Minimax)
AI explores moves by simulating a game tree. It dives deep into a move sequence ("If I move Pawn, he moves Knight, I move Bishop...") to see the outcome, evaluating the "leaf" of that decision branch.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(N) ⚡
- We visit every node exactly once.

### Space Complexity: O(H) 💾
- **H** is the height of the tree.
- In the worst case (a skewed tree, essentially a linked list), H = N, so **O(N)** recursion stack.
- In a balanced tree, H = log N, so **O(log N)** space.
- Compare this to BFS which takes O(W) (width). DFS is better for wide, shallow trees.

---

## 8. Interview Tips 💡

1. **Recognize the trigger words.** "Root-to-leaf path", "path sum", "all paths", "maximum depth", "diameter", "lowest common ancestor", "serialize/deserialize" — all Tree DFS. Any time you need to explore full paths from root to leaves, use DFS.
2. **Know all three traversal orders and when to use each.** **Pre-order** (root, left, right): serialize trees, copy trees. **In-order** (left, root, right): BST gives sorted output. **Post-order** (left, right, root): calculate subtree heights, delete trees bottom-up. Name the order you're using and why.
3. **Return value vs. global variable — pick the right approach.** Some problems need values propagated UP (height, subtree sum) — use return values. Others need values propagated DOWN (prefix path, running sum) — pass parameters. Some need BOTH (diameter = max of left + right at any node) — use a global variable alongside return values.
4. **The "recursive leap of faith."** Trust that `dfs(node.left)` correctly solves the left subtree. Focus on: (a) What does this function return? (b) How do I combine left/right results with the current node? (c) What's my base case? This mental model prevents getting lost in recursion.
5. **Edge cases to mention proactively.** Empty tree (`null`), single node, completely left-skewed or right-skewed tree, negative values in path sum problems, and trees with duplicate values.
6. **Iterative DFS with an explicit stack.** Recursive DFS risks stack overflow for deep trees (JS default stack is ~10K-15K frames). Iterative DFS using `const stack = [root]` avoids this. In production systems, always use iterative. Mention this conversion ability.
7. **DFS is a subroutine in harder problems.** Lowest Common Ancestor, Binary Tree Maximum Path Sum, Flatten Binary Tree to Linked List, and Construct Binary Tree from Traversals all use DFS as the core engine. Frame your solution as "I'll use DFS because I need to process subtrees before combining results" — this shows you understand *why*, not just *how*.
