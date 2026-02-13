# Topological Sort 📦

## 1. The "University Course Planner" Analogy

You're a freshman planning all 4 years of college courses.

**The Problem:**
- To take "Machine Learning", you must first complete "Linear Algebra" AND "Statistics."
- To take "Statistics", you must first complete "Calculus."
- To take "Calculus", you must first complete "Pre-Calculus."
- You need to find a valid order to take ALL courses, respecting every prerequisite.

**The "Brute Force" Way:**
Try every random order. For each order, check if all prerequisites are satisfied. With 40 courses, that's 40! = 10^47 orderings. Your computer explodes.

**The "Topological Sort" Way:**
1. Find courses with **no prerequisites** (e.g., Pre-Calculus, English 101). Take those first.
2. Remove those courses from the prerequisite lists.
3. Now some new courses have no remaining prerequisites. Take those next.
4. Repeat until all courses are scheduled.

**This is Topological Sort.** Order nodes in a Directed Acyclic Graph (DAG) such that for every edge A → B, A comes before B.

---

## 2. The Core Concept

In coding interviews, Topological Sort is used for:
- **Task scheduling** with dependencies
- **Build system ordering** (compile A before B)
- **Course scheduling** (prerequisites)
- **Detecting cycles** in directed graphs (impossible to topologically sort a cyclic graph)

### Two Approaches

**Kahn's Algorithm (BFS — Recommended for Interviews):**
```
1. Calculate in-degree of every node
2. Add all nodes with in-degree 0 to queue
3. While queue not empty:
   a. Dequeue node, add to result
   b. For each neighbor, decrement in-degree
   c. If neighbor's in-degree becomes 0, enqueue it
4. If result.length < total nodes → CYCLE EXISTS
```

**DFS-Based (Post-order + Reverse):**
```
1. Run DFS from each unvisited node
2. After exploring all neighbors, push node to stack
3. Pop all from stack → topological order
4. Detect cycle using GRAY/BLACK coloring
```

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────┐
│         TOPOLOGICAL SORT — Kahn's Algorithm              │
│                                                          │
│   Course Prerequisites (DAG):                            │
│                                                          │
│   PreCalc ──▶ Calculus ──▶ Statistics ──▶ ML             │
│                    │                      ▲              │
│                    └──▶ LinearAlg ────────┘              │
│                                                          │
│   In-degrees:  PreCalc=0, Calc=1, Stats=1,              │
│                LinAlg=1, ML=2                            │
│                                                          │
│   Step 1: Queue=[PreCalc]          Result=[]             │
│   Step 2: Process PreCalc          Result=[PreCalc]      │
│           Calc in-degree: 1→0 ✓                          │
│   Step 3: Queue=[Calc]             Result=[PreCalc]      │
│   Step 4: Process Calc             Result=[PC, Calc]     │
│           Stats: 1→0 ✓, LinAlg: 1→0 ✓                   │
│   Step 5: Queue=[Stats, LinAlg]    Result=[PC, C]        │
│   Step 6: Process Stats            Result=[PC, C, S]     │
│           ML: 2→1                                        │
│   Step 7: Process LinAlg           Result=[PC,C,S,LA]    │
│           ML: 1→0 ✓                                      │
│   Step 8: Process ML               Result=[PC,C,S,LA,ML]│
│                                                          │
│   ✅ All 5 nodes processed. No cycle!                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Course Schedule (Cycle Detection)

**Real-Life Scenario:** A university checks if students can complete all courses given a list of prerequisites. If there's a circular dependency (A requires B, B requires A), it's impossible.

**Technical Problem:** Given `numCourses` and `prerequisites[i] = [a, b]` meaning "to take course a, you must first take course b", determine if it's possible to finish all courses.

### TypeScript Implementation

```typescript
/**
 * canFinish — Detects if a valid topological ordering exists.
 * Uses Kahn's Algorithm (BFS-based).
 * 
 * If we can process ALL nodes → no cycle → return true.
 * If some nodes are left → cycle exists → return false.
 * 
 * @param numCourses - Total number of courses
 * @param prerequisites - Array of [course, prerequisite] pairs
 * @returns True if all courses can be finished
 * 
 * @timeComplexity O(V + E) — Process each node and edge once
 * @spaceComplexity O(V + E) — Adjacency list + in-degree array
 */
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  // 1. Build adjacency list and in-degree array
  const graph: number[][] = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course); // prereq → course
    inDegree[course]++;
  }

  // 2. Add all nodes with in-degree 0 to queue
  const queue: number[] = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  // 3. BFS — process nodes level by level
  let processed = 0;

  while (queue.length > 0) {
    const node = queue.shift()!;
    processed++;

    for (const neighbor of graph[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // 4. If all nodes processed → no cycle
  return processed === numCourses;
}

// Example 1: No cycle
console.log(canFinish(4, [[1,0], [2,0], [3,1], [3,2]])); // true
// Order: 0 → 1, 2 → 3

// Example 2: Cycle exists!  
console.log(canFinish(2, [[0,1], [1,0]])); // false
// 0 needs 1, 1 needs 0 → circular dependency
```

---

## 5. Scenario B: Find Valid Build Order (Full Topological Sort)

**Real-Life Scenario:** A build system needs to compile/package modules in the correct order. Module A depends on B and C, so B and C must be built first.

**Technical Problem:** Given tasks and dependencies, return ONE valid execution order. Return empty array if no valid order exists (cycle).

### TypeScript Implementation

```typescript
/**
 * findBuildOrder — Returns a valid topological ordering.
 * 
 * Kahn's Algorithm: BFS-based topological sort.
 * Also returns the actual ORDER, not just yes/no.
 * 
 * @param numTasks - Total number of tasks
 * @param deps - Array of [task, dependency] pairs
 * @returns Valid execution order, or empty array if cycle
 * 
 * @timeComplexity O(V + E)
 * @spaceComplexity O(V + E)
 */
function findBuildOrder(numTasks: number, deps: number[][]): number[] {
  const graph: number[][] = Array.from({ length: numTasks }, () => []);
  const inDegree = new Array(numTasks).fill(0);

  for (const [task, dep] of deps) {
    graph[dep].push(task);
    inDegree[task]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < numTasks; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const order: number[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);

    for (const neighbor of graph[node]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Cycle check: if not all nodes processed, cycle exists
  return order.length === numTasks ? order : [];
}

/**
 * DFS-Based Topological Sort — Alternative approach.
 * 
 * Uses post-order DFS: after visiting ALL descendants,
 * push the node to stack. Reverse = topological order.
 * 
 * Also detects cycles using WHITE/GRAY/BLACK coloring.
 */
function topologicalSortDFS(numTasks: number, deps: number[][]): number[] {
  const graph: number[][] = Array.from({ length: numTasks }, () => []);
  for (const [task, dep] of deps) {
    graph[dep].push(task);
  }

  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Array(numTasks).fill(WHITE);
  const result: number[] = [];
  let hasCycle = false;

  function dfs(node: number): void {
    if (hasCycle) return;
    color[node] = GRAY; // Currently processing

    for (const neighbor of graph[node]) {
      if (color[neighbor] === GRAY) {
        hasCycle = true; // Back edge = cycle!
        return;
      }
      if (color[neighbor] === WHITE) {
        dfs(neighbor);
      }
    }

    color[node] = BLACK; // Done processing
    result.push(node);   // Post-order: add AFTER all descendants
  }

  for (let i = 0; i < numTasks; i++) {
    if (color[i] === WHITE) dfs(i);
  }

  return hasCycle ? [] : result.reverse(); // Reverse post-order
}

// Usage Example
const tasks = 6;
const dependencies = [[1,0], [2,0], [3,1], [3,2], [4,3], [5,4]];
// 0 → 1 → 3 → 4 → 5
// 0 → 2 → 3

console.log("Build Order (BFS):", findBuildOrder(tasks, dependencies));
// [0, 1, 2, 3, 4, 5] or [0, 2, 1, 3, 4, 5] (both valid!)

console.log("Build Order (DFS):", topologicalSortDFS(tasks, dependencies));
```

---

## 6. Real World Applications 🌍

### 1. 📦 Package Managers (npm, pip, cargo)
When you run `npm install`, the package manager topologically sorts all dependencies. Package A depends on B and C? Install B and C first.

### 2. 🏗️ Build Systems (Webpack, Gradle, Make)
Compilers determine file compilation order. If `main.ts` imports `utils.ts`, `utils.ts` must be compiled first. Circular imports? Build fails — topological sort detects the cycle.

### 3. 📊 Spreadsheet Cell Evaluation
When cell A1 references B1, and B1 references C1, the spreadsheet uses topological sort to determine evaluation order. Circular reference? Error!

### 4. 🗄️ Database Migration
Schema migrations must run in order. Migration 3 depends on Migration 2 which depends on Migration 1. Out-of-order execution corrupts the database.

### 5. 🔧 CI/CD Pipeline Orchestration
Multi-stage build pipelines: "Run tests AFTER build completes, deploy AFTER tests pass." GitHub Actions, GitLab CI, and Jenkins all model this as a DAG.

---

## 7. Complexity Analysis 🧠

### Time & Space Complexity

| Algorithm | Time | Space | Pros / Cons |
|-----------|------|-------|-------------|
| **Kahn's (BFS)** | O(V + E) | O(V + E) | ✅ Easy to code, ✅ detects cycles, ✅ level-by-level |
| **DFS Post-order** | O(V + E) | O(V + E) | ✅ Compact code, ❌ needs cycle detection separately |

### Kahn's vs DFS: When to Use Which?

| Feature | Kahn's (BFS) | DFS |
|---------|:-:|:-:|
| Cycle detection | ✅ Built-in (count nodes) | Requires GRAY coloring |
| Parallel tasks | ✅ Level = parallel batch | ❌ Not natural |
| Implementation | Slightly longer | Shorter |
| Interview preference | ✅ Recommended | Fine too |

### Interview Tips 💡

1. **Kahn's for interviews:** It's more intuitive and cycle detection is automatic (if `processed < V`, there's a cycle). DFS requires additional coloring logic.
2. **DAG = no cycle = topological sort exists.** If the graph has a cycle, topological sort is impossible. Always mention this.
3. **Multiple valid orderings:** There can be many valid topological orders. The algorithm picks one based on queue processing order. If asked for lexicographically smallest order, use a min-heap instead of a queue.
4. **Parallel execution levels:** In Kahn's, all nodes in the queue at the same time can be processed in parallel. This is how CI/CD pipelines determine which jobs can run simultaneously.
5. **Common interview problems:** Course Schedule I (can finish?), Course Schedule II (return order), Alien Dictionary (derive alphabet from sorted words), Build System ordering.
6. **In-degree shortcut:** If you need to find "starting nodes" in any dependency problem, find nodes with in-degree 0.
7. **Only for DAGs:** Topological sort ONLY works on Directed Acyclic Graphs. Undirected graphs or cyclic graphs cannot be topologically sorted.
