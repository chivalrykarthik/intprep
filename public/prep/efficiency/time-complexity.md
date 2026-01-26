# Time Complexity

## 1. The "Phonebook" Analogy

Imagine you are looking for a friend's name, "Smith", in an old-school yellow pages phonebook.

**The "Brute Force" (Dumb) Way:**
You start at the very first page, read every single name line-by-line, page-by-page, until you find "Smith". If the phonebook has 1,000 pages, this takes forever. If "Smith" is on the last page, you've wasted your whole day.

**The "Time Complexity" (Smart) Way:**
You open the book roughly in the middle. You see "M". Since "S" comes after "M", you ignore the entire first half. You split the remaining half in the middle again. You repeat this until you land on "Smith". Even with a million pages, you find it in seconds.

**This is Time Complexity.** It measures how the time to solve a problem grows as the input (the phonebook size) gets larger. It's not about seconds; it's about **steps**.

---

## 2. The Core Concept

In coding interviews, we use **Big O Notation** to describe this growth. We want to solve problems in the fewest steps possible.

**The "Brute Force" (O(N)) Way:**
If you have `N` items, you check all `N` items.
- 10 items -> 10 steps.
- 1,000 items -> 1,000 steps.
- **Linear Growth.** Slow and steady, but becomes painfully slow with big data.

**The "Efficient" (O(log N)) Way:**
You cut the problem in half every time.
- 10 items -> ~4 steps.
- 1,000 items -> ~10 steps.
- 1,000,000 items -> ~20 steps.
- **Logarithmic Growth.** Insanely fast for huge datasets.

---

## 3. Interactive Visualization 🎮
Click "Next" to see **Binary Search** in action! Observe how quickly we zero in on the target compared to checking every single box.

```visualizer
{
  "type": "binary-search", 
  "data": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
  "target": 23
}
```

---

## 4. Scenario A: The "Just Check Everything" Approach (Linear Search)

**Real-Life Scenario:** You have a messy drawer of socks and you need to find a matching red pair. You pull them out one by one until you find it.

**Technical Problem:** Given an unsorted array of numbers, find the index of a specific number.

### TypeScript Implementation

```typescript
/**
 * Linear Search - Checks every element until a match is found.
 * 
 * @param arr - The array to search through
 * @param target - The value we are looking for
 * @returns The index of the target, or -1 if not found
 * 
 * @timeComplexity O(N) - In the worst case, we check every single element.
 * @spaceComplexity O(1) - We don't use any extra memory scaling with input.
 */
function linearSearch(arr: number[], target: number): number {
  // Simple iteration
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i; // Found it!
    }
  }
  return -1; // Element not found
}
```

---

## 5. Scenario B: The "Divide and Conquer" Approach (Binary Search)

**Real-Life Scenario:** Looking up a word in a dictionary. You flip to the middle, check the word, and decide which half to discard.

**Technical Problem:** Given a **sorted** array of numbers, find the index of a specific number efficiently.

### TypeScript Implementation

```typescript
/**
 * Binary Search - Repeatedly divides the search interval in half.
 * 
 * @param arr - A SORTED array of numbers
 * @param target - The value we are looking for
 * @returns The index of the target, or -1 if not found
 * 
 * @timeComplexity O(log N) - Each step cuts the problem size by half.
 * @spaceComplexity O(1) - We only store a few pointers (left, right, mid).
 */
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid; // Found it!
    }
    
    // If target is greater, ignore left half
    if (arr[mid] < target) {
      left = mid + 1;
    } 
    // If target is smaller, ignore right half
    else {
      right = mid - 1;
    }
  }

  return -1; // Not found
}
```

---

## 6. Real World Applications 🌍

### 1. 🚦 Database Indexing
When you query a database for a user by their ID, the database doesn't scan millions of rows (O(N)). It uses B-Trees or Hash Indexes (O(log N) or O(1)) to jump straight to the record. This is why primary keys heavily rely on efficient time complexity concepts.

### 2. 🔍 Autocomplete & Typeahead
When you type into Google, it suggests completions instantly. It uses Trie data structures (effecient time complexity) to traverse possible words based on your prefix, rather than scanning a dictionary of every word in English starting with 'a'...

---

## 7. Complexity Analysis 🧠

Why do we care about **Time Complexity**?

### Time Complexity Examples ⚡
- **O(1) (Constant):** Accessing an array index `arr[5]`. Instant.
- **O(log N) (Logarithmic):** Binary search. fast.
- **O(N) (Linear):** Looping through a list. Okay for small data.
- **O(N^2) (Quadratic):** Nested loops (Bubble sort). Avoid for large data!

### Space Complexity: O(1) vs O(N) 💾
- **O(1):** Using a few variables.
- **O(N):** Creating a new array that copies the input.
We always trade off Time vs Space. Sometimes using more memory (Space O(N)) gives us a faster algorithm (Time O(1)).
