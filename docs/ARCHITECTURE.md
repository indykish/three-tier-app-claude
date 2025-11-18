# Multi-Region Architecture Guide

## Table of Contents

- [Why Multi-Region?](#why-multi-region)
- [Active/Active vs Active/Passive](#activeactive-vs-activepassive)
- [Architecture Deep Dive](#architecture-deep-dive)
- [Infrastructure Components](#infrastructure-components)
- [Design Decisions](#design-decisions)

---

## Why Multi-Region?

### The Business Case

Application downtime creates a single point of failure. Regional outages occur due to:

- Data center power failures
- Network connectivity issues
- Natural disasters (floods, earthquakes)
- Regional infrastructure maintenance

### Availability Mathematics

**Single Region:**

- Availability: 99.9% (43.8 minutes downtime/month)
- Regional outage = Total service loss

**Multi-Region Active/Active:**

- Availability: 99.99%+ (4.38 minutes downtime/month)
- Regional outage = Service continues
- Load distributed across regions
- Better user experience (lower latency)

### Cost Considerations

**Active/Passive Drawbacks:**

- 50% of resources idle
- Failover requires manual intervention
- Longer recovery time
- Increased complexity without utilization benefits

**Active/Active Benefits:**

- All resources utilized
- Automatic failover
- Better ROI on infrastructure
- Improved global performance

---

## Active/Active vs Active/Passive

### Active/Passive Architecture

```
┌─────────────────┐         ┌─────────────────┐
│  DELHI (ACTIVE) │         │ CHENNAI (IDLE)  │
│   Serves 100%   │         │  Standby Mode   │
└─────────────────┘         └─────────────────┘
        │                            │
        └────────── Failover ────────┘
           (Manual/Scripted)
```

**Characteristics:**

- Simple to implement
- One region handles all traffic
- Secondary region unused until failure
- Requires manual promotion or automation scripts
- Longer failover time (minutes)

### Active/Active Architecture (This Implementation)

```
┌─────────────────┐         ┌─────────────────┐
│  DELHI (ACTIVE) │         │ CHENNAI (ACTIVE)│
│   Serves 50%    │◄───────►│   Serves 50%    │
└─────────────────┘         └─────────────────┘
        │                            │
        └──── Continuous Sync ───────┘
           (DB Replication)
```

**Characteristics:**

- Both regions serve traffic simultaneously
- Traffic distributed 50/50 under normal conditions
- Either region can handle 100% traffic during failures
- Automatic failover via DNS health checks
- Faster failover time (seconds)
- Better resource utilization
- Database writes synchronized via replication

---

## Architecture Deep Dive

### High-Level Architecture

```
                         ┌─────────────────────────────────┐
                         │         Global DNS Layer        │
                         │     (AWS Route 53 + Health)     │
                         └─────────────┬───────────────────┘
                                       │
                          ┌────────────┴────────────┐
                          │    Weighted Routing     │
                          │   (50% Delhi/Chennai)   │
                          └────────────┬────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              ▼                                                 ▼
    ┌─────────────────────┐                       ┌─────────────────────┐
    │    DELHI REGION     │                       │   CHENNAI REGION    │
    │   (Primary Write)   │                       │   (Read Replica)    │
    └─────────────────────┘                       └─────────────────────┘
              │                                                 │
    ┌─────────┴─────────┐                             ┌─────────┴─────────┐
    │   Frontend Tier   │                             │   Frontend Tier   │
    │  ┌─────────────┐  │                             │  ┌─────────────┐  │
    │  │  Frontend   │  │                             │  │  Frontend   │  │
    │  │     LB      │  │                             │  │     LB      │  │
    │  └──────┬──────┘  │                             │  └──────┬──────┘  │
    │         │         │                             │         │         │
    │  ┌──────▼──────┐  │                             │  ┌──────▼──────┐  │
    │  │ Autoscaling │  │                             │  │ Autoscaling │  │
    │  │   Group     │  │                             │  │   Group     │  │
    │  │(Caddy+React)│  │                             │  │(Caddy+React)│  │
    │  └─────────────┘  │                             │  └─────────────┘  │
    └───────────────────┘                             └───────────────────┘
              │                                                 │
    ┌─────────┴─────────┐                             ┌─────────┴─────────┐
    │   Backend Tier    │                             │   Backend Tier    │
    │  ┌─────────────┐  │                             │  ┌─────────────┐  │
    │  │  Backend    │  │                             │  │  Backend    │  │
    │  │     LB      │  │                             │  │     LB      │  │
    │  └──────┬──────┘  │                             │  └──────┬──────┘  │
    │         │         │                             │         │         │
    │  ┌──────▼──────┐  │                             │  ┌──────▼──────┐  │
    │  │ Autoscaling │  │                             │  │ Autoscaling │  │
    │  │   Group     │  │                             │  │   Group     │  │
    │  │(Node/Express)│ │                             │  │(Node/Express)│ │
    │  └─────────────┘  │                             │  └─────────────┘  │
    └───────────────────┘                             └───────────────────┘
              │                                                 │
    ┌─────────┴─────────┐                             ┌─────────┴─────────┐
    │  Database Tier    │                             │  Database Tier    │
    │  ┌─────────────┐  │                             │  ┌─────────────┐  │
    │  │  PgPool-II* │  │                             │  │  PgPool-II* │  │
    │  │  (?Proxy)   │  │                             │  │  (?Proxy)   │  │
    │  └──────┬──────┘  │                             │  └──────┬──────┘  │
    │         │         │                             │         │         │
    │  ┌──────▼──────┐  │                             │  ┌──────▼──────┐  │
    │  │ PostgreSQL  │◄─┼── Streaming Replication ────┼─►│ PostgreSQL  │  │
    │  │  (PRIMARY)  │  │                             │  │  (REPLICA)  │  │
    │  └─────────────┘  │                             │  └─────────────┘  │
    └───────────────────┘                             └───────────────────┘
```

### Traffic Flow

1. **User Request** → DNS resolves to nearest healthy region (Route 53)
2. **Frontend LB** → Distributes to autoscaled Caddy instances
3. **Caddy** → Serves static React app, proxies API calls to backend
4. **Backend LB** → Distributes to autoscaled Node.js instances
5. **Node.js API** → Processes request, queries database via PgPool
6. **PgPool-II** → Routes reads locally, writes to primary (if replica)
7. **PostgreSQL** → Processes queries, replicates data to other region

### Data Flow and Consistency

**Write Operations:**

```
User → DNS → Region → Frontend → Backend → Primary DB (Delhi)
                                                  │
                                                  ├──► Streaming Replication
                                                  │
                                                  └──► Replica DB (Chennai)
```

**Read Operations:**

```
User in Delhi → Delhi Frontend → Delhi Backend → Delhi DB (Primary)
User in Chennai → Chennai Frontend → Chennai Backend → Chennai DB (Replica)
```

**Replication Lag:**

- Typical lag: < 1 second
- Network interruption: Lag increases until connection restored
- Monitoring: Track with `pg_stat_replication` and UptimeRobot

---

## Infrastructure Components

### E2E Networks Resources

| Component        | Type                 | Specification                                | Purpose                   |
| ---------------- | -------------------- | -------------------------------------------- | ------------------------- |
| **VPC**          | e2e_vpc              | 10.10.0.0/16 (Delhi), 10.20.0.0/16 (Chennai) | Network isolation         |
| **Frontend VMs** | e2e_node             | C3.8GB (4 vCPU, 8GB RAM, 100GB SSD)          | React + Caddy servers     |
| **Backend VMs**  | e2e_node             | C3.8GB (4 vCPU, 8GB RAM, 100GB SSD)          | Node.js Express API       |
| **Frontend LB**  | e2e_loadbalancer     | E2E-LB-2 External, HTTP mode                 | Public traffic entry      |
| **Backend LB**   | e2e_loadbalancer     | E2E-LB-2 Internal, HTTP mode                 | API load distribution     |
| **Database**     | e2e_dbaas_postgresql | DBS.16GB                                     | Managed PostgreSQL        |
| **PgPool VM**    | e2e_node             | C3.8GB                                       | Database proxy (optional) |

### Network Architecture

**Delhi VPC (10.10.0.0/16):**

- Public Subnet: Frontend LB, NAT Gateway
- Private Subnet: Frontend VMs, Backend VMs, Database

**Chennai VPC (10.20.0.0/16):**

- Public Subnet: Frontend LB, NAT Gateway
- Private Subnet: Frontend VMs, Backend VMs, Database

**Cross-Region:**

- Database replication via private IPs
- No VPC peering required (public internet with encryption)

---

## Design Decisions

### Why Caddy over Nginx?

**Caddy Advantages:**

- Automatic HTTPS with Let's Encrypt (zero configuration)
- Simpler configuration (Caddyfile vs nginx.conf)
- Built-in reverse proxy capabilities
- Zero-downtime reloads
- Better defaults for security headers
- Native HTTP/2 and HTTP/3 support

**Nginx Alternative:**

- More mature ecosystem
- Better performance at extreme scale (10k+ req/s)
- More third-party modules
- Wider community knowledge

**Decision:** Caddy for simplicity. Switch to Nginx if you exceed 5k requests/second per VM.

### Why Node.js + Express?

**Advantages:**

- Non-blocking I/O for high concurrency
- Large ecosystem (npm)
- JavaScript frontend-backend alignment
- Easy horizontal scaling
- Excellent tooling and debugging

**Alternatives:**

- **Go:** Better performance, but smaller ecosystem
- **Python (FastAPI):** Excellent for ML/data apps, slower than Node
- **Java (Spring Boot):** Enterprise-grade, but heavier

**Decision:** Node.js provides the best balance of performance, productivity, and community support.

### Why PostgreSQL?

**Advantages:**

- ACID compliance (data consistency)
- Robust streaming replication support
- JSON/JSONB for flexible schemas
- Mature, battle-tested (20+ years)
- Excellent geospatial support (PostGIS)
- Strong community and documentation

**Alternatives:**

- **MySQL:** Simpler replication, but less feature-rich
- **MongoDB:** Better for document storage, but weaker consistency
- **CockroachDB:** Built-in multi-region, but more complex

**Decision:** PostgreSQL for reliability and feature completeness.

### Why PgPool-II? (Optional)

**Advantages:**

- Connection pooling reduces DB load
- Automatic read/write splitting
- Health monitoring built-in
- Failover detection
- Load balancing across replicas

**Disadvantages:**

- Additional complexity
- Single point of failure (needs HA setup)
- Learning curve

**Decision:** Optional for this POC. Recommended for production if you have:

- > 100 concurrent connections
- Need automatic read/write splitting
- Want zero-downtime database failover

**Alternative:** Use application-level connection pooling (pg-pool in Node.js) and handle read/write routing in code.

### Why E2E Networks?

**Advantages:**

- Data centers across India (Delhi, Mumbai, Chennai)
- VPC isolation and managed databases (DBaaS)
- Native Terraform provider
- Competitive pricing for Indian market
- Good support for multi-region deployments

**Alternatives:**

- **AWS:** More features, but higher cost
- **Azure:** Strong for Microsoft stack
- **DigitalOcean:** Simpler, but fewer regions in India

**Decision:** E2E Networks for India-focused deployments with cost efficiency.

### Auto-Scaling Strategy

**Current Implementation:**

- Manual autoscaling groups with start scripts
- VMs provisioned on-demand with cloud-init
- Simple but slower startup (~5-10 minutes)

**Production Recommendation:**

- Pre-baked VM images (Packer)
- Faster boot times (< 2 minutes)
- More reliable (tested images)
- Blue-green deployments

**Cost Optimization:**

- Start with min=1, max=5 per region
- Monitor CPU, memory, and request latency
- Scale up at 70% CPU utilization
- Scale down at 30% CPU utilization

---

## Security Considerations

### Network Security

- Private subnets for backend and database
- Frontend LB as only public entry point
- Backend LB internal only
- Database accessible only from backend VMs
- Security groups restrict traffic by port and source

### Application Security

- HTTPS enforced (Caddy auto-certificates)
- CORS configured for known origins
- Security headers (CSP, X-Frame-Options)
- Input validation on API endpoints
- SQL injection protection (parameterized queries)

### Database Security

- Encrypted at rest (E2E DBaaS default)
- Encrypted in transit (SSL/TLS)
- Strong passwords (minimum 16 characters)
- Limited user permissions (least privilege)
- Regular backups (automated via E2E)

### Monitoring and Auditing

- UptimeRobot for health checks
- Systemd logs for application events
- Database query logs for debugging
- Failed login attempts tracked

---

## Performance Optimization

### Caching Strategy

**Frontend:**

- Static assets cached by Caddy
- React build with content hashing
- Browser caching headers

**Backend:**

- Consider Redis for session storage
- API response caching for read-heavy endpoints
- Connection pooling to database

**Database:**

- Indexes on frequently queried columns
- Query optimization (EXPLAIN ANALYZE)
- Read replicas for read-heavy workloads

### CDN Integration (Future)

- Serve static assets via CDN (CloudFront, Cloudflare)
- Reduce load on frontend servers
- Improve global latency
- Cost: ~$50-100/month for moderate traffic

---

## Cost Estimation

### Monthly Infrastructure Costs (Per Region)

| Component                  | Quantity | Cost (INR) | Cost (USD) |
| -------------------------- | -------- | ---------- | ---------- |
| Frontend VMs (C3.8GB)      | 2        | ~3,000     | ~$36       |
| Backend VMs (C3.8GB)       | 2        | ~3,000     | ~$36       |
| Frontend LB                | 1        | ~1,500     | ~$18       |
| Backend LB                 | 1        | ~1,500     | ~$18       |
| Database (DBS.16GB)        | 1        | ~6,000     | ~$72       |
| **Subtotal per region**    |          | ~15,000    | ~$180      |
| **Two regions**            |          | ~30,000    | ~$360      |
| **Route 53 + UptimeRobot** |          | ~500       | ~$6        |
| **Total Monthly**          |          | ~30,500    | ~$366      |

**Notes:**

- Prices are approximate (2024 rates)
- Excludes bandwidth costs (~₹1-2/GB)
- UptimeRobot free tier (50 monitors)
- Route 53: $0.50/hosted zone + $0.40/million queries

### Cost Optimization Tips

1. **Right-size VMs:** Start small, scale based on metrics
2. **Reserved Instances:** 30-40% discount for 1-year commit
3. **Spot Instances:** Use for non-critical workloads
4. **Bandwidth:** Use CDN for static assets
5. **Monitoring:** UptimeRobot free tier sufficient for POC

---

## Further Reading

- [PostgreSQL Replication Documentation](https://www.postgresql.org/docs/current/runtime-config-replication.html)
- [PgPool-II Documentation](https://www.pgpool.net/docs/latest/en/html/)
- [AWS Route 53 Health Checks](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html)
- [E2E Networks Documentation](https://docs.e2enetworks.com)
- [Caddy Documentation](https://caddyserver.com/docs/)
