# Tries (Prefix Trees) 🔤

## 1. The "Dictionary Autocomplete" Analogy

Imagine you're using the search bar on your phone:

**Without Trie (Scanning):**
- Type "app"
- System scans through 100,000 words checking each one
- "Does 'aardvark' start with 'app'? No. Does 'apple' start with 'app'? Yes!"
- Time: O(N × L) where N = total words, L = prefix length

**With Trie (Tree Traversal):**
- Type "app"
- Start at root, go to 'a' → 'p' → 'p'
- All words below this node start with "app"! (apple, application, approve...)
- Time: O(L) — independent of dictionary size!

**This is a Trie.** A tree-like data structure where each path from root represents a prefix, enabling lightning-fast prefix searches, autocomplete, and spell checking.

---

## 2. The Core Concept

In coding interviews, tries are essential for any problem involving prefix matching, word dictionaries, or autocomplete.

### Trie Structure

```
                root
              / |  \  \
             a  b   c   d
            /   |
           p    a
          / \    \
         p   r    t → "bat"
        /     \
       l       o
       |        \
       e → "apple"  v
                     \
                      e → "approve"
```

**Key Properties:**
- Each node represents a character
- Root is empty (represents "")
- Paths from root form words/prefixes
- Nodes may be marked as "end of word"
- Children typically stored in Map or array

### Operations Complexity

| Operation | Time Complexity | Space |
|-----------|-----------------|-------|
| Insert word | O(L) | O(L) for new nodes |
| Search exact word | O(L) | O(1) |
| Search prefix | O(L) | O(1) |
| Delete word | O(L) | O(1) |
| Autocomplete | O(L + K) | O(K) for results |

L = length of word/prefix, K = number of matching words

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "tree-dfs",
  "data": {
    "val": "root",
    "left": { 
      "val": "a", 
      "left": { 
        "val": "p", 
        "left": { "val": "p", "left": { "val": "l", "left": { "val": "e*" } } },
        "right": { "val": "r" }
      } 
    },
    "right": { 
      "val": "b", 
      "right": { "val": "a", "right": { "val": "t*" } } 
    }
  }
}
```

---

## 4. Scenario A: Implement Trie (LeetCode 208)

**Real-Life Scenario:** Build a dictionary that supports word insertion, exact search, and prefix matching.

**Technical Problem:** Implement a Trie with insert, search, and startsWith methods.

### TypeScript Implementation

```typescript
/**
 * Trie Node
 * 
 * Each node contains:
 * - children: Map of character → child node
 * - isEndOfWord: boolean marking complete words
 */
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

/**
 * Trie (Prefix Tree) Implementation
 * 
 * @example
 * const trie = new Trie();
 * trie.insert("apple");
 * trie.search("apple");   // true
 * trie.search("app");     // false (not a complete word)
 * trie.startsWith("app"); // true (prefix exists)
 */
class Trie {
  private root: TrieNode = new TrieNode();

  /**
   * Insert a word into the trie
   * 
   * @param word - Word to insert
   * @timeComplexity O(L) where L = word length
   * @spaceComplexity O(L) worst case (new nodes)
   */
  insert(word: string): void {
    let node = this.root;
    
    for (const char of word) {
      // Create node if doesn't exist
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    
    node.isEndOfWord = true; // Mark end of word
  }

  /**
   * Search for exact word match
   * 
   * @param word - Word to search
   * @returns true if word exists as complete word
   * @timeComplexity O(L)
   * @spaceComplexity O(1)
   */
  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEndOfWord;
  }

  /**
   * Check if any word starts with given prefix
   * 
   * @param prefix - Prefix to check
   * @returns true if any word has this prefix
   * @timeComplexity O(L)
   */
  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }

  /**
   * Helper: Navigate to the node representing given string
   * 
   * @param str - String to navigate to
   * @returns Node at end of path, or null if path doesn't exist
   */
  private findNode(str: string): TrieNode | null {
    let node = this.root;
    
    for (const char of str) {
      if (!node.children.has(char)) {
        return null; // Path doesn't exist
      }
      node = node.children.get(char)!;
    }
    
    return node;
  }

  /**
   * Delete a word from the trie
   * 
   * @param word - Word to delete
   * @returns true if word was deleted
   * @timeComplexity O(L)
   */
  delete(word: string): boolean {
    return this.deleteHelper(this.root, word, 0);
  }

  private deleteHelper(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) return false; // Word doesn't exist
      node.isEndOfWord = false;
      return node.children.size === 0; // Can delete if no children
    }

    const char = word[index];
    const childNode = node.children.get(char);
    if (!childNode) return false;

    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1);
    
    if (shouldDeleteChild) {
      node.children.delete(char);
      return node.children.size === 0 && !node.isEndOfWord;
    }

    return false;
  }
}

// Example usage
const trie = new Trie();
trie.insert("apple");
trie.insert("app");
trie.insert("application");
trie.insert("banana");

console.log(trie.search("apple"));       // true
console.log(trie.search("app"));         // true
console.log(trie.search("appl"));        // false (not complete word)
console.log(trie.startsWith("app"));     // true
console.log(trie.startsWith("ban"));     // true
console.log(trie.startsWith("xyz"));     // false
```

---

## 5. Scenario B: Autocomplete System

**Real-Life Scenario:** Build Google-like search suggestions that show top results as you type.

**Technical Problem:** Design a system that returns autocomplete suggestions for a given prefix.

### TypeScript Implementation

```typescript
/**
 * Autocomplete System
 * 
 * Extension of Trie that returns all words matching a prefix.
 * Optionally with ranking/frequency.
 */
class AutocompleteSystem {
  private trie: Trie = new Trie();
  private wordFrequency: Map<string, number> = new Map();

  constructor(words: string[], frequencies: number[]) {
    for (let i = 0; i < words.length; i++) {
      this.trie.insert(words[i]);
      this.wordFrequency.set(words[i], frequencies[i]);
    }
  }

  /**
   * Get autocomplete suggestions for prefix
   * 
   * @param prefix - The prefix typed by user
   * @param limit - Maximum suggestions to return
   * @returns Array of suggested words, sorted by frequency
   * 
   * @timeComplexity O(P + N) where P = prefix length, N = words with prefix
   */
  getSuggestions(prefix: string, limit: number = 5): string[] {
    const suggestions = this.getAllWordsWithPrefix(prefix);
    
    // Sort by frequency (descending)
    suggestions.sort((a, b) => 
      (this.wordFrequency.get(b) || 0) - (this.wordFrequency.get(a) || 0)
    );
    
    return suggestions.slice(0, limit);
  }

  /**
   * Get all words that start with given prefix
   * 
   * @param prefix - The prefix to match
   * @returns Array of all matching words
   */
  private getAllWordsWithPrefix(prefix: string): string[] {
    const results: string[] = [];
    const prefixNode = this.findPrefixNode(prefix);
    
    if (!prefixNode) return results;
    
    // DFS to find all words from this node
    this.collectWords(prefixNode, prefix, results);
    return results;
  }

  private findPrefixNode(prefix: string): TrieNode | null {
    let node = this.trie['root'];
    for (const char of prefix) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char)!;
    }
    return node;
  }

  private collectWords(node: TrieNode, current: string, results: string[]): void {
    if (node.isEndOfWord) {
      results.push(current);
    }
    
    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, current + char, results);
    }
  }

  /**
   * Record a search and update frequency
   */
  recordSearch(word: string): void {
    this.trie.insert(word);
    this.wordFrequency.set(word, (this.wordFrequency.get(word) || 0) + 1);
  }
}

// Example usage
const autocomplete = new AutocompleteSystem(
  ["hello", "help", "hell", "helicopter", "hero", "world"],
  [10, 20, 5, 3, 15, 8]
);

console.log(autocomplete.getSuggestions("hel", 3));
// ["help", "hello", "hell"] - sorted by frequency

autocomplete.recordSearch("help"); // User searched "help"
console.log(autocomplete.getSuggestions("hel", 3));
// ["help", "hello", "hell"] - help frequency increased


/**
 * Word Search II (LeetCode 212)
 * 
 * Find all words from dictionary that exist in a character grid.
 * Trie enables efficient backtracking.
 * 
 * @timeComplexity O(M * N * 4^L * W) where M*N = grid size, L = word length
 */
function findWords(board: string[][], words: string[]): string[] {
  // Build trie from word list
  const trie = new Trie();
  for (const word of words) {
    trie.insert(word);
  }

  const result = new Set<string>();
  const rows = board.length;
  const cols = board[0].length;

  function dfs(r: number, c: number, node: TrieNode, path: string): void {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    
    const char = board[r][c];
    if (char === '#' || !node.children.has(char)) return;

    const nextNode = node.children.get(char)!;
    const newPath = path + char;

    if (nextNode.isEndOfWord) {
      result.add(newPath);
    }

    // Mark visited
    board[r][c] = '#';

    // Explore neighbors
    dfs(r + 1, c, nextNode, newPath);
    dfs(r - 1, c, nextNode, newPath);
    dfs(r, c + 1, nextNode, newPath);
    dfs(r, c - 1, nextNode, newPath);

    // Restore
    board[r][c] = char;
  }

  // Start DFS from every cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dfs(r, c, trie['root'], '');
    }
  }

  return [...result];
}
```

---

## 6. Real World Applications 🌍

### 1. 🔍 Search Autocomplete (Google, IDEs)
```typescript
// As user types, show matching suggestions
const suggestions = autocomplete.getSuggestions(userInput);
```

### 2. 📱 Spell Checkers
```typescript
// Check if word exists, suggest corrections
function spellCheck(word: string): string[] {
  if (dictionary.search(word)) return []; // Correct
  
  // Suggest words within edit distance 1
  return getEditDistance1Words(word)
    .filter(w => dictionary.search(w));
}
```

### 3. 🌐 IP Routing Tables (Longest Prefix Match)
```typescript
// Route IP addresses to correct destination
function route(ip: string): string {
  // Find longest matching prefix in routing trie
  return routingTrie.longestPrefixMatch(ip);
}
```

### 4. 🎮 Word Games (Scrabble, Wordle)
```typescript
// Validate words and find playable words
function findPlayableWords(tiles: string[]): string[] {
  return generatePermutations(tiles)
    .filter(word => dictionary.search(word));
}
```

### 5. 🧬 Genomic Sequence Matching
```typescript
// DNA/RNA sequence prefix matching
const dnaTrie = new Trie();
dnaTrie.insert("ATGCGATC");
dnaTrie.startsWith("ATGC"); // true
```

---

## 7. Complexity Analysis 🧠

### Trie vs Other Data Structures

| Aspect | Trie | HashMap | Sorted Array |
|--------|------|---------|--------------|
| **Exact Search** | O(L) | O(1) ✓ | O(log N) |
| **Prefix Search** | O(L) ✓ | O(N × L) | O(log N + K) |
| **Autocomplete** | O(L + K) ✓ | O(N × L) | O(log N + K) |
| **Space** | O(ALPHABET × N × L) | O(N × L) | O(N × L) |
| **Ordered Iteration** | ✓ | ✗ | ✓ |

L = word length, N = number of words, K = results count

### Space Optimization

```typescript
// Array-based children (for lowercase letters only)
class TrieNodeOptimized {
  children: (TrieNodeOptimized | null)[] = new Array(26).fill(null);
  isEndOfWord: boolean = false;
  
  getChild(char: string): TrieNodeOptimized | null {
    return this.children[char.charCodeAt(0) - 97];
  }
  
  setChild(char: string, node: TrieNodeOptimized): void {
    this.children[char.charCodeAt(0) - 97] = node;
  }
}

// Compressed Trie (Radix Tree) - combine single-child chains
// "application" stored as: root → "app" → "lic" → "ation"
// Instead of: root → a → p → p → l → i → c → a → t → i → o → n
```

### Interview Tips 💡

1. **Recognize the pattern:** "Prefix matching? Autocomplete? Dictionary? → Trie."
2. **Know the trade-off:** "Tries use more space but excel at prefix operations."
3. **Implementation details:** "Use Map for sparse alphabets, array for dense (26 letters)."
4. **Common problems:** Word Search II, Implement Trie, Autocomplete System.
5. **Optimization:** "Compressed tries (radix trees) save space for common prefixes."
6. **Alternative:** "For simple prefix checks, sorted array with binary search works too."
