# Chennai Region - Backend Autoscaling Group
# Backend connects to local replica for reads, Delhi primary for writes

# Cloud-init script for backend nodes
locals {
  backend_user_data = <<-EOF
#!/bin/bash
set -e

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# Clone application
mkdir -p /opt/app
cd /opt/app
git clone ${var.github_repo_url} .

# Setup backend
cd /opt/app/backend
npm install
npm run build

# Create environment file with read/write split
# Read operations use local Chennai replica
# Write operations go to Delhi primary
cat > /opt/app/backend/.env <<'ENVFILE'
PORT=${var.backend_port}
DATABASE_URL=postgresql://${var.db_user}:${var.db_password}@${e2e_dbaas_postgresql.replica.private_ip}:5432/${var.db_name}
DATABASE_URL_WRITE=postgresql://${var.db_user}:${var.db_password}@${var.delhi_db_primary_ip}:5432/${var.db_name}
NODE_ENV=production
CORS_ORIGINS=*
REGION=chennai
IS_PRIMARY=false
ENVFILE

# Create systemd service for backend
cat > /etc/systemd/system/backend.service <<'SYSTEMD'
[Unit]
Description=Three-Tier Backend API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/app/backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=backend-api
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SYSTEMD

# Enable and start backend service
systemctl daemon-reload
systemctl enable backend
systemctl start backend

# Wait for service to start
sleep 5

# Verify service is running
systemctl status backend

echo "Backend setup completed successfully"
EOF
}

# Autoscaling group for backend
resource "e2e_autoscaling" "backend" {
  name            = "three-tier-backend-chennai"
  location        = "Chennai"
  project_id      = var.project_id
  min_node        = var.autoscaling_min
  max_node        = var.autoscaling_max
  scaleup_policy  = 70  # CPU threshold for scale up
  scaledown_policy = 25  # CPU threshold for scale down

  template {
    name       = "backend-template"
    plan       = var.vm_plan
    image      = var.image_name
    ssh_keys   = [var.ssh_key_name]
    vpc_id     = e2e_vpc.chennai_vpc.vpc_id
    start_script = base64encode(local.backend_user_data)
  }

  depends_on = [
    e2e_vpc.chennai_vpc,
    e2e_dbaas_postgresql.replica
  ]
}

output "backend_autoscaling_id" {
  description = "Backend autoscaling group ID"
  value       = e2e_autoscaling.backend.id
}

output "backend_node_ids" {
  description = "Backend node IDs in the autoscaling group"
  value       = e2e_autoscaling.backend.node_ids
}
