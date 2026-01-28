# Merge Sort

## 1. The "Card Dealer" Analogy

Imagine you have a messy deck of cards that you want to sort.

**The "Brute Force" Way:**  
You fan them all out and try to find the Ace, then the 2, then the 3... doing a lot of scanning.

**The "Merge Sort" Way:**  
1. **Divide**: You cut the deck in half. Then cut those halves in half. You keep cutting until you have 52 individual cards on the table. (A single card is technically "sorted").
2. **Merge**: You take two single cards, compare them, and put them in a small sorted pile.
3. You take two piles of 2 cards and merge them into a sorted pile of 4 side-by-side.
4. You keep merging these sorted piles together until you have one complete, sorted deck.

**This is Merge Sort.** Break the problem down to the smallest unit (1 element), then build it back up in sorted order.

---

## 2. The Core Concept

In coding interviews, we use this to **sort systematically with guaranteed efficiency**.

**The "Brute Force" (Dumb) Way:**
Insertion Sort or Selection Sort.
- *Time Complexity:* O(N²).
- Slow for large lists.

**The "Merge Sort" (Smart) Way:**
- **Step 1 (Divide):** Find the middle index, split list into left and right sublists. Recursively do this until lists are size 1.
- **Step 2 (Conquer/Merge):** Compare the first elements of the left and right sublists. Pick the smaller one and add it to a new result list. Repeat until one list is empty, then add the remainder of the other list.
- **Boom.** Guaranteed O(N log N) performance regardless of input.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the split-and-merge process!

```visualizer
{
  "type": "merge-sort", 
  "data": [6, 5, 3, 1, 8, 7, 2, 4]
}
```

---

## 4. Scenario A: Standard Merge Sort
**Real-Life Scenario:** You are organizing a library. You have two stacks of books that are ALREADY sorted alphabetically (Stack A and Stack B). You want to combine them into one master sorted shelf. You don't need to re-sort everything; just zip them together.

**Technical Problem:** Sort an array of `nums` in ascending order.

### TypeScript Implementation

```typescript
/**
 * mergeSort
 * Sorts an array using the Merge Sort algorithm.
 * 
 * @param nums - The array to sort
 * @returns The sorted array
 * 
 * @timeComplexity O(N log N) - We split log N times, and merge N elements at each level.
 * @spaceComplexity O(N) - We need temporary arrays for the merge step.
 */
function mergeSort(nums: number[]): number[] {
  // Base case: arrays with 0 or 1 element are already sorted
  if (nums.length <= 1) {
    return nums;
  }

  // 1. Divide
  const mid = Math.floor(nums.length / 2);
  const left = mergeSort(nums.slice(0, mid));
  const right = mergeSort(nums.slice(mid));

  // 2. Merge
  return merge(left, right);
}

/**
 * merge
 * Merges two sorted arrays into one sorted array.
 */
function merge(left: number[], right: number[]): number[] {
  const sorted: number[] = [];
  let i = 0; // Pointer for left
  let j = 0; // Pointer for right

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      sorted.push(left[i]);
      i++;
    } else {
      sorted.push(right[j]);
      j++;
    }
  }

  // Concatenate any remaining elements (one of these will be empty)
  return [...sorted, ...left.slice(i), ...right.slice(j)];
}

// Usage Example
const input = [5, 1, 1, 2, 0, 0];
console.log("Original:", input);
console.log("Sorted:", mergeSort([...input])); // Output: [0, 0, 1, 1, 2, 5]
```

### Sample input and output
Input: `nums = [5,1,1,2,0,0]`
Output: `[0,0,1,1,2,5]`

---

## 5. Scenario B: Sort Linked List
**Real-Life Scenario:** You have a chain of paperclips (Linked List) with numbers on them. You can't index directly to the middle like an array. Merge sort is perfect here because it doesn't require random access like Quick Sort does.

**Technical Problem:** Sort a linked list in O(N log N) time and O(1) space (using constant extra space, though recursion stack is O(log N)).

### TypeScript Implementation

```typescript
/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function sortList(head: ListNode | null): ListNode | null {
    if (!head || !head.next) return head;

    // 1. Divide: Find the middle using Slow/Fast pointers
    let prev: ListNode | null = null;
    let slow = head;
    let fast = head;

    while (fast && fast.next) {
        prev = slow;
        slow = slow!.next!;
        fast = fast.next.next!;
    }

    // Break the link to split into two lists
    if (prev) prev.next = null;

    // Recursively sort
    const l1 = sortList(head);
    const l2 = sortList(slow);

    // 2. Merge
    return mergeLists(l1, l2);
}

function mergeLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    const dummy = new ListNode();
    let tail = dummy;

    while (l1 && l2) {
        if (l1.val < l2.val) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }

    if (l1) tail.next = l1;
    if (l2) tail.next = l2;

    return dummy.next;
}

// Usage Example
class ListNode {
    val: number
    next: ListNode | null
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val===undefined ? 0 : val)
        this.next = (next===undefined ? null : next)
    }
}

// Helper to create list from array
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

// Helper to print list
function printList(head: ListNode | null) {
    const res = [];
    while (head) {
        res.push(head.val);
        head = head.next;
    }
    console.log(res);
}

const head = createList([4, 2, 1, 3]);
console.log("Original List:");
printList(head);

const sortedHead = sortList(head);
console.log("Sorted List:");
printList(sortedHead);
```

---

## 6. Real World Applications 🌍

### 1. 📂 External Sorting
When sorting massive datasets (e.g., 100GB file) that don't fit in RAM, Merge Sort is king. You break the file into chunks that fit in RAM, sort them, write them to disk, and then merge the sorted chunks.

### 2. 🛡️ Stable Sorts
Merge Sort is **stable**, meaning if two items have the same value, their original order is preserved. This is crucial for things like sorting a spreadsheet by "Last Name" then by "First Name". Quick Sort is usually unstable.

---

## 7. Complexity Analysis 🧠

Why choose Merge Sort?

### Time Complexity: O(N log N) ⚡
- **Every Case:** Best, Average, and Worst case are all O(N log N). It is predictable and reliable, unlike Quick Sort which can degrade to N².

### Space Complexity: O(N) 💾
- The downside: It requires O(N) auxiliary space to store the merged arrays during the process.
