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
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     ...
 * }
 */

/**
 * Merges K sorted lists using a Min Heap.
 * 
 * @param lists - Array of K sorted linked lists.
 * @returns Head of merged list.
 * 
 * @timeComplexity O(N log K) - N is total nodes, K is number of lists.
 * @spaceComplexity O(K) - Heap stores at most K elements.
 */
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    // 1. Min Heap to store nodes, ordered by val
    const minHeap = new MinPriorityQueue({ priority: (node) => node.val });

    // 2. Add head of every list to heap
    for (const head of lists) {
        if (head) minHeap.enqueue(head);
    }

    const dummy = new ListNode(0);
    let curr = dummy;

    // 3. Process Heap
    while (!minHeap.isEmpty()) {
        const smallestNode = minHeap.dequeue().element;
        
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
```

---

## 5. Scenario B: Smallest Range Covering Elements from K Lists
**Real-Life Scenario:** You have 3 teams working on a project. You want to find the shortest time window (e.g., "Tuesday to Thursday") during which *at least one member from every team* was online.

**Technical Problem:** You have `k` lists of sorted integers. Find the smallest range that includes at least one number from each of the `k` lists.

### TypeScript Implementation

```typescript
/**
 * Finds smallest range using K-way merge + sliding max tracking.
 */
function smallestRange(nums: number[][]): number[] {
    const minHeap = new MinPriorityQueue({ priority: x => x.val });
    let maxVal = -Infinity;
    
    // Init: Insert first element of each list
    // Element structure: { val, listIdx, itemIdx }
    for (let i = 0; i < nums.length; i++) {
        const val = nums[i][0];
        minHeap.enqueue({ val, listIdx: i, itemIdx: 0 });
        maxVal = Math.max(maxVal, val);
    }

    let start = 0, end = Infinity;

    while (minHeap.size() === nums.length) {
        const { val: minVal, listIdx, itemIdx } = minHeap.dequeue().element;

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
            // One list is exhausted, can't cover all K lists anymore
            break;
        }
    }

    return [start, end];
}
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
