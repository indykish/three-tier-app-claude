# Delhi Region - Main Outputs

output "region" {
  description = "Deployment region"
  value       = "Delhi"
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${e2e_loadbalancer.frontend_lb.public_ip}"
}

output "backend_api_url" {
  description = "Backend API URL (internal)"
  value       = "http://${e2e_loadbalancer.backend_lb.private_ip}:${var.backend_port}"
}

output "database_info" {
  description = "Database connection information"
  value = {
    role       = "primary"
    id         = e2e_dbaas_postgresql.primary.id
    database   = var.db_name
    user       = var.db_user
    port       = 5432
  }
}

output "infrastructure_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    region              = "Delhi"
    vpc_id              = e2e_vpc.delhi_vpc.id
    frontend_lb_ip      = e2e_loadbalancer.frontend_lb.public_ip
    backend_lb_ip       = e2e_loadbalancer.backend_lb.private_ip
    db_primary_id       = e2e_dbaas_postgresql.primary.id
    frontend_node_ip    = e2e_node.frontend.public_ip_address
    backend_node_ip     = e2e_node.backend.public_ip_address
  }
}
