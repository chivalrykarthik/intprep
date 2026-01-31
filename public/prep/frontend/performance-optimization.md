# Performance Optimization ⚡

## 1. The "Race Car" Analogy

Making your web app faster is like tuning a race car:
- **Reduce weight:** Smaller bundles, fewer requests.
- **Better fuel:** Efficient code, optimized algorithms.
- **Aerodynamics:** Caching, lazy loading.

**Performance Optimization.** Making your app feel instant.

---

## 2. The Core Concept

**Core Web Vitals (Google's metrics):**
1. **LCP (Largest Contentful Paint):** < 2.5s — main content visible.
2. **FID (First Input Delay):** < 100ms — interactivity.
3. **CLS (Cumulative Layout Shift):** < 0.1 — visual stability.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Performance visualizer coming soon!"
}
```

---

## 4. Scenario A: Bundle Optimization

### TypeScript Implementation

```typescript
// ❌ SLOW: Import everything
import _ from 'lodash';
_.map(data, fn);

// ✓ FAST: Import only what you need
import map from 'lodash/map';
map(data, fn);

// ✓ FAST: Code splitting with dynamic imports
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// ✓ FAST: Route-based code splitting
const routes = [
  {
    path: '/dashboard',
    component: React.lazy(() => import('./pages/Dashboard')),
  },
  {
    path: '/settings',
    component: React.lazy(() => import('./pages/Settings')),
  },
];
```

---

## 5. Scenario B: React Performance

### Optimization Techniques

```typescript
// ✓ Memoize expensive computations
const expensiveResult = useMemo(() => {
  return data.filter(item => item.active).sort((a, b) => b.score - a.score);
}, [data]);

// ✓ Prevent unnecessary re-renders
const MemoizedComponent = React.memo(function MyComponent({ data }) {
  return <div>{data.name}</div>;
});

// ✓ Stable callback references
const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);

// ✓ Virtualize long lists
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

---

## 6. Real World Applications 🌍

### Performance Checklist

| Technique | Impact |
|-----------|--------|
| **Code splitting** | Smaller initial bundle |
| **Lazy loading images** | Faster LCP |
| **Caching** | No re-download |
| **Compression (gzip/brotli)** | Smaller transfer |
| **CDN** | Lower latency |
| **Preconnect** | Faster third-party |

---

## 7. Complexity Analysis 🧠

### Measurement Tools

| Tool | Purpose |
|------|---------|
| **Lighthouse** | Overall audit |
| **WebPageTest** | Real-world performance |
| **Chrome DevTools** | Profiling, network |
| **Bundle Analyzer** | Bundle composition |

### Interview Tips 💡

1. **Know Core Web Vitals:** LCP, FID, CLS thresholds.
2. **Measure first:** "We profile before optimizing."
3. **Discuss trade-offs:** "Lazy loading saves initial load but adds interaction delay."
4. **Real-world aware:** "Lab metrics vs field metrics can differ."
