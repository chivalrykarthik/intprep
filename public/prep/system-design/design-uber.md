# Design Uber (Ride Sharing) 🚕

## 1. The "Dispatch" Analogy

Imagine a busy taxi stand at an airport, but distributed across an entire city.
*   **The Problem:** 10,000 Riders want cars. 12,000 Drivers are available. They are all moving constantly.
*   **The Goal:** Match Rider A with Driver B who is:
    1.  Closest (ETA).
    2.  Available.
    3.  Willing to accept the fare.

**The Complexity:**
*   Latitude/Longitude changes every 4 seconds for every active driver.
*   "Closest" isn't straight line distance; it's road distance (Route planning).
*   Supply (Drivers) vs Demand (Riders) fluctuates wildly (Surge Pricing).
*   The entire matching process must complete in under 1 second.

---

## 2. Core Constraints & Requirements

**Functional:**
*   Update driver location every 4 seconds.
*   Match rider to driver (Dispatch).
*   Calculate ETA and Prices.
*   Real-time trip tracking (rider sees driver on map).
*   Process Payment.
*   Ratings for both rider and driver.

**Non-Functional:**
*   **Low Latency:** Matching must happen in < 1 second.
*   **High Availability:** The app cannot go down during New Year's Eve.
*   **Consistency:** A driver cannot be matched to two riders at once (Strong Consistency for Trip State).
*   **Scale:** 20M rides/day, 5M concurrent drivers, 1M location updates/sec.

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                    UBER ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Driver App           Rider App                                │
│   ┌─────────┐          ┌─────────┐                              │
│   │ GPS Loc │          │ Request │                              │
│   │ (4s)    │          │ Ride    │                              │
│   └────┬────┘          └────┬────┘                              │
│        │                    │                                   │
│   ┌────▼────────────────────▼────┐                              │
│   │        Load Balancer         │                              │
│   └──┬──────────┬─────────┬──────┘                              │
│      │          │         │                                     │
│   ┌──▼───┐  ┌──▼──────┐  ┌▼────────┐                           │
│   │Loc   │  │Dispatch │  │Trip     │                           │
│   │Svc   │  │Service  │  │Service  │                           │
│   └──┬───┘  └──┬──────┘  └┬────────┘                           │
│      │         │          │                                     │
│   ┌──▼─────────▼──┐    ┌─▼──────────┐                          │
│   │ Redis Geo     │    │ PostgreSQL │                          │
│   │ (Driver Locs) │    │ (Trips,    │                          │
│   │ GEOADD/       │    │  Payments, │                          │
│   │ GEORADIUS     │    │  Users)    │                          │
│   └───────────────┘    └────────────┘                          │
│                                                                 │
│   Key Insight:                                                  │
│   • Location data = AP (ephemeral, high throughput, Redis)      │
│   • Trip data = CP (ACID, money, PostgreSQL)                    │
│   • Matching = Optimistic locking (10s accept window)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Component: Spatial Indexing (Geohash / QuadTree)

**Problem:** How do you find "All drivers within 1km of (X, Y)" efficiently?
**Naive SQL:** `SELECT * FROM Drivers WHERE sqrt((x-x1)^2 + (y-y1)^2) < 1`
*   **Fail:** This scans the entire table. Calculating square roots for millions of rows is slow.

**Solution: Geohashing (or Google S2)**
Convert 2D coordinates into a 1D string/number.
*   `(37.77, -122.41)` -> `"9q8yy"`
*   **Prefix Sharing:** Users in the same neighborhood share the same string prefix.
*   **Query:** `SELECT * FROM Drivers WHERE geohash LIKE '9q8%'` (Fast Index Scan!).

### TypeScript: Geohash Location Service

```typescript
/**
 * LOCATION SERVICE — Driver Position Management
 * 
 * Every active driver sends GPS coordinates every 4 seconds.
 * We store these in Redis using its built-in geospatial commands.
 * 
 * Redis GEOADD/GEORADIUS uses geohashing internally.
 * 
 * @timeComplexity GEOADD: O(log N), GEORADIUS: O(N+log(M)) 
 *                 where N = elements in radius, M = total elements
 * @spaceComplexity O(D) where D = number of active drivers
 */

class LocationService {
  private redis: RedisClient;

  /**
   * Called when driver sends location update (every 4 seconds).
   */
  async updateDriverLocation(
    driverId: string, lat: number, lon: number, city: string
  ): Promise<void> {
    // 1. Store in geospatial index (per-city for efficiency)
    await this.redis.geoadd(`drivers:${city}`, lon, lat, driverId);

    // 2. Store driver metadata (status, vehicle type, rating)
    await this.redis.hset(`driver:${driverId}`, {
      lat: lat.toString(),
      lon: lon.toString(),
      updated_at: Date.now().toString(),
      status: 'AVAILABLE', // or 'ON_TRIP', 'OFFLINE'
    });

    // 3. Set TTL — if driver stops sending updates, they're "offline"
    await this.redis.expire(`driver:${driverId}`, 15); // 15 seconds
  }

  /**
   * Find nearby available drivers.
   * 
   * Strategy: Start with small radius, expand if not enough candidates.
   */
  async findNearbyDrivers(
    lat: number, lon: number, city: string, minDrivers: number = 5
  ): Promise<DriverMatch[]> {
    const radii = [1, 2, 5, 10]; // km — expanding search

    for (const radius of radii) {
      const nearby = await this.redis.georadius(
        `drivers:${city}`,
        lon, lat,
        radius, 'km',
        'WITHCOORD', 'WITHDIST',
        'ASC', // Sorted by distance
        'COUNT', 20 // Limit candidates
      );

      // Filter by availability
      const available: DriverMatch[] = [];
      for (const driver of nearby) {
        const meta = await this.redis.hgetall(`driver:${driver.id}`);
        if (meta?.status === 'AVAILABLE') {
          available.push({
            driverId: driver.id,
            distance: driver.distance,
            lat: driver.coords.lat,
            lon: driver.coords.lon,
            rating: parseFloat(meta.rating || '4.5'),
          });
        }
      }

      if (available.length >= minDrivers) {
        return available;
      }
    }

    return []; // No drivers found in any radius
  }
}
```

### QuadTree Concept

Imagine dividing the map into 4 quadrants recursively:

```typescript
type Point = { id: string; lat: number; lon: number };
type Box = { minLat: number; minLon: number; maxLat: number; maxLon: number };

class QuadTree {
  capacity: number = 4;
  points: Point[] = [];
  divided: boolean = false;
  
  nw: QuadTree | null = null;
  ne: QuadTree | null = null;
  sw: QuadTree | null = null;
  se: QuadTree | null = null;

  constructor(public boundary: Box) {}

  insert(point: Point) {
    if (!this.inBoundary(point)) return;

    if (this.points.length < this.capacity) {
      this.points.push(point);
    } else {
      if (!this.divided) this.subdivide();
      this.nw!.insert(point);
      this.ne!.insert(point);
      this.sw!.insert(point);
      this.se!.insert(point);
    }
  }

  queryRange(range: Box): Point[] {
    const found: Point[] = [];
    if (!this.intersects(this.boundary, range)) return found;

    for (const p of this.points) {
      if (this.intersectsPoint(range, p)) found.push(p);
    }

    if (this.divided) {
      found.push(...this.nw!.queryRange(range));
      found.push(...this.ne!.queryRange(range));
      found.push(...this.sw!.queryRange(range));
      found.push(...this.se!.queryRange(range));
    }
    return found;
  }
  
  // ... helper methods for boundary checks
}
```

---

## 5. Scenario A: Dispatch Service (The Matchmaker)

**Real-Life Scenario:** A rider requests a trip. The system must find, rank, and match the best driver.

**Technical Problem:** Implement the dispatch flow with proper locking to prevent double-matching.

### TypeScript Implementation

```typescript
/**
 * DISPATCH SERVICE — Rider-Driver Matching
 * 
 * Flow:
 * 1. Rider requests ride at Location A
 * 2. Find nearby drivers (Location Service)
 * 3. Score and rank candidates
 * 4. Send offer to top driver (10s accept window)
 * 5. If rejected/timeout → next driver
 * 6. If accepted → create Trip
 * 
 * @timeComplexity O(D log D) where D = nearby drivers (sort by score)
 */

type TripStatus = 'MATCHING' | 'DRIVER_ASSIGNED' | 'EN_ROUTE' | 
                  'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface RideRequest {
  riderId: string;
  pickupLat: number;
  pickupLon: number;
  dropoffLat: number;
  dropoffLon: number;
  vehicleType: 'ECONOMY' | 'PREMIUM' | 'XL';
  city: string;
}

class DispatchService {
  private locationService: LocationService;
  private pricingService: PricingService;
  private tripDb: TripDatabase;
  private pushService: PushNotificationService;
  private redis: RedisClient;

  async matchRide(request: RideRequest): Promise<MatchResult> {
    // 1. Get price estimate (lock the price with a QuoteId)
    const quote = await this.pricingService.getQuote({
      pickup: { lat: request.pickupLat, lon: request.pickupLon },
      dropoff: { lat: request.dropoffLat, lon: request.dropoffLon },
      vehicleType: request.vehicleType,
      city: request.city,
    });

    // 2. Find nearby available drivers
    const candidates = await this.locationService.findNearbyDrivers(
      request.pickupLat, request.pickupLon, request.city
    );

    if (candidates.length === 0) {
      return { status: 'NO_DRIVERS', message: 'No drivers available nearby' };
    }

    // 3. Score and rank candidates
    const ranked = this.rankDrivers(candidates, request);

    // 4. Try matching with each driver (waterfall)
    for (const driver of ranked) {
      // Optimistic lock: Prevent driver from being matched to two riders
      const locked = await this.redis.set(
        `lock:driver:${driver.driverId}`,
        request.riderId,
        'NX',  // Only if not exists
        'EX', 15 // 15 second TTL
      );

      if (!locked) {
        // Driver already being offered to another rider
        continue;
      }

      // 5. Send ride offer to driver (push notification + WebSocket)
      await this.pushService.sendRideOffer(driver.driverId, {
        riderId: request.riderId,
        pickup: { lat: request.pickupLat, lon: request.pickupLon },
        price: quote.driverEarning,
        estimatedPickupTime: driver.eta,
      });

      // 6. Wait for driver response (10 second timeout)
      const response = await this.waitForDriverResponse(driver.driverId, 10_000);

      if (response === 'ACCEPTED') {
        // Create the trip!
        const trip = await this.tripDb.create({
          riderId: request.riderId,
          driverId: driver.driverId,
          status: 'DRIVER_ASSIGNED',
          pickupLat: request.pickupLat,
          pickupLon: request.pickupLon,
          dropoffLat: request.dropoffLat,
          dropoffLon: request.dropoffLon,
          quoteId: quote.id,
          estimatedPrice: quote.riderPrice,
        });

        // Update driver status
        await this.redis.hset(`driver:${driver.driverId}`, 'status', 'ON_TRIP');

        return { status: 'MATCHED', trip };
      }

      // Driver rejected or timed out — release lock and try next
      await this.redis.del(`lock:driver:${driver.driverId}`);
    }

    return { status: 'NO_MATCH', message: 'All drivers rejected or timed out' };
  }

  /**
   * Score drivers based on multiple factors (not just distance).
   */
  private rankDrivers(candidates: DriverMatch[], request: RideRequest): DriverMatch[] {
    return candidates
      .map(driver => ({
        ...driver,
        score: this.calculateScore(driver, request),
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateScore(driver: DriverMatch, request: RideRequest): number {
    const distanceWeight = 0.5;
    const ratingWeight = 0.3;
    const acceptRateWeight = 0.2;

    // Closer = better (invert distance, cap at 10km)
    const distanceScore = Math.max(0, 1 - driver.distance / 10);
    const ratingScore = driver.rating / 5.0;
    const acceptScore = driver.acceptanceRate || 0.85;

    return (
      distanceWeight * distanceScore +
      ratingWeight * ratingScore +
      acceptRateWeight * acceptScore
    );
  }
}
```

---

## 6. Scenario B: Trip State Machine & Surge Pricing

**Real-Life Scenario:** Managing the lifecycle of a trip from request to completion, plus dynamic pricing.

### Trip State Machine

```
┌──────────────────────────────────────────────────────┐
│              TRIP STATE MACHINE                       │
│                                                      │
│   MATCHING ──▶ DRIVER_ASSIGNED ──▶ EN_ROUTE          │
│      │              │                │               │
│      ▼              ▼                ▼               │
│   NO_MATCH      CANCELLED         ARRIVED            │
│                                      │               │
│                                      ▼               │
│                                  IN_PROGRESS         │
│                                      │               │
│                                      ▼               │
│                                  COMPLETED           │
│                                      │               │
│                                      ▼               │
│                                  PAYMENT_PROCESSED   │
│                                                      │
│   Cancelled can happen from: MATCHING,               │
│   DRIVER_ASSIGNED, EN_ROUTE (by either party)        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Surge Pricing

```typescript
/**
 * SURGE PRICING SERVICE
 * 
 * Problem: Demand > Supply in a specific area.
 * Goal: Increase price to encourage more drivers and discourage low-value rides.
 * 
 * Implementation: H3 hexagonal grid for uniform area division.
 */

class SurgePricingService {
  private redis: RedisClient;

  /**
   * Calculate surge multiplier for a given location.
   * 
   * Uses Uber's H3 hexagonal grid system.
   * Each hexagon tracks live supply/demand ratio.
   */
  async getSurgeMultiplier(lat: number, lon: number, city: string): Promise<number> {
    const hexId = h3.geoToH3(lat, lon, 8); // Resolution 8 (~460m edge)

    // Count open ride requests in this hex (last 5 minutes)
    const demand = await this.redis.get(`surge:demand:${hexId}`) || 0;

    // Count available drivers in this hex
    const supply = await this.redis.get(`surge:supply:${hexId}`) || 1;

    const ratio = Number(demand) / Math.max(Number(supply), 1);

    // Surge tiers
    if (ratio > 3.0) return 2.5;  // Extreme demand
    if (ratio > 2.0) return 2.0;
    if (ratio > 1.5) return 1.5;
    if (ratio > 1.2) return 1.25;
    return 1.0; // No surge

    // Note: Real Uber uses ML models, not static tiers.
    // The price is LOCKED when user requests ride (QuoteId valid for 2 min).
  }
}
```

---

## 7. Spatial Indexing: Geohash vs S2 vs H3

| Algorithm | Shape | Pros | Used By |
| :--- | :--- | :--- | :--- |
| **Geohash** | Rectangles | Human readable strings. Strings sharing prefix are close. | MongoDB, Redis |
| **Google S2** | Cells (Curved) | Mathematical projection on sphere. Very accurate. | Google Maps, Tinder |
| **Uber H3** | Hexagons | Neighbors are equidistant (6 neighbors). Smooth gradients for pricing. | Uber |

**Why Hexagons?**
*   Circles don't tessellate (leave gaps).
*   Squares have corners (diagonal distance > side distance).
*   Hexagons are the "roundest" polygon that fills a plane. Moving from center to any neighbor is roughly the same distance. Perfect for surge pricing heat maps.

---

## 8. Real World Applications 🌍

### 1. 🚕 Uber's Production Architecture

**Key Design Decisions:**
- **Ringpop:** Uber developed Ringpop, a consistent hash ring for application-layer sharding. Dispatchers handle geohash ranges statefully.
- **Google S2 → H3:** Migrated from S2 to their own H3 library for better pricing/ETA granularity.
- **Schemaless DB:** Custom MySQL wrapper for horizontal scaling.
- **Kafka:** Every location update, trip event, and price change flows through Kafka for analytics.

### 2. 🗺️ Google Maps (ETA Service)

Uber uses a roads graph (not straight-line distance) for ETA:
- **Dijkstra/A*** for route planning.
- Live traffic data adjusts edge weights.
- Precomputed routing tiles for fast lookup.
- ETA updates every 15 seconds during a trip.

### 3. 💰 Payment Service

- **Metered trips:** Final price = base fare + (rate × distance) + (rate × time) + surge.
- **Two-phase:** Auth hold when trip starts → Capture when trip ends.
- **Split payments:** Multiple payment methods per trip.
- **Tips:** Processed separately, 100% to driver.

---

## 9. Complexity Analysis 🧠

### Data Model Schema

```
trips (PostgreSQL — Sharded by City)
─────────────────────────────────────
  id:           UUID       PRIMARY KEY
  rider_id:     UUID       FK → users
  driver_id:    UUID       FK → users
  status:       ENUM       (MATCHING, ASSIGNED, EN_ROUTE, ...)
  vehicle_type: ENUM       (ECONOMY, PREMIUM, XL)
  pickup_lat:   DECIMAL
  pickup_lon:   DECIMAL
  dropoff_lat:  DECIMAL
  dropoff_lon:  DECIMAL
  quote_id:     UUID       FK → quotes
  actual_price: DECIMAL    (set on completion)
  surge_mult:   DECIMAL    DEFAULT 1.0
  created_at:   TIMESTAMP
  completed_at: TIMESTAMP


active_drivers (Redis — Ephemeral)
──────────────────────────────────
  GeoSet:  "drivers:{city}" → GEOADD (lon, lat, driverId)
  Hash:    "driver:{id}"    → { lat, lon, status, vehicle_type, rating }
  Lock:    "lock:driver:{id}" → riderId (NX, 15s TTL)


quotes (DynamoDB — High Read)
─────────────────────────────
  id:             UUID
  rider_id:       UUID
  pickup/dropoff: GeoJSON
  rider_price:    DECIMAL
  driver_earning: DECIMAL
  surge_mult:     DECIMAL
  expires_at:     TIMESTAMP (2 min TTL)
```

### Back-of-Envelope Estimation

```
Scale:
  - 20M rides/day, 500K peak concurrent trips
  - 5M active drivers sending GPS every 4 seconds
  - Location update QPS: 5M / 4 = 1.25M updates/sec
  - Ride requests: 20M / 86400 ≈ 230 requests/sec (avg)
  - Peak ride requests (5x): 1,150 requests/sec

Storage:
  - Trip record: ~500 bytes
  - 20M trips/day × 500 bytes = 10GB/day = 3.6TB/year
  - Location updates: 1.25M/sec × 50 bytes = 62.5MB/sec (Redis, ephemeral)
  - GPS trace logs (Kafka): 1.25M/sec × 50 bytes = 5.4TB/day

Bandwidth:
  - Driver location updates: 1.25M/sec × 50 bytes = 62.5MB/sec inbound
  - Rider app map updates: 500K active trips × 1 update/sec × 200 bytes = 100MB/sec

Redis Memory:
  - 5M drivers × 200 bytes = 1GB (easily fits in one large Redis instance)
  - With replication: 3GB
```

### API Design

```
POST   /api/v1/rides/estimate    → { pickup, dropoff } → price estimate
POST   /api/v1/rides/request     → { pickup, dropoff, quoteId } → trip created
PUT    /api/v1/rides/:id/cancel  → cancel ride
PUT    /api/v1/rides/:id/accept  → driver accepts (driver-side)

PUT    /api/v1/drivers/location  → { lat, lon } (every 4s)
PUT    /api/v1/drivers/status    → { status: 'AVAILABLE' | 'OFFLINE' }

GET    /api/v1/rides/:id         → trip details + live driver location
GET    /api/v1/rides/:id/route   → polyline for map rendering
```

### Interview Tips 💡

1.  **Don't match instantly:** "We delay matching by windowing (e.g., 2 seconds) to allow batch optimization (Hungarian algorithm for globally optimal matching)."
2.  **Two data tiers:** "Location updates are high throughput, loss-tolerant (Redis, AP). Trip payments are low throughput, ACID required (PostgreSQL, CP)."
3.  **Ringpop:** "Uber developed Ringpop, a consistent hash ring for stateful geohash routing — dispatchers own specific geographic regions."
4.  **H3 Hexagons:** "Uber uses H3 hexagonal grids because hexagon neighbors are equidistant — perfect for surge pricing and ETA calculations."
5.  **Optimistic Locking:** "A driver lock (Redis NX with TTL) prevents double-matching. If the lock fails, try the next driver."
6.  **WebSocket for Live Tracking:** "Rider app gets driver location via WebSocket every 1-2 seconds during the trip."
7.  **ETA Prediction:** "Uses road graph (not straight line) with live traffic data. ML models adjust based on time of day, weather, and events."
