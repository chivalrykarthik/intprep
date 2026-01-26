# Tree BFS (Breadth First Search) 🌳

## 1. The "Corporate Hierarchy" Analogy

Imagine you are the CEO of a company. You want to make a big announcement.
- First, you tell your **direct reports** (VPs).
- Then, the VPs tell **their direct reports** (Managers).
- Then, the Managers tell **their teams** (Employees).

You don't just pick one VP, go all the way down to their intern, and then come back up (that would be Depth First Search). You go **level by level**. Everyone at the same rank hears the news at the same time.

**This is Tree BFS.** It traverses a tree layer by layer, visiting all nodes at depth `d` before moving to depth `d+1`.

---

## 2. The Core Concept

In coding interviews, we use this to solve problems where we need to process data in **levels** or find the **shortest path** in an unweighted graph/tree.

**The "DFS" (Recursive) Way:**
You dive deep into one branch until you hit a leaf, then backtrack.
- Problem: If the tree is infinite on the left side, you'll never see the right side. It's hard to track "levels".

**The "BFS" (Queue) Way:**
We use a **Queue** (First-In, First-Out line).
1. Put the Root in the Queue.
2. While Queue is not empty:
   - Take the front node out.
   - Process it.
   - Put **all its children** into the back of the Queue.
- **Boom.** You naturally process nodes in level order.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the level-order traversal!

```visualizer
{
  "type": "tree-bfs", 
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

## 4. Scenario A: Level Order Traversal (The Classic)
**Real-Life Scenario:** You are printing a family tree generation by generation. First the grandparents, then the parents, then the kids.

**Technical Problem:** Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

### TypeScript Implementation

```typescript
/**
 * Definition for a binary tree node.
 * class TreeNode {
 *     val: number
 *     left: TreeNode | null
 *     right: TreeNode | null
 *     constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.left = (left===undefined ? null : left)
 *         this.right = (right===undefined ? null : right)
 *     }
 * }
 */

/**
 * Returns level order traversal of a tree.
 * 
 * @param root - The root of the tree.
 * @returns An array of arrays, where each inner array is a level.
 * 
 * @timeComplexity O(N) - We visit every node exactly once.
 * @spaceComplexity O(N) - In the worst case (perfect tree), the queue holds N/2 nodes (the bottom level).
 */
function levelOrder(root: TreeNode | null): number[][] {
  const result: number[][] = [];
  if (!root) return result;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevel: number[] = [];

      // Process all nodes at this current level
      for (let i = 0; i < levelSize; i++) {
          const currentNode = queue.shift()!; // Dequeue
          currentLevel.push(currentNode.val);

          // Enqueue children
          if (currentNode.left) queue.push(currentNode.left);
          if (currentNode.right) queue.push(currentNode.right);
      }

      result.push(currentLevel);
  }

  return result;
}
```

---

## 5. Scenario B: Zigzag Traversal (Spiral Order)
**Real-Life Scenario:** A snake moving down a tree. It goes left-to-right on one level, then right-to-left on the next.

**Technical Problem:** Given the root of a binary tree, return the zigzag level order traversal of its nodes' values.

### TypeScript Implementation

```typescript
/**
 * Returns zigzag level order traversal.
 */
function zigzagLevelOrder(root: TreeNode | null): number[][] {
    const result: number[][] = [];
    if (!root) return result;

    const queue: TreeNode[] = [root];
    let leftToRight = true;

    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel: number[] = new Array(levelSize);

        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()!;

            // Calculate index based on direction
            const index = leftToRight ? i : (levelSize - 1 - i);
            currentLevel[index] = node.val;

            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }

        result.push(currentLevel);
        leftToRight = !leftToRight; // Flip direction
    }

    return result;
}
```

---

## 6. Real World Applications 🌍

### 1. 📡 Network Broadcasting
When a router sends a packet to all connected devices (broadcasting), it essentially performs a BFS. It sends to neighbors, who send to their neighbors, ensuring the message spreads layer by layer.

### 2. 🗺️ GPS Navigation (Shortest Path)
BFS is the algorithm for finding the shortest path in an unweighted graph. If you want to find the fewest number of turns to get to a destination, BFS explores all possible paths of 1 turn, then 2 turns, etc.

### 3. 🔍 Web Crawlers
Search engines use BFS to crawl the web. They start at a seed page (e.g., Wikipedia home), grab all links (level 1), then visit those links to grab their links (level 2), ensuring they don't get stuck in a deep infinite hole of a single website.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(N) ⚡
- We visit every node once. Enqueuing and dequeuing takes O(1).
- Total time is linear to the number of nodes.

### Space Complexity: O(W) 💾
- **W** is the maximum width of the tree.
- In a balanced binary tree, the last level contains `N/2` nodes.
- So the queue might need to store `O(N)` nodes.
- Compare this to DFS, which takes `O(H)` (height) space. If the tree is wide but shallow, DFS uses less memory. If deep but narrow, BFS uses more.
