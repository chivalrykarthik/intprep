# Binary Trees 🌳

## 1. The "Corporate Hierarchy" Analogy

Imagine a company's org chart:

**The CEO (Root):**
- At the very top, no one above them
- Has two direct reports: VP of Sales and VP of Engineering

**Middle Managers (Internal Nodes):**
- Each has a boss (parent) above
- Each can have up to 2 direct reports (children)

**Individual Contributors (Leaves):**
- No one reports to them
- The "bottom" of the tree

**This is a Binary Tree.** A hierarchical data structure where each node has at most two children (left and right), enabling efficient searching, sorting, and hierarchical operations.

---

## 2. The Core Concept

In coding interviews, binary trees are EXTREMELY common and test recursion understanding.

### Tree Terminology

| Term | Definition | Example |
|------|------------|---------|
| **Root** | Top node (no parent) | CEO |
| **Leaf** | Node with no children | IC |
| **Parent** | Node with children below | Manager |
| **Child** | Node with parent above | Direct report |
| **Height** | Longest path from root to leaf | Org levels |
| **Depth** | Distance from root to a node | How deep in org |
| **Subtree** | Any node and all its descendants | A department |

### Types of Binary Trees

| Type | Property | Height |
|------|----------|--------|
| **Full** | Every node has 0 or 2 children | - |
| **Complete** | All levels filled except last (left-aligned) | O(log N) |
| **Perfect** | All leaves at same level, all nodes have 2 children | O(log N) |
| **Balanced** | Height of subtrees differs by ≤ 1 | O(log N) |
| **BST** | Left < Parent < Right | O(log N) if balanced |
| **Degenerate** | Each node has only 1 child (like linked list) | O(N) ⚠️ |

### Tree Node Definition

```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(val: number = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
```

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "tree-dfs",
  "data": {
    "val": 1,
    "left": { "val": 2, "left": { "val": 4 }, "right": { "val": 5 } },
    "right": { "val": 3, "left": { "val": 6 }, "right": { "val": 7 } }
  }
}
```

---

## 4. Scenario A: Tree Traversals

**Real-Life Scenario:** Different ways to visit every employee in the org chart.

**Technical Problem:** Implement the four main tree traversal methods.

### TypeScript Implementation

```typescript
/**
 * FOUR TREE TRAVERSAL METHODS
 * 
 * Given tree:
 *        1
 *       / \
 *      2   3
 *     / \
 *    4   5
 */

/**
 * Inorder Traversal (Left → Root → Right)
 * Result: [4, 2, 5, 1, 3]
 * Use: BST produces sorted order!
 * 
 * @timeComplexity O(N)
 * @spaceComplexity O(H) where H = height
 */
function inorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];
  
  function traverse(node: TreeNode | null): void {
    if (!node) return;
    
    traverse(node.left);    // L
    result.push(node.val);  // Root
    traverse(node.right);   // R
  }
  
  traverse(root);
  return result;
}

/**
 * Preorder Traversal (Root → Left → Right)
 * Result: [1, 2, 4, 5, 3]
 * Use: Copy/serialize a tree, prefix expressions
 */
function preorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];
  
  function traverse(node: TreeNode | null): void {
    if (!node) return;
    
    result.push(node.val);  // Root
    traverse(node.left);    // L
    traverse(node.right);   // R
  }
  
  traverse(root);
  return result;
}

/**
 * Postorder Traversal (Left → Right → Root)
 * Result: [4, 5, 2, 3, 1]
 * Use: Delete a tree (children before parent), postfix expressions
 */
function postorderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];
  
  function traverse(node: TreeNode | null): void {
    if (!node) return;
    
    traverse(node.left);    // L
    traverse(node.right);   // R
    result.push(node.val);  // Root
  }
  
  traverse(root);
  return result;
}

/**
 * Level Order Traversal (BFS)
 * Result: [[1], [2, 3], [4, 5]]
 * Use: Find shortest path, level-by-level processing
 */
function levelOrderTraversal(root: TreeNode | null): number[][] {
  if (!root) return [];
  
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: number[] = [];
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}
```

### Traversal Summary

| Traversal | Order | Mnemonic | Use Case |
|-----------|-------|----------|----------|
| **Inorder** | L → Root → R | "LNR" | BST → sorted array |
| **Preorder** | Root → L → R | "NLR" | Copy tree, serialize |
| **Postorder** | L → R → Root | "LRN" | Delete tree, evaluate |
| **Level Order** | Level by level | "BFS" | Shortest path, levels |

---

## 5. Scenario B: Common Tree Problems

**Real-Life Scenario:** Operations frequently needed on hierarchical data.

**Technical Problem:** Implement maximum depth, inversion, and validation.

### TypeScript Implementation

```typescript
/**
 * Maximum Depth of Binary Tree
 * 
 * @param root - Root node
 * @returns Maximum depth (number of nodes from root to deepest leaf)
 * 
 * @timeComplexity O(N) - visit every node
 * @spaceComplexity O(H) - recursion stack
 */
function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  
  const leftDepth = maxDepth(root.left);
  const rightDepth = maxDepth(root.right);
  
  return 1 + Math.max(leftDepth, rightDepth);
}

/**
 * Invert Binary Tree (Mirror)
 * 
 * Swap left and right children at every node.
 * Famous: Homebrew author couldn't solve this on whiteboard!
 * 
 * @timeComplexity O(N)
 * @spaceComplexity O(H)
 */
function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  
  // Swap children
  [root.left, root.right] = [root.right, root.left];
  
  // Recursively invert subtrees
  invertTree(root.left);
  invertTree(root.right);
  
  return root;
}

/**
 * Same Tree - Check if two trees are identical
 * 
 * @timeComplexity O(N)
 * @spaceComplexity O(H)
 */
function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  // Both null = same
  if (!p && !q) return true;
  
  // One null, one not = different
  if (!p || !q) return false;
  
  // Values must match and subtrees must match
  return (
    p.val === q.val &&
    isSameTree(p.left, q.left) &&
    isSameTree(p.right, q.right)
  );
}

/**
 * Validate Binary Search Tree
 * 
 * Every node must satisfy: left < node < right
 * But also: ALL nodes in left subtree < node < ALL nodes in right subtree
 * 
 * @timeComplexity O(N)
 * @spaceComplexity O(H)
 */
function isValidBST(root: TreeNode | null): boolean {
  function validate(
    node: TreeNode | null,
    min: number,
    max: number
  ): boolean {
    if (!node) return true;
    
    // Current node must be within bounds
    if (node.val <= min || node.val >= max) {
      return false;
    }
    
    // Left subtree: all values must be < current
    // Right subtree: all values must be > current
    return (
      validate(node.left, min, node.val) &&
      validate(node.right, node.val, max)
    );
  }
  
  return validate(root, -Infinity, Infinity);
}

/**
 * Lowest Common Ancestor (LCA)
 * 
 * Find the deepest node that is ancestor of both p and q.
 * 
 * @timeComplexity O(N)
 * @spaceComplexity O(H)
 */
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode,
  q: TreeNode
): TreeNode | null {
  if (!root) return null;
  
  // If current node is p or q, it might be the LCA
  if (root === p || root === q) return root;
  
  // Search in left and right subtrees
  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);
  
  // If both sides found something, current node is LCA
  if (left && right) return root;
  
  // Otherwise, return whichever side found something
  return left ?? right;
}
```

---

## 6. Real World Applications 🌍

### 1. 📁 File Systems
```
Root (/)
├── home
│   ├── user1
│   └── user2
├── var
│   └── log
└── etc
```
Directory hierarchy is a tree!

### 2. 🗄️ Database Indexes (B-Trees, B+ Trees)
- Databases use tree structures for indexing
- O(log N) search instead of O(N) full table scan
- B+ Trees store data only in leaves

### 3. 🎮 Game AI (Decision Trees)
```
Is Enemy Nearby?
├── Yes → Is Health Low?
│         ├── Yes → Retreat
│         └── No → Attack
└── No → Explore
```

### 4. 🗜️ Compression (Huffman Coding)
- Assign shorter codes to frequent characters
- Build tree based on frequencies
- Used in ZIP, JPEG, MP3

### 5. 🔍 Expression Parsing
```
        +
       / \
      *   5
     / \
    3   4
    
Expression: (3 * 4) + 5
Evaluate bottom-up: 12 + 5 = 17
```

---

## 7. Complexity Analysis 🧠

### Operation Complexity

| Operation | Balanced Tree | Unbalanced (Worst) |
|-----------|---------------|-------------------|
| Search    | O(log N)      | O(N)              |
| Insert    | O(log N)      | O(N)              |
| Delete    | O(log N)      | O(N)              |
| Traversal | O(N)          | O(N)              |

### Space Complexity of Recursion

```
Balanced tree (height = log N):
  Space = O(log N) for call stack

Unbalanced tree (height = N):
  Space = O(N) for call stack
  
Iterative with explicit stack:
  Space = O(N) worst case
```

### Interview Tips 💡

1. **Think recursively:** "What's the base case? What's the recursive case?"
2. **Consider edge cases:** Empty tree, single node, unbalanced trees.
3. **Know your traversals:** "Inorder for BST gives sorted order."
4. **Iterative alternatives:** BFS uses queue, DFS uses stack.
5. **Time/space trade-off:** "Iterative uses explicit stack, same space but avoids stack overflow."
6. **Common follow-up:** "Can you do it iteratively?" (Use explicit stack)
