# Design: Twitter News Feed 📰

## 1. The "Newspaper vs Radio" Analogy

Imagine millions of people broadcasting short messages, and each person follows a different set of broadcasters.

**The Challenge:** Every user has a unique, personalized "front page" based on who they follow. How do you assemble billions of unique front pages in real-time?

**Option A: "Print a Custom Newspaper on Demand" (Pull Model)**
- When you sit down for breakfast, a reporter runs to EVERY person you follow, collects their latest messages, sorts them, and delivers your custom newspaper.
- Problem: You follow 500 people? That's 500 trips **every time you open the app**.

**Option B: "Radio Broadcast to Subscribers" (Push Model / Fan-Out on Write)**
- When a broadcaster speaks, their message is immediately delivered to every subscriber's mailbox.
- When you sit down for breakfast, your mailbox already has the sorted newspaper. Instant!
- Problem: Katy Perry has 100M followers. One tweet → 100M mailbox deliveries!

**This is the News Feed Problem.** The single most impactful trade-off in social media architecture: **Fan-Out on Write** (pre-compute feeds) vs **Fan-Out on Read** (compute on demand).

---

## 2. The Core Concept

The news feed is one of the most complex interview design questions because it combines:
- **Fan-out strategies** (write-heavy vs read-heavy trade-off)
- **Ranking algorithms** (relevance, time, engagement)
- **Real-time systems** (new posts appear without refresh)
- **Caching at scale** (billions of personalized feeds)

**Functional Requirements:**
1. Users can post content (text, images, videos)
2. Users can follow/unfollow other users
3. Users see a personalized feed of posts from people they follow
4. Feed is ordered by relevance or time
5. Support likes, comments, shares

**Non-Functional Requirements:**
1. Feed generation: < 500ms
2. High availability (feed is the core product)
3. Scale: 500M daily active users, 1B posts/day
4. Real-time updates (new posts within seconds)

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│           FAN-OUT ON WRITE vs FAN-OUT ON READ                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FAN-OUT ON WRITE (Push)          FAN-OUT ON READ (Pull)        │
│  ═══════════════════════          ══════════════════════        │
│                                                                 │
│  User A posts tweet               User B opens feed             │
│       │                                │                        │
│       ▼                                ▼                        │
│  ┌──────────┐                    ┌──────────┐                   │
│  │ Write to │                    │ Query all │                   │
│  │ Post DB  │                    │ followed  │                   │
│  └────┬─────┘                    │ users'    │                   │
│       │                          │ posts     │                   │
│       ▼                          └────┬─────┘                   │
│  ┌──────────────┐                     │                         │
│  │ Fan out to   │                     ▼                         │
│  │ ALL follower │               ┌──────────┐                    │
│  │ feed caches  │               │  Merge + │                    │
│  └──────────────┘               │  Rank    │                    │
│       │                         └──────────┘                    │
│  User B's cache  ← "tweet"                                     │
│  User C's cache  ← "tweet"     ⚠️ Slow for users following     │
│  User D's cache  ← "tweet"        many accounts                │
│  ...100M caches  ← "tweet"                                     │
│                                 ✓ Simple, no write amplification│
│  ⚠️ Celebrity problem:                                         │
│     1 tweet → 100M writes!      ✓ Always fresh data            │
│  ✓ Feed reads are instant                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Hybrid Fan-Out Architecture

**Real-Life Scenario:** Twitter has both Katy Perry (100M followers) and regular users (200 followers). One strategy doesn't fit all.

**Technical Problem:** Design a hybrid system that handles both cases efficiently.

### TypeScript Implementation

```typescript
/**
 * HYBRID FAN-OUT ARCHITECTURE
 * 
 * Strategy: Different approaches for different user types
 * 
 * Regular Users (< 10K followers):  Fan-Out on WRITE (push to caches)
 * Celebrity Users (> 10K followers): Fan-Out on READ (pull on demand)
 * 
 * This is what Twitter actually does!
 * 
 * @timeComplexity Write: O(F) for regular users, O(1) for celebrities
 *                 Read: O(1) cache hit + O(C) merge C celebrity feeds
 */

const CELEBRITY_THRESHOLD = 10_000; // Followers threshold

// ============================================
// POST CREATION (Write Path)
// ============================================

class FeedWriteService {
  private postDb: PostDatabase;
  private feedCache: FeedCacheService;
  private followerService: FollowerService;
  private messageQueue: MessageQueue;

  /**
   * When a user creates a new post.
   */
  async createPost(userId: string, content: PostContent): Promise<Post> {
    // 1. Save post to database (source of truth)
    const post = await this.postDb.insert({
      id: generateId(),
      userId,
      content,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
    });

    // 2. Get the poster's follower count
    const followerCount = await this.followerService.getFollowerCount(userId);

    // 3. Decide fan-out strategy
    if (followerCount < CELEBRITY_THRESHOLD) {
      // REGULAR USER → Fan-Out on Write
      // Enqueue async job to push to all follower caches
      await this.messageQueue.publish('fanout', {
        postId: post.id,
        userId: userId,
        type: 'WRITE_FANOUT',
      });
    } else {
      // CELEBRITY → Do NOT fan out on write
      // Post just sits in the posts table.
      // Followers will PULL it when they load their feed.
      console.log(`Celebrity post: ${userId} (${followerCount} followers). No write fanout.`);
    }

    return post;
  }
}

// ============================================
// FAN-OUT WORKER (Async Background Job)
// ============================================

class FanOutWorker {
  private feedCache: FeedCacheService;
  private followerService: FollowerService;

  /**
   * Process fan-out job for a regular user's post.
   * 
   * Called asynchronously from message queue.
   * Pushes the post into each follower's feed cache.
   */
  async processFanOut(postId: string, userId: string): Promise<void> {
    const post = await this.postDb.getById(postId);
    
    // Get all followers (paginated for large follower sets)
    let cursor: string | undefined;
    
    do {
      const { followers, nextCursor } = await this.followerService.getFollowers(
        userId, { cursor, limit: 1000 }
      );

      // Push post to each follower's feed cache in parallel
      const pushPromises = followers.map(followerId =>
        this.feedCache.addToFeed(followerId, {
          postId: post.id,
          userId: post.userId,
          createdAt: post.createdAt.getTime(),
          score: post.createdAt.getTime(), // Simple time-based ordering
        })
      );

      await Promise.all(pushPromises);
      cursor = nextCursor;
    } while (cursor);
    
    console.log(`Fan-out complete: Post ${postId} delivered to all followers.`);
  }
}

// ============================================
// FEED CACHE (Redis Sorted Set)
// ============================================

/**
 * Each user has a Redis Sorted Set as their feed cache.
 * 
 * Key: "feed:{userId}"
 * Members: Post IDs
 * Scores: Timestamp (or ranking score)
 * 
 * Redis ZREVRANGE gives us top N posts sorted by score.
 * 
 * Memory: ~500 posts per user × 100 bytes = 50KB per user
 *         500M users × 50KB = 25TB (distributed Redis cluster)
 */
class FeedCacheService {
  private redis: RedisClient;
  private maxFeedSize = 500; // Keep last 500 posts per user

  async addToFeed(userId: string, entry: FeedEntry): Promise<void> {
    const key = `feed:${userId}`;
    
    // Add post to sorted set (score = timestamp or relevance score)
    await this.redis.zadd(key, entry.score, JSON.stringify(entry));
    
    // Trim to max size (remove oldest entries)
    await this.redis.zremrangebyrank(key, 0, -(this.maxFeedSize + 1));
    
    // Set TTL (feeds expire if user is inactive)
    await this.redis.expire(key, 7 * 24 * 3600); // 7 days
  }

  async getFeed(userId: string, page: number, pageSize: number): Promise<FeedEntry[]> {
    const key = `feed:${userId}`;
    const start = page * pageSize;
    const end = start + pageSize - 1;

    const entries = await this.redis.zrevrange(key, start, end);
    return entries.map((e: string) => JSON.parse(e));
  }
}
```

---

## 5. Scenario B: Feed Generation (Read Path)

**Real-Life Scenario:** A user opens the Twitter app. They need to see their personalized feed within 500ms.

**Technical Problem:** Merge pre-computed feed cache with real-time celebrity posts and apply ranking.

### TypeScript Implementation

```typescript
/**
 * FEED GENERATION (Read Path)
 * 
 * When a user opens the app:
 * 1. Get pre-computed feed from cache (regular users' posts)
 * 2. MERGE with celebrity posts (pulled on demand)
 * 3. Apply ranking algorithm
 * 4. Return paginated results
 * 
 * This is the HYBRID approach.
 */

class FeedReadService {
  private feedCache: FeedCacheService;
  private postDb: PostDatabase;
  private followerService: FollowerService;
  private rankingService: RankingService;
  private userService: UserService;

  /**
   * Generate a user's personalized feed.
   * 
   * @param userId - The user requesting their feed
   * @param page - Pagination offset
   * @param pageSize - Number of posts per page (default 20)
   * @returns Ranked, personalized feed
   * 
   * @timeComplexity O(P + C*K) where P = page size, C = celebrity follows, K = posts per celebrity
   * @spaceComplexity O(P + C*K) for merge buffer
   */
  async getFeed(
    userId: string, page: number = 0, pageSize: number = 20
  ): Promise<FeedResponse> {
    // 1. Get pre-computed feed from cache (regular users' posts)
    const cachedPosts = await this.feedCache.getFeed(userId, page, pageSize * 2);

    // 2. Get celebrity posts (Fan-Out on Read)
    const celebrityPosts = await this.getCelebrityPosts(userId);

    // 3. Merge both sources
    const allPosts = [...cachedPosts, ...celebrityPosts];

    // 4. De-duplicate (in case of edge cases)
    const uniquePosts = this.dedup(allPosts);

    // 5. Apply ranking algorithm
    const rankedPosts = await this.rankingService.rank(userId, uniquePosts);

    // 6. Paginate
    const paginatedPosts = rankedPosts.slice(0, pageSize);

    // 7. Hydrate posts with full data (author info, like counts, etc.)
    const hydratedPosts = await this.hydratePosts(paginatedPosts);

    return {
      posts: hydratedPosts,
      nextCursor: paginatedPosts.length === pageSize ? page + 1 : null,
    };
  }

  /**
   * Fetch recent posts from celebrities this user follows.
   * Only called for users that follow celebrities.
   */
  private async getCelebrityPosts(userId: string): Promise<FeedEntry[]> {
    // Get list of celebrities this user follows
    const following = await this.followerService.getFollowing(userId);
    const celebrities = following.filter(u => u.followerCount >= CELEBRITY_THRESHOLD);

    if (celebrities.length === 0) return [];

    // Fetch recent posts from each celebrity (parallel)
    const celebrityPostPromises = celebrities.map(celeb =>
      this.postDb.getRecentPosts(celeb.id, { limit: 5, since: '24h' })
    );

    const results = await Promise.all(celebrityPostPromises);
    return results.flat().map(post => ({
      postId: post.id,
      userId: post.userId,
      createdAt: post.createdAt.getTime(),
      score: post.createdAt.getTime(),
    }));
  }

  private dedup(posts: FeedEntry[]): FeedEntry[] {
    const seen = new Set<string>();
    return posts.filter(p => {
      if (seen.has(p.postId)) return false;
      seen.add(p.postId);
      return true;
    });
  }

  /**
   * Hydrate feed entries with full post data + author info.
   * Uses batched queries and caching for efficiency.
   */
  private async hydratePosts(entries: FeedEntry[]): Promise<HydratedPost[]> {
    const postIds = entries.map(e => e.postId);
    const userIds = [...new Set(entries.map(e => e.userId))];

    // Batch fetch posts and users (2 queries instead of N)
    const [posts, users] = await Promise.all([
      this.postDb.getByIds(postIds),
      this.userService.getByIds(userIds),
    ]);

    const userMap = new Map(users.map(u => [u.id, u]));

    return posts.map(post => ({
      ...post,
      author: userMap.get(post.userId)!,
      isLiked: false, // Would check user's like status
    }));
  }
}

// ============================================
// RANKING SERVICE
// ============================================

/**
 * Feed Ranking Algorithm
 * 
 * Simple scoring formula:
 *   Score = recency_weight * recency
 *         + engagement_weight * engagement
 *         + affinity_weight * user_affinity
 * 
 * Recency: How recent is the post?
 * Engagement: How many likes, comments, shares?
 * Affinity: How close is the author to this user?
 */
class RankingService {
  private weights = {
    recency: 0.4,
    engagement: 0.3,
    affinity: 0.3,
  };

  async rank(userId: string, posts: FeedEntry[]): Promise<FeedEntry[]> {
    const scoredPosts = await Promise.all(
      posts.map(async (post) => ({
        ...post,
        rankScore: await this.calculateScore(userId, post),
      }))
    );

    return scoredPosts.sort((a, b) => b.rankScore - a.rankScore);
  }

  private async calculateScore(userId: string, post: FeedEntry): Promise<number> {
    const now = Date.now();

    // Recency: Decays exponentially (half-life = 6 hours)
    const ageHours = (now - post.createdAt) / (1000 * 60 * 60);
    const recencyScore = Math.exp(-0.115 * ageHours); // Decay: 50% at 6 hours

    // Engagement: Normalized likes + comments + shares
    const engagement = (post.likes || 0) + (post.comments || 0) * 2 + (post.shares || 0) * 3;
    const engagementScore = Math.log10(Math.max(engagement, 1)) / 5; // Normalize to 0-1

    // Affinity: How often does this user interact with the post author?
    const affinityScore = await this.getAffinityScore(userId, post.userId);

    return (
      this.weights.recency * recencyScore +
      this.weights.engagement * engagementScore +
      this.weights.affinity * affinityScore
    );
  }

  private async getAffinityScore(userId: string, authorId: string): Promise<number> {
    // In production: ML model trained on interaction history
    // Simplified: Count recent interactions / max interactions
    return 0.5; // Placeholder
  }
}
```

### Data Model

```
┌─────────────────────────────────────────────────────────┐
│                    DATA MODEL                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   users {                    followers {                 │
│     id: UUID (PK)              follower_id: UUID (PK)   │
│     username: VARCHAR           followed_id: UUID (PK)  │
│     follower_count: INT         created_at: TIMESTAMP   │
│     is_celebrity: BOOL        }                         │
│   }                                                     │
│                                                         │
│   posts {                    feed_cache (Redis) {       │
│     id: UUID (PK)              key: "feed:{userId}"     │
│     user_id: UUID (FK)         type: Sorted Set         │
│     content: TEXT               members: Post IDs       │
│     media_urls: JSONB           scores: Timestamp       │
│     created_at: TIMESTAMP     }                         │
│     likes: INT                                          │
│     comments: INT                                       │
│   }                                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Real World Applications 🌍

### 1. 🐦 Twitter (Hybrid Model)

**Architecture:**
- GraphJet (in-memory graph) for real-time recommendations.
- Fan-out on write for regular users (~300 followers avg).
- Fan-out on read for celebrities.
- Manhattan DB for tweet storage, Redis for feed cache.
- Timeline caches are invalidated every 24 hours.

**Scale:** 500M tweets/day, 200B feed reads/day.

### 2. 📘 Facebook (Aggregator + Ranking ML)

**Architecture:**
- Uses a sophisticated ML ranking model (not just time-based).
- Fan-out on write for most users.
- Aggregator service merges posts from followed pages, groups, and friends.
- Real-time prediction: "Will this user engage with this post?"

**Ranking signals:** 10,000+ features including recency, relationship, content type, past engagement.

### 3. 📸 Instagram (Pull-Based)

**Architecture:**
- Primarily fan-out on read (different from Twitter).
- Cassandra for post storage (write-heavy).
- Personalized ranking based on interest, timeliness, relationship.
- Explore feed: ML-based content recommendation.

### 4. 🔗 LinkedIn (Hybrid + Business Context)

**Architecture:**
- Feed includes posts, articles, job updates, and ads.
- Real-time ranking considers professional relevance.
- Anti-viral mechanisms (prevents misinformation from spreading too fast).
- "Follow" graph is separate from "Connection" graph.

---

## 7. Complexity Analysis 🧠

### Back-of-Envelope Estimation

```
Users: 500M DAU

Posts Created:
  - 500M users × 0.5 posts/day = 250M posts/day
  - Write QPS: 250M / 86400 ≈ 3,000 posts/sec

Feed Reads:
  - 500M users × 10 feed refreshes/day = 5B reads/day
  - Read QPS: 5B / 86400 ≈ 58,000 reads/sec
  - Peak (3x): 174,000 reads/sec

Fan-Out (Writes to Feed Caches):
  - Average followers: 200
  - 3,000 posts/sec × 200 followers = 600,000 cache writes/sec
  - Celebrity post (1M followers): 1 post = 0 cache writes (pull model)

Storage:
  - Post: ~1KB avg (including metadata)
  - 250M posts/day × 365 days × 1KB = 91 TB/year
  - Feed cache: 500M users × 50KB = 25 TB (Redis cluster)

Bandwidth:
  - Read: 58K req/sec × 20KB response = 1.2 GB/sec
```

### Trade-off Matrix

| Approach | Write Cost | Read Cost | Freshness | Celebrity Handling |
| :--- | :--- | :--- | :--- | :--- |
| **Fan-Out on Write** | O(followers) ✗ | O(1) ✓ | Pre-computed ✓ | Breaks at scale ✗ |
| **Fan-Out on Read** | O(1) ✓ | O(following) ✗ | Always fresh ✓ | Works ✓ |
| **Hybrid** | O(followers) for regular | O(1) + O(celebrities) | Pre-computed + fresh ✓ | Best of both ✓ |

### Interview Tips 💡

1. **Start with the trade-off:** "The core decision is fan-out on write vs read. I'd use a hybrid approach."
2. **Mention the celebrity problem:** "Users with 100M followers can't fan-out on write — one tweet would require 100M cache writes."
3. **Discuss ranking:** "Time-based ordering is simple, but engagement-based ranking (like Facebook) is what modern feeds use."
4. **Cache design:** "Redis Sorted Sets are perfect for feeds — O(1) insert, O(K) range query."
5. **Real-time updates:** "Use WebSocket or SSE for real-time feed updates without polling."
6. **Scale numbers:** "At 500M DAU with 200 avg followers, we're looking at 600K cache writes/sec during fan-out."
7. **Edge cases — unfollow/mute/block:** "When a user unfollows someone, we need to remove their posts from the feed cache. Mute and block require feed-time filtering. These are deceptively complex — block must be bidirectional and affect recommendations too."
