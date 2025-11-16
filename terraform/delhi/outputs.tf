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
    public_ip  = e2e_dbaas_postgresql.primary.public_ip
    private_ip = e2e_dbaas_postgresql.primary.private_ip
    database   = var.db_name
    user       = var.db_user
    port       = 5432
  }
}

output "infrastructure_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    region              = "Delhi"
    vpc_id              = e2e_vpc.delhi_vpc.vpc_id
    frontend_lb_ip      = e2e_loadbalancer.frontend_lb.public_ip
    backend_lb_ip       = e2e_loadbalancer.backend_lb.private_ip
    db_primary_ip       = e2e_dbaas_postgresql.primary.private_ip
    frontend_scaling    = "${var.autoscaling_min}-${var.autoscaling_max} instances"
    backend_scaling     = "${var.autoscaling_min}-${var.autoscaling_max} instances"
  }
}
