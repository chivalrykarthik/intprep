# Rate Limiting 🚦

## 1. The "Nightclub Bouncer" Analogy

Imagine a popular nightclub with a capacity of 500 people.

**Without Rate Limiting (Chaos):**
- Doors open freely. 2,000 people rush in.
- Fire hazard, fights break out, drinks run out.
- Experience ruined for everyone.

**With Rate Limiting (The Bouncer):**
- Bouncer counts entries: "Only 100 people per hour."
- Regulars (VIPs) get priority access.
- Once at capacity, new arrivals wait in a queue.
- Everyone inside has a great experience.

**This is Rate Limiting.** Controlling the rate of requests to protect your system from abuse, ensure fair usage, and maintain quality of service.

---

## 2. The Core Concept

In system design interviews, rate limiting is essential for API protection and resource management.

**The "No Limits" (Naive) Way:**
Allow unlimited requests. A single bad actor or bug floods your servers. Legitimate users can't access your service. You pay enormous cloud bills.

**The "Rate Limited" (Smart) Way:**
Define limits based on your capacity and business rules:
1. **Set thresholds:** "100 requests per user per minute."
2. **Track usage:** Count requests per user/IP/API key.
3. **Enforce limits:** Return HTTP 429 (Too Many Requests) when exceeded.
4. **Communicate:** Include rate limit headers so clients can adapt.
- **Boom.** Fair access for all, protection from abuse.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Rate Limiting visualizer coming soon!"
}
```

---

## 4. Scenario A: Token Bucket Algorithm

**Real-Life Scenario:** An ATM that allows 3 withdrawals per day, but unused withdrawals don't carry over.

**Technical Problem:** Implement a rate limiter that allows bursts but enforces an average rate.

### TypeScript Implementation

```typescript
/**
 * Token Bucket Rate Limiter
 * 
 * Tokens are added at a constant rate (refill).
 * Each request consumes a token.
 * Requests are rejected when bucket is empty.
 * 
 * @pros Allows bursts up to bucket size
 * @cons Requires storing token count and last refill time
 * 
 * @timeComplexity O(1) per request
 * @spaceComplexity O(N) where N = number of users
 */
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,      // Max tokens in bucket
    private refillRate: number,    // Tokens added per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  allowRequest(): boolean {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;  // Request allowed
    }
    
    return false;   // Rate limited
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    
    // Add tokens based on elapsed time
    const tokensToAdd = elapsed * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// Example: 10 requests per second, burst of 20
const limiter = new TokenBucket(20, 10);

console.log(limiter.allowRequest()); // true (19 tokens left)
console.log(limiter.allowRequest()); // true (18 tokens left)
// ... after 20 rapid requests
console.log(limiter.allowRequest()); // false (rate limited!)
```

### Sample input and output
- Burst of 20 requests: First 20 allowed, then blocked
- After 1 second: 10 more tokens available

---

## 5. Scenario B: Sliding Window Log Algorithm

**Real-Life Scenario:** "You can send 5 messages in any rolling 60-second window."

**Technical Problem:** Implement precise rate limiting based on a sliding time window.

### TypeScript Implementation

```typescript
/**
 * Sliding Window Log Rate Limiter
 * 
 * Keeps a log of all request timestamps.
 * Counts requests in the sliding window.
 * More accurate than fixed windows, but uses more memory.
 * 
 * @timeComplexity O(N) where N = requests in window (cleanup)
 * @spaceComplexity O(N) where N = requests in window
 */
class SlidingWindowLog {
  private requests: number[] = [];

  constructor(
    private limit: number,          // Max requests
    private windowMs: number,       // Window size in milliseconds
  ) {}

  allowRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove expired timestamps
    this.requests = this.requests.filter(ts => ts > windowStart);

    if (this.requests.length < this.limit) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  // Get time until next request is allowed
  getRetryAfterMs(): number {
    if (this.requests.length < this.limit) return 0;
    
    const oldestRequest = this.requests[0];
    const retryAfter = oldestRequest + this.windowMs - Date.now();
    return Math.max(0, retryAfter);
  }
}

/**
 * Sliding Window Counter (Optimized)
 * 
 * Combines current and previous window counts.
 * Uses weighted average for smoother limiting.
 * Less memory than log approach.
 * 
 * @timeComplexity O(1)
 * @spaceComplexity O(1) per user
 */
class SlidingWindowCounter {
  private prevCount = 0;
  private currCount = 0;
  private currWindowStart: number;

  constructor(
    private limit: number,
    private windowMs: number,
  ) {
    this.currWindowStart = Date.now();
  }

  allowRequest(): boolean {
    const now = Date.now();
    const elapsed = now - this.currWindowStart;

    // Check if we've moved to a new window
    if (elapsed >= this.windowMs) {
      this.prevCount = this.currCount;
      this.currCount = 0;
      this.currWindowStart = now;
    }

    // Weighted count: prevCount * (remaining time %) + currCount
    const prevWeight = Math.max(0, (this.windowMs - elapsed) / this.windowMs);
    const estimatedCount = this.prevCount * prevWeight + this.currCount;

    if (estimatedCount < this.limit) {
      this.currCount++;
      return true;
    }

    return false;
  }
}

// Example: 5 requests per minute
const limiter = new SlidingWindowLog(5, 60000);

for (let i = 0; i < 7; i++) {
  const allowed = limiter.allowRequest();
  console.log(`Request ${i + 1}: ${allowed ? 'Allowed' : 'Blocked'}`);
}
// Output: Requests 1-5 allowed, 6-7 blocked
```

---

## 6. Real World Applications 🌍

### 1. 🔌 API Rate Limiting (Twitter/GitHub)

**Twitter API:**
- 900 requests per 15-minute window (user auth)
- 300 requests per 15-minute window (app auth)
- Returns `X-Rate-Limit-Remaining` headers

**GitHub API:**
- 5,000 requests per hour (authenticated)
- 60 requests per hour (unauthenticated)

### 2. 🛡️ DDoS Protection (Cloudflare)

Cloudflare uses multi-layer rate limiting:
- **IP-based:** Block IPs making 1000+ requests/minute
- **Geographic:** Limit traffic from suspicious regions
- **Behavioral:** Detect bot patterns and throttle

### 3. 💳 Payment Processing (Stripe)

Stripe rate limits to:
- Prevent accidental infinite loops
- Ensure fair resource allocation
- Protect against fraud attempts

### 4. 📧 Email Sending (SendGrid)

Rate limits prevent:
- Spam complaints
- IP blacklisting
- Server overload

---

## 7. Complexity Analysis 🧠

### Algorithm Comparison

| Algorithm | Time | Space | Accuracy | Burst Handling |
|-----------|------|-------|----------|----------------|
| **Token Bucket** | O(1) | O(1) | Medium | Allows bursts ✓ |
| **Leaky Bucket** | O(1) | O(1) | Medium | Smooths bursts |
| **Fixed Window** | O(1) | O(1) | Low | Edge case issues |
| **Sliding Log** | O(N) | O(N) | High ✓ | Precise |
| **Sliding Counter** | O(1) | O(1) | Medium-High | Good balance ✓ |

### HTTP Response Headers

```typescript
// Standard rate limit headers
const rateLimitHeaders = {
  'X-RateLimit-Limit': '100',        // Max requests in window
  'X-RateLimit-Remaining': '45',     // Requests left
  'X-RateLimit-Reset': '1640000000', // Unix timestamp when limit resets
  'Retry-After': '30',               // Seconds until retry (on 429)
};

// Response for rate-limited request
// HTTP 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please retry after 30 seconds.",
  "retryAfter": 30
}
```

### Interview Tips 💡

1. **Know the algorithms:** Token Bucket for APIs, Sliding Window for precision.
2. **Discuss distributed rate limiting:** Use Redis for shared state across servers.
3. **Mention headers:** Always communicate limits to clients.
4. **Consider tiers:** Different limits for free vs premium users.
5. **Graceful degradation:** Queue requests instead of hard rejection for critical paths.
