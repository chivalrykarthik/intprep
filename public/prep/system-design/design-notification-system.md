# Design: Notification System 🔔

## 1. The "Town Crier" Analogy

In medieval times, a **town crier** was the only way to broadcast news. He stood in the town square and shouted announcements.

**Single-Channel (The Old Way):**
- The crier shouts. You only hear if you're in the square.
- Deaf? Missed it. Traveling? Missed it. Sleeping? Missed it.

**Multi-Channel Notification System (The Modern Way):**
- **Push notification** sent to your phone (even when locked).
- **Email** arrives in your inbox (read it later).
- **SMS** for urgent matters (payment confirmation).
- **In-app** badge appears when you open the app.
- **WebSocket** for real-time updates (live chat).

**The Real Challenge:** How do you deliver **billions of personalized notifications** across **5+ channels**, ensure **at-least-once delivery**, avoid **spamming users**, respect **user preferences**, and do it all within **seconds**?

---

## 2. The Core Concept

A notification system at scale is one of the top interview questions at FAANG because it tests:
- **Message queue architecture** (async processing)
- **User preference management** (opt-in/opt-out, quiet hours)
- **Template systems** (localization, personalization)
- **Delivery guarantees** (at-least-once, deduplication)
- **Rate limiting** (anti-spam)
- **Analytics** (delivery rates, open rates, CTR)

**Functional Requirements:**
1. Send notifications via: Push (iOS/Android), Email, SMS, In-App, WebSocket
2. Support notification templates with personalization
3. Users can configure notification preferences per channel and per type
4. Batch notifications (digest emails)
5. Notification history (inbox)

**Non-Functional Requirements:**
1. Delivery latency: < 5 seconds for real-time, < 1 minute for batch
2. Scale: 10 billion notifications/day
3. At-least-once delivery (no silent drops)
4. Soft real-time (notifications should feel instant)

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                 NOTIFICATION SYSTEM ARCHITECTURE                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Service (Order, Payment, Social)                              │
│       │                                                         │
│       ▼                                                         │
│   ┌────────────────────┐                                        │
│   │  Notification API  │                                        │
│   │   (Entry Point)    │                                        │
│   └────────┬───────────┘                                        │
│            │                                                    │
│            ▼                                                    │
│   ┌────────────────────┐                                        │
│   │  Message Queue     │ (Kafka / SQS)                          │
│   │  (Buffer + Dedup)  │                                        │
│   └────────┬───────────┘                                        │
│            │                                                    │
│            ▼                                                    │
│   ┌────────────────────┐    ┌──────────────────┐                │
│   │  Notification      │───▶│  User Preference │                │
│   │  Worker Service    │    │  Service (check   │                │
│   │  (Process + Route) │    │  opt-in, quiet    │                │
│   └──┬──┬──┬──┬──┬─────┘    │  hours, frequency)│                │
│      │  │  │  │  │          └──────────────────┘                │
│      ▼  ▼  ▼  ▼  ▼                                              │
│   ┌────┐┌────┐┌────┐┌────┐┌────────┐                            │
│   │Push││Email││SMS ││In- ││WebSocket│                           │
│   │APNs││SMTP ││Twi ││App ││  Live  │                           │
│   │FCM ││Send ││lio ││DB  ││  Conn  │                           │
│   └────┘└────┘└────┘└────┘└────────┘                            │
│                                                                 │
│   10B notifications/day across 5 channels                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Core Notification Pipeline

**Real-Life Scenario:** A user places an order on your e-commerce platform. They should receive a push notification immediately, a confirmation email within 30 seconds, and an SMS with tracking number when shipped.

**Technical Problem:** Design the notification pipeline from trigger to delivery.

### TypeScript Implementation

```typescript
/**
 * NOTIFICATION SYSTEM — CORE ARCHITECTURE
 * 
 * Pipeline: Trigger → API → Queue → Worker → Preference Check → Route → Deliver
 * 
 * Design Principles:
 * 1. Async processing (queue-based, not synchronous)
 * 2. Channel-agnostic core (plugins for each delivery channel)
 * 3. User preferences respected at every step
 * 4. At-least-once delivery with deduplication
 */

// ============================================
// DATA MODELS
// ============================================

interface NotificationRequest {
  id: string;                             // Idempotency key
  userId: string;                         // Who to notify
  type: NotificationType;                 // 'order_placed' | 'payment_received' | etc.
  channels: NotificationChannel[];        // ['push', 'email', 'sms']
  priority: 'critical' | 'high' | 'low'; // Determines queue priority
  data: Record<string, any>;              // Template variables
  scheduledAt?: Date;                     // Future delivery
  groupKey?: string;                      // For batching/digest
}

type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app' | 'websocket';

type NotificationType = 
  | 'order_placed' | 'order_shipped' | 'order_delivered'
  | 'payment_received' | 'payment_failed'
  | 'friend_request' | 'new_follower' | 'mention'
  | 'security_alert' | 'password_changed'
  | 'promotion' | 'weekly_digest';

interface NotificationTemplate {
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;         // Email subject
  title: string;            // Push title
  body: string;             // Push/email body (supports {{variables}})
  cta?: string;             // Call-to-action URL
  locale: string;           // 'en', 'es', 'ja', etc.
}

// ============================================
// NOTIFICATION API (Entry Point)
// ============================================

/**
 * The Notification API receives requests from internal services
 * and enqueues them for async processing.
 * 
 * @timeComplexity O(1) per notification (just enqueue)
 * @spaceComplexity O(1) per request
 */
class NotificationAPI {
  private queue: MessageQueue;
  private deduplicator: DeduplicationService;

  async send(request: NotificationRequest): Promise<{ status: string; id: string }> {
    // 1. Validate request
    if (!request.userId || !request.type) {
      throw new Error('userId and type are required');
    }

    // 2. Deduplication check (idempotency)
    if (await this.deduplicator.isDuplicate(request.id)) {
      return { status: 'duplicate', id: request.id };
    }

    // 3. Mark as seen (for dedup window of 24 hours)
    await this.deduplicator.markSeen(request.id, 86400);

    // 4. Handle scheduling
    if (request.scheduledAt && request.scheduledAt > new Date()) {
      await this.queue.publishDelayed('notifications', request, request.scheduledAt);
      return { status: 'scheduled', id: request.id };
    }

    // 5. Enqueue for immediate processing
    const queueName = `notifications.${request.priority}`;
    await this.queue.publish(queueName, request);

    return { status: 'queued', id: request.id };
  }

  /**
   * Bulk send — for marketing campaigns, weekly digests, etc.
   * 
   * Don't fan out synchronously. Publish one "campaign" event,
   * then a separate worker fans out to individual users.
   */
  async sendBulk(
    userIds: string[], type: NotificationType, data: Record<string, any>
  ): Promise<{ status: string; count: number }> {
    // Create a campaign, not individual notifications
    const campaignId = generateId();
    
    await this.queue.publish('campaigns', {
      campaignId,
      userIds,
      type,
      data,
    });

    return { status: 'campaign_queued', count: userIds.length };
  }
}

// ============================================
// NOTIFICATION WORKER (Core Processing)
// ============================================

class NotificationWorker {
  private preferenceService: UserPreferenceService;
  private templateService: TemplateService;
  private rateLimiter: NotificationRateLimiter;
  private channelProviders: Map<NotificationChannel, ChannelProvider>;
  private notificationDb: NotificationDatabase;

  /**
   * Process a notification from the queue.
   */
  async processNotification(request: NotificationRequest): Promise<void> {
    const { userId, type, channels, data, priority } = request;

    // 1. Get user preferences
    const preferences = await this.preferenceService.getUserPreferences(userId);

    // 2. Filter channels based on user preferences
    const allowedChannels = channels.filter(channel => {
      // Check if user opted in to this channel for this notification type
      if (!preferences.isChannelEnabled(channel, type)) {
        console.log(`User ${userId} opted out of ${channel} for ${type}`);
        return false;
      }

      // Check quiet hours (don't send push/SMS during sleep)
      if (['push', 'sms'].includes(channel) && preferences.isQuietHours()) {
        if (priority !== 'critical') {
          console.log(`Quiet hours: deferring ${channel} for ${userId}`);
          // Re-queue for after quiet hours
          this.requeueAfterQuietHours(request, channel, preferences);
          return false;
        }
      }

      return true;
    });

    if (allowedChannels.length === 0) {
      console.log(`All channels filtered for ${userId}:${type}. Saving as in-app only.`);
      await this.saveInAppNotification(userId, type, data);
      return;
    }

    // 3. Rate limit check
    for (const channel of allowedChannels) {
      const allowed = await this.rateLimiter.check(userId, channel, type);
      if (!allowed) {
        console.log(`Rate limited: ${userId} on ${channel} for ${type}`);
        continue;
      }

      // 4. Render template
      const template = await this.templateService.render(type, channel, {
        ...data,
        userName: preferences.displayName,
        locale: preferences.locale,
      });

      // 5. Deliver via channel provider
      try {
        const provider = this.channelProviders.get(channel)!;
        await provider.send(userId, template);

        // 6. Record delivery
        await this.notificationDb.recordDelivery({
          notificationId: request.id,
          userId,
          channel,
          type,
          status: 'delivered',
          deliveredAt: new Date(),
        });
      } catch (error) {
        // 7. Handle failure — retry with backoff
        await this.handleDeliveryFailure(request, channel, error as Error);
      }
    }
  }

  private async handleDeliveryFailure(
    request: NotificationRequest, channel: NotificationChannel, error: Error
  ): Promise<void> {
    const retryCount = request.retryCount || 0;

    if (retryCount < 3) {
      // Exponential backoff: 1s, 4s, 16s
      const delay = Math.pow(4, retryCount) * 1000;
      await this.queue.publishDelayed('notifications.retry', {
        ...request,
        channels: [channel],
        retryCount: retryCount + 1,
      }, new Date(Date.now() + delay));
    } else {
      // Max retries exceeded — log and alert
      console.error(`Failed to deliver ${request.id} via ${channel} after 3 retries`, error);
      await this.notificationDb.recordDelivery({
        notificationId: request.id,
        userId: request.userId,
        channel,
        type: request.type,
        status: 'failed',
        error: error.message,
      });
    }
  }
}
```

---

## 5. Scenario B: Channel Providers & User Preferences

**Real-Life Scenario:** You need to deliver notifications across 5 different channels, each with its own SDK, rate limits, and failure modes.

**Technical Problem:** Design pluggable channel providers and a preference system.

### TypeScript Implementation

```typescript
/**
 * CHANNEL PROVIDERS
 * 
 * Each channel has a provider that handles the actual delivery.
 * Channel-specific logic is encapsulated in the provider.
 */

interface ChannelProvider {
  send(userId: string, template: RenderedTemplate): Promise<void>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

// ============================================
// PUSH NOTIFICATION PROVIDER (APNs + FCM)
// ============================================

class PushNotificationProvider implements ChannelProvider {
  private apns: APNsClient;  // Apple Push Notification Service
  private fcm: FCMClient;    // Firebase Cloud Messaging

  async send(userId: string, template: RenderedTemplate): Promise<void> {
    // Get user's device tokens (they might have multiple devices)
    const devices = await this.getDeviceTokens(userId);

    for (const device of devices) {
      if (device.platform === 'ios') {
        await this.apns.send({
          token: device.token,
          alert: { title: template.title, body: template.body },
          badge: await this.getUnreadCount(userId),
          sound: 'default',
          data: { url: template.cta, notificationId: template.id },
        });
      } else if (device.platform === 'android') {
        await this.fcm.send({
          token: device.token,
          notification: { title: template.title, body: template.body },
          data: { url: template.cta, notificationId: template.id },
          android: {
            priority: 'high',
            ttl: 3600 * 1000, // 1 hour
          },
        });
      }
    }
  }
}

// ============================================
// EMAIL PROVIDER (SendGrid / SES)
// ============================================

class EmailProvider implements ChannelProvider {
  private emailClient: SendGridClient;

  async send(userId: string, template: RenderedTemplate): Promise<void> {
    const userEmail = await this.getUserEmail(userId);

    await this.emailClient.send({
      to: userEmail,
      from: 'noreply@myapp.com',
      subject: template.subject!,
      html: template.htmlBody!,
      text: template.textBody,
      // Tracking
      customArgs: { notificationId: template.id, userId },
      // Anti-spam
      categories: [template.type],
      unsubscribeGroup: this.getUnsubscribeGroup(template.type),
    });
  }
}

// ============================================
// SMS PROVIDER (Twilio)
// ============================================

class SMSProvider implements ChannelProvider {
  private twilio: TwilioClient;

  async send(userId: string, template: RenderedTemplate): Promise<void> {
    const phone = await this.getUserPhone(userId);
    if (!phone) {
      throw new Error(`No phone number for user ${userId}`);
    }

    await this.twilio.messages.create({
      to: phone,
      from: '+1234567890',    // Your Twilio number
      body: template.smsBody!, // 160 char limit for SMS
    });
  }
}

// ============================================
// IN-APP NOTIFICATION (Database + WebSocket)
// ============================================

class InAppProvider implements ChannelProvider {
  private db: NotificationDatabase;
  private wsManager: WebSocketManager;

  async send(userId: string, template: RenderedTemplate): Promise<void> {
    // 1. Store in database (notification inbox)
    const notification = await this.db.insertNotification({
      userId,
      type: template.type,
      title: template.title,
      body: template.body,
      cta: template.cta,
      read: false,
      createdAt: new Date(),
    });

    // 2. Send real-time via WebSocket (if user is online)
    const connection = this.wsManager.getConnection(userId);
    if (connection) {
      connection.send(JSON.stringify({
        type: 'notification',
        payload: notification,
      }));
    }

    // 3. Update badge count
    const unreadCount = await this.db.getUnreadCount(userId);
    if (connection) {
      connection.send(JSON.stringify({
        type: 'badge_update',
        payload: { count: unreadCount },
      }));
    }
  }
}

// ============================================
// USER PREFERENCES
// ============================================

/**
 * User Notification Preferences
 * 
 * Stored in Redis for fast access (checked on every notification).
 * Source of truth in PostgreSQL.
 */
interface UserNotificationPreferences {
  userId: string;
  displayName: string;
  locale: string;
  timezone: string;

  // Global channel toggles
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };

  // Per-type preferences (overrides global)
  typePreferences: Record<NotificationType, {
    enabled: boolean;
    channels: NotificationChannel[];
    frequency: 'instant' | 'daily_digest' | 'weekly_digest';
  }>;

  // Quiet hours
  quietHours: {
    enabled: boolean;
    start: string;  // "22:00"
    end: string;    // "07:00"
    timezone: string;
  };

  // Rate limits (user-facing)
  maxNotificationsPerDay: number;
}

class UserPreferenceService {
  private cache: RedisClient;
  private db: PostgresClient;

  async getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    // Try cache first
    const cached = await this.cache.get(`prefs:${userId}`);
    if (cached) return JSON.parse(cached);

    // Fallback to database
    const prefs = await this.db.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1', [userId]
    );

    // Cache for 1 hour
    await this.cache.set(`prefs:${userId}`, JSON.stringify(prefs), 3600);
    return prefs;
  }
}

// ============================================
// NOTIFICATION RATE LIMITER
// ============================================

/**
 * Prevents notification fatigue / spam.
 * 
 * Rules:
 * - Max 5 push notifications per hour per user
 * - Max 3 emails per day per user
 * - Max 1 SMS per day per user (unless critical)
 * - Max 1 notification per type per 5 minutes (dedup)
 */
class NotificationRateLimiter {
  private redis: RedisClient;

  private limits: Record<NotificationChannel, { count: number; windowSec: number }> = {
    push: { count: 5, windowSec: 3600 },         // 5 per hour
    email: { count: 3, windowSec: 86400 },        // 3 per day
    sms: { count: 1, windowSec: 86400 },          // 1 per day
    in_app: { count: 50, windowSec: 3600 },       // 50 per hour
    websocket: { count: 100, windowSec: 3600 },   // 100 per hour
  };

  async check(
    userId: string, channel: NotificationChannel, type: NotificationType
  ): Promise<boolean> {
    const limit = this.limits[channel];
    const key = `ratelimit:notif:${userId}:${channel}`;

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, limit.windowSec);
    }

    if (current > limit.count) {
      return false; // Rate limited
    }

    // Per-type dedup: same notification type within 5 minutes
    const dedupKey = `notif:dedup:${userId}:${type}`;
    const alreadySent = await this.redis.get(dedupKey);
    if (alreadySent) {
      return false; // Same type sent recently
    }
    await this.redis.set(dedupKey, '1', 300); // 5 min window

    return true;
  }
}
```

---

## 6. Real World Applications 🌍

### 1. 📱 Apple Push Notification Service (APNs)

**Architecture:**
- Device registers with Apple → receives a unique device token.
- Your server sends notification payload + device token to APNs.
- APNs delivers to the device (even when app is killed).
- Feedback service: APNs tells you about invalid tokens (uninstalled apps).
- HTTP/2 persistent connections for high throughput.

**Scale:** Apple delivers 7.4 trillion push notifications per year.

### 2. 📧 Mailchimp / SendGrid (Email at Scale)

**Challenges:**
- Deliverability (avoiding spam folders) — SPF, DKIM, DMARC.
- IP warming: New IPs must gradually increase volume.
- Bounce handling: Hard bounces (invalid email) vs soft bounces (mailbox full).
- Unsubscribe compliance (CAN-SPAM, GDPR).
- Template rendering engine (Handlebars/Liquid).

### 3. 💬 Slack (Multi-Channel Notifications)

**Architecture:**
- Push, email, desktop, in-app — all configurable per channel and per workspace.
- Smart notification batching: Groups messages from the same channel.
- Presence-aware: Only push-notifies when user is "away" on desktop.
- Do Not Disturb: Respects configured silent hours.

### 4. 🛒 Amazon (Transactional + Marketing)

**Types of notifications:**
- **Transactional:** Order confirmations, shipping updates (critical, immediate).
- **Marketing:** Deals, recommendations (batched, opt-in only).
- **Operational:** Delivery driver GPS updates (real-time WebSocket).
- Uses SNS (Simple Notification Service) as the internal fanout mechanism.

---

## 7. Complexity Analysis 🧠

### Back-of-Envelope Estimation

```
Users: 500M registered, 100M DAU

Notifications/Day:
  - Transactional: 100M users × 5 events = 500M
  - Social: 100M users × 10 interactions = 1B
  - Marketing: 50M opt-in × 1 campaign = 50M
  - Total: ~1.5B notifications/day

QPS:
  - Average: 1.5B / 86400 ≈ 17,000 notif/sec
  - Peak (3x): 51,000 notif/sec

Storage (Notification History):
  - Each notification: ~500 bytes
  - 1.5B × 500 bytes = 750 GB/day
  - 30-day retention: 22.5 TB

Channel Provider Costs (approximate):
  - Push (APNs/FCM): Free
  - Email (SendGrid): $0.0006/email → $300K/month for 500M
  - SMS (Twilio): $0.0075/SMS → very expensive, use sparingly
```

### Delivery Guarantee Strategy

| Strategy | Description | Trade-off |
| :--- | :--- | :--- |
| **At-Most-Once** | Fire and forget | Fast, but may lose notifications |
| **At-Least-Once** | Retry on failure | May duplicate (use idempotency key) ✓ |
| **Exactly-Once** | Dedup + at-least-once | Complex, higher latency |

**Recommendation:** At-least-once with deduplication (idempotency key per notification).

### Interview Tips 💡

1. **Start with channels:** "The system needs to support push, email, SMS, in-app, and WebSocket."
2. **Emphasize async processing:** "Notifications are fire-and-forget from the caller's perspective. Everything goes through a message queue."
3. **User preferences are critical:** "Users must be able to opt-out per channel and per notification type. GDPR compliance requires this."
4. **Mention rate limiting:** "We must prevent notification fatigue — max 5 push per hour, 3 emails per day."
5. **Discuss reliability:** "At-least-once delivery with idempotency keys for deduplication."
6. **Template system:** "Notifications are rendered from templates with localization support. Same event, different language."
