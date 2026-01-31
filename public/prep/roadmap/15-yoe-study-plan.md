# Staff+ Engineering Interview Roadmap 🗺️

## 🎯 The "15 YOE" Application Strategy

At the Staff/Principal level, the game changes. You are not just being tested on *coding*; you are being tested on **Scope**, **Complexity**, **Trade-offs**, and **Leadership**.

This roadmap covers the entire "Bible" of material available in this application, structured into a 6-week intensive preparation plan.

---

## 📅 Phase 1: The Foundation (Week 1)
*Goal: Dust off the cobwebs on core constraints and basic architecture.*

### 1. Efficiency & Complexity
*   **Time Complexity:** Big O, Master Theorem.
    *   `efficiency/time-complexity`
    *   `efficiency/space-complexity`
    *   `efficiency/big-o-notation`
*   **Patterns:** Recognize problems instantly.
    *   `14patterns/*` (Review all 14)

### 2. Core Data Structures
*   **Graphs:** BFS/DFS, Topological Sort (Key for Build Systems/Dependency Graphs).
    *   `DSA/graphs`
*   **Trees & Tries:** Autocomplete systems.
    *   `DSA/tries`, `DSA/binary-trees`
*   **Queues/Stacks:** Task processing.
    *   `DSA/stacks-and-queues`

---

## 🏗️ Phase 2: System Design Core (Week 2)
*Goal: Master the standardized components of distributed systems.*

### 1. The Building Blocks
*   **Load Balancing:** L4 vs L7, Algorithms.
    *   `system-design/load-balancing`
*   **Caching:** Strategies (Write-through vs Look-aside), Eviction.
    *   `system-design/caching-strategies`
*   **Database Design:** SQL vs NoSQL vs NewSQL.
    *   `system-design/database-design`
*   **Hashing:** The key to partitioning.
    *   `system-design/consistent-hashing`

### 2. Scalability Basics
*   **Estimation:** Back-of-the-envelope math.
    *   `system-design/back-of-envelope-estimation`
*   **Rate Limiting:** Token Bucket, Leaky Bucket.
    *   `system-design/rate-limiting`

---

## 🚀 Phase 3: Advanced Distributed Systems (Week 3) ✨ **(Staff Level)**
*Goal: Deep dive into the "Hard Parts" ensuring consistency and reliability.*

### 1. Consistency & Consensus
*   **Leader Election:** Raft, Paxos, Split Brain.
    *   `system-design/leader-election`
*   **Transactions:** Sagas, 2PC, Isolation Levels.
    *   `system-design/distributed-transactions`
*   **Data Partitioning:** Sharding strategies, Hot Partitions.
    *   `system-design/sharding-partitioning`

### 2. Advanced Patterns
*   **Event Driven:** CQRS, Event Sourcing.
    *   `system-design/cqrs-event-sourcing`
*   **Microservices:** Patterns & Anti-patterns.
    *   `system-design/microservices-architecture`

---

## 🏭 Phase 4: Real-World Architecture (Week 4)
*Goal: Synthesize components into working, scalable products.*

### 1. Real-Time Systems
*   **Chat App:** WhatsApp/Messenger (Store & Forward, E2E Encryption).
    *   `system-design/design-whatsapp`
*   **Collaboration:** Google Docs (OT vs CRDT).
    *   `system-design/design-google-docs`

### 2. Location Based Systems
*   **Ride Sharing:** Uber/Lyft (QuadTrees, Geohashing).
    *   `system-design/design-uber`

### 3. High Volume Systems
*   **Social Feed:** Twitter/Instagram (Fan-out On Write vs Read).
    *   `system-design/system-design-social-media` (To be added)
*   **Web Crawler:** Google Search.
    *   `system-design/system-design-web-crawler` (To be added)

---

## ⚙️ Phase 5: Deep Internals (Week 5)
*Goal: Understand what happens "under the hood". Use this to impress.*

### 1. Backend Engineering
*   **Databases:** B-Trees vs LSM, WAL, Isolation.
    *   `backend/database-internals`
*   **Protocols:** gRPC vs REST vs GraphQL, HTTP/2.
    *   `backend/communication-protocols`
*   **Security:** OAuth2, OIDC, JWT, RBAC.
    *   `backend/authentication-authorization`

### 2. Cloud & DevOps
*   **Kubernetes:** Operators, Sidecars, Ambassadors.
    *   `cloud/kubernetes-patterns`
*   **Observability:** Tracing, Cardinality, SLOs.
    *   `cloud/observability`

---

## 🗣️ Phase 6: Leadership & Behavioral (Week 6)
*Goal: Demonstrate you can lead teams, not just code.*

### 1. The Staff Engineer Persona
*   **Influence:** Driving technical strategy without authority.
*   **Conflict:** Resolving architectural disputes.
    *   `behavioral/conflict-resolution`
*   **Failures:** Post-mortems and culture.
    *   `behavioral/failure-learning`

### 2. Frameworks
*   **STAR Method:** Structure your vague stories.
    *   `behavioral/star-method`
*   **Mentorship:** Growing senior engineers.
    *   `behavioral/leadership-mentoring`

---

## 🔁 The Review Loop
1.  **Read** the guide.
2.  **Draw** the diagrams (Whiteboard practice).
3.  **Code** the TypeScript examples provided in each file.
4.  **Teach** it to a peer (Feynman technique).

Good luck. You have 15 years of experience; now learn to sell it.
