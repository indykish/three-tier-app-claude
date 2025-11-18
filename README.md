<div align="center">

<img src="https://e2enetworks.com/OnlyE2E.svg" alt="E2E Networks" width="180">

# 🚀 Three-Tier Application on E2E Networks

### **A Proof of Concept Demonstrating Modern Cloud Architecture**

[![E2E Cloud Console](https://img.shields.io/badge/E2E-Cloud_Console-blue?style=for-the-badge)](https://myaccount.e2enetworks.com)
[![Documentation](https://img.shields.io/badge/E2E-Documentation-green?style=for-the-badge)](https://docs.e2enetworks.com)
[![Terraform Provider](https://img.shields.io/badge/Terraform-E2E_Provider-purple?style=for-the-badge)](https://registry.terraform.io/providers/e2eterraformprovider/e2e/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## What Is This?

A production-ready proof of concept demonstrating how to architect, deploy, and manage a highly-available three-tier application stack on E2E Networks Cloud using infrastructure-as-code principles.

### Key Features:

- **Frontend Tier** - React application with Material-UI demonstrating dynamic branding of themes
- **API Tier** - Express.js REST API handling business logic and data operations
- **Database Tier** - PostgreSQL with JSONB storage and cross-region replication
- **Multi-Region Deployment** - Active/active architecture across Delhi and Chennai regions
- **Automatic Failover** - Health-checked DNS routing with disaster recovery
- **Infrastructure as Code** - Complete Terraform configurations for reproducible deployments

### E2E Networks Platform

This project uses E2E Networks, a cloud platform with data centers across India (Delhi, Mumbai, Chennai) offering VPC isolation, managed databases, load balancing, and native Terraform support.

**Getting Started:**
- [Cloud Console](https://myaccount.e2enetworks.com)
- [Documentation](https://docs.e2enetworks.com)
- [E2E Terraform Provider](https://registry.terraform.io/providers/e2eterraformprovider/e2e/latest)

---

## Table of Contents

- [Application Overview](#application-overview)
- [Production Deployment Guide](#production-deployment-guide)
  - [Building a Highly Available Multi-Region Application](#building-a-highly-available-multi-region-application-on-e2e-networks)
  - [Executive Summary](#executive-summary)
  - [Why Multi-Region?](#why-multi-region)
  - [Multi-Region Architecture Deep Dive](#multi-region-architecture-deep-dive)
  - [Infrastructure Components](#infrastructure-components)
  - [Step-by-Step Deployment](#step-by-step-deployment)
- [Local Development Setup](#local-development-setup)
  - [Prerequisites](#prerequisites)
  - [Quick Start](#quick-start)
  - [Development](#development)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Features](#features)
- [License](#license)

---

## Application Overview

A complete three-tier application featuring a React frontend, Express.js backend API, and PostgreSQL database for managing branding themes.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │     │   Express API   │     │   PostgreSQL    │
│   (Port 5173)   │ ──► │   (Port 3001)   │ ──► │   Database      │
│   /branding     │     │   /backend      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend**: React 19 + Material-UI branding wizard and dashboard
- **Backend**: Express.js REST API for theme CRUD operations
- **Database**: PostgreSQL with JSONB storage for theme data

---

# Production Deployment Guide

## Building a Highly Available Multi-Region Application on E2E Networks

*A comprehensive guide to deploying a production-grade three-tier application across Delhi and Chennai regions with automatic failover, database replication, and infrastructure-as-code.*

---

## Executive Summary

Application downtime directly impacts revenue and customer trust. A single-region deployment remains vulnerable to regional outages, infrastructure failures, or natural disasters. This guide demonstrates how to architect and deploy a highly available three-tier application across two geographic regions using E2E Networks and Terraform, achieving active/active operations with automatic failover.

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
- AWS Route 53 (DNS with Health Checks) or alternate

**Prerequisites for Production Deployment:**
- E2E Networks account with API credentials
- Node.js 18+
- PostgreSQL 13+ (managed via E2E DBaaS)
- Terraform 1.0+
- SSH key pair for VM access
- AWS account for Route 53 DNS or alternate
- Domain name for public access

---

## Why Multi-Region?

### The Business Case

Application downtime creates a single point of failure. Regional outages occur due to:
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

## Multi-Region Architecture Deep Dive

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

1. **User Request** → DNS resolves to nearest healthy region
2. **Frontend LB** → Distributes to autoscaled Caddy instances
3. **Caddy** → Serves static React app, proxies API calls
4. **Backend LB** → Distributes to autoscaled Node.js instances
5. **Node.js API** → Processes request, queries database via PgPool
6. **PgPool-II?** → (*/?) is marked here to reason out its purpose: Routes reads locally, writes to primary
7. **PostgreSQL** → Processes queries, replicates data

---

## Infrastructure Components

### E2E Networks Resources

| Component | Type | Specification | Purpose |
|-----------|------|---------------|---------|
| **VPC** | e2e_vpc | 10.10.0.0/16 (Delhi), 10.20.0.0/16 (Chennai) | Network isolation |
| **Frontend VMs** | e2e_autoscaling | C3.8GB (4 vCPU, 8GB RAM, 100GB SSD) | React + Caddy servers |
| **Backend VMs** | e2e_autoscaling | C3.8GB (4 vCPU, 8GB RAM, 100GB SSD) | Node.js Express API |
| **Frontend LB** | e2e_loadbalancer | E2E-LB-2 External, HTTP mode | Public traffic entry |
| **Backend LB** | e2e_loadbalancer | E2E-LB-2 Internal, HTTP mode | API load distribution |
| **Database** | e2e_dbaas_postgresql | DBS.16GB | Managed PostgreSQL |
| **PgPool VM */?** | e2e_node | C3.8GB | Database proxy |

### Why These Choices?

**Caddy over Nginx:**
- Automatic HTTPS with Let's Encrypt
- Simpler configuration (Caddyfile vs nginx.conf)
- Built-in reverse proxy capabilities
- Zero-downtime reloads

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

**PgPool-II(*)?:**
- Connection pooling reduces DB load
- Automatic read/write splitting
- Health monitoring built-in
- Failover detection

---

## Step-by-Step Deployment

### Phase 1: Configure Variables

```bash
# Clone repository
git clone https://github.com/indykish/three-tier-app-claude.git
cd three-tier-app-claude/terraform
```

**Set up E2E Networks credentials using environment variables:**

The terraform configuration is designed to pull E2E Networks credentials from environment variables for security. Set these variables before running terraform:

```bash
# Export E2E Networks credentials (if not already set)
export E2E_API_KEY="your-api-key-here"
export E2E_AUTH_TOKEN="your-auth-token-here"
export E2E_PROJECT_ID="your-project-id"

# Map to Terraform variables
export TF_VAR_e2e_api_key="${E2E_API_KEY}"
export TF_VAR_e2e_auth_token="${E2E_AUTH_TOKEN}"
export TF_VAR_project_id="${E2E_PROJECT_ID}"
```

**For persistent configuration**, add these to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
# E2E Networks Credentials
export E2E_API_KEY="your-api-key-here"
export E2E_AUTH_TOKEN="your-auth-token-here"
export E2E_PROJECT_ID="your-project-id"

# Terraform variable mappings
export TF_VAR_e2e_api_key="${E2E_API_KEY}"
export TF_VAR_e2e_auth_token="${E2E_AUTH_TOKEN}"
export TF_VAR_project_id="${E2E_PROJECT_ID}"
```

Then reload your shell profile:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

**Edit `terraform/terraform.tfvars`** for other configuration values:

The `terraform.tfvars` file is already present with sensible defaults. Update the following values as needed:

```hcl
# SSH Access (must exist in your E2E Networks account)
ssh_key_name = "KishoreMac"  # Update to your SSH key name

# Database Configuration
db_password = "YourSecureP@ssw0rd!"  # Update to a secure password

# VM and Database plans (adjust based on your needs)
vm_plan    = "C3.8GB"  # 4 vCPU, 8GB RAM, 100GB disk
db_plan    = "DBS.8GB"

# Other settings have sensible defaults and can be left as-is
```

**Note:** Credentials are pulled from environment variables and should NEVER be committed to version control. The `terraform.tfvars` file can be safely committed as it doesn't contain sensitive credentials.

### Phase 2: Validate Terraform Configurations (Dry-Run)

Before deploying any infrastructure, validate all Terraform configurations to catch syntax errors and provider schema mismatches:

```bash
# Validate Delhi configuration
cd delhi
terraform init
terraform validate
terraform fmt -check  # Check formatting consistency

# Validate Chennai configuration
cd ../chennai
terraform init
terraform validate
terraform fmt -check

# Validate Monitoring configuration (optional)
cd ../monitoring
terraform init
terraform validate
terraform fmt -check
```

**Expected Output:**
```
Success! The configuration is valid.
```

**Preview Changes (Plan):**
```bash
# See what will be created without actually deploying
cd ../delhi
terraform plan -var-file="../terraform.tfvars"

# This shows:
# - Resources to be created
# - Resource dependencies
# - Estimated execution time
```

This dry-run step is critical to catch issues like:
- Invalid provider attributes
- Missing required variables
- Incorrect resource references
- Type mismatches

### Phase 3: Understanding the Setup Scripts

The Terraform configuration uses `start_script` to automatically provision VMs on first boot. These scripts are located in `terraform/scripts/`:

**`setup-frontend.sh`** - Frontend VM provisioning:
```bash
#!/bin/bash
# Executed automatically when frontend VM boots
# 1. Updates system packages
# 2. Installs Node.js 18.x LTS
# 3. Installs Caddy web server
# 4. Clones the application repository
# 5. Builds the React frontend
# 6. Configures Caddy as reverse proxy
# 7. Starts frontend service
```

**`setup-backend.sh`** - Backend VM provisioning:
```bash
#!/bin/bash
# Executed automatically when backend VM boots
# 1. Updates system packages
# 2. Installs Node.js 18.x LTS
# 3. Installs PM2 process manager
# 4. Clones the application repository
# 5. Installs backend dependencies
# 6. Configures environment variables
# 7. Starts Express API with PM2
```

**Customization Required:**

Before deployment, modify these scripts to match your environment:

```bash
# Edit terraform/scripts/setup-frontend.sh
- Update GIT_REPO to your repository URL
- Configure API_URL to point to your backend load balancer
- Adjust Caddy configuration for your domain

# Edit terraform/scripts/setup-backend.sh
- Update GIT_REPO to your repository URL
- Set DATABASE_URL to use PgPool or direct connection
- Configure environment-specific variables
```

**Important Notes:**
- Scripts run as root during VM initialization
- Logs are available in `/var/log/cloud-init-output.log`
- Scripts must be idempotent (safe to run multiple times)
- VM won't be "ready" until scripts complete successfully

### Phase 4: Deploy Delhi Region (Primary)

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
3. **Frontend Node** - VM running Caddy + React (auto-provisioned via start_script)
4. **Backend Node** - VM running Express API (auto-provisioned via start_script)
5. **Frontend Load Balancer** - External, public-facing
6. **Backend Load Balancer** - Internal, for API routing

*Note: For production auto-scaling, consider using e2e_scaler_group with custom pre-built images.*

**Save Critical Outputs:**

```bash
# Capture outputs for Chennai deployment
terraform output -json > ../delhi-outputs.json

# Key values to note:
terraform output frontend_lb_public_ip    # Your Delhi endpoint
terraform output db_primary_private_ip    # For Chennai replica
terraform output db_primary_id            # For Chennai replica setup
```

### Phase 5: Deploy Chennai Region (Secondary)

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
2. **PostgreSQL Replica** - Streams from Delhi primary (manual setup required)
3. **Frontend Node** - VM running Caddy + React (auto-provisioned via start_script)
4. **Backend Node** - VM running Express API (auto-provisioned via start_script)
5. **Load Balancers** - Regional entry points

### Phase 6: Configure DNS with Health Checks

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

### Phase 7: Conducting Failover Drills

**Testing Automatic Failover:**

```bash
# 1. Verify both regions are healthy
curl http://app.yourdomain.com/health/
# Should alternate between Delhi and Chennai

# 2. Check Route 53 health check status
# Both should show "Healthy" in AWS Console

# 3. Simulate Delhi region failure
# Option A: Stop Delhi frontend LB in E2E Console
# Option B: Block traffic to health endpoint temporarily
# Option C: SSH to Delhi VMs and stop services:
ssh root@<delhi-frontend-vm-ip>
systemctl stop caddy

# 4. Monitor health check transition
# Route 53 → Health checks → three-tier-delhi-health
# Wait ~1.5-3 minutes (3 checks × 30 seconds)
# Status should change from "Healthy" → "Unhealthy"

# 5. Test application still responds
curl http://app.yourdomain.com/health/
# Should now ONLY return Chennai responses

# 6. Verify DNS routing
dig app.yourdomain.com
# Should return only Chennai IP

# 7. Monitor application metrics
# - Check error rates
# - Verify latency
# - Confirm all traffic to Chennai

# 8. Restore Delhi
ssh root@<delhi-frontend-vm-ip>
systemctl start caddy

# 9. Verify Delhi becomes healthy again
# Route 53 health check should recover
# Traffic should resume 50/50 distribution

# 10. Document results
# - Time to detect failure
# - Time to reroute traffic
# - Any errors during failover
# - Total downtime experienced
```

**Database Failover Drill:**

```bash
# 1. Verify database replication status
psql -h <chennai-db-ip> -U dbadmin -d branding_db -c "
  SELECT now() - pg_last_xact_replay_timestamp() AS lag;"
# Lag should be < 1 second

# 2. Simulate Delhi database failure
# (In E2E Console: Stop Delhi database instance)

# 3. Promote Chennai replica to primary
cd terraform/scripts
./promote-chennai-db.sh

# 4. Verify Chennai is now accepting writes
psql -h <chennai-db-ip> -U dbadmin -d branding_db -c "
  SELECT pg_is_in_recovery();"
# Should return 'f' (false) indicating it's now primary

# 5. Update backend configuration (if needed)
# If using direct DB connections instead of PgPool
ssh root@<backend-vm-ip>
# Update DATABASE_URL to Chennai DB
pm2 restart all

# 6. Test write operations
curl -X POST http://app.yourdomain.com/api/v1/themes \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Theme", ...}'

# 7. Restore Delhi as replica
./restore-delhi-primary.sh

# 8. Document recovery time objective (RTO) and recovery point objective (RPO)
```

**Full Disaster Recovery Drill:**

```bash
# Scenario: Entire Delhi region is lost
# Timeline: Document each step

# T+0:00 - Delhi region fails
# [Simulate by destroying Delhi infrastructure]

# T+0:30 - First health check fails

# T+1:30 - Route 53 marks Delhi unhealthy (after 3 failures)
# T+1:30 - Traffic automatically routes to Chennai

# T+5:00 - UptimeRobot detects failure, sends webhook

# T+5:01 - Automated promotion of Chennai database
./promote-chennai-db.sh

# T+5:15 - Chennai DB fully promoted

# T+10:00 - Rebuild Delhi infrastructure
cd terraform/delhi
terraform destroy  # Clean up failed resources
terraform apply -var-file="../terraform.tfvars"

# T+25:00 - Delhi infrastructure online
# T+25:00 - Configure Delhi DB as replica of Chennai

# T+30:00 - Delhi catches up with replication

# T+30:00 - Re-enable Delhi in Route 53
# T+30:00 - Traffic resumes 50/50 distribution

# T+35:00 - Optionally promote Delhi back to primary
# (After verifying stability)

# Total recovery time: ~30-35 minutes
# Data loss: 0 (assuming replication was up to date)
```

**Monitoring During Drills:**

- **Application Metrics:**
  - Error rate (should spike briefly, then normalize)
  - Request latency (may increase temporarily)
  - Throughput (should remain steady)

- **Database Metrics:**
  - Replication lag (before failure)
  - Promotion time
  - Write performance after promotion

- **Infrastructure Metrics:**
  - Health check status transitions
  - DNS query responses
  - Load balancer active connections

**Post-Drill Review:**

1. **What worked well?**
   - Which automation worked as expected?
   - What manual steps were smooth?

2. **What needs improvement?**
   - Unexpected errors or delays
   - Missing automation
   - Documentation gaps

3. **Update runbooks:**
   - Document actual timings vs. expected
   - Add any missing steps discovered
   - Update emergency contact procedures

4. **Schedule next drill:**
   - Recommended: Quarterly drills
   - Vary scenarios each time

---

# Local Development Setup

This section covers setting up the application for local development on your machine.

## Prerequisites

- Node.js 22+
- PostgreSQL 16+
- npm or yarn

## Quick Start

### 1. Set Up Database

Create a PostgreSQL database:

```bash
createdb appdb
```

Or using psql:

```sql
CREATE DATABASE appdb;
```

### 2. Configure Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database connection
# DATABASE_URL=postgresql://user:password@localhost:5432/appdb
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../branding
npm install
```

### 4. Initialize Database

```bash
cd backend
npm run db:init
```

This creates the `themes` table and seeds it with sample data.

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd branding
npm run dev
```

The frontend will start on http://localhost:5173

---

## Development

### Backend Development

```bash
cd backend
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Run production build
```

### Frontend Development

```bash
cd branding
npm run dev          # Start Vite dev server
npm run build        # Production build
npm test             # Run tests
npm run test:coverage # Coverage report
```

---

## API Endpoints

### Themes API (`/api/v1/themes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/themes` | Get all themes |
| GET | `/api/v1/themes/:id` | Get a single theme |
| POST | `/api/v1/themes` | Create a new theme |
| PUT | `/api/v1/themes/:id` | Update a theme |
| DELETE | `/api/v1/themes/:id` | Delete a theme |

### Example Theme JSON

```json
{
  "id": 1,
  "name": "Default Theme",
  "companyName": "Demo Company",
  "companyUrl": "https://demo.example.com",
  "theme": {
    "theme_color": "#1976d2",
    "primary_dark_color": "#1565c0",
    "extra_light_color": "#bbdefb",
    "text_color": "#000000",
    "font_family": "Roboto, Arial, sans-serif",
    "button": {
      "primary_color": "#1976d2",
      "secondary_color": "#9c27b0",
      "hover_color": "#1565c0",
      "border_color": "#cccccc"
    },
    "logos": {}
  },
  "capabilities": {
    "general_app_title": "My Bank"
  }
}
```

---

## Database Schema

```sql
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  json_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Environment Variables

### Backend (.env)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/appdb
PORT=3001
```

### Frontend (optional)

Create a `.env` file in `/branding`:

```bash
VITE_API_URL=http://localhost:3001
```

---

## Project Structure

```
three-tier-app-claude/
├── README.md                 # This file
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── index.ts         # Main server entry
│   │   ├── db.ts            # Database connection
│   │   ├── routes/
│   │   │   └── themes.ts    # Theme CRUD routes
│   │   └── scripts/
│   │       └── initDb.ts    # Database initialization
│   ├── package.json
│   └── tsconfig.json
├── branding/                 # React frontend
│   ├── src/
│   │   ├── App.tsx          # Main app with API integration
│   │   ├── services/
│   │   │   ├── themeApi.ts  # API client for themes
│   │   │   └── brandingStorage.ts
│   │   ├── context/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
└── terraform/                # Infrastructure as Code
    ├── delhi/               # Primary region configs
    ├── chennai/             # Secondary region configs
    ├── global/              # Shared configurations
    ├── monitoring/          # UptimeRobot setup
    ├── scripts/             # Setup & operational scripts
    └── terraform.tfvars.example
```

---

## Features

- **Theme Management**: Full CRUD operations for branding themes
- **Live Preview**: Real-time theme preview in the React dashboard
- **Fallback Support**: Gracefully falls back to localStorage if API is unavailable
- **CORS Enabled**: Backend configured for cross-origin requests
- **TypeScript**: Full type safety across both frontend and backend
- **Database-Ready**: JSONB storage for flexible theme data
- **Multi-Region Deployment**: Terraform configs for active/active deployments
- **Automatic Failover**: Health-checked DNS with instant traffic redirection

---

## License

MIT
