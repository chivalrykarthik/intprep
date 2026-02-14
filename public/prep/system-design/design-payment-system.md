# Design: Payment System 💳

## 1. The "Bank Vault" Analogy

Imagine you're designing a **bank vault system** for a chain of global banks.

**The Problem:**
- A customer in Tokyo wants to pay a merchant in New York — instantly.
- The transaction must **never be lost** (if we charge the card, the merchant must get paid).
- The transaction must **never be duplicated** (charge the card once, not twice).
- Thousands of transactions happen simultaneously — your vault can't have a single lock.
- Regulators (the government) audit every single transaction — you need a complete paper trail.

**What You Do:**
1. **Accept the Request:** The customer swipes their card. You validate the card, check for fraud, and confirm the amount.
2. **Reserve the Money:** You don't transfer money yet — you place a "hold" (authorization). Like putting a sticky note on $50 in the vault: "Reserved for Merchant ABC."
3. **Capture the Payment:** After the merchant confirms the goods/service, you finalize the transfer. The sticky note becomes a permanent ledger entry.
4. **Double-Entry Bookkeeping:** Every debit has a matching credit. Customer's account -$50, Merchant's account +$50. The books always balance.
5. **Reconciliation:** At the end of the day, you compare your records with the bank network's records. Any mismatches trigger an investigation.

**This is a Payment System.** The engineering challenge is doing this with **99.9999% reliability** (six nines — less than 31 seconds of downtime per year) while processing **thousands of transactions per second** across multiple currencies, payment methods, and regulatory jurisdictions.

---

## 2. The Core Concept

A payment system is the **most reliability-critical** system you can design. Unlike social media where a lost post is annoying, a lost payment is **legally and financially catastrophic**.

**Core Principles:**
- **Exactly-once processing:** Charge exactly once. Never double-charge. Never lose a charge.
- **Idempotency:** If a request is retried (network timeout), produce the same result.
- **ACID transactions:** Every database operation is atomic.
- **Auditability:** Every state change is logged immutably.
- **Reconciliation:** Independent verification that everything matches.

**Functional Requirements:**
1. Accept payments via credit card, debit card, bank transfer, and digital wallets
2. Support authorization (hold) → capture (charge) → settlement flow
3. Handle refunds and chargebacks
4. Multi-currency support with real-time exchange rates
5. Fraud detection and prevention
6. Transaction history and receipts

**Non-Functional Requirements:**
1. **Reliability:** 99.9999% for payment processing (six nines)
2. **Consistency:** Strong consistency — never lose or duplicate money
3. **Latency:** Payment authorization < 2 seconds
4. **Throughput:** 10,000 TPS (transactions per second)
5. **Compliance:** PCI-DSS, SOX, GDPR, regional regulations
6. **Security:** End-to-end encryption, tokenization, fraud detection

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│              PAYMENT PROCESSING FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────┐     ┌──────────┐     ┌──────────┐    ┌──────────┐  │
│  │Customer│────▶│  Payment │────▶│  Payment │───▶│  Payment │  │
│  │ (App)  │     │  Gateway │     │  Service │    │ Processor│  │
│  └────────┘     └──────────┘     └────┬─────┘    │(Stripe/  │  │
│                                       │          │ Adyen)   │  │
│                                       │          └────┬─────┘  │
│                                       │               │        │
│              ┌────────────────────────┼───────────────┘        │
│              │                        │                         │
│              ▼                        ▼                         │
│         ┌──────────┐           ┌──────────┐                    │
│         │  Ledger  │           │ Payment  │                    │
│         │   DB     │           │  Events  │                    │
│         │(PostgreSQL│          │  (Kafka) │                    │
│         │ + Audit) │           └────┬─────┘                    │
│         └──────────┘                │                           │
│                                     ▼                           │
│                           ┌──────────────────┐                  │
│                           │  Reconciliation  │                  │
│                           │    Service       │                  │
│                           │  (Daily batch)   │                  │
│                           └──────────────────┘                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │           PAYMENT STATE MACHINE                      │        │
│  │                                                     │        │
│  │  CREATED → AUTHORIZED → CAPTURED → SETTLED          │        │
│  │     │          │            │                        │        │
│  │     ▼          ▼            ▼                        │        │
│  │  FAILED    VOIDED       REFUNDED                    │        │
│  │               │            │                        │        │
│  │               ▼            ▼                        │        │
│  │           EXPIRED    PARTIALLY_REFUNDED             │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Payment Processing with Idempotency

**Real-Life Scenario:** A user clicks "Pay $50" and the network times out. The client retries. We must ensure the user is charged exactly once — not zero times, not twice.

**Technical Problem:** Design an idempotent payment processing service that handles 10,000 TPS with exactly-once semantics.

### TypeScript Implementation

```typescript
/**
 * IDEMPOTENT PAYMENT PROCESSING
 * 
 * The #1 challenge in payment systems: EXACTLY-ONCE processing.
 * 
 * The solution: CLIENT-GENERATED IDEMPOTENCY KEYS.
 * 
 * How it works:
 * 1. Client generates a unique idempotency key (UUID) before the first request
 * 2. Client sends the same key on retries
 * 3. Server checks if the key was already processed
 * 4. If yes → return the cached result (no re-processing)
 * 5. If no → process the payment and cache the result
 * 
 * @timeComplexity O(1) for idempotency check (Redis or DB lookup)
 * @spaceComplexity O(N) where N = unique transactions (one row per transaction)
 */

// ============================================
// PAYMENT DATA MODELS
// ============================================

type PaymentStatus =
  | 'CREATED'           // Initial state
  | 'AUTHORIZED'        // Funds reserved on card
  | 'CAPTURED'          // Funds charged (finalized)
  | 'SETTLED'           // Funds transferred to merchant
  | 'FAILED'            // Payment failed (insufficient funds, fraud, etc.)
  | 'VOIDED'            // Authorization cancelled before capture
  | 'REFUNDED'          // Full refund issued
  | 'PARTIALLY_REFUNDED'; // Partial refund issued

interface Payment {
  id: string;                    // System-generated UUID
  idempotencyKey: string;        // Client-generated UUID (for dedup)
  merchantId: string;
  customerId: string;
  amount: number;                // In smallest currency unit (cents)
  currency: string;              // ISO 4217 (USD, EUR, INR)
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  processorTransactionId?: string; // ID from Stripe/Adyen
  metadata: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  capturedAt?: Date;
  settledAt?: Date;
  failureReason?: string;
}

interface PaymentMethod {
  type: 'CARD' | 'BANK_TRANSFER' | 'WALLET' | 'UPI';
  tokenizedCardId?: string;       // Tokenized (never store raw card numbers!)
  last4?: string;
  brand?: string;                 // VISA, MASTERCARD, AMEX
  expiryMonth?: number;
  expiryYear?: number;
}

// ============================================
// PAYMENT SERVICE — CORE PROCESSING
// ============================================

class PaymentService {
  private db: PaymentDatabase;         // PostgreSQL (strong consistency)
  private processor: PaymentProcessor;  // Stripe, Adyen, etc.
  private eventBus: EventBus;          // Kafka
  private fraudDetector: FraudDetector;
  private ledger: LedgerService;

  /**
   * Process a payment with idempotency guarantee.
   * 
   * The CRITICAL flow:
   * 1. Check idempotency key → return cached result if exists
   * 2. Validate input + fraud check
   * 3. Begin DB transaction
   * 4. Create payment record (status: CREATED)
   * 5. Call payment processor (Stripe/Adyen)
   * 6. Update payment record (status: AUTHORIZED or FAILED)
   * 7. Write to ledger (double-entry bookkeeping)
   * 8. Publish event to Kafka
   * 9. Commit DB transaction
   * 10. Return result
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // ═══════════════════════════════════════════
    // STEP 1: IDEMPOTENCY CHECK
    // ═══════════════════════════════════════════
    const existingPayment = await this.db.findByIdempotencyKey(
      request.idempotencyKey
    );

    if (existingPayment) {
      // Already processed! Return cached result.
      console.log(`Idempotent hit: ${request.idempotencyKey}`);
      return this.toPaymentResult(existingPayment);
    }

    // ═══════════════════════════════════════════
    // STEP 2: VALIDATION + FRAUD CHECK
    // ═══════════════════════════════════════════
    this.validateRequest(request);

    const fraudScore = await this.fraudDetector.evaluate({
      amount: request.amount,
      currency: request.currency,
      customerId: request.customerId,
      merchantId: request.merchantId,
      paymentMethod: request.paymentMethod,
      ipAddress: request.ipAddress,
      deviceFingerprint: request.deviceFingerprint,
    });

    if (fraudScore > 0.9) {
      throw new PaymentError('FRAUD_SUSPECTED', 'Transaction blocked by fraud detection');
    }

    // ═══════════════════════════════════════════
    // STEP 3-9: TRANSACTIONAL PROCESSING
    // ═══════════════════════════════════════════
    return await this.db.withTransaction(async (tx) => {
      // Create payment record
      const payment: Payment = {
        id: generateUUID(),
        idempotencyKey: request.idempotencyKey,
        merchantId: request.merchantId,
        customerId: request.customerId,
        amount: request.amount,
        currency: request.currency,
        status: 'CREATED',
        paymentMethod: request.paymentMethod,
        metadata: request.metadata || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await tx.insert('payments', payment);

      try {
        // Call external payment processor
        const processorResult = await this.processor.authorize({
          amount: request.amount,
          currency: request.currency,
          paymentMethod: request.paymentMethod,
          merchantId: request.merchantId,
          referenceId: payment.id,
        });

        // Update payment status
        payment.status = 'AUTHORIZED';
        payment.processorTransactionId = processorResult.transactionId;
        payment.updatedAt = new Date();
        await tx.update('payments', payment.id, {
          status: payment.status,
          processorTransactionId: payment.processorTransactionId,
          updatedAt: payment.updatedAt,
        });

        // Write to ledger (double-entry)
        await this.ledger.recordEntry(tx, {
          paymentId: payment.id,
          debitAccount: `customer:${request.customerId}:hold`,
          creditAccount: `merchant:${request.merchantId}:pending`,
          amount: request.amount,
          currency: request.currency,
          type: 'AUTHORIZATION',
        });

        // Write event to outbox (Transactional Outbox Pattern)
        await tx.insert('outbox_events', {
          id: generateUUID(),
          aggregateType: 'Payment',
          aggregateId: payment.id,
          eventType: 'PaymentAuthorized',
          payload: JSON.stringify(payment),
          createdAt: new Date(),
          published: false,
        });

        return this.toPaymentResult(payment);
      } catch (error) {
        // Processor failed — mark as failed
        payment.status = 'FAILED';
        payment.failureReason = error.message;
        payment.updatedAt = new Date();
        await tx.update('payments', payment.id, {
          status: 'FAILED',
          failureReason: error.message,
          updatedAt: payment.updatedAt,
        });

        // Still write to outbox (for analytics + monitoring)
        await tx.insert('outbox_events', {
          id: generateUUID(),
          aggregateType: 'Payment',
          aggregateId: payment.id,
          eventType: 'PaymentFailed',
          payload: JSON.stringify({ paymentId: payment.id, reason: error.message }),
          createdAt: new Date(),
          published: false,
        });

        return this.toPaymentResult(payment);
      }
    });
  }

  /**
   * Capture an authorized payment.
   * 
   * Authorization reserves funds. Capture transfers them.
   * 
   * In e-commerce:
   *   1. User places order → AUTHORIZE (reserve $50)
   *   2. Warehouse ships item → CAPTURE (charge $50)
   *   3. If item is out of stock → VOID (release the hold)
   * 
   * This separation lets merchants only charge for what they fulfill.
   */
  async capturePayment(
    paymentId: string, amount?: number
  ): Promise<PaymentResult> {
    return await this.db.withTransaction(async (tx) => {
      const payment = await tx.findById('payments', paymentId);

      if (!payment) throw new PaymentError('NOT_FOUND', 'Payment not found');
      if (payment.status !== 'AUTHORIZED') {
        throw new PaymentError('INVALID_STATE', 
          `Cannot capture payment in ${payment.status} state`);
      }

      const captureAmount = amount || payment.amount;
      if (captureAmount > payment.amount) {
        throw new PaymentError('INVALID_AMOUNT',
          'Capture amount exceeds authorized amount');
      }

      // Call processor to capture
      await this.processor.capture({
        transactionId: payment.processorTransactionId,
        amount: captureAmount,
      });

      // Update payment
      await tx.update('payments', paymentId, {
        status: 'CAPTURED',
        capturedAt: new Date(),
        updatedAt: new Date(),
      });

      // Ledger: Move from pending to settled
      await this.ledger.recordEntry(tx, {
        paymentId,
        debitAccount: `merchant:${payment.merchantId}:pending`,
        creditAccount: `merchant:${payment.merchantId}:balance`,
        amount: captureAmount,
        currency: payment.currency,
        type: 'CAPTURE',
      });

      // Outbox event
      await tx.insert('outbox_events', {
        id: generateUUID(),
        aggregateType: 'Payment',
        aggregateId: paymentId,
        eventType: 'PaymentCaptured',
        payload: JSON.stringify({ paymentId, amount: captureAmount }),
        createdAt: new Date(),
        published: false,
      });

      return this.toPaymentResult({ ...payment, status: 'CAPTURED' });
    });
  }

  private validateRequest(request: PaymentRequest): void {
    if (request.amount <= 0) throw new PaymentError('INVALID_AMOUNT', 'Amount must be positive');
    if (request.amount > 100_000_00) throw new PaymentError('LIMIT_EXCEEDED', 'Single transaction limit: $100,000');
    if (!VALID_CURRENCIES.includes(request.currency)) {
      throw new PaymentError('INVALID_CURRENCY', `Unsupported currency: ${request.currency}`);
    }
  }
}
```

---

## 5. Scenario B: Double-Entry Ledger & Reconciliation

**Real-Life Scenario:** At the end of each day, we need to verify that every cent is accounted for. If our records say we processed $10M today, the bank's records should say the same.

**Technical Problem:** Design a double-entry ledger and automated reconciliation system.

### TypeScript Implementation

```typescript
/**
 * DOUBLE-ENTRY LEDGER
 * 
 * The foundation of ALL financial systems since 1494 (Luca Pacioli).
 * 
 * Rule: Every transaction has TWO entries:
 *   - A DEBIT (money leaving an account)
 *   - A CREDIT (money entering an account)
 *   - DEBIT amount === CREDIT amount (always!)
 * 
 * Why? If someone asks "where did the money go?", you can trace it.
 * The sum of all debits MUST equal the sum of all credits.
 * If they don't, something is wrong. This is called "the books don't balance."
 * 
 * @timeComplexity O(1) per ledger entry
 * @spaceComplexity O(N) where N = total transactions (append-only)
 */

// ============================================
// LEDGER DATA MODEL
// ============================================

interface LedgerEntry {
  id: string;
  paymentId: string;           // Reference to the payment
  debitAccount: string;        // Account being debited (money leaving)
  creditAccount: string;       // Account being credited (money entering)
  amount: number;              // In smallest currency unit (cents)
  currency: string;
  type: LedgerEntryType;       // AUTHORIZATION, CAPTURE, REFUND, etc.
  description: string;
  createdAt: Date;
  // IMMUTABLE — ledger entries are NEVER updated or deleted!
}

type LedgerEntryType =
  | 'AUTHORIZATION'    // Funds reserved
  | 'CAPTURE'          // Funds charged
  | 'REFUND'           // Full or partial refund
  | 'CHARGEBACK'       // Customer disputes with bank
  | 'FEE'             // Platform fee
  | 'SETTLEMENT'       // Payout to merchant
  | 'ADJUSTMENT';      // Manual correction (requires approval)

/**
 * Account Hierarchy:
 * 
 *   customer:{id}:balance     — Customer's available balance
 *   customer:{id}:hold        — Customer's authorized (held) funds
 *   merchant:{id}:pending     — Merchant's pending (authorized) revenue
 *   merchant:{id}:balance     — Merchant's available (captured) revenue
 *   merchant:{id}:payout      — Merchant's paid-out funds
 *   platform:revenue          — Platform fees collected
 *   platform:processing_fees  — Fees paid to Stripe/Adyen
 *   suspense:unreconciled     — Temporary account for mismatches
 */

class LedgerService {
  /**
   * Record a double-entry ledger transaction.
   * Both entries are written in the SAME database transaction
   * to guarantee atomicity.
   */
  async recordEntry(
    tx: Transaction, entry: CreateLedgerEntry
  ): Promise<LedgerEntry> {
    const ledgerEntry: LedgerEntry = {
      id: generateUUID(),
      paymentId: entry.paymentId,
      debitAccount: entry.debitAccount,
      creditAccount: entry.creditAccount,
      amount: entry.amount,
      currency: entry.currency,
      type: entry.type,
      description: this.generateDescription(entry),
      createdAt: new Date(),
    };

    // Write to append-only ledger table
    await tx.insert('ledger_entries', ledgerEntry);

    // Update account balances (materialized view)
    await tx.execute(`
      UPDATE account_balances 
      SET balance = balance - $1, updated_at = NOW() 
      WHERE account_id = $2 AND currency = $3
    `, [entry.amount, entry.debitAccount, entry.currency]);

    await tx.execute(`
      UPDATE account_balances 
      SET balance = balance + $1, updated_at = NOW() 
      WHERE account_id = $2 AND currency = $3
    `, [entry.amount, entry.creditAccount, entry.currency]);

    return ledgerEntry;
  }

  /**
   * Verify that the books balance.
   * Sum of all debits MUST equal sum of all credits.
   * 
   * This runs every hour as a health check.
   */
  async verifyBalance(currency: string): Promise<BalanceVerification> {
    const result = await this.db.query(`
      SELECT 
        SUM(amount) as total_debits,
        (SELECT SUM(amount) FROM ledger_entries WHERE currency = $1) as total_credits
      FROM ledger_entries 
      WHERE currency = $1
    `, [currency]);

    const isBalanced = result.total_debits === result.total_credits;
    
    if (!isBalanced) {
      // CRITICAL ALERT — the books don't balance!
      await this.alerting.critical('LEDGER_IMBALANCED', {
        currency,
        totalDebits: result.total_debits,
        totalCredits: result.total_credits,
        difference: Math.abs(result.total_debits - result.total_credits),
      });
    }

    return { isBalanced, totalDebits: result.total_debits, totalCredits: result.total_credits };
  }
}

// ============================================
// RECONCILIATION ENGINE
// ============================================

/**
 * Reconciliation: Comparing two independent records of the same transactions.
 * 
 * Why?
 *   Our database says we processed $10M today.
 *   Stripe says they processed $9,999,950 for us.
 *   That $50 gap = a failed webhook, a timeout, or a bug.
 *   We need to find and fix every discrepancy.
 * 
 * Types of reconciliation:
 *   1. Internal: Our payment DB vs our ledger DB
 *   2. External: Our records vs Stripe/Adyen settlement reports
 *   3. Bank: Our records vs bank statement
 * 
 * Schedule:
 *   - Internal: Every hour (automated)
 *   - External: Daily (T+1, when settlement files arrive)
 *   - Bank: Weekly (manual review for edge cases)
 */

class ReconciliationService {
  /**
   * Daily reconciliation with payment processor (Stripe).
   * 
   * 1. Download Stripe's settlement file for yesterday
   * 2. Compare every transaction with our records
   * 3. Categorize mismatches
   * 4. Auto-resolve what we can, flag the rest for manual review
   */
  async dailyReconciliation(date: Date): Promise<ReconciliationReport> {
    const report: ReconciliationReport = {
      date,
      totalOurRecords: 0,
      totalProcessorRecords: 0,
      matched: 0,
      mismatches: [],
      autoResolved: 0,
      flaggedForReview: 0,
    };

    // 1. Get our records for the date
    const ourPayments = await this.db.getPaymentsByDate(date);
    report.totalOurRecords = ourPayments.length;

    // 2. Get processor's settlement file
    const processorRecords = await this.processor.getSettlementFile(date);
    report.totalProcessorRecords = processorRecords.length;

    // 3. Index processor records by our reference ID
    const processorIndex = new Map<string, ProcessorRecord>();
    for (const record of processorRecords) {
      processorIndex.set(record.referenceId, record);
    }

    // 4. Compare each of our payments
    for (const payment of ourPayments) {
      const processorRecord = processorIndex.get(payment.id);

      if (!processorRecord) {
        // We have a record, processor doesn't → Missing at processor
        report.mismatches.push({
          type: 'MISSING_AT_PROCESSOR',
          paymentId: payment.id,
          ourAmount: payment.amount,
          processorAmount: null,
          resolution: 'NEEDS_INVESTIGATION',
        });
        report.flaggedForReview++;
        continue;
      }

      // Amount mismatch?
      if (payment.amount !== processorRecord.amount) {
        report.mismatches.push({
          type: 'AMOUNT_MISMATCH',
          paymentId: payment.id,
          ourAmount: payment.amount,
          processorAmount: processorRecord.amount,
          difference: payment.amount - processorRecord.amount,
          resolution: 'NEEDS_INVESTIGATION',
        });
        report.flaggedForReview++;
        continue;
      }

      // Status mismatch? (we say captured, processor says refunded)
      if (this.statusMismatch(payment.status, processorRecord.status)) {
        // Auto-resolve: if processor says refunded and we don't, sync state
        if (processorRecord.status === 'REFUNDED' && payment.status === 'CAPTURED') {
          await this.autoResolveRefund(payment, processorRecord);
          report.autoResolved++;
          continue;
        }

        report.mismatches.push({
          type: 'STATUS_MISMATCH',
          paymentId: payment.id,
          ourStatus: payment.status,
          processorStatus: processorRecord.status,
          resolution: 'NEEDS_INVESTIGATION',
        });
        report.flaggedForReview++;
        continue;
      }

      // Match!
      report.matched++;
      processorIndex.delete(payment.id); // Remove matched records
    }

    // 5. Check for records in processor that we don't have
    for (const [refId, record] of processorIndex) {
      report.mismatches.push({
        type: 'MISSING_IN_OUR_SYSTEM',
        paymentId: refId,
        ourAmount: null,
        processorAmount: record.amount,
        resolution: 'NEEDS_INVESTIGATION',
      });
      report.flaggedForReview++;
    }

    // 6. Save report and send alerts
    await this.saveReport(report);
    if (report.flaggedForReview > 0) {
      await this.alerting.warn('RECONCILIATION_MISMATCHES', {
        date: date.toISOString(),
        mismatches: report.flaggedForReview,
        autoResolved: report.autoResolved,
      });
    }

    return report;
  }
}

// ============================================
// BACK-OF-ENVELOPE ESTIMATION
// ============================================

/**
 * Scale (Stripe-like):
 *   Transactions: 10,000 TPS peak
 *   Daily transactions: ~500M
 *   Daily volume: ~$10B
 * 
 * Storage:
 *   Per transaction: ~2 KB (payment + 2 ledger entries + metadata)
 *   Daily: 500M × 2 KB = 1 TB/day
 *   Yearly: ~365 TB
 *   5 years (retention): ~1.8 PB
 *   
 * Database:
 *   PostgreSQL for payments + ledger (ACID mandatory)
 *   Read replicas for analytics queries
 *   Sharded by merchant_id (most queries are per-merchant)
 * 
 * Availability:
 *   99.9999% = 31 seconds downtime/year
 *   Multi-region active-active with synchronous replication
 *   Every component redundant: 2+ LBs, 3+ app servers, 3+ DB nodes
 * 
 * Compliance:
 *   PCI-DSS Level 1: Never store raw card numbers
 *   Tokenization: Card numbers → tokens (handled by Stripe/Adyen)
 *   Encryption: TLS 1.3 in transit, AES-256 at rest
 *   Audit logs: Immutable, append-only, retained 7+ years
 */
```

---

## 6. Real World Applications 🌍

### 1. 💳 Stripe

**Architecture:**
- Ruby (API layer) + Go (high-performance services) + Scala (data pipeline).
- Custom sharded database layer over PostgreSQL.
- **"Idempotency Keys" pattern** — Stripe pioneered the standard for idempotent APIs (their 2016 blog post became an industry reference).
- Card tokenization: Raw card numbers never reach Stripe's application layer — they're encrypted at the SDK level and only decrypted in an isolated PCI-certified vault.
- Multi-region with failover: If US-EAST goes down, traffic routes to US-WEST within seconds.

**Scale:** Processes hundreds of billions of dollars per year, handles 10K+ TPS.

### 2. 🏦 Razorpay (India)

**Architecture:**
- Handles UPI (India's instant payment system) which processes 10+ billion transactions/month.
- API Gateway → Payment Orchestrator → Multi-PSP routing (routes to cheapest/fastest processor).
- Real-time fraud detection using ML models.
- Handles 10,000+ TPS during peak (e.g., IPL cricket match ticket sales).

### 3. 💰 Square / Block

**Architecture:**
- Hardware (card readers) + Software (POS system) + Network (payment processing).
- Offline-first: Card readers can accept payments without internet and sync later.
- Real-time risk scoring: Every transaction scored for fraud in < 100ms.
- Settlement: Merchants receive funds next business day (T+1).

### 4. 🏪 Amazon Pay

**Architecture:**
- Handles Black Friday traffic: 100x normal load.
- Two-phase payment: Authorize at checkout → Capture at shipment.
- Support for multi-seller orders: One customer payment split across 5 different sellers with different commission rates.
- Refund engine: Partial refunds, store credits, promotional balance — each with different ledger entries.

---

## 7. Complexity Analysis 🧠

### System Reliability Requirements

| Component | Availability Target | Justification |
| :--- | :--- | :--- |
| **Payment API** | 99.9999% (six nines) | Direct revenue impact |
| **Ledger DB** | 99.9999% | Legal/financial compliance |
| **Fraud Detection** | 99.99% | Can degrade gracefully (allow, then review) |
| **Reconciliation** | 99.9% | Batch process, can retry |
| **Settlement** | 99.99% | Daily batch, small window |
| **Reporting** | 99.9% | Eventually consistent is OK |

### Key Trade-offs

| Decision | Option A | Option B | Recommended |
| :--- | :--- | :--- | :--- |
| **Database** | PostgreSQL (ACID) | Cassandra (scale) | PostgreSQL — ACID is non-negotiable for payments |
| **Processor** | Single (Stripe) | Multi-PSP | Multi-PSP for failover + cost optimization |
| **Idempotency** | Server-generated key | Client-generated key | **Client-generated** — client can safely retry |
| **Event publishing** | Direct Kafka write | Transactional Outbox | **Outbox** — atomic with DB write |
| **Replication** | Async (fast) | Sync (slow, safe) | **Sync** — cannot lose payment records |
| **Currency** | Float (easy) | Integer cents (safe) | **Integer cents** — floats have rounding errors |

### Interview Tips 💡

1. **Start with the state machine:** Draw the payment states first (Created → Authorized → Captured → Settled → Refunded). Every design decision flows from understanding the lifecycle. "A payment is a state machine, not a single action."
2. **Idempotency is the #1 topic:** "Client generates a UUID before the first request and sends it on every retry. Server checks if this key was already processed. This guarantees exactly-once semantics even with network failures."
3. **Never use floats for money:** "We store amounts in the smallest currency unit (cents for USD, paise for INR) as integers. `$19.99` is stored as `1999`. Floating-point arithmetic has rounding errors — 0.1 + 0.2 !== 0.3 in JavaScript."
4. **Double-entry bookkeeping is mandatory:** "Every debit has a matching credit. The sum of all debits equals the sum of all credits. If they don't balance, we have a bug. This is the foundation of financial auditing since the 15th century."
5. **Reconciliation catches everything else:** "Even with idempotency and ACID, things go wrong — network partitions, processor bugs, race conditions. Daily reconciliation compares our records with the processor's settlement files. Any mismatch triggers investigation."
6. **Transactional Outbox for events:** "We can't atomically write to PostgreSQL AND publish to Kafka. Solution: write the event to an 'outbox' table in the same DB transaction. A background worker (or CDC) publishes to Kafka. This prevents the 'payment saved but event lost' failure."
7. **PCI compliance shapes the architecture:** "We never store raw card numbers. Tokenization happens at the SDK level. Our servers only see tokens. This dramatically reduces PCI scope — instead of certifying 100 servers, we certify 3 (the token vault)."
