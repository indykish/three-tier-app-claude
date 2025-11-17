# Delhi Region - Backend Load Balancer

resource "e2e_loadbalancer" "backend_lb" {
  lb_name    = "three-tier-backend-delhi"
  plan_name  = "Starter"
  project_id = var.project_id
  lb_mode    = "HTTP"
  lb_type    = "internal"

  # VPC attachment - internal LB for backend services
  vpc_list = [e2e_vpc.delhi_vpc.vpc_id]

  # HTTP Backend configuration for API
  backends {
    name    = "backend-api"
    balance = "roundrobin"

    # Health check configuration
    checkbox_enable = true
    check_url       = "/health"
    domain_name     = ""

    # Servers from autoscaling group
    dynamic "servers" {
      for_each = e2e_autoscaling.backend.node_ids
      content {
        node_id = servers.value
        port    = var.backend_port
      }
    }
  }

  depends_on = [
    e2e_vpc.delhi_vpc,
    e2e_autoscaling.backend
  ]
}

output "backend_lb_public_ip" {
  description = "Backend load balancer IP (internal)"
  value       = e2e_loadbalancer.backend_lb.public_ip
}

output "backend_lb_private_ip" {
  description = "Backend load balancer private IP"
  value       = e2e_loadbalancer.backend_lb.private_ip
}

output "backend_lb_id" {
  description = "Backend load balancer ID"
  value       = e2e_loadbalancer.backend_lb.id
}
