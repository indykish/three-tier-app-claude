# Delhi Region - Primary Infrastructure
# Active/Active deployment with primary database

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    e2e = {
      source  = "e2eterraformprovider/e2e"
      version = "~> 2.2"
    }
  }
}

provider "e2e" {
  api_key    = var.e2e_api_key
  auth_token = var.e2e_auth_token
}

locals {
  region = "Delhi"
  env    = "production"

  common_tags = {
    Environment = local.env
    Region      = local.region
    Project     = "three-tier-app"
    ManagedBy   = "terraform"
  }
}
