# Fast and Slow Pointers The Tortoise and the Hare 🐢🐇

## 1. The "Tortoise and the Hare" Analogy

Imagine two runners on a race track: a **Tortoise** (slow) and a **Hare** (fast).

- If the track is a **straight line** to the finish, the Hare will just reach the end and stop. The Tortoise will never catch up.
- But if the track is **circular** (a loop), the Hare will eventually lap the Tortoise and run into them from behind.

**This is the Fast and Slow Pointers pattern.** By using two pointers moving at different speeds, we can prove if a path has a cycle (loop) or find specific points (like the middle) without needing extra memory to remember where we've been.

---

## 2. The Core Concept

In coding interviews, we use this to **detect cycles** in data structures like Linked Lists or Arrays, or to **find the middle** element.

**The "Brute Force" (Dumb) Way:**
You visit every node and store it in a `HashSet` (a list of visited places).
- "Have I been here before?" -> Check the list.
- **Problem:** This takes **O(N)** memory. If the list is huge, you run out of RAM.

**The "Fast & Slow" (Smart) Way:**
- Point `slow` and `fast` to the start.
- Move `slow` by 1 step.
- Move `fast` by 2 steps.
- If `fast` ever equals `slow`, there **is a cycle**.
- If `fast` reaches `null` (the end), there is **no cycle**.
- **Boom.** No extra memory needed.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the movement!
```visualizer
{
  "type": "two-pointer", 
  "data": [1, 2, 3, 4, 5, 6, 7],
  "speeds": [1, 2]
}
```

---

## 4. Scenario A: Cyclical List (The Classic) 
**Real-Life Scenario:** You are following a set of clues in a treasure hunt. You want to make sure the clues don't just lead you in circles forever.

**Technical Problem:** Given a linked list, return `true` if it has a cycle in it.

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
 * Detects if a linked list has a cycle.
 * 
 * @param head - The head node of the linked list.
 * @returns True if cycle exists, false otherwise.
 * 
 * @timeComplexity O(N) - In the worst case (no cycle), we visit each node. If cycle, we loop a constant number of times relative to cycle length.
 * @spaceComplexity O(1) - We only use two variables.
 */
function hasCycle(head: ListNode | null): boolean {
  if (!head || !head.next) return false;

  let slow: ListNode | null = head;
  let fast: ListNode | null = head;

  // While the fast runner still has track ahead of it
  while (fast && fast.next) {
      slow = slow!.next;        // Move 1 step
      fast = fast.next.next;    // Move 2 steps

      // If they meet, there is a cycle
      if (slow === fast) {
          return true;
      }
  }

  // Fast reached the end, so no cycle
  return false;
}

// Example Usage:
// Helper to create a linked list with a cycle
function createCycleList(values: number[], pos: number): ListNode | null {
    if (values.length === 0) return null;
    const head = new ListNode(values[0]);
    let current = head;
    let cycleNode: ListNode | null = null;
    if (pos === 0) cycleNode = head;

    for (let i = 1; i < values.length; i++) {
        current.next = new ListNode(values[i]);
        current = current.next;
        if (i === pos) cycleNode = current;
    }
    
    if (pos !== -1 && cycleNode) {
        current.next = cycleNode;
    }
    return head;
}

// Case 1: Cycle
const cycleHead = createCycleList([3, 2, 0, -4], 1);
console.log("Checking list [3, 2, 0, -4] with cycle at index 1...");
console.log("Has Cycle?", hasCycle(cycleHead));

// Case 2: No Cycle
const noCycleHead = createCycleList([1, 2, 3], -1);
console.log("Checking list [1, 2, 3] with no cycle...");
console.log("Has Cycle?", hasCycle(noCycleHead));
```
### Sample input and output
- **Input**: `head = [3,2,0,-4]`, `pos = 1` (tail connects to node index 1)
- **Output**: `true`

---

## 5. Scenario B: The Happy Number (Mathematical Loops)
**Real-Life Scenario:** You are checking a "magic" number property. You apply a rule repeatedly. If you get to 1, you win. If you get stuck in a never-ending loop of numbers, you lose.

**Technical Problem:** A "happy number" is one where the sum of squares of its digits eventually equals 1. If it loops endlessly in a cycle that excludes 1, it is not happy.

### TypeScript Implementation

```typescript
/**
 * Calculates sum of squares of digits.
 */
function sumSquares(n: number): number {
    let sum = 0;
    while (n > 0) {
        let digit = n % 10;
        sum += digit * digit;
        n = Math.floor(n / 10);
    }
    return sum;
}

/**
 * Determines if a number is "Happy".
 * 
 * @param n - The number to check
 * @returns True if happy, false if caught in a cycle
 * 
 * @timeComplexity O(log N) - Finding the next value depends on number of digits.
 * @spaceComplexity O(1) - Using Floyd's Cycle Detection instead of a HashSet.
 */
function isHappy(n: number): boolean {
    let slow = n;
    let fast = n;

    do {
        // Slow moves 1 step (applies transformation once)
        slow = sumSquares(slow);
        // Fast moves 2 steps (applies transformation twice)
        fast = sumSquares(sumSquares(fast));
    } while (slow !== fast);

    // If they met at 1, it's happy. If they met elsewhere, it's a cycle (unhappy).
    return slow === 1;
}

// Example Usage:
console.log("Is 19 a happy number?", isHappy(19));
console.log("Is 4 a happy number?", isHappy(4));
```
### Sample input and output
- **Input**: `n = 19` → 1² + 9² = 82 → 8² + 2² = 68 → 6² + 8² = 100 → 1² = **1** ✅
- **Output**: `true`
- **Input**: `n = 4` → 16 → 37 → 58 → 89 → 145 → 42 → 20 → **4** (cycle!) ❌
- **Output**: `false`

---

## 6. Real World Applications 🌍

### 1. 🚦 Network Routing loops
In computer networks, packets can sometimes get stuck in a routing loop, bouncing between routers forever. Algorithms similar to cycle detection help identify and break these infinite loops (like Time To Live - TTL, though that's a counter, the concept of detecting non-terminating paths is related).

### 2. 🛡️ Telemetry and Heartbeats
System monitoring often uses "heartbeat" signals. If a sequence of status updates starts repeating a pattern indicative of a stuck process (a "deadlock cycle"), automated watchdogs can restart the service.

---

## 7. Complexity Analysis 🧠

Why do we care about Fast & Slow Pointers?

### Time Complexity: O(N) ⚡
- **Brute Force:** O(N) to traverse.
- **Fast & Slow:** Also **O(N)**. The fast pointer traverses the list roughly once (or twice the speed). It's linear.

### Space Complexity: O(1) 💾
- **Brute Force:** O(N). You have to store *every single visited node* in a hash set to check for duplicates. For a list of 1 million items, that's massive overhead.
- **Fast & Slow:** **O(1)**. You only need two pointers (`slow`, `fast`). It uses almost zero memory regardless of the list size. This is the superpower.

---

## 8. Interview Tips 💡

1. **Recognize the trigger words.** "Cycle detection", "linked list loop", "circular array", "find the middle node", "happy number" — these all use Fast & Slow Pointers. The moment you see "cycle" or "middle", announce the pattern.
2. **Know Floyd's Phase 2 — finding the cycle START.** After detecting the cycle (slow === fast), reset one pointer to head. Move both at speed 1. Where they meet again is the **cycle entry point**. This is a common follow-up. Be ready to explain the math: if the non-loop portion has length `a` and the loop has length `c`, both pointers travel `a` more steps to meet at the start.
3. **Middle of linked list — the free trick.** When `fast` reaches the end, `slow` is at the middle. For even-length lists, `slow` points to the *second* middle node. This is used as a subroutine in Merge Sort of Linked Lists and Palindrome Linked List — mention these connections.
4. **Edge cases to mention proactively.** Empty list (`head === null`), single node (no cycle possible), two nodes with/without cycle, and the tail pointing to the head (cycle at position 0).
5. **This pattern works beyond linked lists.** Any problem where you repeatedly apply a function (`f(x) = next state`) and need to detect repetition is a Floyd's problem. Happy Number, Circular Array Loop, and even detecting cycles in functional graphs all use this.
6. **Explain why fast catches slow.** The relative speed between fast and slow is 1 step per iteration. So in a cycle of length C, fast "gains" 1 position per step, guaranteeing intersection within C iterations. This proves O(N) time.
7. **Compare with HashSet approach.** The HashSet approach also detects cycles in O(N) time but uses O(N) space. Fast & Slow achieves O(1) space. In an interview, implement Fast & Slow but *mention* the HashSet approach as the simpler alternative — this shows you weighed trade-offs.
