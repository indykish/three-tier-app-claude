# Delhi Region - Frontend Autoscaling Group

# Cloud-init script for frontend nodes
locals {
  frontend_user_data = <<-EOF
#!/bin/bash
set -e

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# Install Caddy
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# Clone application
mkdir -p /opt/app
cd /opt/app
git clone ${var.github_repo_url} .

# Build frontend
cd /opt/app/branding
npm install
npm run build

# Create Caddyfile for reverse proxy
cat > /etc/caddy/Caddyfile <<'CADDYFILE'
:80 {
    root * /opt/app/branding/dist
    file_server

    handle_path /api/* {
        reverse_proxy ${e2e_loadbalancer.backend_lb.public_ip}:${var.backend_port}
    }

    # SPA routing - serve index.html for all non-file routes
    try_files {path} /index.html

    # Compression
    encode gzip zstd

    # Security headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
}
CADDYFILE

# Enable and start Caddy
systemctl enable caddy
systemctl restart caddy

# Create health check endpoint
mkdir -p /opt/app/branding/dist/health
echo '{"status": "healthy", "service": "frontend", "region": "delhi"}' > /opt/app/branding/dist/health/index.html

echo "Frontend setup completed successfully"
EOF
}

# Autoscaling group for frontend
resource "e2e_autoscaling" "frontend" {
  name            = "three-tier-frontend-delhi"
  location        = "Delhi"
  project_id      = var.project_id
  min_node        = var.autoscaling_min
  max_node        = var.autoscaling_max
  scaleup_policy  = 80  # CPU threshold for scale up
  scaledown_policy = 30  # CPU threshold for scale down

  template {
    name       = "frontend-template"
    plan       = var.vm_plan
    image      = var.image_name
    ssh_keys   = [var.ssh_key_name]
    vpc_id     = e2e_vpc.delhi_vpc.vpc_id
    start_script = base64encode(local.frontend_user_data)
  }

  depends_on = [
    e2e_vpc.delhi_vpc,
    e2e_loadbalancer.backend_lb
  ]
}

output "frontend_autoscaling_id" {
  description = "Frontend autoscaling group ID"
  value       = e2e_autoscaling.frontend.id
}

output "frontend_node_ids" {
  description = "Frontend node IDs in the autoscaling group"
  value       = e2e_autoscaling.frontend.node_ids
}
