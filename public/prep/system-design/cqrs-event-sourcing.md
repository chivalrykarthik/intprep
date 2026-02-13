# CQRS & Event Sourcing 📢

## 1. The "Bank Account" Analogy

**Traditional (CRUD): The Ledger Book**
*   You check your balance: `$100`.
*   The page just says `Balance: $100`.
*   **Problem:** *How* did I get here? Did I earn $100 or earn $1000 and spend $900? You lost the history.

**Event Sourcing: The Transaction Log**
*   You store every action:
    1.  `AccountOpened: $0`
    2.  `Deposited: $50`
    3.  `Deposited: $50`
*   **Current Balance:** Calculated by replaying all events ($0 + $50 + $50 = $100).
*   **Benefit:** Audit trail is built-in. You can "time travel" to see the balance yesterday.

**CQRS (Command Query Responsibility Segregation): The Investment Firm**
*   **Write Side (Traders):** High security, complex validation, slow. They enter trades.
*   **Read Side (Reporting Dashboard):** A super-fast, read-only screen that updates 1 second later. It doesn't query the traders' live system; it queries a simplified copy.

---

## 2. The Core Concept

In most systems, Reads >> Writes (100:1 ratio).
**CRUD (Create, Read, Update, Delete):** Uses the SAME model for both.
*   *Conflict:* Complex validation logic slows down simple reads.
*   *Conflict:* Optimizing DB for reads (indexes) slows down writes.

**CQRS:** Splitting the architecture into two halves.
1.  **Command (Write) Model:** Validates intent, updates state. Optimized for integrity.
2.  **Query (Read) Model:** Returns data DTOs. Optimized for speed (denormalized, cached).

**Event Sourcing:** Often paired with CQRS. Instead of storing "State", you store "Events". The State is just a *projection* of events.

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────┐
│              CQRS + EVENT SOURCING ARCHITECTURE           │
│                                                          │
│                     ┌──────────┐                         │
│   Command:          │  Client  │         Query:          │
│   BookRide ────▶    └──┬───┬──┘    ◀── GetRideStatus    │
│                        │   │                             │
│                ┌───────▼┐ ┌▼────────┐                    │
│                │Command │ │ Query   │                    │
│                │  API   │ │  API    │                    │
│                └───┬────┘ └────▲────┘                    │
│                    │           │                         │
│              ┌─────▼──────┐   │ Fast Fetch              │
│              │  Domain    │   │                         │
│              │  Logic     │   │                         │
│              │ (Validate) │   │                         │
│              └─────┬──────┘   │                         │
│                    │          │                         │
│              ┌─────▼──────┐   │                         │
│              │ Event Store│   │                         │
│              │   (DB)     │   │                         │
│              └─────┬──────┘   │                         │
│                    │          │                         │
│              ┌─────▼──────┐   │                         │
│              │ Event Bus  │   │                         │
│              └─────┬──────┘   │                         │
│                    │          │                         │
│              ┌─────▼──────┐  ┌┴────────────┐            │
│              │ Projector  │──▶ Read DB /   │            │
│              │ Service    │  │ Cache       │            │
│              └────────────┘  └─────────────┘            │
│                                                          │
│   Write Path: Command → Validate → Save Event → Publish │
│   Read Path: Query → Read DB (fast, denormalized)        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: CQRS + Event Sourcing

**Real-Life Scenario:** A social media "Like" system or a Banking Ledger.
**Technical Problem:** High write throughput + need for perfect audit logs + massive read scaling.

### TypeScript Implementation

```typescript
/**
 * EVENT SOURCING CORE
 * 
 * 1. Events are immutable facts.
 * 2. Aggregates are rebuilt by replaying events.
 */

// --- 1. The Events ---
type AccountEvent = 
  | { type: 'AccountOpened'; payload: { initialBalance: number } }
  | { type: 'MoneyDeposited'; payload: { amount: number } }
  | { type: 'MoneyWithdrawn'; payload: { amount: number } };

// --- 2. The Aggregate (Domain Logic) ---
class BankAccount {
  id: string;
  balance: number = 0;
  isClosed: boolean = false;
  
  // Internal state tracking implies complexity usually hidden
  changes: AccountEvent[] = [];

  constructor(id: string) {
    this.id = id;
  }

  // Rehydrate state from history
  loadFromHistory(events: AccountEvent[]) {
    events.forEach(e => this.apply(e, false));
  }

  // Command: Deposit
  deposit(amount: number) {
    if (amount <= 0) throw new Error('Amount must be positive');
    
    // Create Event
    const event: AccountEvent = {
        type: 'MoneyDeposited', 
        payload: { amount } 
    };
    
    // Apply & Track
    this.apply(event, true);
  }

  // Command: Withdraw
  withdraw(amount: number) {
    if (this.balance < amount) throw new Error('Insufficient funds');
    
    const event: AccountEvent = { 
        type: 'MoneyWithdrawn', 
        payload: { amount } 
    };
    this.apply(event, true);
  }

  private apply(event: AccountEvent, isNew: boolean) {
    // State Mutation Logic
    switch(event.type) {
      case 'AccountOpened': this.balance = event.payload.initialBalance; break;
      case 'MoneyDeposited': this.balance += event.payload.amount; break;
      case 'MoneyWithdrawn': this.balance -= event.payload.amount; break;
    }
    if (isNew) this.changes.push(event);
  }
}

// --- 3. The Command Handler (Write Side) ---
class AccountService {
    constructor(private eventStore: EventStore) {}

    async handleDeposit(accountId: string, amount: number) {
        // 1. Load events
        const events = await this.eventStore.getEvents(accountId);
        
        // 2. Rebuild aggregate
        const account = new BankAccount(accountId);
        account.loadFromHistory(events);
        
        // 3. Execute Command
        account.deposit(amount);
        
        // 4. Save new events
        await this.eventStore.saveEvents(accountId, account.changes);
        
        // 5. Publish to Bus (Side Effect)
        // eventBus.publish(account.changes);
    }
}

// --- 4. The Projector (Read Side Builder) ---
// Listens to events and updates a separate fast DB (e.g., Redis/Mongo)
class AccountProjector {
    constructor(private readDb: any) {}

    onMoneyDeposited(event: any) {
        // Simple update: Increment balance column
        // No complex logic here, just "Copy-Paste" state for reading
        this.readDb.update(
            { id: event.accountId }, 
            { $inc: { balance: event.amount } } 
        );
    }
}
```

---

## 5. Scenario B: Materialized Views

**Problem:** How do I query "All users who have withdrawn > $1000 last month"?
**Event Store Answer:** You CANNOT efficiently query an event store. It's a log.
**CQRS Answer:** Create a **Materialized View**.

*   **View 1 (User Balance):** { userId, currentBalance } (Optimized for "Get Balance")
*   **View 2 (Audit):** { userId, date, operation, amount } (Optimized for "Show History")
*   **View 3 (VIP List):** List of IDs where totalDeposits > 10000.

You project the *same* stream of events into *multiple* different databases/tables aimed at specific UI screens.

---

## 6. Real World Applications 🌍

### 1. 📂 Git (Version Control)
Git is the ultimate Event Source.
*   **Events:** Commits (Deltas).
*   **State:** The current file in your working directory (Projection of all previous commits).
*   **Feature:** You can checkout any commit (Time Travel).

### 2. 🎬 Netflix (Playback Position)
When you pause a movie at 45:10.
*   **Write:** Sends `PlaybackStopped { time: 45:10 }` event.
*   **Read:** When you reload the page, it reads the latest projection of your viewing session.

### 3. 🛒 Shopping Carts
*   **Why?** Marketing wants to know *what you removed* from the cart, not just what you bought.
*   CRUD deletes the row. Event Sourcing keeps `ItemAdded` and `ItemRemoved` events.

---

## 7. Complexity Analysis 🧠

### Write Amplification & Snapshots
*   **Snapshotting:** If an account has 1,000,000 events, replaying them to build state takes too long.
*   **Solution:** Save a snapshot every 100 events. `Current State = Snapshot_1000 + Event_1001 + Event_1002`.

### Consistency Lag
The "Read" side is always slightly behind the "Write" side (Eventual Consistency).
*   **UX Challenge:** User clicks "Save", page reloads, list is empty?
*   **Solution:** Optimistic UI (fake the update on client) or "Read-Your-Writes" consistency (force read from primary for 2 seconds after write).

### Interview Tips 💡
1.  **Don't force it:** "CQRS is complex. I would only use handled high-conflict domains or if we need deep audit logs."
2.  **Schema Evolution:** "What if event structure changes? We need 'Upcasters' to transform old events to new format on the fly."
3.  **Gdpr Deletion:** "How to delete PII in Event Sourcing? Crypto-shredding (throw away the encryption key for that user's events)."
