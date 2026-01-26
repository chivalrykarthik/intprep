# Subsets (Breadth-First Style) 🍱

## 1. The "Pizza Toppings" Analogy

Imagine you are ordering a pizza. The menu has three toppings: "Pepperoni", "Mushrooms", and "Onions".
You want to list *all possible pizzas* you could order.

1.  **Start empty:** Just cheese. `[]`
2.  **Add Pepperoni to everything so far:**
    - Taking `[]` -> Add Pepperoni -> `[Pepperoni]`
    - List is now: `[], [Pepperoni]`
3.  **Add Mushrooms to everything so far:**
    - Taking `[]` -> `[Mushrooms]`
    - Taking `[Pepperoni]` -> `[Pepperoni, Mushrooms]`
    - List is now: `[], [Pepperoni], [Mushrooms], [Pepperoni, Mushrooms]`
4.  **Add Onions...** (and so on).

**This is the Subsets pattern.** Instead of using recursion (backtracking) which goes "deep", we process this iteratively. We take the existing list of sets, and for every new number, we create a copy of all existing sets and add the new number to them.

---

## 2. The Core Concept

In coding interviews, we use this to find **Combinations**, **Permutations**, or **Power Sets**.

**The "Backtracking" (Recursive) Way:**
Standard DFS approach. Only explores one path at a time. Harder to visualize "doubling" the output size.

**The "Iterative" (BFS) Way:**
1. Start with an empty set: `[[]]`.
2. For each number `n` in input:
   - Take size of current result list.
   - For `i` from 0 to size:
     - Copy the `i-th` set.
     - Add `n` to it.
     - Add this new set to the result list.
- **Boom.** You generate the Power Set.

---

## 3. Interactive Visualization 🎮
Click "Next" to see the list of subsets double in size!

```visualizer
{
  "type": "subsets", 
  "data": [1, 2, 3]
}
```

---

## 4. Scenario A: Subsets (Distinct Elements)
**Real-Life Scenario:** You are creating test cases for a login form. You have optional fields: "Email", "Phone", "Username". You need to test every combination of filled/empty fields.

**Technical Problem:** Given an integer array `nums` of unique elements, return all possible subsets (the power set).

### TypeScript Implementation

```typescript
/**
 * Generates all subsets iteratively.
 * 
 * @param nums - Array of unique numbers.
 * @returns Array of all possible subsets.
 * 
 * @timeComplexity O(N * 2^N) - We generate 2^N subsets, and each copy takes O(N).
 * @spaceComplexity O(N * 2^N) - To store all subsets.
 */
function subsets(nums: number[]): number[][] {
  const subsets: number[][] = [];
  subsets.push([]); // Start with empty set

  for (const currentNumber of nums) {
      // Take the current snapshot of the list size
      // Because we are appending to the list while iterating
      const n = subsets.length;

      for (let i = 0; i < n; i++) {
          // 1. Create a copy of the existing subset
          const setCopy = [...subsets[i]]; 
          
          // 2. Add the current number
          setCopy.push(currentNumber);
          
          // 3. Add to result
          subsets.push(setCopy);
      }
  }

  return subsets;
}

// Example Usage:
const uniqueNums = [1, 2, 3];
console.log("Input:", uniqueNums);
console.log("All Subsets:", subsets(uniqueNums));
```

---

## 5. Scenario B: Subsets with Duplicates
**Real-Life Scenario:** You have a bowl of fruit with 2 Apples and 1 Banana. `[Apple, Apple, Banana]`.
If you pick "The first Apple" or "The second Apple", the result is the same: just "One Apple". You don't want duplicate combinations in your output.

**Technical Problem:** Given an integer array `nums` that may contain duplicates, return all possible subsets. The solution set must not contain duplicate subsets.

### TypeScript Implementation

```typescript
/**
 * Generates subsets handling duplicates.
 */
function subsetsWithDup(nums: number[]): number[][] {
    // 1. Sort to handle duplicates by seeing neighbors
    nums.sort((a, b) => a - b);
    
    const subsets: number[][] = [];
    subsets.push([]);
    
    let startIndex = 0;
    let endIndex = 0;

    for (let i = 0; i < nums.length; i++) {
        startIndex = 0;

        // If duplicate (and not the first element), 
        // only add to the subsets created in the LAST step
        if (i > 0 && nums[i] === nums[i - 1]) {
            startIndex = endIndex + 1;
        }

        endIndex = subsets.length - 1;

        for (let j = startIndex; j <= endIndex; j++) {
            const setCopy = [...subsets[j]];
            setCopy.push(nums[i]);
            subsets.push(setCopy);
        }
    }
    
    return subsets;
}

// Example Usage:
const numsWithDup = [1, 2, 2];
console.log("Input with duplicates:", numsWithDup);
console.log("Unique Subsets:", subsetsWithDup(numsWithDup));
```

---

## 6. Real World Applications 🌍

### 1. 🧪 Feature Toggles
In software development, if you have 5 distinct feature flags, testing "all configurations" means testing 2⁵ = 32 subsets of enabled flags to ensure no weird interactions exist between features.

### 2. 🍔 Recommendations (Market Basket Analysis)
Analyzing what items are bought together. "People who bought Bread also bought [Butter]" vs "People who bought [Bread, Milk] also bought [Butter]". Generating frequent itemsets starts with generating subsets of transactions.

---

## 7. Complexity Analysis 🧠

### Time Complexity: O(N * 2^N) ⚡
- For every element, we double the number of subsets.
- Total subsets = 2^N.
- Copying each subset takes O(N) on average.

### Space Complexity: O(N * 2^N) 💾
- To store the result.
