# Leader Election (Paxos & Raft) 👑

## 1. The "Class President" Analogy

Imagine a classroom (Cluster) that needs to agree on when to have lunch (Data).
They must agree, even if some students are asleep (Node Failure) or shouting random times (Network Partition).

**The Problem:** If 2 students shout "Lunch at 12!" and 2 shout "Lunch at 1!", who wins? We need a single **Leader** to make the decision.

**Raft (The Democracy):**
1.  **Campaign:** A student stands up. "I want to be leader! Vote for mee!" (Term 1).
2.  **Voting:** Other students vote for the *first* person they hear.
3.  **Victory:** If they get 50% + 1 votes, they are the Leader.
4.  **Heartbeat:** The leader constantly shouts "I am leader!" so no one else runs for office.
5.  **Coup:** If the leader stops shouting (crashes), a student times out, gets impatient, and starts a new campaign (Term 2).

---

## 2. The Core Concept

In distributed systems (like Databases, Kafka, Etcd), you cannot have multiple "Brains".
*   **Split Brain:** If two nodes think they are Master, they both accept writes. Data gets corrupted.
*   **Consensus:** A guarantee that all non-failed nodes agree on the same value.

### Key Algorithms

| Algorithm | Difficulty | Usage |
| :--- | :--- | :--- |
| **Paxos** | Hard (PhD level) | Google Chubby, Spanner (Legacy implementation) |
| **Raft** | Medium (Understandable) | Etcd (Kubernetes), Consul, CockroachDB, Kafka (KRaft) |
| **ZAB** | Medium | ZooKeeper |

**The "Quorum" (Majority):**
To make a decision (commit a write or elect a leader), you need `N/2 + 1` nodes.
*   3 Nodes: Need 2. Tolerance: 1 failure.
*   5 Nodes: Need 3. Tolerance: 2 failures.
*   **Why Odd Numbers?** 4 nodes need 3 to agree. You gain no failure tolerance over 3 nodes (still breaks if 2 fail), but you pay for 4 servers. Always use 3, 5, or 7.

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────┐
│              RAFT STATE MACHINE                           │
│                                                          │
│                  Election Timeout                         │
│   ┌──────────┐ ──────────────────▶ ┌─────────────┐       │
│   │ FOLLOWER │                     │  CANDIDATE  │       │
│   └──────────┘ ◀────────────────── └─────────────┘       │
│        ▲        Discovers Higher        │                │
│        │        Term / Leader           │ Majority       │
│        │                                │ Votes          │
│        │                                ▼                │
│        │    Discovers              ┌──────────┐          │
│        └─── Higher Term ────────── │  LEADER  │          │
│                                    │  (sends  │          │
│                                    │  heart-  │ ◀──┐     │
│                                    │  beats)  │ ───┘     │
│                                    └──────────┘          │
│                                     Send Heartbeats      │
│                                                          │
│   Key: Only ONE Leader per Term.                         │
│   Majority = N/2 + 1 (Quorum)                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Implementation Logic of Raft

**Technical Problem:** How does a node decide to become a leader?
**Logic:** Randomized Timeouts.

### TypeScript Simulation

```typescript
/**
 * RAFT ELECTION SIMULATION
 * 
 * Nodes exist in one of three states:
 * 1. Follower: Passive, responds to requests.
 * 2. Candidate: Active, asking for votes.
 * 3. Leader: Active, sending commands/heartbeats.
 */

type State = 'FOLLOWER' | 'CANDIDATE' | 'LEADER';

class Node {
  id: string;
  state: State = 'FOLLOWER';
  currentTerm: number = 0;
  votedFor: string | null = null;
  votesReceived: number = 0;
  
  clusterSize: number;
  timeoutId: any;

  constructor(id: string, clusterSize: number) {
    this.id = id;
    this.clusterSize = clusterSize;
    this.resetElectionTimer();
  }

  // 1. The Clock Logic
  resetElectionTimer() {
    clearTimeout(this.timeoutId);
    // Random timeout (150-300ms) prevents split votes
    const timeout = Math.floor(Math.random() * 150) + 150;
    
    this.timeoutId = setTimeout(() => {
      this.startElection();
    }, timeout);
  }

  // 2. Start Campaign
  startElection() {
    this.state = 'CANDIDATE';
    this.currentTerm++;
    this.votedFor = this.id;
    this.votesReceived = 1; // Vote for self
    
    console.log(`[${this.id}] Starting election for Term ${this.currentTerm}`);
    
    // Broadcast RequestVote RPC to all other nodes (Mocked)
    cluster.broadcastVoteRequest(this);
    
    this.resetElectionTimer();
  }

  // 3. Handle Vote Request (From another candidate)
  onRequestVote(candidateId: string, candidateTerm: number): boolean {
    if (candidateTerm > this.currentTerm) {
      this.currentTerm = candidateTerm;
      this.state = 'FOLLOWER';
      this.votedFor = null;
    }

    if (candidateTerm === this.currentTerm && 
       (this.votedFor === null || this.votedFor === candidateId)) {
      this.votedFor = candidateId;
      console.log(`[${this.id}] Voted for ${candidateId}`);
      this.resetElectionTimer(); // Reset timer so I don't start election
      return true;
    }
    
    return false;
  }

  // 4. Handle Vote Response
  onVoteReceived() {
    if (this.state !== 'CANDIDATE') return;
    
    this.votesReceived++;
    const majority = Math.floor(this.clusterSize / 2) + 1;
    
    if (this.votesReceived >= majority) {
      this.becomeLeader();
    }
  }

  // 5. Victory!
  becomeLeader() {
    this.state = 'LEADER';
    console.log(`[${this.id}] BECAME LEADER for Term ${this.currentTerm} 👑`);
    
    // Start sending Heartbeats (AppendEntries RPC)
    setInterval(() => {
      if (this.state === 'LEADER') {
        cluster.broadcastHeartbeat(this);
      }
    }, 50);
  }
  
  // 6. Handle Heartbeat (From Leader)
  onHeartbeat(leaderId: string, term: number) {
    if (term >= this.currentTerm) {
      this.currentTerm = term;
      this.state = 'FOLLOWER';
      this.resetElectionTimer(); // I am happy, leader is alive
      // console.log(`[${this.id}] Ack heartbeat from ${leaderId}`);
    }
  }
}

// Mock Cluster
const cluster = {
  nodes: [] as Node[],
  broadcastVoteRequest(candidate: Node) {
    this.nodes.forEach(n => {
      if (n.id !== candidate.id) {
        if (n.onRequestVote(candidate.id, candidate.currentTerm)) {
          candidate.onVoteReceived();
        }
      }
    });
  },
  broadcastHeartbeat(leader: Node) {
    this.nodes.forEach(n => {
        if (n.id !== leader.id) n.onHeartbeat(leader.id, leader.currentTerm);
    });
  }
};

// Initialize
// logic would follow...
```

---

## 5. Scenario B: Split Brain & Fencing

**Real-Life Scenario:** Network partition cuts the cluster 50/50.
*   **US-East:** 2 Nodes.
*   **US-West:** 3 Nodes (Leader is here).

**Case:** US-East cannot reach Leader. They time out and elect a NEW leader.
**Result:** Now we have TWO leaders. One in East, One in West.

**Raft's Solution:**
1.  **Quorum Check:** US-East has 2 nodes. Need 3 for majority. East CANNOT elect a leader. They just keep trying and failing. System pauses in East.
2.  **Safety:** US-West has 3 nodes. They continue working.
3.  **Result:** Availability is sacrificed for Consistency (CP System).

**Fencing Tokens (Database layer):**
If you use a Leader for external resources (like writing to S3), the old leader might still be alive (Zombie Leader).
*   **Solution:** Every write includes the `Term ID` (Epoch).
*   Storage rejects writes with old Term IDs.

---

## 6. Real World Applications 🌍

### 1. ☸️ Kubernetes (Etcd)
Kubernetes stores all cluster state (Pods, Secrets) in Etcd.
Etcd uses **Raft**.
*   If the Etcd leader dies, K8s API stops accepting writes until a new leader is elected (seconds).

### 2. 🐘 Apache ZooKeeper (ZAB)
Used by Kafka (historically) and Hadoop.
Uses ZAB (Zookeeper Atomic Broadcast), very similar to Raft.
Responsible for knowing "Which Kafka Broker is the Controller?".

### 3. 💾 CockroachDB / TiDB
Distributed SQL databases.
They shard data into ranges (ranges of 64MB).
**Each Range** has its OWN Raft group.
*   Range 1: Nodes A, B, C (Leader B)
*   Range 2: Nodes A, D, E (Leader A)
*   This spreads the write load across the cluster!

---

## 7. Complexity Analysis 🧠

### Performance Overhead
*   **Latency:** Every write requires 2 Network Round-trips (Leader -> Followers -> Leader).
*   **Throughput:** Single Leader is a bottleneck. (Solved by Multi-Raft like CockroachDB).

### Read Scaling
*   **Can I read from Followers?**
    *   **NO** (Default Raft): Follower might be stale.
    *   **YES** (Linearizable Reads): Leader must verify it is *still* leader (contact quorum) before telling follower it's safe to return data. (Expensive).

### Interview Tips 💡
1.  **Odd Nodes:** "Why 5 nodes?" "To tolerate 2 failures."
2.  **Difference from 2PC:** "2PC is for transaction across DBs; Raft is for making copies of ONE DB consistent."
3.  **Split Brain:** Always explain how Majority Vote prevents two leaders. "You can't have two majorities."
