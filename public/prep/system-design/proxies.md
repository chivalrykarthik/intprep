# Proxies (Forward & Reverse) 🔀

## 1. The "Personal Assistant" Analogy

**Forward Proxy (Your Assistant):**
- You want to buy something from a store, but you don't want the store to know who you are.
- You send your assistant with the money. The assistant buys it on your behalf.
- The store sees the assistant, not you. Your identity is hidden.
- *"A Forward Proxy acts on behalf of the CLIENT."*

**Reverse Proxy (The Store's Receptionist):**
- You walk into a large company headquarters.
- You don't go directly to the engineer who built your product.
- Instead, a receptionist at the front desk takes your request and routes it to the right department.
- You never know which specific employee handled it. The company's internal structure is hidden.
- *"A Reverse Proxy acts on behalf of the SERVER."*

**Key Difference:**
- **Forward Proxy:** Clients know about it. Servers don't. Hides the **client**.
- **Reverse Proxy:** Servers know about it. Clients don't. Hides the **server**.

---

## 2. The Core Concept

In system design interviews, proxies are a fundamental building block. Load balancers, API gateways, and CDNs are all forms of reverse proxies.

### Forward Proxy

```
Client → [Forward Proxy] → Internet → Server

Uses:
- Hide client identity (IP masking)
- Bypass content restrictions (geo-blocking)
- Cache responses (corporate proxy)
- Monitor/filter employee internet usage
- VPNs are a form of forward proxy
```

### Reverse Proxy

```
Client → Internet → [Reverse Proxy] → Server 1
                                     → Server 2
                                     → Server 3

Uses:
- Load balancing across servers
- SSL/TLS termination
- Caching and compression
- DDoS protection
- API Gateway functionality
- Hide server infrastructure
```

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│              FORWARD PROXY vs REVERSE PROXY                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FORWARD PROXY                    REVERSE PROXY                 │
│  ═════════════                    ═════════════                 │
│                                                                 │
│  ┌────────┐                       ┌────────┐                    │
│  │Client A│──┐                    │ Client │                    │
│  └────────┘  │  ┌──────────┐      └───┬────┘                    │
│              ├──│ Forward  │          │                          │
│  ┌────────┐  │  │  Proxy   │      ┌───▼────────┐                │
│  │Client B│──┘  └────┬─────┘      │  Reverse   │                │
│  └────────┘          │            │   Proxy    │                │
│                      ▼            └───┬────────┘                │
│                ┌──────────┐      ┌────┼────┐                    │
│                │  Server  │      ▼    ▼    ▼                    │
│                └──────────┘   ┌────┐┌────┐┌────┐                │
│                               │ S1 ││ S2 ││ S3 │                │
│  Server sees Proxy IP,        └────┘└────┘└────┘                │
│  NOT Client IPs.             Client sees Proxy,                 │
│                              NOT Server IPs.                    │
│                                                                 │
│  Protects: CLIENT identity   Protects: SERVER identity          │
│  Example: VPN, Corp Proxy    Example: NGINX, Cloudflare         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: Reverse Proxy — NGINX Configuration

**Real-Life Scenario:** You're deploying a web application with multiple backend services.

**Technical Problem:** Configure a reverse proxy that handles routing, SSL, caching, and compression.

### Conceptual NGINX Configuration

```typescript
/**
 * NGINX as Reverse Proxy — Conceptual Configuration
 * 
 * Responsibilities:
 * 1. SSL/TLS Termination (HTTPS decrypted here, HTTP to backends)
 * 2. Load Balancing (Round Robin across backends)
 * 3. Caching (Static assets, API responses)
 * 4. Compression (gzip/brotli)
 * 5. Rate Limiting (Protect backends)
 * 6. Path-Based Routing (API vs Static vs WebSocket)
 */

// Conceptual NGINX config expressed as TypeScript for clarity:

interface NginxConfig {
  upstream: Record<string, UpstreamConfig>;
  server: ServerConfig;
}

interface UpstreamConfig {
  servers: Array<{ address: string; weight?: number; backup?: boolean }>;
  loadBalancing: 'round_robin' | 'least_conn' | 'ip_hash';
  healthCheck: { interval: string; fails: number; passes: number };
}

interface ServerConfig {
  listen: number;
  ssl: { cert: string; key: string };
  locations: LocationConfig[];
}

interface LocationConfig {
  path: string;
  proxyPass?: string;
  cacheControl?: string;
  rateLimit?: string;
}

const nginxConfig: NginxConfig = {
  upstream: {
    'api_backend': {
      servers: [
        { address: '10.0.0.1:3000', weight: 3 },
        { address: '10.0.0.2:3000', weight: 2 },
        { address: '10.0.0.3:3000', backup: true },
      ],
      loadBalancing: 'least_conn',
      healthCheck: { interval: '10s', fails: 3, passes: 2 },
    },
    'websocket_backend': {
      servers: [
        { address: '10.0.0.4:8080' },
        { address: '10.0.0.5:8080' },
      ],
      loadBalancing: 'ip_hash', // Sticky sessions for WebSocket
      healthCheck: { interval: '5s', fails: 2, passes: 1 },
    },
  },
  server: {
    listen: 443,
    ssl: {
      cert: '/etc/ssl/cert.pem',
      key: '/etc/ssl/key.pem',
    },
    locations: [
      {
        path: '/api/',
        proxyPass: 'http://api_backend',
        rateLimit: '100r/s per IP',
      },
      {
        path: '/ws/',
        proxyPass: 'http://websocket_backend',
        // WebSocket upgrade headers required
      },
      {
        path: '/static/',
        cacheControl: 'public, max-age=31536000, immutable',
        // Served directly from disk, no proxy needed
      },
      {
        path: '/',
        proxyPass: 'http://api_backend',
        cacheControl: 'public, max-age=0, must-revalidate',
      },
    ],
  },
};

/**
 * What the Reverse Proxy does at each layer:
 * 
 * 1. SSL TERMINATION
 *    Client ──HTTPS──▶ [NGINX] ──HTTP──▶ Backend
 *    - NGINX handles the expensive TLS handshake
 *    - Backends only deal with plain HTTP (simpler, faster)
 *    - Central place to manage SSL certificates
 * 
 * 2. COMPRESSION
 *    Backend returns 100KB JSON → NGINX compresses to 15KB (gzip/brotli)
 *    - Client sends: Accept-Encoding: gzip, br
 *    - NGINX responds with compressed body
 *    - Saves bandwidth, improves latency
 * 
 * 3. RATE LIMITING
 *    NGINX: "This IP sent 150 requests in 1 second? Block it."
 *    - Backends never see the blocked requests
 *    - Returns 429 Too Many Requests
 * 
 * 4. REQUEST BUFFERING
 *    Slow client sends 10MB upload over 30 seconds.
 *    NGINX buffers the entire request, then sends to backend as fast as possible.
 *    Backend is only busy for 50ms instead of 30 seconds.
 */
```

---

## 5. Scenario B: API Gateway as Reverse Proxy

**Real-Life Scenario:** Your microservices need a single entry point for authentication, routing, and rate limiting.

**Technical Problem:** Build an API Gateway that acts as a smart reverse proxy.

### TypeScript Implementation

```typescript
/**
 * API Gateway — A Specialized Reverse Proxy
 * 
 * An API Gateway is a reverse proxy that adds:
 * - Authentication / Authorization
 * - Rate limiting per user/API key
 * - Request transformation
 * - Response aggregation
 * - Circuit breaking
 * - Logging and metrics
 * 
 * @timeComplexity O(1) per request (routing lookup)
 * @spaceComplexity O(N) where N = number of route configurations
 */

interface RouteConfig {
  path: string;
  method: string;
  upstream: string;
  auth: boolean;
  rateLimit: { requests: number; windowSeconds: number };
  timeout: number;
  circuitBreaker: boolean;
  cache?: { ttlSeconds: number };
}

class ApiGateway {
  private routes: RouteConfig[];
  private authService: AuthService;
  private rateLimiter: RateLimiter;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  constructor(routes: RouteConfig[]) {
    this.routes = routes;
  }

  async handleRequest(req: IncomingRequest): Promise<Response> {
    const startTime = Date.now();

    try {
      // 1. Find matching route
      const route = this.findRoute(req.path, req.method);
      if (!route) {
        return { status: 404, body: { error: 'Route not found' } };
      }

      // 2. Authentication
      if (route.auth) {
        const user = await this.authService.validate(req.headers.authorization);
        if (!user) {
          return { status: 401, body: { error: 'Unauthorized' } };
        }
        req.user = user;
      }

      // 3. Rate Limiting
      const rateLimitKey = `${req.user?.id || req.ip}:${route.path}`;
      const allowed = await this.rateLimiter.check(
        rateLimitKey, route.rateLimit.requests, route.rateLimit.windowSeconds
      );
      if (!allowed) {
        return {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(route.rateLimit.requests),
            'X-RateLimit-Remaining': '0',
          },
          body: { error: 'Rate limit exceeded' },
        };
      }

      // 4. Check Cache (for GET requests)
      if (req.method === 'GET' && route.cache) {
        const cached = this.getFromCache(req.path);
        if (cached) {
          return { status: 200, body: cached, headers: { 'X-Cache': 'HIT' } };
        }
      }

      // 5. Circuit Breaker Check
      if (route.circuitBreaker) {
        const cb = this.getCircuitBreaker(route.upstream);
        if (cb.isOpen()) {
          return { status: 503, body: { error: 'Service temporarily unavailable' } };
        }
      }

      // 6. Forward Request to Upstream
      const upstreamResponse = await this.forwardRequest(route.upstream, req, route.timeout);

      // 7. Cache Response (if configured)
      if (req.method === 'GET' && route.cache && upstreamResponse.status === 200) {
        this.setCache(req.path, upstreamResponse.body, route.cache.ttlSeconds);
      }

      // 8. Log Metrics
      const duration = Date.now() - startTime;
      this.logMetrics(route.path, upstreamResponse.status, duration);

      return upstreamResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logMetrics(req.path, 500, duration);
      return { status: 500, body: { error: 'Internal gateway error' } };
    }
  }

  private findRoute(path: string, method: string): RouteConfig | undefined {
    return this.routes.find(r => path.startsWith(r.path) && r.method === method);
  }

  private async forwardRequest(
    upstream: string, req: IncomingRequest, timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(upstream + req.path, {
        method: req.method,
        headers: {
          ...req.headers,
          'X-Forwarded-For': req.ip || '',
          'X-Request-ID': req.requestId || crypto.randomUUID(),
        },
        body: req.body,
        signal: controller.signal,
      });

      return { status: response.status, body: await response.json() };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Example Route Configuration
const gatewayRoutes: RouteConfig[] = [
  {
    path: '/api/users',
    method: 'GET',
    upstream: 'http://user-service:3001',
    auth: true,
    rateLimit: { requests: 100, windowSeconds: 60 },
    timeout: 5000,
    circuitBreaker: true,
    cache: { ttlSeconds: 300 },
  },
  {
    path: '/api/payments',
    method: 'POST',
    upstream: 'http://payment-service:3002',
    auth: true,
    rateLimit: { requests: 10, windowSeconds: 60 }, // Strict for payments
    timeout: 30000,          // Longer timeout for payments
    circuitBreaker: true,
    // No cache for POST writes
  },
  {
    path: '/api/search',
    method: 'GET',
    upstream: 'http://search-service:3003',
    auth: false,            // Public search endpoint
    rateLimit: { requests: 200, windowSeconds: 60 },
    timeout: 3000,
    circuitBreaker: true,
    cache: { ttlSeconds: 60 },
  },
];
```

---

## 6. Real World Applications 🌍

### 1. 🌐 NGINX (Reverse Proxy)

The most popular reverse proxy in the world:
- Powers 34% of all web servers.
- Used as reverse proxy, load balancer, HTTP cache, and web server.
- Event-driven architecture handles 10,000+ concurrent connections per worker.
- C10K problem (10,000 concurrent connections) solved with epoll/kqueue.

### 2. ☁️ Cloudflare (Reverse Proxy as a Service)

Cloudflare sits in front of 20%+ of websites globally:
- Acts as reverse proxy for DDoS protection and WAF.
- Terminates SSL, inspects traffic, blocks attacks.
- Clients never see origin server IP addresses.
- Workers: Execute JavaScript at the proxy edge layer.

### 3. 🔐 Corporate Forward Proxy (Squid/Zscaler)

Enterprise forward proxies for security:
- All employee traffic routed through the proxy.
- URL filtering (block social media during work hours).
- Malware scanning on downloaded files.
- Data loss prevention (detect sensitive data leaving the network).
- Logging for compliance (who accessed what, when).

### 4. 🚪 Envoy (Service Mesh Sidecar Proxy)

Envoy runs as a sidecar proxy alongside each microservice:
- Every service-to-service call goes through the local Envoy proxy.
- Provides: mTLS, retries, circuit breaking, tracing, metrics.
- The application code doesn't need to implement any of these.
- Used by Istio, AWS App Mesh, and Consul Connect.

---

## 7. Complexity Analysis 🧠

### Proxy Comparison Table

| Feature | Forward Proxy | Reverse Proxy | API Gateway | Service Mesh |
| :--- | :--- | :--- | :--- | :--- |
| **Who is aware** | Client | Server | Both | Neither (transparent) |
| **Protects** | Client identity | Server identity | Both | Service-to-service |
| **SSL** | Optional | Terminates ✓ | Terminates ✓ | mTLS ✓ |
| **Caching** | ✓ | ✓ | ✓ | ✗ |
| **Auth** | IP-based | ✗ | ✓ (JWT, OAuth) | ✓ (mTLS) |
| **Rate Limiting** | ✗ | Basic | Advanced ✓ | Per-service ✓ |
| **Example** | Squid, VPN | NGINX, HAProxy | Kong, AWS APIGW | Istio, Linkerd |

### Performance Impact

```
Direct Connection (No Proxy):
  Client → Server: 100ms

With Reverse Proxy:
  Client → Proxy → Server: 102ms (+2ms overhead)
  BUT: SSL termination, compression, caching save net 50ms+ 

  Net result: FASTER with proxy for most workloads.

With API Gateway (More Processing):
  Client → Gateway → Server: 105-115ms (+5-15ms overhead)
  BUT: Auth, rate limiting, transformation done centrally.

  Net result: Slightly slower, but much more secure/maintainable.
```

### Interview Tips 💡

1. **Every system has a reverse proxy:** "NGINX or ALB sits in front of our application servers."
2. **Know the difference:** "Forward proxy hides the client. Reverse proxy hides the server."
3. **Mention SSL termination:** "The reverse proxy handles TLS so backends only deal with HTTP."
4. **API Gateway is a reverse proxy:** "It's a reverse proxy with auth, rate limiting, and routing."
5. **Service mesh:** "For microservices, Envoy sidecar proxies handle mTLS, retries, and observability."
6. **Security:** "The reverse proxy is our first line of defense — WAF, DDoS, IP filtering."
