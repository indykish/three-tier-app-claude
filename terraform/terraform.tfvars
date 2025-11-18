# Three-Tier App Terraform Variables
#
# IMPORTANT: E2E Networks credentials are pulled from environment variables.
# Before running terraform, export these environment variables:
#
#   export TF_VAR_e2e_api_key="${E2E_API_KEY}"
#   export TF_VAR_e2e_auth_token="${E2E_AUTH_TOKEN}"
#   export TF_VAR_project_id="${E2E_PROJECT_ID}"
#
# Or add them to your shell profile (~/.bashrc, ~/.zshrc):
#   export E2E_API_KEY="your-api-key-here"
#   export E2E_AUTH_TOKEN="your-auth-token-here"
#   export E2E_PROJECT_ID="your-project-id"
#   export TF_VAR_e2e_api_key="${E2E_API_KEY}"
#   export TF_VAR_e2e_auth_token="${E2E_AUTH_TOKEN}"
#   export TF_VAR_project_id="${E2E_PROJECT_ID}"

# NOTE: The following values are commented out because they come from environment variables
# Uncomment and set if you prefer to use this file instead of environment variables
# e2e_api_key    = "pulled-from-TF_VAR_e2e_api_key"
# e2e_auth_token = "pulled-from-TF_VAR_e2e_auth_token"
# project_id     = "pulled-from-TF_VAR_project_id"

# SSH Key (must exist in your E2E Networks account)
ssh_key_name = "KishoreMac"

# VM Configuration
image_name = "Ubuntu-24.04"
vm_plan    = "C3.8GB"  # 4 vCPU, 8GB RAM, 100GB disk

# Database Configuration
db_plan     = "DBS.8GB"
db_version  = "16"
db_name     = "branding_db"
db_user     = "dbadmin"
db_password = "your-secure-database-password"  # TODO: Change this or use TF_VAR_db_password

# Application Ports
frontend_port = 80
backend_port  = 3001

# Autoscaling Configuration
autoscaling_min = 1
autoscaling_max = 5

# Network Configuration
vpc_cidr_delhi   = "10.10.0.0/16"
vpc_cidr_chennai = "10.20.0.0/16"
