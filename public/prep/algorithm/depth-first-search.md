# Depth-First Search (DFS) 🌲

## 1. The "Maze Explorer" Analogy

Imagine you're exploring a maze with a ball of yarn.

- You walk down **one path as far as possible** until you hit a dead end.
- You **backtrack** by following your yarn until you find an unexplored turn.
- You explore that new path fully, then backtrack again.
- You continue until the entire maze is explored.

**This is DFS.** Go as deep as possible down one branch, then backtrack and explore other branches. It's great for exploring all possibilities and detecting cycles.

---

## 2. The Core Concept

In coding interviews, DFS is used for:
- **Path finding** (any path, not necessarily shortest)
- **Cycle detection** in graphs
- **Topological sorting**
- **Connected components**
- **Backtracking problems**

### The Pattern (Recursive)

```
function dfs(node):
    if node is null or visited:
        return
    
    mark node as visited
    process(node)
    
    for each neighbor of node:
        dfs(neighbor)
```

### The Pattern (Iterative with Stack)

```
stack.push(start)
while stack is not empty:
    node = stack.pop()
    if node not visited:
        mark as visited
        process(node)
        push all neighbors to stack
```

---

## 3. Interactive Visualization 🎮
Click "Next" to see DFS exploring depth-first!

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

## 4. Scenario A: Path Finding in Graph

**Real-Life Scenario:** Checking if you can travel from city A to city B with existing roads.

**Technical Problem:** Given a directed graph, determine if there's a path from source to destination.

### TypeScript Implementation

```typescript
/**
 * DFS to check path existence (Recursive).
 * 
 * @param graph - Adjacency list representation
 * @param source - Starting node
 * @param destination - Target node
 * @returns True if path exists
 * 
 * @timeComplexity O(V + E) - Visit each vertex and edge once
 * @spaceComplexity O(V) - Recursion stack + visited set
 */
function hasPathDFS(
  graph: Map<number, number[]>,
  source: number,
  destination: number
): boolean {
  const visited = new Set<number>();
  
  function dfs(node: number): boolean {
    if (node === destination) return true;
    if (visited.has(node)) return false;
    
    visited.add(node);
    
    for (const neighbor of graph.get(node) || []) {
      if (dfs(neighbor)) return true;
    }
    
    return false;
  }
  
  return dfs(source);
}

/**
 * DFS iterative version using stack.
 */
function hasPathDFSIterative(
  graph: Map<number, number[]>,
  source: number,
  destination: number
): boolean {
  const stack: number[] = [source];
  const visited = new Set<number>();
  
  while (stack.length > 0) {
    const node = stack.pop()!;
    
    if (node === destination) return true;
    if (visited.has(node)) continue;
    
    visited.add(node);
    
    for (const neighbor of graph.get(node) || []) {
      stack.push(neighbor);
    }
  }
  
  return false;
}

// Example Usage:
const graph = new Map<number, number[]>([
  [0, [1, 2]],
  [1, [3]],
  [2, [3]],
  [3, [4]],
  [4, []]
]);

console.log("Path 0 → 4:", hasPathDFS(graph, 0, 4)); // true
console.log("Path 3 → 0:", hasPathDFS(graph, 3, 0)); // false (directed graph)
```

### Sample input and output
- Input: Directed graph 0→1→3→4, 0→2→3, source=0, dest=4
- Output: `true`

---

## 5. Scenario B: Detect Cycle in Directed Graph

**Real-Life Scenario:** Detecting circular dependencies in a build system (A needs B, B needs C, C needs A = deadlock!).

**Technical Problem:** Given a directed graph, detect if it contains a cycle.

### TypeScript Implementation

```typescript
/**
 * Detect cycle in directed graph using DFS with coloring.
 * 
 * Colors: WHITE(0)=unvisited, GRAY(1)=in progress, BLACK(2)=done
 * Cycle exists if we visit a GRAY node (back edge).
 * 
 * @param numNodes - Number of nodes (0 to n-1)
 * @param edges - Array of [from, to] edges
 * @returns True if cycle exists
 * 
 * @timeComplexity O(V + E)
 * @spaceComplexity O(V)
 */
function hasCycle(numNodes: number, edges: number[][]): boolean {
  // Build adjacency list
  const graph = new Map<number, number[]>();
  for (let i = 0; i < numNodes; i++) {
    graph.set(i, []);
  }
  for (const [from, to] of edges) {
    graph.get(from)!.push(to);
  }
  
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Array(numNodes).fill(WHITE);
  
  function dfs(node: number): boolean {
    color[node] = GRAY; // Mark as "in progress"
    
    for (const neighbor of graph.get(node) || []) {
      if (color[neighbor] === GRAY) {
        // Found back edge = cycle!
        return true;
      }
      if (color[neighbor] === WHITE && dfs(neighbor)) {
        return true;
      }
    }
    
    color[node] = BLACK; // Mark as "complete"
    return false;
  }
  
  // Check all nodes (graph may be disconnected)
  for (let i = 0; i < numNodes; i++) {
    if (color[i] === WHITE && dfs(i)) {
      return true;
    }
  }
  
  return false;
}

// Example with cycle: 0 → 1 → 2 → 0
console.log("Has cycle:", hasCycle(3, [[0,1], [1,2], [2,0]])); // true

// Example without cycle: 0 → 1 → 2
console.log("Has cycle:", hasCycle(3, [[0,1], [1,2]])); // false
```

---

## 6. Real World Applications 🌍

### 1. 🧩 Solving Puzzles
Sudoku, N-Queens, and maze solving use DFS with backtracking.

### 2. 📦 Dependency Resolution
Package managers (npm, pip) use topological sort (based on DFS) to determine install order.

### 3. 🗂️ File System Traversal
Recursively listing all files in a directory tree.

### 4. 🎮 Game Decision Trees
AI exploring all possible moves in games like chess.

### 5. 🧬 Compiler Analysis
Detecting unused code, finding strongly connected components.

---

## 7. Complexity Analysis 🧠

### Time & Space Complexity

| Aspect | Complexity | Reason |
|--------|------------|--------|
| Time | O(V + E) | Visit each vertex and edge once |
| Space | O(V) | Recursion stack + visited set |

### DFS Traversal Orders (Trees)

| Order | Visit Sequence | Use Case |
|-------|---------------|----------|
| **Preorder** | Root → Left → Right | Copy tree, serialize |
| **Inorder** | Left → Root → Right | BST sorted order |
| **Postorder** | Left → Right → Root | Delete tree, evaluate expression |

```typescript
// Preorder: 1, 2, 4, 5, 3, 6, 7
function preorder(node: TreeNode | null): void {
  if (!node) return;
  console.log(node.val);  // Process first
  preorder(node.left);
  preorder(node.right);
}

// Inorder: 4, 2, 5, 1, 6, 3, 7
function inorder(node: TreeNode | null): void {
  if (!node) return;
  inorder(node.left);
  console.log(node.val);  // Process middle
  inorder(node.right);
}

// Postorder: 4, 5, 2, 6, 7, 3, 1
function postorder(node: TreeNode | null): void {
  if (!node) return;
  postorder(node.left);
  postorder(node.right);
  console.log(node.val);  // Process last
}
```

### Interview Tips 💡

- **Recursive is cleaner** but risks stack overflow for deep graphs
- **Iterative with stack** for very deep structures
- **Cycle detection:** Use color/state (white/gray/black) for directed graphs
- **Grid DFS:** Modify grid in-place as "visited" or use a set
- **Backtracking:** DFS + undo choice after returning
