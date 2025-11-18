# Chennai Region - Backend Node
# Using e2e_node for initial deployment

resource "e2e_node" "backend" {
  name       = "three-tier-backend-chennai"
  location   = "Chennai"
  project_id = var.project_id
  plan       = var.vm_plan
  image      = var.image_name
  vpc_id     = e2e_vpc.chennai_vpc.id
  ssh_keys   = [var.ssh_key_name]

  # VM provisioning script - variables injected from terraform.tfvars
  start_script = templatefile("${path.module}/../scripts/setup-backend.sh", {
    backend_port    = var.backend_port
    db_user         = var.db_user
    db_password     = var.db_password
    db_name         = var.db_name
    db_host         = e2e_dbaas_postgresql.replica.connectivity_detail
    github_repo_url = var.github_repo_url
  })

  depends_on = [
    e2e_vpc.chennai_vpc,
    e2e_dbaas_postgresql.replica
  ]
}

output "backend_node_id" {
  description = "Backend node ID"
  value       = e2e_node.backend.id
}

output "backend_public_ip" {
  description = "Backend node public IP"
  value       = e2e_node.backend.public_ip_address
}

output "backend_private_ip" {
  description = "Backend node private IP"
  value       = e2e_node.backend.private_ip_address
}
