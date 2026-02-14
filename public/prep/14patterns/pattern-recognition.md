# Pattern Recognition — Master Quick Reference 🎯

## 1. The "Detective's Field Guide" Analogy

Imagine you're a detective arriving at a crime scene. You don't start dusting for fingerprints before you look at the scene. First, you scan for **clues** — the body position, the weapon, the entry point — and within seconds, your training kicks in: *"This is a burglary gone wrong"* or *"This is an inside job."*

Pattern recognition in coding interviews works the same way. You read the problem, scan for **signal words and structural clues**, and within 30 seconds, your brain should say: *"This is a Sliding Window problem"* or *"This is Topological Sort."*

**This guide is your field manual.** It maps every common signal to the right pattern so you can identify the approach *before* you write a single line of code.

---

## 2. The Master Decision Flowchart

When you read a problem, answer these questions **in order**:

```
START: Read the problem statement
│
├─ Is the input a TREE?
│   ├─ Need level-by-level processing? ──────────➤ Tree BFS
│   ├─ Need root-to-leaf paths / subtree values? ➤ Tree DFS
│   └─ Need median from stream? ─────────────────➤ Two Heaps
│
├─ Is the input a GRAPH?
│   ├─ Has dependencies / ordering? ─────────────➤ Topological Sort
│   ├─ Need shortest path (unweighted)? ─────────➤ Graph BFS
│   ├─ Need cycle detection / all paths? ────────➤ Graph DFS
│   ├─ Need dynamic connectivity / components? ──➤ Union-Find
│   └─ Need shortest path (weighted)? ──────────➤ Dijkstra's (see Algorithm section)
│
├─ Is the input a LINKED LIST?
│   ├─ Need cycle detection / middle node? ──────➤ Fast & Slow Pointers
│   ├─ Need reversal (full / partial / groups)? ─➤ In-Place Reversal of Linked List
│   └─ Need merge K sorted lists? ──────────────➤ K-Way Merge
│
├─ Is the input a SORTED ARRAY?
│   ├─ Need to find a target / boundary? ────────➤ Modified Binary Search
│   ├─ Need pair that sums to target? ──────────➤ Two Pointers
│   └─ Is it rotated? ──────────────────────────➤ Modified Binary Search
│
├─ Is the input an UNSORTED ARRAY?
│   ├─ Values in range [0, N] or [1, N]? ───────➤ Cyclic Sort
│   ├─ Need contiguous subarray / substring? ────➤ Sliding Window
│   ├─ Need "next greater/smaller" element? ─────➤ Monotonic Stack
│   ├─ Need "top K" / "Kth largest"? ───────────➤ Top K Elements (Heap)
│   ├─ Need all subsets / combinations? ─────────➤ Subsets / Backtracking
│   └─ Need all permutations? ──────────────────➤ Backtracking
│
├─ Is the input a set of INTERVALS?
│   └─ Need merge / overlap / schedule? ─────────➤ Merge Intervals
│
├─ Is the input a 2D MATRIX?
│   ├─ Need traversal (spiral / rotate / search)? ➤ Matrix Patterns
│   ├─ Need connected regions (islands)? ────────➤ Graph BFS/DFS
│   └─ Sorted matrix search? ───────────────────➤ Modified Binary Search
│
├─ Is it a STRING problem?
│   ├─ Need prefix matching / autocomplete? ─────➤ Trie
│   ├─ Need substring / anagram? ────────────────➤ Sliding Window
│   └─ Need palindrome check? ──────────────────➤ Two Pointers
│
├─ Is it an OPTIMIZATION problem?
│   ├─ "Minimum / Maximum / Count all ways"? ────➤ Dynamic Programming
│   ├─ Locally optimal = globally optimal? ──────➤ Greedy
│   └─ Need to search over possible answers? ────➤ Binary Search on Answer Space
│
├─ Is it a BIT-LEVEL problem?
│   └─ O(1) space constraint / XOR tricks? ──────➤ Bit Manipulation
│
└─ Need to try ALL possibilities with pruning?
    └─ Constraints / "all valid" configurations? ➤ Backtracking
```

---

## 3. The Master Trigger Table

### Scan the problem for these words → Instantly know the pattern:

| When You See These Words... | Use This Pattern | Time | Space |
|---|---|---|---|
| "contiguous subarray", "substring of length K", "maximum sum of subarray", "smallest window containing" | **Sliding Window** | O(N) | O(1) |
| "sorted array", "pair sum", "remove duplicates in-place", "palindrome", "container with most water" | **Two Pointers** | O(N) | O(1) |
| "cycle detection", "circular linked list", "find the middle", "happy number" | **Fast & Slow Pointers** | O(N) | O(1) |
| "overlapping intervals", "merge meetings", "schedule conflicts", "insert interval" | **Merge Intervals** | O(N log N) | O(N) |
| "numbers in range 1 to N", "missing number", "find duplicate", "first missing positive" | **Cyclic Sort** | O(N) | O(1) |
| "reverse linked list", "reverse between positions", "reverse in groups of K" | **In-Place Reversal** | O(N) | O(1) |
| "all subsets", "power set", "all combinations", "all subsequences" | **Subsets** | O(N × 2^N) | O(N × 2^N) |
| "sorted array search", "rotated sorted", "find peak", "search boundary", "minimum speed to finish" | **Modified Binary Search** | O(log N) | O(1) |
| "level order", "level by level", "minimum depth", "right side view", "zigzag level" | **Tree BFS** | O(N) | O(W) |
| "root-to-leaf path", "path sum", "all paths", "maximum depth", "diameter", "LCA" | **Tree DFS** | O(N) | O(H) |
| "find median", "streaming data", "balance two halves" | **Two Heaps** | O(log N) per op | O(N) |
| "top K", "Kth largest", "K most frequent", "K closest" | **Top K Elements** | O(N log K) | O(K) |
| "K sorted lists", "merge sorted", "smallest range from K lists" | **K-Way Merge** | O(N log K) | O(K) |
| "prerequisites", "dependencies", "ordering", "build order", "alien dictionary" | **Topological Sort** | O(V + E) | O(V + E) |
| "next greater element", "next smaller", "daily temperatures", "histogram rectangle" | **Monotonic Stack** | O(N) | O(N) |
| "connected components", "islands", "shortest path", "flood fill", "clone graph" | **Graph BFS/DFS** | O(V + E) | O(V) |
| "minimum cost", "maximum profit", "number of ways", "longest subsequence" | **Dynamic Programming** | Varies | Varies |
| "maximum non-overlapping", "schedule to maximize", "jump game", "assign cookies" | **Greedy** | O(N log N) | O(1) |
| "all permutations", "N-Queens", "Sudoku", "generate all valid", "word search" | **Backtracking** | Exponential | O(N) |
| "prefix search", "autocomplete", "dictionary", "word search board" | **Trie** | O(L) per op | O(N × L) |
| "single number", "XOR", "power of 2", "count bits", "O(1) space + pairs" | **Bit Manipulation** | O(N) | O(1) |
| "group items", "union/merge", "same network", "redundant connection" | **Union-Find** | O(α(N)) per op | O(N) |
| "spiral", "rotate image", "search sorted matrix", "set zeroes", "transpose" | **Matrix Patterns** | O(M × N) | O(1) |

---

## 4. Pattern Selector by Problem Category

### 🔢 Array Problems

| Problem Type | Primary Pattern | Alternative |
|---|---|---|
| Find pair with target sum | Two Pointers (sorted) | HashMap (unsorted) |
| Maximum subarray sum | Sliding Window (positive) | Kadane's DP (mixed) |
| Find duplicate/missing (range 1-N) | Cyclic Sort | XOR / Math |
| Top K elements | Heap (Top K) | QuickSelect |
| Next greater element | Monotonic Stack | Brute force O(N²) |
| All subsets/combinations | Subsets / Backtracking | Bit Manipulation |
| Sorted array search | Binary Search | Linear scan |
| Rotated sorted search | Modified Binary Search | — |

### 🔗 Linked List Problems

| Problem Type | Primary Pattern | Alternative |
|---|---|---|
| Detect cycle | Fast & Slow | HashSet |
| Find middle node | Fast & Slow | Two-pass count |
| Reverse list | In-Place Reversal | Recursive |
| Merge K sorted lists | K-Way Merge (Heap) | Divide & Conquer |
| Palindrome linked list | Fast & Slow + Reversal | Stack |

### 🌳 Tree Problems

| Problem Type | Primary Pattern | Alternative |
|---|---|---|
| Level-order traversal | Tree BFS | DFS with level parameter |
| Path sum / all paths | Tree DFS | BFS (less natural) |
| Lowest common ancestor | Tree DFS | Parent pointers |
| Serialize / deserialize | Tree DFS (preorder) | Tree BFS |
| Maximum path sum | Tree DFS (post-order) | — |

### 🕸️ Graph Problems

| Problem Type | Primary Pattern | Alternative |
|---|---|---|
| Shortest path (unweighted) | BFS | — |
| Shortest path (weighted) | Dijkstra's | Bellman-Ford (neg edges) |
| Cycle detection | DFS (coloring) | Union-Find |
| Connected components | Union-Find | BFS/DFS |
| Task ordering | Topological Sort | — |
| Number of islands | BFS/DFS on grid | Union-Find |

### 📊 Optimization Problems

| Problem Type | Primary Pattern | Alternative |
|---|---|---|
| Min/max with overlapping subproblems | Dynamic Programming | — |
| Count ways | Dynamic Programming | Backtracking (enumerate) |
| Locally optimal = globally optimal | Greedy | DP (to verify) |
| Search over possible answers | Binary Search on Answer | — |
| Constraint satisfaction | Backtracking | — |

---

## 5. The "Confusion Breakers" — When Two Patterns Look Similar

### Sliding Window vs. Two Pointers
| Aspect | Sliding Window | Two Pointers |
|---|---|---|
| **Pointer direction** | Both move same direction → | Can converge ← → |
| **What they define** | A contiguous window/range | Two independent positions |
| **Use when** | "Contiguous subarray/substring" | "Pair sum", "palindrome", "remove dupes" |
| **Key invariant** | Window only grows or shrinks | Pointers converge or diverge |

### Backtracking vs. Dynamic Programming
| Aspect | Backtracking | Dynamic Programming |
|---|---|---|
| **Goal** | Find ALL solutions | Find OPTIMAL solution |
| **Subproblems** | Unique paths (no overlap) | Overlapping subproblems |
| **Time** | Exponential (pruned) | Polynomial (memoized) |
| **Upgrade path** | Add memoization → becomes DP | — |
| **Use when** | "Generate all", "all valid" | "Minimum", "maximum", "count ways" |

### Greedy vs. Dynamic Programming
| Aspect | Greedy | Dynamic Programming |
|---|---|---|
| **Decisions** | Make one choice, never revisit | Consider all choices, compare |
| **Correctness** | Must prove (exchange argument) | Always correct if recurrence is right |
| **Speed** | O(N) or O(N log N) | O(N²) or O(N × M) |
| **Use when** | Locally optimal = globally optimal | Choices affect future choices |
| **Test** | Try to find a counter-example | Check for overlapping subproblems |

### BFS vs. DFS
| Aspect | BFS | DFS |
|---|---|---|
| **Data structure** | Queue | Stack (explicit or recursion) |
| **Space** | O(width) | O(depth) |
| **Shortest path?** | ✅ Yes (unweighted) | ❌ No |
| **Use when** | Level-order, shortest path, "minimum steps" | All paths, cycle detection, topological sort |

### Union-Find vs. BFS/DFS (for connectivity)
| Aspect | Union-Find | BFS/DFS |
|---|---|---|
| **Best for** | Dynamic edges (stream of connections) | Static graph (all edges known) |
| **Query time** | O(α(N)) ≈ O(1) | O(V + E) per query |
| **Multiple queries** | ✅ Efficient | ❌ Repeat full traversal |
| **Shortest path** | ❌ No | ✅ BFS can |

### Cyclic Sort vs. Regular Sort
| Aspect | Cyclic Sort | Regular Sort |
|---|---|---|
| **Constraint** | Values in range [0,N] or [1,N] | Any values |
| **Mechanism** | Place value at its "home" index | Compare and swap |
| **Time** | O(N) | O(N log N) |
| **Use when** | Missing/duplicate number in bounded range | General sorting |

---

## 6. The 60-Second Problem Classification Framework

When you read a new problem, run this mental checklist:

### Step 1: Identify the INPUT (5 seconds)
- Array? → Jump to Array section
- Linked List? → Jump to Linked List section
- Tree? → Tree BFS or DFS
- Graph? → Graph section
- String? → Often Sliding Window, Two Pointers, or Trie
- Intervals? → Merge Intervals
- Matrix/Grid? → Matrix Patterns or Graph BFS/DFS
- Number? → Bit Manipulation or Math

### Step 2: Identify the ASK (5 seconds)
- "Find / search" → Binary Search, Two Pointers, Trie
- "All / generate" → Subsets, Backtracking
- "Min / max / optimal" → DP or Greedy
- "Count ways" → DP
- "Top K / Kth" → Heap
- "Level by level" → BFS
- "Path / depth" → DFS
- "Order / schedule" → Topological Sort
- "Connected / group" → Union-Find or Graph BFS/DFS
- "Next greater/smaller" → Monotonic Stack

### Step 3: Check CONSTRAINTS (5 seconds)
- O(1) space required? → Two Pointers, Cyclic Sort, Bit Manipulation
- Input is sorted? → Binary Search, Two Pointers
- Values in range [1, N]? → Cyclic Sort
- K sorted lists? → K-Way Merge
- Stream of data? → Heap, Two Heaps

### Step 4: Announce Your Pattern (5 seconds)
> *"Based on the sorted input and pair-finding requirement, I'll use Two Pointers. Let me walk through the approach..."*

---

## 7. Pattern Complexity Cheat Sheet

### Sorted by Time Complexity (Best to Worst)

| Time | Patterns | When You See This |
|---|---|---|
| **O(1)** | Bit tricks (power of 2, swap) | Single operation on a number |
| **O(log N)** | Binary Search | Halving search space |
| **O(N)** | Sliding Window, Two Pointers, Fast & Slow, Cyclic Sort, Monotonic Stack | Single pass through array/list |
| **O(N log K)** | Top K Elements, K-Way Merge | Heap with K elements, N total items |
| **O(N log N)** | Merge Intervals, Greedy (sort first) | Need to sort, then process |
| **O(V + E)** | Graph BFS/DFS, Topological Sort | Graph traversal |
| **O(N × M)** | DP (2D), LCS, Edit Distance | Two dimensions (strings, grid) |
| **O(N²)** | DP (some), Brute Force Two Pointers | Quadratic — consider optimizing |
| **O(N × 2^N)** | Subsets, Bit Manipulation subsets | All subsets of N items |
| **O(N!)** | Backtracking (Permutations), N-Queens | All arrangements |

### Space Complexity Quick Reference

| Space | Patterns |
|---|---|
| **O(1)** | Two Pointers, Fast & Slow, Cyclic Sort, Binary Search, Bit Manipulation, Greedy, Matrix (in-place) |
| **O(K)** | Top K Elements, K-Way Merge |
| **O(N)** | Sliding Window (HashMap variant), Monotonic Stack, Two Heaps, Union-Find, DP (1D), Backtracking stack |
| **O(V + E)** | Graph BFS/DFS, Topological Sort |
| **O(N × L)** | Trie (N words, avg length L) |
| **O(N²)** | DP (2D table) |
| **O(N × 2^N)** | Subsets (output storage) |

---

## 8. Cross-Pattern Connections — The "Combo Moves"

Many hard problems combine two or more patterns. Recognizing these combos is what separates senior engineers from juniors:

| Combo | Patterns Combined | Classic Problem |
|---|---|---|
| **Trie + Backtracking** | Build Trie from dictionary, DFS on board with Trie pruning | Word Search II |
| **Binary Search + Greedy** | Binary search on answer space, greedy `check()` function | Koko Eating Bananas, Split Array Largest Sum |
| **BFS + Two Pointers** | BFS for levels, Two Pointers within each level | Connect Level-Order Siblings |
| **Sliding Window + HashMap** | Window tracking with frequency map | Minimum Window Substring |
| **Merge Intervals + Heap** | Sort intervals, use min-heap for end times | Meeting Rooms II |
| **DFS + Backtracking** | Tree DFS with choose/unchoose at each node | Path Sum III, All Paths |
| **Union-Find + Sort** | Sort edges by weight, Union-Find for cycle avoidance | Kruskal's MST |
| **Two Heaps + Sliding Window** | Two heaps with lazy deletion as window slides | Sliding Window Median |
| **Topological Sort + BFS** | Kahn's algorithm (BFS-based topological sort) | Course Schedule |
| **Monotonic Stack + DP** | Stack for boundaries, DP for accumulation | Maximal Rectangle in Matrix |
| **Binary Search + Matrix** | Treat sorted matrix as virtual 1D array | Search 2D Matrix |
| **Cyclic Sort + XOR** | Cyclic Sort for multiple missing, XOR for single | Find All Missing Numbers |

---

## 9. The "I'm Stuck" Recovery Protocol

If you're 5 minutes into a problem and don't know the pattern, use this emergency protocol:

### 1. Brute Force First
Write the brute-force solution (usually O(N²) or O(2^N)). Then ask:
- *"Where is the repeated work?"* → DP (memoize)
- *"Am I scanning unnecessarily?"* → Sliding Window / Two Pointers / Monotonic Stack
- *"Am I sorting when I don't need to?"* → Heap / Bucket Sort

### 2. Ask Clarifying Questions
- *"Is the input sorted?"* → Binary Search, Two Pointers
- *"Are values bounded?"* → Cyclic Sort, Counting Sort
- *"Can I modify the input?"* → In-place algorithms
- *"Is this a stream?"* → Heap-based approaches

### 3. Work Backwards from Complexity
If the interviewer hints at the expected complexity:
- **O(log N)** → Binary Search
- **O(N)** → Sliding Window, Two Pointers, HashMap, Monotonic Stack
- **O(N log N)** → Sort + something, or Heap
- **O(N log K)** → Heap of size K
- **O(V + E)** → Graph traversal

### 4. The "What Data Structure Would Help?" Trick
- Need O(1) lookup? → **HashMap / HashSet**
- Need sorted order + O(log N) insert? → **Heap / BST**
- Need FIFO processing? → **Queue (BFS)**
- Need LIFO processing? → **Stack (DFS / Monotonic Stack)**
- Need prefix matching? → **Trie**
- Need grouping? → **Union-Find**

---

## 10. Interview Tips 💡

1. **Announce the pattern within 60 seconds.** After reading the problem, say: *"This looks like a [Pattern] problem because [reason]. Let me verify with a small example, then code it."* This signals structured thinking immediately.
2. **If unsure between two patterns, name both.** *"This could be Sliding Window or Two Pointers. Let me think... since we need a contiguous subarray, I'll go with Sliding Window."* Showing you considered alternatives is more impressive than jumping to one.
3. **The pattern is the WHAT. The implementation is the HOW.** Don't mix them. First state the pattern (30 seconds), then outline the approach (1 minute), then code (15-20 minutes). Many candidates start coding without stating the pattern — interviewers can't give partial credit if they don't know your approach.
4. **Master 5 patterns deeply, not 23 shallowly.** The 5 most common: Sliding Window, Two Pointers, BFS/DFS, Binary Search, and DP cover ~70% of all coding interview problems. If you can solve any problem with these 5, you pass most interviews.
5. **The constraint line IS the hint.** `N ≤ 10^4` → O(N²) is fine. `N ≤ 10^5` → Need O(N log N). `N ≤ 10^7` → Need O(N) or O(N log N). `N ≤ 10^18` → Need O(log N) (binary search) or O(1) (math). The constraint tells you the expected complexity, which tells you the pattern.
6. **Practice the combos.** Once you know individual patterns, practice problems that combine two (word search II = Trie + Backtracking, sliding window median = Two Heaps + Window). These are the problems that differentiate "pass" from "strong hire".
7. **Build muscle memory for the top 3 per pattern.** For each of the 23 patterns, know 3 problems cold (the two scenarios in each guide + one more). That's 69 problems total. If you can solve those 69 in your sleep, you're ready for any FAANG interview.
