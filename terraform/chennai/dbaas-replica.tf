# Chennai Region - PostgreSQL Read Replica

resource "e2e_dbaas_postgresql" "replica" {
  dbaas_name = "three-tier-replica-db"
  location   = "Chennai"
  project_id = var.project_id
  plan       = var.db_plan
  version    = var.db_version

  database {
    user     = var.db_user
    password = var.db_password
    name     = var.db_name
  }

  # VPC attachment for network isolation
  vpcs = [e2e_vpc.chennai_vpc.vpc_id]

  # Enable encryption at rest
  is_encryption_enabled = true

  # Replica configuration
  # This creates a read replica linked to the Delhi primary
  replica_of = var.delhi_db_primary_id

  lifecycle {
    prevent_destroy = true
  }
}

output "db_replica_public_ip" {
  description = "Replica database public IP"
  value       = e2e_dbaas_postgresql.replica.public_ip
}

output "db_replica_private_ip" {
  description = "Replica database private IP"
  value       = e2e_dbaas_postgresql.replica.private_ip
}

output "db_replica_id" {
  description = "Replica database instance ID"
  value       = e2e_dbaas_postgresql.replica.id
}

output "db_read_connection_string" {
  description = "Database connection string for replica (read operations)"
  value       = "postgresql://${var.db_user}:${var.db_password}@${e2e_dbaas_postgresql.replica.private_ip}:5432/${var.db_name}"
  sensitive   = true
}

output "db_write_connection_string" {
  description = "Database connection string for primary (write operations)"
  value       = "postgresql://${var.db_user}:${var.db_password}@${var.delhi_db_primary_ip}:5432/${var.db_name}"
  sensitive   = true
}
