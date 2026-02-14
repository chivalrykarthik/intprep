# Union-Find (Disjoint Sets) 🔗

## 1. The "Social Network Circles" Analogy

Imagine a school with 100 students. Each student starts alone. Then friendships form:
- Alice befriends Bob → They're now in the same "friend circle".
- Bob befriends Charlie → Charlie joins Alice and Bob's circle (even though Alice and Charlie never spoke directly).
- Diana befriends Eve → A separate circle forms.

You constantly need to answer two questions:
1. **Find:** "Are Alice and Charlie in the same circle?" → **Yes** (connected through Bob).
2. **Union:** "Diana just befriended Bob" → Merge Diana's circle with Alice's circle.

**The Dumb Way:** Maintain a list of all members in each circle. When merging, copy all members from one list to another.
- Merge: **O(N)**. Query: **O(N)** to scan lists.

**The Smart Way (Union-Find):** Each circle has a **representative** (leader). Every member points to their leader (or to someone who points to the leader). To check if two people are in the same circle, just check if they have the same leader.
- **Find:** Follow parent pointers up to the root. With **path compression**: O(α(N)) ≈ **O(1)**.
- **Union:** Make one leader point to the other. With **union by rank**: O(α(N)) ≈ **O(1)**.
- **Boom.** Nearly constant time for both operations.

**This is Union-Find.** A data structure that tracks a collection of disjoint (non-overlapping) sets, supporting near-constant-time union and find operations.

---

## 2. The Core Concept

In coding interviews, we use this to solve **connected components**, **cycle detection in undirected graphs**, **network connectivity**, and **grouping/clustering** problems.

**The "BFS/DFS" Alternative:**
You could use BFS/DFS to check connectivity.
- Build a graph, traverse it.
- Works, but costs **O(V + E)** per query. If you have Q queries, total is **O(Q × (V + E))**.

**The "Union-Find" (Smart) Way:**
1. **Initialize:** Each element is its own parent (`parent[i] = i`).
2. **Find(x):** Follow parent pointers from x up to the root. **Path compression:** Make every node on the path point directly to the root.
3. **Union(x, y):** Find roots of x and y. If different, make one root a child of the other. **Union by rank:** Always attach the shorter tree under the taller tree.
- **Boom.** After M operations on N elements, total time is **O(M × α(N))** where **α** is the inverse Ackermann function — effectively constant (≤ 4 for any practical N).

### Two Key Optimizations
- **Path Compression:** During `find()`, make every visited node point directly to the root → flattens the tree.
- **Union by Rank/Size:** During `union()`, attach the smaller tree under the larger tree → keeps trees balanced.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the union-find structure evolve!

```visualizer
{
  "type": "tree-dfs",
  "data": {
    "val": 0,
    "left": {
      "val": 1,
      "left": { "val": 3 },
      "right": { "val": 4 }
    },
    "right": {
      "val": 2,
      "left": { "val": 5 },
      "right": { "val": 6 }
    }
  }
}
```

---

## 4. Scenario A: Number of Connected Components
**Real-Life Scenario:** You're a network engineer. You have N servers and a list of direct connections between them. You need to know: **how many isolated networks exist?** (Servers in the same network can communicate, but different networks cannot.)

**Technical Problem:** Given `n` nodes labeled from `0` to `n-1` and a list of undirected edges, find the number of connected components in the graph.

### TypeScript Implementation

```typescript
/**
 * Union-Find (Disjoint Set Union) Implementation.
 *
 * Uses Path Compression + Union by Rank for near O(1) amortized operations.
 */
class UnionFind {
    parent: number[];
    rank: number[];
    count: number; // Number of distinct components

    /**
     * @param n - Number of elements (0 to n-1).
     */
    constructor(n: number) {
        this.parent = Array.from({ length: n }, (_, i) => i); // Each is its own parent
        this.rank = new Array(n).fill(0); // All trees start with rank 0
        this.count = n; // Initially, N separate components
    }

    /**
     * Finds the root (representative) of the set containing x.
     * Uses path compression: every node on the path directly links to root.
     *
     * @timeComplexity O(α(N)) ≈ O(1) amortized.
     */
    find(x: number): number {
        if (this.parent[x] !== x) {
            // Path compression: recursively find root, then point directly to it
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    /**
     * Merges the sets containing x and y.
     * Uses union by rank: attach shorter tree under taller tree.
     *
     * @returns true if a merge happened (they were in different sets).
     * @timeComplexity O(α(N)) ≈ O(1) amortized.
     */
    union(x: number, y: number): boolean {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX === rootY) return false; // Already in the same set

        // Union by rank: attach smaller tree under larger
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++; // Only increment when equal
        }

        this.count--; // One fewer component
        return true;
    }

    /**
     * Checks if x and y are in the same set.
     */
    connected(x: number, y: number): boolean {
        return this.find(x) === this.find(y);
    }
}

/**
 * Counts connected components in an undirected graph.
 *
 * @param n - Number of nodes.
 * @param edges - Array of [u, v] edges.
 * @returns Number of connected components.
 *
 * @timeComplexity O(N + E × α(N)) ≈ O(N + E).
 * @spaceComplexity O(N) for the parent and rank arrays.
 */
function countComponents(n: number, edges: number[][]): number {
    const uf = new UnionFind(n);

    for (const [u, v] of edges) {
        uf.union(u, v);
    }

    return uf.count;
}

// Example Usage:
const n = 5;
const edges = [[0, 1], [1, 2], [3, 4]];
console.log("Nodes:", n);
console.log("Edges:", edges);
console.log("Connected Components:", countComponents(n, edges));
```

### Sample input and output
- **Input**: `n = 5`, `edges = [[0,1], [1,2], [3,4]]`
- **Output**: `2` (Component 1: {0,1,2}, Component 2: {3,4})

---

## 5. Scenario B: Accounts Merge (Real-World Grouping)
**Real-Life Scenario:** A user has multiple email accounts. Different records in your database might refer to the same person (same name, overlapping emails). You need to merge all records belonging to the same person.

**Technical Problem:** Given a list of accounts where `accounts[i] = [name, ...emails]`, merge accounts that share at least one common email. Return the merged accounts with emails sorted.

### TypeScript Implementation

```typescript
/**
 * Merges accounts that share common emails using Union-Find.
 *
 * Strategy: Treat each email as a node. If two emails appear
 * in the same account, union them. Then group all emails
 * by their root representative.
 *
 * @param accounts - Array of [name, email1, email2, ...].
 * @returns Merged accounts.
 *
 * @timeComplexity O(N × α(N)) where N = total emails across all accounts.
 * @spaceComplexity O(N) for Union-Find + mappings.
 */
function accountsMerge(accounts: string[][]): string[][] {
    const emailToId = new Map<string, number>();
    const emailToName = new Map<string, string>();
    let id = 0;

    // 1. Assign an ID to each unique email
    for (const account of accounts) {
        const name = account[0];
        for (let i = 1; i < account.length; i++) {
            if (!emailToId.has(account[i])) {
                emailToId.set(account[i], id++);
            }
            emailToName.set(account[i], name);
        }
    }

    // 2. Union emails within the same account
    const uf = new UnionFind(id);

    for (const account of accounts) {
        const firstEmailId = emailToId.get(account[1])!;
        for (let i = 2; i < account.length; i++) {
            uf.union(firstEmailId, emailToId.get(account[i])!);
        }
    }

    // 3. Group emails by their root
    const groups = new Map<number, string[]>();
    for (const [email, emailId] of emailToId) {
        const root = uf.find(emailId);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root)!.push(email);
    }

    // 4. Build result
    const result: string[][] = [];
    for (const [_, emails] of groups) {
        emails.sort(); // Sort emails alphabetically
        const name = emailToName.get(emails[0])!;
        result.push([name, ...emails]);
    }

    return result;
}

// Example Usage:
const accounts = [
    ["John", "john@mail.com", "john_work@mail.com"],
    ["John", "john@mail.com", "john_home@mail.com"],
    ["Mary", "mary@mail.com"]
];
console.log("Accounts:", accounts);
console.log("Merged:", accountsMerge(accounts));
```

### Sample input and output
- **Input**: Two "John" accounts sharing `john@mail.com`, one "Mary" account
- **Output**: `[["John", "john@mail.com", "john_home@mail.com", "john_work@mail.com"], ["Mary", "mary@mail.com"]]`

---

## 6. Real World Applications 🌍

### 1. 🌐 Network Connectivity
ISPs and cloud providers use Union-Find to track which nodes in a network can reach each other. When a new link is added, `union()`. When checking reachability, `find()`. This is critical for fault detection — if two data centers become disconnected, the component count changes.

### 2. 🗺️ Kruskal's Minimum Spanning Tree
Kruskal's algorithm builds an MST by processing edges in order of weight. For each edge, it uses Union-Find to check if the endpoints are already connected (would create a cycle). If not, add the edge and union them. This runs in O(E log E) — dominated by the edge sort.

### 3. 🖼️ Image Processing (Percolation)
In physics simulations and image segmentation, Union-Find determines if a path exists from one side to another through "open" pixels. Each open pixel is unioned with its neighbors. Checking percolation is a single `connected()` call.

### 4. 📧 Duplicate Detection
De-duplication systems (email merging, customer identity resolution) use Union-Find to group records that share common identifiers. If Record A shares an email with Record B, and Record B shares a phone with Record C, all three belong to the same person.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(α(N)) per operation ⚡

The **inverse Ackermann function α(N)** grows so slowly that it's effectively constant:

| N | α(N) |
|---|------|
| 1 | 0 |
| 2 - 4 | 1 |
| 5 - 16 | 2 |
| 17 - 65535 | 3 |
| 65536 - 2^65536 | 4 |

For any N you'll encounter in practice (even 10^18), α(N) ≤ 4.

- **Without optimizations:** Find is O(N) in the worst case (long chain).
- **With union by rank only:** O(log N).
- **With both path compression + union by rank:** **O(α(N)) ≈ O(1)**.

### Space Complexity: O(N) 💾
- Two arrays: `parent[N]` and `rank[N]`.

---

## 8. Interview Tips 💡

1. **Recognize the trigger words.** "Connected components", "group items", "union/merge groups", "same network", "redundant connection", "accounts merge" — all Union-Find. Any problem involving dynamic grouping (groups form over time as edges are added) is a Union-Find candidate.
2. **Always implement BOTH optimizations.** Path compression alone: O(log N) amortized. Union by rank alone: O(log N). **Both together**: O(α(N)) ≈ O(1). Never implement one without the other. Write both in the constructor: *"I'll use path compression and union by rank for near-constant time operations."*
3. **Union-Find vs. BFS/DFS — know when to use which.** Union-Find: best when edges arrive dynamically (stream of connections) and you repeatedly query connectivity. BFS/DFS: best for one-time traversals (shortest path, all paths). If the problem says "process edges one by one and answer queries", Union-Find wins.
4. **The `connected()` method is just `find(x) === find(y)`.** Don't overcomplicate it. And `count` (number of components) = start at N, decrement on each successful `union()`. Track this in the class — many problems ask for component count.
5. **Edge cases to mention proactively.** Self-loops (union(x, x) — should return false, already same set), redundant edges (union two nodes already connected), single node, and the case where `count` drops to 1 (all nodes connected — "is the graph fully connected?" check).
6. **Accounts Merge is the real-world showcase.** Each email is a node. Emails in the same account are unioned. After processing, `find()` groups emails into merged accounts. This is a great example to mention: *"I've seen this in production — deduplication systems use Union-Find for identity resolution across databases."*
7. **Kruskal's MST is the advanced connection.** Kruskal's Minimum Spanning Tree = sort edges by weight + Union-Find to add edges without creating cycles. Total: O(E log E + E × α(V)) ≈ O(E log E). If asked about MST, implement Kruskal's using your Union-Find class. This combines graph theory + data structure knowledge.
