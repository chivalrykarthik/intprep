---
description: Create a new Interview Prep guide (markdown)
---

# Create New Interview Prep Guide

This workflow guides you through creating a new study guide (markdown file) for the Interview Prep application. It ensures a consistent structure, engaging content, and proper integration with the app's features (visualizers, code examples).

## 1. Define Topic and Filename
- **Topic**: Does this belong to an existing topic (folder) like `14patterns` or a new one?
- **Filename**: Use `kebab-case` (e.g., `two-pointers.md`).

## 2. Create the File
Create the markdown file in `public/prep/<topic>/<filename>.md`.

## 3. Populate Content
Copy and use the following template structure. Replace the placeholders with content relevant to the new pattern/algorithm.

```markdown
# [Title: The Pattern Name] 

## 1. The "[Analogy Name]" Analogy

[Explain the concept using a relatable, non-technical real-world analogy. Avoid jargon here. Use formatting like bolding key concepts. Explanation should be more interesting.]

**This is the [Pattern Name].** [Brief summary of the connection between analogy and code].

---

## 2. The Core Concept

In coding interviews, we use this to [solve specific problem type].

**The "Brute Force" (Dumb) Way:**
[Explain the inefficient approach.]

**The "[Pattern Name]" (Smart) Way:**
[Explain the optimized approach. Follow industries best practices]
- [Step 1]
- [Step 2]
- **Boom.** [Result].

---

## 3. Interactive Visualization 🎮
Click "Next" to see the [action]!

```visualizer
{
  "type": "sliding-window", 
  "data": [1, 2, 3, 4, 5, 2, 8],
  "k": 3
}
```
*(Supported visualizer types: `sliding-window`, `binary-search`, `merge-sort`, `quick-sort`, `heap-sort`, `cyclic-sort`, `k-way-merge`, `two-pointer`, `interval`, `subsets`, `top-k`, `topological-sort`, `tree-bfs`, `tree-dfs`, `two-heaps`, `linked-list`. If this pattern requires a new visualizer, request a new visualizer component implementation. Do not use mermaid.)*

---

## 4. Scenario A: [Name] (Fixed/Simple Case)
**Real-Life Scenario:** [Scenario description]

**Technical Problem:** [Problem statement equivalent]

### TypeScript Implementation

```typescript
/**
 * [Function Description]
 * 
 * @param [param] - [Description]
 * @returns [Description]
 * 
 * @timeComplexity O(N) - [Reason]
 * @spaceComplexity O(1) - [Reason]
 */
function solveProblem(input: number[]): number {
  // Input validation
  if (!input) return 0;
  
  // Implementation
}
```
### Sample input and output
---

## 5. Scenario B: [Name] (Dynamic/Complex Case)
**Real-Life Scenario:** [Scenario description]

**Technical Problem:** [Problem statement]

### TypeScript Implementation

```typescript
// [Implementation with JSDoc]
```

---

## 6. Real World Applications 🌍

### 1. 🚦 [Application 1]
[Description]

### 2. 📹 [Application 2]
[Description]

---

## 7. Complexity Analysis 🧠

Why do we care about [Pattern Name]?

### Time Complexity: O([X]) ⚡
- **Brute Force:** O([Y]). [Why it's slow].
- **[Pattern Name]:** O([X]). [Why it's fast].

### Space Complexity: O([Z]) 💾
- [Explanation of memory usage].
```

## 4. Review
- Ensure the file is valid markdown.
- Verify TypeScript code compiles (mentally or via a test file).
- Check that the `visualizer` block is valid JSON.