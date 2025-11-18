#!/bin/bash
# Frontend VM Setup Script
set -e

echo "Setting up frontend server..."

# Update system
apt-get update && apt-get upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git

# Install Caddy
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# Clone application
mkdir -p /opt/app
cd /opt/app
git clone https://github.com/indykish/three-tier-app-claude.git .

# Build frontend
cd /opt/app/frontend
npm install
npm run build

# Configure Caddy
cat > /etc/caddy/Caddyfile <<'CADDYFILE'
:80 {
    root * /opt/app/frontend/dist
    file_server

    # SPA routing
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
mkdir -p /opt/app/frontend/dist/health
echo '{"status": "healthy", "service": "frontend", "region": "delhi"}' > /opt/app/frontend/dist/health/index.html

echo "Frontend setup completed successfully"
