# Design: URL Shortener (TinyURL) 🔗

## 1. The "Vanity License Plate" Analogy

Think of a long, ugly car registration number: **KA-51-EF-2847-XZ**.

Nobody can remember that. But a vanity plate like **"COOL123"** is short, memorable, and maps to the same car.

**This is a URL Shortener:**
- Long URL: `https://www.example.com/products/electronics/laptops?brand=apple&model=macbook-pro-16&year=2024&color=space-gray`
- Short URL: `https://short.ly/aB3kL9`

Both point to the same destination. The short one is easier to share, fits in tweets, and looks clean.

**The Engineering Challenge:** How do you generate **billions of unique short codes**, store the mappings, handle **100,000 redirects per second**, and ensure **no two URLs get the same code**?

---

## 2. The Core Concept

URL shortening is the #1 most-asked system design question because it touches on:
- **Unique ID generation** at scale
- **Database design** choices
- **Caching** for hot URLs
- **Read-heavy optimization** (100:1 read:write ratio)

**Functional Requirements:**
1. Given a long URL → Generate a short URL
2. Given a short URL → Redirect to the original long URL
3. Short URLs should expire (optional TTL)
4. Analytics: Track click counts, referrers, geo (optional)

**Non-Functional Requirements:**
1. **High Availability:** Redirection cannot go down
2. **Low Latency:** Redirect in < 10ms
3. **Scale:** 100M URLs created/month, 10B reads/month

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                  URL SHORTENER ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User clicks: short.ly/aB3kL9                                  │
│       │                                                         │
│       ▼                                                         │
│   ┌──────────┐     ┌──────────┐     ┌──────────────────┐        │
│   │   CDN/   │────▶│  Load    │────▶│   Application    │        │
│   │   DNS    │     │ Balancer │     │   Server(s)      │        │
│   └──────────┘     └──────────┘     └────────┬─────────┘        │
│                                              │                  │
│                              ┌───────────────┼──────────────┐   │
│                              ▼               ▼              │   │
│                         ┌─────────┐    ┌──────────┐         │   │
│                         │  Redis  │    │ Database │         │   │
│                         │  Cache  │    │(Postgres/│         │   │
│                         │ (hot    │    │ DynamoDB)│         │   │
│                         │  URLs)  │    └──────────┘         │   │
│                         └─────────┘                         │   │
│                                                             │   │
│   CREATE: POST /api/shorten {url: "long..."} → "aB3kL9"   │   │
│   READ:   GET  /aB3kL9 → 301 Redirect → long URL          │   │
│                                                             │   │
│   Read:Write ratio = 100:1 (cache-heavy workload)          │   │
│                                                             │   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Short Code Generation

**Real-Life Scenario:** You need to generate billions of unique, collision-free short codes.

**Technical Problem:** Design an ID generation system that's fast, unique, and distributed.

### TypeScript Implementation

```typescript
/**
 * URL SHORTENER — SHORT CODE GENERATION
 * 
 * Key Question: How to generate unique 7-character codes?
 * 
 * Approach 1: Base62 Encoding of Auto-Increment ID
 * Approach 2: MD5/SHA256 Hash (first N chars)
 * Approach 3: Pre-generated Key Service (KGS)
 */

// ============================================
// APPROACH 1: Base62 Encoding (Recommended)
// ============================================

/**
 * Convert a numeric ID to a Base62 string.
 * 
 * Base62 alphabet: [0-9, a-z, A-Z] = 62 characters
 * 
 * 7 characters of Base62 = 62^7 = 3.5 TRILLION unique codes
 * That's enough for 100 years at 1,000 URLs/second!
 * 
 * @param id - Unique numeric ID (from auto-increment or Snowflake)
 * @returns Short code string (e.g., "aB3kL9x")
 * 
 * @timeComplexity O(log₆₂(n)) ≈ O(1) for practical IDs
 * @spaceComplexity O(1)
 */
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encode(id: number): string {
  if (id === 0) return BASE62_CHARS[0];
  
  let shortCode = '';
  while (id > 0) {
    shortCode = BASE62_CHARS[id % 62] + shortCode;
    id = Math.floor(id / 62);
  }
  
  return shortCode;
}

function decode(shortCode: string): number {
  let id = 0;
  for (const char of shortCode) {
    id = id * 62 + BASE62_CHARS.indexOf(char);
  }
  return id;
}

// Examples:
// encode(1)          → "1"
// encode(1000)       → "g8"
// encode(1000000)    → "4c92"
// encode(1000000000) → "15FTGf"

// ============================================
// APPROACH 2: MD5 Hash + Collision Handling
// ============================================

/**
 * Hash the URL and take the first 7 characters.
 * 
 * Problem: Different URLs could have the same first 7 chars (collision).
 * Solution: Check DB, if collision, append counter and re-hash.
 * 
 * @pros No need for centralized counter
 * @cons Collision handling adds complexity
 */
async function hashBasedShortCode(longUrl: string, db: Database): Promise<string> {
  let attempt = 0;
  
  while (attempt < 5) {
    const input = attempt === 0 ? longUrl : `${longUrl}:${attempt}`;
    const hash = md5(input);
    const shortCode = base62Encode(hash).slice(0, 7);
    
    // Check for collision
    const existing = await db.findByShortCode(shortCode);
    if (!existing) {
      return shortCode;
    }
    
    if (existing.longUrl === longUrl) {
      // Same URL already shortened — return existing code
      return shortCode;
    }
    
    // Collision with different URL — retry with counter
    attempt++;
  }
  
  throw new Error('Failed to generate unique short code after 5 attempts');
}

// ============================================
// APPROACH 3: Key Generation Service (KGS)
// ============================================

/**
 * Pre-generate millions of unique codes in advance.
 * 
 * A background service generates random 7-char codes,
 * checks for uniqueness, and stores them in a "available keys" pool.
 * 
 * When a new URL needs shortening, pop a key from the pool.
 * 
 * @pros Zero collision risk, O(1) creation
 * @cons Requires pre-generation service, key pool management
 * @usedBy TinyURL, Bitly (variation of this)
 */
class KeyGenerationService {
  private availableKeys: string[] = [];
  private usedKeys: Set<string> = new Set();

  constructor(private batchSize: number = 100_000) {
    this.generateBatch();
  }

  getNextKey(): string {
    if (this.availableKeys.length < 1000) {
      // Trigger async refill
      this.generateBatch();
    }
    
    const key = this.availableKeys.pop();
    if (!key) throw new Error('No keys available');
    
    this.usedKeys.add(key);
    return key;
  }

  private generateBatch(): void {
    for (let i = 0; i < this.batchSize; i++) {
      let key: string;
      do {
        key = this.generateRandomKey(7);
      } while (this.usedKeys.has(key));
      
      this.availableKeys.push(key);
    }
    
    // Shuffle to avoid patterns
    this.shuffle(this.availableKeys);
  }

  private generateRandomKey(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += BASE62_CHARS[Math.floor(Math.random() * 62)];
    }
    return result;
  }

  private shuffle(arr: string[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
```

### Short Code Space Calculation

```
Characters: [0-9, a-z, A-Z] = 62 characters

Code Length | Unique Codes          | Duration at 1000 URLs/sec
───────────┼───────────────────────┼──────────────────────────
    6      | 62⁶ = 56.8 Billion    | ~1,800 years
    7      | 62⁷ = 3.52 Trillion   | ~111,000 years ✓
    8      | 62⁸ = 218 Trillion    | ~6.9 Million years

→ 7 characters is the sweet spot (short enough, lasts forever)
```

---

## 5. Scenario B: Full System — Read Path & Caching

**Real-Life Scenario:** Your URL shortener gets viral — 100,000 redirects per second. 20% of URLs get 80% of traffic (Pareto).

**Technical Problem:** Design the read path for ultra-low latency and massive throughput.

### TypeScript Implementation

```typescript
/**
 * URL SHORTENER — COMPLETE SYSTEM
 * 
 * Database Schema (PostgreSQL/DynamoDB):
 * 
 * urls {
 *   short_code  VARCHAR(7)   PRIMARY KEY,  -- "aB3kL9x"
 *   long_url    TEXT         NOT NULL,      -- Original URL
 *   user_id     UUID         NULLABLE,      -- Who created it
 *   created_at  TIMESTAMP    DEFAULT NOW(),
 *   expires_at  TIMESTAMP    NULLABLE,
 *   click_count BIGINT       DEFAULT 0,
 * }
 * 
 * @timeComplexity O(1) for read (cache hit) or O(log N) for DB lookup
 * @spaceComplexity O(N) where N = total URLs stored
 */

class UrlShortener {
  private cache: RedisClient;       // Hot URL cache
  private db: PostgresClient;       // Persistent storage
  private kgs: KeyGenerationService; // Pre-generated keys
  private analytics: AnalyticsQueue; // Async click tracking

  // ============================================
  // WRITE PATH: Create Short URL
  // ============================================

  /**
   * Create a shortened URL.
   * 
   * Flow:
   * 1. Validate input URL
   * 2. Check if URL already exists (dedup)
   * 3. Get unique short code from KGS
   * 4. Store mapping in DB
   * 5. Pre-warm cache for expected hot URLs
   */
  async createShortUrl(
    longUrl: string,
    userId?: string,
    customAlias?: string,
    expiresAt?: Date,
  ): Promise<{ shortUrl: string; shortCode: string }> {
    // 1. Validate URL
    if (!this.isValidUrl(longUrl)) {
      throw new Error('Invalid URL format');
    }

    // 2. Check for duplicate (same user, same URL)
    if (userId) {
      const existing = await this.db.query(
        'SELECT short_code FROM urls WHERE long_url = $1 AND user_id = $2',
        [longUrl, userId]
      );
      if (existing.rows.length > 0) {
        return {
          shortCode: existing.rows[0].short_code,
          shortUrl: `https://short.ly/${existing.rows[0].short_code}`,
        };
      }
    }

    // 3. Get short code
    let shortCode: string;
    if (customAlias) {
      // Custom alias requested — check availability
      const taken = await this.db.query(
        'SELECT 1 FROM urls WHERE short_code = $1', [customAlias]
      );
      if (taken.rows.length > 0) {
        throw new Error('Custom alias already taken');
      }
      shortCode = customAlias;
    } else {
      // Auto-generate from KGS
      shortCode = this.kgs.getNextKey();
    }

    // 4. Store in database
    await this.db.query(
      `INSERT INTO urls (short_code, long_url, user_id, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [shortCode, longUrl, userId, expiresAt]
    );

    // 5. Pre-warm cache
    await this.cache.set(
      `url:${shortCode}`,
      longUrl,
      expiresAt ? Math.floor((expiresAt.getTime() - Date.now()) / 1000) : 86400
    );

    return {
      shortCode,
      shortUrl: `https://short.ly/${shortCode}`,
    };
  }

  // ============================================
  // READ PATH: Redirect (Performance Critical!)
  // ============================================

  /**
   * Resolve short code to long URL and redirect.
   * 
   * Flow:
   * 1. Check Redis cache (fast path — 95% of requests)
   * 2. If miss, check database
   * 3. If found, populate cache and redirect
   * 4. If not found, return 404
   * 5. Async: Log click analytics
   * 
   * @returns 301 (permanent) or 302 (temporary) redirect
   */
  async redirect(shortCode: string, requestMeta: RequestMeta): Promise<RedirectResponse> {
    // 1. Check cache first (< 1ms)
    let longUrl = await this.cache.get(`url:${shortCode}`);

    if (!longUrl) {
      // 2. Cache miss — query database (~5-10ms)
      const result = await this.db.query(
        'SELECT long_url, expires_at FROM urls WHERE short_code = $1',
        [shortCode]
      );

      if (result.rows.length === 0) {
        return { status: 404, body: 'Short URL not found' };
      }

      const row = result.rows[0];

      // Check expiration
      if (row.expires_at && new Date(row.expires_at) < new Date()) {
        return { status: 410, body: 'Short URL has expired' };
      }

      longUrl = row.long_url;

      // 3. Populate cache for future requests (1 hour TTL)
      await this.cache.set(`url:${shortCode}`, longUrl, 3600);
    }

    // 4. Async analytics (don't block the redirect!)
    this.analytics.enqueue({
      shortCode,
      timestamp: new Date(),
      ip: requestMeta.ip,
      userAgent: requestMeta.userAgent,
      referrer: requestMeta.referrer,
    });

    // 5. Redirect
    // 301 = Browser caches redirect (less analytics, less server load)
    // 302 = Browser always hits us (more analytics, more control)
    return {
      status: 301,
      headers: { Location: longUrl },
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}

// ============================================
// BACK-OF-ENVELOPE ESTIMATION
// ============================================

/**
 * Assumptions:
 * - 100M URLs created per month
 * - Read:Write ratio = 100:1
 * - Average URL length = 500 bytes
 * - Short code = 7 bytes
 * - Each mapping ~= 600 bytes on disk
 * 
 * Write QPS:
 *   100M / (30 * 24 * 3600) ≈ 40 URLs/sec
 * 
 * Read QPS:
 *   40 * 100 = 4,000 redirects/sec (avg)
 *   Peak (5x): 20,000 redirects/sec
 * 
 * Storage (5 years):
 *   100M * 12 * 5 * 600 bytes = 3.6 TB
 *   → Fits in single database with sharding
 * 
 * Cache (80/20 rule):
 *   20% of URLs get 80% of traffic
 *   Hot URLs per day: ~10M
 *   Cache size: 10M * 600 bytes ≈ 6 GB → Fits in single Redis instance
 * 
 * Bandwidth:
 *   Outgoing: 20K * 500 bytes = 10 MB/sec (trivial)
 */
```

---

## 6. Real World Applications 🌍

### 1. 🔗 Bitly (10B+ Clicks/Month)

**Architecture:**
- Custom sharding by short code prefix.
- Redis cluster for hot URL caching.
- Real-time analytics pipeline (Kafka → Spark → DynamoDB).
- Enterprise features: branded domains, deep link support.

### 2. 🐦 Twitter (t.co)

**Purpose:** Every link in a tweet goes through `t.co`:
- Malware scanning before redirect.
- Click tracking for analytics.
- Consistent URL length (helps with tweet character counting).
- Uses 301 redirects for browser caching.

### 3. 📊 Google (goo.gl → Firebase Dynamic Links)

**Evolution:**
- `goo.gl` was Google's public URL shortener (2009-2019, discontinued).
- Replaced by Firebase Dynamic Links for mobile deep linking.
- Dynamic Links route differently based on platform (iOS vs Android vs Web).

### 4. 📧 Email Marketing (Mailchimp, SendGrid)

Every link in marketing emails is shortened for:
- Open rate and click-through rate tracking.
- A/B test performance measurement.
- Domain reputation protection (links go through sender's domain).

---

## 7. Complexity Analysis 🧠

### API Design

```typescript
// REST API Endpoints

// Create short URL
// POST /api/v1/urls
// Body: { "long_url": "https://...", "custom_alias?": "my-link", "expires_at?": "2025-12-31" }
// Response: { "short_url": "https://short.ly/aB3kL9", "short_code": "aB3kL9" }
// Status: 201 Created

// Redirect (the critical path)
// GET /:shortCode
// Response: 301 Redirect (Location: https://original-long-url.com)
// Status: 301 Moved Permanently

// Get analytics
// GET /api/v1/urls/:shortCode/stats
// Response: { "total_clicks": 15420, "by_country": {...}, "by_referrer": {...} }

// Delete short URL
// DELETE /api/v1/urls/:shortCode
// Response: 204 No Content
```

### Database Choice

| Option | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | ACID, mature, SQL | Scaling writes | ✓ Good for < 1B URLs |
| **DynamoDB** | Auto-scaling, O(1) reads | Cost at scale, no JOINs | ✓ Best for massive scale |
| **Cassandra** | High write throughput | Operational complexity | Overkill for most cases |

### 301 vs 302 Redirect

| Redirect | Meaning | Browser Behavior | Analytics | Server Load |
| :--- | :--- | :--- | :--- | :--- |
| **301** | Permanently moved | Caches redirect | Misses cached clicks | Lower ✓ |
| **302** | Temporarily moved | Always hits server | Tracks all clicks ✓ | Higher |

**Recommendation:** Use **302** if analytics matter. Use **301** if performance matters.

### Interview Tips 💡

1. **Start with requirements:** "Read-heavy system. 100:1 read-to-write ratio."
2. **Discuss key generation:** "I'd use Base62 encoding of a Snowflake ID for collision-free codes."
3. **Emphasize caching:** "With 80/20 rule, a 6GB Redis cache handles 95% of reads."
4. **Mention 301 vs 302:** "302 for analytics, 301 for SEO and reduced server load."
5. **Scale discussion:** "At 10B reads/month, we need database sharding and CDN-level caching."
6. **Security:** "Validate URLs to prevent open redirect attacks. Scan for malware."
