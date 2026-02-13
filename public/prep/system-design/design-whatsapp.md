# Design WhatsApp (Chat App) 💬

## 1. The "Post Office" Analogy

You write a letter (Message) to a friend.
1.  **Drop off:** You put it in the mailbox (Server).
2.  **Delivery:** The mailman delivers it to your friend's house.
3.  **Acknowledgement:** You get a receipt that it was delivered.

**The Complexity of WhatsApp:**
*   **Real-time:** Delivery must be milliseconds, not days.
*   **Offline:** What if the friend isn't home? (Store and Forward).
*   **Security:** Even the mailman (Server) cannot read the letter (End-to-End Encryption).
*   **Scale:** 2 Billion users, 100 Billion messages per day.
*   **Multi-device:** Message must appear on phone AND linked desktop.

---

## 2. Core Constraints & Requirements

**Functional Requirements:**
1.  1-on-1 Chat and Group Chat (up to 1024 members).
2.  Sent ✓ / Delivered ✓✓ / Read (Blue ✓✓) receipts.
3.  Last Seen / Online Status.
4.  Media sharing (Images, Video, Documents).
5.  Voice and Video calling.
6.  Message history with search.

**Non-Functional Requirements:**
1.  **Massive Concurrency:** 2 Billion users, 500M DAU.
2.  **Low Latency:** Real-time delivery (< 200ms when online).
3.  **Privacy:** E2E Encryption (Signal Protocol). Server cannot read messages.
4.  **Storage:** Messages stored on device, ephemeral on server (mostly).
5.  **Reliability:** No message should be lost. At-least-once delivery.

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                   WHATSAPP ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Alice (Phone)                    Bob (Phone)                  │
│   ┌──────────┐                     ┌──────────┐                 │
│   │ E2E      │                     │ E2E      │                 │
│   │ Encrypt  │                     │ Decrypt  │                 │
│   └────┬─────┘                     └────▲─────┘                 │
│        │ WebSocket                      │ WebSocket             │
│        │                                │                       │
│   ┌────▼──────────────────────────┐     │                       │
│   │     Chat Gateway A            │     │                       │
│   │  (2M connections / server)    │     │                       │
│   └────┬──────────────────────────┘     │                       │
│        │                                │                       │
│   ┌────▼───────────────────────────────┐│                       │
│   │       Session / Router Service     ││                       │
│   │  "Which gateway is Bob on?"        ││                       │
│   │  Redis: user:bob → gateway_B       ││                       │
│   └────┬─────────────────┬─────────────┘│                       │
│        │                 │              │                       │
│        │            ┌────▼─────────┐    │                       │
│        │            │ Chat Gateway │────┘                       │
│        │            │ B            │                            │
│        │            └──────────────┘                            │
│        │                                                        │
│   ┌────▼────────────┐                                           │
│   │ Temp Message DB │  ← If Bob is OFFLINE                      │
│   │ (Cassandra /    │  ← Messages stored until Bob reconnects   │
│   │  HBase)         │  ← Deleted after delivery ACK             │
│   └─────────────────┘                                           │
│                                                                 │
│   Key: Server stores ONLY encrypted blobs.                      │
│        It has NO IDEA what the message says.                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Connection Protocol: WebSocket vs MQTT vs XMPP

**Why not HTTP (REST)?**
*   HTTP is client-initiated. Server cannot "Push" a message to Bob without Polling (inefficient) or Long Polling.

**The Solution: Persistent Connections**
1.  **WebSocket:** Full duplex TCP connection. Low overhead after handshake.
2.  **MQTT (Message Queuing Telemetry Transport):** Lightweight, originally for IoT. Great for unstable mobile networks (battery efficient). QoS levels built-in.
3.  **XMPP (Extensible Messaging and Presence Protocol):** XML-based. Used by original WhatsApp, but heavily customized to be binary (compact) because XML is bloated.

**Connection Handler:**
*   Servers maintain millions of open TCP connections.
*   **Erlang/Elixir:** WhatsApp allows ~2 million connections per server using Erlang (BEAM VM) lightweight processes.
*   **Why Erlang?** Each connection is a lightweight process (2KB memory). The BEAM VM can handle millions of concurrent processes with preemptive scheduling.

---

## 5. Scenario A: Message Delivery Flow (Store and Forward)

**Real-Life Scenario:** Alice sends a message to Bob. Bob might be online or offline.

**Technical Problem:** Implement reliable message delivery with acknowledgement tracking.

### TypeScript Implementation

```typescript
/**
 * WHATSAPP MESSAGE DELIVERY — Store and Forward
 * 
 * Flow:
 * 1. Alice sends encrypted message
 * 2. Server ACKs to Alice (✓ Sent)
 * 3. If Bob online: Push immediately via WebSocket
 * 4. If Bob offline: Store in temp DB, push when Bob reconnects
 * 5. Bob ACKs receipt (✓✓ Delivered)
 * 6. Bob opens chat → ACK Read (Blue ✓✓)
 * 
 * @timeComplexity O(1) per message (hash lookup for routing)
 * @spaceComplexity O(M) where M = messages pending for offline users
 */

type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

interface EncryptedMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  encryptedPayload: Buffer;   // E2E encrypted — server can't read
  timestamp: number;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  mediaUrl?: string;           // For media: pre-uploaded URL
}

class ChatServer {
  // Map UserID → WebSocket Connection
  private activeConnections: Map<string, WebSocket> = new Map();
  
  // Map UserID → Gateway Server ID (for multi-server routing)
  private userGateway: RedisClient; // "user:bob" → "gateway-server-5"
  
  // Temporary message store (for offline users)
  private tempStore: CassandraClient;

  /**
   * Handle incoming message from Alice.
   */
  async handleMessage(msg: EncryptedMessage): Promise<void> {
    const { fromUserId, toUserId } = msg;
    
    // 1. Persist to temp store (safety net — survives server crashes)
    await this.tempStore.insert('pending_messages', {
      message_id: msg.id,
      to_user_id: toUserId,
      from_user_id: fromUserId,
      payload: msg.encryptedPayload,
      timestamp: msg.timestamp,
      type: msg.type,
      media_url: msg.mediaUrl,
    });
    
    // 2. ACK to Alice — "Server received your message" (✓)
    this.sendAck(fromUserId, msg.id, 'SENT');
    
    // 3. Try to deliver to Bob
    const bobGateway = await this.userGateway.get(`user:${toUserId}`);
    
    if (bobGateway) {
      if (bobGateway === this.serverId) {
        // Bob is on THIS server
        const bobSocket = this.activeConnections.get(toUserId);
        if (bobSocket && bobSocket.readyState === WebSocket.OPEN) {
          bobSocket.send(JSON.stringify(msg));
          return; // Bob's client will send DELIVERED ACK
        }
      } else {
        // Bob is on ANOTHER gateway server — forward via internal messaging
        await this.forwardToGateway(bobGateway, msg);
        return;
      }
    }
    
    // Bob is offline — message stays in temp store
    // Will be delivered when Bob reconnects (see handleUserConnect)
    console.log(`User ${toUserId} offline. Message ${msg.id} stored.`);
    
    // Optionally: Send push notification via APNs/FCM
    await this.pushNotificationService.notify(toUserId, {
      title: 'New message',
      body: 'You have a new message', // Can't show content — E2E encrypted!
    });
  }

  /**
   * When Bob comes online — deliver all pending messages.
   */
  async handleUserConnect(userId: string, socket: WebSocket): Promise<void> {
    // 1. Register connection
    this.activeConnections.set(userId, socket);
    await this.userGateway.set(`user:${userId}`, this.serverId);
    
    // 2. Fetch all pending messages
    const pending = await this.tempStore.query(
      'SELECT * FROM pending_messages WHERE to_user_id = ? ORDER BY timestamp ASC',
      [userId]
    );
    
    // 3. Deliver all pending messages
    for (const msg of pending) {
      socket.send(JSON.stringify(msg));
    }
  }

  /**
   * Handle ACK from Bob.
   */
  async handleAck(msgId: string, fromUserId: string, status: MessageStatus): Promise<void> {
    if (status === 'DELIVERED') {
      // Bob has received the message — delete from temp store
      await this.tempStore.delete('pending_messages', { message_id: msgId });
    }
    
    // Forward ACK to original sender (Alice) so she sees ticks
    const originalMsg = await this.tempStore.get('message_metadata', msgId);
    if (!originalMsg) return;
    
    const aliceSocket = this.activeConnections.get(originalMsg.from_user_id);
    if (aliceSocket) {
      aliceSocket.send(JSON.stringify({ type: 'ACK', msgId, status }));
    } else {
      // Alice is offline — store ACK, she'll get it when she reconnects
      await this.tempStore.insert('pending_acks', {
        user_id: originalMsg.from_user_id,
        message_id: msgId,
        status,
      });
    }
  }

  /**
   * Send ACK to a user.
   */
  private sendAck(userId: string, msgId: string, status: MessageStatus): void {
    const socket = this.activeConnections.get(userId);
    if (socket) {
      socket.send(JSON.stringify({ type: 'ACK', msgId, status }));
    }
  }
}
```

---

## 6. Scenario B: Group Chat & Online Presence

**Real-Life Scenario:** Alice sends a message to a group of 100 people. Plus, the app needs to show who's "online" and "last seen".

**Technical Problem:** Fan-out group messages and manage presence efficiently.

### TypeScript Implementation

```typescript
/**
 * GROUP CHAT — Server-Side Fan-Out
 * 
 * Problem: Alice sends 1 message to a group of N members.
 * Solution: Server fans out to N-1 other members.
 * 
 * Encryption: Alice generates a "Sender Key" for the group.
 * - Alice encrypts the Sender Key individually for each member (pairwise).
 * - The actual message is encrypted ONCE with the Sender Key.
 * - Everyone uses the Sender Key to decrypt.
 * 
 * @timeComplexity O(N) per group message where N = group members
 */

class GroupChatService {
  private chatServer: ChatServer;
  private groupDb: GroupDatabase;

  async sendGroupMessage(
    groupId: string, senderId: string, msg: EncryptedMessage
  ): Promise<void> {
    // 1. Get group members
    const members = await this.groupDb.getMembers(groupId);
    
    // 2. Validate sender is in group
    if (!members.includes(senderId)) {
      throw new Error('Not a member of this group');
    }

    // 3. ACK to sender
    this.chatServer.sendAck(senderId, msg.id, 'SENT');

    // 4. Fan-out to all OTHER members
    const recipients = members.filter(m => m !== senderId);
    
    const deliveryPromises = recipients.map(userId =>
      this.chatServer.handleMessage({
        ...msg,
        toUserId: userId,
        // Same encrypted payload — all members share the Sender Key
      })
    );

    // Fan-out in parallel (don't wait for all)
    await Promise.allSettled(deliveryPromises);
  }
}

/**
 * ONLINE PRESENCE SERVICE
 * 
 * Shows "Online" or "Last Seen at 10:30 PM".
 * 
 * Challenge: Don't update DB on every heartbeat (too expensive).
 * Solution: Update Redis on heartbeat, persist to DB only if 
 * last DB update was > 5 minutes ago.
 * 
 * @note WhatsApp sends presence heartbeats every 10 seconds.
 */

class PresenceService {
  private redis: RedisClient;
  private db: PostgresClient;

  /**
   * Called on every WebSocket heartbeat (every 10 seconds).
   */
  async updatePresence(userId: string): Promise<void> {
    const now = Date.now();
    
    // 1. Always update Redis (fast, ephemeral)
    await this.redis.hset(`presence:${userId}`, {
      status: 'ONLINE',
      lastSeen: now.toString(),
    });
    await this.redis.expire(`presence:${userId}`, 30); // 30s TTL
    
    // 2. Conditionally update DB (only every 5 minutes)
    const lastDbUpdate = await this.redis.get(`presence:db:${userId}`);
    if (!lastDbUpdate || now - parseInt(lastDbUpdate) > 5 * 60 * 1000) {
      await this.db.query(
        'UPDATE users SET last_seen = $1 WHERE id = $2',
        [new Date(now), userId]
      );
      await this.redis.set(`presence:db:${userId}`, now.toString());
    }
  }

  /**
   * When user disconnects.
   */
  async setOffline(userId: string): Promise<void> {
    const now = Date.now();
    await this.redis.hset(`presence:${userId}`, {
      status: 'OFFLINE',
      lastSeen: now.toString(),
    });
    await this.redis.expire(`presence:${userId}`, 86400); // 24h for "last seen"
    
    // Persist to DB immediately on disconnect
    await this.db.query(
      'UPDATE users SET last_seen = $1 WHERE id = $2',
      [new Date(now), userId]
    );
  }

  /**
   * Get presence for a user (called by their chat contacts).
   */
  async getPresence(userId: string): Promise<{ status: string; lastSeen: number }> {
    const presence = await this.redis.hgetall(`presence:${userId}`);
    
    if (presence?.status === 'ONLINE') {
      return { status: 'Online', lastSeen: parseInt(presence.lastSeen) };
    }
    
    // User offline — return last seen time
    if (presence?.lastSeen) {
      return { status: 'Offline', lastSeen: parseInt(presence.lastSeen) };
    }
    
    // No presence data — check DB
    const user = await this.db.query(
      'SELECT last_seen FROM users WHERE id = $1', [userId]
    );
    return { status: 'Offline', lastSeen: user?.last_seen?.getTime() || 0 };
  }
}
```

---

## 7. End-to-End Encryption (Signal Protocol) 🔐

Server stores **only** encrypted blobs. It has NO IDEA what the message says.

**Key Concepts:**
1.  **Identity Key:** Long-term key (like a fingerprint). Never changes.
2.  **Pre-Keys:** One-time keys generated by Bob and stored on Server.
    *   Alice fetches Bob's "Pre-Key" bundle from server.
3.  **Session Key:** Alice generates a shared secret using Bob's Pre-Key (X3DH key agreement).
4.  **Double Ratchet:** Every message changes the key.
    *   If you hack one key, you can't read past messages (**Forward Secrecy**).
    *   Or future messages (**Backward Secrecy**).

**Group Encryption:**
1.  Alice generates a "Sender Key" for the group.
2.  Alice encrypts this Sender Key individually for each member (pairwise Signal encryption).
3.  The actual message is encrypted ONCE with the Sender Key.
4.  All members use the Sender Key to decrypt.
5.  When a member leaves, a new Sender Key is generated and distributed.

---

## 8. Real World Applications 🌍

### 1. 💬 WhatsApp Production Architecture

**Key Stats & Decisions:**
- 2 Billion users, 100B messages/day.
- **Erlang/FreeBSD:** WhatsApp runs on custom-tuned FreeBSD + Erlang.
- ~2M concurrent connections per server (35 engineers managed this at Instagram acquisition!).
- Message history stored on **Phone** (not server). Backups go to iCloud/Google Drive.
- Server is intentionally "lean" — just a router for encrypted blobs.

### 2. 📱 Telegram (Server-Side Storage)

**Difference from WhatsApp:**
- Stores message history on **Server** (cloud-first).
- Requires massive distributed database (custom MTProto protocol).
- Allows multi-device sync easily (all devices pull from server).
- "Secret Chats" are E2E encrypted (like WhatsApp), but regular chats are NOT.

### 3. 🔔 Push Notifications

When app is closed (killed background process), WebSockets die:
- Server sends push via **APNs (Apple)** or **FCM (Google)** to wake up the phone.
- Push payload: Just "you have a new message" (can't include content — E2E encrypted!).
- Phone wakes up, re-establishes WebSocket, pulls pending messages.

### 4. 📎 Media Sharing

- Media does NOT go through the WebSocket (too large).
- **Upload flow:** Client uploads encrypted media to HTTP → S3/Blob Storage → gets a URL.
- **Message:** Send the URL + encryption key + thumbnail hash via WebSocket.
- Recipient downloads media from URL and decrypts locally.

---

## 9. Complexity Analysis 🧠

### Data Model Schema

```
users (PostgreSQL)
──────────────────
  id:           UUID       PRIMARY KEY
  phone:        VARCHAR    UNIQUE (phone number)
  display_name: VARCHAR
  avatar_url:   VARCHAR
  last_seen:    TIMESTAMP
  created_at:   TIMESTAMP

messages (Cassandra — Ephemeral!)
─────────────────────────────────
  message_id:     UUID              -- Time-based UUID (TimeUUID)
  to_user_id:     UUID              PARTITION KEY
  from_user_id:   UUID
  encrypted_body: BLOB              -- Server can't read this
  type:           TEXT              -- 'TEXT', 'IMAGE', 'VIDEO'
  media_url:      TEXT              -- S3 URL for media
  timestamp:      TIMESTAMP         CLUSTERING KEY (DESC)
  TTL:            7 DAYS            -- Auto-delete after delivery

groups (PostgreSQL)
──────────────────
  id:           UUID       PRIMARY KEY
  name:         VARCHAR
  created_by:   UUID       FK → users
  created_at:   TIMESTAMP

group_members (PostgreSQL)
────────────────────────
  group_id:    UUID       FK → groups
  user_id:     UUID       FK → users
  joined_at:   TIMESTAMP
  role:        ENUM('ADMIN', 'MEMBER')
  PRIMARY KEY (group_id, user_id)

presence (Redis — Ephemeral)
────────────────────────────
  Hash: "presence:{userId}" → { status, lastSeen }
  TTL: 30 seconds (auto-expire = offline)

user_gateway (Redis — Session Routing)
────────────────────────────────
  String: "user:{userId}" → "gateway-server-5"
  TTL: Session duration
```

### Back-of-Envelope Estimation

```
Users: 2B total, 500M DAU

Messages:
  - 100B messages/day
  - QPS: 100B / 86400 ≈ 1.15M messages/sec
  - Peak (3x): 3.5M messages/sec

Connections:
  - 500M concurrent WebSocket connections
  - At 2M connections/server: 250 gateway servers
  - Connection memory: 2KB per connection (Erlang) × 2M = 4GB/server

Storage (Temp Messages):
  - Average message: 100 bytes (encrypted)
  - Messages in transit (offline users, avg 6 hour window):
    100B * (6/24) * 100 bytes ≈ 2.5 TB temp storage
  - Cassandra cluster with TTL: auto-cleanup

Media:
  - 10B media messages/day  
  - Average media: 500KB (compressed image)
  - Daily media: 10B × 500KB = 5 PB/day (S3/Blob)
  - With CDN caching: ~2 PB net new

Bandwidth:
  - 1.15M msg/sec × 100 bytes ≈ 115 MB/sec (text only)
  - Media: 5 PB/day = 58 GB/sec
```

### API Design (WebSocket Events)

```
Client → Server:
  { type: 'MESSAGE', to: 'user_id', payload: encrypted, mediaUrl? }
  { type: 'GROUP_MESSAGE', groupId: 'id', payload: encrypted }
  { type: 'ACK', messageId: 'id', status: 'DELIVERED' | 'READ' }
  { type: 'TYPING', to: 'user_id', isTyping: true }
  { type: 'HEARTBEAT' }

Server → Client:
  { type: 'MESSAGE', from: 'user_id', payload: encrypted }
  { type: 'ACK', messageId: 'id', status: 'SENT' }
  { type: 'DELIVERY_RECEIPT', messageId: 'id', status: 'DELIVERED' }
  { type: 'READ_RECEIPT', messageId: 'id', status: 'READ' }
  { type: 'PRESENCE', userId: 'id', status: 'ONLINE' | 'OFFLINE' }
  { type: 'TYPING', from: 'user_id', isTyping: true }
```

### Interview Tips 💡

1.  **Erlang:** "WhatsApp is famous for using Erlang to handle 2M concurrent connections per server. The BEAM VM's lightweight processes make this possible."
2.  **Last Seen:** "Don't update DB on every heartbeat. Update Redis, then persist to DB only if the last update was > 5 minutes ago."
3.  **Media:** "Media doesn't go through the WebSocket. Upload encrypted media to S3 via HTTP, then send the URL + encryption key via WebSocket."
4.  **Store and Forward:** "Messages are stored temporarily in Cassandra. Once the recipient ACKs delivery, the message is deleted from the server."
5.  **Group Encryption:** "Use Sender Keys — one encryption per message, not per member. Distribute Sender Keys via pairwise Signal encryption."
6.  **Push Notifications:** "When the app is killed, WebSockets die. Use APNs/FCM to wake the phone, then re-establish WebSocket to pull messages."
7.  **Ordering:** "Use TimeUUID (Cassandra) or server-assigned sequence numbers per conversation to guarantee message ordering."
