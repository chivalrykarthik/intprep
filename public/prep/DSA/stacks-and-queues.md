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

## 6. Real World Applications 🌍

### Stacks

#### 1. 🔙 Undo/Redo Functionality
Every action pushed to a stack. Ctrl+Z pops the last action and applies its reverse.

#### 2. 🌐 Browser Back Button
Each visited URL is pushed. Back button pops the current and shows the previous.

#### 3. 📞 Call Stack (Recursion)
Function calls are stacked. When a function returns, it's popped and control returns to the caller.

#### 4. 🧮 Expression Evaluation
Calculators use stacks to handle operator precedence and parentheses.

### Queues

#### 1. 🖨️ Print Queue
Documents printed in the order they were sent.

#### 2. 🌳 BFS Traversal
Nodes are queued level by level for breadth-first exploration.

#### 3. 📨 Message Queues (Kafka, RabbitMQ)
Distributed systems process messages in order.

#### 4. 🎮 Event Loop (JavaScript)
Events are queued and processed one by one.

---

## 7. Complexity Analysis 🧠

### Stack Implementations

| Implementation | Push | Pop | Peek |
|----------------|------|-----|------|
| Array (dynamic) | O(1)* | O(1) | O(1) |
| Linked List | O(1) | O(1) | O(1) |

*Amortized (occasional resize)

### Queue Implementations

| Implementation | Enqueue | Dequeue | Peek |
|----------------|---------|---------|------|
| Array (naive) | O(1) | O(N) | O(1) |
| Circular Array | O(1) | O(1) | O(1) |
| Linked List | O(1) | O(1) | O(1) |
| Two Stacks | O(1) | O(1)* | O(1)* |

*Amortized

### Variations

| Type | Description | Use Case |
|------|-------------|----------|
| **Deque** | Double-ended queue | Sliding window |
| **Priority Queue** | Sorted by priority | Dijkstra's algorithm |
| **Monotonic Stack** | Maintain sorted order | Next greater element |
| **Circular Queue** | Fixed-size, wraps around | Bounded buffers |

### Interview Tips 💡

- **Use stack for matching:** Parentheses, HTML tags, undo operations.
- **Use queue for ordering:** BFS, job scheduling, rate limiting.
- **Monotonic stack:** Finding next greater/smaller element in O(N).
- **Watch for empty stack errors:** Always check `isEmpty()` before `pop()`.
