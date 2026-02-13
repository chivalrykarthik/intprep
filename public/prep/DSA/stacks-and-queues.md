# Stacks and Queues 📚

## 1. The "Cafeteria" Analogy

Picture a **cafeteria** with two serving systems:

**The Stack (Plate Dispenser):**
- Plates are **stacked** on top of each other.
- You can ONLY take the **top** plate (Last In, First Out - LIFO).
- Adding a plate? Put it on **top**.
- Like Ctrl+Z: the last action you did is the first to undo.

**The Queue (Food Line):**
- People stand in a **line**.
- The person who arrived **first** gets served first (First In, First Out - FIFO).
- New people join at the **back**.
- Like a printer queue: jobs processed in order received.

**These are fundamental data structures.** Stacks manage "undo" operations, recursion, and parsing. Queues handle scheduling, BFS, and message processing.

---

## 2. The Core Concept

### Stack Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `push(x)` | Add element to top | O(1) |
| `pop()` | Remove & return top | O(1) |
| `peek()` | View top without removing | O(1) |
| `isEmpty()` | Check if empty | O(1) |

### Queue Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `enqueue(x)` | Add element to back | O(1) |
| `dequeue()` | Remove & return front | O(1) |
| `peek()` | View front without removing | O(1) |
| `isEmpty()` | Check if empty | O(1) |

---

## 3. Interactive Visualization 🎮
Click "Next" to see BFS traversal using a Queue!

```visualizer
{
  "type": "tree-bfs",
  "data": {
    "val": 1,
    "left": { "val": 2, "left": { "val": 4 }, "right": { "val": 5 } },
    "right": { "val": 3, "left": { "val": 6 }, "right": { "val": 7 } }
  }
}
```

---

## 4. Scenario A: Valid Parentheses (Stack)

**Real-Life Scenario:** You're a code editor checking if all brackets are properly matched and nested.

**Technical Problem:** Given a string containing just `()[]{}`, determine if the input string is valid.

### TypeScript Implementation

```typescript
/**
 * Checks if brackets are valid using a Stack.
 * 
 * @param s - String containing brackets
 * @returns True if valid
 * 
 * @timeComplexity O(N) - Single pass through string.
 * @spaceComplexity O(N) - Stack can hold all opening brackets.
 */
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{'
  };
  
  for (const char of s) {
    if (char === '(' || char === '[' || char === '{') {
      // Opening bracket: push to stack
      stack.push(char);
    } else {
      // Closing bracket: check if matches top of stack
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }
  
  // Valid if stack is empty (all brackets matched)
  return stack.length === 0;
}

// Example Usage:
console.log("()[]{}:", isValid("()[]{}")); // true
console.log("([)]:", isValid("([)]"));     // false
console.log("{[]}:", isValid("{[]}"));     // true
console.log("((:", isValid("(("));         // false
```

### Sample input and output
- Input: `"([{}])"`
- Output: `true`

---

## 5. Scenario B: Implement Queue using Stacks

**Real-Life Scenario:** You only have plate dispensers (stacks), but you need to serve people in line order (queue).

**Technical Problem:** Implement a first in first out (FIFO) queue using only two stacks.

### TypeScript Implementation

```typescript
/**
 * Queue implemented using two stacks.
 * 
 * Amortized O(1) for all operations.
 */
class MyQueue {
  private stackIn: number[] = [];   // For pushing
  private stackOut: number[] = [];  // For popping
  
  /**
   * Push element to back of queue.
   * @timeComplexity O(1)
   */
  push(x: number): void {
    this.stackIn.push(x);
  }
  
  /**
   * Remove and return front element.
   * @timeComplexity Amortized O(1)
   */
  pop(): number {
    this.transferIfNeeded();
    return this.stackOut.pop()!;
  }
  
  /**
   * Get front element without removing.
   * @timeComplexity Amortized O(1)
   */
  peek(): number {
    this.transferIfNeeded();
    return this.stackOut[this.stackOut.length - 1];
  }
  
  /**
   * Check if queue is empty.
   * @timeComplexity O(1)
   */
  empty(): boolean {
    return this.stackIn.length === 0 && this.stackOut.length === 0;
  }
  
  /**
   * Transfer elements from stackIn to stackOut (reverses order).
   * Only transfers when stackOut is empty.
   */
  private transferIfNeeded(): void {
    if (this.stackOut.length === 0) {
      while (this.stackIn.length > 0) {
        this.stackOut.push(this.stackIn.pop()!);
      }
    }
  }
}

// Example Usage:
const queue = new MyQueue();
queue.push(1);
queue.push(2);
queue.push(3);
console.log("Peek:", queue.peek());   // 1 (front of queue)
console.log("Pop:", queue.pop());     // 1
console.log("Pop:", queue.pop());     // 2
console.log("Empty:", queue.empty()); // false
```

### How It Works (Visual):
```
push(1), push(2), push(3):
  stackIn:  [1, 2, 3] (top is right)
  stackOut: []

pop():
  Transfer to stackOut: [3, 2, 1] (now 1 is on top)
  Pop from stackOut: returns 1
  stackOut: [3, 2]
```

---

## 6. Scenario C: Min Stack — O(1) getMin

**Real-Life Scenario:** A temperature tracking system that needs to instantly report the coldest temperature seen so far, updating in real time as readings come in.

**Technical Problem:** Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) time.

### TypeScript Implementation

```typescript
/**
 * MinStack — Stack with O(1) min retrieval.
 * 
 * Trick: Maintain a SECOND stack that tracks minimums.
 * When pushing, also push to minStack IF the value is ≤ current min.
 * When popping, also pop from minStack if the popped value === current min.
 * 
 * @timeComplexity O(1) for ALL operations
 * @spaceComplexity O(N) — Two stacks
 */
class MinStack {
  private stack: number[] = [];
  private minStack: number[] = []; // Tracks minimums

  push(val: number): void {
    this.stack.push(val);
    // Push to minStack if it's empty or val ≤ current min
    if (this.minStack.length === 0 || val <= this.getMin()) {
      this.minStack.push(val);
    }
  }

  pop(): void {
    const val = this.stack.pop()!;
    // If popped value is the current min, pop from minStack too
    if (val === this.getMin()) {
      this.minStack.pop();
    }
  }

  top(): number {
    return this.stack[this.stack.length - 1];
  }

  getMin(): number {
    return this.minStack[this.minStack.length - 1];
  }
}

// Usage:
const ms = new MinStack();
ms.push(-2);
ms.push(0);
ms.push(-3);
console.log(ms.getMin()); // -3
ms.pop();
console.log(ms.top());    // 0
console.log(ms.getMin()); // -2 (still knows the min!)
```

---

## 7. Scenario D: Monotonic Stack — Next Greater Element

**Real-Life Scenario:** You're in a queue at a theme park. For each person, find the next person who is taller than them (they can see over you!).

**Technical Problem:** For each element in an array, find the next element to the right that is GREATER. If none exists, return -1.

### TypeScript Implementation

```typescript
/**
 * Next Greater Element using Monotonic Decreasing Stack.
 * 
 * A "monotonic stack" maintains elements in sorted order.
 * Here, the stack holds indices of elements in DECREASING order.
 * 
 * When we encounter a larger element, it "resolves" everything
 * in the stack that is smaller — those now have their "next greater".
 * 
 * @param nums - Input array
 * @returns Array where result[i] = next greater element of nums[i]
 * 
 * @timeComplexity O(N) — Each element pushed and popped at most once
 * @spaceComplexity O(N) — Stack + result array
 */
function nextGreaterElement(nums: number[]): number[] {
  const result = new Array(nums.length).fill(-1);
  const stack: number[] = []; // Stack of INDICES (decreasing values)

  for (let i = 0; i < nums.length; i++) {
    // Pop all elements smaller than current — they've found their answer
    while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[i]) {
      const idx = stack.pop()!;
      result[idx] = nums[i];
    }
    stack.push(i);
  }

  // Elements remaining in stack have no next greater element (-1)
  return result;
}

// Example:
const temperatures = [73, 74, 75, 71, 69, 72, 76, 73];
console.log("Temps:", temperatures);
console.log("Next Greater:", nextGreaterElement(temperatures));
// [74, 75, 76, 72, 72, 76, -1, -1]

// Walkthrough:
// i=0 (73): stack=[], push. stack=[0]
// i=1 (74): 74>73, pop 0→result[0]=74. stack=[1]
// i=2 (75): 75>74, pop 1→result[1]=75. stack=[2]
// i=3 (71): 71<75, push. stack=[2,3]
// i=4 (69): 69<71, push. stack=[2,3,4]
// i=5 (72): 72>69, pop 4→result[4]=72. 72>71, pop 3→result[3]=72. stack=[2,5]
// i=6 (76): 76>72, pop 5→result[5]=76. 76>75, pop 2→result[2]=76. stack=[6]
// i=7 (73): 73<76, push. stack=[6,7]
// Done: indices 6,7 remain → result[6]=result[7]=-1
```

### Daily Temperatures Variant

```typescript
/**
 * "How many days until a warmer day?"
 * Same monotonic stack idea, but return INDEX DIFFERENCE instead of value.
 */
function dailyTemperatures(temps: number[]): number[] {
  const result = new Array(temps.length).fill(0);
  const stack: number[] = [];

  for (let i = 0; i < temps.length; i++) {
    while (stack.length > 0 && temps[stack[stack.length - 1]] < temps[i]) {
      const prevIdx = stack.pop()!;
      result[prevIdx] = i - prevIdx; // Days to wait
    }
    stack.push(i);
  }
  return result;
}
```

---

## 8. Real World Applications 🌍

### Stacks

#### 1. 🔙 Undo/Redo Functionality
Every action pushed to a stack. Ctrl+Z pops the last action and applies its reverse. The "redo" stack stores undone actions.

#### 2. 🌐 Browser Back Button
Each visited URL is pushed. Back button pops the current and shows the previous. Forward button pops from a second stack.

#### 3. 📞 Call Stack (Recursion)
Function calls are stacked. When a function returns, it's popped and control returns to the caller. Stack overflow = too deep recursion.

#### 4. 🧮 Expression Evaluation / Parsing
Calculators use stacks to handle operator precedence and parentheses. Compilers use stacks for syntax tree construction.

#### 5. 📊 Stock Span Problem
"How many consecutive days before today had a price ≤ today's price?" — Solved with a monotonic stack in O(N).

### Queues

#### 1. 🖨️ Print Queue / Task Scheduling
Documents printed in the order they were sent. OS process scheduler uses priority queues.

#### 2. 🌳 BFS Traversal
Nodes are queued level by level for breadth-first exploration. The core of shortest-path in unweighted graphs.

#### 3. 📨 Message Queues (Kafka, RabbitMQ, SQS)
Distributed systems process messages in order. Exactly-once delivery, at-least-once, at-most-once semantics.

#### 4. 🎮 Event Loop (JavaScript / Node.js)
Events are queued in the macrotask queue. Microtasks (Promises) have their own queue. Understanding this is essential for async JS.

---

## 9. Complexity Analysis 🧠

### Stack Implementations

| Implementation | Push | Pop | Peek | getMin |
|----------------|------|-----|------|--------|
| Array (dynamic) | O(1)* | O(1) | O(1) | O(N) |
| Linked List | O(1) | O(1) | O(1) | O(N) |
| MinStack (two stacks) | O(1) | O(1) | O(1) | O(1) ✓ |

*Amortized (occasional resize)

### Queue Implementations

| Implementation | Enqueue | Dequeue | Peek |
|----------------|---------|---------|------|
| Array (naive) | O(1) | O(N) ⚠️ | O(1) |
| Circular Array | O(1) | O(1) | O(1) |
| Linked List | O(1) | O(1) | O(1) |
| Two Stacks | O(1) | O(1)* | O(1)* |

*Amortized

### Important Variations

| Type | Description | Key Use Case |
|------|-------------|-------------|
| **Deque** | Double-ended queue (push/pop both ends) | Sliding window maximum |
| **Priority Queue** | Sorted by priority (heap-based) | Dijkstra, Top K, scheduling |
| **Monotonic Stack** | Maintains ascending/descending invariant | Next greater/smaller element |
| **Monotonic Deque** | Sliding window min/max in O(N) | Sliding window maximum |
| **Circular Queue** | Fixed-size, wraps around | Bounded buffers, ring buffers |

### Monotonic Stack Cheat Sheet

| Problem | Stack Type | What to Store |
|---------|-----------|---------------|
| Next Greater Element | Decreasing | Indices |
| Next Smaller Element | Increasing | Indices |
| Largest Rectangle in Histogram | Increasing | Indices (heights) |
| Stock Span | Decreasing | Indices (prices) |
| Daily Temperatures | Decreasing | Indices (temps) |
| Trapping Rain Water | Both / Two-pointer | Indices or heights |

### Interview Tips 💡

1. **Parentheses = Stack.** If you see matching/nesting of any kind (brackets, HTML tags, expressions), use a stack.
2. **"Next greater/smaller" = Monotonic Stack.** Single pass O(N) solution. Stack holds candidates in sorted order.
3. **Queue from two stacks**: Amortized O(1) — each element is pushed/popped at most twice total (once per stack).
4. **Min Stack pattern:** Keep a parallel stack tracking minimums. When popping, check if you need to pop the min too.
5. **BFS = Queue, DFS = Stack.** Always. BFS uses explicit queue. DFS can use the call stack (recursion) or explicit stack.
6. **Sliding Window Maximum** (Hard): Use a monotonic DEQUE (double-ended queue). Front = max of current window. O(N) total.
7. **Common stack interview problems:** Valid Parentheses, Min Stack, Daily Temperatures, Largest Rectangle in Histogram, Trapping Rain Water, Evaluate Reverse Polish Notation.
