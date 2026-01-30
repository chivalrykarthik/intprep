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

## 6. Real World Applications 🌍

### 1. 🔙 Browser History (Doubly Linked List)
The back/forward buttons navigate a doubly linked list of pages. Each page points to previous and next.

### 2. 🎵 Music Playlist
Circular linked lists implement "repeat all" functionality. The last song points back to the first.

### 3. 📝 Undo/Redo Stack
Each action is a node. Undo pops from the end; Redo pushes back.

### 4. 🧠 LRU Cache
Least Recently Used caches use doubly linked lists + hashmaps for O(1) access and eviction.

---

## 7. Complexity Analysis 🧠

### Array vs Linked List

| Aspect | Array | Linked List |
|--------|-------|-------------|
| Memory | Contiguous | Scattered |
| Access | O(1) by index | O(N) traverse |
| Insert/Delete at ends | O(1)* / O(N) | O(1) |
| Insert/Delete middle | O(N) | O(1)** |
| Memory overhead | Low | High (pointers) |
| Cache performance | Excellent | Poor |

### Common Linked List Patterns

1. **Two Pointers (Fast/Slow):** Cycle detection, find middle.
2. **Dummy Head:** Simplify edge cases for insertions.
3. **In-Place Reversal:** Reverse portions of the list.
4. **Merge Two Lists:** Combine sorted lists.
5. **Runner Technique:** Fast pointer ahead by K nodes.

### Interview Tips 💡

- **Always handle null:** Check `head`, `head.next` before accessing.
- **Draw the pointers:** Visualize before coding.
- **Use a dummy node:** Simplifies head manipulation.
- **Test edge cases:** Empty list, single node, cycle at different positions.
