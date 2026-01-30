# Graphs 🕸️

## 1. The "Social Network" Analogy

Think of **Facebook friends**:
- Each person is a **node** (vertex).
- Each friendship is an **edge** connecting two nodes.
- Some relationships are **mutual** (undirected), others are **one-way** like Twitter follows (directed).

**This is a Graph.** A collection of nodes connected by edges, modeling relationships between entities.

---

## 2. The Core Concept

### Graph Representations

**Adjacency List (Most Common):**
```typescript
const graph: Map<string, string[]> = new Map([
  ['A', ['B', 'C']],
  ['B', ['A', 'D']],
  ['C', ['A']],
  ['D', ['B']]
]);
```

**Adjacency Matrix:**
```
    A  B  C  D
A [ 0, 1, 1, 0 ]
B [ 1, 0, 0, 1 ]
C [ 1, 0, 0, 0 ]
D [ 0, 1, 0, 0 ]
```

### Graph Types
| Type | Description |
|------|-------------|
| Directed | Edges have direction (A→B) |
| Undirected | Edges are bidirectional |
| Weighted | Edges have costs |
| Cyclic | Contains cycles |
| DAG | Directed Acyclic Graph |

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "topological-sort",
  "data": {
    "nodes": ["A", "B", "C", "D"],
    "edges": [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"]]
  }
}
```

---

## 4. Scenario A: BFS (Shortest Path)

```typescript
function bfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const queue: string[] = [start];
  const result: string[] = [];
  
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    
    visited.add(node);
    result.push(node);
    
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }
  
  return result;
}
```

---

## 5. Scenario B: DFS (Path Finding)

```typescript
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
```

---

## 6. Real World Applications 🌍

### 1. 🗺️ GPS Navigation (Dijkstra's algorithm)
### 2. 👥 Social Networks (Friend recommendations)
### 3. 🌐 Web Crawlers (Link traversal)
### 4. 📦 Package Dependencies (Topological sort)

---

## 7. Complexity Analysis 🧠

| Algorithm | Time | Space |
|-----------|------|-------|
| BFS | O(V + E) | O(V) |
| DFS | O(V + E) | O(V) |
| Dijkstra | O((V+E) log V) | O(V) |

V = Vertices, E = Edges
