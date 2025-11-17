# Delhi Region - PgPool-II Database Proxy
# Provides automatic failover and connection pooling

locals {
  pgpool_user_data = <<-EOF
#!/bin/bash
set -e

# Update system
apt-get update && apt-get upgrade -y

# Install PgPool-II
apt-get install -y pgpool2 postgresql-client

# Get database IPs
PRIMARY_DB_IP="${e2e_dbaas_postgresql.primary.private_ip}"
REPLICA_DB_IP="${var.chennai_db_replica_ip}"

# Configure PgPool-II
cat > /etc/pgpool2/pgpool.conf <<'PGPOOLCONF'
# Connection Settings
listen_addresses = '*'
port = 5432
socket_dir = '/var/run/postgresql'

# Backend Configuration
backend_hostname0 = '${PRIMARY_DB_IP}'
backend_port0 = 5432
backend_weight0 = 1
backend_data_directory0 = '/var/lib/postgresql/data'
backend_flag0 = 'ALLOW_TO_FAILOVER'

backend_hostname1 = '${REPLICA_DB_IP}'
backend_port1 = 5432
backend_weight1 = 1
backend_data_directory1 = '/var/lib/postgresql/data'
backend_flag1 = 'ALLOW_TO_FAILOVER'

# Load Balancing
load_balance_mode = on
statement_level_load_balance = on
master_slave_mode = on
master_slave_sub_mode = 'stream'

# Health Check
health_check_period = 10
health_check_timeout = 20
health_check_user = '${var.db_user}'
health_check_password = '${var.db_password}'
health_check_max_retries = 3
health_check_retry_delay = 1

# Failover
failover_command = '/etc/pgpool2/failover.sh %d %h %p %D %m %H %M %P %r %R'
failback_command = ''
fail_over_on_backend_error = on

# Connection Pool
num_init_children = 32
max_pool = 4
child_life_time = 300
child_max_connections = 0
connection_life_time = 0
client_idle_limit = 0

# Logging
log_statement = on
log_per_node_statement = on
log_hostname = on
log_connections = on

# Authentication
enable_pool_hba = on
pool_passwd = '/etc/pgpool2/pool_passwd'
PGPOOLCONF

# Create failover script
cat > /etc/pgpool2/failover.sh <<'FAILOVER'
#!/bin/bash
# Automatic failover script for PgPool-II

FAILED_NODE_ID=$1
FAILED_HOST=$2
FAILED_PORT=$3
FAILED_DIR=$4
NEW_MASTER_ID=$5
NEW_MASTER_HOST=$6
NEW_MASTER_PORT=$7
NEW_MASTER_DIR=$8
OLD_PRIMARY_NODE_ID=$9
OLD_MASTER_HOST=${10}

DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "$DATE: Failover triggered" >> /var/log/pgpool/failover.log
echo "Failed Node: $FAILED_HOST:$FAILED_PORT (ID: $FAILED_NODE_ID)" >> /var/log/pgpool/failover.log
echo "New Master: $NEW_MASTER_HOST:$NEW_MASTER_PORT (ID: $NEW_MASTER_ID)" >> /var/log/pgpool/failover.log

# Promote new master if it's a replica
if [ "$NEW_MASTER_ID" != "$OLD_PRIMARY_NODE_ID" ]; then
    echo "Promoting $NEW_MASTER_HOST to primary..." >> /var/log/pgpool/failover.log

    # Trigger promotion via webhook (UptimeRobot or similar)
    curl -X POST "https://your-automation-endpoint/promote" \
        -H "Content-Type: application/json" \
        -d "{\"new_primary\": \"$NEW_MASTER_HOST\", \"failed_node\": \"$FAILED_HOST\"}" \
        >> /var/log/pgpool/failover.log 2>&1

    # Or call E2E Networks API directly
    # curl -X POST "https://api.e2enetworks.com/myaccount/api/v1/dbaas/postgresql/promote" ...
fi

echo "$DATE: Failover completed" >> /var/log/pgpool/failover.log
FAILOVER

chmod +x /etc/pgpool2/failover.sh
mkdir -p /var/log/pgpool
chown postgres:postgres /var/log/pgpool

# Create pool_hba.conf
cat > /etc/pgpool2/pool_hba.conf <<'POOLHBA'
local   all         all                               trust
host    all         all         0.0.0.0/0            md5
host    all         all         ::1/128              md5
POOLHBA

# Create password file
pg_md5 -m -u ${var.db_user} ${var.db_password}

# Enable and start PgPool
systemctl enable pgpool2
systemctl restart pgpool2

# Health check endpoint for monitoring
apt-get install -y nginx
cat > /etc/nginx/sites-available/health <<'NGINX'
server {
    listen 8080;
    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
    location /pgpool-status {
        proxy_pass http://127.0.0.1:9898/;
    }
}
NGINX
ln -s /etc/nginx/sites-available/health /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

echo "PgPool-II setup completed"
EOF
}

# PgPool VM for database connection proxying
resource "e2e_node" "pgpool" {
  name     = "three-tier-pgpool-delhi"
  region   = "Delhi"
  plan     = "C2.4GB"  # Smaller plan for proxy
  image    = var.image_name
  vpc_id   = e2e_vpc.delhi_vpc.vpc_id
  ssh_keys = [var.ssh_key_name]

  start_script = file("${path.module}/scripts/pgpool-setup.sh")

  depends_on = [
    e2e_dbaas_postgresql.primary,
    e2e_vpc.delhi_vpc
  ]
}

output "pgpool_private_ip" {
  description = "PgPool proxy private IP - backends connect here"
  value       = e2e_node.pgpool.private_ip_address
}

output "pgpool_public_ip" {
  description = "PgPool proxy public IP"
  value       = e2e_node.pgpool.public_ip_address
}

# Update backend connection to use PgPool
# Backends now connect to: pgpool_private_ip:5432
# PgPool handles:
# - Automatic failover
# - Read/write splitting
# - Connection pooling
# - Health monitoring
