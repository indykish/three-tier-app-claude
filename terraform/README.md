# Production Deployment Guide - Terraform

## Step-by-Step Deployment Using Terraform

This guide provides complete instructions for deploying the three-tier application to E2E Networks using Terraform.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Phase 1: Configure Variables](#phase-1-configure-variables)
- [Phase 2: Validate Terraform Configurations (Dry-Run)](#phase-2-validate-terraform-configurations-dry-run)
- [Phase 3: Understanding the Setup Scripts](#phase-3-understanding-the-setup-scripts)
- [Phase 4: Deploy Delhi Region (Primary)](#phase-4-deploy-delhi-region-primary)
- [Phase 5: Deploy Chennai Region (Secondary)](#phase-5-deploy-chennai-region-secondary)
- [Phase 6: Configure DNS with Health Checks](#phase-6-configure-dns-with-health-checks)
- [Database High Availability](#database-high-availability)
- [Monitoring Setup](#monitoring-setup)
- [Operational Procedures](#operational-procedures)
- [Troubleshooting](#troubleshooting)
- [Cost Estimation](#cost-estimation)

---

## Prerequisites

Before starting the deployment, ensure you have:

**E2E Networks Account:**
- Active E2E Networks account ([Sign up here](https://myaccount.e2enetworks.com))
- API key and authentication token from the [E2E Networks Console](https://myaccount.e2enetworks.com/api)
- Project ID
- Access to Delhi and Chennai regions

**Local Development Tools:**
- Terraform 1.0+ ([Download](https://www.terraform.io/downloads))
- Git
- SSH key pair registered with E2E Networks

**Optional but Recommended:**
- AWS account for Route 53 DNS (or alternative DNS provider)
- UptimeRobot account for monitoring ([Free tier](https://uptimerobot.com))
- Domain name for public access

**Technical Knowledge:**
- Basic understanding of Terraform
- Familiarity with cloud infrastructure concepts
- Understanding of VPCs, load balancers, and databases

---

## Phase 1: Configure Variables

### 1.1 Clone the Repository

```bash
# Clone repository
git clone https://github.com/indykish/three-tier-app-claude.git
cd three-tier-app-claude/terraform
```

### 1.2 Create Configuration File

```bash
# Copy example configuration
cp terraform.tfvars.example terraform.tfvars
```

### 1.3 Edit Configuration

Edit `terraform.tfvars` with your specific values:

```hcl
# E2E Networks Authentication
# Get these from: https://myaccount.e2enetworks.com/api
e2e_api_key    = "your-api-key-here"
e2e_auth_token = "your-auth-token-here"
project_id     = "your-project-id"

# SSH Access
# Use the name of your SSH key registered in E2E Networks
ssh_key_name = "your-ssh-key-name"

# VM Configuration
# Available images: Ubuntu-24.04, Ubuntu-22.04, Ubuntu-20.04
image_name = "Ubuntu-24.04"

# Available plans: C2.4GB, C3.8GB, C4.16GB, etc.
# Recommendation: C3.8GB (4 vCPU, 8GB RAM, 100GB SSD) for production
vm_plan = "C3.8GB"

# Database Configuration
# Available plans: DBS.8GB, DBS.16GB, DBS.32GB
db_plan     = "DBS.8GB"
db_version  = "16"
db_name     = "branding_db"
db_user     = "dbadmin"
db_password = "YourSecureP@ssw0rd!"  # Change this!

# Autoscaling Configuration
# Minimum and maximum number of instances per tier
autoscaling_min = 1  # Minimum instances to keep running
autoscaling_max = 5  # Maximum instances during high load

# Network Configuration
# CIDR blocks for VPCs (should not overlap)
vpc_cidr_delhi   = "10.10.0.0/16"
vpc_cidr_chennai = "10.20.0.0/16"
```

**Important Security Notes:**
- Never commit `terraform.tfvars` to version control (it's in `.gitignore`)
- Use a strong database password (mix of letters, numbers, symbols)
- Store credentials securely (consider using environment variables or a secrets manager)

### 1.4 Verify Configuration

Check that all required values are set:

```bash
# Verify file syntax
cat terraform.tfvars

# Ensure no placeholder values remain
grep -E "your-|change-this|example" terraform.tfvars
# (This should return no results)
```

---

## Phase 2: Validate Terraform Configurations (Dry-Run)

Before deploying any infrastructure, validate all Terraform configurations to catch syntax errors and provider schema mismatches.

### 2.1 Validate Delhi Configuration

```bash
cd delhi
terraform init
terraform validate
terraform fmt -check  # Check formatting consistency
```

**Expected Output:**
```
Success! The configuration is valid.
```

### 2.2 Validate Chennai Configuration

```bash
cd ../chennai
terraform init
terraform validate
terraform fmt -check
```

### 2.3 Validate Monitoring Configuration (Optional)

```bash
cd ../monitoring
terraform init
terraform validate
terraform fmt -check
```

### 2.4 Preview Changes (Plan)

```bash
# See what will be created without actually deploying
cd ../delhi
terraform plan -var-file="../terraform.tfvars"
```

This shows:
- Resources to be created
- Resource dependencies
- Estimated execution time
- Any potential errors

**Common Validation Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid provider attributes` | Provider version mismatch | Run `terraform init -upgrade` |
| `Missing required variable` | Variable not set in tfvars | Add missing variable to terraform.tfvars |
| `Invalid resource reference` | Typo in resource name | Check resource names in .tf files |
| `Type mismatch` | Wrong variable type | Check variable types in variables.tf |

---

## Phase 3: Understanding the Setup Scripts

The Terraform configuration uses `start_script` to automatically provision VMs on first boot. These scripts are located in `terraform/scripts/`.

### 3.1 Frontend Setup Script

**File:** `terraform/scripts/setup-frontend.sh`

This script runs automatically when frontend VMs boot and:
1. Updates system packages
2. Installs Node.js 18.x LTS
3. Installs Caddy web server
4. Clones the application repository
5. Builds the React frontend
6. Configures Caddy as reverse proxy
7. Starts frontend service

**Key Variables to Customize:**

```bash
# In setup-frontend.sh
GIT_REPO="https://github.com/indykish/three-tier-app-claude.git"
API_URL="http://your-backend-lb-ip:3001"  # Update with actual backend LB IP
```

### 3.2 Backend Setup Script

**File:** `terraform/scripts/setup-backend.sh`

This script runs automatically when backend VMs boot and:
1. Updates system packages
2. Installs Node.js 18.x LTS
3. Installs PM2 process manager
4. Clones the application repository
5. Installs backend dependencies
6. Configures environment variables
7. Starts Express API with PM2

**Key Variables to Customize:**

```bash
# In setup-backend.sh
GIT_REPO="https://github.com/indykish/three-tier-app-claude.git"
DATABASE_URL="postgresql://dbadmin:password@db-host:5432/branding_db"  # Update with actual DB connection
```

### 3.3 Customization Steps

**Before deployment, modify these scripts:**

```bash
# 1. Edit frontend script
nano terraform/scripts/setup-frontend.sh

# Update:
# - GIT_REPO (if using a fork)
# - API_URL (will be filled after backend LB is created)
# - Caddy domain configuration (if using custom domain)

# 2. Edit backend script
nano terraform/scripts/setup-backend.sh

# Update:
# - GIT_REPO (if using a fork)
# - DATABASE_URL (will be filled after database is created)
# - Any environment-specific variables
```

### 3.4 Important Notes

- Scripts run as **root** during VM initialization
- Logs are available in `/var/log/cloud-init-output.log`
- Scripts must be **idempotent** (safe to run multiple times)
- VM won't be "ready" until scripts complete successfully (usually 5-10 minutes)
- For production autoscaling, consider using **pre-baked images** instead of setup scripts

### 3.5 Debugging Setup Scripts

If VMs don't work correctly after creation:

```bash
# SSH into the VM
ssh root@<vm-ip-address>

# Check cloud-init logs
tail -f /var/log/cloud-init-output.log

# Check if services are running
systemctl status caddy  # For frontend
pm2 status              # For backend

# Manually re-run setup script if needed
bash /root/setup-script.sh
```

---

## Phase 4: Deploy Delhi Region (Primary)

Delhi will serve as the **primary region** with the **primary database** for write operations.

### 4.1 Initialize and Deploy

```bash
cd terraform/delhi

# Initialize Terraform - downloads provider plugins
terraform init

# Preview infrastructure changes
terraform plan -var-file="../terraform.tfvars"

# Review the plan carefully - it should show:
# - 1 VPC
# - 1 PostgreSQL Primary Database
# - 2 Autoscaling Groups (frontend, backend)
# - 2 Load Balancers (frontend external, backend internal)

# Deploy infrastructure (takes 10-15 minutes)
terraform apply -var-file="../terraform.tfvars"
```

### 4.2 What Gets Created

| Resource | Name | Specification | Purpose |
|----------|------|---------------|---------|
| **VPC** | `three-tier-delhi-vpc` | 10.10.0.0/16 | Network isolation |
| **PostgreSQL Primary** | `three-tier-primary-db` | DBS.8GB, PostgreSQL 16 | Main database |
| **Frontend Autoscaling** | `three-tier-delhi-frontend-asg` | C3.8GB instances | React + Caddy servers |
| **Backend Autoscaling** | `three-tier-delhi-backend-asg` | C3.8GB instances | Node.js Express API |
| **Frontend LB** | `three-tier-delhi-frontend-lb` | External, HTTP | Public traffic entry |
| **Backend LB** | `three-tier-delhi-backend-lb` | Internal, HTTP | API load distribution |

### 4.3 Capture Outputs

After deployment completes, save the outputs:

```bash
# Save all outputs to JSON file
terraform output -json > ../delhi-outputs.json

# Display key values
echo "=== Delhi Deployment Outputs ==="
echo "Frontend LB IP: $(terraform output -raw frontend_lb_public_ip)"
echo "Backend LB IP: $(terraform output -raw backend_lb_private_ip)"
echo "Database Private IP: $(terraform output -raw db_primary_private_ip)"
echo "Database ID: $(terraform output -raw db_primary_id)"
```

**Save these values - you'll need them for:**
- Chennai deployment (database replication)
- DNS configuration
- Application configuration
- Monitoring setup

### 4.4 Verify Deployment

```bash
# 1. Check Terraform state
terraform show

# 2. Test frontend LB
FRONTEND_IP=$(terraform output -raw frontend_lb_public_ip)
curl -I http://${FRONTEND_IP}/

# Expected: HTTP 200 OK (may take 5-10 minutes for VMs to fully provision)

# 3. Test backend health
BACKEND_IP=$(terraform output -raw backend_lb_private_ip)
# (Backend LB is internal, so test from a VM in the VPC or use E2E console)

# 4. Check E2E Networks Console
# - Navigate to https://myaccount.e2enetworks.com
# - Verify all resources are created
# - Check autoscaling group instances are running
```

### 4.5 Initial Configuration

After Delhi is deployed and VMs are provisioned, you may need to:

1. **Update Frontend API URL** (if not done in setup script):
   ```bash
   ssh root@<frontend-vm-ip>
   # Update API URL in environment or rebuild with correct backend LB IP
   ```

2. **Update Backend Database URL** (if not done in setup script):
   ```bash
   ssh root@<backend-vm-ip>
   # Update DATABASE_URL environment variable
   pm2 restart all
   ```

3. **Initialize Database Schema**:
   ```bash
   ssh root@<backend-vm-ip>
   cd /opt/three-tier-app-claude/backend
   npm run db:init
   ```

### 4.6 Troubleshooting Delhi Deployment

**Issue: Frontend LB returns 503 Service Unavailable**
- **Cause**: VMs still provisioning or setup script failed
- **Solution**:
  - Wait 10-15 minutes for cloud-init to complete
  - SSH to VM and check `/var/log/cloud-init-output.log`
  - Verify Caddy is running: `systemctl status caddy`

**Issue: Backend cannot connect to database**
- **Cause**: Incorrect DATABASE_URL or firewall rules
- **Solution**:
  - Verify database private IP matches terraform output
  - Check VPC configuration allows backend → database communication
  - Test connection: `psql $DATABASE_URL`

**Issue: Autoscaling group has no instances**
- **Cause**: Invalid image name or SSH key
- **Solution**:
  - Check E2E console for error messages
  - Verify `image_name` and `ssh_key_name` in terraform.tfvars
  - Ensure SSH key exists in E2E Networks

---

## Phase 5: Deploy Chennai Region (Secondary)

Chennai will serve as the **secondary region** with a **read replica database**.

### 5.1 Get Delhi Database Information

```bash
# From terraform/delhi directory
cd ../delhi

# Extract database information
DELHI_DB_IP=$(terraform output -raw db_primary_private_ip)
DELHI_DB_ID=$(terraform output -raw db_primary_id)

echo "Delhi DB IP: ${DELHI_DB_IP}"
echo "Delhi DB ID: ${DELHI_DB_ID}"
```

### 5.2 Deploy Chennai Infrastructure

```bash
cd ../chennai

# Initialize Terraform
terraform init

# Preview changes
terraform plan \
  -var-file="../terraform.tfvars" \
  -var="delhi_db_primary_ip=${DELHI_DB_IP}" \
  -var="delhi_db_primary_id=${DELHI_DB_ID}"

# Deploy (takes 10-15 minutes)
terraform apply \
  -var-file="../terraform.tfvars" \
  -var="delhi_db_primary_ip=${DELHI_DB_IP}" \
  -var="delhi_db_primary_id=${DELHI_DB_ID}"
```

### 5.3 Chennai Components

| Resource | Name | Specification | Purpose |
|----------|------|---------------|---------|
| **VPC** | `three-tier-chennai-vpc` | 10.20.0.0/16 | Network isolation |
| **PostgreSQL Replica** | `three-tier-replica-db` | DBS.8GB, PostgreSQL 16 | Read replica |
| **Frontend Autoscaling** | `three-tier-chennai-frontend-asg` | C3.8GB instances | React + Caddy servers |
| **Backend Autoscaling** | `three-tier-chennai-backend-asg` | C3.8GB instances | Node.js Express API |
| **Frontend LB** | `three-tier-chennai-frontend-lb` | External, HTTP | Public traffic entry |
| **Backend LB** | `three-tier-chennai-backend-lb` | Internal, HTTP | API load distribution |

### 5.4 Capture Outputs

```bash
# Save Chennai outputs
terraform output -json > ../chennai-outputs.json

# Display key values
echo "=== Chennai Deployment Outputs ==="
echo "Frontend LB IP: $(terraform output -raw frontend_lb_public_ip)"
echo "Backend LB IP: $(terraform output -raw backend_lb_private_ip)"
echo "Database Private IP: $(terraform output -raw db_replica_private_ip)"
```

### 5.5 Configure Database Replication

**Important:** E2E Networks DBaaS may require manual steps to set up replication. Check with E2E support if replication doesn't start automatically.

```bash
# Verify replication status
# (This may require SSH access to database VMs or E2E console)

# Check replication lag
# From Chennai database:
psql -h <chennai-db-ip> -U dbadmin -d branding_db -c "SELECT pg_last_wal_receive_lsn(), pg_last_wal_replay_lsn();"

# From Delhi database:
psql -h <delhi-db-ip> -U dbadmin -d branding_db -c "SELECT pg_current_wal_lsn();"
```

### 5.6 Verify Chennai Deployment

```bash
# Test frontend LB
CHENNAI_FRONTEND_IP=$(terraform output -raw frontend_lb_public_ip)
curl -I http://${CHENNAI_FRONTEND_IP}/

# Expected: HTTP 200 OK

# Verify replication
# (Check E2E console or database monitoring tools)
```

---

## Phase 6: Configure DNS with Health Checks

DNS with health checks enables automatic failover between regions.

### 6.1 AWS Route 53 Setup

#### Step 1: Create Health Checks

**Delhi Health Check:**

1. Go to AWS Route 53 Console → Health Checks → Create health check
2. Configure:
   ```
   Name: three-tier-delhi-health
   What to monitor: Endpoint
   Protocol: HTTP
   IP address: <Delhi Frontend LB IP>
   Port: 80
   Path: /health/
   ```
3. Advanced configuration:
   ```
   Request interval: Standard (30 seconds)
   Failure threshold: 3
   String matching: (optional) "healthy"
   Latency measurements: Enable
   ```

**Chennai Health Check:**

1. Create health check → Configure:
   ```
   Name: three-tier-chennai-health
   What to monitor: Endpoint
   Protocol: HTTP
   IP address: <Chennai Frontend LB IP>
   Port: 80
   Path: /health/
   Request interval: Standard (30 seconds)
   Failure threshold: 3
   ```

#### Step 2: Create Hosted Zone

```bash
# If you don't have a hosted zone yet
# 1. Route 53 → Hosted zones → Create hosted zone
# 2. Domain name: yourdomain.com
# 3. Type: Public hosted zone
# 4. Create hosted zone
```

#### Step 3: Create Weighted A Records

**Record 1: Delhi**

1. Create record → Configure:
   ```
   Record name: app.yourdomain.com
   Record type: A - IPv4 address
   Value: <Delhi Frontend LB IP>
   TTL: 60
   Routing policy: Weighted
   ```
2. Weighted routing configuration:
   ```
   Weight: 50
   Set ID: delhi-primary
   Health check: three-tier-delhi-health
   Evaluate target health: No
   ```

**Record 2: Chennai**

1. Create record → Configure:
   ```
   Record name: app.yourdomain.com
   Record type: A - IPv4 address
   Value: <Chennai Frontend LB IP>
   TTL: 60
   Routing policy: Weighted
   ```
2. Weighted routing configuration:
   ```
   Weight: 50
   Set ID: chennai-secondary
   Health check: three-tier-chennai-health
   Evaluate target health: No
   ```

### 6.2 How It Works

**Normal Operation (both healthy):**
- 50% of traffic → Delhi
- 50% of traffic → Chennai

**Delhi fails health check:**
- 0% of traffic → Delhi
- 100% of traffic → Chennai (automatic)

**Chennai fails health check:**
- 100% of traffic → Delhi (automatic)
- 0% of traffic → Chennai

**Both fail:**
- DNS returns both IPs
- Browsers will try both (likely fail)
- Indicates major outage requiring investigation

### 6.3 Alternative DNS Providers

**Cloudflare:**
- Supports health checks with load balancing
- Free tier available (limited checks)
- Terraform provider: `cloudflare/cloudflare`

**Azure Traffic Manager:**
- Supports weighted routing
- Health monitoring included
- Terraform provider: `hashicorp/azurerm`

**E2E Networks DNS (if available):**
- Check E2E documentation for DNS capabilities
- May not support health checks

### 6.4 Testing Failover

```bash
# 1. Verify both regions responding
dig app.yourdomain.com

# 2. Test Delhi
curl http://app.yourdomain.com/
# Note: May route to either region

# 3. Simulate Delhi failure
# (Stop Delhi frontend LB or VMs in E2E console)

# 4. Wait 1.5-3 minutes for health checks to fail (3 checks × 30 seconds)

# 5. Test again
curl http://app.yourdomain.com/
# Should now only route to Chennai

# 6. Check Route 53 health check status
# Route 53 → Health checks → three-tier-delhi-health
# Status should show "Unhealthy"

# 7. Restore Delhi and verify it becomes healthy again
```

---

## Database High Availability

### PostgreSQL Streaming Replication

E2E Networks DBaaS provides managed PostgreSQL with replication capabilities.

### Replication Configuration

**Delhi Primary Database (delhi/dbaas-primary.tf):**

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

**Chennai Replica Database (chennai/dbaas-replica.tf):**

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

### Monitoring Replication

```bash
# Check replication status on primary
psql -h <delhi-db-ip> -U dbadmin -d branding_db -c "SELECT * FROM pg_stat_replication;"

# Check replication lag on replica
psql -h <chennai-db-ip> -U dbadmin -d branding_db -c "SELECT
  now() - pg_last_xact_replay_timestamp() AS replication_lag;"
```

**Healthy replication lag:** < 1 second
**Warning:** 1-10 seconds
**Critical:** > 10 seconds

### Manual Failover (Database Promotion)

If Delhi database fails and you need to promote Chennai to primary:

```bash
# Use the provided script
cd terraform/scripts
./promote-chennai-db.sh

# Or manually via E2E API/Console:
# 1. Promote Chennai replica to standalone primary
# 2. Update application DATABASE_URL to point to Chennai
# 3. Restart backend services
```

### Restoring Delhi After Failover

```bash
# Use the provided script
cd terraform/scripts
./restore-delhi-primary.sh

# This will:
# 1. Create new Delhi database
# 2. Configure it as replica of Chennai (now primary)
# 3. Wait for sync
# 4. Optionally promote Delhi back to primary
```

---

## Monitoring Setup

### UptimeRobot Configuration

See [monitoring/README.md](monitoring/README.md) for detailed UptimeRobot setup.

**Quick Setup:**

```bash
cd terraform/monitoring

# Copy example config
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars

# Deploy monitoring
terraform init
terraform apply
```

### Application Health Endpoints

Your application should expose health check endpoints:

**Frontend Health (`/health/`):**

```javascript
// Example response
{
  "status": "healthy",
  "service": "frontend",
  "region": "delhi",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Backend Health (`/health`):**

```javascript
// Example response
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

**Monitoring Checklist:**
- [ ] Check UptimeRobot dashboard for alerts
- [ ] Verify database replication lag < 1 second
- [ ] Review autoscaling metrics (CPU, memory)
- [ ] Check application logs for errors
- [ ] Verify health check status (Route 53)

### Scaling Operations

**Manual Scaling:**

```bash
# Edit terraform.tfvars
autoscaling_min = 2  # Increase minimum instances
autoscaling_max = 10 # Increase maximum instances

# Apply changes
cd terraform/delhi
terraform apply -var-file="../terraform.tfvars"

cd ../chennai
terraform apply -var-file="../terraform.tfvars"
```

**Autoscaling Metrics:**
- Scales up when CPU > 70% for 5 minutes
- Scales down when CPU < 30% for 10 minutes
- Respects min/max instance limits

### Update Application Code

**Rolling Update Procedure:**

```bash
# 1. Update one region at a time
# 2. SSH to each VM in autoscaling group
ssh root@<vm-ip>

# 3. Pull latest code
cd /opt/three-tier-app-claude  # or wherever app is cloned
git pull origin main

# 4. Frontend: Rebuild and restart
cd branding
npm install
npm run build
systemctl reload caddy

# 5. Backend: Restart with PM2
cd ../backend
npm install
pm2 restart all

# 6. Verify health check passes
curl http://localhost/health/

# 7. Repeat for all VMs
# 8. Update other region
```

**For Production:** Use blue-green deployment or canary releases.

### Backup Procedures

**Database Backups:**

E2E Networks DBaaS typically includes automated backups. Verify in E2E console:
- Backup frequency: Daily
- Retention: 7-30 days
- Point-in-time recovery: Available

**Manual Backup:**

```bash
# Create database dump
pg_dump -h <db-ip> -U dbadmin -d branding_db -F c -f backup-$(date +%Y%m%d).dump

# Upload to object storage
# (Use E2E Object Storage or S3-compatible service)
```

---

## Troubleshooting

### Common Issues

#### 1. Frontend LB returns 502 Bad Gateway

**Symptoms:** Frontend LB accessible but returns 502 error

**Causes:**
- Backend LB not responding
- Backend VMs not running
- Incorrect API_URL in frontend configuration

**Solutions:**
```bash
# Check backend LB status
curl http://<backend-lb-ip>:3001/health

# Check backend VMs
ssh root@<backend-vm-ip>
pm2 status
pm2 logs

# Verify frontend API_URL configuration
ssh root@<frontend-vm-ip>
cat /opt/three-tier-app-claude/branding/.env  # or check build config
```

#### 2. Database Connection Errors

**Symptoms:** Backend logs show "connection refused" or "timeout"

**Causes:**
- Database not running
- Incorrect DATABASE_URL
- VPC firewall rules blocking connection
- Database credentials incorrect

**Solutions:**
```bash
# Test database connection
psql -h <db-ip> -U dbadmin -d branding_db -c "SELECT 1;"

# Check DATABASE_URL environment
ssh root@<backend-vm-ip>
pm2 env 0  # Shows environment variables

# Verify VPC allows backend → database
# (Check E2E console VPC security groups)

# Check database status in E2E console
```

#### 3. Autoscaling Not Working

**Symptoms:** Instances not scaling up/down despite CPU metrics

**Causes:**
- Autoscaling group misconfigured
- Metrics not reporting
- Instance limits reached

**Solutions:**
```bash
# Check autoscaling group in E2E console
# Verify:
# - Min/max instances correct
# - Scaling policies active
# - Health checks passing

# Check instance count
terraform state show e2e_autoscaling_group.frontend

# Review autoscaling events
# (E2E console → Autoscaling → Events)
```

#### 4. Replication Lag High

**Symptoms:** Chennai database significantly behind Delhi (> 10 seconds)

**Causes:**
- Network latency between regions
- High write volume on primary
- Replica under-resourced

**Solutions:**
```bash
# Check replication status
psql -h <chennai-db-ip> -U dbadmin -d branding_db -c "
  SELECT now() - pg_last_xact_replay_timestamp() AS lag;"

# Reduce write load:
# - Add caching layer (Redis)
# - Batch writes
# - Optimize queries

# Upgrade database plan if needed
# Edit terraform.tfvars:
db_plan = "DBS.16GB"  # Upgrade from DBS.8GB
```

#### 5. Health Checks Failing

**Symptoms:** Route 53 marks region unhealthy despite services running

**Causes:**
- Health endpoint not implemented
- Firewall blocking health check traffic
- Health endpoint returns wrong status code

**Solutions:**
```bash
# Test health endpoint locally
curl -v http://<lb-ip>/health/

# Expected response:
# HTTP/1.1 200 OK
# {"status": "healthy", ...}

# Ensure health endpoint is publicly accessible
# (E2E LB security groups allow HTTP from 0.0.0.0/0)

# Check Route 53 health check configuration
# - Correct IP address
# - Correct path (/health/)
# - Correct protocol (HTTP)
```

### Emergency Procedures

#### Complete Regional Failure

**If Delhi Region Fails:**

1. Verify Chennai is healthy: `curl http://app.yourdomain.com/`
2. DNS should automatically route to Chennai (~1.5 min)
3. Monitor traffic and errors
4. Investigate Delhi failure cause
5. Fix and restore Delhi when ready

**If Chennai Region Fails:**

1. Verify Delhi is healthy: `curl http://app.yourdomain.com/`
2. DNS should automatically route to Delhi
3. Chennai replica will catch up when restored
4. Fix and restore Chennai when ready

#### Database Promotion (Disaster Recovery)

**If Delhi database is permanently lost:**

```bash
# 1. Promote Chennai to primary
cd terraform/scripts
./promote-chennai-db.sh

# 2. Update DNS to point only to Chennai (temporarily)
# Remove Delhi A record from Route 53

# 3. Rebuild Delhi as replica of Chennai
cd terraform/delhi
terraform destroy -target=e2e_dbaas_postgresql.primary
terraform apply -var="replica_of=<chennai-db-id>"

# 4. Wait for sync, then re-promote Delhi if desired
./restore-delhi-primary.sh
```

---

## Cost Estimation

### Monthly Cost Breakdown (Estimated)

Based on E2E Networks pricing (subject to change):

**Delhi Region:**
| Resource | Specification | Quantity | Monthly Cost (₹) |
|----------|--------------|----------|------------------|
| Frontend VMs | C3.8GB | 1-5 instances | ₹2,000 - ₹10,000 |
| Backend VMs | C3.8GB | 1-5 instances | ₹2,000 - ₹10,000 |
| Frontend LB | E2E-LB-2 | 1 | ₹2,000 |
| Backend LB | E2E-LB-2 | 1 | ₹2,000 |
| PostgreSQL | DBS.8GB | 1 | ₹5,000 |
| Network Egress | Per GB | ~100 GB | ₹500 |
| **Delhi Subtotal** | | | **₹13,500 - ₹29,500** |

**Chennai Region:**
| Resource | Specification | Quantity | Monthly Cost (₹) |
|----------|--------------|----------|------------------|
| Frontend VMs | C3.8GB | 1-5 instances | ₹2,000 - ₹10,000 |
| Backend VMs | C3.8GB | 1-5 instances | ₹2,000 - ₹10,000 |
| Frontend LB | E2E-LB-2 | 1 | ₹2,000 |
| Backend LB | E2E-LB-2 | 1 | ₹2,000 |
| PostgreSQL Replica | DBS.8GB | 1 | ₹5,000 |
| Network Egress | Per GB | ~100 GB | ₹500 |
| **Chennai Subtotal** | | | **₹13,500 - ₹29,500** |

**Additional Services:**
| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| Route 53 DNS | AWS | $0.50 + $1/health check = **$3.50** (~₹300) |
| UptimeRobot | Free/Paid | **₹0 - ₹2,000** |
| Domain Name | Registrar | **₹800 - ₹1,500** |

**Total Estimated Monthly Cost:**
- **Minimum (1 instance each tier):** ₹27,000 - ₹35,000 (~$325 - $420)
- **Maximum (5 instances each tier):** ₹59,000 - ₹65,000 (~$710 - $780)
- **Typical Production (2-3 avg instances):** ₹40,000 - ₹50,000 (~$480 - $600)

**Cost Optimization Tips:**
1. Use auto-scaling to minimize idle instances
2. Use reserved instances for base capacity (if E2E offers)
3. Implement caching to reduce database load
4. Monitor and right-size instances based on actual usage
5. Use E2E Object Storage for static assets (cheaper than compute egress)

---

## Next Steps

After completing deployment:

1. **Configure monitoring alerts** (UptimeRobot, email, Slack)
2. **Set up CI/CD pipeline** for automated deployments
3. **Implement application monitoring** (APM tools)
4. **Document runbooks** for common operational tasks
5. **Conduct disaster recovery drills**
6. **Optimize costs** based on actual usage patterns
7. **Implement enhanced security** (WAF, DDoS protection)
8. **Set up log aggregation** (ELK stack or similar)

---

## Additional Resources

- [E2E Networks Documentation](https://docs.e2enetworks.com)
- [E2E Terraform Provider](https://registry.terraform.io/providers/e2eterraformprovider/e2e/latest/docs)
- [PostgreSQL Replication Documentation](https://www.postgresql.org/docs/current/high-availability.html)
- [AWS Route 53 Health Checks](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

## Support

For issues related to:
- **E2E Networks platform:** support@e2enetworks.com
- **This repository:** [GitHub Issues](https://github.com/indykish/three-tier-app-claude/issues)
- **Terraform E2E provider:** [Provider Issues](https://github.com/e2eterraformprovider/terraform-provider-e2e/issues)

---

**Document Version:** 1.0
**Last Updated:** 2024-01-15
**Maintained by:** indykish
