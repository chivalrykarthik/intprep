# Networking Fundamentals — TCP/IP, DNS, HTTP & TLS 🌐

## 1. The "Postal System" Analogy

Imagine the entire internet is a global postal system:

**IP Address (Street Address):**
- Your computer has a unique address: `192.168.1.42` (like "42 Oak Street, New York").
- A server has its own address: `93.184.216.34` (like "One Microsoft Way, Redmond").
- IPv4 has ~4 billion addresses (running out). IPv6 has 340 undecillion (essentially infinite).

**DNS (Phone Book):**
- You don't memorize `93.184.216.34`. You type `google.com`.
- DNS is the phone book that translates `google.com` → `142.250.80.46`.
- Your computer asks the DNS server: *"What's the IP address for google.com?"* — and caches the answer.

**TCP (Registered Mail with Tracking):**
- Before sending data, you **establish a connection** (3-way handshake: "I want to send" → "OK, ready" → "Sending now").
- Every packet has a tracking number (sequence number). If delivery fails, it **retransmits**.
- Packets arrive **in order**. Nothing gets lost. This is why web pages, emails, and APIs use TCP.

**UDP (Postcards):**
- No connection. No tracking. No ordering. Just throw it out there.
- If a packet gets lost? Oh well. Send the next one.
- **Faster but unreliable**. Perfect for video calls, gaming, and DNS — where speed matters more than perfection.

**HTTP (The Letter Format):**
- TCP delivers raw bytes. HTTP is the **format of the letter itself**: headers (metadata), body (content), status code (did it work?).
- `GET /users/123` is like saying: *"Send me the file about user 123."*
- `POST /orders` is like saying: *"Here's a new order form, please process it."*

**TLS/HTTPS (Sealed Envelope with Wax Seal):**
- HTTP sends the letter **in plain text**. Anyone who intercepts it can read it.
- TLS encrypts the contents and adds authentication: *"This letter is definitely FROM Bank of America, and only YOU can open it."*
- HTTPS = HTTP + TLS. Every production website must use it.

---

## 2. The Core Concept

### The OSI Model (Simplified for Interviews)

```
┌──────────────────────────────────────────────────────────────────┐
│                  THE TCP/IP MODEL (4 Layers)                      │
│            (Interviewers care about this one)                     │
├──────────────┬───────────────────────────────────────────────────┤
│ Layer 4      │ APPLICATION                                        │
│              │ HTTP, HTTPS, WebSocket, gRPC, SMTP, DNS, FTP       │
│              │ "What to say" — the actual request/response         │
├──────────────┼───────────────────────────────────────────────────┤
│ Layer 3      │ TRANSPORT                                          │
│              │ TCP (reliable, ordered) or UDP (fast, unreliable)    │
│              │ "How to deliver" — ports, flow control, retry       │
├──────────────┼───────────────────────────────────────────────────┤
│ Layer 2      │ INTERNET                                           │
│              │ IP (IPv4/IPv6), ICMP (ping), ARP                    │
│              │ "Where to deliver" — IP addresses, routing          │
├──────────────┼───────────────────────────────────────────────────┤
│ Layer 1      │ NETWORK ACCESS                                     │
│              │ Ethernet, WiFi, fiber                                │
│              │ "Physical medium" — cables, radio waves              │
└──────────────┴───────────────────────────────────────────────────┘

When you type https://google.com:
  Your browser → HTTP request (L4)
    → TCP segment (L3) with port 443
      → IP packet (L2) to 142.250.80.46
        → Ethernet frame (L1) on WiFi
```

### TCP vs UDP — When to Use Each

```
┌─────────────────────────────┬──────────────────────────────────┐
│           TCP               │             UDP                   │
│   (Transmission Control)    │   (User Datagram Protocol)        │
├─────────────────────────────┼──────────────────────────────────┤
│ ✅ Reliable delivery         │ ❌ No delivery guarantee          │
│ ✅ Ordered packets           │ ❌ Packets may arrive out of order│
│ ✅ Error checking + retransmit│ ❌ No retransmission             │
│ ✅ Flow control              │ ❌ No congestion control          │
│ ❌ Higher latency (handshake)│ ✅ Lower latency (no handshake)  │
│ ❌ Higher overhead           │ ✅ Lightweight header (8 bytes)  │
├─────────────────────────────┼──────────────────────────────────┤
│ USE FOR:                    │ USE FOR:                          │
│ • Web (HTTP/HTTPS)          │ • Video streaming (lost frame     │
│ • Email (SMTP)              │   is OK, just show the next one)  │
│ • File transfer (FTP)       │ • Online gaming (show latest      │
│ • Database connections      │   position, ignore stale ones)    │
│ • APIs (REST/GraphQL)       │ • DNS queries (small, one-shot)   │
│ • SSH                       │ • VoIP / Video calls              │
│                             │ • IoT sensor data                 │
└─────────────────────────────┴──────────────────────────────────┘
```

---

## 3. Interactive Visualization 🎮

```
┌──────────────────────────────────────────────────────────────────┐
│         WHAT HAPPENS WHEN YOU TYPE google.com?                    │
│         (The #1 Networking Interview Question)                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 1: DNS Resolution                                           │
│  ───────────────────────                                          │
│  Browser Cache → OS Cache → Router Cache → ISP DNS →              │
│  Root DNS (.com) → TLD DNS (google) → Authoritative DNS           │
│  Result: google.com → 142.250.80.46                               │
│                                                                   │
│  Step 2: TCP 3-Way Handshake                                      │
│  ────────────────────────────                                     │
│  Client                          Server                           │
│    │──── SYN (seq=100) ─────────▶│     "I want to connect"       │
│    │◀─── SYN-ACK (seq=200,       │     "OK, I'm ready too"       │
│    │     ack=101) ───────────────│                                │
│    │──── ACK (ack=201) ─────────▶│     "Great, let's go"         │
│    │                              │                               │
│  Connection established!                                          │
│                                                                   │
│  Step 3: TLS Handshake (HTTPS)                                    │
│  ──────────────────────────────                                   │
│  Client                          Server                           │
│    │──── ClientHello ───────────▶│  Cipher suites, TLS version    │
│    │◀─── ServerHello + Cert ─────│  Server's certificate          │
│    │     (verify cert chain)      │                               │
│    │──── Key Exchange ──────────▶│  Generate shared secret        │
│    │◀─── Finished ───────────────│  Encrypted channel ready       │
│    │                              │                               │
│  All subsequent data is ENCRYPTED                                 │
│                                                                   │
│  Step 4: HTTP Request                                             │
│  ────────────────────                                             │
│  GET / HTTP/2                                                     │
│  Host: google.com                                                 │
│  Accept: text/html                                                │
│  Cookie: session=abc123                                           │
│                                                                   │
│  Step 5: HTTP Response                                            │
│  ─────────────────────                                            │
│  HTTP/2 200 OK                                                    │
│  Content-Type: text/html                                          │
│  Content-Encoding: gzip                                           │
│  Cache-Control: max-age=300                                       │
│  [compressed HTML body]                                           │
│                                                                   │
│  Step 6: Browser Rendering                                        │
│  ─────────────────────────                                        │
│  Parse HTML → Build DOM → Fetch CSS/JS → CSSOM → Render Tree      │
│  → Layout → Paint → Composite → Pixels on screen                 │
│                                                                   │
│  Total time: ~200-500ms for a well-optimized site                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: DNS Resolution Deep Dive

**Real-Life Scenario:** Your production API has intermittent 5-second delays. After investigation, you discover DNS resolution is timing out for a downstream service. Understanding DNS is critical for debugging production latency.

**Technical Problem:** Explain the full DNS resolution flow and common DNS-related production issues.

### TypeScript Implementation

```typescript
/**
 * DNS RESOLUTION — The Internet's Phone Book
 * 
 * When you type "api.stripe.com", your computer needs to find
 * the IP address. This involves a hierarchical lookup:
 * 
 * 1. Browser cache (Chrome stores DNS for 60 seconds)
 * 2. OS cache (Linux: systemd-resolved, macOS: mdnsresponder)
 * 3. Router cache (your home/office router)
 * 4. ISP's recursive resolver (e.g., 8.8.8.8 for Google DNS)
 * 5. Root nameserver (13 root servers worldwide, knows .com/.org/.net)
 * 6. TLD nameserver (.com knows where stripe.com's DNS lives)
 * 7. Authoritative nameserver (Stripe's DNS returns the actual IP)
 * 
 * Each response has a TTL (Time-To-Live) that controls caching.
 * Low TTL (60s) = more DNS lookups but faster failover.
 * High TTL (86400s) = fewer lookups but slow propagation of changes.
 * 
 * @timeComplexity O(1) if cached, O(D) where D = DNS hops if missed
 * @spaceComplexity O(N) for cache entries
 */

// DNS Record Types (asked in interviews)
interface DNSRecords {
  A:     string;   // "A" record: domain → IPv4 address 
                   // google.com → 142.250.80.46
  
  AAAA:  string;   // "AAAA" record: domain → IPv6 address
                   // google.com → 2607:f8b0:4004:800::200e
  
  CNAME: string;   // Canonical Name: alias → real domain
                   // www.example.com → example.com
                   // api.stripe.com → stripe.map.fastly.net (CDN)
  
  MX:    string;   // Mail Exchange: domain → mail server
                   // google.com → smtp.google.com (priority 10)
  
  TXT:   string;   // Text record: arbitrary text
                   // Used for: SPF (email auth), domain verification,
                   //   DKIM signatures, DMARC policies
  
  NS:    string;   // Nameserver: who is authoritative for this domain
                   // google.com → ns1.google.com
  
  SRV:   string;   // Service: specific service location + port
                   // _http._tcp.example.com → 10 60 80 server.example.com
}

/**
 * PRODUCTION DNS PATTERNS
 */

// 1. DNS-based load balancing (Round Robin)
// Multiple A records for the same domain:
//   api.example.com → 10.0.1.1
//   api.example.com → 10.0.1.2
//   api.example.com → 10.0.1.3
// DNS returns them in round-robin order → basic load distribution

// 2. GeoDNS (Route53 Geolocation Routing)
// User in India    → api.example.com → 10.0.2.1 (Mumbai datacenter)
// User in US East  → api.example.com → 10.0.1.1 (Virginia datacenter)
// User in Europe   → api.example.com → 10.0.3.1 (Frankfurt datacenter)

// 3. DNS Failover
// Primary:   api.example.com → 10.0.1.1 (health check: /health)
// Failover:  api.example.com → 10.0.2.1 (if primary is down)
// Route53 does health checks every 10 seconds and switches DNS

// 4. DNS caching in Node.js
import dns from 'dns';

// Node.js does NOT cache DNS by default!
// Every HTTP request triggers a new DNS lookup.
// Fix: Use a DNS cache module.

// Custom DNS resolver with caching
class CachingDNSResolver {
  private cache: Map<string, { addresses: string[]; expiry: number }> = new Map();
  private defaultTTL = 30_000; // 30 seconds

  async resolve(hostname: string): Promise<string[]> {
    const cached = this.cache.get(hostname);
    if (cached && cached.expiry > Date.now()) {
      return cached.addresses;
    }

    return new Promise((resolve, reject) => {
      dns.resolve4(hostname, (err, addresses) => {
        if (err) return reject(err);
        
        this.cache.set(hostname, {
          addresses,
          expiry: Date.now() + this.defaultTTL,
        });
        resolve(addresses);
      });
    });
  }

  // Warm the cache on startup for critical services
  async warmup(hostnames: string[]): Promise<void> {
    await Promise.all(hostnames.map(h => this.resolve(h)));
  }
}

/**
 * COMMON DNS PRODUCTION ISSUES:
 * 
 * 1. "DNS propagation delay" — Changed IP address but old TTL still cached.
 *    Fix: Lower TTL before migration, wait, change IP, raise TTL back.
 * 
 * 2. "DNS timeout (5s delay)" — DNS server is slow/down.
 *    Fix: Use multiple resolvers (8.8.8.8 + 1.1.1.1), implement DNS caching.
 * 
 * 3. "NXDOMAIN in production" — Typo in environment variable for hostname.
 *    Fix: Validate DNS resolution at startup, fail fast.
 * 
 * 4. "Too many DNS lookups" — Node.js doesn't cache DNS by default.
 *    Fix: Use dns-cache-module or keep-alive connections (reuse TCP).
 */
```

### Sample input and output
- **Input**: `dns.resolve4("api.stripe.com")`
- **Output**: `["151.101.1.165", "151.101.65.165"]` (multiple IPs for load balancing)

---

## 5. Scenario B: HTTP/2, HTTP/3, and TLS

**Real-Life Scenario:** Your website loads 50 assets (CSS, JS, images, fonts). On HTTP/1.1, the browser opens 6 parallel TCP connections and queues the rest. Upgrading to HTTP/2 loads everything over ONE connection with multiplexing. Understanding these protocols is critical for performance.

**Technical Problem:** Explain the evolution from HTTP/1.1 → HTTP/2 → HTTP/3 and how TLS secures connections.

### HTTP Evolution

```typescript
/**
 * HTTP PROTOCOL EVOLUTION
 * 
 * HTTP/1.0 (1996): One request per TCP connection. Close after response.
 * HTTP/1.1 (1997): Keep-Alive (reuse connection), but ONE request at a time.
 * HTTP/2   (2015): Multiplexing, binary framing, server push, header compression.
 * HTTP/3   (2022): QUIC (UDP-based), zero-RTT, no head-of-line blocking.
 */

/**
 * HTTP/1.1 vs HTTP/2 — The Key Difference
 * 
 * HTTP/1.1 PROBLEM: Head-of-Line Blocking
 * ─────────────────────────────────────────
 * Connection 1: [GET style.css ──────] [GET app.js ──────] [GET logo.png ────]
 * Connection 2: [GET font.woff ──────] [GET data.json ───] [GET icon.svg ────]
 * Connection 3: [GET hero.jpg ───────] [GET vendor.js ───] ...waiting...
 * 
 * Each connection handles ONE request at a time.
 * Browsers open 6 connections per domain (limit).
 * 50 assets ÷ 6 connections = 8+ sequential rounds. SLOW.
 * 
 * HTTP/2 SOLUTION: Multiplexing
 * ─────────────────────────────
 * Single Connection: 
 *   Stream 1: [GET style.css ──]
 *   Stream 3: [GET app.js ─────]
 *   Stream 5: [GET logo.png ──]
 *   Stream 7: [GET font.woff ─]
 *   Stream 9: [GET data.json ─]
 *   ... ALL concurrent on ONE TCP connection!
 * 
 * ONE connection, ALL requests interleaved as binary frames.
 * No head-of-line blocking (at HTTP level — TCP still has it).
 */

// HTTP/2 Key Features:
const http2Features = {
  multiplexing: "Multiple requests/responses on ONE connection simultaneously",
  binaryFraming: "HTTP/1.1 uses text ('GET / HTTP/1.1'). HTTP/2 uses binary frames (faster to parse)",
  headerCompression: "HPACK: headers compressed. 'Cookie: session=...' sent once, referenced by index after",
  serverPush: "Server sends CSS before browser even asks (deprecated in many browsers)",
  streamPriority: "Browser hints which resources are more important (CSS > images)",
};

/**
 * HTTP/3 — QUIC Protocol (UDP-based)
 * 
 * HTTP/2's remaining problem: TCP head-of-line blocking.
 * If ONE TCP packet is lost, ALL streams wait for retransmission.
 * 
 * HTTP/3 replaces TCP with QUIC (built on UDP):
 * - Each stream has INDEPENDENT loss recovery
 * - Packet loss on Stream 5 does NOT block Stream 7
 * - 0-RTT connection establishment (vs TCP's 1-RTT + TLS's 1-RTT)
 * - Built-in encryption (TLS 1.3 is mandatory)
 * - Connection migration (switch WiFi → cellular without reconnecting)
 */

const protocolComparison = {
  "HTTP/1.1": {
    transport: "TCP",
    concurrency: "6 connections, 1 request each",
    headOfLine: "Yes (HTTP + TCP level)",
    handshake: "TCP (1 RTT) + TLS (1-2 RTT) = 2-3 RTT",
    headerFormat: "Text",
  },
  "HTTP/2": {
    transport: "TCP",
    concurrency: "1 connection, unlimited streams",
    headOfLine: "No (HTTP level), Yes (TCP level)",
    handshake: "TCP (1 RTT) + TLS (1-2 RTT) = 2-3 RTT",
    headerFormat: "Binary + HPACK compression",
  },
  "HTTP/3": {
    transport: "QUIC (UDP)",
    concurrency: "1 connection, independent streams",
    headOfLine: "No (neither level)",
    handshake: "QUIC + TLS 1.3 = 1 RTT (or 0-RTT for resumption!)",
    headerFormat: "Binary + QPACK compression",
  },
};
```

### TLS Handshake — How HTTPS Works

```typescript
/**
 * TLS 1.3 HANDSHAKE — Securing the Connection
 * 
 * TLS provides three guarantees:
 * 1. CONFIDENTIALITY — Data is encrypted (AES-256-GCM)
 * 2. INTEGRITY — Data hasn't been tampered with (HMAC)
 * 3. AUTHENTICATION — Server is who it claims to be (certificates)
 * 
 * TLS 1.3 (2018) improved over TLS 1.2:
 * - Handshake reduced from 2 RTT to 1 RTT (0 RTT for resumption)
 * - Removed insecure cipher suites (RC4, DES, MD5)
 * - Forward secrecy is mandatory (even if key is later compromised,
 *   past sessions can't be decrypted)
 */

// TLS 1.3 Handshake Flow
const tlsHandshake = {
  step1_clientHello: {
    from: "Client",
    to: "Server",
    contains: [
      "Supported TLS versions (1.3)",
      "Supported cipher suites (AES_256_GCM_SHA384, CHACHA20_POLY1305)",
      "Client's key share (Diffie-Hellman public key)",
      "SNI (Server Name Indication): which domain we want",
      // SNI is unencrypted! This is why ISPs can see which DOMAIN
      // you visit but not WHAT you're doing there.
      // ECH (Encrypted Client Hello) fixes this — still emerging.
    ],
  },
  
  step2_serverHello: {
    from: "Server",
    to: "Client",
    contains: [
      "Chosen cipher suite",
      "Server's key share (DH public key)",
      "Server's certificate (X.509, signed by CA)",
      "Certificate chain (Server cert → Intermediate CA → Root CA)",
      // The browser has ~150 trusted Root CAs pre-installed.
      // It walks the chain: Server cert signed by Intermediate?
      // Intermediate signed by Root? Root in our trust store? ✅
    ],
  },
  
  step3_keyDerivation: {
    action: "Both sides compute shared secret",
    how: "Diffie-Hellman: client_private × server_public = SAME SECRET = server_private × client_public",
    result: "Symmetric encryption key (AES-256) derived from shared secret",
    // Asymmetric crypto (RSA/ECDHE) used ONLY for key exchange.
    // Symmetric crypto (AES) used for actual data — 1000x faster.
  },
  
  step4_encrypted: {
    status: "All subsequent data is encrypted with AES-256-GCM",
    totalRTT: "1 RTT (vs TLS 1.2's 2 RTT)",
    zeroRTT: "For resumed connections: client sends data with first packet (0 RTT)",
  },
};

/**
 * CERTIFICATE CHAIN OF TRUST
 * 
 * Your Server's Cert (example.com)
 *   ↑ signed by
 * Intermediate CA (Let's Encrypt R3)
 *   ↑ signed by
 * Root CA (ISRG Root X1) ← Pre-installed in your browser/OS
 * 
 * If ANY link in the chain is invalid:
 * - Expired cert → browser shows warning
 * - Self-signed cert → not trusted (no CA vouched for it)
 * - Wrong domain → "This certificate is for bank.com, not bankk.com"
 * - Revoked cert → CA says "we no longer vouch for this" (CRL/OCSP)
 */

// Common TLS/HTTPS issues in production:
const tlsIssues = {
  "mixed_content": "Page loaded over HTTPS but includes HTTP resources → browser blocks them",
  "cert_expiry": "Let's Encrypt certs expire every 90 days — automate renewal with certbot",
  "SNI_missing": "Old clients (pre-2010) don't send SNI → can't host multiple HTTPS sites on one IP",
  "HSTS_missing": "Without Strict-Transport-Security header, users can be MITM'd on first visit",
  "cipher_suite_weak": "Supporting TLS 1.0/1.1 or weak ciphers → fails PCI compliance scans",
  "certificate_pinning": "Mobile apps pin expected cert → cert rotation breaks the app",
};
```

### WebSocket, SSE & gRPC — Beyond HTTP

```typescript
/**
 * REAL-TIME COMMUNICATION PROTOCOLS
 * 
 * HTTP is request-response (client always initiates).
 * Sometimes you need: server pushes data to client.
 */

const realtimeProtocols = {
  WebSocket: {
    description: "Full-duplex, persistent TCP connection",
    upgrade: "Starts as HTTP, upgrades via 'Upgrade: websocket' header",
    direction: "Bidirectional (both client and server can send anytime)",
    useCase: "Chat apps, live dashboards, collaborative editing, gaming",
    overhead: "2 bytes per frame (vs HTTP's ~800 bytes per request)",
    limitation: "Load balancers need special config (sticky sessions / L7)",
  },
  
  SSE: {
    description: "Server-Sent Events — one-way stream from server",
    protocol: "Regular HTTP — no special upgrade needed",
    direction: "Server → Client only",
    useCase: "Live feeds, stock tickers, notifications, log streaming",
    advantage: "Auto-reconnect, works with HTTP/2 multiplexing, simpler than WebSocket",
    limitation: "Text-only (no binary), server-to-client only",
  },
  
  gRPC: {
    description: "Google's RPC framework using HTTP/2 + Protocol Buffers",
    serialization: "Protobuf (binary, ~10x smaller than JSON, strongly typed)",
    direction: "Unary, Server streaming, Client streaming, Bidirectional streaming",
    useCase: "Microservice-to-microservice communication (internal APIs)",
    advantage: "Code generation, type safety, streaming, smaller payloads",
    limitation: "Not browser-friendly (needs gRPC-Web proxy), less human-readable",
  },
  
  LongPolling: {
    description: "Client sends request, server holds it open until data is available",
    protocol: "Regular HTTP",
    direction: "Simulated push (server responds when ready)",
    useCase: "Fallback when WebSocket isn't available",
    limitation: "Higher latency, more connections, inefficient",
  }
};
```

---

## 6. Real World Applications 🌍

### 1. 🔒 CORS — Why Your API Returns 403

```typescript
/**
 * CORS (Cross-Origin Resource Sharing)
 * 
 * Browser security: JavaScript on site-a.com CANNOT fetch site-b.com's API
 * unless site-b.com explicitly allows it via CORS headers.
 * 
 * This is a BROWSER-ONLY restriction. Server-to-server requests ignore CORS.
 * Postman works because it's not a browser.
 * 
 * Preflight: For non-simple requests (PUT, DELETE, custom headers),
 * the browser sends an OPTIONS request first to check permissions.
 */

// Express CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://myapp.com');  // or '*'
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24h
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Preflight response — no body needed
  }
  next();
});
```

### 2. 🌍 CDN — How Content Gets to Users Fast

```
User in Mumbai requests image.jpg from server in Virginia:
  Without CDN: Mumbai → Atlantic Ocean → Virginia → response back = 300ms
  With CDN:    Mumbai → CDN edge in Mumbai (cached) = 20ms

CDN Flow:
1. User requests image.jpg from cdn.example.com
2. DNS routes to nearest CDN edge (anycast routing)
3. Edge has cached copy? → Serve immediately (cache HIT)
4. Edge has no copy? → Fetch from origin, cache it, serve (cache MISS)
5. Future requests from same region → cache HIT (fast)

Cache Invalidation:
  Cache-Control: max-age=31536000  → Cache for 1 year (static assets)
  Cache-Control: no-cache           → Revalidate with origin every time
  Cache-Control: no-store            → Never cache (sensitive data)
  
  For versioned assets: style.abc123.css → cache forever, new version = new URL
```

### 3. ⚡ Keep-Alive and Connection Pooling

```typescript
/**
 * Every HTTP request over a new TCP connection costs:
 *   TCP handshake: 1 RTT (~30ms)
 *   TLS handshake: 1 RTT (~30ms)
 *   HTTP request:  1 RTT (~30ms)
 *   Total: ~90ms overhead PER REQUEST
 * 
 * With Keep-Alive (HTTP/1.1 default):
 *   First request: 90ms (handshakes)
 *   Second request: 30ms (reuse connection!)
 *   Third request: 30ms
 * 
 * Node.js HTTP agent with keep-alive:
 */
import http from 'http';

const agent = new http.Agent({
  keepAlive: true,        // Reuse TCP connections
  maxSockets: 100,        // Max concurrent connections per host
  keepAliveMsecs: 60_000, // Keep idle connections for 60 seconds
});

// All requests through this agent reuse TCP connections
const response = await fetch('https://api.example.com/data', {
  agent, // Node.js 18+ uses undici, configure differently
});
```

---

## 7. Complexity Analysis 🧠

### HTTP Status Codes Cheat Sheet

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | Successful GET, PUT |
| **201** | Created | Successful POST (resource created) |
| **204** | No Content | Successful DELETE (nothing to return) |
| **301** | Moved Permanently | URL permanently changed (SEO redirect) |
| **302** | Found (Temp Redirect) | URL temporarily changed |
| **304** | Not Modified | Client's cached version is still valid |
| **400** | Bad Request | Invalid input (validation error) |
| **401** | Unauthorized | Not logged in (authentication required) |
| **403** | Forbidden | Logged in but no permission (authorization) |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Duplicate (e.g., email already registered) |
| **422** | Unprocessable | Valid syntax but semantic error |
| **429** | Too Many Requests | Rate limited |
| **500** | Internal Server Error | Unhandled server exception |
| **502** | Bad Gateway | Upstream server returned invalid response |
| **503** | Service Unavailable | Server overloaded or in maintenance |
| **504** | Gateway Timeout | Upstream server didn't respond in time |

### Protocol Selection Guide

```
"Client-server API calls?"
  └──▶ REST over HTTP/2 (or GraphQL for complex data needs)

"Server pushing real-time updates to browser?"
  └──▶ SSE (one-way) or WebSocket (bidirectional)

"Microservice-to-microservice internal calls?"
  └──▶ gRPC (type-safe, fast, streaming)

"Low-latency gaming or video?"
  └──▶ UDP-based protocol (WebRTC for browser, raw UDP for servers)

"File uploads > 100MB?"
  └──▶ Chunked upload with resumability (tus protocol)
```

### Interview Tips 💡

1. **"What happens when you type google.com?"** — "DNS resolution (browser cache → OS cache → recursive resolver → root → TLD → authoritative). TCP 3-way handshake. TLS 1.3 handshake (1 RTT). HTTP/2 request. Server processes. Response with HTML. Browser parses HTML, builds DOM, fetches subresources, renders."
2. **"TCP vs UDP?"** — "TCP is reliable (retransmission, ordering, flow control) but has higher latency due to handshakes. UDP is unreliable but faster — no handshake, no retransmission. Use TCP for web, databases, email. Use UDP for video, gaming, DNS, VoIP."
3. **"How does HTTPS work?"** — "TLS sits between HTTP and TCP. The client sends supported ciphers, the server sends its certificate (signed by a CA). Both sides do a Diffie-Hellman key exchange to derive a shared symmetric key. All subsequent data is encrypted with AES-256-GCM. The beauty: even if the server's private key is later compromised, past sessions can't be decrypted (forward secrecy)."
4. **"What's the difference between HTTP/2 and HTTP/3?"** — "HTTP/2 uses TCP — so a single lost packet blocks ALL streams (TCP head-of-line blocking). HTTP/3 uses QUIC (UDP-based) where each stream has independent loss recovery. HTTP/3 also has 0-RTT resumption and built-in encryption."
5. **"Explain CORS."** — "It's a browser security mechanism. JavaScript on origin A cannot fetch from origin B unless B's server explicitly allows it via `Access-Control-Allow-Origin` headers. It's browser-only — curl and server-to-server calls ignore it. Non-simple requests (PUT, DELETE, custom headers) trigger a preflight OPTIONS request first."
6. **"What's the difference between 401 and 403?"** — "401 means 'who are you?' — the request lacks valid authentication credentials (login required). 403 means 'I know who you are, but you don't have permission' — authenticated but not authorized for this resource."
7. **"How does DNS-based load balancing work?"** — "The DNS server returns multiple A records for the same domain in round-robin order. Each client gets a different IP. Limitation: no health checks (clients may get routed to a dead server), no session affinity, and DNS caching makes changes slow to propagate. That's why production systems use an actual load balancer (ALB/NLB) behind a single DNS entry."
