# Tries (Prefix Trees) 🔤

## 1. The "Autocomplete" Analogy

When you type "app" in a search bar:
- It instantly suggests "apple", "application", "approve".
- It doesn't scan every word—it follows a **tree of letters**.

**This is a Trie.** A tree where each path from root to node represents a prefix. Used for fast prefix-based lookups.

---

## 2. The Core Concept

### Structure
```
        root
       /    \
      a      b
     /        \
    p          a
   / \          \
  p   r         t → "bat"
 /     \
l       o
|        \
e → "apple"  v → "approve"
```

### Operations Complexity

| Operation | Time |
|-----------|------|
| Insert word | O(L) |
| Search word | O(L) |
| Prefix search | O(L) |

L = Length of word

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "tree-dfs",
  "data": {
    "val": "root",
    "left": { "val": "a", "left": { "val": "p", "left": { "val": "p" } } },
    "right": { "val": "b", "right": { "val": "a", "right": { "val": "t" } } }
  }
}
```

---

## 4. Scenario A: Implement Trie

```typescript
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

class Trie {
  private root: TrieNode = new TrieNode();
  
  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEndOfWord = true;
  }
  
  search(word: string): boolean {
    const node = this.findNode(word);
    return node !== null && node.isEndOfWord;
  }
  
  startsWith(prefix: string): boolean {
    return this.findNode(prefix) !== null;
  }
  
  private findNode(str: string): TrieNode | null {
    let node = this.root;
    for (const char of str) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char)!;
    }
    return node;
  }
}
```

---

## 5. Scenario B: Autocomplete

```typescript
function autocomplete(trie: Trie, prefix: string): string[] {
  const results: string[] = [];
  const node = trie['findNode'](prefix);
  
  if (!node) return results;
  
  function dfs(current: TrieNode, path: string): void {
    if (current.isEndOfWord) results.push(path);
    
    for (const [char, child] of current.children) {
      dfs(child, path + char);
    }
  }
  
  dfs(node, prefix);
  return results;
}
```

---

## 6. Real World Applications 🌍

### 1. 🔍 Search Autocomplete (Google, IDE)
### 2. 📱 Spell Checkers
### 3. 🌐 IP Routing Tables
### 4. 🎮 Word Games (Scrabble solvers)

---

## 7. Complexity Analysis 🧠

### Trie vs HashMap

| Aspect | Trie | HashMap |
|--------|------|---------|
| Prefix search | O(L) ✓ | O(N * L) |
| Exact search | O(L) | O(1) ✓ |
| Space | Higher | Lower |
| Use case | Prefixes | Exact keys |
