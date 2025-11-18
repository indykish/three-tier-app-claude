# Global Terraform Configuration

This directory contains **reference documentation** for shared Terraform configurations. It is NOT used directly in deployments.

## Files

- **versions.tf**: Terraform and provider version constraints reference
- **providers.tf**: E2E Networks provider configuration template
- **variables.tf**: Variable type definitions and documentation (reference only)

## Usage

**IMPORTANT:** This directory is for **reference only**. Regional deployments use:

1. **Variable Declarations**: Each region (Delhi/Chennai) has its own `variables.tf`
2. **Variable Values**: Single source in `terraform/terraform.tfvars` (parent directory)
3. **Deployment**: `cd delhi && terraform apply -var-file="../terraform.tfvars"`

These files serve as documentation showing all available variables. Each regional deployment (Delhi/Chennai) has its own provider configuration to allow independent state management.

## Provider Configuration

The E2E Networks provider requires:
- `api_key`: Your E2E Networks API key
- `auth_token`: Your E2E Networks authentication token

These should be passed via `terraform.tfvars` and are marked as sensitive.

## Important Notes

1. Regional deployments are independent - each has its own Terraform state
2. Deploy Delhi first (primary database)
3. Deploy Chennai second (requires Delhi database outputs)
4. Never commit sensitive credentials to version control
