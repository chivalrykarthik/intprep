# Breadth-First Search (BFS) 🌊

## 1. The "Ripple Effect" Analogy

Imagine you drop a stone into a calm pond.

- **Ripples spread outward** in circles—first the center, then the next ring, then the next.
- Each ring is fully explored before the next one begins.
- Closer points are reached before farther points.

**This is BFS.** Starting from a source node, we explore ALL neighbors at the current depth before moving to nodes at the next depth level. It naturally finds the **shortest path** in unweighted graphs.

---

## 2. The Core Concept

In coding interviews, BFS is used for:
- **Shortest path** in unweighted graphs
- **Level-order traversal** of trees
- **Finding connected components**
- **Minimum steps** problems

### The Pattern

```
1. Start with source in a QUEUE
2. While queue is not empty:
   a. Dequeue front node
   b. Process it
   c. Enqueue all unvisited neighbors
   d. Mark neighbors as visited
```

### Key Data Structures
- **Queue:** FIFO order ensures level-by-level exploration
- **Visited Set:** Prevents revisiting nodes (avoids infinite loops)

---

## 3. Interactive Visualization 🎮
Click "Next" to see BFS exploring level by level!

```visualizer
{
  "type": "tree-bfs",
  "data": {
    "val": 1,
    "left": { "val": 2, "left": { "val": 4 }, "right": { "val": 5 } },
    "right": { "val": 3, "left": { "val": 6 }, "right": { "val": 7 } }
  }
}
```

---

## 4. Scenario A: Graph BFS (Shortest Path)

**Real-Life Scenario:** Finding the shortest route between two subway stations.

**Technical Problem:** Given an undirected graph, find the shortest path from source to target.

### TypeScript Implementation

```typescript
/**
 * BFS to find shortest path in an unweighted graph.
 * 
 * @param graph - Adjacency list representation
 * @param start - Starting node
 * @param target - Target node
 * @returns Shortest path as array of nodes, or empty if no path
 * 
 * @timeComplexity O(V + E) - Visit each vertex and edge once
 * @spaceComplexity O(V) - Queue and visited set
 */
function bfsShortestPath(
  graph: Map<string, string[]>,
  start: string,
  target: string
): string[] {
  if (start === target) return [start];
  
  const queue: string[] = [start];
  const visited = new Set<string>([start]);
  const parent = new Map<string, string>(); // To reconstruct path
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    for (const neighbor of graph.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
        
        // Found target - reconstruct path
        if (neighbor === target) {
          const path: string[] = [];
          let node: string | undefined = target;
          while (node !== undefined) {
            path.unshift(node);
            node = parent.get(node);
          }
          return path;
        }
      }
    }
  }
  
  return []; // No path found
}

// Example Usage:
const graph = new Map<string, string[]>([
  ['A', ['B', 'C']],
  ['B', ['A', 'D', 'E']],
  ['C', ['A', 'F']],
  ['D', ['B']],
  ['E', ['B', 'F']],
  ['F', ['C', 'E']]
]);

console.log("Graph: A-B-C-D-E-F");
console.log("Shortest A to F:", bfsShortestPath(graph, 'A', 'F')); // ['A', 'C', 'F']
console.log("Shortest A to D:", bfsShortestPath(graph, 'A', 'D')); // ['A', 'B', 'D']
```

### Sample input and output
- Input: Graph with nodes A-F, start='A', target='F'
- Output: `['A', 'C', 'F']` (2 edges, shortest path)

---

## 5. Scenario B: Level Order Traversal (Binary Tree)

**Real-Life Scenario:** Processing an org chart level by level (CEO → VPs → Managers → Employees).

**Technical Problem:** Given a binary tree, return the level order traversal of its nodes' values.

### TypeScript Implementation

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
 * Level order traversal using BFS.
 * 
 * @param root - Root of binary tree
 * @returns 2D array where each inner array is a level
 * 
 * @timeComplexity O(N) - Visit each node once
 * @spaceComplexity O(W) - W is max width of tree
 */
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: number[] = [];
    
    // Process all nodes at current level
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);
      
      // Add children for next level
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(currentLevel);
  }
  
  return result;
}

// Example: Tree structure
//       1
//      / \
//     2   3
//    / \   \
//   4   5   6

const root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);
root.right.right = new TreeNode(6);

console.log("Level Order:", levelOrder(root));
// Output: [[1], [2, 3], [4, 5, 6]]
```

---

## 6. Real World Applications 🌍

### 1. 🗺️ GPS Navigation
Finding shortest route between locations on a map (edges unweighted by time).

### 2. 👥 Social Networks
"6 degrees of separation" - finding shortest connection between two users.

### 3. 🕸️ Web Crawlers
Exploring websites level by level (homepage → linked pages → their linked pages).

### 4. 🎮 Game AI
Finding shortest path for NPCs in tile-based games (maze solving).

### 5. 🔌 Network Broadcasting
Sending messages to all nodes in minimum hops.

---

## 7. Complexity Analysis 🧠

### Time & Space Complexity

| Aspect | Complexity | Reason |
|--------|------------|--------|
| Time | O(V + E) | Visit each vertex and edge once |
| Space | O(V) | Queue + visited set |

V = Vertices (nodes), E = Edges

### BFS vs DFS Comparison

| Aspect | BFS | DFS |
|--------|-----|-----|
| Data Structure | Queue (FIFO) | Stack (LIFO) |
| Path Found | Shortest | Any valid |
| Memory (worst) | O(W) width | O(H) height |
| Use Case | Shortest path | Path existence, cycles |

### Common BFS Patterns

1. **Single-source shortest path:** Start from one node
2. **Multi-source BFS:** Start from multiple nodes simultaneously
3. **0-1 BFS:** Edges with weights 0 or 1 (use deque)
4. **Bidirectional BFS:** Search from both ends (faster for specific targets)

### Interview Tips 💡

- **Always mark visited BEFORE enqueueing** (not after dequeueing) to avoid duplicates
- **Track levels** using `queue.length` at start of each iteration
- **Reconstruct path** using a parent/predecessor map
- **Grid BFS:** Use directions array `[[0,1],[1,0],[0,-1],[-1,0]]`
