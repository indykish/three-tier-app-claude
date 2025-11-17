# Active/Active Delhi-Chennai Three-Tier Infrastructure

This Terraform configuration deploys a production-grade three-tier application across two E2E Networks regions (Delhi and Chennai) in an active/active configuration with database replication.

## Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │           DNS (Route 53)            │
                    │         Active/Active Routing        │
                    └─────────────┬───────────────────────┘
                                  │
                    ┌─────────────┴───────────────┐
                    ▼                             ▼
         ┌─────────────────┐           ┌─────────────────┐
         │   DELHI REGION  │           │  CHENNAI REGION │
         └─────────────────┘           └─────────────────┘
                    │                             │
         ┌──────────┴──────────┐       ┌──────────┴──────────┐
         ▼                     ▼       ▼                     ▼
    Frontend LB           Backend LB    Frontend LB       Backend LB
         │                     │            │                 │
         ▼                     ▼            ▼                 ▼
    ┌─────────┐          ┌─────────┐   ┌─────────┐      ┌─────────┐
    │ Caddy   │          │  Node   │   │ Caddy   │      │  Node   │
    │ +React  │ ──API──▶ │ Express │   │ +React  │──API─▶│ Express │
    │ (ASG)   │          │  (ASG)  │   │ (ASG)   │      │  (ASG)  │
    └─────────┘          └─────────┘   └─────────┘      └─────────┘
                              │                              │
                              ▼                              ▼
                    ┌─────────────────┐          ┌─────────────────┐
                    │   PostgreSQL    │          │   PostgreSQL    │
                    │    PRIMARY      │◀─REPL───▶│    REPLICA      │
                    └─────────────────┘          └─────────────────┘
```

### Components

| Layer | Delhi | Chennai |
|-------|-------|---------|
| **Frontend** | Load Balancer + Autoscaling Group (Caddy + React) | Load Balancer + Autoscaling Group (Caddy + React) |
| **Backend** | Load Balancer + Autoscaling Group (Node.js Express) | Load Balancer + Autoscaling Group (Node.js Express) |
| **Database** | PostgreSQL Primary (Read/Write) | PostgreSQL Replica (Read Local, Write to Delhi) |
| **Network** | VPC (10.10.0.0/16) | VPC (10.20.0.0/16) |

## Prerequisites

1. **E2E Networks Account** with:
   - API Key and Auth Token
   - Project ID
   - SSH Key named `KishoreMac` (or update in variables)

2. **Terraform** >= 1.0.0

3. **AWS Route 53** (for DNS management - external setup)

## Quick Start

### 1. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:
```hcl
# Required credentials
e2e_api_key    = "your-api-key"
e2e_auth_token = "your-auth-token"
project_id     = "your-project-id"

# Database password
db_password    = "your-secure-password"
```

### 2. Deploy Delhi (Primary Region)

```bash
cd delhi

# Initialize Terraform
terraform init

# Review the plan
terraform plan -var-file="../terraform.tfvars"

# Deploy
terraform apply -var-file="../terraform.tfvars"

# Save outputs for Chennai deployment
terraform output -json > ../delhi-outputs.json
```

**Important outputs to note:**
- `db_primary_private_ip` - Needed for Chennai replica
- `db_primary_id` - Needed for Chennai replica setup
- `frontend_lb_public_ip` - Delhi frontend endpoint

### 3. Deploy Chennai (Secondary Region)

```bash
cd ../chennai

# Initialize Terraform
terraform init

# Get Delhi database information
DELHI_DB_IP=$(cd ../delhi && terraform output -raw db_primary_private_ip)
DELHI_DB_ID=$(cd ../delhi && terraform output -raw db_primary_id)

# Review the plan
terraform plan \
  -var-file="../terraform.tfvars" \
  -var="delhi_db_primary_ip=${DELHI_DB_IP}" \
  -var="delhi_db_primary_id=${DELHI_DB_ID}"

# Deploy
terraform apply \
  -var-file="../terraform.tfvars" \
  -var="delhi_db_primary_ip=${DELHI_DB_IP}" \
  -var="delhi_db_primary_id=${DELHI_DB_ID}"
```

### 4. Configure DNS (Route 53)

Since E2E Networks doesn't provide managed DNS, use AWS Route 53:

#### Create Health Checks

1. **Delhi Health Check**:
   - Protocol: HTTP
   - Host: `<Delhi Frontend LB IP>`
   - Path: `/health/`
   - Port: 80
   - Failure threshold: 3

2. **Chennai Health Check**:
   - Protocol: HTTP
   - Host: `<Chennai Frontend LB IP>`
   - Path: `/health/`
   - Port: 80
   - Failure threshold: 3

#### Create DNS Records

Create a **Weighted Routing Policy** with health checks:

```
app.yourdomain.com → A Record
  - Delhi LB IP (Weight: 50, Health Check: Delhi)
  - Chennai LB IP (Weight: 50, Health Check: Chennai)
```

**For failover behavior:**
- If Delhi becomes unhealthy → Route 53 automatically directs 100% traffic to Chennai
- If Chennai becomes unhealthy → Route 53 automatically directs 100% traffic to Delhi
- Both healthy → Traffic split 50/50

## Operational Procedures

### Health Monitoring

Check status of both regions:
```bash
./scripts/health-check.sh
```

Or individually:
```bash
# Delhi
curl http://<delhi-frontend-lb-ip>/health/
curl http://<delhi-backend-lb-ip>:3001/health

# Chennai
curl http://<chennai-frontend-lb-ip>/health/
curl http://<chennai-backend-lb-ip>:3001/health
```

### Database Operations

**Normal Operation:**
- Delhi: Handles all writes, reads from local primary
- Chennai: Reads from local replica, writes go to Delhi primary

**Check Replication Status:**
```bash
# Connect to Delhi primary
psql -h <delhi-db-ip> -U dbadmin -d branding_db
SELECT * FROM pg_stat_replication;

# Connect to Chennai replica
psql -h <chennai-db-ip> -U dbadmin -d branding_db
SELECT pg_is_in_recovery();  -- Should return 't' for replica
```

## Failover Procedures

### Scenario 1: Delhi Primary Failure

When Delhi region is down and Chennai needs to become the active primary:

```bash
./scripts/promote-chennai-db.sh
```

**Manual Steps:**
1. Confirm Delhi is unreachable
2. Promote Chennai replica to standalone primary (E2E Console)
3. Update Chennai backend environment to write locally
4. Update Route 53 to route 100% to Chennai
5. Monitor application functionality

### Scenario 2: Restore Delhi as Primary

After Delhi recovery:

```bash
./scripts/restore-delhi-primary.sh
```

**Manual Steps:**
1. Sync data from Chennai to Delhi
2. Promote Delhi DB back to primary
3. Configure Chennai DB as replica of Delhi
4. Update backend configurations
5. Restore Route 53 weights (50/50)

### Scenario 3: Complete Regional Failover Drill

**Pre-drill:**
```bash
# Document current state
terraform output -json > pre-drill-state.json
```

**Execute drill:**
1. Simulate Delhi failure (stop Delhi LB)
2. Verify Route 53 failover to Chennai (automatic via health check)
3. Verify Chennai can handle all traffic
4. Check database writes on Chennai
5. Restore Delhi LB
6. Verify traffic returns to 50/50

## Scaling Operations

### Manual Scaling

Autoscaling is automatic based on CPU thresholds:
- Scale up: CPU > 70-80%
- Scale down: CPU < 25-30%

To modify thresholds, update `autoscaling-frontend.tf` or `autoscaling-backend.tf`:
```hcl
resource "e2e_autoscaling" "frontend" {
  scaleup_policy  = 80  # CPU threshold
  scaledown_policy = 30
}
```

### Update Scaling Limits

```bash
# Edit autoscaling_min and autoscaling_max in terraform.tfvars
terraform apply -var-file="../terraform.tfvars"
```

## Destroy Infrastructure

**WARNING: This will permanently delete all resources.**

```bash
# Chennai first (depends on Delhi primary DB)
cd chennai
terraform destroy \
  -var-file="../terraform.tfvars" \
  -var="delhi_db_primary_ip=x.x.x.x" \
  -var="delhi_db_primary_id=xxx"

# Then Delhi
cd ../delhi
terraform destroy -var-file="../terraform.tfvars"
```

## Infrastructure Costs

Per region (approximate):
- Frontend VMs: C3.8GB × min 1 instance
- Backend VMs: C3.8GB × min 1 instance
- Load Balancers: 2 × Starter plan
- PostgreSQL: DBS.8GB plan
- VPC: Included

**Total: ~2× regional cost for active/active**

## Troubleshooting

### Common Issues

1. **Terraform apply fails with auth error**
   - Verify `e2e_api_key` and `e2e_auth_token` are correct
   - Check token hasn't expired

2. **SSH key not found**
   - Ensure `KishoreMac` key exists in your E2E account
   - Or update `ssh_key_name` variable

3. **Database connection fails**
   - Check VPC peering if using different networks
   - Verify security group allows port 5432
   - Test with `psql` from backend VM

4. **Replication lag**
   - Monitor with `pg_stat_replication` on primary
   - Check network connectivity between regions

5. **Frontend shows 502 error**
   - Check backend health: `curl http://<backend-lb>:3001/health`
   - Verify Caddy config: `systemctl status caddy`
   - Check backend logs: `journalctl -u backend`

### Logs

```bash
# Frontend (Caddy)
journalctl -u caddy -f

# Backend (Node.js)
journalctl -u backend -f
```

## Security Considerations

1. **Credentials**: Never commit `terraform.tfvars` to version control
2. **Network**: VPCs isolate regional traffic
3. **Database**: Encryption at rest enabled
4. **DDoS**: BitNinja protection on load balancers
5. **SSH**: Only key-based authentication

## File Structure

```
terraform/
├── delhi/                    # Primary region
│   ├── main.tf              # Provider and locals
│   ├── variables.tf         # Region variables
│   ├── network.tf           # VPC configuration
│   ├── dbaas-primary.tf     # Primary PostgreSQL
│   ├── autoscaling-frontend.tf
│   ├── autoscaling-backend.tf
│   ├── lb-frontend.tf       # Frontend load balancer
│   ├── lb-backend.tf        # Backend load balancer
│   └── outputs.tf           # Region outputs
├── chennai/                  # Secondary region
│   ├── (same structure as delhi)
│   └── dbaas-replica.tf     # Replica PostgreSQL
├── global/                   # Shared configurations
│   ├── versions.tf          # Provider versions
│   ├── providers.tf         # Provider config template
│   └── variables.tf         # Global variables
├── scripts/                  # Operational scripts
│   ├── promote-chennai-db.sh
│   ├── restore-delhi-primary.sh
│   └── health-check.sh
├── terraform.tfvars.example  # Example variables
└── README.md                 # This documentation
```

## Support

For issues with:
- **E2E Networks Provider**: Check [Terraform Registry](https://registry.terraform.io/providers/e2eterraformprovider/e2e/latest)
- **Application**: See main repository issues
- **This Terraform setup**: Raise issue in repository
