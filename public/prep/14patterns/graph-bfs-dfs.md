# Graph BFS & DFS 🕸️

## 1. The "City Explorer" Analogy

You're a tourist in a city of interconnected neighborhoods. You want to explore every reachable neighborhood from your hotel.

**BFS (Breadth-First):** Like ripples in a pond. First visit ALL neighborhoods 1 block away, then ALL 2 blocks away, then 3, etc. You use a **queue**. BFS finds the **shortest path** in unweighted graphs.

**DFS (Depth-First):** Like following a road until it dead-ends, then backtracking. Go as deep as possible along one path before trying alternatives. You use a **stack** (or recursion). DFS is great for **detecting cycles**, **finding connected components**, and **topological ordering**.

**Unlike trees, graphs can have cycles.** So you MUST track visited nodes — otherwise you'll loop forever.

---

## 2. The Core Concept

### Tree vs Graph Traversal
| Aspect | Tree | Graph |
|--------|------|-------|
| Cycles possible? | No | **Yes** — must track visited |
| Connected? | Always (one root) | Maybe not (multiple components) |
| Edge direction | Parent → Child | Can be directed or undirected |
| Representation | Node objects | **Adjacency list** or **adjacency matrix** |

### Graph Representation (Adjacency List)
```typescript
// Most common in interviews:
const graph: Map<number, number[]> = new Map();
graph.set(0, [1, 2]);    // Node 0 connects to 1, 2
graph.set(1, [0, 3]);    // Node 1 connects to 0, 3
graph.set(2, [0]);        // Node 2 connects to 0
graph.set(3, [1]);        // Node 3 connects to 1
```

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "tree-bfs",
  "data": {
    "val": 0,
    "left": {
      "val": 1,
      "left": { "val": 3 },
      "right": { "val": 4 }
    },
    "right": {
      "val": 2,
      "left": { "val": 5 }
    }
  }
}
```

---

## 4. Scenario A: Number of Islands (Grid BFS/DFS)
**Real-Life Scenario:** You're a satellite analyst studying aerial imagery. You need to count how many distinct **islands** exist in a map (connected land cells surrounded by water).

**Technical Problem:** Given an `m x n` 2D grid of `'1'`s (land) and `'0'`s (water), count the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

### TypeScript Implementation

```typescript
/**
 * Counts the number of islands in a 2D grid using BFS.
 *
 * Strategy: Scan grid. When we hit unvisited land ('1'),
 * start BFS to "flood fill" the entire island, marking
 * all connected land as visited. Increment island count.
 *
 * @param grid - 2D grid of '1' (land) and '0' (water).
 * @returns Number of islands.
 *
 * @timeComplexity O(M × N) - Visit each cell at most once.
 * @spaceComplexity O(min(M, N)) - BFS queue size in worst case.
 */
function numIslands(grid: string[][]): number {
    console.log(`\n--- numIslands ---`);
    if (grid.length === 0) return 0;

    const rows = grid.length;
    const cols = grid[0].length;
    let islands = 0;

    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    function bfs(startR: number, startC: number): void {
        const queue: [number, number][] = [[startR, startC]];
        grid[startR][startC] = '0'; // Mark visited by sinking
        console.log(`    BFS starting at (${startR},${startC})`);

        while (queue.length > 0) {
            const [r, c] = queue.shift()!;

            for (const [dr, dc] of directions) {
                const nr = r + dr;
                const nc = c + dc;

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === '1') {
                    console.log(`    Expanding to (${nr},${nc})`);
                    grid[nr][nc] = '0'; // Mark visited
                    queue.push([nr, nc]);
                }
            }
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                islands++;
                console.log(`  Found island #${islands} at (${r},${c})`);
                bfs(r, c); // Flood fill this island
            }
        }
    }

    console.log(`  Total islands: ${islands}`);
    return islands;
}

// Example Usage:
const grid = [
    ['1','1','0','0','0'],
    ['1','1','0','0','0'],
    ['0','0','1','0','0'],
    ['0','0','0','1','1']
];
console.log("Number of Islands:", numIslands(grid));
```

### Sample input and output
- **Input**: Grid (above)
- **Output**: `3` (top-left 2×2 island, center single cell, bottom-right 1×2 island)

---

## 5. Scenario B: Clone Graph (Graph DFS)
**Real-Life Scenario:** You're a DevOps engineer. You need to create a **deep copy** of a service dependency graph — every node and every edge must be duplicated without sharing references with the original.

**Technical Problem:** Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node contains a val and a list of neighbors.

### TypeScript Implementation

```typescript
class GraphNode {
    val: number;
    neighbors: GraphNode[];
    constructor(val: number, neighbors: GraphNode[] = []) {
        this.val = val;
        this.neighbors = neighbors;
    }
}

/**
 * Creates a deep copy of an undirected graph using DFS.
 *
 * Uses a HashMap to track: original node → cloned node.
 * This serves dual purpose: (1) avoid infinite loops (visited check)
 * and (2) reuse cloned nodes when we encounter them again.
 *
 * @param node - Entry point of the original graph.
 * @returns Entry point of the cloned graph.
 *
 * @timeComplexity O(V + E) - Visit every node and edge once.
 * @spaceComplexity O(V) - HashMap + recursion stack.
 */
function cloneGraph(node: GraphNode | null): GraphNode | null {
    console.log(`\n--- cloneGraph ---`);
    if (!node) { console.log(`  Null graph`); return null; }

    const cloned = new Map<GraphNode, GraphNode>();

    function dfs(original: GraphNode): GraphNode {
        // Already cloned? Return the clone.
        if (cloned.has(original)) {
            console.log(`  Node ${original.val} already cloned, reusing`);
            return cloned.get(original)!;
        }

        // Create clone (without neighbors yet)
        const copy = new GraphNode(original.val);
        cloned.set(original, copy);
        console.log(`  Cloning node ${original.val}, neighbors: [${original.neighbors.map(n => n.val)}]`);

        // Recursively clone all neighbors
        for (const neighbor of original.neighbors) {
            copy.neighbors.push(dfs(neighbor));
        }

        return copy;
    }

    return dfs(node);
}

// Example Usage:
const n1 = new GraphNode(1);
const n2 = new GraphNode(2);
const n3 = new GraphNode(3);
const n4 = new GraphNode(4);
n1.neighbors = [n2, n4];
n2.neighbors = [n1, n3];
n3.neighbors = [n2, n4];
n4.neighbors = [n1, n3];

const clone = cloneGraph(n1);
console.log("Original node 1 val:", n1.val);
console.log("Cloned node 1 val:", clone?.val);
console.log("Same reference?", n1 === clone); // false (deep copy!)
```

### Sample input and output
- **Input**: Graph `1--2, 2--3, 3--4, 4--1`
- **Output**: Deep copy with same structure but different object references

---

## 6. Real World Applications 🌍

### 1. 🗺️ GPS Navigation (Shortest Path)
Google Maps uses BFS (via Dijkstra's) on a graph of road intersections to find shortest routes. BFS guarantees the shortest path in unweighted graphs.

### 2. 🕸️ Web Crawlers
Search engines use BFS to crawl the web — start from seed URLs, visit all linked pages (level 1), then all pages linked from those (level 2), etc. DFS would get stuck going infinitely deep down one site.

### 3. 🧩 Social Network Analysis
LinkedIn's "degree of connection" (1st, 2nd, 3rd) is literally BFS levels from your profile node. "People you may know" uses BFS to find nodes 2-3 hops away.

### 4. 🔄 Garbage Collection
JVM and V8's garbage collectors use graph traversal (mark-and-sweep). Starting from root references, DFS marks all reachable objects. Unreachable objects are collected and memory is freed.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(V + E) ⚡
- **V** = vertices (nodes), **E** = edges.
- We visit every node once and examine every edge once.
- For a grid (M × N): V = M×N, E = 4×M×N → O(M × N).

### Space Complexity: O(V) 💾
- BFS: Queue holds up to O(V) nodes (worst case: fully connected).
- DFS: Recursion stack depth up to O(V) (worst case: long chain).
- Visited set: O(V).

### BFS vs DFS — When to Use Which?

| Use Case | BFS | DFS |
|----------|-----|-----|
| **Shortest path (unweighted)** | ✅ Guaranteed | ❌ Not guaranteed |
| **Cycle detection** | Works | ✅ More natural |
| **Connected components** | Works | ✅ Simpler code |
| **Topological sort** | ✅ Kahn's algorithm | ✅ DFS with post-order |
| **Memory** | O(width) | O(depth) |
| **When graph is wide** | ❌ High memory | ✅ Use DFS |
| **When graph is deep** | ✅ Use BFS | ❌ Stack overflow risk |

---

## 8. Interview Tips 💡

1. **Recognize the trigger words.** "Connected components", "shortest path", "number of islands", "clone graph", "reachability", "flood fill" — all Graph BFS/DFS. Grid problems (`m × n` with `'0'` and `'1'`) are graph problems in disguise.
2. **Always track visited — explain WHY.** Unlike trees, graphs can have cycles. Without a visited set, you'll infinite-loop. Use either a `Set<node>`, a boolean array, or mutate the input (mark visited cells as `'0'`). State this explicitly: *"I need a visited set because this is a graph, not a tree."*
3. **Adjacency list vs. Adjacency matrix — know the trade-off.** Adjacency list: O(V+E) space, O(degree) to check neighbors — use for sparse graphs. Adjacency matrix: O(V²) space, O(1) to check specific edge — use for dense graphs. In interviews, adjacency list is almost always preferred.
4. **Grid problems = implicit graph.** A grid is a graph where each cell has up to 4 neighbors (up/down/left/right). Use a `directions` array: `[[1,0],[-1,0],[0,1],[0,-1]]`. For diagonals, add `[[1,1],[1,-1],[-1,1],[-1,-1]]`. This pattern is reusable across all grid problems.
5. **BFS for shortest path, DFS for exploration.** BFS guarantees shortest path in unweighted graphs (each edge = weight 1). DFS is better for "explore all paths", "check if path exists", "detect cycles", and "topological sort". State your choice and justify it.
6. **Edge cases to mention proactively.** Disconnected graph (need to iterate all nodes as starting points), self-loops, empty graph, single node, and 2D grids with all `'1'`s or all `'0'`s.
7. **Bidirectional BFS for shortest path.** When finding shortest path between two specific nodes, start BFS from BOTH source and target simultaneously. They meet in the middle, reducing search space from O(b^d) to O(b^(d/2)) where b = branching factor, d = depth. Mention this for staff-level brownie points: *"For known source and target, I'd use bidirectional BFS to halve the search depth."*
