# Kubernetes Patterns: The Cluster OS ☸️

## 1. The "Apartment Complex" Analogy

**Kubernetes (K8s) is the Property Manager.**
*   **Cluster:** The Building.
*   **Node:** A Floor.
*   **Pod:** An Apartment. (Can share resources, same address/IP).
*   **Container:** A Room (Kitchen, Bedroom).

**Patterns:**
1.  **Sidecar:** A utility room attached to every apartment (e.g., Logger). The Tenant (App) focuses on living; the Sidecar focuses on maintenance.
2.  **Ambassador:** A Receptionist at the door. Handles foreign languages (Protocol translation) before the Tenant speaks.
3.  **Operator:** An robot maintenance crew. It knows exactly how to fix the AC (Database) when it breaks, without calling the Super.

---

## 2. The Core Patterns

### 1. Sidecar Pattern 🏍️
**Concept:** Place a helper container alongside the main application container *within the same Pod*.
*   **Process:** They share the same Network Namespace (localhost) and Filesystem volumes.
*   **Use Cases:**
    *   **Logging:** App writes logs to `localhost`. Sidecar ships them to Splunk/Datadog.
    *   **Proxy:** Sidecar (Envoy) handles Mutual TLS (mTLS) so the App doesn't have to (Service Mesh).
    *   **Config:** Updates config files from Git without restarting the app.

### 2. Ambassador Pattern 🗣️
**Concept:** A proxy container that handles network connection complexity.
*   **Use Cases:**
    *   **Database:** App connects to `localhost:3306`. Ambassador proxies it to a specific Shard in a remote cluster.
    *   **Circuit Breaking:** App just calls. Ambassador handles retries and failures.

### 3. Operator Pattern 🤖
**Concept:** Codifying operational knowledge. K8s knows how to restart a Pod. It *doesn't* know how to recover a Primary-Replica PostgreSQL cluster safely.
*   **CRD (Custom Resource Definition):** Extends K8s API. You make a `PostgresCluster` object.
*   **Controller Loop:** The Operator watches this object. If `replicas: 3` but only 2 exist, it spins up a new one and joins it to the replication stream.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "architecture-diagram",
  "content": "graph TD\n    subgraph Pod\n        App[Main Application Container]\n        Sidecar[Sidecar: Log Shipper]\n        \n        App-->|Logs to Disk| Volume[(Shared Volume)]\n        Sidecar-->|Reads| Volume\n        Sidecar-->|Push| Splunk[External Log Aggregator]\n    end\n    \n    subgraph Operator Pattern\n        K8s[K8s API]\n        Op[DB Operator]\n        DB[(Database Pods)]\n        \n        K8s-->|Watch CRD| Op\n        Op-->|Manage State| DB\n    end"
}
```

---

## 4. Scenario A: Designing a Sidecar

**Technical Problem:** Secure communication (mTLS) between all microservices without changing application code.
**Solution:** Istio/Linkerd Sidecar.

### YAML / TypeScript Logic

```yaml
# Pod Definition with Sidecar
apiVersion: v1
kind: Pod
metadata:
  name: my-app
spec:
  containers:
    # 1. Main Application
    - name: main-app
      image: my-app:v1
      ports:
        - containerPort: 8080 # App listens here

    # 2. Sidecar (Envoy Proxy)
    - name: istio-proxy
      image: envoy:v2
      args: ["proxy", "sidecar"]
      # Intercepts ALL traffic
```

**How it works internally:**
1.  **IPTABLES:** The pod's networking rules are modified to route ALL incoming/outgoing traffic to the Sidecar port first.
2.  **App:** Thinks it's talking to `api.google.com`.
3.  **Sidecar:** Intercepts. Adds mTLS certs. Routes to `api.google.com`.

---

## 5. Scenario B: The Operator Pattern Loop

**Technical Problem:** "Day 2" Operations. Deploying is easy. Upgrading, Backup, and Failover are hard.

**Logic Loop (Reconciliation):**

```typescript
/**
 * OPERATOR CONTROLLER LOGIC
 * Reconcile Loop: Runs every few seconds
 */

interface DesiredState {
    version: string;
    replicas: number;
}

interface ActualState {
    runningPods: number;
    currentVersion: string;
}

class PostgresOperator {
    async reconcile(resource: PostgresCRD) {
        // 1. Observe: What is running?
        const actual = await k8s.getPods(resource.selector);
        
        // 2. Diff: Compare Desired vs Actual
        if (actual.runningPods < resource.spec.replicas) {
            // Action: Scale Up
            console.log("Adding Read Replica...");
            await k8s.createPod(this.generatePodSpec(resource));
        }
        
        if (actual.currentVersion < resource.spec.version) {
            // Action: Rolling Upgrade (Complex logic)
            // 1. Backup DB
            // 2. Stop Replica 1
            // 3. Upgrade Replica 1
            // 4. Failover...
            await this.performSafeUpgrade(resource);
        }
    }
}
```

---

## 6. Real World Applications 🌍

### 1. 🕸️ Istio (Service Mesh)
*   Injects a sidecar (Envoy) into *every* pod.
*   Provides: mTLS, Metrics (Red/Green), Tracing, Retry logic.
*   **Result:** Developers write code; Istio handles network reliability.

### 2. 🐘 Zalando Postgres Operator
*   Managing Postgres on K8s is terrifying.
*   Zalando's Operator handles:
    *   Failover (Patroni).
    *   S3 Backups (WAL-G).
    *   User creation.

### 3. 📈 Prometheus Operator
*   Automatically detects new services.
*   Configures Prometheus to scrape them.
*   Manages AlertManager rules.

---

## 7. Complexity Analysis 🧠

### Resource Overhead
*   Sidecars consume Memory/CPU.
*   If you have 1000 pods, you have 1000 sidecars.
*   **Solution:** Sidecarless Mesh (Ambient Mesh / eBPF) is the future (Cilium).

### "CrashLoopBackOff"
*   If the Sidecar starts *after* the App, the App might crash trying to connect to the network.
*   **Solution:** K8s 1.28+ Native Sidecar Containers (Sidecars start first, terminate last).

### Interview Tips 💡
1.  **Why Sidecars?** "Decoupling. I don't want to update my Java App just to change how we ship logs."
2.  **Operators vs Helm:** "Helm is a package manager (Install once). Operators are active managers (Install + Maintain + Heal)."
3.  **Security:** "Operators run with high privileges (ClusterAdmin). Be careful what you install."
