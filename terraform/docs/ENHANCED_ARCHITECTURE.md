# Enhanced Architecture: True Active/Active with Automatic Failover

## Problem with Current Setup

The current architecture has manual failover:
1. Manual database promotion
2. Manual DNS weight changes
3. Manual backend reconfiguration

## Solution: Database Proxy + Automatic Failover

### Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │       External DNS (Route 53)       │
                    │    Health-Checked Weighted Routing   │
                    └─────────────┬───────────────────────┘
                                  │
                    ┌─────────────┴───────────────┐
                    ▼                             ▼
         ┌─────────────────┐           ┌─────────────────┐
         │   DELHI REGION  │           │  CHENNAI REGION │
         └─────────────────┘           └─────────────────┘
                    │                             │
              Frontend LB                   Frontend LB
                    │                             │
              Caddy+React                   Caddy+React
                    │                             │
              Backend LB                    Backend LB
                    │                             │
              Node.js API                   Node.js API
                    │                             │
                    ▼                             ▼
            ┌──────────────┐            ┌──────────────┐
            │  PgPool-II   │            │  PgPool-II   │
            │   (Proxy)    │            │   (Proxy)    │
            └──────┬───────┘            └──────┬───────┘
                   │                           │
                   └───────────┬───────────────┘
                               ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │  Patroni Cluster│
                    │ (Auto-Failover) │
                    └─────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        ┌──────────┐              ┌──────────┐
        │  Delhi   │   Streaming  │ Chennai  │
        │  Primary │◄────────────►│  Replica │
        └──────────┘  Replication └──────────┘
```

## Key Components

### 1. PgPool-II (Database Proxy)
- **Single connection endpoint** for backends
- **Automatic failover detection**
- **Read/Write splitting** (reads to local, writes to primary)
- **Connection pooling**
- **Load balancing** for read queries

### 2. Patroni (PostgreSQL HA)
- **Automatic leader election** using distributed consensus (etcd)
- **Automatic promotion** when primary fails
- **Handles replication** setup automatically
- **REST API** for health checks and manual operations

### 3. UptimeRobot (Synthetic Monitoring)
- Monitors frontend LBs from multiple locations
- Triggers webhooks on failures
- Integrates with alerting (Slack, PagerDuty, etc.)

## Why This Works

1. **Backends never change config**: They always connect to `pgpool:5432`
2. **Automatic promotion**: Patroni handles DB promotion automatically
3. **Zero-downtime**: PgPool redirects connections seamlessly
4. **True active/active**: Both regions serve traffic, automatic failover

## Trade-offs

- **Additional complexity**: More moving parts (Patroni, etcd, PgPool)
- **Additional VMs**: Need dedicated VMs for Patroni/etcd cluster
- **Network latency**: Cross-region writes still go to primary
- **Cost**: More infrastructure to maintain

## Recommendations

### For Production:
Use **Patroni + etcd + PgPool-II** - Industry standard for PostgreSQL HA

### For Simpler Setup:
Use **PgPool-II + Health Check Scripts** - Easier but less robust

### For Budget Constraints:
Current setup with **improved automation scripts** + UptimeRobot webhooks
