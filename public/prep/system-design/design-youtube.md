# Design: YouTube / Video Streaming Platform 📺

## 1. The "TV Broadcasting Studio" Analogy

Imagine you run a TV broadcasting company. A filmmaker drops off a master tape at your studio.

**The Problem:**
- The tape is in 4K, 60fps, ProRes format — **50 GB for a 10-minute video**.
- Some viewers have a 4K Smart TV. Others have a phone on 3G in rural India.
- The filmmaker wants their video available in Tokyo, São Paulo, and Lagos — simultaneously.

**What You Do:**
1. **Receive the Tape:** The filmmaker uploads the master file to your studio (origin server).
2. **Transcode:** You create multiple copies — 4K, 1080p, 720p, 480p, 360p — each in different bitrates. Like dubbing a movie into 10 languages, but for quality levels.
3. **Slice into Segments:** You chop each version into 4-second chunks. If the viewer's network drops from 4G to 3G mid-video, you seamlessly switch from 1080p chunks to 480p chunks — **Adaptive Bitrate Streaming (ABR)**.
4. **Distribute Globally:** You ship copies of the popular chunks to local stations (CDN edge servers) in every major city. When someone in Tokyo hits play, they stream from the Tokyo station, not your New York studio.

**This is YouTube.** Upload → Transcode → Segment → Distribute → Stream adaptively. The engineering challenge is doing this for **500 hours of video uploaded every minute** and serving **1 billion hours of video watched every day**.

---

## 2. The Core Concept

Video streaming is one of the most complex system design problems because it combines:
- **Large file handling** (upload + storage of petabytes)
- **CPU-intensive processing** (transcoding — the most expensive operation)
- **Global content delivery** (CDN at massive scale)
- **Real-time adaptive streaming** (ABR based on network conditions)
- **Recommendation engine** (ML-driven discovery)

**Functional Requirements:**
1. Users can upload videos (up to 1 hour, max 10 GB)
2. Videos are transcoded into multiple resolutions/bitrates
3. Users can search and browse videos
4. Users can stream videos with adaptive bitrate
5. Users can like, comment, subscribe, and track watch history
6. Personalized recommendations and trending videos

**Non-Functional Requirements:**
1. **Scale:** 2 billion MAU, 500 hours uploaded/minute, 1B hours watched/day
2. **Availability:** 99.99% for streaming (core revenue)
3. **Latency:** Video playback starts within 2 seconds
4. **Durability:** Videos must never be lost once uploaded
5. **Global:** Serve users across 100+ countries with low latency

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│              VIDEO STREAMING ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  UPLOAD PATH (Write)              STREAMING PATH (Read)         │
│  ═══════════════════              ═════════════════════          │
│                                                                 │
│  ┌────────┐                       ┌────────┐                    │
│  │Creator │                       │Viewer  │                    │
│  │(Upload)│                       │(Watch) │                    │
│  └───┬────┘                       └───┬────┘                    │
│      │                                │                         │
│      ▼                                ▼                         │
│  ┌──────────┐                    ┌──────────┐                   │
│  │ Upload   │                    │   CDN    │ ← 95% cache hit   │
│  │ Service  │                    │  (Edge)  │                   │
│  └────┬─────┘                    └────┬─────┘                   │
│       │                               │ Cache MISS              │
│       ▼                               ▼                         │
│  ┌──────────┐                    ┌──────────┐                   │
│  │   S3     │───────────────────▶│  Origin  │                   │
│  │ (Raw)    │                    │  Storage │                   │
│  └────┬─────┘                    └──────────┘                   │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Transcode   │    │  Transcode   │    │  Transcode   │       │
│  │  Worker 1    │    │  Worker 2    │    │  Worker N    │       │
│  │  (4K→1080p)  │    │  (4K→720p)   │    │  (4K→360p)  │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             ▼                                   │
│                    ┌──────────────┐                              │
│                    │  S3 (Trans-  │                              │
│                    │   coded)     │ ← HLS/DASH segments         │
│                    └──────────────┘                              │
│                                                                 │
│  Upload: ~500 hours/min    Watch: ~1B hours/day                 │
│  Write: ~10 QPS            Read: ~5M concurrent streams         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Video Upload & Transcoding Pipeline

**Real-Life Scenario:** A creator uploads a 4K, 30-minute video (8 GB). It needs to be available for streaming in multiple qualities within 30 minutes.

**Technical Problem:** Design the upload, transcoding, and storage pipeline for 500 hours of video uploaded every minute.

### TypeScript Implementation

```typescript
/**
 * VIDEO UPLOAD & TRANSCODING PIPELINE
 * 
 * Flow:
 * 1. Client uploads raw video to presigned S3 URL (direct-to-S3, bypasses app servers)
 * 2. S3 event triggers transcoding job via message queue
 * 3. Transcoding workers process video into multiple resolutions
 * 4. Each resolution is segmented into 4-second HLS/DASH chunks
 * 5. Segments are stored in S3, metadata in database
 * 6. CDN pre-warms popular content
 * 
 * @timeComplexity O(R × D) where R = resolutions, D = video duration
 * @spaceComplexity O(R × S) where S = original file size (compressed)
 */

// ============================================
// STEP 1: UPLOAD SERVICE
// ============================================

interface UploadRequest {
  userId: string;
  title: string;
  description: string;
  tags: string[];
  fileSizeBytes: number;
  mimeType: string;
}

interface PresignedUploadResponse {
  videoId: string;
  presignedUrl: string;       // Direct S3 upload URL
  expiresAt: Date;            // URL expires in 1 hour
  maxSizeBytes: number;       // 10 GB limit
  callbackUrl: string;        // App server notified on completion
}

class UploadService {
  /**
   * Generate a presigned S3 URL for direct upload.
   * 
   * WHY PRESIGNED URLs?
   * - Video bypasses our application servers entirely
   * - S3 handles the upload (multipart, resumable)
   * - Our servers never touch the raw file
   * - Saves bandwidth and CPU on app servers
   */
  async initiateUpload(req: UploadRequest): Promise<PresignedUploadResponse> {
    // Validate request
    if (req.fileSizeBytes > 10 * 1024 * 1024 * 1024) {
      throw new Error('File too large. Maximum: 10 GB');
    }

    const videoId = generateUUID();

    // Create video metadata (status: UPLOADING)
    await this.db.insert('videos', {
      id: videoId,
      userId: req.userId,
      title: req.title,
      description: req.description,
      tags: req.tags,
      status: 'UPLOADING',
      rawStoragePath: `raw/${videoId}/original`,
      createdAt: new Date(),
    });

    // Generate presigned S3 URL (valid for 1 hour)
    const presignedUrl = await this.s3.getPresignedUrl({
      bucket: 'video-raw-uploads',
      key: `raw/${videoId}/original`,
      expiry: 3600,
      contentType: req.mimeType,
      maxSize: req.fileSizeBytes,
    });

    return {
      videoId,
      presignedUrl,
      expiresAt: new Date(Date.now() + 3600_000),
      maxSizeBytes: 10 * 1024 * 1024 * 1024,
      callbackUrl: `/api/v1/videos/${videoId}/upload-complete`,
    };
  }

  /**
   * Called when S3 triggers upload completion event.
   * Enqueues the transcoding job.
   */
  async onUploadComplete(videoId: string): Promise<void> {
    // Update status
    await this.db.update('videos', videoId, { status: 'UPLOADED' });

    // Extract video metadata (duration, resolution, codec)
    const rawPath = `raw/${videoId}/original`;
    const metadata = await this.extractMetadata(rawPath);

    await this.db.update('videos', videoId, {
      durationSeconds: metadata.duration,
      originalResolution: metadata.resolution,
      originalCodec: metadata.codec,
      originalSizeBytes: metadata.size,
    });

    // Enqueue transcoding job
    await this.messageQueue.publish('transcode-jobs', {
      videoId,
      rawPath,
      metadata,
      priority: this.calculatePriority(metadata),
    });

    console.log(`Video ${videoId} queued for transcoding.`);
  }

  /**
   * Priority calculation:
   * - Premium creators get high priority
   * - Shorter videos get processed first (quick wins)
   * - Time-sensitive content (live events) gets highest priority
   */
  private calculatePriority(metadata: VideoMetadata): number {
    if (metadata.duration < 60) return 10;       // Short videos: highest
    if (metadata.duration < 600) return 5;       // < 10 min: medium
    return 1;                                     // Long videos: low
  }
}

// ============================================
// STEP 2: TRANSCODING WORKERS
// ============================================

/**
 * Transcoding is the MOST EXPENSIVE operation in the entire system.
 * 
 * A 10-minute 4K video takes ~20 minutes to transcode on a GPU instance.
 * At 500 hours uploaded/minute, we need thousands of workers.
 * 
 * Strategy:
 * - Use spot/preemptible instances (70% cheaper)
 * - GPU instances for hardware-accelerated encoding (NVENC)
 * - Parallel transcoding: split video into chunks, transcode in parallel
 * - DAG-based pipeline: Extract → Transcode → Segment → Package
 */

interface TranscodeJob {
  videoId: string;
  rawPath: string;
  metadata: VideoMetadata;
  priority: number;
}

interface TranscodeProfile {
  resolution: string;
  width: number;
  height: number;
  bitrate: string;       // Video bitrate
  audioBitrate: string;  // Audio bitrate
  codec: string;
  fps: number;
}

const TRANSCODE_PROFILES: TranscodeProfile[] = [
  { resolution: '4K',    width: 3840, height: 2160, bitrate: '15000k', audioBitrate: '192k', codec: 'h264', fps: 30 },
  { resolution: '1080p', width: 1920, height: 1080, bitrate: '5000k',  audioBitrate: '128k', codec: 'h264', fps: 30 },
  { resolution: '720p',  width: 1280, height: 720,  bitrate: '2500k',  audioBitrate: '128k', codec: 'h264', fps: 30 },
  { resolution: '480p',  width: 854,  height: 480,  bitrate: '1000k',  audioBitrate: '96k',  codec: 'h264', fps: 30 },
  { resolution: '360p',  width: 640,  height: 360,  bitrate: '500k',   audioBitrate: '64k',  codec: 'h264', fps: 30 },
];

class TranscodeWorker {
  /**
   * Process a single transcode job.
   * 
   * Creates all resolution variants + HLS/DASH segments.
   */
  async process(job: TranscodeJob): Promise<void> {
    const { videoId, rawPath, metadata } = job;

    try {
      await this.updateStatus(videoId, 'TRANSCODING');

      // Determine which profiles to generate
      // (Don't upscale — if original is 720p, skip 1080p and 4K)
      const profiles = TRANSCODE_PROFILES.filter(
        p => p.height <= metadata.resolution.height
      );

      // Transcode each profile in PARALLEL (each on a different CPU core)
      const transcodeResults = await Promise.all(
        profiles.map(profile => this.transcodeToProfile(videoId, rawPath, profile))
      );

      // Generate HLS manifest (master playlist pointing to each quality)
      const masterPlaylist = this.generateMasterPlaylist(videoId, transcodeResults);
      await this.s3.upload(
        'video-transcoded',
        `${videoId}/master.m3u8`,
        masterPlaylist
      );

      // Generate thumbnail (frame at 25% of duration)
      const thumbnailTime = metadata.duration * 0.25;
      await this.generateThumbnail(videoId, rawPath, thumbnailTime);

      // Update database: video is ready
      await this.db.update('videos', videoId, {
        status: 'READY',
        streamingUrl: `https://stream.example.com/${videoId}/master.m3u8`,
        thumbnailUrl: `https://cdn.example.com/${videoId}/thumbnail.jpg`,
        availableResolutions: profiles.map(p => p.resolution),
        transcodedAt: new Date(),
      });

      console.log(`Video ${videoId} transcoding complete. ${profiles.length} profiles.`);
    } catch (error) {
      await this.updateStatus(videoId, 'TRANSCODE_FAILED');
      // Retry logic: re-enqueue with backoff
      await this.retryWithBackoff(job, error);
    }
  }

  /**
   * Transcode to a single quality profile.
   * Outputs HLS segments (4-second .ts files).
   * 
   * HLS (HTTP Live Streaming):
   *   video.m3u8 (playlist)  → lists all .ts segments
   *   segment_001.ts (4 sec) → plays first
   *   segment_002.ts (4 sec) → plays second
   *   ...
   * 
   * WHY 4-SECOND SEGMENTS?
   * - Short enough for fast quality switching (ABR)
   * - Long enough to avoid excessive HTTP requests
   * - Industry standard (Apple HLS default)
   */
  private async transcodeToProfile(
    videoId: string, rawPath: string, profile: TranscodeProfile
  ): Promise<TranscodeResult> {
    const outputPath = `${videoId}/${profile.resolution}`;

    // FFmpeg command (conceptual)
    const ffmpegCommand = {
      input: rawPath,
      videoCodec: profile.codec,
      videoBitrate: profile.bitrate,
      audioCodec: 'aac',
      audioBitrate: profile.audioBitrate,
      resolution: `${profile.width}x${profile.height}`,
      fps: profile.fps,
      hlsSegmentDuration: 4,
      output: outputPath,
    };

    await this.ffmpeg.execute(ffmpegCommand);

    // Upload all segments to S3
    const segments = await this.uploadSegments(outputPath, 'video-transcoded');

    return {
      resolution: profile.resolution,
      bitrate: profile.bitrate,
      segmentCount: segments.length,
      playlistPath: `${outputPath}/playlist.m3u8`,
    };
  }

  /**
   * Generate master HLS playlist.
   * This is what the video player loads first — it lists all available qualities.
   */
  private generateMasterPlaylist(
    videoId: string, results: TranscodeResult[]
  ): string {
    let playlist = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    for (const result of results) {
      playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(result.bitrate) * 1000},`;
      playlist += `RESOLUTION=${result.resolution}\n`;
      playlist += `${result.resolution}/playlist.m3u8\n\n`;
    }

    return playlist;
  }
}
```

### Storage Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  STORAGE LAYOUT                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  S3 Bucket: video-raw-uploads                           │
│  └── raw/{videoId}/original          (raw upload)       │
│                                                         │
│  S3 Bucket: video-transcoded                            │
│  └── {videoId}/                                         │
│      ├── master.m3u8                 (HLS master)       │
│      ├── thumbnail.jpg              (preview image)     │
│      ├── 1080p/                                         │
│      │   ├── playlist.m3u8          (quality playlist)  │
│      │   ├── segment_001.ts         (4-sec chunk)       │
│      │   ├── segment_002.ts                             │
│      │   └── ...                                        │
│      ├── 720p/                                          │
│      │   ├── playlist.m3u8                              │
│      │   └── ...                                        │
│      ├── 480p/                                          │
│      └── 360p/                                          │
│                                                         │
│  Storage Per Video (10 min, 1080p original):             │
│    Raw:     ~2 GB                                       │
│    1080p:   ~375 MB (5 Mbps × 10 min)                   │
│    720p:    ~187 MB                                      │
│    480p:    ~75 MB                                       │
│    360p:    ~37 MB                                       │
│    Total:   ~674 MB transcoded + 2 GB raw = ~2.7 GB     │
│                                                         │
│  At 500 hours/min:                                      │
│    Raw:     ~6 TB/hour                                  │
│    Total:   ~10 TB/hour = ~240 TB/day = ~87 PB/year     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Scenario B: Adaptive Bitrate Streaming & Recommendation Engine

**Real-Life Scenario:** A viewer in Mumbai starts watching a video on WiFi (1080p), then switches to mobile data on the train (drops to 480p), and we need to recommend what to watch next.

**Technical Problem:** Design ABR streaming and a recommendation engine for 2 billion users.

### TypeScript Implementation

```typescript
/**
 * ADAPTIVE BITRATE STREAMING (ABR)
 * 
 * The player is the smart component. It decides which quality to request.
 * 
 * How ABR works:
 * 1. Player downloads master.m3u8 (lists all available qualities)
 * 2. Player measures download speed of each segment
 * 3. For the NEXT segment, player picks the best quality that won't buffer
 * 4. If bandwidth drops mid-video, player switches to lower quality seamlessly
 * 
 * The server's job: Serve the requested segment from CDN. That's it.
 * The intelligence is 100% client-side.
 * 
 * @timeComplexity O(1) per segment served (CDN cache hit)
 * @spaceComplexity O(R × S) per video where R = resolutions, S = segments
 */

// ============================================
// VIDEO STREAMING SERVICE (Server-Side)
// ============================================

class VideoStreamingService {
  private cdn: CDNService;
  private db: VideoDatabase;
  private analytics: AnalyticsQueue;

  /**
   * Get video playback info.
   * Called once when user clicks "Play".
   */
  async getPlaybackInfo(
    videoId: string, userId: string
  ): Promise<PlaybackInfo> {
    // 1. Get video metadata
    const video = await this.db.getVideo(videoId);
    if (!video || video.status !== 'READY') {
      throw new Error('Video not available');
    }

    // 2. Check user's permissions (paid content, geo-restrictions)
    const access = await this.checkAccess(userId, video);
    if (!access.allowed) {
      throw new Error(`Access denied: ${access.reason}`);
    }

    // 3. Get user's last watch position (for resume)
    const watchProgress = await this.db.getWatchProgress(userId, videoId);

    // 4. Select optimal CDN edge based on user's location
    const cdnUrl = await this.cdn.getOptimalEdge(userId);

    // 5. Generate signed streaming URL (expires in 6 hours)
    const signedUrl = this.signStreamingUrl(
      `${cdnUrl}/${videoId}/master.m3u8`,
      { userId, videoId, expiresIn: 6 * 3600 }
    );

    return {
      streamUrl: signedUrl,
      duration: video.durationSeconds,
      resumePosition: watchProgress?.position || 0,
      availableQualities: video.availableResolutions,
      subtitles: video.subtitleTracks,
      nextVideo: await this.getNextRecommendation(userId, videoId),
    };
  }

  /**
   * Track watch progress.
   * Called every 30 seconds by the player.
   * 
   * This data feeds:
   * 1. Resume playback ("Continue watching")
   * 2. Watch time analytics (creator dashboard)
   * 3. Recommendation engine (what users watch = training data)
   */
  async trackProgress(
    userId: string, videoId: string, position: number, quality: string
  ): Promise<void> {
    // Fire-and-forget to analytics queue (don't block the player)
    this.analytics.enqueue({
      type: 'WATCH_PROGRESS',
      userId,
      videoId,
      position,
      quality,
      timestamp: Date.now(),
    });

    // Update resume position (debounced, every 30 seconds)
    await this.db.upsertWatchProgress(userId, videoId, {
      position,
      quality,
      updatedAt: new Date(),
    });
  }
}

// ============================================
// RECOMMENDATION ENGINE
// ============================================

/**
 * YouTube's recommendation is arguably its most valuable feature.
 * "The algorithm" drives 70% of all watch time.
 * 
 * Architecture:
 *   1. Candidate Generation — Narrow 100M+ videos to ~1,000 candidates
 *   2. Ranking — Score and rank the 1,000 candidates for THIS user
 *   3. Re-ranking — Apply business rules (diversity, freshness, safety)
 * 
 * This is a simplified version of Google's Deep Neural Network for
 * YouTube Recommendations (2016 paper).
 */

class RecommendationEngine {
  /**
   * Generate recommendations for a user's home page.
   * 
   * @param userId - The user requesting recommendations
   * @param count - Number of videos to recommend (default 50)
   * @returns Ranked list of recommended videos
   */
  async getRecommendations(
    userId: string, count: number = 50
  ): Promise<RecommendedVideo[]> {
    // STAGE 1: Candidate Generation (~100M → ~1,000 videos)
    // Multiple candidate sources, merged
    const candidates = await this.generateCandidates(userId);

    // STAGE 2: Ranking (score each candidate for this user)
    const scored = await this.rankCandidates(userId, candidates);

    // STAGE 3: Re-ranking (business rules)
    const reranked = this.applyBusinessRules(scored);

    return reranked.slice(0, count);
  }

  /**
   * Candidate Generation — The "funnel" stage.
   * 
   * Sources:
   * 1. Collaborative Filtering: "Users like you watched X"
   * 2. Content-Based: "Similar to videos you've watched"
   * 3. Subscriptions: "New from channels you follow"
   * 4. Trending: "Popular in your region"
   * 5. Explore: "Random high-quality content for diversity"
   */
  private async generateCandidates(userId: string): Promise<VideoCandidate[]> {
    const [
      collaborative,
      contentBased,
      subscriptions,
      trending,
      explore,
    ] = await Promise.all([
      this.collaborativeFilter(userId, 300),    // 300 candidates
      this.contentBasedFilter(userId, 300),     // 300 candidates
      this.subscriptionFeed(userId, 200),       // 200 candidates
      this.trendingInRegion(userId, 100),       // 100 candidates
      this.exploreRandom(userId, 100),          // 100 candidates
    ]);

    // Merge and deduplicate
    const all = [...collaborative, ...contentBased, ...subscriptions,
                 ...trending, ...explore];
    return this.dedup(all);
  }

  /**
   * Ranking — Score each candidate video for this specific user.
   * 
   * Features used for scoring:
   * - User features: watch history, search history, demographics, time of day
   * - Video features: title, tags, category, creator, duration, freshness
   * - Interaction features: CTR (click-through rate), avg watch time, like ratio
   * - Context features: device type, time of day, day of week
   * 
   * In production: This is a deep neural network (DNN).
   * Simplified here as a weighted scoring function.
   */
  private async rankCandidates(
    userId: string, candidates: VideoCandidate[]
  ): Promise<ScoredVideo[]> {
    const userProfile = await this.getUserProfile(userId);

    return candidates.map(video => {
      // Predicted watch time (the key metric YouTube optimizes for)
      const predictedWatchTime = this.predictWatchTime(userProfile, video);
      
      // Click-through rate prediction
      const predictedCTR = this.predictCTR(userProfile, video);
      
      // Final score = predicted engagement
      const score = (
        0.6 * predictedWatchTime +    // Watch time is king
        0.2 * predictedCTR +          // But clicks matter too
        0.1 * video.freshness +       // Newer content gets a boost
        0.1 * video.qualityScore      // High-quality content preferred
      );

      return { ...video, score };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Re-ranking — Apply business rules after ML scoring.
   * 
   * Rules:
   * 1. Diversity: Don't show 10 videos from the same creator
   * 2. Freshness: Mixer fresh and older content
   * 3. Safety: Demote borderline content
   * 4. Ads: Insert ad slots at specific positions
   */
  private applyBusinessRules(scored: ScoredVideo[]): ScoredVideo[] {
    let result: ScoredVideo[] = [];
    const creatorCount = new Map<string, number>();

    for (const video of scored) {
      // Rule 1: Max 3 videos per creator in top 50
      const count = creatorCount.get(video.creatorId) || 0;
      if (count >= 3) continue;
      creatorCount.set(video.creatorId, count + 1);

      // Rule 2: Demote previously watched (but allow re-watch suggestions)
      if (video.previouslyWatched && video.watchPercentage > 90) {
        video.score *= 0.3; // Significantly demote fully watched videos
      }

      result.push(video);
    }

    return result;
  }
}

// ============================================
// BACK-OF-ENVELOPE ESTIMATION
// ============================================

/**
 * Scale:
 *   MAU: 2 billion
 *   DAU: 800 million
 *   Videos uploaded: 500 hours/minute = 30,000 hours/hour
 *   Videos watched: 1 billion hours/day
 * 
 * Storage:
 *   Raw uploads: 500 hours/min × 60 min × 2 GB/hour = ~60 TB/hour
 *   Transcoded: ~3x raw (multiple resolutions) = ~180 TB/hour
 *   Daily: ~4.3 PB/day (!!)
 *   Yearly: ~1.6 EB/year (exabytes!)
 *   Total storage (15 years): Estimated 100+ EB
 * 
 * Streaming Bandwidth:
 *   1B hours/day ÷ 24 hours = 41.7M concurrent viewers (avg)
 *   Peak (3x): ~125M concurrent viewers
 *   At avg 3 Mbps: 125M × 3 Mbps = 375 Tbps peak bandwidth (!!)
 *   CDN handles 95%+, origin serves < 5%
 * 
 * Transcoding Compute:
 *   500 hours/min of video to transcode
 *   1 GPU instance transcodes ~2x real-time
 *   500 hours/min ÷ 2 = 250 GPU instances (minimum)
 *   With 5 resolutions: 250 × 5 = 1,250 GPU instances
 *   With overhead/failures: ~2,000 GPU instances
 */
```

---

## 6. Real World Applications 🌍

### 1. 📺 YouTube (The Giant)

**Architecture:**
- Custom-built Vitess (MySQL sharding layer) for metadata.
- Bigtable for analytics and recommendation data.
- Borg (predecessor to Kubernetes) for container orchestration of transcoding workers.
- Proprietary VP9/AV1 codecs for 20-30% better compression than H.264.
- **Open Connect-style CDN:** Google's private network (B4) connects data centers; Google Global Cache (GGC) boxes sit inside ISPs.

**Scale:** 500+ hours uploaded per minute, 1 billion hours watched daily, available in 100+ countries.

### 2. 🎬 Netflix Open Connect

**Architecture:**
- Custom CDN called **Open Connect** — hardware boxes placed inside ISP data centers.
- Content is pre-positioned overnight during off-peak hours ("push CDN").
- During peak, **95%+ of traffic** served from within the ISP's own network.
- Encoding uses the **"per-title encoding"** approach — each video gets custom bitrate ladders based on content complexity (animation needs fewer bits than action scenes).
- Uses AVIF for thumbnails (30% smaller than JPEG).

**Scale:** 15% of global downstream internet traffic, 230M+ subscribers, 100K+ titles.

### 3. 🎮 Twitch (Live Streaming Variant)

**Architecture:**
- Live streaming adds the constraint of **real-time transcoding** (< 2 second delay).
- Ingest servers receive RTMP streams from streamers.
- Real-time transcoding at the edge (not offline like YouTube).
- Uses HLS with 2-second segments (shorter than YouTube's 4-second for lower latency).
- Chat system handles 100K+ messages/second per popular stream.

### 4. 📱 TikTok (Short-Form)

**Architecture:**
- Short videos (15-60 seconds) change the economics: transcoding is fast, storage is small.
- Focus is on **recommendation** over search (users rarely search on TikTok).
- Client-side caching: Pre-loads next 3-5 videos while you watch the current one.
- ByteDance's recommendation engine processes 1B+ recommendation requests/day.

---

## 7. Complexity Analysis 🧠

### System Comparison

| Component | YouTube | Netflix | Twitch |
| :--- | :--- | :--- | :--- |
| **Content Type** | UGC (user generated) | Licensed/Original | Live streams |
| **Transcoding** | Offline (minutes-hours) | Offline (hours-days) | Real-time (<2s) |
| **CDN** | Google GGC | Open Connect (custom) | Standard CDN (Akamai) |
| **Codec** | VP9 / AV1 | H.264 / H.265 / AV1 | H.264 |
| **Recommendations** | Deep NN (watch time) | Matrix factorization | Follower-based |
| **Monetization** | Ads + Premium | Subscription | Ads + Subscriptions + Bits |

### Key Trade-offs

| Decision | Option A | Option B | YouTube's Choice |
| :--- | :--- | :--- | :--- |
| **Codec** | H.264 (universal support) | AV1 (30% smaller, CPU-heavy) | Both (AV1 for mobile, H.264 fallback) |
| **Segment length** | 2 seconds (lower latency) | 10 seconds (fewer requests) | 4 seconds (balanced) |
| **CDN model** | Pull CDN (cache on demand) | Push CDN (pre-position) | Hybrid (push popular, pull long-tail) |
| **Transcoding** | On-upload (wait) | On-demand (lazy) | On-upload + priority queue |
| **Thumbnails** | Static (one image) | Animated (3-second preview) | Both (animated on hover) |

### Interview Tips 💡

1. **Start with the upload pipeline:** "The write path is the most complex — presigned S3 URLs for direct upload, then an async transcoding pipeline with priority queues."
2. **Explain ABR clearly:** "The video is split into 4-second segments at multiple bitrates. The player measures bandwidth and picks the appropriate quality for each segment. The server just serves files — the player is the smart component."
3. **Know transcoding economics:** "Transcoding is CPU/GPU-intensive and the biggest cost. Netflix uses per-title encoding (custom bitrate ladders). YouTube uses spot instances. Both use hardware-accelerated encoding (NVENC/AMD VCE)."
4. **CDN is everything for streaming:** "95%+ of streaming traffic is served from CDN edge servers. Netflix goes further — they place Open Connect boxes inside ISP data centers. YouTube uses Google Global Cache."
5. **Recommendation drives watch time:** "YouTube's recommendation engine drives 70% of all views. It uses a two-stage approach: candidate generation (narrow 100M to 1,000) then ranking (score for this specific user). The key metric is predicted watch time, not clicks."
6. **Handle the long-tail problem:** "Popular videos (head) are cached everywhere. But 80% of YouTube's catalog is long-tail content watched rarely. For these, use pull-CDN (cache on first request) rather than pre-positioning."
7. **Cost optimization is critical:** "Video storage and bandwidth are the biggest costs. Use cheaper storage tiers (S3 Glacier) for old videos. Delete raw uploads after transcoding. Compress thumbnails with AVIF. These optimizations save millions at scale."
