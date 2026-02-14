# Bit Manipulation 🔢

## 1. The "Light Switch Panel" Analogy

Imagine a control room with **8 light switches** in a row. Each switch is either ON (1) or OFF (0). The panel reads: `10110100`.

- **Checking Switch 5?** Use a mask `00100000` with **AND (&)**: if light shines through, it's ON.
- **Toggling Switch 3?** Use mask `00001000` with **XOR (^)**: flips the bit.
- **Forcing Switch 7 ON?** Use mask `01000000` with **OR (|)**: forces to 1.

**This is Bit Manipulation.** Work directly with binary representation using bitwise operators for O(1) time, O(1) space operations.

---

## 2. The Core Concept

### Key Operators

| Operator | Symbol | Example (5=`101`, 3=`011`) | Result |
|----------|--------|-----------------------------|--------|
| **AND** | `&` | `101 & 011` | `001` (1) |
| **OR** | `\|` | `101 \| 011` | `111` (7) |
| **XOR** | `^` | `101 ^ 011` | `110` (6) |
| **NOT** | `~` | `~101` | `...010` |
| **Left Shift** | `<<` | `101 << 1` | `1010` (10) |
| **Right Shift** | `>>` | `101 >> 1` | `10` (2) |

### XOR — The Swiss Army Knife 🔧
1. **Self-cancel:** `a ^ a = 0`
2. **Identity:** `a ^ 0 = a`
3. **Commutative/Associative:** Order doesn't matter

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "subsets",
  "data": [1, 2, 4, 8]
}
```

---

## 4. Scenario A: Single Number (XOR Magic)
**Real-Life Scenario:** You're a warehouse manager. Every item has **exactly 2 units** except one "orphan" item with 1 unit. Find the orphan **without extra space**.

**Technical Problem:** Given a non-empty array where every element appears twice except one, find that single element.

### TypeScript Implementation

```typescript
/**
 * Finds the single number using XOR.
 * a ^ a = 0, a ^ 0 = a → pairs cancel, orphan remains.
 *
 * @param nums - Array where every element appears twice except one.
 * @returns The single element.
 *
 * @timeComplexity O(N) - Single pass.
 * @spaceComplexity O(1) - No extra data structures.
 */
function singleNumber(nums: number[]): number {
    let result = 0;
    for (const num of nums) {
        result ^= num;
    }
    return result;
}

// Trace: [4, 1, 2, 1, 2]
// 0 ^ 4 = 4 → 4 ^ 1 = 5 → 5 ^ 2 = 7 → 7 ^ 1 = 6 → 6 ^ 2 = 4 ✅

console.log("Array:", [4, 1, 2, 1, 2]);
console.log("Single Number:", singleNumber([4, 1, 2, 1, 2]));
```

### Sample input and output
- **Input**: `[4, 1, 2, 1, 2]`
- **Output**: `4` (1 and 2 cancel via XOR, leaving 4)

---

## 5. Scenario B: Counting Bits (DP + Bits)
**Real-Life Scenario:** You're building a hamming weight table for hardware encoding. For every number 0 to N, count its 1-bits.

**Technical Problem:** Given integer `n`, return array where `ans[i]` = number of 1-bits in binary of `i`.

### TypeScript Implementation

```typescript
/**
 * Counts 1-bits for every number from 0 to n.
 * dp[i] = dp[i >> 1] + (i & 1)
 *
 * @param n - Upper bound.
 * @returns Array of bit counts.
 *
 * @timeComplexity O(N) - One pass.
 * @spaceComplexity O(N) - Output array.
 */
function countBits(n: number): number[] {
    const ans = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        ans[i] = ans[i >> 1] + (i & 1);
    }
    return ans;
}

console.log("Bit counts 0-8:", countBits(8));
// [0,1,1,2,1,2,2,3,1]
```

### Sample input and output
- **Input**: `n = 5`
- **Output**: `[0, 1, 1, 2, 1, 2]`

---

## 6. Scenario C: Common Bit Tricks Cheat Sheet

```typescript
// 1. Check if N is power of 2
function isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
}

// 2. Count 1-bits (Brian Kernighan's)
function hammingWeight(n: number): number {
    let count = 0;
    while (n !== 0) { n &= (n - 1); count++; }
    return count;
}

// 3. Get/Set/Clear/Toggle bit at position
function getBit(n: number, pos: number): boolean { return (n & (1 << pos)) !== 0; }
function setBit(n: number, pos: number): number { return n | (1 << pos); }
function clearBit(n: number, pos: number): number { return n & ~(1 << pos); }
function toggleBit(n: number, pos: number): number { return n ^ (1 << pos); }

// 4. Swap without temp variable
function swap(a: number, b: number): [number, number] {
    a ^= b; b ^= a; a ^= b;
    return [a, b];
}

// 5. Find missing number (0..n, one missing)
function missingNumber(nums: number[]): number {
    let xor = nums.length;
    for (let i = 0; i < nums.length; i++) xor ^= i ^ nums[i];
    return xor;
}

console.log("Is 16 power of 2?", isPowerOfTwo(16));      // true
console.log("1-bits in 11:", hammingWeight(11));           // 3
console.log("Missing in [3,0,1]:", missingNumber([3,0,1]));// 2
```

---

## 7. Real World Applications 🌍

### 1. 🔐 Permission Systems (Unix)
Unix permissions (`rwxr-xr--` = `755`) use bit flags. Checking write permission: `permissions & WRITE_FLAG`. Setting: OR. React's event system uses similar bit flags.

### 2. 🎮 Game State Compression
Chess engines use "bitboards" — 64-bit integers where each bit = a square. Move legality is a single AND. Stockfish evaluates millions of positions/second this way.

### 3. 🌐 Network Subnet Masking
IP subnet masks (`255.255.255.0`) use AND to check same-network membership. Every packet your computer sends uses this.

### 4. 🗜️ Bloom Filters & Compression
Databases use Bloom filters (bit arrays + hashes) for fast set membership. Huffman/LZ compression operates at the bit level.

---

## 8. Complexity Analysis 🧠

| Problem | Time | Space |
|---------|------|-------|
| Single Number (XOR) | O(N) | O(1) |
| Count Bits (DP) | O(N) | O(N) |
| Power of Two | O(1) | O(1) |
| Hamming Weight | O(k), k=set bits | O(1) |
| Subset via bitmask | O(2^N × N) | O(1) per subset |

---

## 9. Interview Tips 💡

1. **Recognize the trigger words.** "Without extra space", "O(1) space", "XOR", "single number among pairs", "power of 2", "count set bits", "bitmask" — all Bit Manipulation. When the constraint says "O(1) space" and the obvious solution uses a HashMap, think bits.
2. **XOR is your best friend.** Know these three properties cold: `a ^ a = 0` (self-cancel), `a ^ 0 = a` (identity), `XOR is commutative and associative` (order doesn't matter). Single Number, Missing Number, and Two Single Numbers all rely on these. If you forget XOR properties, you can't solve any of them.
3. **JavaScript bitwise operators work on 32-bit integers ONLY.** `|`, `&`, `^`, `~`, `<<`, `>>` convert numbers to 32-bit signed integers. Numbers > 2^31 - 1 will produce wrong results. For large numbers, use `BigInt`. Mention this limitation in the interview.
4. **`n & (n-1)` — the power trick.** `n & (n-1)` drops the lowest set bit. Uses: (a) Check power of 2: `n > 0 && (n & (n-1)) === 0`. (b) Count set bits (Brian Kernighan's): loop `n &= n-1`, count iterations. Know both cold — they come up constantly.
5. **Bit masking for subset generation.** Every subset of N elements maps to an N-bit mask. Mask `0b101` = pick element 0 and element 2. Iterate `0` to `2^N - 1`, extract bits with `mask & (1 << i)`. This is an alternative to recursive subset generation. Mention it to show depth.
6. **Edge cases to mention proactively.** Negative numbers (two's complement — `~n = -n-1`), zero (`0 & anything = 0`, `0 ^ anything = anything`), sign bit (bit 31 is the sign in 32-bit integers), and numbers that don't fit in 32 bits.
7. **Real-world bit applications to mention.** Feature flags (enable/disable features with `permissions |= FLAG`), IP subnet masking (`ip & mask`), Bloom filters (probabilistic set membership), and React's lane system (concurrent mode uses bit lanes for priority). These show you use bits in production, not just LeetCode.
