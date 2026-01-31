# Design Uber (Ride Sharing) 🚕

## 1. The "Dispatch" Analogy

Imagine a busy taxi stand at an airport, but distributed across an entire city.
*   **The Problem:** 10,000 Riders want cars. 12,000 Drivers are available. They are all moving constantly.
*   **The Goal:** Match Rider A with Driver B who is:
    1.  Closest (ETA).
    2.  Available.
    3.  Willing to accept the fare.

**The Complexity:**
*   Latitude/Longitude changes every 4 seconds.
*   "Closest" isn't straight line distance; it's road distance (Route planning).
*   Supply (Drivers) vs Demand (Riders) fluctuates wildly (Surge Pricing).

---

## 2. Core Constraints & Requirements

**Functional:**
*   Update driver location every 4 seconds.
*   Match rider to driver (Dispatch).
*   Calculate ETA and Prices.
*   Process Payment.

**Non-Functional:**
*   **Low Latency:** Matching must happen in < 1 second.
*   **High Availability:** The app cannot go down during New Year's Eve.
*   **Consistency:** A driver cannot be matched to two riders at once (Strong Consistency for Trip State).

---

## 3. High-Level Architecture 🏗️

```visualizer
{
  "type": "architecture-diagram",
  "content": "graph TD\n    Mobile_Driver-->|Updates Loc (4s)| LB[Load Balancer]\n    Mobile_Rider-->|Request Ride| LB\n    \n    LB-->Dispatch[Dispatch Service]\n    LB-->Location[Location Service]\n    \n    Location-->|Geohash Update| Redis[(Redis - GeoSpatial)]\n    \n    Dispatch-->|Query Nearby| redis_read[Redis (Read)]\n    Dispatch-->|Match| Trip[Trip Service]\n    \n    Trip-->|State: REQUESTED| PG[(Postgres - Trips)]\n    Trip-->|Match Logic| Matching[Matching Engine]\n    \n    Matching-->|Notification| Push[Push Notification]\n    Push-->Mobile_Driver"
}
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

### TypeScript: QuadTree Concept
Imagine dividing the map into 4 quadrants recursively.

```typescript
type Point = { id: string, lat: number, lon: number };
type Box = { minLat: number, minLon: number, maxLat: number, maxLon: number };

class QuadTree {
  capacity: number = 4;
  points: Point[] = [];
  divided: boolean = false;
  
  // Children
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

**Process:**
1.  Rider requests trip at `Location A`.
2.  Dispatch Service queries Location Service (Redis Geo) for drivers with radius `R`.
    *   *Search 1km. Found 0? Search 2km.*
3.  List of candidates: `[D1, D2, D3]`.
4.  Filter candidates:
    *   Exclude drivers currently in a trip (Status check).
    *   Exclude drivers who just rejected this ride.
5.  **Locking:** Sends request to `Driver 1`.
    *   *Optimistic Lock:* `Driver 1` has 10 seconds to accept.
    *   If `Driver 1` ignores, move to `Driver 2`.

**Matching Strategy:**
*   **Greedy:** Connect to nearest driver. (Simple, but maybe not globally optimal).
*   **Global Optimization:** Batched matching. Wait 5 seconds, collect all requests in San Francisco, and run a bipartite matching algorithm (Hungarian Algorithm) to minimize *total* wait time for everyone.

---

## 6. Scenario B: High Traffic (Surge Pricing)

**Problem:** Demand > Supply.
**Goal:** Increase Price to (1) Encourage drivers to come online/move to this area, (2) Discourage low-value rides.

**Implementation:**
*   **Hexagons (H3):** Divide city into small hexagonal zones.
*   **Analytics:** Count `#RequestOpen` vs `#DriversAvailable`.
*   **Ratio:** If Ratio > 1.5, start Surge Multiplier.
*   **Consistency:** The price must be locked when the user requests the ride. Use a `Price Service` that generates a `QuoteId` valid for 2 minutes.

---

## 7. Deep Dive: Google S2 vs Geohash vs Uber H3

| Algo | Shape | Pros | Used By |
| :--- | :--- | :--- | :--- |
| **Geohash** | Rectangles | Human readable strings. Strings sharing prefix are close. | MongoDB, Redis |
| **Google S2** | Cells (Curved) | Mathematical projection on sphere. Very accurate. | Google Maps, Tinder |
| **Uber H3** | Hexagons | Neighbors are equidistant (6 neighbors). Smooth gradients for pricing. | Uber |

**Why Hexagons?**
*   Circles don't tessellate (leave gaps).
*   Squares have corners (diagonal distance > side distance).
*   Hexagons are the "Roundest" polygon that fills a plane. Moving from Center to any neighbor is roughly the same distance.

---

## 8. Data Model Schema

**Table: Trips (PostgreSQL - Sharded by City)**
| ID | RiderID | DriverID | PickupLat | PickupLon | Status | CreatedAt |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| uuid | uuid | uuid | 37.77 | -122.41 | REQUESTED | TS |

**Table: ActiveDrivers (Redis - Ephemeral)**
*   Key: `driver:{id}:loc` -> `{lat, lon, status, updatedAt}`
*   Key: `geo:city:sf` -> `GEOADD set` (for spatial queries)

---

## 9. Interview Tips 💡

1.  **Don't match instantly:** "We delay matching by windowing (e.g., 2 seconds) to allow batch optimization."
2.  **Consistency:** "Location updates are high throughput/data loss OK (UDP or Fire-and-forget). Trip payments are low throughput/ACID required."
3.  **Ringpop:** Uber developed `Ringpop`, a consistent hash ring for application-layer sharding (Node.js). It allows dispatchers to handle specific geohashes statefully.
