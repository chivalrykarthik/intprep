# Linear Regression

## 1. The "Pizza Price" Analogy

Imagine you walk into a pizza shop where there are no prices on the menu. You ask the owner, "How much for a pizza?" and he says, "Depends on the size."

You watch a few customers pay:
- A **6-inch** pizza costs **$8**.
- A **10-inch** pizza costs **$13**.
- A **12-inch** pizza costs **$16**.

Your brain instantly draws an invisible line connecting these dots. You figure, "Okay, there's a base price, plus a certain amount per inch." If you wanted an **8-inch** pizza, you'd guess it's around **$10.50**.

**This is Linear Regression.** You are finding the best-fitting straight line through scattered data points to predict future values.

---

## 2. The Core Concept

In machine learning, we use this to **predict continuous values** (like price, temperature, or sales) based on input features.

**The "Brute Force" (Guessing) Way:**
You draw a random line. Is it close to the dots? No? You move it slightly. You keep wiggling the line until it looks okay. This takes forever and isn't precise.

**The "Linear Regression" (Math) Way:**
We aim to minimize the **error** (the distance between our line and the actual dots). We use a formula (Ordinary Least Squares) or an algorithm (Gradient Descent) to find the exact slope (`m`) and y-intercept (`b`) for the equation `y = mx + b` that results in the smallest total error.

- **m (Slope):** How much the price goes up for every extra inch of pizza.
- **b (Intercept):** The base price of the pizza (even if it had 0 size, theoretically).

---

## 3. Interactive Visualization 🎮
*(Note: A custom Scatter Plot visualizer is recommended for this topic to show the regression line adjusting to points.)*

Click "Next" to see the line fit the data!

```visualizer
{
  "type": "none", 
  "data": [],
  "message": "Visualizer for Linear Regression is coming soon!"
}
```

---

## 4. Scenario A: Ordinary Least Squares (The Exact Formula)

**Real-Life Scenario:** You have a small dataset of house sizes and prices. You want a precise mathematical formula to set the price for a new house.

**Technical Problem:** Given paired data `(x, y)`, calculate the slope `m` and intercept `b` that minimizes the sum of squared residuals.

### TypeScript Implementation

```typescript
/**
 * Calculates the Linear Regression coefficients using Ordinary Least Squares.
 * Formula:
 * m = (n*Σ(xy) - Σx*Σy) / (n*Σ(x^2) - (Σx)^2)
 * b = (Σy - m*Σx) / n
 * 
 * @param x - Array of independent variables (e.g., house size)
 * @param y - Array of dependent variables (e.g., house price)
 * @returns Object containing slope (m) and intercept (b)
 * 
 * @timeComplexity O(N) - We iterate through the data once to calculate sums.
 * @spaceComplexity O(1) - We only store a few sum variables.
 */
function linearRegressionOLS(x: number[], y: number[]): { m: number, b: number } | null {
  if (x.length !== y.length || x.length === 0) return null;

  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  const numeratorM = (n * sumXY) - (sumX * sumY);
  const denominatorM = (n * sumXX) - (sumX * sumX);

  if (denominatorM === 0) return null; // Vertical line, undefined slope

  const m = numeratorM / denominatorM;
  const b = (sumY - (m * sumX)) / n;

  return { m, b };
}
```

### Sample input and output
```typescript
const sizes = [1, 2, 3, 4, 5];
const costs = [2, 4, 5, 4, 5];
// Result: m = 0.6, b = 2.2 -> y = 0.6x + 2.2
```

---

## 5. Scenario B: Gradient Descent (The Learning Approach)

**Real-Life Scenario:** You have **millions** of data points. The OLS formula above requires complex matrix calculations that might be too slow or memory-intensive. Instead, we want to "learn" the line step-by-step.

**Technical Problem:** Iteratively adjust `m` and `b` to reduce the Mean Squared Error (MSE).

### TypeScript Implementation

```typescript
/**
 * Performs one step of Gradient Descent.
 * 
 * @param x - Input data
 * @param y - Actual labels
 * @param m - Current slope
 * @param b - Current intercept
 * @param learningRate - How big of a step to take (e.g., 0.01)
 * @returns Updated { m, b }
 */
function gradientDescentStep(
  x: number[], 
  y: number[], 
  m: number, 
  b: number, 
  learningRate: number
): { m: number, b: number } {
  const n = x.length;
  let mGradient = 0;
  let bGradient = 0;

  for (let i = 0; i < n; i++) {
    const prediction = m * x[i] + b;
    const error = prediction - y[i];
    
    // Partial derivatives of MSE
    mGradient += (2/n) * x[i] * error;
    bGradient += (2/n) * error;
  }

  // Update weights
  const newM = m - (learningRate * mGradient);
  const newB = b - (learningRate * bGradient);

  return { m: newM, b: newB };
}
```

---

## 6. Real World Applications 🌍

### 1. 📈 Stock Market Trend Analysis
While simplistic, Linear Regression is the "Hello World" of quantitative finance. Analysts use it to calculate the **Beta** of a stock (how volatile it is compared to the market). A stock with a Beta > 1 moves more than the market; Beta < 1 means it's more stable.

### 2. 🏥 Medical Prognosis
Doctors and researchers use regression to predict health outcomes. For example, predicting a patient's **blood pressure** based on their **age**, **weight**, and **salt intake**. This requires "Multiple Linear Regression" (more than one `x`), but the core concept is the same.

---

## 7. Complexity Analysis 🧠

Why do we care about **Time Complexity** in Machine Learning?

### Time Complexity: O(N) vs O(k * N) ⚡
- **OLS (Exact):** **O(N)** (for simple regression). We iterate through the data once. Fast for small data.
- **Gradient Descent:** **O(k * N)**, where `k` is the number of training epochs. We must scan the whole dataset `N` times.
  - However, for massive datasets, we use **Stochastic Gradient Descent (SGD)**, which looks at only one sample at a time, making it much faster per step!

### Space Complexity: O(1) 💾
- We don't need to store a correlation matrix for simple regression (unlike O(N^2) for some matrix inversions in complex multivariate cases). We just keep our current `m`, `b`, and gradients.
