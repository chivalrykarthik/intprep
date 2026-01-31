# Hash Tables 🗝️

## 1. The "Library Speed-Index" Analogy

Imagine you're a librarian with 1 million books.

**Without Hash Table (Linear Search):**
- Someone asks for "The Great Gatsby"
- You walk through EVERY shelf, checking each book
- Time: O(N) = checking 1 million spines!

**With Hash Table (Direct Access):**
- You have a magic formula: `bookshelf_index = hash(title) % total_shelves`
- "The Great Gatsby" → hash → Shelf #4,287
- Walk DIRECTLY to that shelf
- Time: O(1) = one lookup, regardless of library size!

**This is a Hash Table.** A data structure that maps keys to values using a hash function, enabling near-instant lookups, insertions, and deletions.

---

## 2. The Core Concept

In coding interviews, hash tables are one of the MOST frequently used data structures.

**How Hashing Works:**
```
Key → Hash Function → Index → Value

"apple" → hash("apple") → 42 → { name: "apple", type: "fruit" }
"banana" → hash("banana") → 17 → { name: "banana", type: "fruit" }
```

**Collision Handling:**
When two keys hash to the same index:

1. **Chaining:** Store a linked list at each index
2. **Open Addressing:** Find next empty slot (linear probing, quadratic probing)

**Key Operations:**

| Operation | Average Case | Worst Case (all collisions) |
|-----------|-------------|---------------------------|
| Insert    | O(1)        | O(N)                      |
| Lookup    | O(1)        | O(N)                      |
| Delete    | O(1)        | O(N)                      |

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                    HASH TABLE STRUCTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Key → Hash Function → Index → Value                           │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Index │ Bucket (Chaining for Collisions)               │   │
│   ├───────┼─────────────────────────────────────────────────┤   │
│   │   0   │ [ ]                                             │   │
│   │   1   │ [ "apple" → 🍎 ]                                │   │
│   │   2   │ [ "banana" → 🍌 ] → [ "berry" → 🫐 ] (chain!)   │   │
│   │   3   │ [ ]                                             │   │
│   │   4   │ [ "cherry" → 🍒 ]                               │   │
│   │  ...  │                                                 │   │
│   └───────┴─────────────────────────────────────────────────┘   │
│                                                                 │
│   hash("apple") = 1, hash("banana") = 2, hash("berry") = 2      │
│   "banana" and "berry" COLLIDE at index 2 → use chaining        │
│                                                                 │
│   Average: O(1) lookup    Worst (all collide): O(N)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Two Sum (Classic Hash Table Problem)

**Real-Life Scenario:** In a shopping app, find two items whose prices sum to exactly your budget.

**Technical Problem:** Given an array of integers, find indices of two numbers that add up to the target.

### TypeScript Implementation

```typescript
/**
 * Two Sum - Find two numbers that add up to target
 * 
 * Brute Force: O(N²) - check every pair
 * Hash Table: O(N) - single pass with complement lookup
 * 
 * @param nums - Array of numbers
 * @param target - Target sum
 * @returns Indices of the two numbers
 * 
 * @timeComplexity O(N) - Single pass through array
 * @spaceComplexity O(N) - Store up to N elements in hash map
 */
function twoSum(nums: number[], target: number): number[] {
  // Map: number -> index
  const seen = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    // Check if complement exists
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    
    // Store current number with its index
    seen.set(nums[i], i);
  }
  
  return []; // No solution found
}

// Example walkthrough:
// nums = [2, 7, 11, 15], target = 9
// i=0: complement = 9-2 = 7, seen = {}, add 2→0
// i=1: complement = 9-7 = 2, seen has 2! Return [0, 1]
```

### Sample Input and Output
```
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] = 2 + 7 = 9
```

---

## 5. Scenario B: Group Anagrams

**Real-Life Scenario:** Organize a list of words where anagrams are grouped together.

**Technical Problem:** Given an array of strings, group anagrams together.

### TypeScript Implementation

```typescript
/**
 * Group Anagrams - Group strings that are anagrams of each other
 * 
 * Approach: Use sorted string as key
 * "eat" → "aet", "tea" → "aet", "ate" → "aet" → Same group!
 * 
 * @param strs - Array of strings
 * @returns Array of groups (each group contains anagrams)
 * 
 * @timeComplexity O(N * K log K) where K = max string length
 * @spaceComplexity O(N * K) for storing all strings
 */
function groupAnagrams(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();
  
  for (const str of strs) {
    // Create key by sorting characters
    const key = str.split('').sort().join('');
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(str);
  }
  
  return Array.from(groups.values());
}

/**
 * Alternative: Character frequency as key (faster for long strings)
 * 
 * @timeComplexity O(N * K) - no sorting needed
 */
function groupAnagramsOptimized(strs: string[]): string[][] {
  const groups = new Map<string, string[]>();
  
  for (const str of strs) {
    // Create frequency key: "a2b1c1" for "abac"
    const freq = new Array(26).fill(0);
    for (const char of str) {
      freq[char.charCodeAt(0) - 97]++;
    }
    const key = freq.join('#'); // "1#0#0#0#1#0#..." for "ae"
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(str);
  }
  
  return Array.from(groups.values());
}
```

### Sample Input and Output
```
Input: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
```

---

## 6. Real World Applications 🌍

### 1. 🔐 Password Storage
```typescript
// Store hashed passwords, not plain text
const passwordHash = bcrypt.hash(password, 12);
// Lookup: O(1) to verify password
```

### 2. 📁 File Deduplication
```typescript
// Hash file contents to detect duplicates
const fileHashes = new Map<string, string>(); // hash → filepath
const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
if (fileHashes.has(hash)) {
  console.log('Duplicate found:', fileHashes.get(hash));
}
```

### 3. 🌐 DNS Resolution
```typescript
// Domain → IP address lookup
const dnsCache = new Map<string, string>();
dnsCache.set('google.com', '142.250.185.78');
// Instant lookup vs querying DNS servers
```

### 4. 🔄 LRU Cache Implementation
```typescript
// Combine hash table with doubly linked list
// O(1) get and O(1) put with eviction
class LRUCache {
  private cache = new Map<number, ListNode>();
  private head: ListNode;
  private tail: ListNode;
  // ...
}
```

---

## 7. Complexity Analysis 🧠

### JavaScript/TypeScript Hash Structures

| Structure | Key Type | Ordered | Use Case |
|-----------|----------|---------|----------|
| `Object` | String/Symbol only | No | Simple key-value |
| `Map` | Any type | Insertion order | General purpose ✓ |
| `Set` | Any type | Insertion order | Unique values |
| `WeakMap` | Objects only | No | Memory-safe caching |
| `WeakSet` | Objects only | No | Tracking objects |

### Common Hash Table Patterns

```typescript
// Pattern 1: Frequency Counter
function characterFrequency(s: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const char of s) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }
  return freq;
}

// Pattern 2: Seen/Visited Tracking
function hasDuplicates(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}

// Pattern 3: Index Mapping
function firstUniqChar(s: string): number {
  const lastIndex = new Map<string, number>();
  for (let i = 0; i < s.length; i++) {
    lastIndex.set(s[i], i);
  }
  for (let i = 0; i < s.length; i++) {
    if (lastIndex.get(s[i]) === i) return i;
  }
  return -1;
}
```

### Interview Tips 💡

1. **Default to hash tables:** "Can I use a hash map to optimize this from O(N²) to O(N)?"
2. **Consider the key:** "What makes each item unique? That's my hash key."
3. **Watch for collisions:** "In worst case, all keys collide → O(N)."
4. **Know when NOT to use:** "Need sorted order? Use TreeMap instead."
5. **Space trade-off:** "Trading O(N) space for O(1) lookup time."
