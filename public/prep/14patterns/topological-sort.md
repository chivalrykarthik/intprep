# Topological Sort 📉

## 1. The "College Prerequisites" Analogy

Imagine you want to graduate.
- To take **Calculus II**, you must finish **Calculus I**.
- To take **Calculus I**, you must finish **Pre-Calc**.
- To take **Physics**, you also need **Calculus I**.

You can't just take classes in random order. You have to find a sequence where every class comes *after* its prerequisites.
1. Start with classes that have **zero** prerequisites (Freshman classes).
2. Once you finish those, they "unlock" the next level.
3. Repeat until you graduate.

**This is Topological Sort.** It linearly orders vertices in a directed graph such that for every edge `A -> B`, node `A` comes before `B`. (Note: This only works if there are no cycles/circular dependencies!).

---

## 2. The Core Concept

In coding interviews, we use this to solve **dependency resolution**, **scheduling**, or **ordering** problems.

**The "Brute Force" (Dumb) Way:**
Try every permutation of tasks ($N!$). Check if valid.
- Complexity: **O(N!)**. Impossible.

**The "Kahn's Algorithm" (Smart) Way:**
1. Calculate **In-Degree** (number of dependencies) for every node.
2. Put all nodes with **0 In-Degree** in a Queue (Available tasks).
3. While Queue is not empty:
   - Pop a node. Add to Sorted List.
   - "Complete" the task: Remove it from graph, reducing neighbors' In-Degree by 1.
   - If a neighbor hits 0, add to Queue.
- **Boom.** You get a valid order in **O(V+E)**.

---

## 3. Interactive Visualization 🎮
Click "Next" to unlock courses and graduate!

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

## 4. Scenario A: Course Schedule (Can we finish?)
**Real-Life Scenario:** You check your curriculum to see if it's even *possible* to graduate, or if the dean made a mistake and created a loop (e.g., A requires B, B requires A).

**Technical Problem:** There are `numCourses` courses labeled `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [ai, bi]` indicates that you must take course `bi` first if you want to take course `ai`. Return `true` if you can finish all courses.

### TypeScript Implementation

```typescript
/**
 * Detects if a valid topological sort exists (i.e., NO cycles).
 * 
 * @param numCourses - Total courses.
 * @param prerequisites - Dependency edges [course, pre-req].
 * @returns true if possible, false if cycle detected.
 * 
 * @timeComplexity O(V + E) - Visit every vertex and edge once.
 * @spaceComplexity O(V + E) - Adjacency list + Indegree array.
 */
function canFinish(numCourses: number, prerequisites: number[][]): boolean {
    const inDegree = new Array(numCourses).fill(0);
    const adj = new Map<number, number[]>();

    // 1. Build Graph & In-Degree
    for (const [course, pre] of prerequisites) {
        // pre -> course
        if (!adj.has(pre)) adj.set(pre, []);
        adj.get(pre)!.push(course);
        inDegree[course]++;
    }

    // 2. Add sources (0 dependencies) to queue
    const queue: number[] = [];
    for (let i = 0; i < numCourses; i++) {
        if (inDegree[i] === 0) queue.push(i);
    }

    let completedCourses = 0;

    // 3. Process
    while (queue.length > 0) {
        const pre = queue.shift()!;
        completedCourses++;

        const neighbors = adj.get(pre) || [];
        for (const neighbor of neighbors) {
            inDegree[neighbor]--;
            // If prerequisites fulfilled, unlock
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        }
    }

    return completedCourses === numCourses;
}

// Example Usage:
const numCourses = 2;
const prerequisites = [[1, 0]]; // To take 1, needs 0
console.log("Courses:", numCourses);
console.log("Prereqs:", prerequisites);
console.log("Can Finish?", canFinish(numCourses, prerequisites));

const cyclePrereqs = [[1, 0], [0, 1]];
console.log("Cycle Prereqs:", cyclePrereqs);
console.log("Can Finish?", canFinish(2, cyclePrereqs));
```

---

## 5. Scenario B: Alien Dictionary (Ordering)
**Real-Life Scenario:** You find a book written by aliens. The words are sorted via *their* alphabet, which is different from English. You try to deduce the order of their alphabet (e.g., does 'z' come before 'a'?).

**Technical Problem:** Given a list of words sorted lexicographically by the rules of the alien language, derive the order of letters in this language.

### TypeScript Implementation

```typescript
/**
 * Derives order using Topological Sort.
 */
function alienOrder(words: string[]): string {
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    // Init graph
    for (const word of words) {
        for (const char of word) {
            inDegree.set(char, 0);
            adj.set(char, []);
        }
    }

    // Build edges by comparing adjacent words
    for (let i = 0; i < words.length - 1; i++) {
        const w1 = words[i];
        const w2 = words[i + 1];
        
        // Check for prefix edge case (abc vs ab) - invalid if w2 is prefix of w1
        if (w1.length > w2.length && w1.startsWith(w2)) return "";

        for (let j = 0; j < Math.min(w1.length, w2.length); j++) {
            if (w1[j] !== w2[j]) {
                // w1[j] comes BEFORE w2[j]
                adj.get(w1[j])!.push(w2[j]);
                inDegree.set(w2[j], inDegree.get(w2[j])! + 1);
                break; // Only the first difference matters
            }
        }
    }

    // Kahn's Algo
    const queue: string[] = [];
    for (const [char, deg] of inDegree) {
        if (deg === 0) queue.push(char);
    }

    let result = "";
    while (queue.length > 0) {
        const char = queue.shift()!;
        result += char;

        for (const neighbor of adj.get(char)!) {
            inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
            if (inDegree.get(neighbor) === 0) queue.push(neighbor);
        }
    }

    return result;
}

// Example Usage:
const alienWords = ["wrt","wrf","er","ett","rftt"];
console.log("Alien Dictionary:", alienWords);
console.log("Derived Order:", alienOrder(alienWords));
```

---

## 6. Real World Applications 🌍

### 1. 🏗️ Build Systems (Webpack/Make)
When you run `npm build`, the tool figures out that `utils.js` needs to be compiled before `main.js` because `main` imports `utils`. It builds a dependency graph and topologically sorts it to execute builds in the right order.

### 2. 🗓️ Task Scheduling
Project management tools (Jira, Asana). If Task C depends on Task B, and Task B depends on Task A, the critical path is A -> B -> C. Identifying the sequence is a topological sort problem.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(V + E) ⚡
- **V**: Vertices (Interviews/Classes).
- **E**: Edges (Prerequisites).
- We process every node and every dependency exactly once.

### Space Complexity: O(V + E) 💾
- To store the Adjacency List and In-Degree array.
