# API Design 🔌

## 1. The "Restaurant Menu" Analogy

Your API is like a restaurant menu that customers (clients) use to order from your kitchen (server).

**Bad Menu (Confusing API):**
- "Item #47 with modification code B and sauce request form appendix C"
- Server has to guess what you want
- Every visit, the menu changes without warning

**Good Menu (Clean API):**
- "Burger, medium-rare, no onions, add bacon"
- Clear categories, consistent naming
- Prices (response times) are listed
- Allergen info (error handling) is provided

**This is API Design.** Creating a clear, consistent, and developer-friendly contract between your services and their consumers.

---

## 2. The Core Concept

In system design interviews, API design demonstrates your ability to think about user experience, scalability, and maintainability.

**Bad API (Nightmare to Use):**
```
GET /getUser?userId=5
POST /CreateNewUser
GET /api/v1/users/fetch-all-users
DELETE /deleteTheUser/5
PUT /api/users/updateUserData/5
```

**Good API (RESTful, Predictable):**
```
GET    /users        → List all users (with pagination)
POST   /users        → Create a new user
GET    /users/5      → Get user with ID 5
PUT    /users/5      → Replace user 5 entirely
PATCH  /users/5      → Update specific fields of user 5
DELETE /users/5      → Delete user 5

GET    /users/5/orders      → Get orders for user 5
POST   /users/5/orders      → Create order for user 5
```
- **Boom.** Predictable, intuitive, self-documenting.

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                    API DESIGN STYLES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  REST                  GraphQL              gRPC                │
│  ════                  ═══════              ════                │
│                                                                 │
│  GET /users/123        query {              UserService.        │
│  GET /users/123/posts    user(id:123) {       GetUser(id:123)   │
│  GET /posts/456           name                                  │
│                           posts { title }   Binary Protocol     │
│  Multiple Requests         }               Single Request       │
│                         }                                       │
│                                                                 │
│  ┌─────────────────┐   ┌─────────────────┐ ┌─────────────────┐  │
│  │ Over-fetching   │   │ Exact data only │ │ Strongly typed  │  │
│  │ Under-fetching  │   │ Single endpoint │ │ Streaming       │  │
│  │ Multiple trips  │   │ Complex caching │ │ High perf       │  │
│  └─────────────────┘   └─────────────────┘ └─────────────────┘  │
│                                                                 │
│  Best: CRUD/Public     Best: Complex UIs   Best: Microservices  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: RESTful API Deep Dive

**Real-Life Scenario:** You're designing an API for a task management application.

**Technical Problem:** Design a complete RESTful API following best practices.

### TypeScript Implementation

```typescript
/**
 * RESTful API Design Principles
 * 
 * 1. Use NOUNS for resources, not verbs
 * 2. Use plural nouns consistently
 * 3. Use HTTP methods to indicate action
 * 4. Use proper status codes
 * 5. Version your API
 * 6. Support pagination, filtering, sorting
 */

// ============================================
// RESOURCE DESIGN
// ============================================

// ❌ Bad: Verbs in URL
// GET /getTask, POST /createTask, DELETE /removeTask

// ✓ Good: Resources with HTTP methods
// GET /tasks, POST /tasks, DELETE /tasks/:id

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId: string;
  projectId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ENDPOINT DEFINITIONS
// ============================================

const taskEndpoints = {
  // LIST with pagination, filtering, sorting
  // GET /api/v1/tasks?page=1&limit=20&status=todo&sort=-priority
  list: {
    method: 'GET',
    path: '/api/v1/tasks',
    queryParams: {
      page: 'number (default: 1)',
      limit: 'number (default: 20, max: 100)',
      status: 'todo | in_progress | done',
      priority: 'low | medium | high',
      assigneeId: 'string (filter by assignee)',
      projectId: 'string (filter by project)',
      sort: 'string (e.g., -priority,dueDate)',
      search: 'string (full-text search in title/description)',
    },
    response: {
      status: 200,
      body: {
        data: 'Task[]',
        meta: {
          page: 1,
          limit: 20,
          total: 150,
          totalPages: 8,
        },
        links: {
          self: '/api/v1/tasks?page=1&limit=20',
          next: '/api/v1/tasks?page=2&limit=20',
          prev: null,
        },
      },
    },
  },

  // GET single resource
  // GET /api/v1/tasks/123
  get: {
    method: 'GET',
    path: '/api/v1/tasks/:id',
    response: {
      status: 200,
      body: { data: 'Task' },
    },
    errors: [
      { status: 404, message: 'Task not found' },
    ],
  },

  // CREATE resource
  // POST /api/v1/tasks
  create: {
    method: 'POST',
    path: '/api/v1/tasks',
    body: {
      title: 'string (required)',
      description: 'string (optional)',
      status: 'string (default: todo)',
      priority: 'string (default: medium)',
      assigneeId: 'string (optional)',
      projectId: 'string (required)',
      dueDate: 'ISO 8601 date (optional)',
    },
    response: {
      status: 201, // Created
      headers: { Location: '/api/v1/tasks/124' },
      body: { data: 'Task' },
    },
    errors: [
      { status: 400, message: 'Validation error' },
      { status: 401, message: 'Unauthorized' },
    ],
  },

  // FULL UPDATE (replace)
  // PUT /api/v1/tasks/123
  replace: {
    method: 'PUT',
    path: '/api/v1/tasks/:id',
    body: 'Complete Task object (all fields required)',
    response: { status: 200, body: { data: 'Task' } },
  },

  // PARTIAL UPDATE
  // PATCH /api/v1/tasks/123
  update: {
    method: 'PATCH',
    path: '/api/v1/tasks/:id',
    body: 'Partial Task object (only fields to update)',
    response: { status: 200, body: { data: 'Task' } },
  },

  // DELETE resource
  // DELETE /api/v1/tasks/123
  delete: {
    method: 'DELETE',
    path: '/api/v1/tasks/:id',
    response: { status: 204 }, // No Content
    errors: [
      { status: 404, message: 'Task not found' },
      { status: 403, message: 'Cannot delete completed tasks' },
    ],
  },

  // SUB-RESOURCES
  // GET /api/v1/tasks/123/comments
  listComments: {
    method: 'GET',
    path: '/api/v1/tasks/:taskId/comments',
    response: { status: 200, body: { data: 'Comment[]' } },
  },

  // ACTIONS (when REST doesn't fit)
  // POST /api/v1/tasks/123/assign
  assignTask: {
    method: 'POST',
    path: '/api/v1/tasks/:id/assign',
    body: { assigneeId: 'string' },
    response: { status: 200, body: { data: 'Task' } },
  },
};

// ============================================
// HTTP STATUS CODES
// ============================================

const httpStatusCodes = {
  // Success
  200: 'OK - Successful GET, PUT, PATCH, or DELETE',
  201: 'Created - Successful POST creating a new resource',
  204: 'No Content - Successful DELETE',

  // Client Errors
  400: 'Bad Request - Malformed request body or invalid parameters',
  401: 'Unauthorized - Missing or invalid authentication',
  403: 'Forbidden - Authenticated but not authorized for this action',
  404: 'Not Found - Resource does not exist',
  409: 'Conflict - Resource state conflict (e.g., duplicate email)',
  422: 'Unprocessable Entity - Validation failed',
  429: 'Too Many Requests - Rate limit exceeded',

  // Server Errors
  500: 'Internal Server Error - Unexpected server error',
  502: 'Bad Gateway - Upstream service error',
  503: 'Service Unavailable - Server is down or overloaded',
};

// ============================================
// ERROR RESPONSE FORMAT
// ============================================

interface APIError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  requestId: string;
  timestamp: string;
}

// Example: Validation error
const validationError: APIError = {
  status: 400,
  code: 'VALIDATION_ERROR',
  message: 'The request body contains invalid data',
  details: {
    title: ['Title is required', 'Title must be less than 200 characters'],
    dueDate: ['Due date must be in the future'],
  },
  requestId: 'req_abc123',
  timestamp: '2024-01-15T10:30:00Z',
};
```

---

## 5. Scenario B: GraphQL vs REST vs gRPC

**Real-Life Scenario:** You're choosing an API paradigm for a complex application.

**Technical Problem:** Understand when to use REST, GraphQL, or gRPC.

### TypeScript Implementation

```typescript
/**
 * REST vs GraphQL vs gRPC Comparison
 */

// ============================================
// PROBLEM: Over-fetching and Under-fetching
// ============================================

// REST: Multiple requests, over-fetching user data
async function getOrderDetailsREST(orderId: string): Promise<OrderDetails> {
  // Request 1: Get order
  const order = await fetch(`/orders/${orderId}`);
  // Response includes 50 fields, but we only need 5

  // Request 2: Get customer (only need name!)
  const customer = await fetch(`/customers/${order.customerId}`);
  // Response includes address, payment methods, preferences... wasted bandwidth

  // Request 3: Get items
  const items = await fetch(`/orders/${orderId}/items`);

  // Request 4: For each item, get product details
  const products = await Promise.all(
    items.map(item => fetch(`/products/${item.productId}`))
  );

  // 5+ HTTP round trips!
  return { order, customer, items, products };
}

// GraphQL: Single request, exactly what you need
const graphqlQuery = `
  query GetOrderDetails($orderId: ID!) {
    order(id: $orderId) {
      id
      status
      total
      createdAt
      customer {
        name    # Only need name, not the entire customer object
        email
      }
      items {
        quantity
        product {
          name
          price
          imageUrl
        }
      }
    }
  }
`;

async function getOrderDetailsGraphQL(orderId: string): Promise<OrderDetails> {
  const response = await fetch('/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { orderId },
    }),
  });
  return response.json();
  // Single request, exactly the fields we need!
}

// ============================================
// gRPC: High-performance Service-to-Service
// ============================================

/**
 * gRPC uses Protocol Buffers (binary, strongly typed)
 * 
 * order.proto:
 * 
 * syntax = "proto3";
 * 
 * service OrderService {
 *   rpc GetOrder (GetOrderRequest) returns (Order);
 *   rpc CreateOrder (CreateOrderRequest) returns (Order);
 *   rpc StreamOrderUpdates (StreamRequest) returns (stream OrderUpdate);
 * }
 * 
 * message Order {
 *   string id = 1;
 *   string customer_id = 2;
 *   repeated OrderItem items = 3;
 *   google.protobuf.Timestamp created_at = 4;
 * }
 */

// gRPC TypeScript client (generated from proto)
import { OrderServiceClient } from './generated/order_grpc_pb';

const client = new OrderServiceClient('order-service:50051');

async function getOrderGRPC(orderId: string): Promise<Order> {
  const request = new GetOrderRequest();
  request.setOrderId(orderId);
  
  return new Promise((resolve, reject) => {
    client.getOrder(request, (error, response) => {
      if (error) reject(error);
      else resolve(response.toObject());
    });
  });
}

// Streaming example
function streamOrderUpdates(orderId: string): void {
  const request = new StreamRequest();
  request.setOrderId(orderId);
  
  const stream = client.streamOrderUpdates(request);
  stream.on('data', (update: OrderUpdate) => {
    console.log('Order update:', update.getStatus());
  });
  stream.on('end', () => console.log('Stream ended'));
}
```

### Comparison Table

| Aspect | REST | GraphQL | gRPC |
|--------|------|---------|------|
| **Data Format** | JSON | JSON | Protocol Buffers (binary) |
| **Transport** | HTTP/1.1 or 2 | HTTP | HTTP/2 |
| **Type Safety** | Manual (OpenAPI) | Schema-first ✓ | Proto-first ✓ |
| **Over-fetching** | Common problem | Solved ✓ | Solved ✓ |
| **Streaming** | WebSocket needed | Subscriptions | Native ✓ |
| **Browser Support** | Excellent ✓ | Excellent ✓ | Limited |
| **Learning Curve** | Low ✓ | Medium | High |
| **Best For** | Public APIs | Mobile apps, BFFs | Microservices |
| **Caching** | HTTP native ✓ | Custom needed | Custom needed |

---

## 6. Real World Applications 🌍

### 1. 📘 GitHub - REST API

**Approach:** Pure REST with excellent documentation
**Versioning:** `/v3/` in URL
**Features:**
- Pagination with Link headers
- Rate limiting with X-RateLimit headers
- OAuth and personal access tokens

### 2. 📱 Facebook/Instagram - GraphQL

**Created GraphQL for:**
- Mobile apps on slow networks
- Complex, nested data requirements
- Type safety across iOS/Android/Web

### 3. 🎮 Google Cloud - gRPC

**Use case:** Internal microservices
**Benefits:**
- 10x faster than REST (binary, HTTP/2)
- Strong typing prevents bugs
- Built-in streaming for real-time

### 4. 💳 Stripe - REST with Developer Experience Focus

**Why developers love Stripe's API:**
- Consistent error format
- Idempotency keys for safe retries
- Test mode with fake data
- Excellent SDK and documentation

---

## 7. Complexity Analysis 🧠

### API Design Checklist

| Category | Best Practice |
|----------|---------------|
| **Versioning** | `/api/v1/` in URL or Accept header |
| **Pagination** | `?page=1&limit=20` or cursor-based |
| **Filtering** | `?status=active&priority=high` |
| **Sorting** | `?sort=-createdAt,title` (- for desc) |
| **Rate Limiting** | Return X-RateLimit-* headers |
| **Authentication** | Bearer tokens in Authorization header |
| **CORS** | Configure for web clients |
| **Idempotency** | Support Idempotency-Key header for POST |
| **HATEOAS** | Include links for discoverability |

### Interview Tips 💡

1. **Start with resources:** "What are the main entities? Users, Orders, Products."
2. **Think about relationships:** "Users have many Orders, Orders have many Items."
3. **Consider clients:** "Mobile app might prefer GraphQL; public API might need REST."
4. **Discuss versioning early:** "We'll use /v1/ and support backward compatibility."
5. **Mention rate limiting:** "100 requests per minute per API key."
6. **Security first:** "All endpoints require authentication except /health."
