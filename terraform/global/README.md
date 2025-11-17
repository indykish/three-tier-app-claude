# Global Terraform Configuration

This directory contains shared Terraform configurations for the Active/Active deployment.

## Files

- **versions.tf**: Terraform and provider version constraints
- **providers.tf**: E2E Networks provider configuration template
- **variables.tf**: Global variable definitions

## Usage

These files serve as templates and reference. Each regional deployment (Delhi/Chennai) has its own provider configuration to allow independent state management.

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
