# K-way Merge 🛤️

## 1. The "Multi-Lane Highway" Analogy

Imagine you are driving on a highway with **K lanes**.
- Each lane has a line of cars, sorted by speed (slowest in front).
- You want to merge all these lanes into **one single lane** where everyone is still sorted by speed.

You check the front car of *every* lane.
- "Lane 1 car is doing 30mph."
- "Lane 2 car is doing 25mph."
- "Lane 3 car is doing 40mph."
- You pick Lane 2's car (25mph) first. It enters the single lane.
- Now you look at the *new* front car of Lane 2 and compare again.

**This is the K-way Merge.** When you have `K` sorted lists, you don't just dump them all in a pile and sort again. You look at the "head" of each list, pick the smallest, and repeat.

---

## 2. The Core Concept

In coding interviews, we use this to **merge multiple sorted data structures** efficiently.

**The "Brute Force" (Dumb) Way:**
Combine all lists into one giant array and call `sort()`.
- Complexity: If total elements are N, sort takes **O(N log N)**.
- It completely ignores the fact that the individual lists were *already sorted*.

**The "K-way Merge" (Smart) Way:**
1. Put the **first** element of each of the K lists into a **Min Heap**.
2. While Heap is not empty:
   - Pop the smallest (root). Add to result.
   - If that element came from List X, push the **next** element from List X into the Heap.
- **Boom.** Complexity drops to **O(N log K)**. Since K (number of lists) is usually smaller than N (total elements), this is a huge win.

---

## 3. Interactive Visualization 🎮
Click "Next" to pick the smallest from the heads!

```visualizer
{
  "type": "k-way-merge", 
  "data": [
    [2, 6, 8],
    [3, 6, 7],
    [1, 3, 4]
  ]
}
```

---

## 4. Scenario A: Merge K Sorted Lists
**Real-Life Scenario:** You are aggregating daily logs from 50 different servers. Each server log is chronological (sorted by time). You want one master log file, also chronological.

**Technical Problem:** Given an array of `k` linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.

### TypeScript Implementation

```typescript
/**
 * Definition for singly-linked list node.
 */
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
    }
}

/**
 * Minimal MinHeap Implementation
 */
class MinHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }

    size(): number { return this.heap.length; }

    enqueue(val: T): void {
        this.heap.push(val);
        this.bubbleUp();
    }

    dequeue(): T | undefined {
        if (this.size() === 0) return undefined;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.size() > 0 && last !== undefined) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return min;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    private bubbleUp(): void {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    private bubbleDown(): void {
        let idx = 0;
        while (true) {
            const leftIdx = 2 * idx + 1;
            const rightIdx = 2 * idx + 2;
            let smallest = idx;

            if (leftIdx < this.heap.length && this.compare(this.heap[leftIdx], this.heap[smallest]) < 0) {
                smallest = leftIdx;
            }
            if (rightIdx < this.heap.length && this.compare(this.heap[rightIdx], this.heap[smallest]) < 0) {
                smallest = rightIdx;
            }

            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

/**
 * Merges K sorted lists using a Min Heap.
 */
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    // Min Heap to store nodes, ordered by val
    const minHeap = new MinHeap<ListNode>((a, b) => a.val - b.val);

    // Add head of every list to heap
    for (const head of lists) {
        if (head) minHeap.enqueue(head);
    }

    const dummy = new ListNode(0);
    let curr = dummy;

    // Process Heap
    while (!minHeap.isEmpty()) {
        const smallestNode = minHeap.dequeue();
        if (!smallestNode) break;
        
        // Add to result
        curr.next = smallestNode;
        curr = curr.next;

        // Add next node from the same list into heap
        if (smallestNode.next) {
            minHeap.enqueue(smallestNode.next);
        }
    }

    return dummy.next;
}

// Example Usage:
// Helper to create list from array
function createList(arr: number[]): ListNode | null {
    if (arr.length === 0) return null;
    const head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
        curr.next = new ListNode(arr[i]);
        curr = curr.next;
    }
    return head;
}

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

// Input: [[1,4,5],[1,3,4],[2,6]]
const l1 = createList([1, 4, 5]);
const l2 = createList([1, 3, 4]);
const l3 = createList([2, 6]);

console.log("Merging 3 lists:");
printList(l1);
printList(l2);
printList(l3);

const merged = mergeKLists([l1, l2, l3]);
console.log("Result:");
printList(merged);
```

---

## 5. Scenario B: Smallest Range Covering Elements from K Lists
**Real-Life Scenario:** You have 3 teams working on a project. You want to find the shortest time window (e.g., "Tuesday to Thursday") during which *at least one member from every team* was online.

**Technical Problem:** You have `k` lists of sorted integers. Find the smallest range that includes at least one number from each of the `k` lists.

### TypeScript Implementation

```typescript
/**
 * Minimal MinHeap Implementation
 */
class MinHeap<T> {
    private heap: T[] = [];
    private compare: (a: T, b: T) => number;

    constructor(compare: (a: T, b: T) => number) {
        this.compare = compare;
    }
    
    size(): number { return this.heap.length; }

    enqueue(val: T): void {
        this.heap.push(val);
        this.bubbleUp();
    }

    dequeue(): T | undefined {
        if (this.size() === 0) return undefined;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (this.size() > 0 && last !== undefined) {
            this.heap[0] = last;
            this.bubbleDown();
        }
        return min;
    }

    private bubbleUp(): void {
        let idx = this.heap.length - 1;
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.compare(this.heap[idx], this.heap[parentIdx]) < 0) {
                [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    private bubbleDown(): void {
        let idx = 0;
        while (true) {
            const leftIdx = 2 * idx + 1;
            const rightIdx = 2 * idx + 2;
            let smallest = idx;

            if (leftIdx < this.heap.length && this.compare(this.heap[leftIdx], this.heap[smallest]) < 0) {
                smallest = leftIdx;
            }
            if (rightIdx < this.heap.length && this.compare(this.heap[rightIdx], this.heap[smallest]) < 0) {
                smallest = rightIdx;
            }

            if (smallest !== idx) {
                [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
}

/**
 * Finds smallest range using K-way merge + sliding max tracking.
 */
function smallestRange(nums: number[][]): number[] {
    interface HeapItem {
        val: number;
        listIdx: number;
        itemIdx: number;
    }

    const minHeap = new MinHeap<HeapItem>((a, b) => a.val - b.val);
    let maxVal = -Infinity;
    
    // Init: Insert first element of each list
    for (let i = 0; i < nums.length; i++) {
        const val = nums[i][0];
        minHeap.enqueue({ val, listIdx: i, itemIdx: 0 });
        maxVal = Math.max(maxVal, val);
    }

    let start = 0, end = Infinity;

    while (minHeap.size() === nums.length) {
        const item = minHeap.dequeue();
        if (!item) break;
        
        const { val: minVal, listIdx, itemIdx } = item;

        // Check if current range is smaller
        if (maxVal - minVal < end - start) {
            start = minVal;
            end = maxVal;
        }

        // Push next element from the same list
        if (itemIdx + 1 < nums[listIdx].length) {
            const nextVal = nums[listIdx][itemIdx + 1];
            minHeap.enqueue({ val: nextVal, listIdx, itemIdx: itemIdx + 1 });
            maxVal = Math.max(maxVal, nextVal);
        } else {
            // One list is exhausted
            break;
        }
    }

    return [start, end];
}

// Example Usage:
const lists = [
    [4, 10, 15, 24, 26], 
    [0, 9, 12, 20], 
    [5, 18, 22, 30]
];
console.log("Lists:", lists);
console.log("Smallest Range:", smallestRange(lists));
```

---

## 6. Real World Applications 🌍

### 1. 📧 Email Inboxes (Unified View)
Apps like Outlook or Apple Mail that show "All Folders" essentially perform a K-way merge of your "Inbox", "Sent", "Drafts" (sorted by date) to show a unified timeline.

### 2. 🧬 DNA Sequencing
In bioinformatics, merging multiple sorted sequences of gene reads to assemble a longer sequence often uses variations of K-way merging logic.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(N log K) ⚡
- **N**: Total number of elements across all lists.
- **K**: Number of lanes (lists).
- Heap operations depend on height, which is `log K`. We do this N times.

### Space Complexity: O(K) 💾
- The heap only needs to hold one representative from each list at a time.
