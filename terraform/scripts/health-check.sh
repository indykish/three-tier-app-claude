#!/bin/bash
# Health check script for both regions
# Run this to verify active/active deployment status

set -e

echo "=== Three-Tier App Health Check ==="
echo "Checking both Delhi and Chennai regions..."
echo ""

# Check if terraform outputs are available
check_region() {
    local region=$1
    local dir=$2

    echo "--- ${region} Region ---"

    if [ ! -d "${dir}" ]; then
        echo "ERROR: ${dir} directory not found"
        return 1
    fi

    cd "${dir}"

    if ! terraform output -json > /dev/null 2>&1; then
        echo "WARNING: Terraform state not found. Run 'terraform apply' first."
        return 1
    fi

    # Get IPs
    FRONTEND_IP=$(terraform output -raw frontend_lb_public_ip 2>/dev/null || echo "N/A")
    BACKEND_IP=$(terraform output -raw backend_lb_private_ip 2>/dev/null || echo "N/A")

    if [ "$region" = "Delhi" ]; then
        DB_IP=$(terraform output -raw db_primary_private_ip 2>/dev/null || echo "N/A")
        DB_ROLE="Primary"
    else
        DB_IP=$(terraform output -raw db_replica_private_ip 2>/dev/null || echo "N/A")
        DB_ROLE="Replica"
    fi

    echo "Frontend LB: ${FRONTEND_IP}"
    echo "Backend LB: ${BACKEND_IP}"
    echo "Database (${DB_ROLE}): ${DB_IP}"
    echo ""

    # Health checks
    if [ "$FRONTEND_IP" != "N/A" ]; then
        echo "Checking Frontend health..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${FRONTEND_IP}/health/" --connect-timeout 5 || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✓ Frontend: HEALTHY (HTTP ${HTTP_CODE})"
        else
            echo "✗ Frontend: UNHEALTHY (HTTP ${HTTP_CODE})"
        fi
    fi

    if [ "$BACKEND_IP" != "N/A" ]; then
        echo "Checking Backend health..."
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://${BACKEND_IP}:3001/health" --connect-timeout 5 || echo "000")
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✓ Backend: HEALTHY (HTTP ${HTTP_CODE})"
        else
            echo "✗ Backend: UNHEALTHY (HTTP ${HTTP_CODE})"
        fi
    fi

    echo ""
    cd - > /dev/null
}

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="${SCRIPT_DIR}/.."

check_region "Delhi" "${BASE_DIR}/delhi"
check_region "Chennai" "${BASE_DIR}/chennai"

echo "=== Health Check Complete ==="
echo ""
echo "For detailed infrastructure status, run:"
echo "  cd terraform/delhi && terraform output infrastructure_summary"
echo "  cd terraform/chennai && terraform output infrastructure_summary"
