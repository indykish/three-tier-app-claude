# Delhi Region - Frontend Node
# Using e2e_node for initial deployment
# For production auto-scaling, consider e2e_scaler_group with custom images

resource "e2e_node" "frontend" {
  name       = "three-tier-frontend-delhi"
  location   = "Delhi"
  project_id = var.project_id
  plan       = var.vm_plan
  image      = var.image_name
  vpc_id     = e2e_vpc.delhi_vpc.id
  ssh_keys   = [var.ssh_key_name]

  # VM provisioning script
  start_script = file("${path.module}/../scripts/setup-frontend.sh")

  depends_on = [e2e_vpc.delhi_vpc]
}

output "frontend_node_id" {
  description = "Frontend node ID"
  value       = e2e_node.frontend.id
}

output "frontend_public_ip" {
  description = "Frontend node public IP"
  value       = e2e_node.frontend.public_ip_address
}

output "frontend_private_ip" {
  description = "Frontend node private IP"
  value       = e2e_node.frontend.private_ip_address
}
