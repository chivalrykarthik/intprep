# Backtracking 🔙

## 1. The "Maze Explorer" Analogy

Imagine navigating a maze:
- At each intersection, you **choose** a path.
- If you hit a dead end, you **backtrack** to the last intersection.
- Try another path until you find the exit.

**This is Backtracking.** Explore all possible solutions by making choices, and undo (backtrack) when a choice doesn't lead to a valid solution.

---

## 2. The Core Concept

### The Pattern
```
function backtrack(state):
    if isValidSolution(state):
        addToResults(state)
        return
    
    for choice in choices:
        if isValid(choice):
            make(choice)      # Choose
            backtrack(state)  # Explore
            undo(choice)      # Un-choose (Backtrack)
```

### When to Use
- Generate all permutations/combinations
- Solve constraint satisfaction (Sudoku, N-Queens)
- Find all paths in a graph

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "subsets",
  "data": [1, 2, 3]
}
```

---

## 4. Scenario A: Generate Permutations

```typescript
/**
 * Generate all permutations of nums.
 * @timeComplexity O(N * N!)
 * @spaceComplexity O(N) for recursion stack
 */
function permute(nums: number[]): number[][] {
  const results: number[][] = [];
  
  function backtrack(current: number[], remaining: number[]): void {
    if (remaining.length === 0) {
      results.push([...current]);
      return;
    }
    
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      backtrack(
        current,
        [...remaining.slice(0, i), ...remaining.slice(i + 1)]
      );
      current.pop(); // Backtrack
    }
  }
  
  backtrack([], nums);
  return results;
}

console.log(permute([1, 2, 3]));
// [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

---

## 5. Scenario B: N-Queens

```typescript
function solveNQueens(n: number): string[][] {
  const results: string[][] = [];
  const board: string[][] = Array.from({ length: n }, () => 
    Array(n).fill('.')
  );
  
  function isValid(row: number, col: number): boolean {
    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false;
    }
    // Check diagonals
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false;
    }
    return true;
  }
  
  function backtrack(row: number): void {
    if (row === n) {
      results.push(board.map(r => r.join('')));
      return;
    }
    
    for (let col = 0; col < n; col++) {
      if (isValid(row, col)) {
        board[row][col] = 'Q';
        backtrack(row + 1);
        board[row][col] = '.'; // Backtrack
      }
    }
  }
  
  backtrack(0);
  return results;
}
```

---

## 6. Real World Applications 🌍

### 1. 🧩 Sudoku Solvers
### 2. 🗺️ Route Planning (All paths)
### 3. 🎮 Game AI (Chess moves)
### 4. 🔐 Password Cracking

---

## 7. Complexity Analysis 🧠

| Problem | Time | Space |
|---------|------|-------|
| Permutations | O(N * N!) | O(N) |
| Combinations | O(2^N) | O(N) |
| N-Queens | O(N!) | O(N) |
| Sudoku | O(9^81) worst | O(81) |

### Pruning Tips
- **Early termination:** Stop exploring invalid paths ASAP
- **Constraint propagation:** Reduce choices based on constraints
- **Ordering heuristics:** Try most constrained choices first
