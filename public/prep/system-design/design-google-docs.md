# Design Google Docs (Collaborative Editing) 📝

## 1. The "Two Writers" Analogy

**The Problem:**
*   Alice writes "HELLO" on line 1.
*   Bob writes "WORLD" on line 1.
*   They type at the *exact same millisecond*.

**Naive Approach:** Last write wins.
*   Alice saves "HELLO".
*   Bob saves "WORLD". Overwriting Alice.
*   Result: "WORLD". Alice's work is lost.

**Collaborative Approach:**
*   We need to *merge* the intents.
*   Result: "HELLO WORLD".

**Google Docs:** A system ensuring **Eventual Consistency** across multiple users editing the same document state in real-time. Every keystroke from every user must be ordered, transformed, and merged — across unreliable networks — and the result must be identical on all screens.

---

## 2. Core Constraints & Requirements

**Functional Requirements:**
1.  **Concurrency:** Multiple users editing the same document simultaneously.
2.  **Real-Time Sync:** Changes appear on other users' screens within ~200ms.
3.  **Offline Support:** User edits on plane, syncs on landing.
4.  **Rich Text:** Bold, italic, headings, tables, images — not just plain text.
5.  **Presence:** Show cursors for each collaborator (colored cursors).
6.  **Version History:** Time-travel to any point in the document's history.
7.  **Permissions:** View-only, comment, edit access levels.

**Non-Functional Requirements:**
1.  **Low Latency:** Typing must feel instant (< 50ms local echo).
2.  **High Availability:** Docs must be accessible 99.99% of the time.
3.  **Scale:** 1 billion documents, 10M concurrent editing sessions.
4.  **Durability:** No data loss — every keystroke is persisted.
5.  **Ordering:** Operations must converge to the same result on all clients.

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│              GOOGLE DOCS ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Alice (Browser)              Bob (Browser)                    │
│   ┌────────────┐               ┌────────────┐                   │
│   │ Local Copy │               │ Local Copy │                   │
│   │ + OT Engine│               │ + OT Engine│                   │
│   └─────┬──────┘               └─────┬──────┘                   │
│         │ WebSocket                  │ WebSocket                │
│         │                            │                          │
│   ┌─────▼────────────────────────────▼─────┐                    │
│   │           Load Balancer                │                    │
│   │     (Sticky Sessions by Doc ID)        │                    │
│   └─────────────────┬──────────────────────┘                    │
│                     │                                           │
│   ┌─────────────────▼──────────────────────┐                    │
│   │       Doc Session Server               │                    │
│   │  ┌─────────────────────────────────┐   │                    │
│   │  │  OT Engine (Server-Side)        │   │                    │
│   │  │  - Transforms concurrent ops    │   │                    │
│   │  │  - Assigns version numbers      │   │                    │
│   │  │  - Broadcasts to all clients    │   │                    │
│   │  └─────────────────────────────────┘   │                    │
│   └───────┬──────────────┬─────────────────┘                    │
│           │              │                                      │
│     ┌─────▼────┐   ┌─────▼──────────┐                           │
│     │  Op Log  │   │  Document DB   │                           │
│     │  (Redis) │   │  (Spanner /    │                           │
│     │  Recent  │   │   Bigtable)    │                           │
│     │  deltas  │   │  Snapshots +   │                           │
│     └──────────┘   │  Metadata      │                           │
│                    └────────────────┘                            │
│                                                                 │
│   Flow: Type → Local Apply → Send Op → Server Transform →      │
│         Broadcast → Other Clients Transform + Apply             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

*Note: You need "Sticky Sessions" (WebSocket affinity) so all users of Doc #123 land on the SAME server memory to run OT.*

---

## 4. The Secret Sauce: OT vs CRDT 🧠

This is the core of the interview. You MUST know both approaches.

### 1. Operational Transformation (OT)
*   **Used By:** Google Docs, Office 365.
*   **Concept:** "Transform" an operation based on what happened before it.
*   **Example:**
    *   Original: "CAT"
    *   Alice: `Insert(pos: 3, char: 'S')` (CATS)
    *   Bob: `Delete(pos: 0)` (AT)
    *   **Server Logic:** Bob's delete happened *before* expected index. Alice's insert at 3 works, but since 'C' is gone, index 3 is now index 2.
    *   **Transformation:** `Insert(pos: 2, char: 'S')`.
    *   Final: "ATS".
*   **Pros:** History is linear. Central server controls truth. Low memory overhead.
*   **Cons:** Extremely complex math (Transformation Functions). Requires Central Server.

### 2. CRDT (Conflict-free Replicated Data Types)
*   **Used By:** Figma, Redis (Enterprise), Riak, Yjs, Automerge.
*   **Concept:** Data structures that *always* merge correctly without coordination logic.
*   **Example:** Give every character a unique float ID. `C=0.1`, `A=0.2`, `T=0.3`.
    *   Alice Inserts 'S' between A and T. ID = 0.25.
    *   Sort by ID: 0.1, 0.2, 0.25, 0.3 -> C A S T.
*   **Pros:** Decentralized (Peer-to-Peer friendly). No complex transform logic. Works offline natively.
*   **Cons:** Metadata overhead (every character needs an ID object). Memory heavy. Tombstone accumulation.

### Comparison Table

| Feature | OT | CRDT |
| :--- | :--- | :--- |
| **Central Server** | Required (sequencer) | Not required |
| **Offline Support** | Limited | Excellent ✓ |
| **Memory Overhead** | Low ✓ | High (metadata per char) |
| **Complexity** | Transform functions (math) | Data structure design |
| **P2P Friendly** | No | Yes ✓ |
| **Industry** | Google Docs, Office 365 | Figma, Yjs, Automerge |
| **Convergence** | Guaranteed via server | Guaranteed mathematically |

---

## 5. Scenario A: Operational Transformation Logic

**Real-Life Scenario:** Two users editing the same document simultaneously.

**Technical Problem:** Implement OT index shifting with proper conflict resolution.

### TypeScript Implementation

```typescript
/**
 * OPERATIONAL TRANSFORMATION — Core Engine
 * 
 * The server receives operations from multiple clients.
 * Each client has a "version" indicating which server state they've seen.
 * The server transforms new ops against any ops the client hasn't seen yet.
 * 
 * @timeComplexity O(K) per operation, where K = concurrent ops to transform against
 * @spaceComplexity O(H) where H = operation history size
 */

type Operation = 
  | { type: 'INSERT'; pos: number; char: string; userId: string }
  | { type: 'DELETE'; pos: number; userId: string };

interface VersionedOp {
  op: Operation;
  version: number;     // Server version when this op was applied
  clientId: string;
}

/**
 * Transforms Op A against Op B.
 * Assuming B happened *before* A, how do we modify A 
 * so it makes sense in the new document state?
 */
function transform(opA: Operation, opB: Operation): Operation {
  const newOpA = { ...opA };

  if (opB.type === 'INSERT') {
    // Someone inserted *before* my position — shift right
    if (newOpA.pos > opB.pos || 
       (newOpA.pos === opB.pos && opB.userId < newOpA.userId)) {
      // Tie-breaking: Lower userId wins and goes first
      newOpA.pos += 1;
    }
  } 
  else if (opB.type === 'DELETE') {
    // Someone deleted *before* my position — shift left
    if (newOpA.type === 'DELETE' && newOpA.pos === opB.pos) {
      // Both deleting the same character — make this op a no-op
      return { type: 'DELETE', pos: -1, userId: newOpA.userId }; // Invalid = skip
    }
    if (newOpA.pos > opB.pos) {
      newOpA.pos -= 1;
    }
  }

  return newOpA;
}

/**
 * OT Server — The Central Sequencer
 * 
 * Receives ops from clients, transforms them against concurrent ops,
 * applies to the canonical document, and broadcasts to all clients.
 */
class OTServer {
  private document: string = '';
  private version: number = 0;
  private history: VersionedOp[] = [];
  private clients: Map<string, WebSocket> = new Map();

  /**
   * Client sends an operation along with the version they were editing at.
   */
  receiveOperation(clientId: string, clientVersion: number, op: Operation): void {
    // 1. Get all ops that happened since the client's version
    const concurrentOps = this.history.filter(h => h.version >= clientVersion);

    // 2. Transform the incoming op against each concurrent op
    let transformedOp = op;
    for (const concurrent of concurrentOps) {
      if (concurrent.clientId !== clientId) {
        transformedOp = transform(transformedOp, concurrent.op);
      }
    }

    // 3. Apply to canonical document
    this.applyOp(transformedOp);
    this.version++;

    // 4. Store in history
    this.history.push({ op: transformedOp, version: this.version, clientId });

    // 5. Broadcast to all OTHER clients
    this.clients.forEach((ws, id) => {
      if (id !== clientId) {
        ws.send(JSON.stringify({
          type: 'remote_op',
          op: transformedOp,
          version: this.version,
        }));
      }
    });

    // 6. ACK the sender (so they know their version is confirmed)
    this.clients.get(clientId)?.send(JSON.stringify({
      type: 'ack',
      version: this.version,
    }));
  }

  private applyOp(op: Operation): void {
    if (op.type === 'INSERT') {
      this.document = 
        this.document.slice(0, op.pos) + op.char + this.document.slice(op.pos);
    } else if (op.type === 'DELETE' && op.pos >= 0) {
      this.document = 
        this.document.slice(0, op.pos) + this.document.slice(op.pos + 1);
    }
  }
}

/**
 * OT Client — Local-First Editing
 * 
 * 1. User types → Apply immediately (optimistic)
 * 2. Send op to server
 * 3. Receive remote ops → Transform against pending local ops → Apply
 */
class OTClient {
  private document: string = '';
  private version: number = 0;
  private pendingOps: Operation[] = []; // Sent but not ACK'd
  private buffer: Operation[] = [];     // Not yet sent

  onLocalEdit(op: Operation): void {
    // Apply immediately (feels instant!)
    this.applyOp(op);
    
    if (this.pendingOps.length === 0) {
      // Nothing waiting for ACK — send immediately
      this.pendingOps.push(op);
      this.sendToServer(op);
    } else {
      // Buffer until pending ops are ACK'd
      this.buffer.push(op);
    }
  }

  onServerAck(): void {
    this.version++;
    this.pendingOps = [];

    // Send buffered ops
    if (this.buffer.length > 0) {
      const composedOp = this.buffer.shift()!; // Simplification
      this.pendingOps.push(composedOp);
      this.sendToServer(composedOp);
    }
  }

  onRemoteOp(remoteOp: Operation): void {
    // Transform remote op against our pending and buffered ops
    let transformed = remoteOp;

    for (let i = 0; i < this.pendingOps.length; i++) {
      const [newRemote, newPending] = transformPair(transformed, this.pendingOps[i]);
      transformed = newRemote;
      this.pendingOps[i] = newPending;
    }

    for (let i = 0; i < this.buffer.length; i++) {
      const [newRemote, newBuffered] = transformPair(transformed, this.buffer[i]);
      transformed = newRemote;
      this.buffer[i] = newBuffered;
    }

    // Apply the transformed remote op
    this.applyOp(transformed);
    this.version++;
  }
}
```

---

## 6. Scenario B: CRDT — Conflict-Free Merge

**Real-Life Scenario:** Building a Figma-like collaborative tool that must work offline and peer-to-peer.

**Technical Problem:** Design a text CRDT where characters have unique, sortable identifiers.

### TypeScript Implementation

```typescript
/**
 * TEXT CRDT — Sequence CRDT (RGA / LSEQ variant)
 * 
 * Core Idea: Every character has a globally unique, sortable position ID.
 * Inserting between two characters = generating an ID between their IDs.
 * 
 * No server required — any two peers can merge their states and converge.
 * 
 * @timeComplexity Insert: O(log N) — binary search for position
 * @spaceComplexity O(N * M) — N characters × M bytes per ID
 */

interface CharAtom {
  id: { siteId: string; counter: number };  // Globally unique
  value: string | null;                      // null = tombstone (deleted)
  position: number[];                        // Fractional position path
}

class TextCRDT {
  private atoms: CharAtom[] = [];
  private siteId: string;
  private counter: number = 0;

  constructor(siteId: string) {
    this.siteId = siteId;
    // Sentinel characters at boundaries
    this.atoms = [
      { id: { siteId: 'START', counter: 0 }, value: null, position: [0] },
      { id: { siteId: 'END', counter: 0 }, value: null, position: [1000] },
    ];
  }

  /**
   * Insert a character at the given visible index.
   * Generates a position between the two surrounding atoms.
   */
  insert(visibleIndex: number, char: string): CharAtom {
    const visibleAtoms = this.getVisibleAtoms();
    const before = visibleIndex === 0 ? this.atoms[0] : visibleAtoms[visibleIndex - 1];
    const after = visibleIndex >= visibleAtoms.length 
      ? this.atoms[this.atoms.length - 1] 
      : visibleAtoms[visibleIndex];

    // Generate position between 'before' and 'after'
    const newPosition = this.generatePositionBetween(before.position, after.position);
    
    const atom: CharAtom = {
      id: { siteId: this.siteId, counter: ++this.counter },
      value: char,
      position: newPosition,
    };

    // Insert in sorted order
    this.insertSorted(atom);
    return atom;
  }

  /**
   * Delete a character (mark as tombstone — never physically remove).
   */
  delete(visibleIndex: number): void {
    const visibleAtoms = this.getVisibleAtoms();
    if (visibleIndex < visibleAtoms.length) {
      visibleAtoms[visibleIndex].value = null; // Tombstone
    }
  }

  /**
   * Merge a remote atom into our state.
   * This is the magic — it ALWAYS converges regardless of order!
   */
  mergeRemote(remoteAtom: CharAtom): void {
    // Check if we already have this atom (idempotent)
    const exists = this.atoms.find(a => 
      a.id.siteId === remoteAtom.id.siteId && 
      a.id.counter === remoteAtom.id.counter
    );
    if (exists) {
      // If it's a delete (tombstone), apply it
      if (remoteAtom.value === null) exists.value = null;
      return;
    }
    
    this.insertSorted(remoteAtom);
  }

  getText(): string {
    return this.getVisibleAtoms().map(a => a.value).join('');
  }

  private getVisibleAtoms(): CharAtom[] {
    return this.atoms.filter(a => a.value !== null);
  }

  private insertSorted(atom: CharAtom): void {
    const index = this.atoms.findIndex(a => 
      this.comparePositions(atom.position, a.position) < 0
    );
    if (index === -1) {
      this.atoms.push(atom);
    } else {
      this.atoms.splice(index, 0, atom);
    }
  }

  private generatePositionBetween(before: number[], after: number[]): number[] {
    // Simplified fractional indexing
    const result: number[] = [];
    for (let i = 0; i < Math.max(before.length, after.length); i++) {
      const b = before[i] || 0;
      const a = after[i] || 1000;
      if (a - b > 1) {
        result.push(Math.floor((b + a) / 2));
        return result;
      }
      result.push(b);
    }
    result.push(500); // Add new depth level
    return result;
  }

  private comparePositions(a: number[], b: number[]): number {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const va = a[i] || 0;
      const vb = b[i] || 0;
      if (va !== vb) return va - vb;
    }
    return 0;
  }
}

// Example: Two users editing independently, then merging
const alice = new TextCRDT('alice');
const bob = new TextCRDT('bob');

// Alice types "HI"
const h = alice.insert(0, 'H');
const i = alice.insert(1, 'I');

// Bob types "OK"
const o = bob.insert(0, 'O');
const k = bob.insert(1, 'K');

// Now merge (any order!) — both converge to the same text
bob.mergeRemote(h);
bob.mergeRemote(i);
alice.mergeRemote(o);
alice.mergeRemote(k);

// alice.getText() === bob.getText() — ALWAYS!
```

---

## 7. Real World Applications 🌍

### 1. 📝 Google Docs (OT — Jupiter Protocol)

**Architecture:**
- Custom OT implementation called "Jupiter" protocol.
- Central server acts as sequencer — assigns global version numbers.
- **Latency Compensation:** When you type 'A', it appears instantly on your screen ("optimistic apply"). Grayed out until server ACK confirms.
- **Op Log + Snapshots:** Saves small deltas. Every ~100 changes, saves full document snapshot to Bigtable/Spanner.
- **Presence:** Cursor positions are broadcast via a separate lightweight channel.
- **Scale:** 1B+ documents, uses Colossus (Google's distributed file system) for storage.

### 2. 🎨 Figma (CRDT-inspired)

Figma uses `Fractional Indexing` (similar to CRDTs):
- Document structure: Tree of objects (Layers, Frames, Components).
- They synchronize **properties** of objects (x, y, width, color, text).
- **Conflict resolution:** Last Write Wins is acceptable for properties like color or position.
- For text within components, they use a sequence CRDT.
- **Multiplayer cursors:** Separate WebSocket channel for presence data.

### 3. 🔗 Yjs / Automerge (Open-Source CRDTs)

**Yjs** is the most popular open-source CRDT library:
- Used by Notion, Jupyter Notebooks, and many collaborative editors.
- Implements Y-CRDT (a CRDT optimized for text editing).
- 10x smaller memory footprint than naive CRDTs.
- Works peer-to-peer (WebRTC) or with a central server (WebSocket).

### 4. 💾 Storage Strategy (All Systems)

You don't save the whole file every 10ms:
1.  **Op Log:** Save small deltas `[insert a, delete b]` to Redis or DynamoDB.
2.  **Snapshot:** Every 100 changes, save full document state to S3/Blob Store.
3.  **Load:** Load Snapshot + Replay Op Log from snapshot version.
4.  **Version History:** Keep snapshots at meaningful intervals (every 30 min or on "named" saves).

---

## 8. Complexity Analysis 🧠

### Data Model

```
documents {
  id:           UUID    PRIMARY KEY
  title:        VARCHAR
  owner_id:     UUID    FK → users
  content_snapshot: BLOB        -- Latest full content
  snapshot_version: INT         -- Version of the snapshot
  created_at:   TIMESTAMP
  updated_at:   TIMESTAMP
}

operations {
  id:           UUID    PRIMARY KEY
  doc_id:       UUID    FK → documents
  user_id:      UUID    FK → users
  version:      INT             -- Server-assigned sequential version
  op_type:      ENUM('INSERT', 'DELETE', 'FORMAT')
  position:     INT
  content:      VARCHAR         -- Character(s) inserted (NULL for delete)
  created_at:   TIMESTAMP
  INDEX (doc_id, version)       -- Fast replay
}

doc_permissions {
  doc_id:       UUID    FK → documents
  user_id:      UUID    FK → users
  role:         ENUM('OWNER', 'EDITOR', 'COMMENTER', 'VIEWER')
}

presence (Redis — Ephemeral) {
  key: "doc:{docId}:cursors"
  value: { userId: { position, color, name, lastActive } }
  TTL: 30 seconds
}
```

### Back-of-Envelope Estimation

```
Users: 500M total, 50M DAU
Documents: 1B total
Concurrent editing sessions: 10M

Operations:
  - Average typist: 40 WPM × 5 chars = 200 ops/min per user
  - 10M concurrent users × 200 ops/min = 2B ops/min = 33M ops/sec
  - Peak (5x): 165M ops/sec → Need horizontal sharding by doc ID

Storage:
  - Operation: ~100 bytes (position, char, metadata)
  - Per document per day: 10K ops × 100 bytes = 1MB
  - All documents daily: 100M active docs × 1MB = 100TB/day (ops only)
  - With snapshots and compression: ~10TB/day

WebSocket Connections:
  - 10M concurrent connections
  - At 50KB memory per connection: 500GB RAM
  - Distributed across 1000 servers: 500MB/server (comfortable)

Bandwidth:
  - 33M ops/sec × 100 bytes = 3.3 GB/sec outgoing
  - With fan-out (avg 3 collaborators): 10 GB/sec
```

### Garbage Collection (CRDT Specific)
*   **CRDT Issue:** Deleting text means adding a "Tombstone" (invisible char). The document grows forever even if you delete everything.
*   **Solution:** Periodic "GC" or "Squashing" to remove tombstones. Requires coordination (all peers must agree they've seen the delete).

### Consistency & Convergence
*   **Convergence:** All users eventually see the same thing. OT guarantees this via the central server. CRDTs guarantee it mathematically.
*   **Intention Preservation:** If I type 'A', and you delete the paragraph, my 'A' should ideally survive or be handled gracefully, not just vanish or corrupt the file.
*   **Undo/Redo:** With Event Sourcing/Op Logs, Undo is an inverse operation. But in collaborative editing, "undo MY changes" is different from "undo ALL changes" — this requires tracking per-user op chains.

### OT vs CRDT Decision Framework

```
Choose OT if:
  ✓ You have a central server (cloud-based editor)
  ✓ Memory efficiency matters
  ✓ Document size is large
  ✓ You can accept the server as single point of coordination

Choose CRDT if:
  ✓ You need offline-first / peer-to-peer
  ✓ Decentralized architecture (no central server)
  ✓ You can afford the metadata overhead
  ✓ You want mathematical convergence guarantees
```

### Interview Tips 💡

1.  **OT vs CRDT:** "OT (Google Docs) requires a central server. CRDT (Figma, Yjs) works peer-to-peer. OT is simpler for server-based apps; CRDT is better for offline-first."
2.  **Central Server:** "OT requires a central sequencer to order operations. CRDTs don't need one because convergence is mathematically guaranteed."
3.  **Undo/Redo:** "With Op Logs, Undo is an inverse operation. In collaborative editing, you undo YOUR operations, not everyone's."
4.  **Sticky Sessions:** "All users editing Doc #123 must WebSocket to the SAME server so OT can run in one memory space."
5.  **Storage:** "Don't save the full document every keystroke. Save op deltas and periodic snapshots. Load = snapshot + replay recent ops."
6.  **Presence:** "Cursor positions are sent on a separate high-frequency channel (every 50ms) and stored ephemerally in Redis with short TTL."
7.  **Conflict Resolution:** "Insertions at the same position use tie-breaking (lower userId goes first). Deletes of the same character are idempotent."
