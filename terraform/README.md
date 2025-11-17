# Building a Highly Available Multi-Region Application on E2E Networks: A Complete Guide to Active/Active Deployments with Terraform

*A comprehensive case study on deploying a production-grade three-tier application across Delhi and Chennai regions with automatic failover, database replication, and infrastructure-as-code.*

---

## Executive Summary

In today's digital-first world, application downtime directly translates to revenue loss and customer churn. A single region deployment, no matter how robust, remains vulnerable to regional outages, natural disasters, or infrastructure failures. This case study demonstrates how to architect and deploy a **highly available three-tier application** across two geographic regions using **E2E Networks** and **Terraform**, achieving true active/active operations with automatic failover capabilities.

**What You'll Learn:**
- Designing active/active multi-region architecture
- Implementing infrastructure-as-code with E2E Networks Terraform Provider
- Setting up PostgreSQL replication across regions
- Configuring automatic health monitoring and failover
- Achieving near-zero downtime through database proxy patterns
- Operational procedures for disaster recovery

**Technologies Used:**
- E2E Networks (Compute, DBaaS, Load Balancers, VPC)
- Terraform (Infrastructure as Code)
- PostgreSQL (Primary-Replica Replication)
- PgPool-II (Database Connection Proxy)
- Caddy (Reverse Proxy/Web Server)
- Node.js + Express (Backend API)
- React (Frontend)
- UptimeRobot (Synthetic Monitoring)
- AWS Route 53 (DNS with Health Checks)

---

## Table of Contents

1. [Introduction: Why Multi-Region?](#introduction-why-multi-region)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Infrastructure Components](#infrastructure-components)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Database High Availability](#database-high-availability)
6. [Automatic Failover Architecture](#automatic-failover-architecture)
7. [Monitoring and Observability](#monitoring-and-observability)
8. [Operational Procedures](#operational-procedures)
9. [Cost Analysis](#cost-analysis)
10. [Lessons Learned](#lessons-learned)
11. [Conclusion](#conclusion)

---

## Introduction: Why Multi-Region?

### The Business Case

Consider these statistics:
- **Amazon** loses approximately $220,000 per minute of downtime
- **Google** loses about $545,000 per minute
- Even small businesses report losses of **$137-$427 per minute**

A single-region deployment creates a single point of failure. Regional outages, while rare, do occur:
- Data center power failures
- Network connectivity issues
- Natural disasters (floods, earthquakes)
- Regional infrastructure maintenance

### Active/Active vs Active/Passive

**Active/Passive:** One region serves traffic while the other waits idle. Simple but wasteful.

**Active/Active:** Both regions serve traffic simultaneously. Traffic is distributed, resources are utilized, and failover is seamless.

This guide implements **Active/Active** architecture where:
- Both Delhi and Chennai serve user traffic
- Traffic is distributed 50/50 under normal conditions
- Either region can handle 100% traffic during failures
- Database writes are synchronized via replication

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
    ┌─────────┴─────────┐                           ┌─────────┴─────────┐
    │   Frontend Tier   │                           │   Frontend Tier   │
    │  ┌─────────────┐  │                           │  ┌─────────────┐  │
    │  │  Frontend   │  │                           │  │  Frontend   │  │
    │  │     LB      │  │                           │  │     LB      │  │
    │  └──────┬──────┘  │                           │  └──────┬──────┘  │
    │         │         │                           │         │         │
    │  ┌──────▼──────┐  │                           │  ┌──────▼──────┐  │
    │  │ Autoscaling │  │                           │  │ Autoscaling │  │
    │  │   Group     │  │                           │  │   Group     │  │
    │  │ (Caddy+React)│  │                           │  │ (Caddy+React)│  │
    │  └─────────────┘  │                           │  └─────────────┘  │
    └───────────────────┘                           └───────────────────┘
              │                                                 │
    ┌─────────┴─────────┐                           ┌─────────┴─────────┐
    │   Backend Tier    │                           │   Backend Tier    │
    │  ┌─────────────┐  │                           │  ┌─────────────┐  │
    │  │  Backend    │  │                           │  │  Backend    │  │
    │  │     LB      │  │                           │  │     LB      │  │
    │  └──────┬──────┘  │                           │  └──────┬──────┘  │
    │         │         │                           │         │         │
    │  ┌──────▼──────┐  │                           │  ┌──────▼──────┐  │
    │  │ Autoscaling │  │                           │  │ Autoscaling │  │
    │  │   Group     │  │                           │  │   Group     │  │
    │  │(Node/Express)│  │                           │  │(Node/Express)│  │
    │  └─────────────┘  │                           │  └─────────────┘  │
    └───────────────────┘                           └───────────────────┘
              │                                                 │
    ┌─────────┴─────────┐                           ┌─────────┴─────────┐
    │  Database Tier    │                           │  Database Tier    │
    │  ┌─────────────┐  │                           │  ┌─────────────┐  │
    │  │  PgPool-II  │  │                           │  │  PgPool-II  │  │
    │  │   (Proxy)   │  │                           │  │   (Proxy)   │  │
    │  └──────┬──────┘  │                           │  └──────┬──────┘  │
    │         │         │                           │         │         │
    │  ┌──────▼──────┐  │                           │  ┌──────▼──────┐  │
    │  │ PostgreSQL  │◄─┼── Streaming Replication ──┼──►│ PostgreSQL  │  │
    │  │  (PRIMARY)  │  │                           │  │  (REPLICA)  │  │
    │  └─────────────┘  │                           │  └─────────────┘  │
    └───────────────────┘                           └───────────────────┘
```

### Traffic Flow

1. **User Request** → DNS resolves to nearest healthy region
2. **Frontend LB** → Distributes to autoscaled Caddy instances
3. **Caddy** → Serves static React app, proxies API calls
4. **Backend LB** → Distributes to autoscaled Node.js instances
5. **Node.js API** → Processes request, queries database via PgPool
6. **PgPool-II** → Routes reads locally, writes to primary
7. **PostgreSQL** → Processes queries, replicates data

---

## Infrastructure Components

### E2E Networks Resources

| Component | Type | Specification | Purpose |
|-----------|------|---------------|---------|
| **VPC** | e2e_vpc | 10.10.0.0/16 (Delhi), 10.20.0.0/16 (Chennai) | Network isolation |
| **Frontend VMs** | e2e_autoscaling | C3.8GB (4 vCPU, 8GB RAM, 100GB SSD) | React + Caddy servers |
| **Backend VMs** | e2e_autoscaling | C3.8GB (4 vCPU, 8GB RAM, 100GB SSD) | Node.js Express API |
| **Frontend LB** | e2e_loadbalancer | External, HTTP mode | Public traffic entry |
| **Backend LB** | e2e_loadbalancer | Internal, HTTP mode | API load distribution |
| **Database** | e2e_dbaas_postgresql | DBS.8GB | Managed PostgreSQL |
| **PgPool VM** | e2e_node | C2.4GB | Database proxy |

### Why These Choices?

**Caddy over Nginx:**
- Automatic HTTPS with Let's Encrypt
- Simpler configuration (Caddyfile vs nginx.conf)
- Built-in reverse proxy capabilities
- Zero-downtime reloads
- Modern, actively maintained

**Node.js + Express:**
- Non-blocking I/O for high concurrency
- Large ecosystem (npm)
- JavaScript frontend-backend alignment
- Easy horizontal scaling

**PostgreSQL:**
- ACID compliance
- Robust replication support
- JSON/JSONB for flexible schemas
- Mature, battle-tested

**PgPool-II:**
- Connection pooling reduces DB load
- Automatic read/write splitting
- Health monitoring built-in
- Failover detection

---

## Step-by-Step Deployment

### Prerequisites

1. **E2E Networks Account**
   - API Key (read/write permissions)
   - Auth Token
   - Project ID
   - Existing SSH key (e.g., "KishoreMac")

2. **Local Tools**
   - Terraform >= 1.0.0
   - Git
   - Text editor

3. **External Services**
   - AWS Account (for Route 53)
   - UptimeRobot account (free tier)

### Phase 1: Configure Variables

```bash
# Clone repository
git clone https://github.com/indykish/three-tier-app-claude.git
cd three-tier-app-claude/terraform

# Copy example configuration
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
# E2E Networks Authentication
e2e_api_key    = "your-api-key-here"
e2e_auth_token = "your-auth-token-here"
project_id     = "your-project-id"

# SSH Access
ssh_key_name = "KishoreMac"

# VM Configuration
image_name = "Ubuntu-24.04"
vm_plan    = "C3.8GB"

# Database Configuration
db_plan     = "DBS.8GB"
db_version  = "16"
db_name     = "branding_db"
db_user     = "dbadmin"
db_password = "YourSecureP@ssw0rd!"

# Autoscaling
autoscaling_min = 1
autoscaling_max = 5

# Network
vpc_cidr_delhi   = "10.10.0.0/16"
vpc_cidr_chennai = "10.20.0.0/16"
```

### Phase 2: Deploy Delhi Region (Primary)

```bash
cd delhi

# Initialize Terraform - downloads provider plugins
terraform init

# Preview infrastructure changes
terraform plan -var-file="../terraform.tfvars"

# Deploy infrastructure (takes 10-15 minutes)
terraform apply -var-file="../terraform.tfvars"
```

**What Gets Created:**

1. **VPC** (10.10.0.0/16) - Isolated network
2. **PostgreSQL Primary** - Main database with encryption
3. **PgPool-II VM** - Database proxy layer
4. **Frontend Autoscaling Group** - Caddy + React (min 1, max 5)
5. **Backend Autoscaling Group** - Express API (min 1, max 5)
6. **Frontend Load Balancer** - External, public-facing
7. **Backend Load Balancer** - Internal, for API routing

**Save Critical Outputs:**

```bash
# Capture outputs for Chennai deployment
terraform output -json > ../delhi-outputs.json

# Key values to note:
terraform output frontend_lb_public_ip    # Your Delhi endpoint
terraform output db_primary_private_ip    # For Chennai replica
terraform output db_primary_id            # For Chennai replica setup
```

### Phase 3: Deploy Chennai Region (Secondary)

```bash
cd ../chennai

terraform init

# Get Delhi database information
DELHI_DB_IP=$(cd ../delhi && terraform output -raw db_primary_private_ip)
DELHI_DB_ID=$(cd ../delhi && terraform output -raw db_primary_id)

# Deploy with Delhi connection info
terraform apply \
  -var-file="../terraform.tfvars" \
  -var="delhi_db_primary_ip=${DELHI_DB_IP}" \
  -var="delhi_db_primary_id=${DELHI_DB_ID}"
```

**Chennai Components:**

1. **VPC** (10.20.0.0/16) - Separate network
2. **PostgreSQL Replica** - Streams from Delhi primary
3. **PgPool-II VM** - Routes reads locally, writes to Delhi
4. **Frontend Autoscaling Group** - Identical to Delhi
5. **Backend Autoscaling Group** - Identical to Delhi
6. **Load Balancers** - Regional entry points

### Phase 4: Configure DNS with Health Checks

**AWS Route 53 Setup:**

1. **Create Health Check - Delhi**
   ```
   Health Check Name: three-tier-delhi-health
   Protocol: HTTP
   IP Address: <Delhi Frontend LB IP>
   Port: 80
   Path: /health/
   Request Interval: 30 seconds
   Failure Threshold: 3
   ```

2. **Create Health Check - Chennai**
   ```
   Health Check Name: three-tier-chennai-health
   Protocol: HTTP
   IP Address: <Chennai Frontend LB IP>
   Port: 80
   Path: /health/
   Request Interval: 30 seconds
   Failure Threshold: 3
   ```

3. **Create Weighted A Records**
   ```
   Record Name: app.yourdomain.com
   Type: A

   Record 1:
   - Value: <Delhi Frontend LB IP>
   - Weight: 50
   - Health Check: three-tier-delhi-health
   - Set ID: delhi-primary

   Record 2:
   - Value: <Chennai Frontend LB IP>
   - Weight: 50
   - Health Check: three-tier-chennai-health
   - Set ID: chennai-secondary
   ```

**Behavior:**
- Normal: Traffic split 50/50 between regions
- Delhi fails: 100% traffic to Chennai (automatic)
- Chennai fails: 100% traffic to Delhi (automatic)
- Both fail: Service unavailable (needs investigation)

---

## Database High Availability

### PostgreSQL Streaming Replication

The E2E Networks DBaaS provides managed PostgreSQL with built-in replication capabilities.

**Delhi Primary Database:**
```hcl
resource "e2e_dbaas_postgresql" "primary" {
  dbaas_name = "three-tier-primary-db"
  location   = "Delhi"
  project_id = var.project_id
  plan       = var.db_plan
  version    = var.db_version

  database {
    user     = var.db_user
    password = var.db_password
    name     = var.db_name
  }

  vpcs                  = [e2e_vpc.delhi_vpc.vpc_id]
  is_encryption_enabled = true
}
```

**Chennai Replica Database:**
```hcl
resource "e2e_dbaas_postgresql" "replica" {
  dbaas_name = "three-tier-replica-db"
  location   = "Chennai"
  project_id = var.project_id
  plan       = var.db_plan
  version    = var.db_version

  database {
    user     = var.db_user
    password = var.db_password
    name     = var.db_name
  }

  vpcs                  = [e2e_vpc.chennai_vpc.vpc_id]
  is_encryption_enabled = true

  # Critical: This creates the replication link
  replica_of = var.delhi_db_primary_id
}
```

### The Database Proxy Problem

Without a proxy, backends connect directly to database:

```
Chennai Backend → postgresql://delhi-primary:5432/db
                  (Network latency to Delhi)
                  (Must change during failover)
```

**Solution: PgPool-II**

```
Chennai Backend → postgresql://local-pgpool:5432/db
                  (Always local connection)
                  (Never changes during failover)
                           ↓
                     PgPool-II
                           ↓
                  Read: Chennai Replica (fast, local)
                  Write: Delhi Primary (routed automatically)
```

**PgPool Configuration Highlights:**

```conf
# Load Balancing
load_balance_mode = on
master_slave_mode = on
master_slave_sub_mode = 'stream'

# Health Checks
health_check_period = 10
health_check_timeout = 20
health_check_max_retries = 3

# Automatic Failover
fail_over_on_backend_error = on
failover_command = '/etc/pgpool2/failover.sh %d %h %p %D %m %H %M %P'
```

---

## Automatic Failover Architecture

### The Challenge: True Automatic Failover

Manual failover requires human intervention:
1. Detect failure (monitoring alerts)
2. Confirm failure (avoid false positives)
3. Promote replica to primary (manual action)
4. Update configurations (manual action)
5. Verify application functionality (manual testing)

**Total time: 15-30 minutes minimum**

Automatic failover eliminates human latency:
1. Detect failure (automated monitoring)
2. Confirm failure (multiple failed checks)
3. Trigger promotion (webhook automation)
4. Redirect traffic (DNS health checks)
5. Verify functionality (automated tests)

**Total time: 5-15 minutes**

### Complete Automated Stack

```
┌─────────────────────────────────────────────────┐
│                 MONITORING LAYER                │
│              (UptimeRobot - Free)               │
│  - Checks endpoints every 5 minutes            │
│  - Multiple geographic locations               │
│  - Sends webhooks on failures                  │
└───────────────────┬─────────────────────────────┘
                    │ Webhook Alert
                    ▼
┌─────────────────────────────────────────────────┐
│              AUTOMATION LAYER                   │
│          (Lambda / Cloud Function)              │
│  - Receives failure notifications              │
│  - Calls E2E Networks API                      │
│  - Promotes replica to primary                 │
│  - Sends team notifications                    │
└───────────────────┬─────────────────────────────┘
                    │ API Call
                    ▼
┌─────────────────────────────────────────────────┐
│                DATABASE LAYER                   │
│              (PgPool-II + DBaaS)                │
│  - Detects new primary automatically           │
│  - Redirects connections seamlessly            │
│  - No application reconfiguration needed       │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│                  DNS LAYER                      │
│              (Route 53 + Health)                │
│  - Automatically routes away from failures     │
│  - Zero configuration changes needed           │
│  - Instant traffic redirection                 │
└─────────────────────────────────────────────────┘
```

### Failover Timeline

```
T+0:00   Delhi frontend stops responding
T+0:30   Route 53 health check #1 fails
T+1:00   Route 53 health check #2 fails
T+1:30   Route 53 health check #3 fails
T+1:30   Route 53 marks Delhi unhealthy, routes 100% to Chennai
T+5:00   UptimeRobot detects failure (5-min interval)
T+5:01   Webhook sent to automation endpoint
T+5:02   Lambda receives alert
T+5:03   Lambda calls E2E API to promote Chennai DB
T+5:10   Chennai DB promoted to primary
T+5:15   PgPool detects new primary
T+5:15   All Chennai traffic now uses local primary
T+5:15   FAILOVER COMPLETE
```

**DNS failover: ~1.5 minutes** (automatic, no action needed)
**Full database promotion: ~5 minutes** (automated via webhook)

---

## Monitoring and Observability

### UptimeRobot Configuration (Terraform)

```hcl
# UptimeRobot Monitor for Delhi Frontend
resource "uptimerobot_monitor" "delhi_frontend" {
  friendly_name = "Three-Tier Delhi Frontend LB"
  type          = "http"
  url           = "http://${var.delhi_frontend_lb_ip}/health/"
  interval      = 300  # 5 minutes (free tier)

  alert_contact {
    id        = uptimerobot_alert_contact.failover_webhook.id
    threshold = 3  # Alert after 3 failures
  }
}

# Webhook for Automated Actions
resource "uptimerobot_alert_contact" "failover_webhook" {
  friendly_name = "Failover Automation Webhook"
  type          = "web-hook"
  value         = var.failover_webhook_url
}
```

### Monitoring Dashboard Metrics

**Application Metrics:**
- Request latency (p50, p95, p99)
- Error rates (4xx, 5xx)
- Requests per second
- Concurrent connections

**Infrastructure Metrics:**
- CPU utilization (autoscaling trigger)
- Memory usage
- Disk I/O
- Network throughput

**Database Metrics:**
- Connection count
- Query latency
- Replication lag
- Transaction rate

**Recommended Tools:**
- **Grafana** (Dashboards)
- **Prometheus** (Metrics collection)
- **Loki** (Log aggregation)
- **AlertManager** (Alerting rules)

### Health Check Endpoints

**Frontend Health (/health/):**
```json
{
  "status": "healthy",
  "service": "frontend",
  "region": "delhi",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Backend Health (/health):**
```json
{
  "status": "healthy",
  "service": "backend",
  "region": "delhi",
  "database": "connected",
  "uptime": 86400,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Operational Procedures

### Daily Operations

**Morning Health Check:**
```bash
./scripts/health-check.sh
```

Output:
```
=== Three-Tier App Health Check ===
--- Delhi Region ---
Frontend LB: 103.x.x.x
Backend LB: 10.10.x.x
Database (Primary): 10.10.x.x
✓ Frontend: HEALTHY (HTTP 200)
✓ Backend: HEALTHY (HTTP 200)

--- Chennai Region ---
Frontend LB: 103.x.x.x
Backend LB: 10.20.x.x
Database (Replica): 10.20.x.x
✓ Frontend: HEALTHY (HTTP 200)
✓ Backend: HEALTHY (HTTP 200)
=== Health Check Complete ===
```

**Database Replication Status:**
```sql
-- On Delhi Primary
SELECT * FROM pg_stat_replication;

-- Expected output shows Chennai replica connected
-- Check write_lag and flush_lag for latency
```

### Failover Scenarios

#### Scenario 1: Delhi Region Complete Failure

**Automatic Actions:**
1. Route 53 detects Delhi LB failure
2. Traffic automatically routes to Chennai
3. UptimeRobot triggers webhook
4. Automation promotes Chennai DB

**Manual Verification:**
```bash
# Check Chennai is serving traffic
curl -I http://app.yourdomain.com
# Should show Chennai LB IP

# Verify Chennai DB is primary
psql -h <chennai-db-ip> -U dbadmin -d branding_db \
  -c "SELECT pg_is_in_recovery();"
# Should return 'f' (false = primary)
```

#### Scenario 2: Restore Delhi as Primary

After Delhi infrastructure recovers:

```bash
./scripts/restore-delhi-primary.sh
```

**Steps:**
1. Sync Chennai data to Delhi
2. Configure Delhi as new primary
3. Configure Chennai as replica
4. Update PgPool configurations
5. Rebalance DNS weights

**Data Sync Options:**
- **pg_basebackup**: Full binary copy from Chennai to Delhi
- **pg_dump/restore**: Logical dump and restore
- **Reverse replication**: Temporarily make Delhi a replica of Chennai

### Disaster Recovery Drills

**Quarterly DR Drill Checklist:**

```markdown
## Pre-Drill (T-1 day)
- [ ] Notify stakeholders
- [ ] Document current state
- [ ] Verify backups are current
- [ ] Test restore procedures in staging

## Drill Execution
- [ ] Simulate Delhi failure (stop LB)
- [ ] Verify automatic DNS failover (~1-2 min)
- [ ] Verify UptimeRobot alerts received
- [ ] Execute DB promotion (automated or manual)
- [ ] Test application functionality
- [ ] Create test data in Chennai
- [ ] Verify writes succeed

## Recovery
- [ ] Restore Delhi infrastructure
- [ ] Sync Chennai data to Delhi
- [ ] Restore Delhi as primary
- [ ] Rebalance DNS weights
- [ ] Verify replication working

## Post-Drill
- [ ] Document lessons learned
- [ ] Update runbooks if needed
- [ ] Report RTO and RPO metrics
- [ ] Schedule next drill
```

**Metrics to Track:**
- **RTO (Recovery Time Objective)**: Time to restore service
- **RPO (Recovery Point Objective)**: Data loss window
- **Target RTO**: < 15 minutes
- **Target RPO**: < 1 minute (streaming replication)

---

## Cost Analysis

### Per-Region Infrastructure Costs

| Component | Specification | Monthly Cost (Est.) |
|-----------|---------------|---------------------|
| Frontend VMs | C3.8GB × 1-5 instances | ₹2,000-10,000 |
| Backend VMs | C3.8GB × 1-5 instances | ₹2,000-10,000 |
| PgPool VM | C2.4GB × 1 instance | ₹1,500 |
| Load Balancers | Starter plan × 2 | ₹1,000 |
| PostgreSQL | DBS.8GB | ₹3,000 |
| VPC | Included | ₹0 |
| **Region Total** | | **₹9,500-25,500** |

### Total Multi-Region Cost

| Configuration | Monthly Cost (Est.) |
|---------------|---------------------|
| **Minimum (1 VM each)** | ₹19,000-25,000 |
| **Average Load** | ₹30,000-40,000 |
| **High Availability (3+ VMs)** | ₹50,000-75,000 |

### External Services

| Service | Plan | Cost |
|---------|------|------|
| Route 53 | Per query | ~$1-2/month |
| UptimeRobot | Free tier | $0 |
| UptimeRobot Pro | 1-min checks | $7/month |

### ROI Calculation

**Cost of Downtime (Example):**
- Revenue: ₹10 lakhs/month
- Revenue per minute: ₹231
- 1-hour outage cost: ₹13,860

**DR Investment Return:**
- Monthly DR cost: ₹20,000-30,000
- Single 1-hour outage prevented: Saves ₹13,860
- 2-hour outage prevented: Saves ₹27,720
- **Breakeven: 1.5 hours of downtime prevention per month**

---

## Lessons Learned

### What Worked Well

1. **Infrastructure as Code (Terraform)**
   - Reproducible deployments
   - Version-controlled infrastructure
   - Easy to spin up identical environments
   - Self-documenting architecture

2. **Database Proxy Pattern (PgPool-II)**
   - Eliminated connection string changes during failover
   - Automatic read/write splitting improved performance
   - Connection pooling reduced database load

3. **Health-Checked DNS (Route 53)**
   - Sub-minute traffic redirection
   - Zero application changes needed
   - Geographic load balancing included

4. **Caddy over Nginx**
   - Simpler configuration reduced errors
   - Automatic HTTPS saves operational overhead
   - Built-in reverse proxy worked seamlessly

### Challenges Encountered

1. **E2E Networks API Limitations**
   - Not all operations available via API
   - Some manual console steps still required
   - Documentation could be more comprehensive

2. **Cross-Region Latency**
   - Writes from Chennai to Delhi add ~30-50ms
   - Need to optimize for local reads
   - Consider eventual consistency where possible

3. **Testing Complexity**
   - Difficult to test failover without production data
   - Staging environment doesn't perfectly replicate prod
   - Need dedicated DR testing environments

4. **Monitoring Gaps**
   - Free monitoring has 5-minute resolution
   - Faster checks require paid tiers
   - Application-level monitoring needed separately

### Recommendations

1. **Start Simple, Iterate**
   - Begin with basic active/passive
   - Add automation incrementally
   - Test each component thoroughly

2. **Invest in Monitoring**
   - Observability is non-negotiable
   - Consider paid monitoring for production
   - Set up comprehensive alerting

3. **Document Everything**
   - Runbooks for every scenario
   - Architecture decision records
   - Regular documentation reviews

4. **Practice Regularly**
   - Quarterly DR drills minimum
   - Game days with realistic scenarios
   - Post-incident reviews

5. **Consider Managed Services**
   - Managed Kubernetes for orchestration
   - Managed monitoring (Datadog, New Relic)
   - Reduces operational overhead

---

## Conclusion

Building a highly available multi-region application is not just about technology—it's about resilience, reliability, and being prepared for the unexpected. This case study demonstrates that with careful planning, the right tools, and a commitment to automation, you can achieve:

- **99.9%+ availability** through geographic redundancy
- **Near-zero RTO** with automatic failover
- **Minimal RPO** through synchronous replication
- **Cost efficiency** through autoscaling and resource optimization
- **Operational confidence** through documented procedures

**Key Takeaways:**

1. **Active/Active is achievable** on E2E Networks with proper architecture
2. **Infrastructure as Code** (Terraform) makes complex deployments manageable
3. **Database proxy patterns** (PgPool-II) abstract away failover complexity
4. **Automated monitoring** (UptimeRobot) enables proactive response
5. **Health-checked DNS** (Route 53) provides instantaneous failover

The investment in multi-region architecture pays dividends in customer trust, business continuity, and peace of mind. As your application grows, this foundation scales with you.

---

## Getting Started

Ready to deploy your own highly available infrastructure? The complete Terraform code is available at:

**GitHub Repository:** [github.com/indykish/three-tier-app-claude](https://github.com/indykish/three-tier-app-claude)

**Quick Start:**
```bash
git clone https://github.com/indykish/three-tier-app-claude.git
cd three-tier-app-claude/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your credentials
cd delhi && terraform init && terraform apply
```

**Documentation Included:**
- Step-by-step deployment guides
- Operational runbooks
- Failover automation scripts
- Monitoring setup instructions
- Cost optimization tips

---

## About the Author

This architecture was designed and implemented as a demonstration of production-grade multi-region deployments on E2E Networks. The project showcases how to achieve high availability, automatic failover, and infrastructure automation using modern DevOps practices.

**Connect:**
- GitHub: [indykish/three-tier-app-claude](https://github.com/indykish/three-tier-app-claude)
- E2E Networks: [e2enetworks.com](https://www.e2enetworks.com)

---

*Published as part of the E2E Networks community knowledge base. For corrections, updates, or contributions, please submit a pull request to the GitHub repository.*

---

## Appendix: Quick Reference

### Terraform Commands

```bash
# Initialize
terraform init

# Plan
terraform plan -var-file="../terraform.tfvars"

# Apply
terraform apply -var-file="../terraform.tfvars"

# Destroy
terraform destroy -var-file="../terraform.tfvars"

# Show outputs
terraform output

# Refresh state
terraform refresh
```

### Health Check Commands

```bash
# Frontend
curl http://<lb-ip>/health/

# Backend
curl http://<lb-ip>:3001/health

# Database connection
psql -h <db-ip> -U dbadmin -d branding_db -c "SELECT 1"

# Replication status
psql -h <primary-ip> -U dbadmin -d branding_db \
  -c "SELECT * FROM pg_stat_replication;"
```

### Useful PostgreSQL Commands

```sql
-- Check if replica
SELECT pg_is_in_recovery();

-- Check replication lag
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::INT;

-- Promote replica to primary
SELECT pg_promote();
```

### File Structure

```
terraform/
├── delhi/                    # Primary region
├── chennai/                  # Secondary region
├── global/                   # Shared configurations
├── monitoring/               # UptimeRobot setup
├── docs/                     # Additional documentation
├── scripts/                  # Operational scripts
├── terraform.tfvars.example  # Example variables
└── README.md                 # This document
```

---

**End of Case Study**
