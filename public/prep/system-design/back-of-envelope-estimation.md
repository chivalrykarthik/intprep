# Back-of-the-Envelope Estimation 📝

## 1. The "Napkin Math" Analogy

Imagine you're a startup founder pitching to investors. They ask: "Can your system handle 10 million users?"

You can't say "I don't know" or "Trust me, it'll work."

Instead, you pull out a napkin and sketch:
- 10M users × 5 requests/day = 50M requests/day
- 50M / 86,400 seconds = ~580 requests/second
- "Yes, a single server can handle 1,000 RPS. We'll need 1 server with room to grow."

**This is Back-of-the-Envelope Estimation.** Quick, approximate calculations to validate system design decisions.

---

## 2. The Core Concept

In system design interviews, interviewers want to see that you can:
1. **Think quantitatively:** Turn vague requirements into numbers.
2. **Know your numbers:** Memory, bandwidth, storage orders of magnitude.
3. **Make reasonable assumptions:** When data isn't given.
4. **Validate designs:** "We need 5 servers" based on math, not guesswork.

**Key Formula:**
```
Traffic → QPS (Queries Per Second) → Servers needed
Storage → Data size × Retention → Disk needed
Bandwidth → Data size × QPS → Network needed
```

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Estimation Calculator visualizer coming soon!"
}
```

---

## 4. Scenario A: Essential Numbers to Memorize

**Real-Life Scenario:** You're in an interview and need to estimate system capacity quickly.

**Technical Problem:** Know these numbers by heart for instant calculations.

### The Cheat Sheet

```typescript
/**
 * Essential Numbers for System Design Interviews
 * Memorize these for quick back-of-the-envelope calculations.
 */

// === TIME ===
const time = {
  secondsPerMinute: 60,
  secondsPerHour: 3_600,
  secondsPerDay: 86_400,          // ~100K (round to 100,000)
  secondsPerMonth: 2_592_000,     // ~2.5M (round to 2.5 million)
  secondsPerYear: 31_536_000,     // ~30M (round to 30 million)
};

// === DATA SIZES ===
const dataSizes = {
  // Characters
  charSize: '1 byte (ASCII) or 2-4 bytes (Unicode)',
  
  // Storage units
  KB: 1_000,                       // 10^3
  MB: 1_000_000,                   // 10^6
  GB: 1_000_000_000,               // 10^9
  TB: 1_000_000_000_000,           // 10^12
  PB: 1_000_000_000_000_000,       // 10^15

  // Common sizes
  tweet: '280 bytes (text only)',
  averageWebPage: '2 MB',
  averageImage: '200 KB - 2 MB',
  averageVideo: '50 MB/minute (SD), 150 MB/minute (HD)',
  averageLogLine: '200 bytes',
};

// === LATENCY ===
const latency = {
  L1CacheRef: '0.5 ns',
  L2CacheRef: '7 ns',
  ramAccess: '100 ns',
  ssdRandomRead: '150 μs (0.15 ms)',
  hddSeek: '10 ms',
  networkRoundtrip_SameDatacenter: '0.5 ms',
  networkRoundtrip_CrossContinent: '150 ms',
  discRead_1MB: '1 ms (SSD)',
};

// === THROUGHPUT ===
const throughput = {
  singleServer_QPS: '1,000 - 10,000 QPS (depends on workload)',
  database_QPS: '1,000 - 5,000 QPS (with queries)',
  cache_QPS: '100,000+ QPS (Redis)',
  networkBandwidth: '1 Gbps = 125 MB/s',
};
```

### Quick Reference Table

| Metric | Value | Rounded |
|--------|-------|---------|
| Seconds/day | 86,400 | ~100,000 |
| Seconds/month | 2.5M | ~2.5M |
| 1 KB | 1,000 bytes | 10³ |
| 1 MB | 1,000,000 bytes | 10⁶ |
| 1 GB | 1,000,000,000 bytes | 10⁹ |
| 1 TB | 1,000,000,000,000 bytes | 10¹² |
| Server QPS | 1K-10K | ~5K average |
| DB QPS | 1K-5K | ~2K average |
| Cache QPS | 100K+ | High |

---

## 5. Scenario B: Complete Estimation Example

**Real-Life Scenario:** Design Twitter's tweet storage for 1 year.

**Technical Problem:** Estimate storage, QPS, and bandwidth requirements.

### TypeScript Implementation

```typescript
/**
 * Twitter Storage Estimation
 * 
 * Given: 500M daily active users, 200M tweets/day
 * Calculate: Storage for 1 year, QPS, bandwidth
 */

interface EstimationResult {
  dailyTweets: number;
  yearlyTweets: number;
  storagePerTweetBytes: number;
  yearlyStorageGB: number;
  yearlyStorageTB: number;
  writeQPS: number;
  readQPS: number;
  peakWriteQPS: number;
  peakReadQPS: number;
  bandwidthMbps: number;
}

function estimateTwitterStorage(): EstimationResult {
  // === STEP 1: Define assumptions ===
  const DAU = 500_000_000;              // 500M daily active users
  const tweetsPerDay = 200_000_000;     // 200M tweets/day
  const readToWriteRatio = 100;         // 100 reads per 1 write
  const peakMultiplier = 3;             // Peak = 3x average
  const daysPerYear = 365;
  const secondsPerDay = 86_400;

  // Tweet size estimation
  const tweetText = 280;                // 280 bytes (text)
  const metadata = 100;                 // user_id, timestamp, etc.
  const media = 0;                      // Assume text-only for simplicity
  const storagePerTweet = tweetText + metadata; // 380 bytes

  // === STEP 2: Calculate storage ===
  const yearlyTweets = tweetsPerDay * daysPerYear;
  // 200M * 365 = 73 billion tweets/year

  const yearlyStorageBytes = yearlyTweets * storagePerTweet;
  // 73B * 380 = 27.7 trillion bytes ≈ 27.7 TB

  const yearlyStorageGB = yearlyStorageBytes / 1e9;
  const yearlyStorageTB = yearlyStorageBytes / 1e12;

  // === STEP 3: Calculate QPS ===
  const writeQPS = Math.round(tweetsPerDay / secondsPerDay);
  // 200M / 86400 ≈ 2,315 writes/second

  const readQPS = writeQPS * readToWriteRatio;
  // 2,315 * 100 = 231,500 reads/second

  const peakWriteQPS = writeQPS * peakMultiplier;
  const peakReadQPS = readQPS * peakMultiplier;

  // === STEP 4: Calculate bandwidth ===
  // Reads: 231,500 * 380 bytes = 88 MB/s = 704 Mbps
  const readBandwidthBytes = readQPS * storagePerTweet;
  const bandwidthMbps = (readBandwidthBytes * 8) / 1e6;

  return {
    dailyTweets: tweetsPerDay,
    yearlyTweets,
    storagePerTweetBytes: storagePerTweet,
    yearlyStorageGB,
    yearlyStorageTB,
    writeQPS,
    readQPS,
    peakWriteQPS,
    peakReadQPS,
    bandwidthMbps,
  };
}

// Run the estimation
const result = estimateTwitterStorage();

console.log('=== Twitter Storage Estimation ===');
console.log(`Daily tweets: ${(result.dailyTweets / 1e6).toFixed(0)}M`);
console.log(`Yearly tweets: ${(result.yearlyTweets / 1e9).toFixed(0)}B`);
console.log(`Storage per tweet: ${result.storagePerTweetBytes} bytes`);
console.log(`Yearly storage: ${result.yearlyStorageTB.toFixed(1)} TB`);
console.log('');
console.log(`Write QPS: ${result.writeQPS.toLocaleString()}`);
console.log(`Read QPS: ${result.readQPS.toLocaleString()}`);
console.log(`Peak Write QPS: ${result.peakWriteQPS.toLocaleString()}`);
console.log(`Peak Read QPS: ${result.peakReadQPS.toLocaleString()}`);
console.log('');
console.log(`Read bandwidth: ${result.bandwidthMbps.toFixed(0)} Mbps`);
```

### Sample Output

```
=== Twitter Storage Estimation ===
Daily tweets: 200M
Yearly tweets: 73B
Storage per tweet: 380 bytes
Yearly storage: 27.7 TB

Write QPS: 2,315
Read QPS: 231,500
Peak Write QPS: 6,945
Peak Read QPS: 694,500

Read bandwidth: 704 Mbps
```

---

## 6. Real World Applications 🌍

### 1. 📹 YouTube Video Storage

```
Daily uploads: 500 hours of video/minute
= 500 * 60 * 24 = 720,000 hours/day

Average video size: 1 GB/hour (after compression)
Daily storage: 720,000 GB = 720 TB/day

Yearly: 720 * 365 = 262 PB/year (just for new content!)
```

### 2. 📧 Gmail Message Count

```
Users: 1.8 billion
Emails received/user/day: 50
Daily emails: 1.8B * 50 = 90 billion/day
QPS: 90B / 86400 ≈ 1 million emails/second!
```

### 3. 🚗 Uber Ride Matching

```
Rides/day: 20 million globally
Peak hours: 4 hours = 14,400 seconds
Peak ride requests: 20M * 0.4 / 14400 = 556 requests/second (per city)
```

### 4. 💬 WhatsApp Messages

```
Messages/day: 100 billion globally
Average message: 100 bytes
Daily data: 100B * 100 = 10 TB/day
QPS: 100B / 86400 ≈ 1.16 million messages/second
```

---

## 7. Complexity Analysis 🧠

### The Estimation Framework

```
1. CLARIFY requirements
   - How many users? (DAU/MAU)
   - What operations? (reads vs writes)
   - What data? (size per record)

2. ESTIMATE traffic (QPS)
   QPS = (Users × Actions/User/Day) / 86,400
   Peak QPS = Average QPS × 3 (or 5 for spiky traffic)

3. ESTIMATE storage
   Storage = Records × Size × Retention Period
   Consider growth: Year 2 = Year 1 × Growth Factor

4. ESTIMATE bandwidth
   Bandwidth = QPS × Data Size per Request
   Include both ingress and egress

5. VALIDATE with known systems
   "Netflix uses ~15% of global internet bandwidth"
   "Google serves 8.5 billion searches/day"
```

### Common Mistakes to Avoid

| Mistake | Correction |
|---------|------------|
| Forgetting peak traffic | Multiply average by 2-5x |
| Ignoring metadata | Add 20-50% for indexes, metadata |
| Using exact numbers | Round for easier math |
| Not stating assumptions | Always verbalize your assumptions |
| Over-precision | "About 10TB" is better than "9.847TB" |

### Interview Tips 💡

1. **Verbalize your process:** "Let me break this down step by step..."
2. **State assumptions clearly:** "I'll assume 10M daily active users..."
3. **Use powers of 10:** Makes mental math easier.
4. **Sanity check:** "10 TB/year sounds reasonable for a social media app."
5. **Know reference points:** "Twitter processes 500M tweets/day."
6. **Round aggressively:** 86,400 → 100,000 is fine for estimates.
