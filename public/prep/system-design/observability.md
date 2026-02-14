# Observability 🔭

## 1. The "Hospital Monitoring" Analogy

Imagine a patient in the ICU. Three systems keep them alive:

**Heart Monitor (Metrics):** Continuously tracks heart rate, blood pressure, oxygen — displayed as **real-time numbers and graphs**. A nurse glances at the dashboard and sees "BP is 140/90, trending up." She doesn't need to read the patient's chart — the numbers tell the story.

**Medical Chart (Logs):** Every action is recorded in writing — "10:42 AM: Administered 5mg Morphine. 10:55 AM: Patient reported pain level 4/10." If something goes wrong, doctors review the chart to understand **what happened and when**.

**Patient Journey Map (Traces):** The patient came in via ambulance → ER triage → X-Ray → Surgery → ICU. If recovery is slow, doctors trace the entire journey: "The X-Ray took 3 hours — was there a bottleneck in radiology?" This reveals **where time was spent** across the entire flow.

**This is Observability.** In a distributed system with 100+ microservices, you can't SSH into every server and read logs. You need:
- **Metrics** → "What is happening?" (numbers over time)
- **Logs** → "Why did it happen?" (detailed event records)
- **Traces** → "Where did it happen?" (request flow across services)

These are the **Three Pillars of Observability.** Without all three, debugging production issues is like diagnosing a patient blindfolded.

---

## 2. The Core Concept

Observability is not just "monitoring." Monitoring tells you *when* something is broken. Observability tells you *why* it's broken — even for failures you didn't anticipate.

**Monitoring:** "The CPU is at 95%." → You knew to watch CPU.
**Observability:** "Requests from users in Brazil are 10x slower because our payment processor's São Paulo endpoint is timing out, causing retry storms that spike CPU." → You didn't know to watch for this specific scenario.

| Pillar | What It Answers | Granularity | Volume | Tool Examples |
| :--- | :--- | :--- | :--- | :--- |
| **Metrics** | "How much? How fast? How often?" | Aggregated numbers | Low (counters & gauges) | Prometheus, Datadog, CloudWatch |
| **Logs** | "What happened? In what order?" | Individual events | High (every event logged) | ELK Stack, Splunk, Loki |
| **Traces** | "Where did the request go? What was slow?" | Per-request journey | Medium (sampled) | Jaeger, Zipkin, Datadog APT |

### The OpenTelemetry Standard

**OpenTelemetry (OTel)** is the industry standard for collecting all three pillars. It's vendor-neutral — you instrument once, export to any backend (Datadog, Grafana, New Relic, etc.).

```
Your App → OTel SDK → OTel Collector → Backend (Datadog, Grafana, etc.)
                          │
                          ├─ Metrics  → Prometheus/Datadog
                          ├─ Logs     → Loki/Elasticsearch
                          └─ Traces   → Jaeger/Tempo
```

**Why OTel matters in interviews:** "We instrument with OpenTelemetry so we're not locked into any vendor. If we switch from Datadog to Grafana Cloud, we change the exporter config — zero code changes."

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                  THE THREE PILLARS OF OBSERVABILITY              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  METRICS (The Dashboard)                                        │
│  ═══════════════════════                                        │
│  ┌───────────────────────────────────────────────────┐          │
│  │ Request Rate ████████████░░░░░░  1,200 req/sec    │          │
│  │ Error Rate   ██░░░░░░░░░░░░░░░░    2.1% (↑ 0.5%) │  ⚠️     │
│  │ P99 Latency  ██████░░░░░░░░░░░░  450ms  (↑ 80ms) │  ⚠️     │
│  │ CPU Usage    ████████████████░░   82%              │          │
│  │ Memory       ███████████░░░░░░░   65%              │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                 │
│  LOGS (The Story)                                               │
│  ════════════════                                               │
│  ┌───────────────────────────────────────────────────┐          │
│  │ 14:32:01.123 INFO  [order-svc] Order #4521 created│          │
│  │ 14:32:01.456 INFO  [payment-svc] Charging $49.99  │          │
│  │ 14:32:02.789 ERROR [payment-svc] Stripe timeout   │ ← Root  │
│  │              after 5000ms. Retrying (1/3)...      │   Cause  │
│  │ 14:32:08.012 ERROR [payment-svc] Stripe timeout   │          │
│  │              after 5000ms. Retrying (2/3)...      │          │
│  │ 14:32:13.234 ERROR [payment-svc] All retries      │          │
│  │              exhausted. Payment FAILED.            │          │
│  │ 14:32:13.235 ERROR [order-svc] Order #4521 failed │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                 │
│  TRACES (The Map)                                               │
│  ════════════════                                               │
│  ┌───────────────────────────────────────────────────┐          │
│  │ Request: POST /api/orders (trace_id: abc123)      │          │
│  │                                                   │          │
│  │ ├─ API Gateway          2ms   ██                  │          │
│  │ ├─ Auth Service        15ms   ████                │          │
│  │ ├─ Order Service       25ms   ██████              │          │
│  │ │  ├─ Validate         5ms    ██                  │          │
│  │ │  ├─ DB Write        20ms    █████               │          │
│  │ ├─ Payment Service  15003ms   ████████████████ ❌  │ ← Slow! │
│  │ │  ├─ Stripe API    15000ms   ████████████████    │          │
│  │ ├─ Notification Svc    --     (not reached)       │          │
│  │                                                   │          │
│  │ Total: 15,045ms (SLA: 2,000ms) ❌ BREACHED        │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                 │
│  💡 All three pillars are CORRELATED by trace_id: abc123        │
│     Metrics spotted the spike → Traces found the slow span →   │
│     Logs revealed the Stripe timeout error message              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Implementing the Three Pillars with OpenTelemetry

**Real-Life Scenario:** Your e-commerce platform has 30 microservices. Users report "checkout is slow sometimes." You need to find out which service, which endpoint, and under what conditions.

**Technical Problem:** Instrument services with metrics, structured logs, and distributed traces — all correlated by a shared trace ID.

### TypeScript Implementation

```typescript
/**
 * PILLAR 1: METRICS
 * 
 * Metrics are AGGREGATED NUMBERS over time.
 * They tell you "what" is happening, not "why."
 * 
 * Types of metrics:
 *   Counter   - Only goes up (total requests, total errors)
 *   Gauge     - Goes up AND down (CPU usage, active connections, queue depth)
 *   Histogram - Distribution of values (request latency percentiles)
 *   Summary   - Similar to histogram but pre-calculates percentiles
 * 
 * The RED Method (for request-driven services):
 *   Rate    - Requests per second
 *   Errors  - Failed requests per second
 *   Duration - Latency distribution (p50, p95, p99)
 * 
 * The USE Method (for resource-driven systems):
 *   Utilization - % of resource capacity used
 *   Saturation  - Queue depth / backlog
 *   Errors      - Resource-level errors
 * 
 * @timeComplexity O(1) per metric update (counter increment)
 * @spaceComplexity O(M × L) where M = metrics, L = label cardinality
 */

import { metrics } from '@opentelemetry/api';

// Create a meter (metrics factory)
const meter = metrics.getMeter('order-service', '1.0.0');

// COUNTER: Total requests (only goes up)
const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total number of HTTP requests received',
});

// HISTOGRAM: Request latency distribution
const latencyHistogram = meter.createHistogram('http_request_duration_ms', {
  description: 'HTTP request latency in milliseconds',
  unit: 'ms',
  // Bucket boundaries for latency distribution
  // Allows calculating p50, p95, p99
  advice: { explicitBucketBoundaries: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000] },
});

// GAUGE: Active connections (goes up and down)
const activeConnections = meter.createUpDownCounter('active_connections', {
  description: 'Number of currently active connections',
});

// Usage in middleware
function metricsMiddleware(req: Request, res: Response, next: Function) {
  const startTime = Date.now();
  activeConnections.add(1);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const labels = {
      method: req.method,
      path: req.route?.path || req.path,
      status: String(res.statusCode),
    };

    // Record metrics
    requestCounter.add(1, labels);
    latencyHistogram.record(duration, labels);
    activeConnections.add(-1);
  });

  next();
}

/**
 * ⚠️ CARDINALITY WARNING:
 * Labels create unique time series. Bad labels = metric explosion.
 * 
 * ❌ BAD:  { userId: "user_123", path: "/api/users/123" }
 *    → Millions of unique time series = Prometheus dies
 * 
 * ✅ GOOD: { method: "GET", path: "/api/users/:id", status: "200" }
 *    → ~100 unique combinations = manageable
 * 
 * Rule: Keep label cardinality < 1,000 per metric.
 */


/**
 * PILLAR 2: STRUCTURED LOGGING
 * 
 * Logs are DISCRETE EVENTS with context.
 * They tell you "why" something happened.
 * 
 * Rules for production logging:
 *   1. Use structured JSON (not plain text) — machines parse it
 *   2. Include trace_id in every log — correlate with traces
 *   3. Use severity levels correctly (ERROR, WARN, INFO, DEBUG)
 *   4. Never log PII (passwords, credit cards, SSNs)
 *   5. Include context (userId, orderId, etc.) — not just messages
 * 
 * @spaceComplexity ~1 KB per log entry × volume = significant storage cost
 */

import { context, trace } from '@opentelemetry/api';

interface StructuredLog {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  message: string;
  traceId?: string;        // Links to distributed trace
  spanId?: string;         // Links to specific span in trace
  [key: string]: unknown;  // Additional context fields
}

class Logger {
  private service: string;

  constructor(service: string) {
    this.service = service;
  }

  /**
   * Log with automatic trace context injection.
   * Every log entry gets the current trace_id and span_id,
   * enabling correlation between logs and traces.
   */
  log(level: StructuredLog['level'], message: string, extra: Record<string, unknown> = {}): void {
    // Extract trace context from OpenTelemetry
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();

    const entry: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
      ...extra,
    };

    // Output as JSON (ingested by Fluentd/Filebeat → Elasticsearch/Loki)
    console.log(JSON.stringify(entry));
  }

  error(message: string, error?: Error, extra: Record<string, unknown> = {}): void {
    this.log('ERROR', message, {
      ...extra,
      errorName: error?.name,
      errorMessage: error?.message,
      stackTrace: error?.stack,
    });
  }

  info(message: string, extra: Record<string, unknown> = {}): void {
    this.log('INFO', message, extra);
  }

  warn(message: string, extra: Record<string, unknown> = {}): void {
    this.log('WARN', message, extra);
  }
}

// Usage:
const logger = new Logger('payment-service');

// ✅ GOOD: Structured, contextualized, trace-correlated
logger.info('Payment initiated', {
  orderId: 'order_4521',
  amount: 4999,
  currency: 'USD',
  paymentMethod: 'CARD',
  merchantId: 'merchant_abc',
});

// ❌ BAD: Unstructured, no context, impossible to search
// console.log("Payment started for order 4521, amount $49.99");


/**
 * PILLAR 3: DISTRIBUTED TRACING
 * 
 * Traces follow a SINGLE REQUEST as it flows through multiple services.
 * They tell you "where" the bottleneck is.
 * 
 * Concepts:
 *   Trace    - The entire journey of one request (identified by trace_id)
 *   Span     - One unit of work within a trace (identified by span_id)
 *   Parent   - Spans have parent-child relationships (call graph)
 *   Context  - Trace/span IDs propagated via HTTP headers (W3C Traceparent)
 * 
 * Example trace for POST /api/checkout:
 * 
 *   Trace: abc123
 *   ├── Span: API Gateway (15ms)
 *   │   ├── Span: Auth Service (10ms)
 *   │   └── Span: Order Service (2500ms)
 *   │       ├── Span: Validate Input (5ms)
 *   │       ├── Span: DB Insert (20ms)
 *   │       └── Span: Payment Service (2400ms) ← BOTTLENECK
 *   │           ├── Span: Fraud Check (50ms)
 *   │           └── Span: Stripe API Call (2300ms) ← ROOT CAUSE
 *   └── Span: Notification Service (100ms)
 * 
 * Without tracing, you know "checkout is slow."
 * With tracing, you know "Stripe's API is slow, specifically for
 * cards from Brazilian issuers, after 2 PM UTC."
 * 
 * @timeComplexity O(1) per span creation
 * @spaceComplexity O(S) per trace where S = number of spans
 */

import { trace as otelTrace, SpanKind, SpanStatusCode } from '@opentelemetry/api';

const tracer = otelTrace.getTracer('payment-service', '1.0.0');

class PaymentService {
  async processPayment(orderId: string, amount: number): Promise<PaymentResult> {
    // Create a span for this operation
    return tracer.startActiveSpan('processPayment', {
      kind: SpanKind.INTERNAL,
      attributes: {
        'order.id': orderId,
        'payment.amount': amount,
        'payment.currency': 'USD',
      },
    }, async (span) => {
      try {
        // Child span: Fraud check
        const fraudResult = await tracer.startActiveSpan('fraudCheck', async (fraudSpan) => {
          const result = await this.fraudDetector.check(orderId, amount);
          fraudSpan.setAttribute('fraud.score', result.score);
          fraudSpan.setAttribute('fraud.decision', result.decision);
          fraudSpan.end();
          return result;
        });

        if (fraudResult.decision === 'BLOCK') {
          span.setStatus({ code: SpanStatusCode.ERROR, message: 'Blocked by fraud detection' });
          span.end();
          return { success: false, reason: 'FRAUD_BLOCKED' };
        }

        // Child span: External payment processor call
        const chargeResult = await tracer.startActiveSpan('stripeCharge', {
          kind: SpanKind.CLIENT, // External call
          attributes: {
            'http.method': 'POST',
            'http.url': 'https://api.stripe.com/v1/charges',
            'peer.service': 'stripe-api',
          },
        }, async (stripeSpan) => {
          try {
            const result = await this.stripe.charge(amount, orderId);
            stripeSpan.setAttribute('stripe.charge_id', result.chargeId);
            stripeSpan.setStatus({ code: SpanStatusCode.OK });
            return result;
          } catch (error) {
            stripeSpan.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
            stripeSpan.recordException(error);
            throw error;
          } finally {
            stripeSpan.end();
          }
        });

        span.setStatus({ code: SpanStatusCode.OK });
        return { success: true, chargeId: chargeResult.chargeId };
      } catch (error) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.recordException(error);
        return { success: false, reason: error.message };
      } finally {
        span.end();
      }
    });
  }
}

/**
 * TRACE CONTEXT PROPAGATION
 * 
 * For traces to work across services, trace_id must be passed
 * in HTTP headers using the W3C Traceparent standard:
 * 
 *   traceparent: 00-abc123def456-span789-01
 *                    ^^^^^^^^^^^^ ^^^^^^^^
 *                    trace_id     span_id
 * 
 * OpenTelemetry auto-injects this header into outgoing HTTP requests
 * and extracts it from incoming requests. You don't need to do this manually.
 * 
 * Service A (trace_id=abc123) → HTTP → Service B (trace_id=abc123)
 *                                         → HTTP → Service C (trace_id=abc123)
 * 
 * All three services share the SAME trace_id =  single unified trace.
 */
```

---

## 5. Scenario B: Building an Alerting & SLO Framework

**Real-Life Scenario:** Your platform has 99.95% uptime SLA with customers. You need to detect SLA violations before customers notice and page the right engineer at 3 AM.

**Technical Problem:** Design an alerting system based on SLOs (Service Level Objectives) that reduces alert fatigue while catching real issues.

### TypeScript Implementation

```typescript
/**
 * SLO-BASED ALERTING
 * 
 * The traditional approach: Alert on every metric threshold.
 * Result: 500 alerts/day. Engineers mute their pagers. Real issues are missed.
 * 
 * The SLO approach: Alert when the ERROR BUDGET is being consumed too fast.
 * 
 * Key Definitions:
 *   SLI (Service Level Indicator) - The metric you measure
 *     e.g., "% of requests completing in < 500ms"
 *   
 *   SLO (Service Level Objective) - The target for that metric
 *     e.g., "99.9% of requests complete in < 500ms over 30 days"
 *   
 *   SLA (Service Level Agreement) - The contract with customers (legal)
 *     e.g., "99.95% uptime or we refund 10% of monthly bill"
 *   
 *   Error Budget - How much failure you can tolerate
 *     e.g., 99.9% SLO over 30 days = 0.1% error budget = 43.2 minutes of downtime
 * 
 * Alert Philosophy:
 *   - Page (wake someone up) ONLY when error budget burn rate is dangerous
 *   - Ticket (next business day) for slower burn rates
 *   - Dashboard (informational) for everything else
 * 
 * @timeComplexity O(1) per alert evaluation
 * @spaceComplexity O(W) where W = window of metric data retained
 */

interface SLODefinition {
  name: string;
  sli: string;                // What we measure
  target: number;             // e.g., 0.999 (99.9%)
  window: '30d' | '7d';      // Rolling window
  errorBudget: number;        // Derived: 1 - target (e.g., 0.001)
  alertRules: AlertRule[];
}

interface AlertRule {
  name: string;
  burnRate: number;           // How fast error budget is being consumed
  lookbackWindow: string;     // e.g., "1h", "6h"
  severity: 'PAGE' | 'TICKET' | 'WARN';
}

// Example SLO definitions for an e-commerce platform
const sloDefinitions: SLODefinition[] = [
  {
    name: 'Checkout Availability',
    sli: 'checkout_success_rate',
    target: 0.999,            // 99.9%
    window: '30d',
    errorBudget: 0.001,       // 0.1% = 43.2 min/month
    alertRules: [
      {
        // 14.4× burn rate over 1 hour → budget exhausted in 2 days
        // Action: PAGE (wake someone up immediately)
        name: 'checkout_fast_burn',
        burnRate: 14.4,
        lookbackWindow: '1h',
        severity: 'PAGE',
      },
      {
        // 3× burn rate over 6 hours → budget exhausted in 10 days
        // Action: TICKET (investigate next business day)
        name: 'checkout_slow_burn',
        burnRate: 3,
        lookbackWindow: '6h',
        severity: 'TICKET',
      },
    ],
  },
  {
    name: 'API Latency',
    sli: 'api_latency_p99_under_500ms',
    target: 0.995,            // 99.5%
    window: '30d',
    errorBudget: 0.005,       // 0.5% = 3.6 hours/month
    alertRules: [
      {
        name: 'latency_fast_burn',
        burnRate: 14.4,
        lookbackWindow: '1h',
        severity: 'PAGE',
      },
      {
        name: 'latency_slow_burn',
        burnRate: 6,
        lookbackWindow: '3h',
        severity: 'TICKET',
      },
    ],
  },
];

/**
 * Error Budget Tracker
 * 
 * Calculates how much error budget remains and the current burn rate.
 */
class ErrorBudgetTracker {
  /**
   * Calculate remaining error budget for an SLO.
   * 
   * Example:
   *   SLO: 99.9% over 30 days
   *   Error budget: 43.2 minutes
   *   Errors so far this month: 30 minutes
   *   Remaining: 13.2 minutes (30.5% left)
   */
  async getRemainingBudget(slo: SLODefinition): Promise<BudgetStatus> {
    const windowDays = slo.window === '30d' ? 30 : 7;
    const totalMinutes = windowDays * 24 * 60;
    const budgetMinutes = totalMinutes * slo.errorBudget;

    // Query actual error minutes from metrics store
    const errorMinutes = await this.metricsStore.query(
      `sum(rate(${slo.sli}_errors[${slo.window}])) * ${totalMinutes}`
    );

    const remainingMinutes = budgetMinutes - errorMinutes;
    const remainingPercent = remainingMinutes / budgetMinutes;

    return {
      sloName: slo.name,
      budgetTotal: budgetMinutes,
      budgetConsumed: errorMinutes,
      budgetRemaining: remainingMinutes,
      budgetRemainingPercent: remainingPercent,
      status: remainingPercent > 0.5 ? 'HEALTHY' :
              remainingPercent > 0.2 ? 'WARNING' :
              remainingPercent > 0   ? 'CRITICAL' : 'EXHAUSTED',
    };
  }

  /**
   * Check if any alert rules are triggered.
   * Burn rate = (error rate in window) / (max tolerable error rate)
   * 
   * If burn rate > threshold → the SLO will be breached before month end.
   */
  async evaluateAlerts(slo: SLODefinition): Promise<TriggeredAlert[]> {
    const triggered: TriggeredAlert[] = [];

    for (const rule of slo.alertRules) {
      const currentBurnRate = await this.calculateBurnRate(
        slo.sli, rule.lookbackWindow, slo.errorBudget
      );

      if (currentBurnRate >= rule.burnRate) {
        triggered.push({
          ruleName: rule.name,
          severity: rule.severity,
          currentBurnRate,
          threshold: rule.burnRate,
          message: `${slo.name}: Error budget burning ${currentBurnRate}x normal rate ` +
                   `(threshold: ${rule.burnRate}x). ` +
                   `Budget will be exhausted in ${this.timeToExhaustion(currentBurnRate, slo)} hours.`,
        });
      }
    }

    return triggered;
  }
}

/**
 * THE OBSERVABILITY STACK — PUTTING IT ALL TOGETHER
 * 
 * Production Architecture:
 * 
 * ┌──────────────┐     ┌──────────────────────────────────────────┐
 * │  Your App    │     │          OTel Collector                  │
 * │  (with OTel  │────▶│  Receives → Processes → Exports          │
 * │   SDK)       │     │                                          │
 * └──────────────┘     └────┬──────────┬──────────┬───────────────┘
 *                           │          │          │
 *                      Metrics     Traces      Logs
 *                           │          │          │
 *                           ▼          ▼          ▼
 *                    ┌──────────┐ ┌────────┐ ┌────────────┐
 *                    │Prometheus│ │ Jaeger │ │   Loki /   │
 *                    │  / Mimir │ │/ Tempo │ │Elasticsearch│
 *                    └────┬─────┘ └───┬────┘ └─────┬──────┘
 *                         │           │            │
 *                         └───────────┼────────────┘
 *                                     ▼
 *                              ┌──────────────┐
 *                              │   Grafana    │
 *                              │ (Dashboards  │
 *                              │  + Alerts)   │
 *                              └──────────────┘
 * 
 * Vendor Comparison:
 * 
 *   Open-Source Stack (Grafana LGTM):
 *     Loki (Logs) + Grafana (Dashboards) + Tempo (Traces) + Mimir (Metrics)
 *     Cost: Infrastructure only. Full control. More operational overhead.
 *   
 *   Commercial (Datadog):
 *     All-in-one: Metrics + Logs + Traces + APM + Synthetics + RUM
 *     Cost: $15-30/host/month. Easy. Less operational overhead.
 *   
 *   AWS Native:
 *     CloudWatch (Metrics + Logs) + X-Ray (Traces)
 *     Cost: Pay-per-use. Good for AWS-native workloads.
 */
```

---

## 6. Real World Applications 🌍

### 1. 📊 Datadog

**Architecture:**
- All-in-one observability platform (Metrics, Logs, Traces, APM, Synthetics).
- **Datadog Agent** runs on every host, collects metrics/traces, ships to Datadog SaaS.
- **Automatic instrumentation** — add the agent and it traces HTTP, DB calls, and cache operations without code changes.
- **Service Map** — auto-generated dependency graph from trace data showing latency between services.
- **Watchdog AI** — ML-based anomaly detection that automatically surfaces unusual behavior.

**Scale:** 27,000+ customers monitoring millions of hosts, ingesting trillions of data points per day.

### 2. 📈 Grafana Stack (LGTM)

**Architecture:**
- **Loki** (Logs) — Log aggregation inspired by Prometheus. Indexes labels, not full text. Cheap storage.
- **Grafana** (Dashboards) — Universal visualization. Connects to 100+ data sources.
- **Tempo** (Traces) — Distributed tracing backend. Uses object storage (S3) for cost-effective storage.
- **Mimir** (Metrics) — Horizontally scalable, long-term Prometheus storage.
- **All open-source** — No vendor lock-in. Can self-host or use Grafana Cloud.

**Why teams choose it:** "We run our own Grafana stack because we process 500M metrics/day. At Datadog pricing, that would be $200K/month. Self-hosted Grafana costs $15K/month in infrastructure."

### 3. 🔭 OpenTelemetry (OTel)

**Architecture:**
- **CNCF project** (Cloud Native Computing Foundation) — same foundation as Kubernetes.
- **Vendor-neutral** — instrument once, export to any backend.
- **OTel SDK** — Libraries for every language (Go, Java, Python, Node.js, .NET, etc.).
- **OTel Collector** — A standalone binary that receives, processes, and exports telemetry data. Supports batching, retry, compression, and sampling.
- **Auto-instrumentation** — Monkey-patches HTTP clients, DB drivers, and gRPC to emit traces/metrics without code changes.

**Industry adoption:** Used by eBay, GitHub, Shopify, Skyscanner, and thousands more. Becoming the de facto standard for instrumentation.

### 4. 🏢 Production Incident Workflow

A real-world debugging flow using all three pillars:

1. **PagerDuty alert fires:** "Checkout error rate SLO burning at 14x normal rate"
2. **Grafana dashboard:** P99 latency spiked from 200ms to 4,500ms at 14:32 UTC

3. **Traces (Tempo/Jaeger):** Filter traces with latency > 2000ms. Waterfall shows Payment Service → Stripe API call is 4,200ms (normally 200ms).
4. **Logs (Loki):** Filter by `traceId=abc123` → "Stripe API timeout after 5000ms. Error: CONN_TIMEOUT to api.stripe.com:443"
5. **Root cause:** Stripe had a regional outage in us-east-1. Our retry logic amplified the impact (retry storm).
6. **Fix:** Enable circuit breaker for Stripe calls. Fail fast after 2 retries. Fall back to backup payment processor.

---

## 7. Complexity Analysis 🧠

### Cost of Observability

```
Observability is NOT free. At scale, it can be one of your biggest costs.

Metrics:
  1 metric × 10 labels × 15-second scrape = 5,760 data points/day
  10,000 metrics × 10 label combos = 576 million data points/day
  Prometheus retention: 15 days local, long-term in Mimir/Thanos

Logs:
  1 request = ~1 KB of logs (across all services)
  100M requests/day = 100 GB/day of logs = 3 TB/month
  Elasticsearch: ~$0.10/GB ingested + storage
  Cost: ~$300/month for log storage alone

Traces (with sampling):
  100M requests/day, 1% sampling = 1M traces/day
  Average trace: 20 spans × 500 bytes = 10 KB
  1M × 10 KB = 10 GB/day = 300 GB/month
  At 100% sampling: 30 TB/month (prohibitively expensive!)

Key optimization: SAMPLING
  Head-based:  Decide at trace start (1% of all traces)
  Tail-based:  Keep ALL traces, but only store interesting ones
               (errors, slow, specific user IDs)
  Best: Tail-based → captures all failures + representative samples
```

### Pillar Comparison Matrix

| Aspect | Metrics | Logs | Traces |
| :--- | :--- | :--- | :--- |
| **Data type** | Numbers (aggregated) | Text (events) | Spans (call graph) |
| **Volume** | Low | High | Medium (sampled) |
| **Cost** | Lowest | Highest | Medium |
| **Query speed** | Fast (pre-aggregated) | Slow (full-text search) | Medium (by trace ID) |
| **Use case** | Dashboards, alerts | Debugging, audit | Performance analysis |
| **Retention** | 1-2 years | 30-90 days | 7-30 days |
| **Correlation** | By labels/tags | By trace_id | By trace_id |

### Interview Tips 💡

1. **Start with the three pillars:** "Observability has three pillars: Metrics (aggregated numbers for dashboards and alerts), Logs (discrete events for debugging), and Traces (request journey across services for performance analysis). All three are correlated by trace_id."
2. **Explain SLOs, not thresholds:** "I wouldn't alert on 'CPU > 80%' — that causes alert fatigue. Instead, I'd define SLOs like '99.9% of checkouts complete in < 2 seconds' and alert on error budget burn rate. This focuses engineering effort on what actually impacts users."
3. **OpenTelemetry is the standard:** "We instrument with OpenTelemetry because it's vendor-neutral. If we need to switch from Datadog to Grafana Cloud, we change the exporter configuration — zero code changes. OTel is backed by CNCF and adopted by eBay, GitHub, and Shopify."
4. **Sampling is essential for traces:** "Storing 100% of traces is prohibitively expensive at scale. We use tail-based sampling — collect all traces but only store interesting ones (errors, slow requests, specific users). This gives us full visibility into failures while controlling costs."
5. **Structured logging, not printf:** "Every log entry is JSON with trace_id, service name, and business context (orderId, userId). This enables machine parsing, correlation with traces, and fast filtering in Elasticsearch/Loki."
6. **Label cardinality kills metrics systems:** "Adding `userId` as a metric label creates millions of unique time series. Prometheus will OOM. Keep label cardinality under 1,000 per metric. Use logs for high-cardinality debugging instead."
7. **Observability is a cost center — optimize it:** "At 100M requests/day, full logging costs ~$300/month for storage alone. Traces at 100% sampling = 30 TB/month. Use log levels (only ERROR in prod), trace sampling (1% head + tail-based for errors), and metric aggregation to control costs. The observability bill can exceed your compute bill if unchecked."
