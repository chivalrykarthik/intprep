# Load Balancing ⚖️

## 1. The "Airport Security" Analogy

Picture yourself at airport security during holiday season. There are 500 passengers but only 5 security lanes.

**Without a Load Balancer (Chaos):**
Everyone rushes to Lane 1. Massive queue. Lanes 2-5 sit empty. People miss flights.

**With a Load Balancer (The Line Manager):**
An attendant stands at the entrance and directs passengers:
- "You → Lane 3"
- "You → Lane 1"
- "Family of 5 → Lane 4 (it has extra capacity)"

The attendant **distributes the load** so no single lane gets overwhelmed while others idle.

**This is Load Balancing.** A traffic cop for your servers—distributing incoming requests across multiple backend servers to ensure no single server becomes a bottleneck.

---

## 2. The Core Concept

In system design interviews, load balancing is fundamental to any scalable architecture.

**The "Single Server" (Naive) Way:**
All traffic goes to one server. When it crashes or gets overloaded? Game over.

**The "Load Balanced" (Smart) Way:**
Place a load balancer in front of multiple identical servers:
1. **Distributes Traffic:** Spreads requests across healthy servers.
2. **Health Checks:** Automatically removes dead servers from the pool.
3. **Session Management:** Can maintain sticky sessions if needed.
4. **SSL Termination:** Handles HTTPS, reducing backend server load.
- **Boom.** High availability, fault tolerance, and scalability.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Load Balancing visualizer coming soon!"
}
```

---

## 4. Scenario A: Load Balancing Algorithms

**Real-Life Scenario:** You have 4 web servers behind a load balancer. How should incoming requests be distributed?

**Technical Problem:** Choose the right algorithm based on your workload characteristics.

### TypeScript Implementation

```typescript
/**
 * Load Balancing Algorithms Demonstration
 */

// Server representation
interface Server {
  id: string;
  weight: number;        // For weighted algorithms
  connections: number;   // Current active connections
  healthy: boolean;
}

/**
 * Round Robin - Simple rotation through servers
 * Best for: Homogeneous servers, stateless requests
 * 
 * @timeComplexity O(1)
 */
class RoundRobinBalancer {
  private currentIndex = 0;
  
  getNextServer(servers: Server[]): Server {
    const healthyServers = servers.filter(s => s.healthy);
    if (healthyServers.length === 0) throw new Error('No healthy servers');
    
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex++;
    return server;
  }
}

/**
 * Weighted Round Robin - Servers with higher weight get more traffic
 * Best for: Heterogeneous servers (some more powerful than others)
 * 
 * @timeComplexity O(N) where N is total weight sum
 */
class WeightedRoundRobinBalancer {
  private currentWeight = 0;
  private currentIndex = 0;
  
  getNextServer(servers: Server[]): Server {
    const healthyServers = servers.filter(s => s.healthy);
    const maxWeight = Math.max(...healthyServers.map(s => s.weight));
    const gcd = this.findGCD(healthyServers.map(s => s.weight));
    
    while (true) {
      this.currentIndex = (this.currentIndex + 1) % healthyServers.length;
      
      if (this.currentIndex === 0) {
        this.currentWeight -= gcd;
        if (this.currentWeight <= 0) {
          this.currentWeight = maxWeight;
        }
      }
      
      if (healthyServers[this.currentIndex].weight >= this.currentWeight) {
        return healthyServers[this.currentIndex];
      }
    }
  }
  
  private findGCD(nums: number[]): number {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    return nums.reduce((a, b) => gcd(a, b));
  }
}

/**
 * Least Connections - Route to server with fewest active connections
 * Best for: Long-lived connections (WebSockets, streaming)
 * 
 * @timeComplexity O(N) to find minimum
 */
class LeastConnectionsBalancer {
  getNextServer(servers: Server[]): Server {
    const healthyServers = servers.filter(s => s.healthy);
    if (healthyServers.length === 0) throw new Error('No healthy servers');
    
    return healthyServers.reduce((min, server) => 
      server.connections < min.connections ? server : min
    );
  }
}

/**
 * IP Hash - Consistent routing based on client IP
 * Best for: Session affinity without sticky sessions
 * 
 * @timeComplexity O(1)
 */
class IPHashBalancer {
  getNextServer(servers: Server[], clientIP: string): Server {
    const healthyServers = servers.filter(s => s.healthy);
    if (healthyServers.length === 0) throw new Error('No healthy servers');
    
    const hash = this.hashIP(clientIP);
    const index = hash % healthyServers.length;
    return healthyServers[index];
  }
  
  private hashIP(ip: string): number {
    return ip.split('.').reduce((hash, octet) => {
      return ((hash << 5) - hash) + parseInt(octet);
    }, 0) >>> 0; // Ensure positive number
  }
}

// Example usage
const servers: Server[] = [
  { id: 'server-1', weight: 3, connections: 10, healthy: true },
  { id: 'server-2', weight: 2, connections: 5, healthy: true },
  { id: 'server-3', weight: 1, connections: 20, healthy: true },
  { id: 'server-4', weight: 2, connections: 8, healthy: false }, // Unhealthy
];

const rrBalancer = new RoundRobinBalancer();
console.log('Round Robin:', rrBalancer.getNextServer(servers).id); // server-1
console.log('Round Robin:', rrBalancer.getNextServer(servers).id); // server-2

const lcBalancer = new LeastConnectionsBalancer();
console.log('Least Connections:', lcBalancer.getNextServer(servers).id); // server-2 (5 connections)
```

### Sample input and output
- Round Robin: Cycles through server-1, server-2, server-3, repeat
- Least Connections: Always picks server with fewest active connections

---

## 5. Scenario B: Layer 4 vs Layer 7 Load Balancing

**Real-Life Scenario:** You need to choose between hardware/software load balancers for your architecture.

**Technical Problem:** Understand the trade-offs between L4 and L7 load balancing.

### Comparison

```typescript
/**
 * Layer 4 vs Layer 7 Load Balancing Comparison
 */

interface L4LoadBalancer {
  layer: 'Transport (TCP/UDP)';
  inspects: 'IP address, Port';
  performance: 'Extremely fast (millions of RPS)';
  features: [
    'NAT-based routing',
    'Connection-level balancing',
    'Protocol agnostic'
  ];
  useCases: [
    'High-throughput gaming servers',
    'VoIP/Streaming',
    'Simple web traffic'
  ];
  examples: ['AWS NLB', 'HAProxy (TCP mode)', 'F5 BIG-IP'];
  limitations: [
    'Cannot route by URL path',
    'Cannot inspect HTTP headers',
    'No content-based routing'
  ];
}

interface L7LoadBalancer {
  layer: 'Application (HTTP/HTTPS)';
  inspects: 'Full HTTP request (headers, path, cookies)';
  performance: 'Slower than L4 (but still fast)';
  features: [
    'URL-based routing (/api → backend, /static → CDN)',
    'Header-based routing (A/B testing by cookie)',
    'SSL termination',
    'Request/Response modification',
    'WebSocket support',
    'Rate limiting'
  ];
  useCases: [
    'Microservices routing',
    'API Gateways',
    'A/B testing',
    'Blue-Green deployments'
  ];
  examples: ['AWS ALB', 'NGINX', 'Envoy', 'Traefik'];
}

// Decision Matrix
const decisionMatrix = {
  'Need URL-based routing?': 'L7',
  'Need SSL termination?': 'L7',
  'Need maximum throughput?': 'L4',
  'Need WebSocket support?': 'L7',
  'Simple TCP/UDP forwarding?': 'L4',
  'Microservices with different paths?': 'L7',
};
```

### Architecture Example

```
                    ┌─────────────────────────────────────┐
                    │          Layer 7 (ALB)              │
                    │  Routes by path/header/host         │
                    └─────────────────────────────────────┘
                           │              │
            ┌──────────────┴──┐      ┌────┴──────────────┐
            ▼                 ▼      ▼                   ▼
      /api/*             /auth/*     /static/*      /websocket/*
         │                  │            │               │
    ┌────┴────┐       ┌────┴────┐   ┌───┴───┐     ┌────┴────┐
    │ API     │       │ Auth    │   │  CDN  │     │ WS      │
    │ Servers │       │ Service │   │       │     │ Servers │
    └─────────┘       └─────────┘   └───────┘     └─────────┘
```

---

## 6. Real World Applications 🌍

### 1. 🌐 Netflix's Zuul Gateway
Netflix uses Zuul as an L7 load balancer for:
- Dynamic routing to different microservices
- Authentication and security checks
- Canary deployments (send 1% of traffic to new versions)

### 2. ☁️ AWS Elastic Load Balancing
AWS offers three types:
- **ALB (L7):** HTTP/HTTPS with content-based routing
- **NLB (L4):** Ultra-low latency, millions of RPS
- **CLB (Legacy):** Basic L4/L7 hybrid

### 3. 🎯 Cloudflare's Global Load Balancer
Cloudflare uses:
- **GeoDNS:** Route users to nearest data center
- **Health Checks:** Automatic failover to healthy origins
- **Weighted Pools:** Traffic shaping across regions

### 4. 🔄 Kubernetes Ingress
Kubernetes uses Ingress controllers (NGINX, Traefik) for:
- L7 routing to different services by path/host
- TLS termination
- Rate limiting and authentication

---

## 7. Complexity Analysis 🧠

### Algorithm Comparison

| Algorithm | Time Complexity | Best For |
|-----------|----------------|----------|
| Round Robin | O(1) | Equal capacity servers |
| Weighted RR | O(1) amortized | Mixed capacity servers |
| Least Connections | O(N) | Long-lived connections |
| IP Hash | O(1) | Session persistence |
| Random | O(1) | Simple, stateless |

### Health Check Overhead

```
Health Check Frequency: Every 10 seconds
Servers: 100
Overhead: 100 * 6 requests/minute = 600 requests/minute

Trade-off:
- More frequent = faster failure detection
- Less frequent = less overhead, but slower recovery
```

### Interview Tips 💡

1. **Always draw the architecture:** Show where the LB sits in the system.
2. **Discuss failure scenarios:** "If the LB fails, we have a standby in active-passive mode."
3. **Know sticky sessions trade-offs:** "Sticky sessions break horizontal scaling but are needed for stateful apps."
4. **Mention health checks:** "We configure health endpoints (/health) that return 200 OK."
5. **Consider global load balancing:** "For multi-region, we use DNS-based global load balancing."
