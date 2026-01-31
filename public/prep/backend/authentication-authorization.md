# Authentication & Authorization 🔐

## 1. The "Hotel Key Card" Analogy

Imagine checking into a luxury hotel.

**Authentication (Who Are You?):**
- You arrive at the front desk with your passport.
- Receptionist verifies: "You ARE John Smith with this reservation."
- You prove your identity → You get a key card.

**Authorization (What Can You Do?):**
- Your key card opens YOUR room (403), not 404 or 405.
- It opens the gym and pool (member benefits).
- It does NOT open the penthouse or staff areas.
- Same identity, different permissions based on your role.

**These are different concepts:**
- **Authentication (AuthN)** = Identity → WHO are you?
- **Authorization (AuthZ)** = Permissions → WHAT can you do?

**This is Auth.** The foundation of secure applications.

---

## 2. The Core Concept

In backend interviews, authentication architecture is a critical topic for senior roles.

**Common Authentication Strategies:**

| Strategy | How It Works | Best For |
|----------|--------------|----------|
| **Session-based** | Server stores session, client sends cookie | Traditional web apps |
| **Token-based (JWT)** | Client stores token, sends in header | APIs, SPAs, mobile |
| **OAuth 2.0** | Delegate auth to Google/GitHub | "Login with X" |
| **API Keys** | Static key for service-to-service | Internal APIs |
| **Mutual TLS (mTLS)** | Both client and server verify certs | Microservices |

**Security Principles:**
- **Never store passwords in plain text** (use bcrypt, Argon2)
- **Use HTTPS everywhere** (tokens in transit)
- **Tokens should expire** (short-lived access tokens)
- **Refresh tokens for longevity** (stored securely)
- **Rate limit auth endpoints** (prevent brute force)

---

## 3. Interactive Visualization 🎮

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. LOGIN                        2. PROTECTED REQUEST          │
│   ════════                        ════════════════════          │
│                                                                 │
│   ┌────────┐                      ┌────────┐                    │
│   │ Client │──POST /login──────→  │ Client │                    │
│   └────────┘  {user, pass}        └───┬────┘                    │
│       │                               │ Authorization:          │
│       ▼                               │ Bearer eyJhbG...        │
│   ┌────────┐                          ▼                         │
│   │ Server │──────────────→      ┌────────┐                     │
│   └────────┘  JWT Token          │ Server │──Verify JWT         │
│       │       {token, refresh}   └───┬────┘                     │
│       ▼                              │                          │
│   ┌────────────────────────┐         ▼                          │
│   │ JWT: Header.Payload.Sig│    ✓ Valid → 200 + Data            │
│   │ exp: 15min             │    ✗ Invalid → 401 Unauthorized    │
│   └────────────────────────┘                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Scenario A: JWT Authentication Deep Dive

**Real-Life Scenario:** You're building an API consumed by web and mobile clients.

**Technical Problem:** Implement stateless JWT authentication with secure token management.

### TypeScript Implementation

```typescript
/**
 * JWT (JSON Web Token) Authentication
 * 
 * Token structure: header.payload.signature
 * 
 * Example:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
 * eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE2OTk5OTk5OTl9.
 * signature_hash_here
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// ============================================
// TYPES & CONFIG
// ============================================

interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'moderator';
  refreshTokenHash?: string;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
}

interface JWTPayload {
  userId: string;
  role: string;
  sessionId: string; // For token revocation
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const config = {
  accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  bcryptRounds: 12,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};


// ============================================
// PASSWORD HANDLING
// ============================================

/**
 * Hash password for storage
 * 
 * @param password - Plain text password
 * @returns Hashed password
 * 
 * @timeComplexity O(2^rounds) - intentionally slow
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.bcryptRounds);
}

/**
 * Verify password against hash
 * 
 * Uses constant-time comparison to prevent timing attacks
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


// ============================================
// LOGIN FLOW
// ============================================

/**
 * Authenticate user and issue tokens
 * 
 * @param email - User email
 * @param password - Plain text password
 * @returns Token pair or throws error
 */
async function login(email: string, password: string): Promise<TokenPair> {
  // 1. Find user
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists (timing attack prevention)
    await hashPassword('dummy'); // Constant time
    throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // 2. Check lockout
  if (user.lockoutUntil && user.lockoutUntil > new Date()) {
    const remainingMs = user.lockoutUntil.getTime() - Date.now();
    throw new AuthError(
      `Account locked. Try again in ${Math.ceil(remainingMs / 60000)} minutes`,
      'ACCOUNT_LOCKED'
    );
  }

  // 3. Verify password
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await handleFailedLogin(user);
    throw new AuthError('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  // 4. Reset failed attempts on success
  await resetLoginAttempts(user.id);

  // 5. Generate token pair
  return generateTokenPair(user);
}

async function handleFailedLogin(user: User): Promise<void> {
  const attempts = user.failedLoginAttempts + 1;
  
  const update: Partial<User> = {
    failedLoginAttempts: attempts,
  };

  // Lock account after too many attempts
  if (attempts >= config.maxLoginAttempts) {
    update.lockoutUntil = new Date(Date.now() + config.lockoutDuration);
    // Optional: Send security alert email
    await sendSecurityAlert(user.email, 'account_locked');
  }

  await updateUser(user.id, update);
}


// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate access and refresh token pair
 */
function generateTokenPair(user: User): TokenPair {
  const sessionId = crypto.randomUUID();

  // Access token: Short-lived, contains user info
  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      sessionId,
    } as JWTPayload,
    config.accessTokenSecret,
    { expiresIn: config.accessTokenExpiry }
  );

  // Refresh token: Long-lived, minimal payload
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      sessionId,
      type: 'refresh',
    },
    config.refreshTokenSecret,
    { expiresIn: config.refreshTokenExpiry }
  );

  // Store hash of refresh token (for revocation)
  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');
  
  updateUser(user.id, { refreshTokenHash });

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
}


// ============================================
// TOKEN REFRESH
// ============================================

/**
 * Issue new access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  // 1. Verify refresh token
  let payload: JWTPayload & { type: string };
  try {
    payload = jwt.verify(refreshToken, config.refreshTokenSecret) as any;
  } catch (error) {
    throw new AuthError('Invalid refresh token', 'INVALID_TOKEN');
  }

  // 2. Check token type
  if (payload.type !== 'refresh') {
    throw new AuthError('Invalid token type', 'INVALID_TOKEN');
  }

  // 3. Find user and verify refresh token is still valid
  const user = await findUserById(payload.userId);
  if (!user) {
    throw new AuthError('User not found', 'USER_NOT_FOUND');
  }

  // 4. Verify refresh token hash (detect token reuse)
  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  if (user.refreshTokenHash !== tokenHash) {
    // Token reuse detected! Possible token theft
    await revokeAllUserSessions(user.id);
    await sendSecurityAlert(user.email, 'token_reuse_detected');
    throw new AuthError('Token reuse detected', 'TOKEN_REUSED');
  }

  // 5. Issue new token pair (token rotation)
  return generateTokenPair(user);
}


// ============================================
// MIDDLEWARE
// ============================================

/**
 * Express middleware to verify access token
 */
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Missing authorization header',
      code: 'NO_AUTH_HEADER',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.accessTokenSecret) as JWTPayload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }
}

/**
 * Authorization middleware - check roles
 */
function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
}

// Usage
app.get('/admin/users', authMiddleware, requireRole('admin'), getUsers);
app.get('/profile', authMiddleware, getProfile);
app.patch('/users/:id', authMiddleware, requireRole('admin', 'moderator'), updateUser);
```

---

## 5. Scenario B: OAuth 2.0 "Login with Google"

**Real-Life Scenario:** Users want to sign up without creating yet another password.

**Technical Problem:** Implement OAuth 2.0 with Google as the identity provider.

### TypeScript Implementation

```typescript
/**
 * OAuth 2.0 Authorization Code Flow
 * 
 * Flow:
 * 1. User clicks "Login with Google"
 * 2. Redirect to Google's authorization page
 * 3. User authenticates with Google
 * 4. Google redirects back with authorization code
 * 5. Your server exchanges code for tokens
 * 6. Fetch user info and create session
 */

// ============================================
// OAUTH CONFIG
// ============================================

const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: 'https://yourapp.com/auth/google/callback',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['email', 'profile'],
  },
};


// ============================================
// STEP 1: INITIATE LOGIN
// ============================================

/**
 * Generate authorization URL and redirect user
 */
app.get('/auth/google', (req, res) => {
  // Generate state parameter (CSRF protection)
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: oauthConfig.google.clientId,
    redirect_uri: oauthConfig.google.redirectUri,
    response_type: 'code',
    scope: oauthConfig.google.scopes.join(' '),
    state: state,
    access_type: 'offline', // Get refresh token
    prompt: 'consent', // Force consent screen
  });

  res.redirect(`${oauthConfig.google.authUrl}?${params}`);
});


// ============================================
// STEP 2: HANDLE CALLBACK
// ============================================

/**
 * Google redirects back with authorization code
 * Exchange code for tokens and create user session
 */
app.get('/auth/google/callback', async (req, res) => {
  const { code, state, error } = req.query;

  // Check for errors
  if (error) {
    return res.redirect('/login?error=oauth_denied');
  }

  // Verify state (CSRF protection)
  if (state !== req.session.oauthState) {
    return res.redirect('/login?error=invalid_state');
  }

  try {
    // Step 2a: Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code as string);

    // Step 2b: Fetch user info
    const googleUser = await fetchGoogleUserInfo(tokens.access_token);

    // Step 2c: Find or create user in your database
    let user = await findUserByEmail(googleUser.email);
    
    if (!user) {
      user = await createUser({
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        provider: 'google',
        providerId: googleUser.id,
        // No password - OAuth only
      });
    }

    // Step 2d: Generate your own session/JWT
    const tokenPair = generateTokenPair(user);

    // Option 1: Set tokens in cookies (recommended for web)
    res.cookie('accessToken', tokenPair.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 900000, // 15 minutes
    });

    res.cookie('refreshToken', tokenPair.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh', // Only sent to refresh endpoint
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect('/dashboard');

  } catch (error) {
    console.error('OAuth error:', error);
    res.redirect('/login?error=oauth_failed');
  }
});


// ============================================
// TOKEN EXCHANGE
// ============================================

async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  id_token: string;
}> {
  const response = await fetch(oauthConfig.google.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: oauthConfig.google.clientId,
      client_secret: oauthConfig.google.clientSecret,
      redirect_uri: oauthConfig.google.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Token exchange failed');
  }

  return response.json();
}

async function fetchGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture: string;
}> {
  const response = await fetch(oauthConfig.google.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}
```

### OAuth 2.0 Flow Diagram

```
┌──────────┐                                            ┌──────────┐
│   User   │                                            │  Google  │
└────┬─────┘                                            └────┬─────┘
     │                                                       │
     │  1. Click "Login with Google"                         │
     │──────────────────────────┐                            │
     │                          │                            │
     │                    ┌─────▼─────┐                      │
     │                    │ Your App  │                      │
     │                    └─────┬─────┘                      │
     │                          │                            │
     │  2. Redirect to Google   │                            │
     │◄─────────────────────────│                            │
     │                          │                            │
     │  3. Login to Google      │                            │
     │─────────────────────────────────────────────────────►│
     │                                                       │
     │  4. Grant permissions                                 │
     │─────────────────────────────────────────────────────►│
     │                                                       │
     │  5. Redirect back with code                           │
     │◄─────────────────────────────────────────────────────│
     │                          │                            │
     │  6. Send code to your server                          │
     │─────────────────────────►│                            │
     │                          │                            │
     │                          │  7. Exchange code for tokens
     │                          │───────────────────────────►│
     │                          │                            │
     │                          │  8. Return tokens          │
     │                          │◄───────────────────────────│
     │                          │                            │
     │                          │  9. Fetch user info        │
     │                          │───────────────────────────►│
     │                          │                            │
     │                          │  10. Return user info      │
     │                          │◄───────────────────────────│
     │                          │                            │
     │  11. Create session, return tokens                    │
     │◄─────────────────────────│                            │
     │                          │                            │
```

---

## 6. Real World Applications 🌍

### Security Best Practices

| Practice | Implementation | Why |
|----------|----------------|-----|
| **Secure password storage** | bcrypt/Argon2, cost 12+ | Slow hash defeats brute force |
| **Token expiration** | Access: 15m, Refresh: 7d | Limit exposure window |
| **HTTPS only** | HSTS header, secure cookies | Prevent MITM |
| **HttpOnly cookies** | `httpOnly: true` | XSS can't steal tokens |
| **SameSite cookies** | `sameSite: 'strict'` | CSRF protection |
| **Rate limiting** | 5 attempts/15 minutes | Brute force prevention |
| **Secure token storage** | Hash refresh tokens | Leak protection |
| **Token rotation** | New refresh on each use | Detect token theft |

### Auth Architecture for Microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                              │
│  • Rate limiting                                                │
│  • JWT validation                                               │
│  • Route to services                                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ Auth Service  │      │ User Service  │      │ Order Service │
│               │      │               │      │               │
│ • Login       │      │ • Get profile │      │ • Create order│
│ • Register    │      │ • Update user │      │ • List orders │
│ • Refresh     │      │               │      │               │
│ • OAuth       │      │               │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
```

---

## 7. Complexity Analysis 🧠

### Session vs JWT Trade-offs

| Aspect | Session | JWT |
|--------|---------|-----|
| **Storage** | Server (Redis/DB) | Client (localStorage/cookie) |
| **Scalability** | Requires shared store | Stateless ✓ |
| **Revocation** | Easy (delete session) ✓ | Hard (need blocklist) |
| **Payload** | Lookup required | Self-contained ✓ |
| **Size** | Small session ID | Larger token |
| **Security** | Can't be tampered | Signed, verifiable |
| **Best For** | Traditional MVC | APIs, Microservices |

### When to Use What

```
Use Session-based IF:
├── Traditional server-rendered app
├── Need immediate session revocation
├── Single server or sticky sessions OK
└── Simpler security model

Use JWT IF:
├── API-first architecture
├── Mobile app clients
├── Microservices (stateless)
├── Need to share auth across domains
└── Can handle token rotation complexity
```

### Interview Tips 💡

1. **Know the difference:** "AuthN is identity, AuthZ is permissions."
2. **Token security:** "Short-lived access, long-lived refresh, HttpOnly cookies."
3. **Password storage:** "Never plain text—bcrypt with cost factor 12+."
4. **OAuth understanding:** "Authorization code flow for server apps, PKCE for SPAs."
5. **Revocation strategy:** "We use a blocklist in Redis that expires with tokens."
6. **Defense in depth:** "Rate limiting, lockouts, 2FA for sensitive actions."
