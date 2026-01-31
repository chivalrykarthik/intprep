# Observability: The Eyes of the System 👀

## 1. The "Detective" Analogy

**Monitoring:** "Is the bank open?" (Yes/No).
**Observability:** "Why is the line at the bank moving slowly, why is Teller #3 crying, and where did the money meant for Vault 5 go?"

**The Three Pillars:**
1.  **Metrics (The Dashboard):** "CPU is at 90%". Aggregable, cheap numbers.
    *   *Analogy:* Car Speedometer.
2.  **Logs (The Story):** "Error: out of memory at line 45". Text details.
    *   *Analogy:* Captain's Diary.
3.  **Traces (The Map):** "Request went A -> B (5ms) -> C (Error)". Path analysis.
    *   *Analogy:* GPS Trip History.

---

## 2. Distributed Tracing (Span Context)

**The Problem:** In Microservices, User hits `Gateway` -> `Auth` -> `Billing` -> `DB`.
If `Billing` is slow, how does `Gateway` know?

**The Solution:**
1.  **Trace ID:** A unique ID generated at the start (`12345`). Passed to *everyone*.
2.  **Span ID:** Every hop creates a child span.
3.  **Context Propagation:** The HTTP Headers (`x-b3-traceid`) carry this metadata globally.

### OpenTelemetry (OTel) Standard
The industry standard for collecting telemetry data. Vendor neutral.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "sequence-diagram",
  "content": "participant U as User\nparticipant GW as Gateway\nparticipant SVC as Service B\nparticipant DB as Database\n\nU->GW: GET /buy (Trace: abc)\nNote right of GW: Span 1 (Start)\nGW->SVC: HTTP (Trace: abc, Span: 2)\nNote right of SVC: Span 2\nSVC->DB: SQL (Trace: abc, Span: 3)\nNote right of DB: Span 3 (500ms Delay)\nDB-->SVC: Result\nSVC-->GW: Result\nGW-->U: 200 OK\n\nNote over GW,DB: Dashboard shows: Total 600ms. DB took 80%."
}
```

---

## 4. Metrics Cardinality 📉

**The Danger Zone.**
Metric: `request_duration_seconds`
Dimensions (Tags): `method=GET`, `status=200`.

**Low Cardinality:**
`method`: GET, POST, PUT (3 values).
Total Series: 3. Cheap.

**High Cardinality:**
`user_id`: 1, 2, 3... 1 Million.
Total Series: 1,000,000.
**Result:** Prometheus crashes. DataDog bill is $50,000/month.

**Rule:** NEVER tag metrics with unbounded values (User IDs, Emails, Request IDs). Put those in **Logs** or **Traces**.

---

## 5. SLI, SLO, SLA 📏

The language of Reliability Engineering (SRE).

1.  **SLI (Indicator):** *The Reality.*
    *   "What is the current uptime?" -> 99.8%.
    *   Measurement: (Good Events / Total Events) * 100.

2.  **SLO (Objective):** *The Goal.*
    *   "We aim for 99.9% uptime."
    *   **Error Budget:** We can be down for 43 minutes/month (0.1%). If we burn this budget, FREEZE deployments.

3.  **SLA (Agreement):** *The Contract / Penalty.*
    *   "If we are not up 99.0%, we owe you money."
    *   Usually looser than SLO to avoid payouts.

### TypeScript SRE Calculation

```typescript
type RequestLog = { status: number, latency: number, timestamp: number };

class ReliabilityCalculator {
    logs: RequestLog[] = [];

    // SLI: Success Rate
    calculateAvailability(): number {
        const total = this.logs.length;
        if (total === 0) return 100;
        
        const errors = this.logs.filter(l => l.status >= 500).length;
        return ((total - errors) / total) * 100;
    }

    // SLI: Latency (< 200ms)
    calculateLatencyScore(): number {
        const total = this.logs.length;
        const fast = this.logs.filter(l => l.latency < 200).length;
        return (fast / total) * 100;
    }

    checkSLO(target: number): string {
        const current = this.calculateAvailability();
        const errorBudget = 100 - target;
        const burned = 100 - current;
        
        if (burned > errorBudget) {
            return "🔥 HALT DEPLOYMENTS! Budget Burned.";
        }
        return "✅ Safe to deploy.";
    }
}
```

---

## 6. Real World Applications 🌍

### 1. 🔍 Datadog / New Relic
*   SaaS platforms that ingest all 3 pillars.
*   They auto-correlate: Clicking a spike in the Metric graph shows the Logs from that minute.

### 2. 🛡️ Prometheus & Grafana
*   **Prometheus:** Pull-based metric storage (TimeSeries DB).
*   **Grafana:** Visualization.
*   **AlertManager:** "If error_rate > 5% for 5m, Page Duty the on-call engineer."

### 3. 🕸️ Jaeger / Zipkin
*   Open Source distributed tracing UIs.
*   Essential for finding "Where is the bottleneck?"

---

## 7. Complexity Analysis 🧠

### Sampling
*   Tracing *every* request is too expensive (Storage & Network).
*   **Head-based Sampling:** Decide at start. "Trace 1% of requests".
*   **Tail-based Sampling:** (Expensive) Record everything, but only *keep* the traces that had Errors or High Latency. Discard the 99% success traces.

### Context Propagation
*   If you spawn a thread or use a setTimeout, you lose the Trace Context (ThreadLocal variables).
*   **Node.js:** Requires `AsyncHooks` or `Cls-hooked` libraries to pass context across async callbacks automatically.

### Interview Tips 💡
1.  **Cardinality:** "I would be careful not to use UserID as a metric label to avoid cardinality explosion."
2.  **Log Structured:** "Use JSON logs (`{level: 'error'}`) instead of text. Machines read JSON faster."
3.  **SRE Mindset:** "100% reliability is impossible and too expensive. Validating the SLO is what matters."
