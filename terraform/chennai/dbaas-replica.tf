# Chennai Region - PostgreSQL Database
# Note: Configure as replica of Delhi primary manually in E2E Console
# or via API after creation

resource "e2e_dbaas_postgresql" "replica" {
  name       = "three-tier-replica-db"
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
  vpc_list = [e2e_vpc.chennai_vpc.id]

  # Enable encryption at rest
  is_encryption_enabled = true

  # Note: Replication setup requires manual configuration
  # After creation:
  # 1. Configure as replica in E2E Console
  # 2. Point to Delhi primary using delhi_db_primary_id variable
  # 3. Start streaming replication

  lifecycle {
    prevent_destroy = true
  }
}

output "db_replica_id" {
  description = "Replica database instance ID"
  value       = e2e_dbaas_postgresql.replica.id
}

output "db_replica_connectivity" {
  description = "Replica database connectivity details"
  value       = e2e_dbaas_postgresql.replica.connectivity_detail
}

output "db_connection_info" {
  description = "Database connection information"
  value = {
    id              = e2e_dbaas_postgresql.replica.id
    user            = var.db_user
    database        = var.db_name
    port            = 5432
    delhi_primary_id = var.delhi_db_primary_id
  }
}
