#!/bin/bash
# Restore Delhi as primary after recovery
# Use this when Delhi is back online and should resume primary role

set -e

echo "=== Delhi Primary Restoration Script ==="
echo "This script restores Delhi as the primary region."
echo "Chennai will become replica again."
echo ""

read -p "Is Delhi infrastructure back online? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Ensure Delhi is fully operational before proceeding."
    exit 0
fi

echo "Step 1: Sync data from Chennai to Delhi..."
echo "NOTE: This requires careful data synchronization."
echo ""
echo "Options:"
echo "a) Point-in-time recovery from Chennai to Delhi"
echo "b) Configure Delhi DB as replica of Chennai temporarily"
echo "c) Manual data export/import"
echo ""

read -p "Which sync method will you use? (a/b/c): " sync_method

case $sync_method in
    a)
        echo "Using point-in-time recovery..."
        echo "Manual step: Restore Delhi DB from Chennai backup"
        ;;
    b)
        echo "Setting Delhi as temporary replica..."
        echo "Manual step: Configure replication from Chennai to Delhi"
        ;;
    c)
        echo "Manual data sync..."
        echo "Manual step: pg_dump from Chennai, pg_restore to Delhi"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

read -p "Press Enter after data sync is complete..."

# Step 2: Reconfigure Delhi as primary
echo "Step 2: Promoting Delhi database back to primary..."
echo ""
echo "Manual steps in E2E Console:"
echo "1. Stop replication on Delhi DB (if configured as replica)"
echo "2. Promote Delhi DB to standalone primary"
echo "3. Verify Delhi DB is writable"
echo ""

read -p "Press Enter after Delhi DB is promoted..."

# Step 3: Reconfigure Chennai as replica
echo "Step 3: Reconfiguring Chennai as replica of Delhi..."
echo ""
echo "Manual steps in E2E Console:"
echo "1. Stop Chennai standalone mode"
echo "2. Configure Chennai DB to replicate from Delhi"
echo "3. Verify replication is working"
echo ""

read -p "Press Enter after Chennai replication is configured..."

# Step 4: Update application configurations
echo "Step 4: Updating application configurations..."

DELHI_DB_IP=$(cd ../delhi && terraform output -raw db_primary_private_ip)
CHENNAI_DB_IP=$(cd ../chennai && terraform output -raw db_replica_private_ip)

echo "Delhi backends should use: ${DELHI_DB_IP}"
echo "Chennai backends should use: ${CHENNAI_DB_IP} for reads, ${DELHI_DB_IP} for writes"
echo ""

# Step 5: Update DNS
echo "Step 5: Update DNS weights..."
echo "Restore normal active/active weights in Route 53"
echo "Typical: Delhi 50%, Chennai 50%"
echo ""

# Step 6: Verification
echo "Step 6: Final verification:"
echo "[ ] Delhi database is primary and writable"
echo "[ ] Chennai database is replicating from Delhi"
echo "[ ] Delhi backends write to local DB"
echo "[ ] Chennai backends read from local replica, write to Delhi"
echo "[ ] DNS is balanced between both regions"
echo "[ ] Both applications are healthy"
echo ""

echo "=== Delhi Primary Restoration Complete ==="
