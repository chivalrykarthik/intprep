# Matrix / 2D Array Patterns 🔲

## 1. The "Building Floor Plan" Analogy

Imagine you're a building inspector examining a **floor plan grid**. Each cell is a room. You need to perform specific traversal patterns:

- **Spiral:** Walk the perimeter clockwise, then spiral inward (like peeling an onion layer by layer).
- **Rotate:** The architect wants the floor plan rotated 90°. You can't move walls — you swap room labels.
- **Search:** Find a specific room in a sorted floor plan where rooms are numbered in order across rows.

These are the three most common **matrix manipulation** patterns in interviews. They test your ability to manage **boundaries, indices, and in-place transformations** — skills that separate senior engineers from juniors.

---

## 2. The Core Concept

Matrix problems are about **index manipulation**. The key challenges:

1. **Boundary tracking:** Knowing when you've hit a wall (row/col limits).
2. **Direction changes:** Spiral traversals require turning at boundaries.
3. **In-place operations:** Rotating or transposing without extra space.
4. **Coordinate math:** Converting between 1D and 2D indices.

### Common Techniques
- **Four-boundary spiral:** Use `top`, `bottom`, `left`, `right` pointers.
- **Transpose + Reverse = Rotate 90°:** Two simple operations compose into rotation.
- **Treat matrix as sorted 1D array:** For binary search on sorted matrices.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "cyclic-sort",
  "data": [1, 2, 3, 4, 5, 6, 7, 8, 9]
}
```

---

## 4. Scenario A: Spiral Matrix Traversal
**Real-Life Scenario:** You're building a **printer driver** that prints a 2D image. The print head needs to traverse all pixels in a spiral pattern (outside-in) because the ink cartridge is on the edge and works inward.

**Technical Problem:** Given an `m x n` matrix, return all elements of the matrix in spiral order.

### TypeScript Implementation

```typescript
/**
 * Returns elements of a matrix in spiral order.
 *
 * Strategy: Maintain four boundaries (top, bottom, left, right).
 * Traverse → right along top row, ↓ down right column,
 * ← left along bottom row, ↑ up left column.
 * After each pass, shrink the corresponding boundary.
 *
 * @param matrix - 2D array of numbers.
 * @returns Array of elements in spiral order.
 *
 * @timeComplexity O(M × N) - Visit every element once.
 * @spaceComplexity O(1) - Only boundary variables (output is O(M × N)).
 */
function spiralOrder(matrix: number[][]): number[] {
    const result: number[] = [];
    if (matrix.length === 0) return result;

    let top = 0;
    let bottom = matrix.length - 1;
    let left = 0;
    let right = matrix[0].length - 1;

    while (top <= bottom && left <= right) {
        // → Traverse right along top row
        for (let col = left; col <= right; col++) {
            result.push(matrix[top][col]);
        }
        top++; // Shrink top boundary

        // ↓ Traverse down along right column
        for (let row = top; row <= bottom; row++) {
            result.push(matrix[row][right]);
        }
        right--; // Shrink right boundary

        // ← Traverse left along bottom row (if still valid)
        if (top <= bottom) {
            for (let col = right; col >= left; col--) {
                result.push(matrix[bottom][col]);
            }
            bottom--; // Shrink bottom boundary
        }

        // ↑ Traverse up along left column (if still valid)
        if (left <= right) {
            for (let row = bottom; row >= top; row--) {
                result.push(matrix[row][left]);
            }
            left++; // Shrink left boundary
        }
    }

    return result;
}

// Example Usage:
const matrix = [
    [1,  2,  3,  4],
    [5,  6,  7,  8],
    [9, 10, 11, 12]
];
console.log("Matrix:", matrix);
console.log("Spiral Order:", spiralOrder(matrix));
```

### Sample input and output
- **Input**: `[[1,2,3,4], [5,6,7,8], [9,10,11,12]]`
- **Output**: `[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]`

---

## 5. Scenario B: Rotate Image 90° Clockwise (In-Place)
**Real-Life Scenario:** You're building an **image editor**. The user clicks "Rotate Right". You need to rotate the image 90° clockwise **without allocating a new image buffer** (memory is constrained on mobile devices).

**Technical Problem:** Given an `n × n` 2D matrix representing an image, rotate the image by 90 degrees clockwise **in-place**.

### TypeScript Implementation

```typescript
/**
 * Rotates an n×n matrix 90° clockwise in-place.
 *
 * Key Insight: 90° clockwise rotation = Transpose + Reverse each row.
 *   - Transpose: swap matrix[i][j] with matrix[j][i]
 *   - Reverse rows: reverse each row
 *
 * Why this works:
 *   Original position (i, j) → After transpose (j, i) → After reverse (j, n-1-i)
 *   (i, j) → (j, n-1-i) is exactly the 90° clockwise rotation formula!
 *
 * @param matrix - n×n matrix to rotate in-place.
 *
 * @timeComplexity O(N²) - Touch every element once for transpose, once for reverse.
 * @spaceComplexity O(1) - In-place swaps only.
 */
function rotate(matrix: number[][]): void {
    const n = matrix.length;

    // Step 1: Transpose (swap across diagonal)
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            // Swap matrix[i][j] and matrix[j][i]
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }

    // Step 2: Reverse each row
    for (let i = 0; i < n; i++) {
        matrix[i].reverse();
    }
}

// Example Usage:
const image = [
    [1,  2,  3],
    [4,  5,  6],
    [7,  8,  9]
];
console.log("Before:", JSON.stringify(image));
rotate(image);
console.log("After 90° rotation:", JSON.stringify(image));
// [[7,4,1], [8,5,2], [9,6,3]]
```

### Sample input and output
- **Input**: `[[1,2,3], [4,5,6], [7,8,9]]`
- **Output**: `[[7,4,1], [8,5,2], [9,6,3]]`

---

## 6. Scenario C: Search a 2D Matrix
**Real-Life Scenario:** You have a **database index** structured as a 2D table where each row is sorted and each row starts with a value greater than the last element of the previous row. You need to determine if a target value exists.

**Technical Problem:** Search a sorted 2D matrix where each row is sorted left-to-right and the first integer of each row is greater than the last integer of the previous row.

### TypeScript Implementation

```typescript
/**
 * Binary search on a sorted 2D matrix.
 *
 * Treats the matrix as a virtual 1D sorted array.
 * Index mapping: mid → row = mid / cols, col = mid % cols.
 *
 * @param matrix - Sorted 2D matrix.
 * @param target - Value to search for.
 * @returns True if target exists.
 *
 * @timeComplexity O(log(M × N)) - Binary search on M×N elements.
 * @spaceComplexity O(1) - No extra space.
 */
function searchMatrix(matrix: number[][], target: number): boolean {
    const rows = matrix.length;
    const cols = matrix[0].length;

    let left = 0;
    let right = rows * cols - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        // Convert 1D index to 2D coordinates
        const row = Math.floor(mid / cols);
        const col = mid % cols;
        const value = matrix[row][col];

        if (value === target) return true;
        else if (value < target) left = mid + 1;
        else right = mid - 1;
    }

    return false;
}

// Example Usage:
const sortedMatrix = [
    [1,  3,  5,  7],
    [10, 11, 16, 20],
    [23, 30, 34, 60]
];
console.log("Search for 3:", searchMatrix(sortedMatrix, 3));   // true
console.log("Search for 13:", searchMatrix(sortedMatrix, 13)); // false
```

### Sample input and output
- **Input**: `matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]`, `target = 3`
- **Output**: `true` (found at position [0][1])

---

## 7. Real World Applications 🌍

### 1. 🖼️ Image Processing
Image rotation, flipping, and transformation in photo editors and game engines are matrix operations. GPU shaders perform these operations on millions of pixels simultaneously using the same index math.

### 2. 🎮 Game Maps & Pathfinding
2D game boards (chess, minesweeper, puzzle games) are matrices. Spiral traversals are used for expanding search patterns. BFS/DFS on the grid finds paths for game AI.

### 3. 📊 Spreadsheet Engines
Excel and Google Sheets store data as 2D arrays. Operations like transposing rows/columns, sorting, and searching use the same matrix manipulation algorithms.

### 4. 🧬 Scientific Computing
Weather simulations, fluid dynamics, and molecular modeling use 2D/3D matrices. Efficient traversal patterns (cache-friendly row-major vs column-major) can make 10× performance difference.

---

## 8. Complexity Analysis 🧠

| Problem | Time | Space | Key Technique |
|---------|------|-------|---------------|
| **Spiral Order** | O(M × N) | O(1) | Four-boundary tracking |
| **Rotate 90°** | O(N²) | O(1) | Transpose + Reverse |
| **Search Sorted Matrix** | O(log(M×N)) | O(1) | Virtual 1D binary search |
| **Set Matrix Zeroes** | O(M × N) | O(1) | Use first row/col as markers |
| **Staircase Search (240)** | O(M + N) | O(1) | Start from top-right corner |

### 🎯 Matrix Problem Identification
- **"Traverse in spiral/diagonal/zigzag order"** → Boundary tracking with direction changes.
- **"Rotate/transform in-place"** → Decompose into transpose + reverse/flip.
- **"Search in sorted matrix"** → Binary search with index conversion.
- **"Flood fill / connected regions"** → BFS/DFS on grid (see Graph BFS/DFS guide).
