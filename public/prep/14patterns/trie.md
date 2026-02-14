# Trie (Prefix Tree) 🌳

## 1. The "Phone Book Autocomplete" Analogy

Imagine typing on your phone. You press **"C"**, and it suggests: "Call", "Cat", "Car". You press **"A"** next ("CA"), and now it shows: "Call", "Cat", "Car". You type **"L"** ("CAL"), and it narrows to: "Call", "California".

How does this work so fast with millions of words?

**The Dumb Way:** For each keystroke, scan every word in the dictionary and check if it starts with the current prefix.
- Dictionary of 100,000 words, checking prefix match for each: **O(N × L)** per keystroke. Slow.

**The Smart Way (Trie):** Build a **tree** where each node is a letter, and paths from root to leaves spell out words. To find all words starting with "CAL":
1. Start at root. Follow edge "C".
2. Follow edge "A".
3. Follow edge "L".
4. Everything below this node is a match. **Boom.**
- Lookup time: **O(L)** where L is the prefix length. Doesn't depend on dictionary size at all!

**This is a Trie (pronounced "try").** A tree-based data structure where each path from root represents a prefix. It enables O(L) lookups regardless of how many words are stored.

---

## 2. The Core Concept

In coding interviews, we use Tries for **autocomplete**, **spell-checking**, **word search**, **IP routing** (longest prefix match), and **word games** (Boggle/Scrabble).

**The "HashMap" Alternative:**
Store all words in a HashSet.
- Exact lookup: **O(L)** — great!
- Prefix search ("all words starting with 'pre'"): **O(N)** — must scan everything.
- No structured traversal of related words.

**The "Trie" (Smart) Way:**
1. **Insert:** Walk down the tree, creating nodes for missing letters.
2. **Search:** Walk down the tree, following edges. If you can follow the whole word and the last node is marked "end", the word exists.
3. **StartsWith (Prefix):** Walk down the tree. If you can follow the whole prefix, at least one word exists with that prefix.
- **Boom.** All operations are **O(L)** where L = word length.

### Trie Node Structure
```
        (root)
       /   |   \
      a    b    c
     /     |     \
    p      a      a
   / \     |      |
  p   r    t      r
  |        |
  l        s
  |
  e
```
Words: "apple", "april", "bat", "bats", "car"

---

## 3. Interactive Visualization 🎮
Click "Next" to see words being inserted into the Trie!

```visualizer
{
  "type": "tree-dfs",
  "data": {
    "val": 0,
    "left": {
      "val": 1,
      "left": { "val": 3, "left": { "val": 7 } },
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

## 4. Scenario A: Implement a Trie (The Classic)
**Real-Life Scenario:** You're building the autocomplete engine for a search bar. You need to support three operations: adding a word, checking if an exact word exists, and checking if any word starts with a given prefix.

**Technical Problem:** Implement the `Trie` class with `insert(word)`, `search(word)`, and `startsWith(prefix)`.

### TypeScript Implementation

```typescript
/**
 * Trie Node: Each node represents a character in the tree.
 */
class TrieNode {
    children: Map<string, TrieNode>;
    isEndOfWord: boolean;

    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
    }
}

/**
 * Trie (Prefix Tree) Implementation.
 *
 * @timeComplexity O(L) for insert, search, startsWith — where L = word/prefix length.
 * @spaceComplexity O(N * L) worst case — N words of average length L (if no shared prefixes).
 */
class Trie {
    private root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    /**
     * Inserts a word into the trie.
     * @param word - The word to insert.
     */
    insert(word: string): void {
        let current = this.root;

        for (const char of word) {
            // If this character path doesn't exist, create it
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char)!;
        }

        // Mark the last node as end of a complete word
        current.isEndOfWord = true;
    }

    /**
     * Returns true if the exact word exists in the trie.
     * @param word - The word to search for.
     */
    search(word: string): boolean {
        const node = this.findNode(word);
        return node !== null && node.isEndOfWord;
    }

    /**
     * Returns true if any word in the trie starts with the given prefix.
     * @param prefix - The prefix to check.
     */
    startsWith(prefix: string): boolean {
        return this.findNode(prefix) !== null;
    }

    /**
     * Helper: Traverses the trie following the given string.
     * Returns the node at the end, or null if path doesn't exist.
     */
    private findNode(str: string): TrieNode | null {
        let current = this.root;

        for (const char of str) {
            if (!current.children.has(char)) {
                return null; // Path doesn't exist
            }
            current = current.children.get(char)!;
        }

        return current;
    }
}

// Example Usage:
const trie = new Trie();
trie.insert("apple");
trie.insert("app");
trie.insert("april");

console.log("search('apple'):", trie.search("apple"));     // true
console.log("search('app'):", trie.search("app"));         // true
console.log("search('ap'):", trie.search("ap"));           // false (prefix, not complete word)
console.log("startsWith('ap'):", trie.startsWith("ap"));   // true
console.log("startsWith('b'):", trie.startsWith("b"));     // false
```

### Sample input and output
- `insert("apple")`, `insert("app")`, `insert("april")`
- `search("apple")` → `true` | `search("ap")` → `false` | `startsWith("ap")` → `true`

---

## 5. Scenario B: Word Search II (Trie + Backtracking)
**Real-Life Scenario:** You're building a **Boggle/Scrabble** word finder. Given a board of letters and a dictionary, find all dictionary words that can be formed by moving to adjacent cells (up, down, left, right) without reusing a cell.

**Technical Problem:** Given an `m x n` board of characters and a list of `words`, return all words that can be found on the board.

### TypeScript Implementation

```typescript
/**
 * Finds all dictionary words that exist on the board using Trie + DFS.
 *
 * Why Trie? Without it, we'd search the board for each word independently (O(W * M * N * 4^L)).
 * With a Trie, we build the dictionary once and prune DFS branches early
 * when the current path isn't a prefix of any word.
 *
 * @param board - 2D grid of characters.
 * @param words - Dictionary of words to find.
 * @returns Array of found words.
 *
 * @timeComplexity O(M * N * 4^L) where L = max word length. Trie pruning makes it much faster in practice.
 * @spaceComplexity O(W * L) for the Trie — W words of average length L.
 */
function findWords(board: string[][], words: string[]): string[] {
    // 1. Build Trie from dictionary
    const root: Record<string, any> = {};

    for (const word of words) {
        let node = root;
        for (const char of word) {
            if (!node[char]) node[char] = {};
            node = node[char];
        }
        node.word = word; // Store complete word at leaf
    }

    const result: string[] = [];
    const rows = board.length;
    const cols = board[0].length;

    // 2. DFS from every cell
    function dfs(r: number, c: number, node: Record<string, any>): void {
        if (r < 0 || r >= rows || c < 0 || c >= cols) return;

        const char = board[r][c];
        if (char === '#' || !node[char]) return; // Visited or no Trie path

        const nextNode = node[char];

        // Found a complete word!
        if (nextNode.word) {
            result.push(nextNode.word);
            delete nextNode.word; // Avoid duplicates
        }

        // Mark visited
        board[r][c] = '#';

        // Explore 4 directions
        dfs(r + 1, c, nextNode);
        dfs(r - 1, c, nextNode);
        dfs(r, c + 1, nextNode);
        dfs(r, c - 1, nextNode);

        // Backtrack
        board[r][c] = char;
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            dfs(r, c, root);
        }
    }

    return result;
}

// Example Usage:
const board = [
    ['o','a','a','n'],
    ['e','t','a','e'],
    ['i','h','k','r'],
    ['i','f','l','v']
];
const dictionary = ["oath", "pea", "eat", "rain"];
console.log("Board:", board);
console.log("Found words:", findWords(board, dictionary));
```

### Sample input and output
- **Input**: Board (see above), `words = ["oath", "pea", "eat", "rain"]`
- **Output**: `["oath", "eat"]`

---

## 6. Real World Applications 🌍

### 1. 🔍 Search Engine Autocomplete
Google's search suggestions use Trie-like structures (or compressed variants like Radix Trees). As you type each character, the system traverses the prefix tree to find the top-ranked completions. With billions of queries, the O(L) lookup is essential.

### 2. 🛡️ IP Routing (Longest Prefix Match)
Network routers use **Patricia Tries** (compressed Tries) for IP routing decisions. When a packet arrives, the router finds the longest matching IP prefix in its routing table — a classic Trie application that happens billions of times per second across the internet.

### 3. 📝 Spell Checkers & Autocorrect
When you type "teh" and your phone suggests "the", it uses a Trie to find words within a small edit distance of your input. The Trie structure enables efficient traversal of all possible corrections without scanning the entire dictionary.

### 4. 🧬 DNA Sequence Matching
Bioinformatics tools use suffix tries to find patterns in DNA sequences. Given a genome of billions of characters, a suffix trie enables O(L) pattern matching regardless of the genome size.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(L) per operation ⚡

| Operation | Time | Why |
|-----------|------|-----|
| **Insert** | O(L) | Walk L characters, create nodes as needed |
| **Search** | O(L) | Walk L characters, check end marker |
| **StartsWith** | O(L) | Walk L characters |
| **Delete** | O(L) | Walk L characters, clean up empty nodes |

**L = length of the word/prefix**, NOT the number of words stored. This is the superpower — a Trie with 1 million words still searches in O(L) time.

### Space Complexity: O(N × L) 💾
- **N** = number of words, **L** = average word length.
- Each character in each word creates a node (worst case, no shared prefixes).
- **Optimization:** In practice, many words share prefixes ("app", "apple", "application" share "app"), so actual space is much less.
- **Further optimization:** Compressed Tries (Radix Trees) merge single-child chains into single nodes, dramatically reducing space.

---

## 8. Interview Tips 💡

1. **Recognize the trigger words.** "Prefix search", "autocomplete", "word dictionary", "word search board", "longest common prefix", "spell check" — all Trie problems. When the problem involves prefixes or dictionaries, Trie should be your first instinct over HashMap.
2. **Map vs. Array[26] for children — know the trade-off.** `Map<string, TrieNode>`: flexible (supports any character set — Unicode, numbers, etc.), slightly more memory per node. `Array(26)`: faster (direct indexing), less memory, but limited to lowercase English letters. In interviews, use Map for clarity, mention Array as an optimization.
3. **Trie vs. HashMap — articulate when Trie wins.** HashMap: O(L) exact lookup, O(N) prefix search (scan all keys). Trie: O(L) for both. Trie wins when you need prefix operations, autocomplete, or lexicographic ordering. HashMap wins for simple key-value lookups. State this comparison proactively.
4. **Deletion is the tricky operation.** You can't just delete the leaf — shared prefixes might be broken. Walk to the word's end, unmark `isEndOfWord`. Then clean up ancestor nodes that have no children and aren't end-of-word markers. This is rarely asked to implement but understanding it shows depth.
5. **Word Search II (Trie + Backtracking) is the hard mode.** Build a Trie from the dictionary, then DFS on the board using the Trie for pruning. Without Trie: O(W × M × N × 4^L) — search board for each word independently. With Trie: search all words simultaneously, pruning branches that aren't prefixes. This is the canonical Trie interview problem.
6. **Edge cases to mention proactively.** Empty string insertion/search (root node itself is end-of-word), single character words, a word that's a prefix of another ("app" + "apple"), and very long words (stack depth = word length for recursive implementations).
7. **Compressed Tries (Radix Trees) for production.** In a standard Trie, a chain like `a → p → p → l → e` uses 5 nodes. A Radix Tree compresses this to one node with edge label `"apple"`. This reduces memory by 2-10x for real dictionaries. Mention this when discussing scalability: *"For a production autocomplete system, I'd use a Radix Tree to reduce node count."*
