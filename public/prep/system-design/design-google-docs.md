# Design Google Docs (Collaborative Editing) 📝

## 1. The "Two Writers" Analogy

**The Problem:**
*   Alice writes "HELLO" on line 1.
*   Bob writes "WORLD" on line 1.
*   They type at the *exact same millisecond*.

**Naive Approach:** Last write wins.
*   Alice saves "HELLO".
*   Bob saves "WORLD". Overcompeting Alice.
*   Result: "WORLD". Alice's work is lost.

**Collaborative Approach:**
*   We need to *merge* the intents.
*   Result: "HELLO WORLD".

**Google Docs:** A system ensuring **Eventual Consistency** across multiple users editing the same document state in real-time.

---

## 2. Core Constraints

1.  **Concurrency:** Multiple users editing same doc.
2.  **Latency:** Typing must feel instant (Local Echo). You can't wait for server ACK to show character on screen.
3.  **Offline Support:** User edits on plane, syncs on landing.
4.  **Ordering:** Operations must be applied in correct order or transformed.

---

## 3. The Secret Sauce: OT vs CRDT 🧠

This is the core of the interview.

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
*   **Pros:** History is linear. Central server controls truth.
*   **Cons:** Extremely complex math (Transformation Functions). Requires Central Server.

### 2. CRDT (Conflict-free Replicated Data Types)
*   **Used By:** Figma, Redis (Enterprise), Riak.
*   **Concept:** Data structures that *always* merge correctly without logic.
*   **Example:** Give every character a unique float ID. `C=0.1`, `A=0.2`, `T=0.3`.
    *   Alice Inserts 'S' between A and T. ID = 0.25.
    *   Sort by ID: 0.1, 0.2, 0.25, 0.3 -> C A S T.
*   **Pros:** Decentralized (Peer-to-Peer friendly). No complex transform logic.
*   **Cons:** Metadata overhead (every character needs an ID object). Memory heavy.

---

## 4. High-Level Architecture 🏗️

```visualizer
{
  "type": "architecture-diagram",
  "content": "graph TD\n    Alice[Alice (Browser)]-->|WebSocket| LB[Load Balancer]\n    Bob[Bob (Browser)]-->|WebSocket| LB\n    \n    LB-->|Sticky Session| Server[Doc Session Server]\n    \n    Server-->|Load/Save| DB[(Document Storage)]\n    Server-->|Op Log| Redis[(Redis Op Log)]\n    \n    subgraph Server Logic\n    Server --- OT[OT Engine]\n    end"
}
```

*Note: You need "Sticky Sessions" (WebSocket affinity) so all users of Doc #123 land on the SAME server memory to run OT.*

---

## 5. Scenario A: Operational Transformation Logic

**Technical Problem:** Implement basic index shifting.

### TypeScript Implementation

```typescript
type Operation = 
  | { type: 'INSERT', pos: number, char: string }
  | { type: 'DELETE', pos: number };

/**
 * Transforms Op A against Op B.
 * Assuming B happened *before* A, how do we modify A 
 * so it makes sense in the new document state?
 */
function transform(opA: Operation, opB: Operation): Operation {
  // Deep clone to avoid mutation side effects
  const newOpA = { ...opA };

  if (opB.type === 'INSERT') {
    // If someone inserted usually *before* me, I need to shift right
    if (newOpA.pos >= opB.pos) {
      newOpA.pos += 1;
    }
  } 
  else if (opB.type === 'DELETE') {
    // If someone deleted *before* me, I need to shift left
    if (newOpA.pos > opB.pos) {
      newOpA.pos -= 1;
    }
    // Edge case: They deleted the exact char I was modifying? 
    // Requires more complex logic (tombstones etc)
  }

  return newOpA;
}

// Example usage
const opAlice: Operation = { type: 'INSERT', pos: 3, char: 'S' }; // Text: CA|T -> CAST
const opBob: Operation = { type: 'INSERT', pos: 0, char: 'X' };   // Text: |CAT -> XCAT

// Server receives Bob first. Text is "XCAT".
// Server receives Alice. Alice thought she was inserting at 3.
// But 3 is now 'T' in 'XCAT'. We want 'S' after 'T'? 
// Original: C(0) A(1) T(2) _|_(3)
// New: X(0) C(1) A(2) T(3) _|_(4)

const finalAlice = transform(opAlice, opBob); 
// finalAlice is { pos: 4, char: 'S' }
```

---

## 6. Real World Applications 🌍

### 1. 🎨 Figma (CRDT-ish)
Figma uses `Fractional Indexing` (similar to CRDT).
*   Structure: Tree of objects (Layers).
*   They synchronize the **properties** of objects (x, y, color).
*   Last Write Wins is often acceptable for "Color", but not for "Text".

### 2. 📝 Google Docs (OT)
*   **Latency Compensation:** When you type 'A', it appears instantly (grayed out?).
*   **Ack:** When server confirms, it becomes solid.
*   **Gatekeeper:** Server orders operations strictly by Version Number.

### 3. 💾 Database Storage
You don't save the whole file every 10ms.
1.  **Op Log:** Save small deltas `[insert a, delete b]`.
2.  **Snapshot:** Every 100 changes, save the full file state to S3/Blob Store.
3.  **Load:** Load Snapshot + Replay Op Log.

---

## 7. Complexity Analysis 🧠

### Garbage Collection
*   **CRDT Issue:** Deleting text means adding a "Tombstone" (invisible char). The document grows forever even if you delete everything.
*   **Solution:** Periodic "GC" or "Squashing" to remove tombstones.

### Consistency
*   **Convergence:** All users eventually see the same thing.
*   **Intention Preservation:** If I type 'A', and you delete the paragraph, my 'A' should ideally survive or be handled gracefully, not just vanish or corrupt the file.

### Interview Tips 💡
1.  **OT vs CRDT:** "OT is better for text (less memory, established). CRDT is better for decentralized/offline-first apps."
2.  **Central Server:** "OT requires a central sequencer. CRDT does not."
3.  **Undo/Redo:** "With Event Sourcing/Op Logs, Undo is just an inverse operation (Reverse Op)."
