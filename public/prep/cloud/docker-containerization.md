# Docker & Containerization 🐳

## 1. The "Shipping Container" Analogy

Before shipping containers, dockworkers loaded cargo piece by piece. Every port had different equipment, different processes. Chaos.

**Shipping containers standardized everything:**
- Same size, same handling equipment worldwide.
- Pack once, ship anywhere.

**This is Docker.** Pack your application once, run it anywhere—laptop, server, cloud.

---

## 2. The Core Concept

**Without Docker ("It works on my machine"):**
- Dev uses Node 18, server has Node 14.
- Dev has Redis locally, server is missing it.
- Deployment takes hours of debugging.

**With Docker:**
1. **Dockerfile:** Recipe for your container.
2. **Image:** Snapshot of your app + dependencies.
3. **Container:** Running instance of an image.
4. **Registry:** Docker Hub, ECR—store and share images.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "Docker visualizer coming soon!"
}
```

---

## 4. Scenario A: Dockerfile Basics

### Example Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

# 1. Base image
FROM node:20-alpine AS base
WORKDIR /app

# 2. Dependencies (cached layer)
COPY package*.json ./
RUN npm ci --only=production

# 3. Application code
COPY . .

# 4. Build (for TypeScript)
RUN npm run build

# 5. Production-ready slim image
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules

# 6. Run as non-root user (security)
USER node

# 7. Expose port and start
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Common Commands

```bash
# Build image
docker build -t myapp:1.0 .

# Run container
docker run -d -p 3000:3000 --name myapp myapp:1.0

# View logs
docker logs myapp

# Enter container
docker exec -it myapp sh

# Stop and remove
docker stop myapp && docker rm myapp
```

---

## 5. Scenario B: Docker Compose for Development

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb

  cache:
    image: redis:7-alpine

volumes:
  postgres_data:
```

---

## 6. Real World Applications 🌍

### Docker Best Practices

| Practice | Reason |
|----------|--------|
| **Use multi-stage builds** | Smaller images |
| **Don't run as root** | Security |
| **.dockerignore** | Faster builds |
| **Pin versions** | Reproducible builds |
| **Health checks** | Container orchestration |

---

## 7. Complexity Analysis 🧠

### Interview Tips 💡

1. **Explain images vs containers:** "Image is the recipe, container is the dish."
2. **Know layer caching:** "Put rarely-changing steps first."
3. **Discuss orchestration:** "For production, we use Kubernetes or ECS."
4. **Security awareness:** "Run as non-root, scan images for vulnerabilities."
