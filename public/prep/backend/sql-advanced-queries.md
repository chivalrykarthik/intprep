# SQL Advanced Queries — Window Functions, CTEs & Query Optimization 🗃️

## 1. The "Excel Spreadsheet" Analogy

Imagine you have a massive Excel spreadsheet with 1 million sales records:

**Basic SQL (Simple Formulas):**
- `SUM(B:B)` — total revenue. One number. Easy.
- `VLOOKUP` — find one specific record. Done.
- These are `SELECT`, `WHERE`, `JOIN`, `GROUP BY` — you've known them for 15 years.

**Advanced SQL (The Power User's Toolbox):**
- **Window Functions** — Like adding a "Running Total" column: each row shows the cumulative sum up to that row. Or a "Rank" column: each salesperson ranked by revenue *within their region*, without collapsing rows.
- **CTEs** — Like naming intermediate calculation steps: "First, let me calculate monthly totals. Now let me join those with quarterly targets. Now let me filter to underperformers." Each step is readable and reusable.
- **Recursive Queries** — Like computing an org chart: "Who reports to the CEO? Who reports to them? And to them?" — automatically expanding until every level is found.

**This is Advanced SQL.** The queries that turn a 200-line application layer loop into a single 15-line query that runs 100x faster.

---

## 2. The Core Concept

### Why Advanced SQL Matters at 15 YOE

```
At Junior Level:   SELECT * FROM users WHERE id = 1
At Mid Level:      JOIN + GROUP BY + HAVING + subqueries
At Senior Level:   Window functions + CTEs + query optimization
At Staff Level:    Execution plans + index strategy + partitioning

Interviewers at Staff+ level expect you to:
1. Write complex analytical queries (rankings, running totals, gaps)
2. Read and optimize execution plans (EXPLAIN ANALYZE)
3. Design indexes that match your query patterns
4. Know when SQL is better than application code (and vice versa)
```

### The "Brute Force" (Application Layer) Way:

```typescript
// ❌ BAD: Fetching all rows and computing rankings in Node.js
const sales = await db.query("SELECT * FROM sales ORDER BY amount DESC");
let rank = 1;
for (const sale of sales.rows) {
  sale.rank = rank++;
  // N+1 problem: for each sale, query the department
  const dept = await db.query("SELECT name FROM departments WHERE id = $1", [sale.dept_id]);
  sale.deptName = dept.rows[0].name;
}
// Transferred 1M rows over the network. Computed in single-threaded Node.js. Slow.
```

### The "Advanced SQL" (Database Layer) Way:

```sql
-- ✅ GOOD: Database does the computation. Transfers only the result.
SELECT 
  s.id,
  s.amount,
  d.name AS dept_name,
  RANK() OVER (PARTITION BY s.dept_id ORDER BY s.amount DESC) AS dept_rank,
  SUM(s.amount) OVER (PARTITION BY s.dept_id) AS dept_total,
  SUM(s.amount) OVER (ORDER BY s.created_at ROWS UNBOUNDED PRECEDING) AS running_total
FROM sales s
JOIN departments d ON d.id = s.dept_id
WHERE s.created_at >= NOW() - INTERVAL '1 year';

-- Database uses indexes, parallel execution, and optimized algorithms.
-- 100x fewer bytes transferred over the network.
```

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────────────┐
│              WINDOW FUNCTION — HOW IT WORKS                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Regular GROUP BY:                Window Function:                 │
│  "Collapse rows into groups"      "Add a column to each row"      │
│                                                                   │
│  ┌────────────────────┐          ┌────────────────────────────┐   │
│  │ dept │ total_sales  │          │ name  │ dept │ sales │ rank│   │
│  ├──────┼─────────────┤          ├───────┼──────┼───────┼─────┤   │
│  │ Eng  │ 300          │          │ Alice │ Eng  │ 150   │  1  │   │
│  │ Sales│ 250          │          │ Bob   │ Eng  │ 100   │  2  │   │
│  └────────────────────┘          │ Carol │ Eng  │  50   │  3  │   │
│  Lost individual rows!           │ Dave  │ Sales│ 150   │  1  │   │
│                                  │ Eve   │ Sales│ 100   │  2  │   │
│                                  └────────────────────────────┘   │
│                                  Kept every row + added rank!     │
│                                                                   │
│  SYNTAX:                                                          │
│  ┌──────────────────────────────────────────────┐                 │
│  │ function() OVER (                            │                 │
│  │   PARTITION BY column    ← "group within"    │                 │
│  │   ORDER BY column        ← "sort within"     │                 │
│  │   ROWS/RANGE frame       ← "which rows"      │                 │
│  │ )                                            │                 │
│  └──────────────────────────────────────────────┘                 │
│                                                                   │
│  Common Window Functions:                                         │
│  ROW_NUMBER()  — 1, 2, 3, 4 (no ties)                           │
│  RANK()        — 1, 2, 2, 4 (ties, gaps)                         │
│  DENSE_RANK()  — 1, 2, 2, 3 (ties, no gaps)                      │
│  LAG(col, n)   — value from N rows BEFORE                        │
│  LEAD(col, n)  — value from N rows AFTER                          │
│  SUM() OVER()  — running sum / partition sum                      │
│  AVG() OVER()  — moving average                                   │
│  FIRST_VALUE() — first value in window                            │
│  NTH_VALUE()   — Nth value in window                              │
│  NTILE(n)      — divide into N equal buckets                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Window Functions — Analytics Dashboard Queries

**Real-Life Scenario:** You're building an analytics dashboard for the sales team. They want to see: each salesperson's revenue, their rank within their region, their month-over-month growth percentage, and moving averages.

**Technical Problem:** Write one SQL query that computes rankings, running totals, and growth rates without GROUP BY collapsing rows.

### SQL Implementation

```sql
/**
 * WINDOW FUNCTIONS MASTERCLASS
 * 
 * Dataset: sales table
 *   id, salesperson_id, region, amount, sale_date
 * 
 * Goal: For each sale, show:
 *   1. Regional rank by total revenue
 *   2. Running total within the salesperson
 *   3. Month-over-month growth
 *   4. 3-month moving average
 */

-- 1. RANKING within groups (RANK, DENSE_RANK, ROW_NUMBER)
-----------------------------------------------------------
SELECT 
  s.salesperson_id,
  p.name,
  s.region,
  SUM(s.amount) AS total_revenue,
  
  -- Rank within region (ties get same rank, gaps after)
  RANK() OVER (
    PARTITION BY s.region 
    ORDER BY SUM(s.amount) DESC
  ) AS region_rank,
  
  -- Dense rank (no gaps after ties)
  DENSE_RANK() OVER (
    PARTITION BY s.region 
    ORDER BY SUM(s.amount) DESC
  ) AS dense_region_rank,
  
  -- Overall company rank
  RANK() OVER (
    ORDER BY SUM(s.amount) DESC
  ) AS company_rank

FROM sales s
JOIN salespeople p ON p.id = s.salesperson_id
WHERE s.sale_date >= '2025-01-01'
GROUP BY s.salesperson_id, p.name, s.region
ORDER BY s.region, region_rank;

-- Result:
-- | name    | region | total_revenue | region_rank | company_rank |
-- |---------|--------|---------------|-------------|--------------|
-- | Alice   | East   | 150,000       | 1           | 2            |
-- | Bob     | East   | 120,000       | 2           | 4            |
-- | Charlie | West   | 200,000       | 1           | 1            |
-- | Diana   | West   | 130,000       | 2           | 3            |


-- 2. RUNNING TOTAL and LAG/LEAD (Month-over-Month)
-----------------------------------------------------------
WITH monthly_sales AS (
  SELECT 
    salesperson_id,
    DATE_TRUNC('month', sale_date) AS month,
    SUM(amount) AS monthly_revenue
  FROM sales
  WHERE sale_date >= '2024-01-01'
  GROUP BY salesperson_id, DATE_TRUNC('month', sale_date)
)
SELECT 
  salesperson_id,
  month,
  monthly_revenue,
  
  -- Running total (cumulative sum across months)
  SUM(monthly_revenue) OVER (
    PARTITION BY salesperson_id 
    ORDER BY month
    ROWS UNBOUNDED PRECEDING
  ) AS cumulative_revenue,
  
  -- Previous month's revenue (LAG)
  LAG(monthly_revenue, 1) OVER (
    PARTITION BY salesperson_id 
    ORDER BY month
  ) AS prev_month_revenue,
  
  -- Month-over-Month growth percentage
  ROUND(
    (monthly_revenue - LAG(monthly_revenue, 1) OVER (
      PARTITION BY salesperson_id ORDER BY month
    )) * 100.0 / NULLIF(LAG(monthly_revenue, 1) OVER (
      PARTITION BY salesperson_id ORDER BY month
    ), 0),
    2
  ) AS mom_growth_pct,
  
  -- 3-month moving average
  AVG(monthly_revenue) OVER (
    PARTITION BY salesperson_id 
    ORDER BY month
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS moving_avg_3m

FROM monthly_sales
ORDER BY salesperson_id, month;

-- Result:
-- | sp_id | month   | revenue | cumulative | prev_month | growth% | avg_3m |
-- |-------|---------|---------|------------|------------|---------|--------|
-- | 1     | Jan     | 10,000  | 10,000     | NULL       | NULL    | 10,000 |
-- | 1     | Feb     | 12,000  | 22,000     | 10,000     | 20.00%  | 11,000 |
-- | 1     | Mar     | 8,000   | 30,000     | 12,000     | -33.33% | 10,000 |
-- | 1     | Apr     | 15,000  | 45,000     | 8,000      | 87.50%  | 11,667 |


-- 3. PERCENTILE and NTILE (Distribution Analysis)
-----------------------------------------------------------
SELECT 
  salesperson_id,
  total_revenue,
  
  -- Which quartile does this salesperson fall into?
  NTILE(4) OVER (ORDER BY total_revenue DESC) AS quartile,
  
  -- Percentile rank (0 to 1)
  PERCENT_RANK() OVER (ORDER BY total_revenue) AS percentile,
  
  -- Cumulative distribution
  CUME_DIST() OVER (ORDER BY total_revenue) AS cumulative_dist

FROM (
  SELECT salesperson_id, SUM(amount) AS total_revenue
  FROM sales
  GROUP BY salesperson_id
) sub;
```

### Sample input and output
- **Input**: Sales table with 10,000 rows across 5 regions
- **Output**: Each salesperson with their rank, running total, MoM growth, and moving average — all computed in a single query

---

## 5. Scenario B: CTEs, Recursive Queries & Query Optimization

**Real-Life Scenario:** Your company has a hierarchical reporting structure (CEO → VPs → Directors → Managers → ICs). HR needs a report showing: each employee's full management chain, their reporting depth, and total headcount under each manager.

**Technical Problem:** Use recursive CTEs and explain query optimization with EXPLAIN ANALYZE.

### Recursive CTE — Org Chart Traversal

```sql
/**
 * RECURSIVE CTE — Walking a Tree Structure
 * 
 * Table: employees
 *   id, name, title, manager_id (self-referencing FK)
 * 
 * Goal: For each employee, find their full management chain
 *   and depth in the org tree.
 * 
 * @timeComplexity O(N × D) where N = employees, D = max depth
 * @note Add CYCLE detection in PostgreSQL 14+ to prevent infinite loops
 */

-- Full org chart with depth and management chain
WITH RECURSIVE org_tree AS (
  -- Base case: Top-level employees (CEO, no manager)
  SELECT 
    id,
    name,
    title,
    manager_id,
    0 AS depth,
    name AS chain,          -- Just their own name
    ARRAY[id] AS path       -- Path from root (for cycle detection)
  FROM employees 
  WHERE manager_id IS NULL
  
  UNION ALL
  
  -- Recursive case: Each employee's direct reports
  SELECT 
    e.id,
    e.name,
    e.title,
    e.manager_id,
    ot.depth + 1,
    ot.chain || ' → ' || e.name,           -- Append to chain
    ot.path || e.id                         -- Append to path
  FROM employees e
  JOIN org_tree ot ON e.manager_id = ot.id
  WHERE NOT e.id = ANY(ot.path)             -- Prevent cycles!
)
SELECT 
  id,
  REPEAT('  ', depth) || name AS indented_name,  -- Visual hierarchy
  title,
  depth,
  chain AS full_chain
FROM org_tree
ORDER BY path;  -- Preserves tree order

-- Result:
-- | indented_name      | title     | depth | full_chain                    |
-- |--------------------|-----------|-------|-------------------------------|
-- | Jane Smith         | CEO       | 0     | Jane Smith                    |
-- |   Alice Johnson    | VP Eng    | 1     | Jane Smith → Alice Johnson    |
-- |     Bob Williams   | Director  | 2     | Jane → Alice → Bob            |
-- |       Charlie Lee  | Manager   | 3     | Jane → Alice → Bob → Charlie  |
-- |   Diana Chen       | VP Sales  | 1     | Jane Smith → Diana Chen       |


-- Headcount under each manager
WITH RECURSIVE subordinates AS (
  SELECT id, name, manager_id
  FROM employees
  
  UNION ALL
  
  SELECT e.id, e.name, s.manager_id
  FROM employees e
  JOIN subordinates s ON e.manager_id = s.id
)
SELECT 
  m.id,
  m.name,
  m.title,
  COUNT(s.id) - 1 AS headcount  -- Subtract self
FROM employees m
LEFT JOIN subordinates s ON s.manager_id = m.id
GROUP BY m.id, m.name, m.title
HAVING COUNT(s.id) > 1
ORDER BY headcount DESC;
```

### Complex CTE — Cohort Retention Analysis

```sql
/**
 * COHORT RETENTION ANALYSIS
 * 
 * For each monthly cohort of new users, track what percentage
 * are still active in month 1, 2, 3, etc.
 * 
 * This is the #1 analytics query asked in data-heavy interviews.
 */

WITH 
-- Step 1: Find each user's first activity (cohort assignment)
user_cohorts AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', MIN(activity_date)) AS cohort_month
  FROM user_activity
  GROUP BY user_id
),

-- Step 2: Calculate each user's activity months relative to cohort
user_months AS (
  SELECT 
    uc.user_id,
    uc.cohort_month,
    DATE_TRUNC('month', ua.activity_date) AS activity_month,
    -- Months since joining
    EXTRACT(YEAR FROM AGE(
      DATE_TRUNC('month', ua.activity_date), 
      uc.cohort_month
    )) * 12 + EXTRACT(MONTH FROM AGE(
      DATE_TRUNC('month', ua.activity_date), 
      uc.cohort_month
    )) AS month_number
  FROM user_cohorts uc
  JOIN user_activity ua ON ua.user_id = uc.user_id
),

-- Step 3: Count distinct users per cohort per month
retention AS (
  SELECT 
    cohort_month,
    month_number,
    COUNT(DISTINCT user_id) AS active_users
  FROM user_months
  GROUP BY cohort_month, month_number
),

-- Step 4: Get initial cohort sizes
cohort_sizes AS (
  SELECT cohort_month, COUNT(DISTINCT user_id) AS cohort_size
  FROM user_cohorts
  GROUP BY cohort_month
)

-- Final: Retention percentage
SELECT 
  TO_CHAR(r.cohort_month, 'YYYY-MM') AS cohort,
  cs.cohort_size AS initial_users,
  r.month_number,
  r.active_users,
  ROUND(r.active_users * 100.0 / cs.cohort_size, 1) AS retention_pct
FROM retention r
JOIN cohort_sizes cs ON cs.cohort_month = r.cohort_month
WHERE r.month_number <= 12
ORDER BY r.cohort_month, r.month_number;

-- Result:
-- | cohort  | initial | month | active | retention% |
-- |---------|---------|-------|--------|------------|
-- | 2025-01 | 1,000   | 0     | 1,000  | 100.0%     |
-- | 2025-01 | 1,000   | 1     | 650    | 65.0%      |
-- | 2025-01 | 1,000   | 2     | 450    | 45.0%      |
-- | 2025-01 | 1,000   | 3     | 380    | 38.0%      |
-- | 2025-02 | 1,200   | 0     | 1,200  | 100.0%     |
-- | 2025-02 | 1,200   | 1     | 720    | 60.0%      |
```

### Query Optimization — Reading EXPLAIN ANALYZE

```sql
/**
 * EXPLAIN ANALYZE — The #1 Performance Debugging Tool
 * 
 * Shows: execution plan, actual time per step, rows scanned vs returned
 * 
 * Key things to look for:
 * 1. Seq Scan on large tables → Need an index
 * 2. Nested Loop with high row counts → Consider hash/merge join
 * 3. Actual rows >> Estimated rows → Stale statistics (ANALYZE table)
 * 4. Sort → Consider index that matches ORDER BY
 */

-- ❌ SLOW: Full table scan (no index on email)
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'alice@example.com';

-- Plan:
-- Seq Scan on users (cost=0.00..25000.00 rows=1 width=200)
--   Filter: (email = 'alice@example.com')
--   Rows Removed by Filter: 999999
--   Actual Time: 280.5ms
-- Planning Time: 0.1ms
-- Execution Time: 280.6ms
-- ↑ Scanned 1,000,000 rows to find 1 row. Terrible!

-- ✅ FIX: Add an index
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Plan AFTER index:
-- Index Scan using idx_users_email on users (cost=0.42..8.44 rows=1 width=200)
--   Index Cond: (email = 'alice@example.com')
--   Actual Time: 0.03ms
-- Execution Time: 0.04ms
-- ↑ 7,000x faster! B-tree index → O(log N) lookup.


/**
 * INDEX STRATEGY CHEAT SHEET
 * 
 * CREATE INDEX idx_name ON table(col)  → B-tree (default, best for =, <, >)
 * CREATE INDEX idx_name ON table(col) WHERE condition → Partial index
 * CREATE INDEX idx_name ON table(col1, col2) → Composite (order matters!)
 * CREATE INDEX idx_name ON table USING GIN(col) → Full-text search, JSONB
 * CREATE INDEX idx_name ON table USING GIST(col) → Geometric, range types
 * 
 * COMPOSITE INDEX RULE:
 *   Index on (A, B, C) supports queries on:
 *   ✅ WHERE A = ?
 *   ✅ WHERE A = ? AND B = ?
 *   ✅ WHERE A = ? AND B = ? AND C = ?
 *   ❌ WHERE B = ?         (leftmost prefix not satisfied)
 *   ❌ WHERE C = ?
 *   ❌ WHERE B = ? AND C = ?
 */

-- Covering index: includes all queried columns
-- Avoids "table lookup" — answers query entirely from the index
CREATE INDEX idx_orders_covering 
  ON orders(customer_id, created_at) 
  INCLUDE (total_amount, status);

-- This query now does an "Index Only Scan" (fastest possible):
SELECT total_amount, status 
FROM orders 
WHERE customer_id = 'C-123' 
  AND created_at >= '2025-01-01';
```

---

## 6. Real World Applications 🌍

### 1. 📊 Gap Analysis — Finding Missing Dates

```sql
-- Find dates with no sales (gaps in time series)
WITH date_series AS (
  SELECT generate_series(
    '2025-01-01'::date, 
    '2025-12-31'::date, 
    '1 day'::interval
  )::date AS dt
)
SELECT ds.dt AS missing_date
FROM date_series ds
LEFT JOIN sales s ON s.sale_date = ds.dt
WHERE s.id IS NULL
ORDER BY ds.dt;
```

### 2. 🏆 Top-N Per Group — "Top 3 Products per Category"

```sql
-- Without window functions: requires correlated subquery (slow)
-- With window functions: elegant and fast
SELECT * FROM (
  SELECT 
    p.category,
    p.name,
    p.revenue,
    ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY p.revenue DESC) AS rn
  FROM products p
) ranked
WHERE rn <= 3;
```

### 3. 🔄 Deduplicate Rows — "Keep Latest, Delete Rest"

```sql
-- Keep the most recent record per user, delete duplicates
DELETE FROM user_profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (email) id
  FROM user_profiles
  ORDER BY email, created_at DESC
);
```

### 4. 📈 Year-over-Year Comparison

```sql
WITH yearly AS (
  SELECT 
    EXTRACT(YEAR FROM sale_date) AS year,
    EXTRACT(MONTH FROM sale_date) AS month,
    SUM(amount) AS revenue
  FROM sales
  GROUP BY 1, 2
)
SELECT
  y.year, y.month, y.revenue,
  LAG(y.revenue) OVER (PARTITION BY y.month ORDER BY y.year) AS prev_year,
  ROUND((y.revenue - LAG(y.revenue) OVER (PARTITION BY y.month ORDER BY y.year)) 
    * 100.0 / NULLIF(LAG(y.revenue) OVER (PARTITION BY y.month ORDER BY y.year), 0), 1
  ) AS yoy_growth_pct
FROM yearly y
ORDER BY y.year, y.month;
```

---

## 7. Complexity Analysis 🧠

### When to Use SQL vs Application Code

| Use SQL When | Use Application Code When |
|--------------|--------------------------|
| Data is already in the database | Complex business logic with many branches |
| Operation is set-based (aggregation, filtering) | External API calls per row |
| You want to minimize data transfer | Formatting / templating output |
| Database has relevant indexes | Machine learning / statistical computation |
| Query can use window functions | Sending emails, notifications |
| You need transactional consistency | Complex string manipulation |

### Index Decision Matrix

| Query Pattern | Index Type | Example |
|--------------|-----------|---------|
| `WHERE col = ?` | B-tree (single column) | `CREATE INDEX ON users(email)` |
| `WHERE col1 = ? AND col2 = ?` | B-tree (composite) | `CREATE INDEX ON orders(user_id, status)` |
| `WHERE col LIKE 'prefix%'` | B-tree | Works with left-anchored LIKE |
| `WHERE col LIKE '%middle%'` | GIN (trigram) | `CREATE INDEX USING gin(col gin_trgm_ops)` |
| `WHERE col @> '{"key": "val"}'` | GIN (JSONB) | `CREATE INDEX USING gin(col)` |
| `ORDER BY col LIMIT N` | B-tree (matching order) | Index on the ORDER BY column |
| Full-text search | GIN (tsvector) | `CREATE INDEX USING gin(to_tsvector(...))` |
| Geospatial queries | GiST / SP-GiST | `CREATE INDEX USING gist(location)` |

### Interview Tips 💡

1. **"What's the difference between ROW_NUMBER, RANK, and DENSE_RANK?"** — "ROW_NUMBER gives unique sequential numbers (1,2,3,4). RANK gives the same number for ties but skips (1,2,2,4). DENSE_RANK gives the same number for ties without skipping (1,2,2,3). I use ROW_NUMBER for deduplication, RANK for competition-style rankings, DENSE_RANK for pagination."
2. **"How do you optimize a slow query?"** — "First, EXPLAIN ANALYZE to see the execution plan. Look for Seq Scans on large tables (need index), high 'Rows Removed by Filter' (wrong index), nested loops with many rows (try hash join), and sorting (add index matching ORDER BY). Then check statistics freshness (ANALYZE table)."
3. **"What's a CTE vs a subquery?"** — "CTEs are named, reusable, and readable — like variables in code. But in PostgreSQL 11 and earlier, CTEs were optimization barriers (materialized by default). PostgreSQL 12+ inlines CTEs when possible. Use CTEs for readability; check the plan for performance."
4. **"When would you use a recursive CTE?"** — "Tree/graph traversal: org charts, comment threads, category hierarchies, bill of materials, network paths. Always include cycle detection (either WITH RECURSIVE ... CYCLE or manual path tracking)."
5. **"What's a covering index?"** — "An index that contains ALL columns needed by a query, so the database never reads the actual table (Index Only Scan). Add extra columns with INCLUDE: `CREATE INDEX ON orders(user_id) INCLUDE (status, total)`. This avoids a random I/O table lookup per row."
6. **"How would you design indexes for a new table?"** — "Start with NO indexes except the primary key. Add indexes based on actual query patterns from slow query logs. Follow the leftmost prefix rule for composite indexes. Monitor with pg_stat_user_indexes to find unused indexes (they slow down writes)."
