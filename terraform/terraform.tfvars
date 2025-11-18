# Three-Tier App Terraform Variables
#
# IMPORTANT: E2E Networks credentials are pulled from environment variables.
# Before running terraform, export these environment variables:
#
#   export TF_VAR_e2e_api_key="your-api-key-here"
#   export TF_VAR_e2e_auth_token="your-auth-token-here"
#   export TF_VAR_project_id="your-project-id"
#
# For persistent configuration, add these to your shell profile (~/.bashrc, ~/.zshrc)

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
