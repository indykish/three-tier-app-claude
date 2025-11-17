# Delhi Region - Primary PostgreSQL Database

resource "e2e_dbaas_postgresql" "primary" {
  name       = "three-tier-primary-db"
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
  vpc_list = [e2e_vpc.delhi_vpc.id]

  # Enable encryption at rest
  is_encryption_enabled = true

  lifecycle {
    prevent_destroy = true
  }
}

output "db_primary_id" {
  description = "Primary database instance ID"
  value       = e2e_dbaas_postgresql.primary.id
}

output "db_primary_connectivity" {
  description = "Primary database connectivity details (contains IP information)"
  value       = e2e_dbaas_postgresql.primary.connectivity_detail
}

output "db_connection_info" {
  description = "Database connection information"
  value = {
    id       = e2e_dbaas_postgresql.primary.id
    user     = var.db_user
    database = var.db_name
    port     = 5432
  }
}
