# Breadth-First Search (BFS) 🌊

## 1. The "Ripple Effect" Analogy

Imagine you drop a stone into a calm pond.

- **Ripples spread outward** in circles—first the center, then the next ring, then the next.
- Each ring is fully explored before the next one begins.
- Closer points are reached before farther points.

Now imagine you're looking for a lost dog in a neighborhood. You wouldn't walk to the edge of town first. You'd **search nearby streets first**, then expand outward block by block. If the dog is 2 blocks away, you find it before checking blocks 10 miles out.

**This is BFS.** Starting from a source node, we explore ALL neighbors at the current depth before moving to nodes at the next depth level. It naturally finds the **shortest path** in unweighted graphs because it visits nodes in order of increasing distance.

---

## 2. The Core Concept

In coding interviews, BFS is used for:
- **Shortest path** in unweighted graphs (the #1 reason to use BFS over DFS)
- **Level-order traversal** of trees
- **Finding connected components**
- **Minimum steps / minimum moves** problems (chess knight, word ladder)
- **Multi-source BFS** (rotten oranges, walls and gates)
- **Bidirectional BFS** (meeting in the middle for faster search)

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
- **Visited Set:** Prevents revisiting nodes (avoids infinite loops in graphs with cycles)

### BFS Guarantee
In an **unweighted graph**, BFS finds the shortest path from source to every reachable node. This is because BFS visits nodes in order of their distance (hop count) from the source. By the time a node is dequeued, the shortest path to it has already been found.

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

## 4. Scenario A: Graph BFS (Shortest Path with Path Reconstruction)

**Real-Life Scenario:** Finding the shortest route between two subway stations in a metro network.

**Technical Problem:** Given an undirected graph, find the shortest path from source to target and return the actual path.

### TypeScript Implementation

```typescript
/**
 * BFS to find shortest path in an unweighted graph.
 * 
 * How it works:
 *  1. Enqueue the start node, mark it as visited.
 *  2. For each dequeued node, check all neighbors.
 *  3. If a neighbor is the target, reconstruct the path using the parent map.
 *  4. If not, mark the neighbor as visited and enqueue it.
 * 
 * Why BFS guarantees shortest path:
 *  BFS explores nodes in order of increasing distance (hop count).
 *  The FIRST time we reach the target, we've taken the fewest edges to get there.
 *  No shorter path can exist because all shorter paths would have been explored first.
 * 
 * @param graph - Adjacency list representation
 * @param start - Starting node
 * @param target - Target node
 * @returns Shortest path as array of nodes, or empty if no path
 * 
 * @timeComplexity O(V + E) - Visit each vertex and edge once
 * @spaceComplexity O(V) - Queue, visited set, and parent map
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

## 5. Scenario B: Multi-Source BFS (Rotten Oranges — LeetCode 994)

**Real-Life Scenario:** A virus starts spreading from multiple infection sites simultaneously. Each minute, every infected cell spreads to its adjacent cells. How many minutes until all cells are infected (or some remain safe)?

**Technical Problem:** Given a grid where `0 = empty`, `1 = fresh orange`, `2 = rotten orange`, every minute each rotten orange rots adjacent fresh oranges. Return the minimum minutes until no fresh oranges remain, or -1 if impossible.

### TypeScript Implementation

```typescript
/**
 * Multi-source BFS — Rotten Oranges.
 * 
 * KEY INSIGHT: Instead of running BFS from each rotten orange separately,
 * we start with ALL rotten oranges in the queue simultaneously.
 * This is called "Multi-source BFS" — it's like BFS from a virtual
 * super-source connected to all starting nodes.
 * 
 * Why it works:
 *   All rotten oranges "expand" in parallel, just like dropping
 *   multiple stones in a pond — all ripples propagate simultaneously.
 * 
 * Pattern (applicable to many problems):
 *   1. Collect all starting nodes into the initial queue
 *   2. BFS level by level (each level = 1 time unit)
 *   3. Track the number of levels processed
 * 
 * @param grid - 2D grid of oranges
 * @returns Minimum minutes to rot all oranges, or -1 if impossible
 * 
 * @timeComplexity O(M × N) — Each cell processed at most once
 * @spaceComplexity O(M × N) — Queue can hold all cells
 */
function orangesRotting(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: [number, number][] = [];
  let freshCount = 0;

  // Step 1: Find all rotten oranges (multiple sources) and count fresh
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]); // Rotten → add to queue
      if (grid[r][c] === 1) freshCount++;        // Fresh → count
    }
  }

  if (freshCount === 0) return 0; // No fresh oranges to rot

  // Step 2: BFS from ALL rotten oranges simultaneously
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up
  let minutes = 0;

  while (queue.length > 0 && freshCount > 0) {
    const levelSize = queue.length; // Process all oranges that rot at this minute
    minutes++;

    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue.shift()!;

      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;

        // Check bounds and if it's a fresh orange
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;         // Rot it
          freshCount--;
          queue.push([nr, nc]);     // Add to queue for next minute
        }
      }
    }
  }

  return freshCount === 0 ? minutes : -1; // -1 if some fresh oranges are unreachable
}

// Example:
const grid = [
  [2, 1, 1],
  [1, 1, 0],
  [0, 1, 1]
];
console.log("Minutes:", orangesRotting(grid)); // Output: 4

// Minute 0: Rotten at (0,0)
// Minute 1: (0,1), (1,0) rot
// Minute 2: (0,2), (1,1) rot
// Minute 3: (2,1) rots
// Minute 4: (2,2) rots → All done!
```

---

## 6. Real World Applications 🌍

### 1. 🗺️ GPS Navigation (Unweighted)
Finding shortest route between locations on a map when all edges have equal cost (same road length). For weighted edges (different road lengths), Dijkstra's algorithm is used instead.

### 2. 👥 Social Networks — "Degrees of Separation"
"6 degrees of separation" — finding shortest connection between two users. LinkedIn's "2nd-degree connections" and "3rd-degree connections" are literally BFS levels from your profile.

### 3. 🕸️ Web Crawlers
Search engines like Google crawl websites using BFS. Start at seed URLs (homepage), follow all links on each page (level 1), then follow links on those pages (level 2). BFS ensures pages closer to the homepage are crawled first (usually more important).

### 4. 🎮 Game AI — Minimum Moves
Finding the minimum number of moves for a chess knight to reach a target square. Each valid knight move is an edge, and BFS finds the shortest sequence of moves. Also used for maze solving and puzzle games (15-puzzle, Rubik's cube solver).

### 5. 🔌 Network Broadcasting (Flooding)
When a router sends a broadcast message, it uses BFS-like flooding: send to all direct neighbors, they forward to their neighbors, and so on. The message reaches all nodes in minimum hops. Protocols like OSPF use this for link-state advertisements.

### 6. 🧬 Word Ladder (NLP / Spell Check)
Transform "COLD" → "WARM" by changing one letter at a time, where each intermediate word must be a valid dictionary word. BFS finds the minimum number of transformations. This is the basis of some spell-check suggestion algorithms.

---

## 7. Complexity Analysis 🧠

### Time & Space Complexity

| Aspect | Complexity | Reason |
|--------|------------|--------|
| Time | O(V + E) | Visit each vertex and edge once |
| Space | O(V) | Queue + visited set |

V = Vertices (nodes), E = Edges

For **grid BFS:** V = M × N (cells), E = 4 × M × N (each cell has ≤ 4 neighbors)
→ Time: O(M × N), Space: O(M × N)

### BFS vs DFS Comparison

| Aspect | BFS | DFS |
|--------|-----|-----|
| Data Structure | Queue (FIFO) | Stack (LIFO) / Recursion |
| Path Found | **Shortest** (in unweighted graphs) | Any valid path |
| Memory (typical) | O(W) — width of level | O(H) — height/depth |
| Memory (worst) | O(V) — all nodes in queue | O(V) — all nodes on stack |
| When to use | Shortest path, min steps, level-by-level | Path existence, cycles, exhaustive search |
| On trees | Level-order traversal | Pre/In/Post-order traversal |

### Common BFS Patterns

| Pattern | Description | Example Problems |
|---------|-------------|-----------------|
| **Single-source BFS** | Start from ONE node, find shortest paths to all others | Shortest path, word ladder |
| **Multi-source BFS** | Start from MULTIPLE nodes simultaneously | Rotten oranges, walls and gates, 01-matrix |
| **Level-by-level BFS** | Process entire level before moving to next, track level number | Level-order traversal, minimum depth of tree |
| **0-1 BFS** | Edges with weight 0 or 1 — use deque instead of queue | Minimum cost path with 0/1 weights |
| **Bidirectional BFS** | Search from BOTH ends and meet in the middle | Word ladder (optimized), shortest path between two nodes |
| **Grid BFS** | BFS on a 2D grid with 4-directional or 8-directional movement | Maze shortest path, flood fill, island counting |

### BFS on a Grid — Template

```typescript
/**
 * Grid BFS Template — Reusable for many 2D grid problems.
 * 
 * Pattern:
 *   1. Add starting cell(s) to queue
 *   2. Mark as visited (modify grid or use visited set)
 *   3. Process level by level with 4-directional movement
 */
function bfsGrid(grid: number[][], startRow: number, startCol: number): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // R, D, L, U
  const queue: [number, number, number][] = [[startRow, startCol, 0]]; // [row, col, distance]
  const visited = new Set<string>();
  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const [r, c, dist] = queue.shift()!;

    // Process current cell (check if target, etc.)

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      const key = `${nr},${nc}`;

      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols
          && !visited.has(key) && grid[nr][nc] !== -1) {
        visited.add(key);
        queue.push([nr, nc, dist + 1]);
      }
    }
  }

  return -1; // Target not reachable
}
```

### Interview Tips 💡

1. **BFS = shortest path in unweighted graphs:** This is the #1 reason to choose BFS over DFS. If a problem asks "minimum number of steps/moves/transformations," think BFS immediately. DFS does NOT guarantee shortest path.
2. **Always mark visited BEFORE enqueueing:** A common bug is marking visited when dequeueing instead of enqueueing. This causes the same node to be added to the queue multiple times, wasting time and potentially giving wrong results. Mark visited at enqueue time.
3. **Track levels using `queue.length` snapshot:** To process level by level, snapshot `const levelSize = queue.length` at the start of each iteration, then loop exactly `levelSize` times. This is essential for problems like "minimum depth", "level-order traversal", and "rotten oranges".
4. **Multi-source BFS — don't loop BFS:** For problems with multiple starting points (rotten oranges, walls-and-gates, 01-matrix), add ALL starting nodes to the queue before starting BFS. Do NOT run separate BFS from each source — that's O(K × V) instead of O(V).
5. **Grid BFS — use a directions array:** Define `const dirs = [[0,1],[1,0],[0,-1],[-1,0]]` and loop through it. For 8-directional movement, add diagonals. Never hard-code 4 separate if-statements — it's error-prone and ugly.
6. **Bidirectional BFS halves the search space:** For problems like Word Ladder where you know both start and end, search from both sides and meet in the middle. This reduces complexity from O(b^d) to O(b^(d/2)) where b = branching factor and d = depth.
7. **BFS uses O(width) memory, DFS uses O(height):** For wide, shallow graphs (social networks), BFS uses more memory. For deep, narrow graphs (file systems), DFS uses more. In balanced trees, both are O(N). Choose based on the graph shape, but default to BFS for shortest path problems.
