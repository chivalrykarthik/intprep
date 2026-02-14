# Content Delivery Networks (CDN) 🌐

## 1. The "Pizza Chain" Analogy

Imagine you run the world's most popular pizza brand, headquartered in New York.

**Without a CDN (Single Kitchen):**
- A customer in Tokyo orders a pizza.
- The order goes to New York. The pizza is made. Then shipped across the ocean.
- Delivery time: **14 hours**. The pizza is cold. The customer is furious.

**With a CDN (Local Kitchens Everywhere):**
- You open franchise kitchens in Tokyo, London, Mumbai, São Paulo.
- Each kitchen keeps the **top 20 most popular pizzas** pre-made and warm.
- Customer in Tokyo? Served from the Tokyo kitchen in **15 minutes**.
- Customer orders a rare pizza not in the local kitchen? Tokyo kitchen fetches the recipe from New York, makes it fresh, and **caches it** for the next customer.

**This is a CDN.** A globally distributed network of servers (edge locations) that cache content close to users, dramatically reducing latency and load on your origin server.

---

## 2. The Core Concept

In system design interviews, CDNs are fundamental for any application serving global users.

**The "No CDN" (Naive) Way:**
Every user request — whether from New York, Tokyo, or Mumbai — travels to your single origin server in Virginia. 
- US users: ~20ms latency ✓
- Tokyo users: ~200ms latency ✗
- Mumbai users: ~250ms latency ✗
- Your origin handles ALL traffic (CPU/bandwidth bottleneck)

**The "CDN" (Smart) Way:**
Deploy edge servers in 200+ locations worldwide:
1. **First request:** Edge server fetches from origin, caches the response.
2. **Subsequent requests:** Served directly from cache (~5ms).
3. **Origin load:** Drops by 80-95%.
- **Boom.** Sub-10ms latency globally, origin is protected, bandwidth costs plummet.

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                     CDN ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User (Tokyo)                  User (London)                   │
│       │                             │                           │
│       ▼                             ▼                           │
│   ┌────────────┐               ┌────────────┐                   │
│   │ Edge Tokyo │               │Edge London │                   │
│   │  (Cache)   │               │  (Cache)   │                   │
│   └─────┬──────┘               └─────┬──────┘                   │
│         │ Cache MISS?                │ Cache MISS?               │
│         │                            │                           │
│         ▼                            ▼                           │
│   ┌─────────────────────────────────────────┐                   │
│   │          ORIGIN SERVER (Virginia)        │                   │
│   │    (Your actual application server)      │                   │
│   └─────────────────────────────────────────┘                   │
│                                                                 │
│   Cache HIT:  User → Edge (5ms)     ← 90% of requests          │
│   Cache MISS: User → Edge → Origin → Edge → User (200ms)       │
│                                                                 │
│   ✓ Reduced latency (5ms vs 200ms)                              │
│   ✓ Reduced origin load (80-95% reduction)                      │
│   ✓ DDoS protection (edge absorbs traffic)                      │
│   ✓ Lower bandwidth costs                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: CDN Architecture & Caching Strategies

**Real-Life Scenario:** You're designing a global media streaming platform serving images, videos, and API responses.

**Technical Problem:** Choose the right CDN caching strategy for different content types.

### TypeScript Implementation

```typescript
/**
 * CDN Caching Strategies
 * 
 * Different content requires different caching approaches.
 */

// ============================================
// PULL-BASED CDN (Lazy Loading / Cache-on-Demand)
// ============================================

/**
 * Pull CDN: Content is fetched from origin on first request.
 * 
 * Flow:
 * 1. User requests image.jpg
 * 2. Edge checks local cache → MISS
 * 3. Edge fetches from Origin
 * 4. Edge caches response and returns to user
 * 5. Next user request → Cache HIT (served from edge)
 * 
 * @pros Simple setup, cache only what's requested
 * @cons First request is slow (cache miss penalty)
 * @usedBy Cloudflare, most default CDN configs
 */
interface PullCDNConfig {
  originUrl: string;
  cacheTTL: Record<string, number>;
  cacheHeaders: CacheControlHeaders;
}

const pullConfig: PullCDNConfig = {
  originUrl: 'https://origin.myapp.com',
  cacheTTL: {
    // Static assets: Cache for 1 year (use content hash in filename for busting)
    '*.js': 31_536_000,     // bundle.a1b2c3.js → cache forever
    '*.css': 31_536_000,    // styles.x4y5z6.css → cache forever
    '*.png': 2_592_000,     // 30 days
    '*.jpg': 2_592_000,     // 30 days
    '*.woff2': 31_536_000,  // Fonts rarely change

    // Dynamic content: Short TTL or no cache
    '/api/*': 0,            // Never cache API responses by default
    '/api/products': 300,   // Product catalog: 5 minutes
    '/api/weather': 60,     // Weather: 1 minute
    '*.html': 0,            // HTML: Always fetch fresh (or use stale-while-revalidate)
  },
  cacheHeaders: {
    staticAssets: 'public, max-age=31536000, immutable',
    apiResponses: 'private, no-cache, no-store',
    productPages: 'public, max-age=300, stale-while-revalidate=60',
    userSpecific: 'private, max-age=0, must-revalidate',
  },
};

// ============================================
// PUSH-BASED CDN (Pre-populated / Pre-warmed)
// ============================================

/**
 * Push CDN: You proactively upload content to all edges BEFORE users request it.
 * 
 * @pros First request is always fast (no cold miss)
 * @cons Storage cost (content on all edges even if unused)
 * @usedBy Netflix Open Connect, large video platforms
 */
class PushCDNManager {
  private edgeLocations = [
    'us-east', 'us-west', 'eu-west', 'eu-central',
    'ap-southeast', 'ap-northeast', 'sa-east',
  ];

  /**
   * Pre-warm content to all edge locations.
   * Used for product launches, viral content, or always-hot assets.
   */
  async prewarmContent(contentKey: string, data: Buffer): Promise<void> {
    console.log(`Pre-warming "${contentKey}" to ${this.edgeLocations.length} edges...`);

    const uploadPromises = this.edgeLocations.map(async (edge) => {
      await this.uploadToEdge(edge, contentKey, data);
      console.log(`  ✓ ${edge}: uploaded`);
    });

    await Promise.all(uploadPromises);
    console.log(`Pre-warm complete: "${contentKey}" available on all edges.`);
  }

  /**
   * Selective pre-warm: Only push to edges where we expect traffic.
   * Example: New Bollywood movie → push to ap-south, ap-southeast
   */
  async selectivePrewarm(
    contentKey: string, data: Buffer, regions: string[]
  ): Promise<void> {
    const targetEdges = this.edgeLocations.filter(e => regions.some(r => e.startsWith(r)));

    await Promise.all(
      targetEdges.map(edge => this.uploadToEdge(edge, contentKey, data))
    );
  }

  private async uploadToEdge(edge: string, key: string, data: Buffer): Promise<void> {
    // Simulate upload to edge server
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

// ============================================
// CACHE-CONTROL HEADERS (The Most Important Part)
// ============================================

interface CacheControlHeaders {
  staticAssets: string;
  apiResponses: string;
  productPages: string;
  userSpecific: string;
}

/**
 * Cache-Control Header Reference
 * 
 * public                → CDN and browser can cache
 * private               → Only browser can cache (not CDN)
 * max-age=300           → Cache for 300 seconds
 * s-maxage=600          → CDN caches for 600s (overrides max-age for CDN)
 * no-cache              → Must revalidate with origin before using cache
 * no-store              → Never cache at all
 * must-revalidate       → After expiry, MUST check origin (no stale)
 * stale-while-revalidate=60  → Serve stale for 60s while fetching fresh
 * immutable             → Content will NEVER change (no revalidation needed)
 */

// Example: Express.js middleware for cache headers
function setCacheHeaders(req: any, res: any, next: any): void {
  const path = req.path;

  if (path.match(/\.(js|css|woff2)$/)) {
    // Hashed static assets → cache forever
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (path.match(/\.(png|jpg|gif|svg)$/)) {
    // Images → 30 days, revalidate after
    res.set('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
  } else if (path.startsWith('/api/')) {
    // API → no CDN cache, browser can cache briefly
    res.set('Cache-Control', 'private, no-cache');
    res.set('Vary', 'Authorization, Accept-Encoding');
  } else {
    // HTML pages → always revalidate
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }

  next();
}
```

---

## 5. Scenario B: Cache Invalidation (The Hard Problem)

**Real-Life Scenario:** You update a product price from $99 to $79, but millions of users still see the old $99 from CDN cache.

**Technical Problem:** Invalidate stale content across 200+ edge locations.

### TypeScript Implementation

```typescript
/**
 * CDN Cache Invalidation Strategies
 * 
 * Phil Karlton: "There are only two hard things in CS: 
 *               cache invalidation and naming things."
 */

// ============================================
// STRATEGY 1: Cache Busting (File Hash in Name)
// ============================================

/**
 * The BEST strategy for static assets.
 * 
 * Instead of: /static/bundle.js
 * Use:        /static/bundle.a1b2c3d4.js
 * 
 * When code changes, the hash changes, creating a NEW URL.
 * Old URL stays cached (harmless). New URL fetches fresh.
 * 
 * @pros Perfect invalidation, zero stale content
 * @cons Requires build pipeline integration
 */
function generateCacheBustedUrl(filename: string, content: Buffer): string {
  const hash = createHash('md5').update(content).digest('hex').slice(0, 8);
  const ext = filename.split('.').pop();
  const base = filename.replace(`.${ext}`, '');
  return `${base}.${hash}.${ext}`;
  // "bundle.js" → "bundle.a1b2c3d4.js"
}

// ============================================
// STRATEGY 2: Purge API (Explicit Invalidation)
// ============================================

/**
 * Request CDN to delete specific cached content.
 * 
 * @pros Immediate invalidation, precise control
 * @cons Rate-limited by CDN providers, takes 2-10 seconds globally
 */
class CDNPurgeManager {
  constructor(
    private cdnApiUrl: string,
    private apiKey: string,
  ) {}

  // Purge single URL
  async purgeUrl(url: string): Promise<void> {
    await fetch(`${this.cdnApiUrl}/purge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({ files: [url] }),
    });
    console.log(`Purged: ${url}`);
  }

  // Purge by tag (Cloudflare Cache Tags)
  async purgeByTag(tag: string): Promise<void> {
    await fetch(`${this.cdnApiUrl}/purge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({ tags: [tag] }),
    });
    console.log(`Purged all content with tag: ${tag}`);
  }

  // Purge everything (nuclear option)
  async purgeAll(): Promise<void> {
    await fetch(`${this.cdnApiUrl}/purge`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({ purge_everything: true }),
    });
    console.log('⚠️ PURGED ALL CDN CACHE');
  }
}

// Usage: When product price changes
async function onProductPriceChanged(productId: string): Promise<void> {
  const purger = new CDNPurgeManager('https://api.cloudflare.com', 'key');
  
  // Strategy A: Purge specific URLs
  await purger.purgeUrl(`/api/products/${productId}`);
  await purger.purgeUrl(`/products/${productId}.html`);
  
  // Strategy B: Purge by cache tag (better)
  await purger.purgeByTag(`product-${productId}`);
}

// ============================================
// STRATEGY 3: Stale-While-Revalidate (Best of Both)
// ============================================

/**
 * Serve stale content immediately, but fetch fresh in the background.
 * 
 * Cache-Control: public, max-age=60, stale-while-revalidate=300
 * 
 * Timeline:
 *   0-60s:   Fresh content served (from cache)
 *   60-360s: Stale content served IMMEDIATELY, 
 *            edge fetches fresh content from origin in background
 *   360s+:   Cache expired, must fetch from origin (slow)
 * 
 * @pros User always gets instant response, content stays relatively fresh
 * @cons Brief window of stale data after max-age expires
 */
```

### Invalidation Strategy Comparison

| Strategy | Speed | Precision | Complexity | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Cache Busting (Hashed URLs)** | Instant | Perfect | Build pipeline | JS, CSS, images |
| **TTL Expiration** | Delayed | Low | Simple | Semi-static content |
| **Purge API** | 2-10s | High | Medium | Product updates |
| **Cache Tags** | 2-10s | High | Medium | Category-level purge |
| **Stale-While-Revalidate** | Instant | Medium | Simple | API responses |
| **Purge All** | 2-10s | None (nuclear) | Simple | Emergency deployments |

---

## 6. Real World Applications 🌍

### 1. 📺 Netflix Open Connect (Push CDN)

Netflix operates its **own CDN** called Open Connect:
- Custom hardware boxes installed directly inside ISP data centers.
- Content is pre-positioned overnight during off-peak hours.
- During peak, 95%+ of traffic is served from within the ISP network.
- Result: Serves 15% of global internet traffic without clogging the internet backbone.

### 2. ☁️ Cloudflare (277+ Edge Locations)

Cloudflare's network touches 95% of the world's internet-connected population within 50ms:
- Acts as reverse proxy + CDN + DDoS protection + WAF.
- Workers (edge compute): Run JavaScript at the edge for dynamic content.
- Cache Reserve: Persistent cache that survives purges (for less popular content).

### 3. 🛒 Amazon CloudFront + S3

Amazon's architecture for serving static assets:
- S3 bucket as origin (cheap, durable storage).
- CloudFront distributes globally (400+ edge locations).
- Origin Access Identity (OAI): S3 only accepts requests from CloudFront (security).
- Lambda@Edge: Run custom logic at CDN edge (A/B testing, auth).

### 4. 🎮 Riot Games (League of Legends Patches)

Game patches are 2-10 GB. Riot uses a P2P + CDN hybrid:
- CDN serves the first wave of downloads.
- Players who downloaded early become peers for nearby players.
- Reduces CDN bandwidth cost by 50%+ during patch day.

---

## 7. Complexity Analysis 🧠

### CDN Performance Impact

```
Without CDN:
  User (Tokyo) → Origin (Virginia): 200ms RTT
  Page load (50 assets): 200ms × 50 = 10,000ms (with HTTP/1.1)
                          200ms × ~8 = 1,600ms (with HTTP/2 multiplexing)

With CDN:
  User (Tokyo) → Edge (Tokyo): 5ms RTT
  Page load (50 assets): 5ms × ~8 = 40ms
  
  Improvement: 40x faster!
```

### Multi-Tier Caching Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  MULTI-TIER CACHING                      │
│                                                         │
│   L1: Browser Cache  (0ms, per-user, limited)           │
│    ↓ miss                                               │
│   L2: CDN Edge       (5ms, shared, large)               │
│    ↓ miss                                               │
│   L3: CDN Shield     (20ms, fewer origins hit)          │
│    ↓ miss                                               │
│   L4: Application    (50ms, Redis/Memcached)            │
│   Cache                                                 │
│    ↓ miss                                               │
│   L5: Database       (100ms+, source of truth)          │
│                                                         │
│   Target: 95%+ at L1+L2, <1% reaching L5               │
└─────────────────────────────────────────────────────────┘
```

### Interview Tips 💡

1. **Always mention CDN for static assets:** "All JS, CSS, images served via CDN with content-hashed URLs."
2. **Know Pull vs Push:** "We use Pull CDN for general content, Push for pre-warmed video assets."
3. **Discuss cache invalidation:** "We use cache-busted URLs for assets and Purge API for dynamic content."
4. **Mention CDN Shield:** "The origin shield reduces origin load by consolidating cache misses."
5. **Edge compute:** "For personalization at the edge we use CloudFlare Workers or Lambda@Edge."
6. **Security:** "CDN provides DDoS absorption, WAF, and TLS termination at the edge."
7. **Cost optimization:** "CDN egress is cheaper than origin egress. A well-configured CDN with high cache hit ratios (>95%) dramatically reduces bandwidth costs. Use the `Vary` header carefully — a wrong `Vary` header can destroy cache efficiency."
