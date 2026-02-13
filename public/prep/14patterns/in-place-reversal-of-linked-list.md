# In-Place Reversal of Linked List ↩️

## 1. The "U-Turn in a One-Way Street" Analogy

Imagine a group of people standing in a line, each holding the shoulder of the person in front of them. This is a **Linked List**.
- Person A holds B's shoulder.
- Person B holds C's shoulder.

You want to reverse the line so everyone faces the other way.
**The Clumsy Way:** You ask everyone to break formation, go to a new room, and line up again in reverse order. (Uses extra space/room).

**The In-Place Way:** You walk down the line. You ask Person B to let go of C and grab A instead. Then you move to C and ask them to grab B.
- No one leaves the room.
- You just change who is holding whom.

**This is In-Place Reversal.** We strictly modify the `next` pointers of the nodes without using extra memory to store a copy of the list.

---

## 2. The Core Concept

In coding interviews, this pattern is essential for modifying Linked Lists efficiently.

**The "Brute Force" (Dumb) Way:**
1. Traverse the list and store all nodes in an Array or Stack.
2. Iterate through the array in reverse order to rebuild the list.
- **Problem:** Uses **O(N)** extra memory. If the list is 1GB, you need 2GB RAM.

**The "In-Place" (Smart) Way:**
Use three pointers: `prev`, `curr`, and `next`.
1. Save `next` node (so we don't lose the rest of the list).
2. Point `curr.next` backwards to `prev`.
3. Shift `prev` and `curr` forward.
- **Boom.** Reversed in **O(N)** time and **O(1)** space.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the pointers flip!

```visualizer
{
  "type": "linked-list", 
  "data": [1, 2, 3, 4, 5]
}
```

---

## 4. Scenario A: Reverse a Linked List (Classic)
**Real-Life Scenario:** You have a playlist of songs, but you hit "Reverse Order". The app doesn't download the songs again; it just flips the "Next Song" logic.

**Technical Problem:** Given the head of a singly linked list, reverse the list, and return the reversed list.

### TypeScript Implementation

```typescript
/**
 * Definition for singly-linked list node.
 */
class ListNode {
    val: number
    next: ListNode | null
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val===undefined ? 0 : val)
        this.next = (next===undefined ? null : next)
    }
}

/**
 * Reverses a linked list in-place.
 * 
 * @param head - The head of the list.
 * @returns The new head of the reversed list.
 * 
 * @timeComplexity O(N) - One pass through the list.
 * @spaceComplexity O(1) - No extra data structures used.
 */
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr: ListNode | null = head;

  while (curr !== null) {
      const nextTemp = curr.next; // 1. Save next
      
      curr.next = prev;           // 2. Reverse link
      
      prev = curr;                // 3. Move pointers
      curr = nextTemp;
  }

  return prev; // New head
}

// Example Usage:
// Helper to print list
function printList(head: ListNode | null): void {
    const values: number[] = [];
    let curr = head;
    while (curr) {
        values.push(curr.val);
        curr = curr.next;
    }
    console.log(values.join(" -> "));
}

// Create a list: 1 -> 2 -> 3 -> 4 -> 5
const head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
console.log("Original List:");
printList(head);

const reversedHead = reverseList(head);
console.log("Reversed List:");
printList(reversedHead);
```
### Sample input and output
- **Input**: `1 -> 2 -> 3 -> 4 -> 5`
- **Output**: `5 -> 4 -> 3 -> 2 -> 1`

---

## 5. Scenario B: Reverse Sub-list (The specific segment)
**Real-Life Scenario:** You check a roadmap. The route from City A to City B is standard, but the section from City C to City D is under construction and requires a detour that flows in the opposite direction of the original plan. You only reverse that specific segment.

**Technical Problem:** Reverse a linked list from position `left` to `right`.

### TypeScript Implementation

```typescript
/**
 * Definition for singly-linked list node.
 */
class ListNode {
    val: number
    next: ListNode | null
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val===undefined ? 0 : val)
        this.next = (next===undefined ? null : next)
    }
}

/**
 * Reverses a sub-list from position left to right.
 */
function reverseBetween(head: ListNode | null, left: number, right: number): ListNode | null {
    if (!head || left === right) return head;

    // Use a dummy node to handle edge case where head changes (i.e. left = 1)
    const dummy = new ListNode(0, head);
    let prev = dummy; // Checkpoint before the sublist

    // 1. Move prev to just before the sublist
    for (let i = 0; i < left - 1; i++) {
        prev = prev.next!;
    }

    // `curr` starts at the beginning of the sublist to be reversed
    let curr = prev.next; 

    // 2. Reverse the sublist
    // We reverse 'right - left' nodes.
    // In each step, we move the 'next' node to the front of the sublist.
    for (let i = 0; i < right - left; i++) {
        const nextNode = curr!.next;
        
        curr!.next = nextNode!.next;    // Point curr to skip nextNode
        nextNode!.next = prev.next;     // Insert nextNode at the front (after prev)
        prev.next = nextNode;           // Update prev to point to new front
    }

    return dummy.next;
}

// Example Usage:
// Helper to print list
function printList(head: ListNode | null): void {
    const values: number[] = [];
    let curr = head;
    while (curr) {
        values.push(curr.val);
        curr = curr.next;
    }
    console.log(values.join(" -> "));
}

// Create list: 1 -> 2 -> 3 -> 4 -> 5
const head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
console.log("Original List:");
printList(head);

// Reverse from position 2 to 4
const modifiedHead = reverseBetween(head, 2, 4);
console.log("List after reversing from 2 to 4:");
printList(modifiedHead);
```
### Sample input and output
- **Input**: `1 -> 2 -> 3 -> 4 -> 5`, `left = 2`, `right = 4`
- **Output**: `1 -> 4 -> 3 -> 2 -> 5` (only nodes at positions 2–4 are reversed)

---

## 6. Real World Applications 🌍

### 1. ↩️ Undo/Redo Functionality
In some text editors or apps, actions are stored in a linked list. "Undo" effectively traverses backwards (or reverses pointers temporarily) to the previous state.

### 2. 🖱️ Browser History
Although often a stack or doubly linked list, the concept of managing `back` and `forward` pointers when you navigate (especially if you branch off into a new history tree) involves pointer manipulation similar to reversal logic.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(N) ⚡
- We visit every node exactly once.

### Space Complexity: O(1) 💾
- We essentially use 3 variables (`prev`, `curr`, `next`) regardless of whether the list has 10 items or 10 million items.
