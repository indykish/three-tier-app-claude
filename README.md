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
- [Production Deployment Guide](#production-deployment-guide) *(overview - see terraform/ directory for full guide)*
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

*Continue reading the full deployment guide below...*

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

*The rest of the production deployment steps (Phase 2-6), database high availability setup, monitoring configuration, operational procedures, cost analysis, and lessons learned continue in the terraform/ directory documentation.*

---

## License

MIT
