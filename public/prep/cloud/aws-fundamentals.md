# AWS Fundamentals ☁️

## 1. The "City Infrastructure" Analogy

Think of AWS as a modern city:
- **EC2:** Buildings (compute) — rent office space.
- **S3:** Warehouses — store unlimited stuff.
- **RDS:** Water/Power utilities — managed databases.
- **Lambda:** Vending machines — pay per use, no maintenance.
- **VPC:** Your private neighborhood with custom roads.

**This is Cloud Computing.** Renting infrastructure instead of owning data centers.

---

## 2. The Core Concept

**On-Premise (Old Way):**
Buy servers, wait 6 weeks, maintain them forever, overpay for peak capacity.

**Cloud (Modern Way):**
1. **On-demand:** Spin up servers in minutes.
2. **Pay-as-you-go:** Pay only for what you use.
3. **Elastic:** Auto-scale up/down with demand.
4. **Global:** Deploy worldwide instantly.

---

## 3. Interactive Visualization 🎮

```visualizer
{
  "type": "none",
  "data": [],
  "message": "AWS Architecture visualizer coming soon!"
}
```

---

## 4. Scenario A: Core Services Overview

### Key AWS Services

```typescript
interface AWSService {
  name: string;
  category: string;
  useCase: string;
  pricing: string;
}

const coreServices: AWSService[] = [
  // Compute
  { name: 'EC2', category: 'Compute', 
    useCase: 'Virtual servers', pricing: 'Per hour/second' },
  { name: 'Lambda', category: 'Compute', 
    useCase: 'Serverless functions', pricing: 'Per request + duration' },
  { name: 'ECS/EKS', category: 'Compute', 
    useCase: 'Container orchestration', pricing: 'Per container + EC2' },
  
  // Storage
  { name: 'S3', category: 'Storage', 
    useCase: 'Object storage (files, images)', pricing: 'Per GB + requests' },
  { name: 'EBS', category: 'Storage', 
    useCase: 'Block storage for EC2', pricing: 'Per GB provisioned' },
  
  // Database
  { name: 'RDS', category: 'Database', 
    useCase: 'Managed SQL (MySQL, PostgreSQL)', pricing: 'Per hour + storage' },
  { name: 'DynamoDB', category: 'Database', 
    useCase: 'NoSQL key-value store', pricing: 'Per request or provisioned' },
  { name: 'ElastiCache', category: 'Database', 
    useCase: 'Managed Redis/Memcached', pricing: 'Per hour' },
  
  // Networking
  { name: 'VPC', category: 'Networking', 
    useCase: 'Virtual private network', pricing: 'Free (NAT Gateway costs)' },
  { name: 'Route 53', category: 'Networking', 
    useCase: 'DNS management', pricing: 'Per hosted zone + queries' },
  { name: 'CloudFront', category: 'Networking', 
    useCase: 'CDN - content delivery', pricing: 'Per GB transferred' },
  { name: 'ALB/NLB', category: 'Networking', 
    useCase: 'Load balancing', pricing: 'Per hour + LCU' },
];
```

---

## 5. Scenario B: Typical Architecture

### Three-Tier Web Application

```
                        ┌─────────────┐
                        │  Route 53   │ (DNS)
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │ CloudFront  │ (CDN)
                        └──────┬──────┘
                               │
                        ┌──────▼──────┐
                        │     ALB     │ (Load Balancer)
                        └──────┬──────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌──────────┐       ┌──────────┐       ┌──────────┐
     │   EC2    │       │   EC2    │       │   EC2    │
     │ (App 1)  │       │ (App 2)  │       │ (App 3)  │
     └────┬─────┘       └────┬─────┘       └────┬─────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                      ┌──────▼──────┐
                      │     RDS     │ (Database)
                      │  (Primary)  │
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │     RDS     │ (Read Replica)
                      └─────────────┘
```

---

## 6. Real World Applications 🌍

### Cost Optimization Tips

| Strategy | Savings |
|----------|---------|
| **Reserved Instances** | Up to 72% vs On-Demand |
| **Spot Instances** | Up to 90% (for fault-tolerant) |
| **Right-sizing** | Stop paying for unused CPU |
| **S3 Lifecycle** | Move old data to Glacier |

---

## 7. Complexity Analysis 🧠

### Interview Tips 💡

1. **Know the basics:** "EC2 for compute, S3 for storage, RDS for databases."
2. **Discuss trade-offs:** "Lambda is cheaper for sporadic workloads."
3. **Mention security:** "IAM roles, VPC security groups, encryption at rest."
4. **Cost awareness:** "We'd use Reserved Instances for baseline, Spot for burst."
