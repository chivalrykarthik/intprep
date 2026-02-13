# Linked Lists 🔗

## 1. The "Scavenger Hunt" Analogy

Imagine a **scavenger hunt** where each clue leads to the next location.

- **Each clue (node)** has two parts: the treasure at this spot (data) and directions to the next clue (pointer).
- To find the 5th treasure, you MUST follow clues 1 → 2 → 3 → 4 → 5. No shortcuts!
- But adding a new clue in the middle? Easy—just update the directions of the clue before it.
- The last clue points to "The End" (null).

**This is a Linked List.** A chain of nodes where each node points to the next. No random access, but insertions/deletions are cheap.

---

## 2. The Core Concept

In coding interviews, linked lists test your ability to handle **pointers** and **edge cases**.

**Singly Linked List:**
```
[Data|Next] → [Data|Next] → [Data|Next] → null
```

**Doubly Linked List:**
```
null ← [Prev|Data|Next] ⇄ [Prev|Data|Next] ⇄ [Prev|Data|Next] → null
```

### Key Operations Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| Access by index | O(N) | Must traverse from head |
| Insert at head | O(1) | Just update head pointer |
| Insert at tail | O(1)* | If you maintain a tail pointer |
| Insert in middle | O(1)** | If you have a reference to the node |
| Delete node | O(1)** | If you have a reference to the node |
| Search | O(N) | Linear traversal |

*O(N) if no tail pointer
**O(N) to find the position first

---

## 3. Interactive Visualization 🎮
Click "Next" to see linked list operations!

```visualizer
{
  "type": "linked-list",
  "data": [3, 1, 4, 1, 5, 9],
  "operation": "traverse"
}
```

---

## 4. Scenario A: Reverse a Linked List

**Real-Life Scenario:** You're reading a book backward to find a hidden message. Each page points to the previous one instead of the next.

**Technical Problem:** Reverse a singly linked list.

### TypeScript Implementation

```typescript
/**
 * Definition for singly-linked list node.
 */
class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val?: number, next?: ListNode | null) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}

/**
 * Reverses a linked list iteratively.
 * 
 * @param head - Head of the linked list
 * @returns New head (original tail)
 * 
 * @timeComplexity O(N) - Single pass through the list.
 * @spaceComplexity O(1) - Only three pointers used.
 */
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let current: ListNode | null = head;
  
  while (current !== null) {
    const nextTemp = current.next; // Store next
    current.next = prev;           // Reverse pointer
    prev = current;                // Move prev forward
    current = nextTemp;            // Move current forward
  }
  
  return prev; // New head
}

/**
 * Reverses a linked list recursively.
 * 
 * @timeComplexity O(N)
 * @spaceComplexity O(N) - Call stack
 */
function reverseListRecursive(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return head;
  
  const newHead = reverseListRecursive(head.next);
  head.next.next = head; // Point next node back to current
  head.next = null;      // Remove forward pointer
  
  return newHead;
}

// Example Usage:
function createList(arr: number[]): ListNode | null {
  if (arr.length === 0) return null;
  const head = new ListNode(arr[0]);
  let current = head;
  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
  }
  return head;
}

function printList(head: ListNode | null): string {
  const values: number[] = [];
  while (head) {
    values.push(head.val);
    head = head.next;
  }
  return values.join(" → ") + " → null";
}

const list = createList([1, 2, 3, 4, 5]);
console.log("Original:", printList(list));
console.log("Reversed:", printList(reverseList(list)));
```

### Sample input and output
- Input: `1 → 2 → 3 → 4 → 5 → null`
- Output: `5 → 4 → 3 → 2 → 1 → null`

---

## 5. Scenario B: Detect Cycle (Floyd's Algorithm)

**Real-Life Scenario:** You're walking in a forest and want to know if you're going in circles.

**Technical Problem:** Detect if a linked list has a cycle.

### TypeScript Implementation

```typescript
/**
 * Detects if a linked list has a cycle using Floyd's Tortoise and Hare.
 * 
 * @param head - Head of the linked list
 * @returns True if cycle exists
 * 
 * @timeComplexity O(N) - At most 2N iterations.
 * @spaceComplexity O(1) - Only two pointers.
 */
function hasCycle(head: ListNode | null): boolean {
  if (!head || !head.next) return false;
  
  let slow: ListNode | null = head;
  let fast: ListNode | null = head;
  
  while (fast && fast.next) {
    slow = slow!.next;       // Move 1 step
    fast = fast.next.next;   // Move 2 steps
    
    if (slow === fast) {
      return true; // They met = cycle exists
    }
  }
  
  return false; // Fast reached end = no cycle
}

/**
 * Finds the start of the cycle.
 * 
 * @returns The node where the cycle begins, or null
 */
function detectCycleStart(head: ListNode | null): ListNode | null {
  if (!head || !head.next) return null;
  
  let slow: ListNode | null = head;
  let fast: ListNode | null = head;
  
  // Phase 1: Detect cycle
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      // Phase 2: Find cycle start
      // Reset slow to head, move both at same speed
      slow = head;
      while (slow !== fast) {
        slow = slow!.next;
        fast = fast!.next;
      }
      return slow;
    }
  }
  
  return null;
}

// Example: Create list with cycle
function createCycleList(arr: number[], cycleIndex: number): ListNode | null {
  if (arr.length === 0) return null;
  
  const head = new ListNode(arr[0]);
  let current = head;
  let cycleNode: ListNode | null = null;
  
  if (cycleIndex === 0) cycleNode = head;
  
  for (let i = 1; i < arr.length; i++) {
    current.next = new ListNode(arr[i]);
    current = current.next;
    if (i === cycleIndex) cycleNode = current;
  }
  
  if (cycleNode) current.next = cycleNode; // Create cycle
  
  return head;
}

const cycleList = createCycleList([3, 2, 0, -4], 1);
console.log("Has Cycle:", hasCycle(cycleList)); // true
```

---

## 6. Scenario C: Merge Two Sorted Lists

**Real-Life Scenario:** You have two alphabetically sorted guest lists for a party. Merge them into one sorted master list.

**Technical Problem:** Merge two sorted linked lists into one sorted list (LeetCode #21 — appears in ~40% of interviews).

### TypeScript Implementation

```typescript
/**
 * Merge two sorted linked lists into one sorted list.
 * 
 * Uses a dummy head to simplify edge cases.
 * Compare current nodes, attach the smaller one, advance that pointer.
 * 
 * @timeComplexity O(N + M) — Visit each node once
 * @spaceComplexity O(1) — Only pointer manipulation, no copies
 */
function mergeTwoLists(
  list1: ListNode | null,
  list2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0); // Dummy head simplifies insertion
  let current = dummy;

  while (list1 && list2) {
    if (list1.val <= list2.val) {
      current.next = list1;
      list1 = list1.next;
    } else {
      current.next = list2;
      list2 = list2.next;
    }
    current = current.next;
  }

  // Attach remaining nodes (one list may be longer)
  current.next = list1 ?? list2;

  return dummy.next; // Skip the dummy
}

// Example Usage:
// List1: 1 → 2 → 4 → null
// List2: 1 → 3 → 4 → null
// Merged: 1 → 1 → 2 → 3 → 4 → 4 → null
```

---

## 7. Scenario D: LRU Cache (Linked List + HashMap)

**Real-Life Scenario:** Your browser can only cache 100 web pages in memory. When the 101st page is loaded, the Least Recently Used page is evicted. Accessing a cached page moves it to "most recent."

**Technical Problem:** Design a data structure with O(1) `get` and O(1) `put`, evicting the least recently used item when capacity is exceeded.

### TypeScript Implementation

```typescript
/**
 * LRU Cache — Doubly Linked List + HashMap.
 * 
 * Why this combination?
 * - HashMap: O(1) lookup by key
 * - Doubly Linked List: O(1) move-to-front, O(1) remove-from-back
 * 
 * Most recently used → HEAD ... TAIL → Least recently used (evict)
 * 
 * @timeComplexity O(1) for both get and put
 * @spaceComplexity O(capacity)
 */
class DListNode {
  key: number;
  value: number;
  prev: DListNode | null = null;
  next: DListNode | null = null;
  constructor(key: number, value: number) {
    this.key = key;
    this.value = value;
  }
}

class LRUCache {
  private capacity: number;
  private cache: Map<number, DListNode> = new Map();
  private head: DListNode; // Dummy head (most recent side)
  private tail: DListNode; // Dummy tail (least recent side)

  constructor(capacity: number) {
    this.capacity = capacity;
    // Dummy nodes simplify edge cases
    this.head = new DListNode(0, 0);
    this.tail = new DListNode(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;

    const node = this.cache.get(key)!;
    this.moveToFront(node); // Mark as recently used
    return node.value;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.value = value;
      this.moveToFront(node);
    } else {
      const newNode = new DListNode(key, value);
      this.cache.set(key, newNode);
      this.addToFront(newNode);

      if (this.cache.size > this.capacity) {
        const lru = this.tail.prev!; // Node before dummy tail
        this.removeNode(lru);
        this.cache.delete(lru.key);  // CRITICAL: also remove from map
      }
    }
  }

  private addToFront(node: DListNode): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private removeNode(node: DListNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private moveToFront(node: DListNode): void {
    this.removeNode(node);
    this.addToFront(node);
  }
}

// Usage Example:
const lru = new LRUCache(2);
lru.put(1, 1);      // cache: {1=1}
lru.put(2, 2);      // cache: {1=1, 2=2}
console.log(lru.get(1));  // 1 (moves 1 to front)
lru.put(3, 3);      // evicts key 2, cache: {1=1, 3=3}
console.log(lru.get(2));  // -1 (evicted!)
```

---

## 8. Real World Applications 🌍

### 1. 🔙 Browser History (Doubly Linked List)
The back/forward buttons navigate a doubly linked list of pages. Each page points to previous and next. Clicking a new link adds to the list and discards the "forward" chain.

### 2. 🎵 Music Playlist
Circular linked lists implement "repeat all" functionality. The last song points back to the first. Shuffle creates a random traversal order.

### 3. 📝 Undo/Redo (Text Editors)
Each action (insert, delete, format) is a node. Undo walks backward, Redo walks forward. The entire edit history is a doubly linked list.

### 4. 🧠 LRU Cache (Redis, Memcached, CDNs)
Least Recently Used caches use doubly linked lists + hashmaps for O(1) access and eviction. This is how browser caches, database query caches, and CDN edge caches work.

### 5. 🗑️ Memory Allocation (Free Lists)
Operating systems maintain "free lists" — linked lists of available memory blocks. When you call `malloc`, the OS traverses the free list to find a suitable block.

---

## 9. Complexity Analysis 🧠

### Array vs Linked List

| Aspect | Array | Linked List |
|--------|-------|-------------|
| Memory | Contiguous | Scattered |
| Access | O(1) by index | O(N) traverse |
| Insert/Delete at ends | O(1)* / O(N) | O(1) |
| Insert/Delete middle | O(N) | O(1)** |
| Memory overhead | Low | High (pointers) |
| Cache performance | Excellent | Poor |

*Amortized   **If you already have a pointer to the node

### Common Linked List Patterns

| # | Pattern | Key Idea | Example Problem |
|---|---------|----------|-----------------|
| 1 | **Fast/Slow Pointers** | Two speeds detect cycle, find middle | Linked List Cycle, Middle of List |
| 2 | **Dummy Head** | Avoids edge cases for head changes | Merge Two Lists, Remove Nth Node |
| 3 | **In-Place Reversal** | Reverse using prev/curr/next pointers | Reverse Linked List, Reverse K-Group |
| 4 | **Merge Two Lists** | Compare heads, attach smaller | Merge Two Sorted Lists, Sort List |
| 5 | **Runner (K ahead)** | Fast pointer starts K nodes ahead | Remove Nth Node From End |

### Interview Tips 💡

1. **Always use a dummy head:** When the head might change (insertions at front, deletions), a dummy node eliminates all special-case checks. `const dummy = new ListNode(0); dummy.next = head;`
2. **Draw before you code:** Sketch the nodes and arrows on paper. Update arrows step by step. This prevents 90% of pointer bugs.
3. **Handle null religiously:** Before accessing `node.next`, always check `node !== null`. The #1 runtime error in linked list problems.
4. **Know the LRU Cache cold:** It combines DLL + HashMap. O(1) get and put. This is asked at Google, Amazon, Meta — know it by heart.
5. **Fast/Slow always works:** To find the middle → slow moves 1, fast moves 2. When fast reaches end, slow is at middle. Also detects cycles (Floyd's).
6. **Merge pattern:** Use for Merge K Sorted Lists too (divide & conquer: merge pairs, then merge results).
7. **Recursion vs Iteration trade-off:** Recursive solutions are elegant but use O(N) stack space. Iterative is O(1) space. Always mention both in interviews.
