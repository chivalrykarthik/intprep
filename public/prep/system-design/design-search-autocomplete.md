# Design: Search Autocomplete / Typeahead 🔍

## 1. The "Librarian's Index Card" Analogy

Imagine you're a librarian and a visitor walks up and says: *"I'm looking for a book about..."*

Before they even finish, you start pulling out index cards:
- They say **"pl..."** → You fan out cards for **"planets"**, **"plants"**, **"plumbing"**, **"playground"**
- They say **"pla..."** → You narrow to **"planets"**, **"plants"**, **"playground"**
- They say **"plan..."** → You narrow to **"planets"**, **"plants"**
- They say **"plane..."** → You suggest **"planets"**, **"planes"**, **"Planet Earth documentary"**

**How You Work Faster:**
- You don't search ALL 10 million books every time. You have an **organized index** (Trie) where all books starting with "pla" are grouped together.
- You prioritize by **popularity** — "planets" (asked for 10,000 times) shows up before "planers" (asked 3 times).
- You pre-compute the **top 10 suggestions** for common prefixes and keep them ready (caching).
- When a new bestseller about "planning" comes out, you update your index nightly — not after every single request.

**This is Search Autocomplete.** The engineering challenge is doing this for **5 billion searches per day** with suggestions appearing in **under 100ms** — faster than a human can perceive delay.

---

## 2. The Core Concept

Search autocomplete (typeahead) seems simple but involves:
- **Data structures** optimized for prefix lookup (Tries)
- **Ranking algorithms** to sort suggestions by relevance
- **Extreme low latency** (< 100ms, ideally < 50ms)
- **Personalization** (your history affects your suggestions)
- **Multi-language support** (different tokenization for CJK vs. Latin scripts)
- **Freshness** (trending topics must surface within minutes)

**Functional Requirements:**
1. As the user types, display top 5-10 suggestions matching the prefix
2. Suggestions ranked by popularity, recency, and personalization
3. Support trending/breaking topics (e.g., "earthquake" during an event)
4. Multi-language support
5. Spell correction / fuzzy matching ("iphon" → "iphone")
6. Offensive content filtering

**Non-Functional Requirements:**
1. **Latency:** < 100ms p99 (suggestions must feel instant)
2. **Scale:** 5 billion queries/day (~60K QPS average, ~200K QPS peak)
3. **Availability:** 99.99% (autocomplete down = search feels broken)
4. **Freshness:** Trending topics surface within 5-10 minutes
5. **Storage:** 100M+ unique search phrases

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│              SEARCH AUTOCOMPLETE ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────┐     ┌──────────┐     ┌──────────────────────────┐   │
│  │ User   │────▶│  API     │────▶│    Suggestion Service    │   │
│  │ types  │     │ Gateway  │     │                          │   │
│  │ "pla"  │     └──────────┘     │  1. Exact prefix (Trie)  │   │
│  └────────┘                      │  2. Fuzzy match          │   │
│      │                           │  3. Trending boost       │   │
│      │ Every                     │  4. Personalization      │   │
│      │ keystroke                 │  5. Filter + Rank        │   │
│      │                           └──────────┬───────────────┘   │
│      │                                      │                   │
│      │                          ┌───────────┼──────────┐        │
│      │                          ▼           ▼          ▼        │
│      │                    ┌─────────┐ ┌─────────┐ ┌────────┐   │
│      │                    │  Trie   │ │  Redis  │ │Trending│   │
│      │                    │  Servers│ │  Cache  │ │ Service│   │
│      │                    │(In-Mem) │ │(Top-K)  │ │(Kafka) │   │
│      │                    └─────────┘ └─────────┘ └────────┘   │
│      │                                                          │
│      │                                                          │
│      ▼                                                          │
│  ┌────────────┐     ┌──────────────┐     ┌────────────────┐     │
│  │  Search    │────▶│   Search     │────▶│  Analytics DB  │     │
│  │  Executed  │     │   Log (Kafka)│     │  (ClickHouse)  │     │
│  └────────────┘     └──────────────┘     └────────────────┘     │
│                                                │                │
│                                          ┌─────▼──────┐         │
│                                          │ Trie Build │         │
│                                          │  (Offline,  │         │
│                                          │  every 15m) │         │
│                                          └────────────┘         │
│                                                                 │
│  Query: ~200K QPS (peak)    Latency: < 100ms p99               │
│  Trie Size: ~10 GB          Update: Every 15 minutes            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Trie-Based Autocomplete Engine

**Real-Life Scenario:** A user starts typing "how to lear" in the search box. In under 50ms, we need to show the top 5 most relevant completions.

**Technical Problem:** Design a Trie (prefix tree) that stores 100M+ search phrases and returns the top-K suggestions for any prefix in O(L) time.

### TypeScript Implementation

```typescript
/**
 * TRIE WITH TOP-K SUGGESTIONS
 * 
 * A Trie (prefix tree) is the canonical data structure for autocomplete.
 * Each node represents a character. Paths from root = prefixes.
 * 
 * Optimization: Instead of traversing ALL completions for a prefix,
 * each node PRE-COMPUTES the top-K suggestions for its prefix.
 * 
 * This turns a potentially O(N) search into O(L) where L = prefix length.
 * 
 * Example Trie for ["tree", "trie", "try", "trip", "trick"]:
 * 
 *         (root)
 *           │
 *           t
 *           │
 *           r ── top5: [tree, trie, try, trip, trick]
 *          / \
 *         e   i ── top5: [trie, trip, trick]
 *         │  / \
 *         e p   c
 *              │
 *              k
 * 
 * @timeComplexity O(L) per query where L = prefix length (NOT # of entries!)
 * @spaceComplexity O(N × L × K) where N = phrases, L = avg length, K = top-K
 */

interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfPhrase: boolean;
  phrase?: string;          // Full phrase (only set at leaf nodes)
  frequency: number;        // How many times this phrase was searched
  topSuggestions: Suggestion[];  // Pre-computed top-K for this prefix
}

interface Suggestion {
  phrase: string;
  score: number;            // Combined score (frequency + recency + trending)
}

class AutocompleteTrie {
  private root: TrieNode;
  private readonly TOP_K = 10;

  constructor() {
    this.root = this.createNode();
  }

  /**
   * Insert a phrase with its frequency.
   * Called during offline trie building, not during user queries.
   */
  insert(phrase: string, frequency: number): void {
    let node = this.root;

    for (const char of phrase.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, this.createNode());
      }
      node = node.children.get(char)!;

      // Update top-K suggestions at every node along the path
      this.updateTopSuggestions(node, { phrase, score: frequency });
    }

    node.isEndOfPhrase = true;
    node.phrase = phrase;
    node.frequency = frequency;
  }

  /**
   * Get autocomplete suggestions for a prefix.
   * 
   * This is the HOT PATH — called on every keystroke.
   * Must be O(L) where L = prefix length. No traversal beyond the prefix.
   */
  getSuggestions(prefix: string): Suggestion[] {
    let node = this.root;

    // Navigate to the prefix node: O(L)
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) {
        return []; // No matches for this prefix
      }
      node = node.children.get(char)!;
    }

    // Return pre-computed top-K: O(1)
    return node.topSuggestions;
  }

  /**
   * Maintain top-K suggestions at each node.
   * Uses a min-heap of size K for efficient updates.
   */
  private updateTopSuggestions(
    node: TrieNode, suggestion: Suggestion
  ): void {
    const existing = node.topSuggestions.findIndex(
      s => s.phrase === suggestion.phrase
    );

    if (existing >= 0) {
      // Update existing: take the higher score
      node.topSuggestions[existing].score = Math.max(
        node.topSuggestions[existing].score,
        suggestion.score
      );
    } else if (node.topSuggestions.length < this.TOP_K) {
      // Space available: just add
      node.topSuggestions.push(suggestion);
    } else {
      // Full: replace the lowest if new score is higher
      const minIdx = this.findMinIndex(node.topSuggestions);
      if (suggestion.score > node.topSuggestions[minIdx].score) {
        node.topSuggestions[minIdx] = suggestion;
      }
    }

    // Keep sorted by score (descending)
    node.topSuggestions.sort((a, b) => b.score - a.score);
  }

  private findMinIndex(suggestions: Suggestion[]): number {
    let minIdx = 0;
    for (let i = 1; i < suggestions.length; i++) {
      if (suggestions[i].score < suggestions[minIdx].score) {
        minIdx = i;
      }
    }
    return minIdx;
  }

  private createNode(): TrieNode {
    return {
      children: new Map(),
      isEndOfPhrase: false,
      frequency: 0,
      topSuggestions: [],
    };
  }
}

// ============================================
// OFFLINE TRIE BUILDER
// ============================================

/**
 * The Trie is NOT built in real-time.
 * It's rebuilt offline every 15 minutes from aggregated search logs.
 * 
 * Pipeline:
 * 1. Search logs → Kafka → ClickHouse (raw events)
 * 2. Every 15 min: ClickHouse aggregation query → phrase frequencies
 * 3. Build new Trie from aggregated data
 * 4. Serialize Trie to snapshot file (protobuf)
 * 5. Push snapshot to Trie servers (blue-green swap)
 * 
 * Why offline?
 * - Avoids write contention on the Trie (reads-only during serving)
 * - Enables complex scoring (trending + personalization)
 * - Trie servers are pure read replicas — easy to scale
 */

class TrieBuilder {
  /**
   * Build a new Trie from aggregated search data.
   * Runs every 15 minutes as a batch job.
   */
  async buildTrie(): Promise<AutocompleteTrie> {
    const trie = new AutocompleteTrie();

    // Aggregate search phrases from the last 30 days
    // with time-decay weighting (recent searches count more)
    const phrases = await this.analytics.query(`
      SELECT 
        search_phrase,
        SUM(count * decay_weight(search_date, NOW(), 30)) as weighted_frequency
      FROM search_aggregates
      WHERE search_date >= NOW() - INTERVAL '30 days'
        AND is_offensive = false
        AND character_length(search_phrase) >= 2
      GROUP BY search_phrase
      HAVING weighted_frequency >= 5  -- Filter out ultra-rare queries
      ORDER BY weighted_frequency DESC
      LIMIT 10000000  -- Top 10M phrases
    `);

    // Insert all phrases into the Trie
    for (const { search_phrase, weighted_frequency } of phrases) {
      trie.insert(search_phrase, weighted_frequency);
    }

    // Merge trending topics with higher boost
    const trending = await this.trendingService.getTopTrending(1000);
    for (const topic of trending) {
      // Trending topics get a 10x boost to appear above regular suggestions
      trie.insert(topic.phrase, topic.frequency * 10);
    }

    return trie;
  }

  /**
   * Deploy the new Trie to serving nodes.
   * 
   * Blue-Green deployment:
   * 1. Build new Trie (version N+1) on separate instances
   * 2. Health check the new instances
   * 3. Switch the load balancer to new instances
   * 4. Keep old instances as fallback for 10 minutes
   * 5. Decommission old instances
   * 
   * Zero-downtime updates.
   */
  async deployTrie(trie: AutocompleteTrie): Promise<void> {
    // Serialize to protobuf (compact binary format)
    const snapshot = this.serialize(trie);
    const version = Date.now();

    // Upload to S3
    await this.s3.upload('trie-snapshots', `trie-${version}.pb`, snapshot);

    // Signal Trie servers to load new version
    await this.orchestrator.rollout({
      artifact: `trie-${version}.pb`,
      strategy: 'blue-green',
      healthCheckUrl: '/health/trie',
      rollbackOnFailure: true,
    });
  }
}
```

---

## 5. Scenario B: Ranking, Personalization & Trending

**Real-Life Scenario:** Two users type "app" at the same time. User A (a developer) should see "apple developer documentation", "app store connect". User B (a shopper) should see "apple store near me", "apparel". Plus, if Apple just launched a new product, "apple event 2025" should trend for everyone.

**Technical Problem:** Design the ranking system that combines global popularity, personal history, and real-time trending signals.

### TypeScript Implementation

```typescript
/**
 * MULTI-SIGNAL RANKING ENGINE
 * 
 * The Trie gives us candidate phrases matching the prefix.
 * The Ranker scores and orders them for THIS specific user.
 * 
 * Signals:
 * 1. Global Popularity — How often this phrase is searched overall
 * 2. Personalization — User's own search history
 * 3. Trending — Recent spike in search volume
 * 4. Recency — More recent searches score higher
 * 5. Context — Time of day, location, device type
 * 
 * @timeComplexity O(K × S) where K = candidates, S = signals
 * @spaceComplexity O(U × H) where U = users, H = history size
 */

interface RankingContext {
  userId?: string;          // Null for anonymous users
  prefix: string;
  location?: GeoLocation;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  language: string;
  timestamp: number;
}

class SuggestionRanker {
  private readonly WEIGHTS = {
    globalPopularity: 0.35,
    personalization: 0.25,
    trending: 0.20,
    recency: 0.10,
    contextual: 0.10,
  };

  /**
   * Rank suggestions for a specific user and context.
   */
  async rank(
    candidates: Suggestion[], context: RankingContext
  ): Promise<Suggestion[]> {
    // Get user profile (search history) from Redis
    const userHistory = context.userId
      ? await this.getUserHistory(context.userId)
      : null;

    // Get trending topics
    const trendingTopics = await this.trendingService.getTrending(
      context.location?.country
    );

    // Score each candidate
    const scored = candidates.map(candidate => {
      const score = this.calculateScore(candidate, context, userHistory, trendingTopics);
      return { ...candidate, score };
    });

    // Sort by final score (descending)
    scored.sort((a, b) => b.score - a.score);

    // Apply diversity: don't show 5 very similar suggestions
    return this.diversify(scored).slice(0, 10);
  }

  private calculateScore(
    candidate: Suggestion,
    context: RankingContext,
    userHistory: UserHistory | null,
    trending: Map<string, number>
  ): number {
    let score = 0;

    // 1. GLOBAL POPULARITY (base signal)
    // Normalize to 0-1 range using log scale
    score += this.WEIGHTS.globalPopularity * 
      Math.log10(candidate.score + 1) / 10;

    // 2. PERSONALIZATION (user's own history)
    if (userHistory) {
      const personalScore = this.personalRelevance(candidate.phrase, userHistory);
      score += this.WEIGHTS.personalization * personalScore;
    }

    // 3. TRENDING BOOST
    const trendingScore = trending.get(candidate.phrase) || 0;
    if (trendingScore > 0) {
      // Trending topics get a significant boost
      score += this.WEIGHTS.trending * Math.min(trendingScore / 100, 1);
    }

    // 4. RECENCY (time-decay: recent phrases score higher)
    if (candidate.lastSearched) {
      const hoursSince = (Date.now() - candidate.lastSearched) / 3600000;
      const recencyScore = Math.exp(-hoursSince / 168); // Decay over 1 week
      score += this.WEIGHTS.recency * recencyScore;
    }

    // 5. CONTEXTUAL (time of day, location)
    score += this.WEIGHTS.contextual * 
      this.contextualRelevance(candidate.phrase, context);

    return score;
  }

  /**
   * Personal relevance: How relevant is this suggestion
   * to this specific user's history?
   * 
   * Signals:
   * - Did the user search for this exact phrase before?
   * - Did the user search for similar phrases (prefix overlap)?
   * - Does this match the user's interest categories?
   */
  private personalRelevance(
    phrase: string, history: UserHistory
  ): number {
    let score = 0;

    // Exact match in history (strongest signal)
    if (history.recentSearches.includes(phrase)) {
      score += 0.8;
    }

    // Category match (e.g., user searches for tech topics)
    const phraseCategory = this.categorize(phrase);
    const categoryAffinity = history.categoryAffinities.get(phraseCategory) || 0;
    score += 0.2 * categoryAffinity;

    return Math.min(score, 1.0);
  }

  /**
   * Contextual relevance: How relevant is this suggestion
   * given the current context (time, location, device)?
   * 
   * Examples:
   * - "breakfast near me" ranks higher in the morning
   * - "weather" ranks higher on mobile
   * - "restaurants" ranks higher in the evening
   */
  private contextualRelevance(
    phrase: string, context: RankingContext
  ): number {
    const hour = new Date(context.timestamp).getHours();
    let score = 0;

    // Time-based boosting
    if (phrase.includes('breakfast') && hour >= 6 && hour <= 10) score += 0.5;
    if (phrase.includes('lunch') && hour >= 11 && hour <= 14) score += 0.5;
    if (phrase.includes('dinner') && hour >= 17 && hour <= 21) score += 0.5;

    // Device-based boosting
    if (context.deviceType === 'mobile' && phrase.includes('near me')) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Diversity: Avoid showing too-similar suggestions.
   * 
   * Bad: ["iphone 15", "iphone 15 pro", "iphone 15 pro max", "iphone 15 case", "iphone 15 price"]
   * Good: ["iphone 15", "iphone 15 pro", "iphone case", "ipad", "apple store"]
   * 
   * Algorithm: Maximal Marginal Relevance (MMR)
   * Penalize candidates that are too similar to already-selected suggestions.
   */
  private diversify(scored: Suggestion[]): Suggestion[] {
    if (scored.length <= 5) return scored;

    const selected: Suggestion[] = [scored[0]]; // Always include top result
    const remaining = scored.slice(1);

    while (selected.length < 10 && remaining.length > 0) {
      let bestIdx = 0;
      let bestMmrScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const relevance = remaining[i].score;
        const maxSimilarity = Math.max(
          ...selected.map(s => this.similarity(remaining[i].phrase, s.phrase))
        );
        // MMR = λ * relevance - (1-λ) * maxSimilarity
        const mmrScore = 0.7 * relevance - 0.3 * maxSimilarity;
        
        if (mmrScore > bestMmrScore) {
          bestMmrScore = mmrScore;
          bestIdx = i;
        }
      }

      selected.push(remaining[bestIdx]);
      remaining.splice(bestIdx, 1);
    }

    return selected;
  }

  /**
   * Simple string similarity (Jaccard on character bigrams).
   * In production, use embedding-based similarity.
   */
  private similarity(a: string, b: string): number {
    const bigramsA = new Set<string>();
    const bigramsB = new Set<string>();
    for (let i = 0; i < a.length - 1; i++) bigramsA.add(a.slice(i, i + 2));
    for (let i = 0; i < b.length - 1; i++) bigramsB.add(b.slice(i, i + 2));
    
    const intersection = [...bigramsA].filter(b => bigramsB.has(b)).length;
    const union = new Set([...bigramsA, ...bigramsB]).size;
    return union === 0 ? 0 : intersection / union;
  }
}

// ============================================
// TRENDING SERVICE
// ============================================

/**
 * Trending Detection: Identify search phrases with
 * abnormal volume spikes in real-time.
 * 
 * Algorithm:
 *   1. Maintain a sliding window of search counts per phrase (last 1 hour)
 *   2. Compare to the same hour from the previous 7 days (baseline)
 *   3. If current > 3× baseline → TRENDING
 *   4. If current > 10× baseline → VIRAL/BREAKING NEWS
 * 
 * Implementation:
 *   - Kafka stream of search events
 *   - Flink/Spark Streaming for windowed aggregation
 *   - Results pushed to Redis for fast lookup by the ranking engine
 */

class TrendingService {
  /**
   * Real-time trending detection using sliding windows.
   * 
   * Uses Redis Sorted Sets for efficient time-windowed counting.
   */
  async recordSearch(phrase: string): Promise<void> {
    const normalizedPhrase = phrase.toLowerCase().trim();
    const now = Date.now();
    const windowKey = `trending:${this.getHourBucket(now)}`;

    // Increment count in current hour's sorted set
    await this.redis.zincrby(windowKey, 1, normalizedPhrase);
    await this.redis.expire(windowKey, 7200); // Expire after 2 hours
  }

  /**
   * Get currently trending topics.
   * Compares current hour's counts to 7-day baseline.
   */
  async getTrending(country?: string): Promise<Map<string, number>> {
    const currentHour = this.getHourBucket(Date.now());
    const currentKey = `trending:${currentHour}`;

    // Get top 100 phrases in the current hour
    const currentTop = await this.redis.zrevrangebyscore(
      currentKey, '+inf', 100, 'WITHSCORES', 'LIMIT', 0, 100
    );

    const trending = new Map<string, number>();

    for (const [phrase, currentCount] of currentTop) {
      // Get 7-day baseline for the same hour
      const baselineCount = await this.getBaseline(phrase, currentHour);
      
      if (baselineCount > 0) {
        const ratio = currentCount / baselineCount;
        if (ratio > 3) {
          // Trending! Score = how many times above baseline
          trending.set(phrase, ratio);
        }
      } else if (currentCount > 50) {
        // No baseline (new phrase) but significant volume
        trending.set(phrase, 10); // Assume very trending
      }
    }

    return trending;
  }
}

// ============================================
// BACK-OF-ENVELOPE ESTIMATION
// ============================================

/**
 * Scale (Google-like):
 *   Searches/day: 8.5 billion
 *   Autocomplete requests: ~5× searches = ~40B/day (multiple keystrokes per search)
 *   QPS: 40B / 86,400 ≈ 460K QPS average, ~1.5M QPS peak
 * 
 * Trie Size:
 *   Unique phrases: ~100M (after filtering rare queries)
 *   Average phrase length: 20 characters
 *   Per node: ~100 bytes (char + children pointers + top-10 suggestions)
 *   Total: 100M phrases × 20 chars × 100 bytes/node = ~200 GB (raw)
 *   With optimization (compression, shared prefixes): ~10-20 GB per server
 *   
 * Serving:
 *   Each Trie server handles ~10K QPS (in-memory, O(L) lookup)
 *   1.5M peak QPS / 10K = 150 Trie servers
 *   With replication (3x): 450 Trie servers globally
 * 
 * Caching:
 *   Top 100K prefixes (1-3 chars): Pre-cached in Redis
 *   Cache hit rate: ~80% (people search for similar things)
 *   Redis: 100K × 10 suggestions × 100 bytes = ~100 MB (trivial)
 * 
 * Latency Budget:
 *   Client → CDN:              5 ms
 *   CDN → API Gateway:         2 ms
 *   API Gateway → Trie Server: 5 ms
 *   Trie lookup (in-memory):   0.1 ms
 *   Ranking:                   5 ms
 *   Response serialization:    2 ms
 *   Total:                     ~20 ms (well under 100ms SLA)
 */
```

---

## 6. Real World Applications 🌍

### 1. 🔍 Google Search Autocomplete

**Architecture:**
- **Scale:** 8.5 billion searches/day, autocomplete for every keystroke.
- **Approach:** Combination of Trie-based matching + ML ranking models.
- **Personalization:** Recent searches, location, language, search history.
- **Freshness:** Trending topics surface within minutes (e.g., breaking news).
- **Entity-aware:** Understands "apple" (company) vs "apple" (fruit) based on context.
- **Infrastructure:** Served from Google's edge network (Google Front End servers in 100+ locations).
- **Latency:** < 30ms target (faster than human perception of delay).

### 2. 🛒 Amazon Product Search

**Architecture:**
- Optimized for **product intent**, not general search.
- "iph" → "iphone 15", "iphone case", "iphone charger" (always products).
- Uses **behavioral signals** heavily: What did users who typed "iph" eventually BUY?
- Department-aware: Suggestions change based on selected department.
- Spelling correction: "samsng" → "samsung" using edit-distance models.
- Revenue-weighted: Products with higher conversion rate rank higher.

### 3. 🐦 Twitter/X Search

**Architecture:**
- Mixes **accounts, hashtags, and topics** in suggestions.
- "elon" → @elonmusk (account) + #ElonMusk (hashtag) + "elon musk news" (topic).
- Real-time trending: Hashtags spike during events and surface within seconds.
- Social graph: Friends' accounts rank higher.
- Recency-biased: Recent tweets and trends dominate.

### 4. 📍 Google Maps Autocomplete

**Architecture:**
- **Geospatial-aware:** "star" shows "Starbucks" near you, not the star constellation.
- Uses **Place IDs** (not text matching) — "NYC" matches "New York City" because they share a Place ID.
- Combines text matching with geospatial ranking (distance from user).
- Autocomplete results include place type icons (🏪 📍 🏨).
- Works offline on mobile (cached local places).

---

## 7. Complexity Analysis 🧠

### Data Structure Comparison

| Approach | Lookup Time | Space | Prefix Support | Ranking | Best For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Trie** | O(L) | O(N×L) | ✅ Native | Pre-computed | Exact prefix match |
| **Hash Map** | O(1) | O(N) | ❌ No | Per-query | Full-phrase lookup |
| **Sorted Array + Binary Search** | O(L×logN) | O(N) | ✅ With range | Per-query | Simple, small datasets |
| **Elasticsearch** | O(1) amortized | O(N) | ✅ Edge-ngram | Built-in | Multi-field, fuzzy, weighted |
| **Compressed Trie (Patricia)** | O(L) | O(N) | ✅ Native | Pre-computed | Memory-constrained |

### Optimization Techniques

| Technique | Benefit | Trade-off |
| :--- | :--- | :--- |
| **Pre-compute top-K per node** | O(1) suggestion retrieval | More memory, stale until rebuild |
| **Two-level cache** | 80%+ cache hit rate | Cache invalidation complexity |
| **Client-side debounce** | Reduce QPS by 50-70% | Slightly delayed suggestions |
| **Browser caching** | Instant for repeated prefixes | Stale suggestions |
| **Prefix sampling** | Only cache 1-3 char prefixes | Longer prefixes not cached |
| **Trie compression** | 50-70% less memory | Slightly complex implementation |

### Request Optimization

```
Without optimization:
  User types "weather" → 7 API calls (w, we, wea, weat, weath, weathe, weather)

With debounce (200ms):
  User types "weather" (fast typist, 80ms/char) → 2 API calls ("weat", "weather")
  
With prefix caching:
  "w" → cached (browser), "wea" → cached (CDN), "weather" → Trie server
  Result: 1 API call reaches backend

Savings: 7 → 1 API call = 85% reduction in backend QPS
```

### Interview Tips 💡

1. **Start with scale estimation:** "5 billion searches/day means ~60K QPS average, ~200K peak. Each search triggers 3-5 autocomplete requests (keystrokes with debouncing). So we're looking at 200K-1M autocomplete QPS. This tells us we need in-memory serving."
2. **Explain the Trie with pre-computed top-K:** "A naive Trie requires traversing all children to find completions — that's too slow. We pre-compute the top 10 suggestions at every node during offline build. This makes query time O(L) where L = prefix length, regardless of how many completions exist."
3. **Offline build is the key insight:** "The Trie is NOT updated in real-time. We rebuild it every 15 minutes from aggregated search logs. This separates the read path (serving, must be fast) from the write path (building, can be slow). Trie servers are stateless read replicas."
4. **Client-side optimization is critical:** "Debounce keystrokes (wait 200ms after the user stops typing). Cache recent prefix results in the browser (localStorage). These two optimizations reduce backend QPS by 70-85% — the cheapest scaling strategy."
5. **Trending requires a separate system:** "The 15-minute Trie rebuild is too slow for breaking news. We maintain a separate real-time trending service (Kafka streams + sliding window counters) that boosts trending phrases in the ranking layer."
6. **Personalization lives in the ranking layer, not the Trie:** "The Trie returns the same candidates for everyone. Personalization happens in the ranker — we boost candidates based on the user's search history stored in Redis. This keeps the Trie simple and stateless."
7. **Filtering is non-negotiable:** "Autocomplete can surface offensive, dangerous, or legally problematic suggestions. We maintain a blocklist applied during Trie build AND a real-time filter in the serving layer. This is a legal requirement, not just a nice-to-have."
