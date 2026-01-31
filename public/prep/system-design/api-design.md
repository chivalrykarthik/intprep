# API Design 🔌

## 1. The "Restaurant Menu" Analogy

Your API is like a restaurant menu:
- **REST:** A traditional menu. "Give me item #5." Fixed structure.
- **GraphQL:** A buffet with a custom order form. "I want chicken, but only wings, with spicy sauce."
- **gRPC:** Speed-dial to the kitchen. Binary, blazing fast.

**This is API Design.** Creating a contract between your services and their consumers.

---

## 2. The Core Concept

**Bad API (Confusing Menu):**
```
GET /getUser?userId=5
POST /CreateNewUser
GET /api/v1/users/fetch-all-users
```

**Good API (Clear Menu):**
```
GET    /users/5        → Fetch user 5
POST   /users          → Create user
GET    /users          → List all users
PUT    /users/5        → Update user 5
DELETE /users/5        → Delete user 5
```

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "API Design visualizer coming soon!"
}
```

---

## 4. Scenario A: RESTful API Design

### TypeScript Implementation

```typescript
/**
 * RESTful API Best Practices
 */

// Use nouns, not verbs
// ❌ GET /getUsers
// ✓ GET /users

// Use plural nouns
// ❌ GET /user/5
// ✓ GET /users/5

// Nest for relationships
// GET /users/5/orders → Orders for user 5

// Use proper HTTP methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RESTEndpoint {
  method: HttpMethod;
  path: string;
  action: string;
}

const userEndpoints: RESTEndpoint[] = [
  { method: 'GET',    path: '/users',     action: 'List all users' },
  { method: 'POST',   path: '/users',     action: 'Create user' },
  { method: 'GET',    path: '/users/:id', action: 'Get user by ID' },
  { method: 'PUT',    path: '/users/:id', action: 'Replace user' },
  { method: 'PATCH',  path: '/users/:id', action: 'Update user fields' },
  { method: 'DELETE', path: '/users/:id', action: 'Delete user' },
];

// Proper HTTP status codes
const statusCodes = {
  200: 'OK - Successful GET/PUT',
  201: 'Created - Successful POST',
  204: 'No Content - Successful DELETE',
  400: 'Bad Request - Invalid input',
  401: 'Unauthorized - No auth token',
  403: 'Forbidden - No permission',
  404: 'Not Found',
  429: 'Too Many Requests - Rate limited',
  500: 'Internal Server Error',
};
```

---

## 5. Scenario B: GraphQL vs REST

### Comparison

```typescript
// REST: Multiple requests for related data
async function getOrderDetailsREST(orderId: string) {
  const order = await fetch(`/orders/${orderId}`);
  const user = await fetch(`/users/${order.userId}`);
  const items = await fetch(`/orders/${orderId}/items`);
  return { order, user, items };
}

// GraphQL: Single request, get exactly what you need
const graphqlQuery = `
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      status
      user {
        name
        email
      }
      items {
        productName
        quantity
      }
    }
  }
`;
```

| Aspect | REST | GraphQL |
|--------|------|---------|
| Requests | Multiple | Single |
| Data Control | Server decides | Client decides |
| Caching | HTTP native | Custom |
| Learning Curve | Low | Medium |

---

## 6. Real World Applications 🌍

### 1. 📘 Facebook - GraphQL Creator
Built GraphQL for mobile apps with slow networks.

### 2. 🎵 Spotify - REST
Clean RESTful API for developers.

### 3. 🎮 Microservices - gRPC
Internal service communication at Google.

---

## 7. Complexity Analysis 🧠

### Interview Tips 💡
1. "Use versioning: /api/v1/users"
2. "Implement pagination for list endpoints"
3. "Use HATEOAS for discoverability"
4. "Rate limit to prevent abuse"
