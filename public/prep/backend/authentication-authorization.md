# Authentication & Authorization 🔐

## 1. The "Hotel Key Card" Analogy

When you check into a hotel:
- **Authentication:** You show ID at the front desk. "You ARE who you claim."
- **Authorization:** Your key card only opens YOUR room. "You CAN do what you're allowed."

**These are different concepts:**
- Authentication = Identity (WHO are you?)
- Authorization = Permission (WHAT can you do?)

---

## 2. The Core Concept

**Common Auth Flows:**
1. **Session-based:** Server stores session, client sends cookie.
2. **Token-based (JWT):** Client stores token, sends with each request.
3. **OAuth 2.0:** "Login with Google" — delegated authentication.

**Key Principles:**
- Never store passwords in plain text (use bcrypt, argon2).
- Use HTTPS everywhere.
- Tokens should expire.
- Refresh tokens for long sessions.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Auth Flow visualizer coming soon!"
}
```

---

## 4. Scenario A: JWT Authentication

### TypeScript Implementation

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
}

interface JWTPayload {
  userId: string;
  role: string;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Login: Verify password, issue tokens
 */
async function login(email: string, password: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid password');

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Middleware: Verify token on each request
 */
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Authorization: Check role for specific actions
 */
function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
app.get('/admin/users', authMiddleware, requireRole('admin'), getUsers);
```

---

## 5. Scenario B: OAuth 2.0 Flow

### "Login with Google" Flow

```
1. User clicks "Login with Google"
         │
         ▼
2. Redirect to Google's OAuth page
   https://accounts.google.com/oauth?
     client_id=XXX&
     redirect_uri=https://myapp.com/callback&
     scope=email profile
         │
         ▼
3. User authenticates with Google
         │
         ▼
4. Google redirects back with auth code
   https://myapp.com/callback?code=ABC123
         │
         ▼
5. Your server exchanges code for tokens
   POST https://oauth2.googleapis.com/token
   { code: ABC123, client_secret: XXX }
         │
         ▼
6. Google returns access_token + id_token
         │
         ▼
7. Your server creates session/JWT for user
```

---

## 6. Real World Applications 🌍

### Security Best Practices

| Practice | Implementation |
|----------|----------------|
| **Secure password storage** | bcrypt with cost factor 12+ |
| **Token expiration** | Access: 15min, Refresh: 7 days |
| **HTTPS only** | Never send tokens over HTTP |
| **HttpOnly cookies** | Prevent XSS token theft |
| **CSRF protection** | SameSite cookies, tokens |

---

## 7. Complexity Analysis 🧠

### Session vs JWT Trade-offs

| Aspect | Session | JWT |
|--------|---------|-----|
| Storage | Server | Client |
| Scalability | Requires shared store | Stateless ✓ |
| Revocation | Easy (delete session) | Hard (need blocklist) |
| Size | Small cookie | Larger token |

### Interview Tips 💡

1. **Know the difference:** "Auth*N* is identity, Auth*Z* is permission."
2. **Discuss token security:** "Use short expiry, refresh tokens, HTTPS."
3. **Mention OAuth use cases:** "Delegated auth for third-party access."
4. **Security awareness:** "Never store passwords in plain text."
