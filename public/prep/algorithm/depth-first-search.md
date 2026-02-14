# Depth-First Search (DFS) 🌲

## 1. The "Maze Explorer" Analogy

Imagine you're exploring a maze with a ball of yarn.

- You walk down **one path as far as possible** until you hit a dead end.
- You **backtrack** by following your yarn until you find an unexplored turn.
- You explore that new path fully, then backtrack again.
- You continue until the entire maze is explored.

Now imagine you're debugging a production issue. You see an error in Service A. You dig into Service A's code, which calls Service B, which calls Service C, which queries Database D. You follow the call chain **as deep as it goes** until you find the root cause. Then you backtrack and check alternate branches.

**This is DFS.** Go as deep as possible down one branch, then backtrack and explore other branches. It's the natural way to explore trees, recursion, and exhaustive search problems.

---

## 2. The Core Concept

In coding interviews, DFS is used for:
- **Path finding** (any path, not necessarily shortest)
- **Cycle detection** in graphs (the standard approach for directed graphs)
- **Topological sorting** (post-order DFS → reverse = topological order)
- **Connected components** (islands, regions)
- **Backtracking problems** (N-Queens, Sudoku, permutations)
- **Tree traversals** (pre-order, in-order, post-order)
- **Exhaustive search** (generate all subsets, all paths)

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

### When to Use DFS vs BFS

| Use DFS when... | Use BFS when... |
| :--- | :--- |
| You need ANY path (not shortest) | You need the SHORTEST path |
| Exhaustive search / backtracking | Minimum steps / minimum moves |
| Cycle detection in directed graphs | Level-by-level processing |
| Tree traversals (pre/in/post-order) | Multi-source shortest distance |
| Memory is limited (deep tree is cheaper than wide) | Graph is deep but narrow |

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

## 4. Scenario A: Number of Islands (Grid DFS — Most Asked!)

**Real-Life Scenario:** You're analyzing satellite images to count distinct land masses (islands) in an ocean. Each pixel is either land (1) or water (0). Connected land pixels form one island.

**Technical Problem:** Given a 2D grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

### TypeScript Implementation

```typescript
/**
 * Number of Islands — Grid DFS.
 * 
 * Strategy:
 *   Scan the grid cell by cell. When we find a '1' (land), that's a new island.
 *   Use DFS to "sink" the entire island (mark all connected '1's as '0'),
 *   so we don't count it again.
 * 
 * Why DFS is perfect here:
 *   We need to explore all connected land cells — exhaustive search.
 *   We don't need shortest path — just connectivity.
 *   DFS is simpler and uses O(max_depth) stack vs O(width) queue for BFS.
 * 
 * @param grid - 2D grid of '1' (land) and '0' (water)
 * @returns Number of distinct islands
 * 
 * @timeComplexity O(M × N) - Each cell visited at most once
 * @spaceComplexity O(M × N) - Worst case recursion depth (all land)
 */
function numIslands(grid: string[][]): number {
  if (grid.length === 0) return 0;
  
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  function dfs(r: number, c: number): void {
    // Boundary check + water check
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') {
      return;
    }

    // Sink this land cell (mark as visited)
    grid[r][c] = '0';

    // Explore all 4 directions
    dfs(r + 1, c); // Down
    dfs(r - 1, c); // Up
    dfs(r, c + 1); // Right
    dfs(r, c - 1); // Left
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;      // Found a new island
        dfs(r, c);    // Sink it entirely
      }
    }
  }

  return count;
}

// Example:
const grid = [
  ['1', '1', '0', '0', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '0'],
  ['0', '0', '0', '1', '1']
];
console.log("Islands:", numIslands(grid)); // Output: 3
// Island 1: top-left 2×2 block
// Island 2: center '1'
// Island 3: bottom-right 1×2 block
```

---

## 5. Scenario B: Detect Cycle in Directed Graph (3-Color DFS)

**Real-Life Scenario:** Detecting circular dependencies in a build system (A needs B, B needs C, C needs A = deadlock!). Also used in: spreadsheet circular reference detection, deadlock detection in databases, and import cycle detection in compilers.

**Technical Problem:** Given a directed graph, detect if it contains a cycle.

### TypeScript Implementation

```typescript
/**
 * Detect cycle in directed graph using DFS with 3-color marking.
 * 
 * The 3-Color technique:
 *   WHITE (0) = Unvisited — haven't touched this node yet
 *   GRAY  (1) = In progress — currently on the recursion stack (exploring descendants)
 *   BLACK (2) = Complete — all descendants fully explored
 * 
 * Cycle detection rule:
 *   If we encounter a GRAY node while exploring, it means we've found
 *   a node that's currently on our path — we've come back to it.
 *   This is a BACK EDGE — proof of a cycle.
 * 
 * Why we need 3 colors (not just visited/unvisited):
 *   With 2 states, we can't distinguish between:
 *     1. A node on our CURRENT path (reaching it again = cycle)
 *     2. A node fully processed by a PREVIOUS DFS call (not a cycle)
 *   GRAY = "I'm on your current path" → cycle!
 *   BLACK = "I was processed earlier, not on your path" → no cycle.
 * 
 * @param numNodes - Number of nodes (0 to n-1)
 * @param edges - Array of [from, to] edges
 * @returns True if cycle exists
 * 
 * @timeComplexity O(V + E) — Each node and edge visited once
 * @spaceComplexity O(V) — Color array + recursion stack
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

### Sample input and output
- Input: `numNodes=3, edges=[[0,1],[1,2],[2,0]]`
- Output: `true` (Cycle: 0→1→2→0)

---

## 6. Real World Applications 🌍

### 1. 🧩 Solving Puzzles (Backtracking)
Sudoku, N-Queens, and crossword puzzles use DFS with backtracking. Try a value, recurse deeper. If you hit a dead end, undo the choice and try the next option. The recursion call stack IS the DFS stack.

### 2. 📦 Dependency Resolution
Package managers (npm, pip, cargo) use topological sort (based on DFS post-order) to determine install order. DFS detects circular dependencies (cycles) that would cause infinite install loops.

### 3. 🗂️ File System Traversal
Recursively listing all files in a directory tree is DFS. `find . -name "*.ts"` walks depth-first into each subdirectory before moving to the next. The `du` (disk usage) command also uses DFS to calculate sizes bottom-up.

### 4. 🎮 Game Decision Trees (Minimax)
AI for games like chess, tic-tac-toe uses DFS to explore the game tree. Minimax with alpha-beta pruning uses DFS to evaluate all possible moves to a certain depth, then backtracks.

### 5. 🧬 Compiler Analysis
- **Dead code elimination:** DFS from entry point marks reachable code; unreachable code is dead.
- **Strongly Connected Components:** Tarjan's and Kosaraju's algorithms use DFS to find SCCs in directed graphs. Used in optimizing compilation units.
- **Import cycle detection:** When you `import A` and A imports B and B imports A, the compiler uses DFS cycle detection to report the error.

### 6. 🧠 JSON / Object Deep Clone
`JSON.parse(JSON.stringify(obj))` is essentially a DFS traversal of the object graph. Custom deep clone implementations use explicit DFS with a stack or recursion to handle circular references.

---

## 7. Complexity Analysis 🧠

### Time & Space Complexity

| Aspect | Complexity | Reason |
|--------|------------|--------|
| Time | O(V + E) | Visit each vertex and edge once |
| Space (recursive) | O(V) | Recursion stack depth + visited set |
| Space (iterative) | O(V) | Explicit stack + visited set |

For **grid DFS:** V = M × N, E = 4 × M × N → Time: O(M × N)

### DFS Traversal Orders (Trees)

| Order | Visit Sequence | Use Case | Interview Example |
|-------|---------------|----------|-------------------|
| **Preorder** | Root → Left → Right | Copy/serialize tree, create prefix expression | Serialize and Deserialize Binary Tree |
| **Inorder** | Left → Root → Right | BST sorted order, validate BST | Kth Smallest Element in BST |
| **Postorder** | Left → Right → Root | Delete tree, calculate size, evaluate expression | Binary Tree Maximum Path Sum |

```typescript
// ═══════════════════════════════════════════════
// RECURSIVE TRAVERSALS (Simple, interview default)
// ═══════════════════════════════════════════════

// Preorder: 1, 2, 4, 5, 3, 6, 7
function preorder(node: TreeNode | null): void {
  if (!node) return;
  console.log(node.val);  // Process FIRST
  preorder(node.left);
  preorder(node.right);
}

// Inorder: 4, 2, 5, 1, 6, 3, 7
function inorder(node: TreeNode | null): void {
  if (!node) return;
  inorder(node.left);
  console.log(node.val);  // Process MIDDLE
  inorder(node.right);
}

// Postorder: 4, 5, 2, 6, 7, 3, 1
function postorder(node: TreeNode | null): void {
  if (!node) return;
  postorder(node.left);
  postorder(node.right);
  console.log(node.val);  // Process LAST
}

// ═══════════════════════════════════════════════
// ITERATIVE INORDER (Common interview follow-up!)
// ═══════════════════════════════════════════════

/**
 * Iterative inorder traversal using explicit stack.
 * 
 * Interviewers often ask: "Can you do this without recursion?"
 * This is the standard approach using a stack.
 * 
 * Pattern:
 *   1. Go left as far as possible, pushing nodes onto stack
 *   2. Pop a node, process it
 *   3. Move to its right child (and repeat step 1)
 * 
 * Why it matters:
 *   - Avoids stack overflow for very deep trees
 *   - Shows mastery of stack-based traversal
 *   - Required for BST iterator (LeetCode 173)
 * 
 * @timeComplexity O(N) — Visit each node once
 * @spaceComplexity O(H) — H = height of tree
 */
function inorderIterative(root: TreeNode | null): number[] {
  const result: number[] = [];
  const stack: TreeNode[] = [];
  let current = root;

  while (current || stack.length > 0) {
    // Go left as far as possible
    while (current) {
      stack.push(current);
      current = current.left;
    }

    // Process the leftmost unprocessed node
    current = stack.pop()!;
    result.push(current.val);

    // Move to right subtree
    current = current.right;
  }

  return result;
}

// ═══════════════════════════════════════════════
// ITERATIVE PREORDER (Simplest iterative traversal)
// ═══════════════════════════════════════════════

/**
 * Iterative preorder using stack.
 * Simpler than inorder because we process immediately on pop.
 * 
 * Trick: Push RIGHT child first, then LEFT — so LEFT is processed first (LIFO).
 */
function preorderIterative(root: TreeNode | null): number[] {
  if (!root) return [];
  const result: number[] = [];
  const stack: TreeNode[] = [root];

  while (stack.length > 0) {
    const node = stack.pop()!;
    result.push(node.val);             // Process immediately

    if (node.right) stack.push(node.right); // Push right FIRST
    if (node.left) stack.push(node.left);   // Push left SECOND (processed first)
  }

  return result;
}
```

### DFS Edge Classification (Directed Graphs)

| Edge Type | Definition | During DFS | Significance |
|-----------|-----------|-----------|--------------|
| **Tree edge** | DFS discovers new node | WHITE → GRAY | Normal traversal |
| **Back edge** | Points to ancestor on current path | Current → GRAY node | **Cycle exists!** |
| **Forward edge** | Points to descendant (not direct child) | Current → BLACK descendant | Shortcut (skip levels) |
| **Cross edge** | Points to node in a different subtree | Current → BLACK non-ancestor | Between independent branches |

### Interview Tips 💡

1. **DFS for exhaustive search, BFS for shortest path:** If the problem says "find ANY path", "count ALL paths", "detect cycle", or "generate all permutations" — use DFS. If it says "minimum steps" or "shortest path" — use BFS. This is the fundamental decision.
2. **3-color cycle detection for directed graphs:** Use WHITE/GRAY/BLACK. A back edge (reaching a GRAY node) = cycle. Don't use a simple `visited` boolean for directed graphs — it can't distinguish between "on current path" and "already processed". (For undirected graphs, simple `visited` + parent tracking suffices.)
3. **Iterative inorder is a MUST-KNOW:** Interviewers frequently ask "can you do this without recursion?" The stack-based iterative inorder traversal is used in BST Iterator (LeetCode 173) and Kth Smallest in BST. Practice the pattern: go left as far as possible → pop → go right.
4. **Grid DFS — modify in-place as "visited":** For grid problems (number of islands), instead of maintaining a separate visited set, change `grid[r][c]` from `'1'` to `'0'` to mark it as visited. This saves O(M×N) space and is the standard approach.
5. **Recursion vs iteration trade-off:** Recursive DFS is cleaner and faster to code (use this in interviews by default). Switch to iterative with explicit stack if: (a) tree depth can be very large (stack overflow risk), (b) you need fine-grained control (like pausing/resuming traversal), or (c) the interviewer explicitly asks.
6. **Backtracking = DFS + undo:** Backtracking problems (N-Queens, Sudoku, permutations) are DFS where you make a choice at each node, recurse deeper, then UNDO the choice when backtracking. The key is the "undo" step: `choices.push(item); dfs(); choices.pop();`
7. **DFS on implicit graphs:** Many problems don't give you an explicit graph. Word Ladder, lock combinations, and puzzle states form **implicit graphs** where each state is a node and valid transitions are edges. Recognize these as DFS/BFS problems on state-space graphs.
