# Chennai Region - Frontend Load Balancer

resource "e2e_loadbalancer" "frontend_lb" {
  lb_name    = "three-tier-frontend-chennai"
  plan_name  = "Starter"
  project_id = var.project_id
  lb_mode    = "HTTP"
  lb_type    = "external"

  # VPC attachment
  vpc_list = [e2e_vpc.chennai_vpc.vpc_id]

  # Enable DDoS protection
  enable_bitninja = true

  # HTTP Backend configuration
  backends {
    name    = "frontend-backend"
    balance = "roundrobin"

    # Health check configuration
    checkbox_enable = true
    check_url       = "/health/"
    domain_name     = ""

    # Servers from autoscaling group
    dynamic "servers" {
      for_each = e2e_autoscaling.frontend.node_ids
      content {
        node_id = servers.value
        port    = var.frontend_port
      }
    }
  }

  depends_on = [
    e2e_vpc.chennai_vpc,
    e2e_autoscaling.frontend
  ]
}

output "frontend_lb_public_ip" {
  description = "Frontend load balancer public IP"
  value       = e2e_loadbalancer.frontend_lb.public_ip
}

output "frontend_lb_id" {
  description = "Frontend load balancer ID"
  value       = e2e_loadbalancer.frontend_lb.id
}
