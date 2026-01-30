# Hash Tables 🗝️

## 1. The "Library Card Catalog" Analogy

Imagine an old **library card catalog** system:

- You want to find the book "The Great Gatsby".
- **Without a catalog (Array search):** Walk through every shelf. Hours!
- **With a catalog (Hash Table):** Take the title, apply a formula → Jump DIRECTLY to that location. Seconds!

**This is a Hash Table.** It uses a **hash function** to convert a key into an array index, enabling O(1) average-case lookups.

---

## 2. The Core Concept

### How Hashing Works
```
Key → Hash Function → Index → Value
"apple" → hash("apple") → 42 → "fruit"
```

### Key Operations Complexity

| Operation | Average | Worst Case |
|-----------|---------|------------|
| Insert | O(1) | O(N) |
| Lookup | O(1) | O(N) |
| Delete | O(1) | O(N) |

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "sliding-window",
  "data": [1, 2, 3, 1, 2, 4, 5, 3],
  "k": 4
}
```

---

## 4. Scenario A: Two Sum

**Technical Problem:** Find two numbers that add up to target.

### TypeScript Implementation

```typescript
/**
 * @timeComplexity O(N)
 * @spaceComplexity O(N)
 */
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  return [];
}
```

---

## 5. Scenario B: Group Anagrams

```typescript
function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();
  
  for (const str of strs) {
    const key = str.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(str);
  }
  
  return Array.from(groups.values());
}
```

---

## 6. Real World Applications 🌍

### 1. 🔐 Password Storage
### 2. 📁 File Deduplication  
### 3. 🌐 DNS Resolution
### 4. 🔄 Caching (Redis)

---

## 7. Complexity Analysis 🧠

| Structure | Use Case |
|-----------|----------|
| `Map` | Any key type, ordered |
| `Set` | Unique values only |
| `Object` | String keys only |
