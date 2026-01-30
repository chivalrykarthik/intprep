# Binary Trees 🌳

## 1. The "Family Tree" Analogy

Imagine your **family tree**:
- **Root:** Your great-grandparent at the top.
- **Children:** Each person has at most 2 children (left and right).
- **Leaves:** Family members with no children (yet).

**This is a Binary Tree.** Each node has at most two children. Trees enable O(log N) operations when balanced.

---

## 2. The Core Concept

### Tree Terminology
- **Root:** Top node (no parent)
- **Leaf:** Node with no children
- **Height:** Longest path from root to leaf
- **Depth:** Distance from root to a node

### Types of Binary Trees

| Type | Property |
|------|----------|
| Full | Every node has 0 or 2 children |
| Complete | All levels filled except possibly last |
| Perfect | All leaves at same level |
| BST | Left < Parent < Right |

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

## 4. Scenario A: Invert Binary Tree

```typescript
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number) {
    this.val = val ?? 0;
    this.left = null;
    this.right = null;
  }
}

/**
 * @timeComplexity O(N)
 * @spaceComplexity O(H) where H is height
 */
function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  
  return root;
}
```

---

## 5. Scenario B: Maximum Depth

```typescript
function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

---

## 6. Real World Applications 🌍

### 1. 📁 File Systems (Directory hierarchy)
### 2. 🗄️ Database Indexes (B-Trees)
### 3. 🎮 Game AI (Decision trees)
### 4. 🗜️ Compression (Huffman coding)

---

## 7. Complexity Analysis 🧠

| Operation | Balanced | Unbalanced |
|-----------|----------|------------|
| Search | O(log N) | O(N) |
| Insert | O(log N) | O(N) |
| Delete | O(log N) | O(N) |

### Traversal Orders
- **Inorder (L-Root-R):** Sorted order for BST
- **Preorder (Root-L-R):** Copy tree structure
- **Postorder (L-R-Root):** Delete tree
- **Level Order (BFS):** Level by level
