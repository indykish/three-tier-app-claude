# Delhi Region - Primary PostgreSQL Database

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

  # VPC attachment for network isolation
  vpcs = [e2e_vpc.delhi_vpc.vpc_id]

  # Enable encryption at rest
  is_encryption_enabled = true

  lifecycle {
    prevent_destroy = true
  }
}

output "db_primary_public_ip" {
  description = "Primary database public IP"
  value       = e2e_dbaas_postgresql.primary.public_ip
}

output "db_primary_private_ip" {
  description = "Primary database private IP"
  value       = e2e_dbaas_postgresql.primary.private_ip
}

output "db_primary_id" {
  description = "Primary database instance ID"
  value       = e2e_dbaas_postgresql.primary.id
}

output "db_connection_string" {
  description = "Database connection string for primary"
  value       = "postgresql://${var.db_user}:${var.db_password}@${e2e_dbaas_postgresql.primary.private_ip}:5432/${var.db_name}"
  sensitive   = true
}
