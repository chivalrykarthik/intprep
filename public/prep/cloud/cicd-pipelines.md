# CI/CD Pipelines 🔄

## 1. The "Assembly Line" Analogy

Before Henry Ford: Each car built by hand. Slow, error-prone.

After Ford's Assembly Line:
- Standardized steps, automated quality checks.
- Same quality, 10x faster.

**This is CI/CD.** Automate the journey from code commit to production.

---

## 2. The Core Concept

**Without CI/CD (Manual deploys):**
1. Developer commits code.
2. Manually runs tests (maybe).
3. Manually builds (makes mistakes).
4. FTPs to server (cringes).
5. Prays nothing breaks.

**With CI/CD:**
1. **CI (Continuous Integration):** Auto-test on every commit.
2. **CD (Continuous Delivery):** Auto-build, ready to deploy.
3. **CD (Continuous Deployment):** Auto-deploy to production.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "CI/CD Pipeline visualizer coming soon!"
}
```

---

## 4. Scenario A: GitHub Actions Pipeline

### .github/workflows/ci.yml

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          docker tag myapp:${{ github.sha }} registry/myapp:latest
          docker push registry/myapp:latest

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: kubectl set image deployment/myapp myapp=registry/myapp:${{ github.sha }}
```

---

## 5. Scenario B: Pipeline Stages

### Typical Pipeline Flow

```
┌─────────┐    ┌──────┐    ┌───────┐    ┌─────────┐    ┌────────┐
│ Commit  │───▶│ Test │───▶│ Build │───▶│ Staging │───▶│  Prod  │
└─────────┘    └──────┘    └───────┘    └─────────┘    └────────┘
     │             │           │             │              │
   Push        Lint,       Docker,      Deploy to      Deploy to
  to Git      Unit,        Package      staging,       production
              E2E                       smoke tests
```

### Key Metrics

| Metric | Good | Excellent |
|--------|------|-----------|
| **Deploy frequency** | Weekly | Multiple/day |
| **Lead time** | < 1 week | < 1 hour |
| **MTTR** | < 1 day | < 1 hour |
| **Change failure rate** | < 15% | < 5% |

---

## 6. Real World Applications 🌍

### CI/CD Best Practices

| Practice | Benefit |
|----------|---------|
| **Fail fast** | Catch issues early |
| **Parallel jobs** | Faster pipelines |
| **Artifact caching** | Don't rebuild unchanged code |
| **Feature flags** | Decouple deploy from release |
| **Rollback strategy** | Recover quickly |

---

## 7. Complexity Analysis 🧠

### Interview Tips 💡

1. **Know the stages:** "We run lint, test, build, deploy."
2. **Discuss testing strategy:** "Unit → Integration → E2E pyramid."
3. **Mention deployment strategies:** "Blue-green, canary, rolling."
4. **Talk about rollback:** "We can revert in < 5 minutes."
