# Performance Optimization ⚡

## 1. The "Race Car Pit Crew" Analogy

Imagine you're the pit crew chief for a Formula 1 team.

**Slow Pit Stop (Unoptimized):**
- Mechanics trip over each other
- Tools scattered everywhere
- Change all 4 tires one at a time
- Driver waits 30 seconds (eternity in racing!)

**Fast Pit Stop (Optimized):**
- Every mechanic has ONE job
- Tools precisely positioned
- All 4 tires changed SIMULTANEOUSLY
- Pit stop takes 2 seconds (world record!)

**This is Web Performance Optimization.** Making every millisecond count so your users don't wait.

**Why does performance matter?**
- **Amazon:** 100ms latency = 1% sales loss ($1.6B/year)
- **Google:** 500ms slower = 20% traffic drop
- **Pinterest:** 40% reduction in wait time = 15% more signups

---

## 2. The Core Concept

In frontend interviews, performance knowledge separates senior engineers from juniors.

**Core Web Vitals (Google's Official Metrics):**

| Metric | What it Measures | Good | Needs Work | Poor |
|--------|------------------|------|------------|------|
| **LCP** (Largest Contentful Paint) | Main content visible | < 2.5s | 2.5-4s | > 4s |
| **FID** (First Input Delay) | Time to interactivity | < 100ms | 100-300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | < 0.1 | 0.1-0.25 | > 0.25 |
| **INP** (Interaction to Next Paint) | Responsiveness | < 200ms | 200-500ms | > 500ms |

**The Performance Budget:**
- Total JavaScript: < 200KB gzipped
- Total CSS: < 50KB gzipped
- Time to Interactive: < 3 seconds on 3G

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Performance Metrics visualizer coming soon!"
}
```

---

## 4. Scenario A: Bundle & Loading Optimization

**Real-Life Scenario:** Your React app's main bundle is 2MB and takes 8 seconds to load on mobile.

**Technical Problem:** Reduce bundle size and optimize loading.

### TypeScript Implementation

```typescript
/**
 * PROBLEM: Large Bundle Size
 * 
 * Common causes:
 * - Importing entire libraries
 * - No code splitting
 * - Uncompressed assets
 * - Dependencies duplicated
 */

// ============================================
// 1. TREE SHAKING - Import Only What You Need
// ============================================

// ❌ Bad: Imports entire lodash (72KB gzipped!)
import _ from 'lodash';
const result = _.map(data, fn);

// ✓ Good: Import just the function (3KB)
import map from 'lodash/map';
const result = map(data, fn);

// ✓ Best: Use native methods when possible (0KB)
const result = data.map(fn);

// ❌ Bad: Import entire icon library (500KB!)
import { FaUser, FaHome, FaSettings } from 'react-icons/fa';

// ✓ Good: Import from specific path
import FaUser from 'react-icons/fa/FaUser';
import FaHome from 'react-icons/fa/FaHome';


// ============================================
// 2. CODE SPLITTING - Load Code On Demand
// ============================================

// ❌ Bad: All routes in main bundle
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';

// ✓ Good: Lazy load routes (each becomes separate chunk)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Admin = React.lazy(() => import('./pages/Admin'));

// Component-level code splitting
function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Suspense>
  );
}

// Preload critical routes
const preloadDashboard = () => import('./pages/Dashboard');
// Call on hover or based on user behavior


// ============================================
// 3. DYNAMIC IMPORTS - Load Heavy Libraries
// ============================================

// ❌ Bad: Load chart library even if user never views charts
import { Chart } from 'chart.js';

// ✓ Good: Load only when needed
const ChartComponent = React.lazy(() => 
  import('./components/Chart').then(module => ({
    default: module.Chart
  }))
);

// Load heavy library only on interaction
async function handleExportPDF() {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.text('Hello world!', 10, 10);
  doc.save('export.pdf');
}


// ============================================
// 4. IMAGE OPTIMIZATION
// ============================================

// ❌ Bad: Load full-size image
<img src="/hero-image.jpg" alt="Hero" />

// ✓ Good: Responsive images with srcset
<img 
  src="/hero-image-400.jpg"
  srcSet="
    /hero-image-400.jpg 400w,
    /hero-image-800.jpg 800w,
    /hero-image-1600.jpg 1600w
  "
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1600px"
  alt="Hero"
  loading="lazy"           // Native lazy loading
  decoding="async"         // Don't block rendering
  width="1600"             // Prevent CLS
  height="900"
/>

// ✓ Modern: Use next/image or similar
import Image from 'next/image';

<Image 
  src="/hero.jpg"
  alt="Hero"
  width={1600}
  height={900}
  priority              // For above-the-fold images
  placeholder="blur"    // Show blur while loading
  blurDataURL={blurPlaceholder}
/>
```

### Sample Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to package.json scripts
"analyze": "ANALYZE=true npm run build"

# Run analysis
npm run analyze
```

---

## 5. Scenario B: React Rendering Optimization

**Real-Life Scenario:** Your React app re-renders the entire component tree on every state change, causing janky UI.

**Technical Problem:** Optimize React rendering to prevent unnecessary re-renders.

### TypeScript Implementation

```typescript
/**
 * REACT RENDERING OPTIMIZATION
 * 
 * React re-renders when:
 * 1. State changes
 * 2. Props change
 * 3. Parent re-renders
 * 4. Context changes
 */

// ============================================
// 1. MEMOIZATION - useMemo & useCallback
// ============================================

interface DashboardProps {
  data: DataPoint[];
  filters: Filter[];
}

function Dashboard({ data, filters }: DashboardProps) {
  // ❌ Bad: Recalculates on EVERY render
  const filteredData = data.filter(d => 
    filters.every(f => f.check(d))
  );

  const sortedData = filteredData.sort((a, b) => b.value - a.value);

  // ✓ Good: Only recalculates when data or filters change
  const processedData = useMemo(() => {
    const filtered = data.filter(d => 
      filters.every(f => f.check(d))
    );
    return filtered.sort((a, b) => b.value - a.value);
  }, [data, filters]); // Dependencies

  // ❌ Bad: New function created on every render
  const handleClick = (id: string) => {
    setSelected(id);
    analytics.track('item_selected', { id });
  };

  // ✓ Good: Stable function reference
  const handleClick = useCallback((id: string) => {
    setSelected(id);
    analytics.track('item_selected', { id });
  }, []); // Empty deps = never changes

  return <DataGrid data={processedData} onItemClick={handleClick} />;
}


// ============================================
// 2. React.memo - Prevent Child Re-renders
// ============================================

// ❌ Bad: Re-renders whenever parent re-renders
function ExpensiveList({ items }: { items: Item[] }) {
  return (
    <ul>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

// ✓ Good: Only re-renders when props actually change
const ExpensiveList = React.memo(function ExpensiveList({ 
  items 
}: { 
  items: Item[] 
}) {
  return (
    <ul>
      {items.map(item => (
        <ExpensiveItem key={item.id} item={item} />
      ))}
    </ul>
  );
});

// Custom comparison for complex props
const ExpensiveComponent = React.memo(
  function ExpensiveComponent({ data, config }) {
    // Expensive render logic
    return <div>...</div>;
  },
  (prevProps, nextProps) => {
    // Return true if props are EQUAL (skip re-render)
    return (
      prevProps.data.id === nextProps.data.id &&
      prevProps.config.theme === nextProps.config.theme
    );
  }
);


// ============================================
// 3. LIST VIRTUALIZATION - Only Render Visible
// ============================================

import { FixedSizeList, VariableSizeList } from 'react-window';
import { useVirtualizer } from '@tanstack/react-virtual';

// ❌ Bad: Render 10,000 items = 10,000 DOM nodes = frozen browser
function BadList({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => (
        <div key={item.id} className="item">{item.name}</div>
      ))}
    </div>
  );
}

// ✓ Good: react-window for fixed-size items
function OptimizedList({ items }: { items: Item[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="item">
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={500}           // Viewport height
      itemCount={items.length}
      itemSize={50}          // Each item height
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
// Only ~10-15 DOM nodes regardless of list size!

// ✓ Better: @tanstack/react-virtual for modern apps
function VirtualizedList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div ref={parentRef} style={{ height: 500, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
              height: virtualRow.size,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================================
// 4. State Optimization
// ============================================

// ❌ Bad: State too high in tree, causes unnecessary re-renders
function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Every state change re-renders EVERYTHING
  return (
    <Layout>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Sidebar selectedItem={selectedItem} />
      <Content items={filteredItems} onSelect={setSelectedItem} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} />
    </Layout>
  );
}

// ✓ Good: Colocate state where it's needed
function App() {
  return (
    <Layout>
      <Header />   {/* Has own search state */}
      <Sidebar />  {/* Has own selection state */}
      <Content />
    </Layout>
  );
}

function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  // State changes only re-render Header, not entire app
  return (
    <input 
      value={searchQuery} 
      onChange={e => setSearchQuery(e.target.value)} 
    />
  );
}
```

---

## 6. Real World Applications 🌍

### Performance Optimization Checklist

| Category | Technique | Impact |
|----------|-----------|--------|
| **Bundle** | Code splitting | -50% initial JS |
| **Bundle** | Tree shaking | -30% bundle size |
| **Bundle** | Dynamic imports | Load on demand |
| **Images** | Lazy loading | Faster LCP |
| **Images** | Modern formats (WebP/AVIF) | -30% file size |
| **Images** | CDN + caching | Lower latency |
| **Network** | HTTP/2 | Parallel requests |
| **Network** | Preconnect/Prefetch | Faster subsequent loads |
| **Rendering** | React.memo | Fewer re-renders |
| **Rendering** | Virtualization | Handle 10K+ items |
| **CSS** | Critical CSS inline | Faster FCP |
| **Fonts** | font-display: swap | Prevent FOIT |

### Real Companies

**Netflix:**
- Reduced TTI by 50% with React code splitting
- Prefetches likely next content

**Twitter:**
- Progressive image loading (blur → full)
- Virtualized tweet timeline

**Airbnb:**
- Server-side rendering for SEO + FCP
- Image optimization saves 10TB/day bandwidth

---

## 7. Complexity Analysis 🧠

### Measurement Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **Lighthouse** | Overall audit | Development |
| **Chrome DevTools → Performance** | Runtime profiling | Debugging jank |
| **Chrome DevTools → Network** | Request waterfall | Loading issues |
| **WebPageTest** | Real-world testing | Pre-production |
| **webpack-bundle-analyzer** | Bundle composition | Build optimization |
| **React DevTools Profiler** | Component renders | React optimization |
| **Core Web Vitals** | Real user metrics | Production monitoring |

### Performance Budget Example

```javascript
// performance-budget.json
{
  "budget": [
    { "type": "bundle", "name": "main.js", "maxSize": "200KB" },
    { "type": "bundle", "name": "vendors.js", "maxSize": "150KB" },
    { "type": "total", "maxSize": "500KB" },
    { "type": "metric", "name": "LCP", "maxValue": 2500 },
    { "type": "metric", "name": "FID", "maxValue": 100 },
    { "type": "metric", "name": "CLS", "maxValue": 0.1 }
  ]
}
```

### Interview Tips 💡

1. **Know Core Web Vitals:** "LCP under 2.5s, FID under 100ms, CLS under 0.1."
2. **Measure first:** "I'd profile with DevTools before optimizing."
3. **Discuss trade-offs:** "Lazy loading adds loading delay on interaction."
4. **Mention tools:** "We monitor with Lighthouse CI in our pipeline."
5. **Real impact:** "We reduced bundle size 60% by splitting and tree-shaking."
6. **React specifics:** "useMemo for expensive calculations, memo for pure components."
