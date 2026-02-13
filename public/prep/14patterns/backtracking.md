# Backtracking 🔙

## 1. The "Escape Room" Analogy

Imagine you are in an **Escape Room** with multiple locked doors. Behind each door, there are more doors, and only one specific sequence of doors leads to the exit.

- You try **Door A**. Behind it you find Door D and Door E.
- You try **Door D**. Dead end. Locked. 🔒
- You **backtrack** to Door A. Now you try **Door E**. Behind it, more doors...
- You keep exploring, always backtracking when you hit a dead end, until you find the exit.

You don't try every possible combination by writing them all down first. Instead, you **build a path one step at a time**, and the moment you realize the current path can't lead anywhere, you **undo the last step and try the next option**.

**This is Backtracking.** It's a systematic way to explore all possible solutions by making a choice, recursing deeper, and undoing (backtracking) when the choice doesn't work. Think of it as **"smart brute force"** — instead of generating every possible combination up front, you prune dead-end branches early.

---

## 2. The Core Concept

In coding interviews, we use this to solve problems involving **permutations, combinations, constraint satisfaction** (Sudoku, N-Queens), and **all-paths** traversals.

**The "True Brute Force" (Dumb) Way:**
Generate every possible arrangement up front, then filter for valid ones.
- For Permutations of N items: Generate all **N!** possibilities and check each.
- For a Sudoku board: Try all 9^81 combinations. That's more than atoms in the universe.

**The "Backtracking" (Smart) Way:**
Build the solution incrementally using the **Choose → Explore → Un-choose** framework:
1. **Choose:** Make a decision (pick a number, place a queen).
2. **Explore:** Recurse deeper with this decision in place.
3. **Un-choose (Backtrack):** Undo the decision, try the next option.
- **Boom.** Invalid branches are pruned *as they happen*, drastically cutting down the search space.

### The Template

```typescript
function backtrack(state: State): void {
    // Base Case: Is this a valid complete solution?
    if (isComplete(state)) {
        results.push(copy(state));
        return;
    }

    for (const choice of getChoices(state)) {
        if (isValid(choice, state)) {
            applyChoice(choice, state);     // 1. Choose
            backtrack(state);                // 2. Explore
            undoChoice(choice, state);       // 3. Un-choose (Backtrack)
        }
    }
}
```

---

## 3. Interactive Visualization 🎮
Click "Next" to see how subsets are generated through backtracking!

```visualizer
{
  "type": "subsets",
  "data": [1, 2, 3]
}
```

---

## 4. Scenario A: Generate All Permutations
**Real-Life Scenario:** You are a wedding planner arranging **seating for 4 VIP guests** at a head table. The couple wants to see *every possible arrangement* to pick the one with the best chemistry. You need to generate all orderings without repetition.

**Technical Problem:** Given an array `nums` of distinct integers, return all the possible permutations. You can return the answer in any order.

### TypeScript Implementation

```typescript
/**
 * Generates all permutations of a given array of distinct integers.
 *
 * @param nums - Array of distinct integers.
 * @returns An array of all possible permutations.
 *
 * @timeComplexity O(N * N!) - There are N! permutations, and copying each takes O(N).
 * @spaceComplexity O(N) - Recursion stack depth is N. (Output storage is O(N * N!) but not counted as auxiliary.)
 */
function permute(nums: number[]): number[][] {
    const results: number[][] = [];

    function backtrack(current: number[], remaining: number[]): void {
        // Base Case: No more numbers to place
        if (remaining.length === 0) {
            results.push([...current]); // Copy! Don't push the reference.
            return;
        }

        for (let i = 0; i < remaining.length; i++) {
            // 1. Choose: Pick remaining[i]
            current.push(remaining[i]);

            // 2. Explore: Recurse with reduced remaining set
            const nextRemaining = [
                ...remaining.slice(0, i),
                ...remaining.slice(i + 1)
            ];
            backtrack(current, nextRemaining);

            // 3. Un-choose (Backtrack): Remove the last choice
            current.pop();
        }
    }

    backtrack([], nums);
    return results;
}

// Example Usage:
const nums = [1, 2, 3];
console.log("Input:", nums);
console.log("All Permutations:", permute(nums));
```

### Sample input and output
- **Input**: `[1, 2, 3]`
- **Output**: `[[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]` (6 permutations = 3!)

---

## 5. Scenario B: N-Queens (Constraint Satisfaction)
**Real-Life Scenario:** You are a chess tournament organizer. You need to place **N queens** on an N×N chessboard such that no two queens threaten each other (no two in the same row, column, or diagonal). You need *all* valid configurations.

**Technical Problem:** The N-Queens puzzle: Place `n` queens on an `n x n` chessboard such that no two queens attack each other. Return all distinct solutions.

### TypeScript Implementation

```typescript
/**
 * Solves the N-Queens problem and returns all valid board configurations.
 *
 * Key Insight: We place one queen per row (guaranteed no row conflicts),
 * then check column and diagonal conflicts before committing.
 *
 * @param n - The board size (n x n) and number of queens.
 * @returns Array of solutions, each solution is an array of strings representing the board.
 *
 * @timeComplexity O(N!) - Upper bound. Pruning makes it significantly faster in practice.
 * @spaceComplexity O(N) - Recursion depth is N (one queen per row). Board state is O(N²).
 */
function solveNQueens(n: number): string[][] {
    const results: string[][] = [];
    // Create board filled with '.'
    const board: string[][] = Array.from({ length: n }, () =>
        Array(n).fill('.')
    );

    /**
     * Checks if placing a queen at (row, col) is safe.
     * We only need to check ABOVE the current row (queens below haven't been placed yet).
     */
    function isValid(row: number, col: number): boolean {
        // Check column (any queen directly above?)
        for (let i = 0; i < row; i++) {
            if (board[i][col] === 'Q') return false;
        }
        // Check upper-left diagonal
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (board[i][j] === 'Q') return false;
        }
        // Check upper-right diagonal
        for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
            if (board[i][j] === 'Q') return false;
        }
        return true;
    }

    function backtrack(row: number): void {
        // Base Case: All queens placed successfully
        if (row === n) {
            results.push(board.map(r => r.join('')));
            return;
        }

        // Try each column in the current row
        for (let col = 0; col < n; col++) {
            if (isValid(row, col)) {
                board[row][col] = 'Q';      // 1. Choose
                backtrack(row + 1);          // 2. Explore
                board[row][col] = '.';       // 3. Un-choose (Backtrack)
            }
        }
    }

    backtrack(0);
    return results;
}

// Example Usage:
const n = 4;
const solutions = solveNQueens(n);
console.log(`N-Queens (n=${n}): Found ${solutions.length} solutions`);
solutions.forEach((sol, idx) => {
    console.log(`\nSolution ${idx + 1}:`);
    sol.forEach(row => console.log(row));
});
```

### Sample input and output
- **Input**: `n = 4`
- **Output**: 2 solutions:
  - `.Q..` / `...Q` / `Q...` / `..Q.`
  - `..Q.` / `Q...` / `...Q` / `.Q..`

---

## 6. Real World Applications 🌍

### 1. 🧩 Sudoku Solvers
Every Sudoku-solving app uses backtracking. It places a number in an empty cell, checks row/column/box constraints, and backtracks if a conflict is found. With proper constraint propagation (eliminating impossible numbers early), the solver can crack even "hard" puzzles in milliseconds.

### 2. 🗺️ Route Planning (All Paths)
Navigation systems sometimes need to find *all possible routes* between two locations (not just the shortest). Backtracking systematically explores every intersection, branching into all roads, and backtracks when it hits a dead-end or an already-visited node.

### 3. 🎮 Game AI (Decision Trees)
Chess engines use a form of backtracking called **Minimax with Alpha-Beta Pruning**. The AI explores move sequences deep into the future ("If I move here, opponent moves there..."), backtracks to evaluate alternatives, and prunes branches that can't possibly be better than what's already found.

### 4. 🔐 Combinatorial Optimization
Compiler optimization, VLSI circuit design, and even DNA sequence alignment use backtracking to explore solution spaces. The key is aggressive pruning — eliminating configurations that violate constraints as early as possible.

---

## 7. Complexity Analysis 🧠

Backtracking problems have inherently exponential complexity. The value comes from **pruning** — cutting away invalid branches early.

### Time Complexity by Problem Type

| Problem | Unpruned | Typical (with pruning) |
|---------|----------|----------------------|
| **Permutations** | O(N * N!) | O(N * N!) — no pruning possible |
| **Combinations** | O(2^N) | O(2^N) — but with early exits |
| **N-Queens** | O(N^N) naive | O(N!) — row-per-queen pruning |
| **Sudoku** | O(9^81) worst | Much less in practice — constraint propagation |

### Space Complexity: O(N) 💾
- The recursion stack depth equals the number of decisions made (one per level).
- For permutations of N: stack depth is N.
- For N-Queens: stack depth is N (one row per level).

### 🎯 Pruning Strategies (The Real Power)
- **Early termination:** Stop exploring a branch the moment a constraint is violated. Don't wait until the end.
- **Constraint propagation:** When you place a number in Sudoku, immediately eliminate that number from all related cells' possibilities.
- **Ordering heuristics:** Try the *most constrained* choices first (e.g., in Sudoku, fill the cell with the fewest possible numbers first). This finds dead-ends faster.
- **Symmetry breaking:** If the problem has symmetrical solutions (e.g., rotations of N-Queens), you can skip duplicate branches.
