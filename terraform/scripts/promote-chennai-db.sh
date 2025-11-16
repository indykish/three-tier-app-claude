#!/bin/bash
# Promote Chennai database replica to primary (failover scenario)
# Use this when Delhi primary is down and Chennai needs to become active

set -e

echo "=== Chennai Database Promotion Script ==="
echo "WARNING: This will promote Chennai replica to primary."
echo "Ensure Delhi primary is confirmed DOWN before proceeding."
echo ""
read -p "Are you sure you want to promote Chennai DB? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

# Step 1: Update Chennai backend configuration
echo "Step 1: Reconfiguring Chennai backends to use local database for writes..."

CHENNAI_DB_IP=$(cd ../chennai && terraform output -raw db_replica_private_ip)

cat > /tmp/chennai-promote.env <<EOF
PORT=3001
DATABASE_URL=postgresql://dbadmin:YOUR_PASSWORD@${CHENNAI_DB_IP}:5432/branding_db
DATABASE_URL_WRITE=postgresql://dbadmin:YOUR_PASSWORD@${CHENNAI_DB_IP}:5432/branding_db
NODE_ENV=production
CORS_ORIGINS=*
REGION=chennai
IS_PRIMARY=true
EOF

echo "New environment configuration:"
cat /tmp/chennai-promote.env
echo ""

# Step 2: Promote replica to primary via E2E API
echo "Step 2: Promoting Chennai replica to standalone primary..."
echo "NOTE: This requires E2E Networks API call or console action."
echo ""
echo "Manual steps required:"
echo "1. Log into E2E Networks Console"
echo "2. Navigate to Database Services"
echo "3. Select 'three-tier-replica-db' in Chennai"
echo "4. Click 'Promote to Primary'"
echo "5. Confirm the promotion"
echo ""

read -p "Press Enter after promoting the database in E2E Console..."

# Step 3: Update DNS
echo "Step 3: Update DNS configuration..."
echo "Update your Route 53 health check to mark Delhi as unhealthy"
echo "Increase Chennai weight to 100%"
echo ""

# Step 4: Verify
echo "Step 4: Verification checklist:"
echo "[ ] Chennai database is writable"
echo "[ ] Chennai backends are using local database"
echo "[ ] DNS is routing traffic to Chennai"
echo "[ ] Application is functional"
echo ""

echo "=== Promotion Process Initiated ==="
echo "Monitor the application and database for any issues."
