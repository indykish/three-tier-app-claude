<div align="center">

<img src="https://e2enetworks.com/OnlyE2E.svg" alt="E2E Networks" width="180">

# 🚀 Three-Tier Application on E2E Networks

### **A Production-Ready Multi-Region Deployment Example**

[![E2E Cloud Console](https://img.shields.io/badge/E2E-Cloud_Console-blue?style=for-the-badge)](https://myaccount.e2enetworks.com)
[![Documentation](https://img.shields.io/badge/E2E-Documentation-green?style=for-the-badge)](https://docs.e2enetworks.com)
[![Terraform Provider](https://img.shields.io/badge/Terraform-E2E_Provider-purple?style=for-the-badge)](https://registry.terraform.io/providers/e2eterraformprovider/e2e/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## What Is This?

A complete proof of concept demonstrating how to build and deploy a highly-available three-tier application on E2E Networks Cloud with infrastructure-as-code.

**Key Features:**
- **React Frontend** - Material-UI theme management system
- **Express.js API** - REST endpoints for CRUD operations
- **PostgreSQL Database** - JSONB storage with cross-region replication
- **Multi-Region** - Active/active deployment across Delhi and Chennai
- **Auto Failover** - Health-checked DNS routing for high availability
- **Infrastructure as Code** - Complete Terraform configurations

**E2E Networks Platform:**
Cloud infrastructure provider with data centers across India (Delhi, Mumbai, Chennai) offering VPC isolation, managed databases, load balancing, and native Terraform support.

- [Cloud Console](https://myaccount.e2enetworks.com)
- [Documentation](https://docs.e2enetworks.com)
- [Terraform Provider](https://registry.terraform.io/providers/e2eterraformprovider/e2e/latest)

---

## Table of Contents

- [Quick Start - Local Development](#quick-start---local-development)
- [Application Architecture](#application-architecture)
- [Production Deployment](#production-deployment)
- [Project Structure](#project-structure)
- [Advanced Documentation](#advanced-documentation)

---

## Quick Start - Local Development

Get the application running locally in under 5 minutes.

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- npm or yarn

### Setup Instructions

**1. Clone and Install**
```bash
git clone https://github.com/indykish/three-tier-app-claude.git
cd three-tier-app-claude

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

**2. Configure Database**
```bash
# Create database
createdb appdb

# Or using psql
psql -c "CREATE DATABASE appdb;"
```

**3. Configure Environment**
```bash
cd backend
cp .env.example .env

# Edit .env with your database connection:
# DATABASE_URL=postgresql://user:password@localhost:5432/appdb
# PORT=3001
# NODE_ENV=development
# CORS_ORIGINS=http://localhost:5173
```

Optional frontend configuration (`.env` in `/frontend`):
```bash
# VITE_API_URL=http://localhost:3001
# (Frontend defaults to /api/v1 which proxies through Vite dev server)
```

**4. Initialize Database**
```bash
cd backend
npm run db:init
```

**5. Start Application**

Open two terminal windows:

```bash
# Terminal 1 - Backend (http://localhost:3001)
cd backend
npm run dev

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm run dev
```

**6. Access Application**

Visit http://localhost:5173 in your browser.

### Development Commands

**Backend:**
```bash
npm run dev          # Development with hot reload
npm run build        # Build TypeScript
npm start            # Run production build
```

**Frontend:**
```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm test             # Run tests
npm run test:coverage # Coverage report
```

---

## Application Architecture

### Local Development

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │     │   Express API   │     │   PostgreSQL    │
│   (Port 5173)   │ ──► │   (Port 3001)   │ ──► │   Database      │
│   /frontend     │     │   /backend      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Production Multi-Region

Active/active deployment across two regions with automatic failover:

- **2 Regions:** Delhi (primary) and Chennai (secondary)
- **Frontend:** React app served by Caddy with auto-HTTPS
- **Backend:** Node.js/Express API with load balancing
- **Database:** PostgreSQL with streaming replication
- **DNS:** Route 53 weighted routing with health checks
- **Monitoring:** UptimeRobot for uptime tracking

**Learn More:**
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Deep dive into multi-region design, component choices, and scaling strategy
- [OPERATIONS.md](./docs/OPERATIONS.md) - Failover procedures, disaster recovery drills, and troubleshooting guides

---

## Production Deployment

Deploy the application to E2E Networks Cloud with multi-region high availability.

### Prerequisites

- **E2E Networks Account** - [Sign up here](https://myaccount.e2enetworks.com)
- **Terraform 1.0+** - [Installation guide](https://developer.hashicorp.com/terraform/install)
- **SSH Key** - Created in E2E Console for VM access
- **Domain Name** - For production DNS (optional for testing)
- **AWS Account** - For Route 53 DNS (or alternative DNS provider)

### Architecture Overview

This deployment creates:
- **2 Regions:** Delhi (primary) and Chennai (secondary)
- **6 VMs per region:** Frontend and backend nodes with load balancers
- **2 Databases:** Primary in Delhi, streaming replica in Chennai
- **Auto-scaling:** Can scale from 1 to 5 nodes per tier per region
- **Monitoring:** UptimeRobot health checks with alerts

**Estimated Cost:** ~₹30,000/month (~$360/month) for both regions

---

### Deployment Steps

#### Step 1: Configure Credentials

```bash
cd terraform

# Set E2E Networks credentials (required)
export TF_VAR_e2e_api_key="your-api-key-here"
export TF_VAR_e2e_auth_token="your-auth-token-here"
export TF_VAR_project_id="your-project-id"
```

**Where to find credentials:**
- E2E Console → API Management → Generate API Key

#### Step 2: Edit Configuration

Edit `terraform/terraform.tfvars`:

```hcl
# Required: Update these values
ssh_key_name     = "YourSSHKeyName"      # SSH key from E2E Console
db_password      = "YourSecurePass123!"  # Strong database password
github_repo_url  = "https://github.com/yourusername/three-tier-app.git"

# Optional: Defaults are provided
image_name       = "Ubuntu-24.04"
vm_plan          = "C3.8GB"              # 4 vCPU, 8GB RAM
db_plan          = "DBS.8GB"             # Database size
frontend_port    = 80
backend_port     = 3001
autoscaling_min  = 1
autoscaling_max  = 5
```

**Note:** Region-specific settings (VPC CIDR, etc.) are pre-configured in `terraform/{region}/variables.tf` - no changes needed.

#### Step 3: Deploy Delhi Region (Primary)

```bash
cd terraform/delhi

# Initialize Terraform
terraform init

# Preview changes
terraform plan -var-file="../terraform.tfvars"

# Deploy infrastructure (takes 10-15 minutes)
terraform apply -var-file="../terraform.tfvars"

# Save outputs
terraform output frontend_lb_public_ip
terraform output backend_lb_private_ip
terraform output db_primary_id
```

**What gets created:**
- VPC (10.10.0.0/16)
- PostgreSQL primary database
- Frontend VM + Load Balancer (public)
- Backend VM + Load Balancer (internal)
- Auto-provisioned with application code

**Verify deployment:**
```bash
# Get frontend IP
DELHI_IP=$(terraform output -raw frontend_lb_public_ip)

# Test frontend
curl http://$DELHI_IP/

# Check logs on VM
ssh root@<vm-ip>
tail -f /var/log/cloud-init-output.log
```

#### Step 4: Deploy Chennai Region (Secondary)

```bash
cd ../chennai

# Initialize and deploy
terraform init
terraform plan -var-file="../terraform.tfvars"
terraform apply -var-file="../terraform.tfvars"

# Save outputs
terraform output frontend_lb_public_ip
```

**What gets created:**
- VPC (10.20.0.0/16)
- PostgreSQL replica (manual replication setup required)
- Frontend VM + Load Balancer
- Backend VM + Load Balancer

**Note:** Database replication must be configured manually through E2E DBaaS console or API after both databases are created.

#### Step 5: Configure DNS with Health Checks

**Using AWS Route 53:**

1. **Create Health Checks**
   ```bash
   # Get load balancer IPs
   cd terraform/delhi
   DELHI_IP=$(terraform output -raw frontend_lb_public_ip)
   cd ../chennai
   CHENNAI_IP=$(terraform output -raw frontend_lb_public_ip)

   # Create in AWS Console:
   # - Name: three-tier-delhi-health
   # - Protocol: HTTP
   # - IP: $DELHI_IP
   # - Path: /health/
   # - Interval: 30 seconds
   # - Failure Threshold: 3

   # Repeat for Chennai
   ```

2. **Create Weighted DNS Records**
   ```bash
   # In Route 53 → Hosted Zones → Your Domain
   # Create two A records:

   # Record 1:
   # Name: app.yourdomain.com
   # Type: A
   # Value: $DELHI_IP
   # Routing: Weighted (50)
   # Health Check: three-tier-delhi-health
   # Set ID: delhi-primary

   # Record 2:
   # Name: app.yourdomain.com
   # Type: A
   # Value: $CHENNAI_IP
   # Routing: Weighted (50)
   # Health Check: three-tier-chennai-health
   # Set ID: chennai-secondary
   ```

**Result:** Traffic splits 50/50 between regions. If one region fails, 100% traffic goes to healthy region automatically.

#### Step 6: Setup Monitoring (Optional)

```bash
# Get UptimeRobot API key from https://uptimerobot.com/dashboard#mySettings
export TF_VAR_uptimerobot_api_key="your-uptimerobot-api-key"
export TF_VAR_delhi_frontend_lb_ip="$DELHI_IP"
export TF_VAR_chennai_frontend_lb_ip="$CHENNAI_IP"

# Optional: Slack notifications
# export TF_VAR_slack_webhook_url="https://hooks.slack.com/services/YOUR/WEBHOOK"

cd terraform/monitoring
terraform init
terraform plan
terraform apply

# Get status page URL
terraform output status_page_url
```

**What gets created:**
- HTTP monitors for both regions (5-minute intervals)
- Webhook integration for failover alerts
- Public status page

---

### Validation and Testing

**Test Health Endpoints:**
```bash
# Test Delhi
curl http://$DELHI_IP/health/

# Test Chennai
curl http://$CHENNAI_IP/health/

# Test DNS (should alternate between regions)
for i in {1..10}; do
  curl -s http://app.yourdomain.com/health/ | grep region
  sleep 2
done
```

**Test Failover:**
```bash
# Stop Delhi frontend
ssh root@<delhi-frontend-vm-ip>
systemctl stop caddy

# Wait 90 seconds for health checks
# Traffic should automatically route to Chennai

# Verify
curl http://app.yourdomain.com/health/
# Should only return Chennai responses

# Restore
systemctl start caddy
```

---

### Cleanup

```bash
# Destroy Chennai
cd terraform/chennai
terraform destroy -var-file="../terraform.tfvars"

# Destroy Delhi
cd ../delhi
terraform destroy -var-file="../terraform.tfvars"

# Destroy Monitoring
cd ../monitoring
terraform destroy
```

---

## Project Structure

```
three-tier-app-claude/
├── README.md                    # This file
├── docs/
│   ├── ARCHITECTURE.md          # Multi-region design details
│   └── OPERATIONS.md            # Failover procedures & troubleshooting
├── backend/                     # Express.js API
│   ├── src/
│   │   ├── index.ts            # Main server
│   │   ├── db.ts               # Database connection
│   │   ├── routes/
│   │   │   └── themes.ts       # Theme CRUD routes
│   │   └── scripts/
│   │       └── initDb.ts       # Database initialization
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/                    # React application
│   ├── src/
│   │   ├── App.tsx             # Main component
│   │   ├── services/
│   │   │   └── themeApi.ts     # API client
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   ├── package.json
│   └── vite.config.ts
└── terraform/                   # Infrastructure as Code
    ├── terraform.tfvars         # Shared configuration
    ├── delhi/                   # Primary region
    │   ├── main.tf
    │   ├── vpc.tf
    │   ├── database.tf
    │   ├── frontend.tf
    │   ├── backend.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── chennai/                 # Secondary region (same structure)
    ├── monitoring/              # UptimeRobot setup
    └── scripts/
        ├── setup-frontend.sh    # Frontend VM provisioning
        ├── setup-backend.sh     # Backend VM provisioning
        └── promote-chennai-db.sh # Database failover
```

---

## Advanced Documentation

**Architecture & Design:**
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Multi-region design rationale, component choices, cost analysis, scaling roadmap

**Operations & Troubleshooting:**
- [OPERATIONS.md](./docs/OPERATIONS.md) - Failover procedures, disaster recovery drills, runbooks, monitoring checklists

**Frontend Details:**
- [frontend/README.md](./frontend/README.md) - React branding system, testing guide, database integration

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with ❤️ using E2E Networks Cloud**

[E2E Console](https://myaccount.e2enetworks.com) • [Documentation](https://docs.e2enetworks.com) • [Terraform Provider](https://registry.terraform.io/providers/e2eterraformprovider/e2e/latest)

</div>