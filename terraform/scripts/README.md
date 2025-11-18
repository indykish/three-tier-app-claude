# Terraform Scripts

This directory contains utility scripts for managing the three-tier application infrastructure.

## Configuration Management

All configuration values are centralized in `terraform/terraform.tfvars`. When you run `terraform apply`, Terraform automatically generates a `.env` file in this directory (`terraform/scripts/.env`) that scripts can source.

### How It Works

1. **Single Source of Truth**: All configuration values (DB name, user, password, ports, etc.) are defined in `terraform/terraform.tfvars`

2. **Auto-Generated Environment File**: The `terraform/config-export.tf` file creates `scripts/.env` with exported variables from your tfvars

3. **Script Usage**: Scripts in this directory source the `.env` file to access configuration values

### Example

**Before** (hardcoded values):
```bash
DATABASE_URL=postgresql://dbadmin:password@localhost:5432/branding_db
```

**After** (using centralized config):
```bash
source "${SCRIPT_DIR}/.env"
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}
```

### Available Scripts

- **promote-chennai-db.sh**: Promotes Chennai replica to primary during failover
- **setup-backend.sh**: Initial backend VM setup script

### Prerequisites

Before running any scripts, ensure you have:

1. Configured `terraform/terraform.tfvars` with your values
2. Run `terraform apply` to generate the `.env` file
3. The generated `.env` file will be at `terraform/scripts/.env`

### Security Note

The `.env` file is automatically ignored by git (see `.gitignore`) as it contains sensitive information like database passwords. Never commit this file to version control.
