#!/bin/bash
# Backend VM Setup Script
set -e

echo "Setting up backend server..."

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# Clone application
mkdir -p /opt/app
cd /opt/app
git clone https://github.com/indykish/three-tier-app-claude.git .

# Setup backend
cd /opt/app/backend
npm install
npm run build

# Create environment file
# Note: Update DATABASE_URL with actual DB connection from Terraform outputs
cat > /opt/app/backend/.env <<'ENVFILE'
PORT=3001
DATABASE_URL=postgresql://dbadmin:password@localhost:5432/appdb
NODE_ENV=production
CORS_ORIGINS=*
ENVFILE

# Create systemd service
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

echo "Backend setup completed successfully"
