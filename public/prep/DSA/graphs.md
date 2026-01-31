# Graphs 🕸️

## 1. The "City Map" Analogy

Imagine a city road map:

**Intersections (Nodes/Vertices):**
- Each intersection is a point on the map
- Could be a landmark, store, or just a junction

**Roads (Edges):**
- Connect intersections
- Some are one-way (directed), some are two-way (undirected)
- Some roads have different distances/traffic (weighted)

**Navigation:**
- "Find shortest route from home to work" → BFS/Dijkstra
- "Is there ANY path between two points?" → DFS
- "Visit all tourist spots efficiently" → Traveling Salesman

**This is a Graph.** A collection of nodes (vertices) connected by edges, modeling relationships, networks, and paths between entities.

---

## 2. The Core Concept

In coding interviews, graphs appear in MANY forms: social networks, dependencies, mazes, flight routes, etc.

### Graph Types

| Type | Description | Example |
|------|-------------|---------|
| **Directed** | Edges have direction (A→B) | Twitter follows |
| **Undirected** | Bidirectional edges | Facebook friends |
| **Weighted** | Edges have costs/distances | Road distances |
| **Unweighted** | All edges equal | Maze paths |
| **Cyclic** | Contains cycles (loops) | Road networks |
| **Acyclic** | No cycles | Family tree |
| **DAG** | Directed Acyclic Graph | Task dependencies |
| **Connected** | All nodes reachable | Single component |
| **Disconnected** | Some nodes unreachable | Multiple islands |

### Graph Representations

```typescript
// ADJACENCY LIST (Most common, space-efficient for sparse graphs)
// Space: O(V + E)
// Check edge: O(degree of node)
// Best for: Most real-world graphs (sparse)

const adjacencyList: Map<string, string[]> = new Map([
  ['A', ['B', 'C']],      // A connects to B and C
  ['B', ['A', 'D', 'E']], // B connects to A, D, and E
  ['C', ['A', 'F']],
  ['D', ['B']],
  ['E', ['B', 'F']],
  ['F', ['C', 'E']],
]);

// ADJACENCY MATRIX (Best for dense graphs)
// Space: O(V²)
// Check edge: O(1) ✓
// Best for: Dense graphs where V² ≈ E

//     A  B  C  D  E  F
const adjacencyMatrix = [
  [0, 1, 1, 0, 0, 0], // A
  [1, 0, 0, 1, 1, 0], // B
  [1, 0, 0, 0, 0, 1], // C
  [0, 1, 0, 0, 0, 0], // D
  [0, 1, 0, 0, 0, 1], // E
  [0, 0, 1, 0, 1, 0], // F
];

// EDGE LIST (For Kruskal's, simple storage)
// Space: O(E)
interface Edge {
  from: string;
  to: string;
  weight?: number;
}

const edgeList: Edge[] = [
  { from: 'A', to: 'B', weight: 4 },
  { from: 'A', to: 'C', weight: 2 },
  { from: 'B', to: 'D', weight: 3 },
  // ...
];
```

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "topological-sort",
  "data": {
    "numCourses": 4,
    "prerequisites": [[1, 0], [2, 0], [3, 1], [3, 2]]
  }
}
```

---

## 4. Scenario A: BFS - Shortest Path (Unweighted)

**Real-Life Scenario:** Find the minimum number of friend hops between two people on social media.

**Technical Problem:** Given a graph and a start node, find shortest path to all other nodes.

### TypeScript Implementation

```typescript
/**
 * Breadth-First Search (BFS)
 * 
 * Explore nodes level by level (like ripples in water).
 * Guarantees shortest path in UNWEIGHTED graphs.
 * 
 * @param graph - Adjacency list representation
 * @param start - Starting node
 * @returns Object with distances and parent pointers
 * 
 * @timeComplexity O(V + E) - visit each vertex and edge once
 * @spaceComplexity O(V) - queue and visited set
 */
function bfs(
  graph: Map<string, string[]>,
  start: string
): { distances: Map<string, number>; parents: Map<string, string | null> } {
  const distances = new Map<string, number>();
  const parents = new Map<string, string | null>();
  const visited = new Set<string>();
  const queue: string[] = [start];

  distances.set(start, 0);
  parents.set(start, null);
  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = distances.get(current)!;

    for (const neighbor of graph.get(current) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        distances.set(neighbor, currentDist + 1);
        parents.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return { distances, parents };
}

/**
 * Reconstruct shortest path from BFS result
 */
function getShortestPath(
  parents: Map<string, string | null>,
  start: string,
  end: string
): string[] {
  const path: string[] = [];
  let current: string | null = end;

  while (current !== null) {
    path.unshift(current);
    current = parents.get(current) ?? null;
  }

  return path[0] === start ? path : []; // Return empty if no path
}

// Example usage
const graph = new Map([
  ['A', ['B', 'C']],
  ['B', ['A', 'D', 'E']],
  ['C', ['A', 'F']],
  ['D', ['B']],
  ['E', ['B', 'F']],
  ['F', ['C', 'E']],
]);

const { distances, parents } = bfs(graph, 'A');
console.log(distances.get('F')); // 2 (A → C → F)
console.log(getShortestPath(parents, 'A', 'F')); // ['A', 'C', 'F']
```

### Sample Input and Output
```
Graph: A-B, A-C, B-D, B-E, C-F, E-F
Start: A

Distances from A:
  A: 0, B: 1, C: 1, D: 2, E: 2, F: 2

Shortest path A → F: ['A', 'C', 'F'] (length 2)
```

---

## 5. Scenario B: DFS - Cycle Detection & Connected Components

**Real-Life Scenario:** Detect circular dependencies in a build system, or count islands in a map.

**Technical Problem:** Find cycles in a directed graph and count connected components.

### TypeScript Implementation

```typescript
/**
 * Depth-First Search (DFS) - Traversal
 * 
 * Explore as deep as possible before backtracking.
 * Good for: path finding, cycle detection, topological sort.
 * 
 * @timeComplexity O(V + E)
 * @spaceComplexity O(V) - recursion stack
 */
function dfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function explore(node: string): void {
    if (visited.has(node)) return;
    visited.add(node);
    result.push(node);

    for (const neighbor of graph.get(node) || []) {
      explore(neighbor);
    }
  }

  explore(start);
  return result;
}

/**
 * Detect Cycle in Directed Graph
 * 
 * Uses three colors:
 * - WHITE (0): Unvisited
 * - GRAY (1): Currently being processed (in current DFS path)
 * - BLACK (2): Fully processed
 * 
 * Cycle exists if we revisit a GRAY node.
 */
function hasCycle(graph: Map<string, string[]>): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>();

  // Initialize all as WHITE
  for (const node of graph.keys()) {
    color.set(node, WHITE);
  }

  function dfs(node: string): boolean {
    color.set(node, GRAY); // Start processing

    for (const neighbor of graph.get(node) || []) {
      if (color.get(neighbor) === GRAY) {
        return true; // Back edge = cycle!
      }
      if (color.get(neighbor) === WHITE && dfs(neighbor)) {
        return true;
      }
    }

    color.set(node, BLACK); // Finished processing
    return false;
  }

  for (const node of graph.keys()) {
    if (color.get(node) === WHITE && dfs(node)) {
      return true;
    }
  }

  return false;
}

/**
 * Count Connected Components (Undirected Graph)
 * 
 * Number of isolated "islands" in the graph.
 * 
 * @timeComplexity O(V + E)
 */
function countComponents(graph: Map<string, string[]>): number {
  const visited = new Set<string>();
  let count = 0;

  function dfs(node: string): void {
    if (visited.has(node)) return;
    visited.add(node);
    for (const neighbor of graph.get(node) || []) {
      dfs(neighbor);
    }
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
      count++; // Found a new component
    }
  }

  return count;
}

/**
 * Number of Islands (Grid as Graph)
 * 
 * Classic interview problem: count land masses in a grid.
 * 
 * @timeComplexity O(M * N)
 * @spaceComplexity O(M * N) for DFS stack
 */
function numIslands(grid: string[][]): number {
  if (!grid.length || !grid[0].length) return 0;

  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  function dfs(r: number, c: number): void {
    // Out of bounds or water
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') {
      return;
    }

    grid[r][c] = '0'; // Mark as visited (sink the land)

    // Explore all 4 directions
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        islands++;
        dfs(r, c); // Sink the entire island
      }
    }
  }

  return islands;
}
```

---

## 6. Real World Applications 🌍

### 1. 🗺️ GPS Navigation (Dijkstra/A*)
```typescript
// Find shortest route considering road distances
dijkstra(cityGraph, 'New York', 'Los Angeles');
```

### 2. 👥 Social Networks
```typescript
// Find degrees of separation (Kevin Bacon number)
bfs(friendsGraph, 'Kevin Bacon');

// Friend recommendations (friends of friends)
function recommendFriends(user: string): string[] {
  const friends = graph.get(user) || [];
  const recommendations = new Set<string>();
  
  for (const friend of friends) {
    for (const fof of graph.get(friend) || []) {
      if (fof !== user && !friends.includes(fof)) {
        recommendations.add(fof);
      }
    }
  }
  return [...recommendations];
}
```

### 3. 📦 Package Dependencies (Topological Sort)
```typescript
// Determine correct installation order
// npm, pip, etc. use this
topologicalSort(dependencyGraph);
```

### 4. 🌐 Web Crawlers
```typescript
// BFS to crawl web pages level by level
function crawl(startUrl: string): void {
  const visited = new Set<string>();
  const queue = [startUrl];
  
  while (queue.length > 0) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    
    visited.add(url);
    const links = extractLinks(fetchPage(url));
    queue.push(...links);
  }
}
```

### 5. 🎮 Game AI (Pathfinding)
```typescript
// A* algorithm for game character navigation
aStar(gameMap, currentPosition, targetPosition);
```

---

## 7. Complexity Analysis 🧠

### Algorithm Comparison

| Algorithm | Time Complexity | Space | Use Case |
|-----------|-----------------|-------|----------|
| **BFS** | O(V + E) | O(V) | Shortest path (unweighted) |
| **DFS** | O(V + E) | O(V) | Path existence, cycle detection |
| **Dijkstra** | O((V+E) log V) | O(V) | Shortest path (weighted, no negative) |
| **Bellman-Ford** | O(V * E) | O(V) | Shortest path (negative weights OK) |
| **Floyd-Warshall** | O(V³) | O(V²) | All pairs shortest paths |
| **Topological Sort** | O(V + E) | O(V) | DAG ordering |
| **Kruskal's MST** | O(E log E) | O(V) | Minimum spanning tree |
| **Prim's MST** | O(E log V) | O(V) | Minimum spanning tree |

### Space Comparison

| Representation | Space | Edge Check | Iterate Neighbors |
|----------------|-------|------------|-------------------|
| Adjacency List | O(V + E) | O(degree) | O(degree) ✓ |
| Adjacency Matrix | O(V²) | O(1) ✓ | O(V) |
| Edge List | O(E) | O(E) | O(E) |

### Interview Tips 💡

1. **Identify graph structure:** "This is a graph problem—nodes are X, edges are Y."
2. **Choose traversal:** "BFS for shortest path, DFS for existence/exhaustive search."
3. **Representation:** "Adjacency list for sparse, matrix for dense graphs."
4. **Watch for cycles:** "Need to track visited nodes to avoid infinite loops."
5. **Consider weights:** "Unweighted → BFS, Weighted → Dijkstra."
6. **Edge cases:** "Disconnected components, self-loops, parallel edges."
