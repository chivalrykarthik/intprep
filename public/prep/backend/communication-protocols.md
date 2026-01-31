# Communication Protocols: gRPC, REST, GraphQL 📡

## 1. The "Restaurant Menu" Analogy

1.  **REST (The Standard Menu):**
    *   You ask: "Give me Menu Page 1". Wait. "Give me Page 2". Wait.
    *   Rigid. You get exactly what's printed.
    *   *Payload:* English (JSON) - verbose.
    *   *Analogy:* Standard API. Reliable, cacheable, chatty.

2.  **GraphQL (The Custom Order):**
    *   You ask: "I want the Burger name, the Fries price, and the Soda size. Nothing else."
    *   Flexible. You get exactly what you asked for. No under-fetching, no over-fetching.
    *   *Analogy:* Facebook Apps. Complex data graphs.

3.  **gRPC (The Kitchen Shorthand):**
    *   You shout code: "Ord:12, Bgr, Fry!"
    *   Fast. Binary.
    *   *Payload:* Binary (Protobuf). Compact.
    *   *Analogy:* Microservices talking to each other. Internal, high-speed.

---

## 2. Comparison Matrix

| Feature | REST | GraphQL | gRPC |
| :--- | :--- | :--- | :--- |
| **Protocol** | HTTP/1.1 (Text) | HTTP/1.1 (Text) | HTTP/2 (Binary) |
| **Format** | JSON | JSON | Protobuf (Binary) |
| **Schema** | Optional (OpenAPI) | Strong (SDL) | Strong (.proto) |
| **Fetching** | Multiple Requests (N+1) | Single Request | Single Request / Stream |
| **Caching** | Excellent (HTTP) | Difficult (POST) | Difficult |
| **Browser Support** | Native | Library needed (Apollo) | Requires gRPC-Web proxy |
| **Best For** | Public APIs | Frontend/Mobile | Internal Microservices |

---

## 3. Deep Dive: Protocol Buffers (gRPC Internals) 💾

**Why is JSON slow?**
`{"id": 123, "name": "John"}` (26 bytes)
1.  Parse string `"id"`.
2.  Parse value `123`.
3.  Parse string `"name"`.
4.  Parse value `"John"`.

**Why is Protobuf fast?**
It separates the **Schema** (`.proto`) from the **Data**.
schema: `1 = id (int), 2 = name (string)`
Data: `08 7B 12 04 4A 6F 68 6E` (8 bytes)

**Decoding:**
`08` -> Field 1 (id), WireType 0 (Varint)
`7B` -> 123
`12` -> Field 2 (name), WireType 2 (Length Delimited)
`04` -> Length 4
`4A6F686E` -> "John"

**Result:** 3x smaller payload, 10x faster parsing (CPU).

### TypeScript Implementation

```typescript
/**
 * SIMULATING REST vs GRAPHQL vs GRPC
 */

// 1. Data Model
const user = { id: 1, name: "Alice", email: "alice@google.com", posts: [/* 100 objs */] };

// --- REST ---
// GET /users/1
function handleRest() {
    return JSON.stringify(user); 
    // Problem: Returns ALL 100 posts even if I just wanted the email. (Over-fetching)
}

// --- GraphQL ---
// POST { query: "{ name }" }
function handleGraphQL(query: string[]) {
    const result: any = {};
    if (query.includes("name")) result.name = user.name;
    if (query.includes("email")) result.email = user.email;
    return JSON.stringify(result);
    // Solved: Only returns what is asked.
}

// --- gRPC (Protobuf) ---
// Note: In real life, use 'protobufjs' or generated code
class BufferWriter {
    buffer: number[] = [];
    
    writeField(fieldId: number, value: string | number) {
        // Mocking binary encoding logic
        // Tag = (FieldID << 3) | WireType
        if (typeof value === 'number') {
            this.buffer.push((fieldId << 3) | 0); 
            this.buffer.push(value); // Varint
        } else {
            this.buffer.push((fieldId << 3) | 2); 
            this.buffer.push(value.length);
            for(let i=0; i<value.length; i++) this.buffer.push(value.charCodeAt(i));
        }
    }
}
```

---

## 4. HTTP/2 Multiplexing (gRPC Secret Weapon) 🚀

**HTTP/1.1 (REST):**
*   Request 1 -> Wait -> Response 1.
*   Request 2 -> Wait -> Response 2.
*   *Head-of-Line Blocking:* If Req 1 is slow, Req 2 waits.

**HTTP/2 (gRPC):**
*   Single TCP Connection.
*   Streams: Req 1, Req 2, Req 3 sent *simultaneously* on distinct streams (ID 1, 3, 5).
*   Responses come back whenever ready (ID 5, 1, 3).
*   **Result:** No blocking. Massive concurrency on one socket.

---

## 5. Scenario A: Choosing the Right Protocol

**Case 1: Public API for 3rd Party Devs (Stripe/Twitter)**
*   **Choice:** **REST**.
*   **Why?** Everyone knows it. `curl` works. Debugging is easy. Tools valid.

**Case 2: Mobile App Dashboard (Facebook/Instagram)**
*   **Choice:** **GraphQL**.
*   **Why?** Mobile data is expensive. Screen sizes vary (Phone vs Tablet).
    *   Phone asks for `{ name, avatar }`.
    *   Tablet asks for `{ name, avatar, bio, recent_photos }`.
    *   Single endpoint serves both efficiently.

**Case 3: Microservices Mesh (Netflix/Uber)**
*   **Choice:** **gRPC**.
*   **Why?**
    *   Service A calls Service B 1000 times/sec.
    *   Saving 1ms parsing time * 1000 = 1 second CPU saved.
    *   Strong typing (`.proto`) prevents "Contract Drifts" (Breaking changes).

---

## 6. Real World Applications 🌍

### 1. 🎥 Netflix (Falcor -> GraphQL)
Netflix famously used "Falcor" (similar to GraphQL) to solve the "One Endpoint per Device" problem.

### 2. 📦 Uber (gRPC)
Uber migrated 2000+ services to gRPC.
*   Enforced strict `.proto` definitions.
*   Generated client SDKs for Go, Java, Python automatically.
*   No more "JSON parse error" in production.

---

## 7. Complexity Analysis 🧠

### gRPC Load Balancing
Standard L4 Load Balancers (AWS NLB) don't work well with gRPC.
*   **Why?** gRPC uses persistent HTTP/2 connections.
*   Connection is sticky. One server gets ALL the requests from one client.
*   **Solution:** L7 Load Balancing (Envoy Proxy) or Client-Side Load Balancing (Lookaside).

### GraphQL Complexity (N+1 Problem)
Query: `Get Users -> For Each User -> Get Posts`.
*   Naive: 1 query for users + N queries for posts.
*   **Solution:** **DataLoader**. Batching pattern.
    *   Wait 20ms. Collect all IDs `[1, 2, 3]`.
    *   Run `SELECT * FROM Posts WHERE user_id IN (1, 2, 3)`.

### Interview Tips 💡
1.  **Don't hate REST:** "REST is stateless and cacheable. GraphQL is POST-only, so CDN caching is hard."
2.  **Streaming:** "gRPC supports Bi-directional streaming. Great for chat, stock tickers, or progress bars."
3.  **Governance:** "Schema Stitching / Federation in GraphQL allows multiple teams to contribute to one Graph."
