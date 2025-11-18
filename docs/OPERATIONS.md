# Operations and Disaster Recovery Guide

## Table of Contents

- [Health Monitoring](#health-monitoring)
- [Failover Procedures](#failover-procedures)
- [Database Operations](#database-operations)
- [Troubleshooting](#troubleshooting)
- [Runbooks](#runbooks)

---

## Health Monitoring

### System Health Checks

**Frontend Health:**

```bash
# Check frontend LB health
curl http://<frontend-lb-ip>/health/

# Expected response:
# HTTP 200 OK with application metrics
```

**Backend Health:**

```bash
# From a frontend VM or bastion host
curl http://<backend-lb-private-ip>:3001/health

# Expected response:
# {"status":"ok","timestamp":"2024-11-18T10:00:00Z"}
```

**Database Health:**

```bash
# Check primary database
psql -h <delhi-db-ip> -U dbadmin -d appdb -c "SELECT version();"

# Check replica status
psql -h <chennai-db-ip> -U dbadmin -d appdb -c "
  SELECT
    pg_is_in_recovery(),
    now() - pg_last_xact_replay_timestamp() AS lag;"
```

### Monitoring Metrics

**Key Performance Indicators:**

| Metric          | Normal  | Warning   | Critical |
| --------------- | ------- | --------- | -------- |
| Response Time   | < 200ms | 200-500ms | > 500ms  |
| Error Rate      | < 0.1%  | 0.1-1%    | > 1%     |
| CPU Usage       | < 60%   | 60-80%    | > 80%    |
| Memory Usage    | < 70%   | 70-85%    | > 85%    |
| Disk Usage      | < 70%   | 70-85%    | > 85%    |
| Replication Lag | < 1s    | 1-5s      | > 5s     |

**UptimeRobot Monitors:**

- Delhi Frontend: HTTP check every 5 minutes
- Chennai Frontend: HTTP check every 5 minutes
- Alert threshold: 3 consecutive failures
- Notifications: Email, Slack webhook

**Application Logs:**

```bash
# Backend logs
journalctl -u backend.service -f

# Caddy logs
journalctl -u caddy.service -f

# VM initialization logs
tail -f /var/log/cloud-init-output.log
```

---

## Failover Procedures

### Automatic Frontend Failover

**How It Works:**

1. Route 53 health checks monitor both region endpoints
2. Check interval: 30 seconds
3. Failure threshold: 3 consecutive failures (90 seconds)
4. Automatic traffic shift to healthy region

**Testing Automatic Failover:**

```bash
# 1. Verify both regions are healthy
for i in {1..10}; do
  curl -s http://app.yourdomain.com/health/ | grep -o "region"
  sleep 2
done
# Should alternate between Delhi and Chennai

# 2. Simulate Delhi region failure
ssh root@<delhi-frontend-vm-ip>
systemctl stop caddy

# 3. Monitor health check transition (AWS Console)
# Route 53 → Health checks → three-tier-delhi-health
# Status will change: Healthy → Unhealthy (after ~90 seconds)

# 4. Test application still responds
for i in {1..10}; do
  curl -s http://app.yourdomain.com/health/ | grep -o "region"
  sleep 2
done
# Should now ONLY return Chennai

# 5. Verify DNS routing
dig app.yourdomain.com
# Should return only Chennai IP

# 6. Restore Delhi
ssh root@<delhi-frontend-vm-ip>
systemctl start caddy

# 7. Verify traffic resumes 50/50 distribution
# Wait 2-3 minutes for health check to recover
```

**Expected Timeline:**

- T+0: Failure occurs
- T+30s: First health check fails
- T+90s: Third health check fails, Route 53 marks unhealthy
- T+90s: Traffic automatically routes to healthy region
- Total downtime: ~90 seconds

### Manual Regional Failover

**Scenario:** Need to take Delhi offline for maintenance

```bash
# 1. Update Route 53 weighted routing
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch file://failover-to-chennai.json

# failover-to-chennai.json content:
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "app.yourdomain.com",
      "Type": "A",
      "SetIdentifier": "delhi-primary",
      "Weight": 0,
      "TTL": 60,
      "ResourceRecords": [{"Value": "<delhi-ip>"}]
    }
  }]
}

# 2. Wait for DNS propagation (TTL duration)
# 3. Verify all traffic goes to Chennai
# 4. Perform maintenance on Delhi
# 5. Restore traffic distribution by setting Weight back to 50
```

---

## Database Operations

### Monitoring Replication

**Check Replication Status (Primary):**

```sql
-- On Delhi (Primary)
SELECT
  client_addr,
  state,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn,
  sync_state
FROM pg_stat_replication;
```

**Expected Output:**

```
 client_addr | state     | sent_lsn | write_lsn | flush_lsn | replay_lsn | sync_state
-------------+-----------+----------+-----------+-----------+------------+------------
 <chennai-ip>| streaming | 0/3000000| 0/3000000 | 0/3000000 | 0/3000000  | async
```

**Check Replication Lag (Replica):**

```sql
-- On Chennai (Replica)
SELECT
  now() - pg_last_xact_replay_timestamp() AS lag,
  pg_is_in_recovery() AS is_replica;
```

**Expected Output:**

```
 lag         | is_replica
-------------+------------
 00:00:00.50 | t
```

**Acceptable lag:** < 5 seconds under normal load

### Database Failover (Promote Replica)

**When to Use:**

- Delhi database is down
- Delhi region is completely unavailable
- Planned maintenance requiring extended downtime

**Procedure:**

```bash
# 1. Verify replication lag is acceptable
ssh root@<chennai-backend-vm>
psql -h <chennai-db-ip> -U dbadmin -d appdb -c "
  SELECT now() - pg_last_xact_replay_timestamp() AS lag;"

# If lag > 10 seconds, wait for catchup or accept data loss

# 2. Promote Chennai replica to primary
# (This step depends on E2E DBaaS interface - typically via API or console)
# Manual promotion if needed:
ssh postgres@<chennai-db-vm>
pg_ctl promote -D /var/lib/postgresql/data

# 3. Verify promotion
psql -h <chennai-db-ip> -U dbadmin -d appdb -c "
  SELECT pg_is_in_recovery();"
# Should return 'f' (false) indicating it's now primary

# 4. Update backend configuration
# If using environment variables:
ssh root@<backend-vm-ip>
# Update DATABASE_URL to point to Chennai DB
sed -i 's/<delhi-db-ip>/<chennai-db-ip>/g' /opt/app/backend/.env
systemctl restart backend.service

# 5. Test write operations
curl -X POST http://app.yourdomain.com/api/v1/themes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Failover Test Theme",
    "companyName": "Test",
    "companyUrl": "https://test.com",
    "theme": { /* ... */ },
    "capabilities": { "general_app_title": "Test" }
  }'

# 6. Monitor application for errors
journalctl -u backend.service -f
```

### Database Failback (Restore Original Primary)

**Scenario:** Delhi database is back online, restore as primary

```bash
# 1. Rebuild Delhi database as replica of Chennai
# (Via E2E DBaaS console or API)

# 2. Wait for replication to sync
psql -h <delhi-db-ip> -U dbadmin -d appdb -c "
  SELECT now() - pg_last_xact_replay_timestamp() AS lag;"
# Wait until lag < 1 second

# 3. Plan maintenance window (optional)
# Notify users of brief downtime

# 4. Promote Delhi back to primary
pg_ctl promote -D /var/lib/postgresql/data

# 5. Reconfigure Chennai as replica
# (Via E2E DBaaS console)

# 6. Update backend configurations to point to Delhi
ssh root@<backend-vm-ip>
sed -i 's/<chennai-db-ip>/<delhi-db-ip>/g' /opt/app/backend/.env
systemctl restart backend.service

# 7. Verify replication is working
psql -h <delhi-db-ip> -U dbadmin -d appdb -c "
  SELECT * FROM pg_stat_replication;"
```

---

## Troubleshooting

### Frontend Issues

**Problem:** Frontend not responding

```bash
# 1. Check Caddy service status
ssh root@<frontend-vm-ip>
systemctl status caddy

# 2. Check Caddy logs
journalctl -u caddy.service -n 50

# 3. Test if build exists
ls -la /opt/app/frontend/dist

# 4. Rebuild if needed
cd /opt/app/frontend
git pull origin main
npm install
npm run build
systemctl restart caddy

# 5. Check port binding
netstat -tlnp | grep :80
```

**Problem:** 502 Bad Gateway (Backend unreachable)

```bash
# 1. Check backend LB health
curl http://<backend-lb-private-ip>:3001/health

# 2. Check backend service on VMs
ssh root@<backend-vm-ip>
systemctl status backend.service

# 3. Check backend logs
journalctl -u backend.service -n 50

# 4. Verify database connectivity
psql -h <db-ip> -U dbadmin -d appdb -c "SELECT 1;"

# 5. Restart backend if needed
systemctl restart backend.service
```

### Backend Issues

**Problem:** Backend service won't start

```bash
# 1. Check environment variables
cat /opt/app/backend/.env

# 2. Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# 3. Check if port is already in use
netstat -tlnp | grep :3001

# 4. Check for build errors
cd /opt/app/backend
npm run build

# 5. Run manually to see errors
cd /opt/app/backend
node dist/index.js
```

**Problem:** High memory usage

```bash
# 1. Check memory usage
free -h
ps aux --sort=-%mem | head -10

# 2. Check for memory leaks
# Install node memory profiler
npm install -g clinic
clinic doctor -- node dist/index.js

# 3. Restart service
systemctl restart backend.service

# 4. Consider scaling up VM size
```

### Database Issues

**Problem:** High replication lag

```bash
# 1. Check network connectivity
ping <replica-ip>

# 2. Check replication status
psql -h <primary-ip> -U dbadmin -d appdb -c "
  SELECT * FROM pg_stat_replication;"

# 3. Check for long-running queries on primary
psql -h <primary-ip> -U dbadmin -d appdb -c "
  SELECT pid, now() - query_start AS duration, query
  FROM pg_stat_activity
  WHERE state = 'active'
  ORDER BY duration DESC;"

# 4. Kill long-running queries if safe
psql -h <primary-ip> -U dbadmin -d appdb -c "
  SELECT pg_terminate_backend(<pid>);"

# 5. Check disk space
df -h
```

**Problem:** Database connection exhaustion

```bash
# 1. Check current connections
psql -h <db-ip> -U dbadmin -d appdb -c "
  SELECT count(*) FROM pg_stat_activity;"

# 2. Check connection limit
psql -h <db-ip> -U dbadmin -d appdb -c "
  SHOW max_connections;"

# 3. Find idle connections
psql -h <db-ip> -U dbadmin -d appdb -c "
  SELECT pid, usename, application_name, state, query_start
  FROM pg_stat_activity
  WHERE state = 'idle'
  ORDER BY query_start;"

# 4. Kill idle connections (if safe)
psql -h <db-ip> -U dbadmin -d appdb -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
  AND query_start < now() - interval '10 minutes';"

# 5. Implement connection pooling (PgPool or application-level)
```

---

## Runbooks

### Full Disaster Recovery Drill

**Scenario:** Entire Delhi region is lost

**Timeline and Actions:**

```bash
# T+0:00 - Delhi region fails
# [Simulate: terraform destroy in Delhi directory]

# T+0:30 - First health check fails (Route 53)

# T+1:30 - Route 53 marks Delhi unhealthy (after 3 failures)
# Action: Automatic traffic routing to Chennai

# T+2:00 - Verify Chennai is handling all traffic
curl -s http://app.yourdomain.com/health/ | jq .region
# Should return only "chennai"

# T+5:00 - UptimeRobot detects failure, sends webhook
# Action: Review UptimeRobot dashboard

# T+5:00 - Assess situation
# Decision: Promote Chennai DB or wait for Delhi recovery?

# If promoting Chennai DB:
# T+5:01 - Promote Chennai database to primary
ssh postgres@<chennai-db-vm>
pg_ctl promote -D /var/lib/postgresql/data

# T+5:15 - Chennai DB fully promoted
psql -h <chennai-db-ip> -U dbadmin -d appdb -c "
  SELECT pg_is_in_recovery();"
# Returns 'f' (false)

# T+10:00 - Rebuild Delhi infrastructure
cd terraform/delhi
terraform destroy -auto-approve
terraform apply -var-file="../terraform.tfvars" -auto-approve

# T+25:00 - Delhi infrastructure online
terraform output frontend_lb_public_ip

# T+25:00 - Configure Delhi DB as replica of Chennai
# Via E2E DBaaS console or API

# T+30:00 - Delhi catches up with replication
psql -h <delhi-db-ip> -U dbadmin -d appdb -c "
  SELECT now() - pg_last_xact_replay_timestamp() AS lag;"
# Should be < 1 second

# T+30:00 - Re-enable Delhi in Route 53
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch file://restore-delhi.json

# T+30:00 - Traffic resumes 50/50 distribution

# T+35:00 - (Optional) Promote Delhi back to primary
# Only after verifying stability for 24 hours

# Total recovery time: ~30-35 minutes
# Data loss: 0 (assuming replication was up to date)
```

### Planned Maintenance Procedure

**Scenario:** Update application code across both regions

```bash
# 1. Deploy to Chennai first (canary deployment)
ssh root@<chennai-backend-vm>
cd /opt/app
git pull origin main
cd backend
npm install
npm run build
systemctl restart backend.service

# 2. Monitor for errors (5-10 minutes)
journalctl -u backend.service -f
curl http://app.yourdomain.com/api/v1/themes

# 3. If successful, deploy to Delhi
ssh root@<delhi-backend-vm>
cd /opt/app
git pull origin main
cd backend
npm install
npm run build
systemctl restart backend.service

# 4. Verify both regions are healthy
curl http://app.yourdomain.com/health/

# 5. Deploy frontend (repeat same process)
```

### Emergency Rollback

**Scenario:** New deployment caused issues

```bash
# 1. Identify last known good commit
cd /opt/app
git log --oneline -10

# 2. Rollback code
git checkout <last-good-commit>

# 3. Rebuild and restart
cd backend
npm install
npm run build
systemctl restart backend.service

# 4. Verify application is working
curl http://localhost:3001/health

# 5. Repeat for other VMs and regions

# 6. Investigate root cause offline
git diff <last-good-commit> <broken-commit>
```

### Database Backup and Restore

**Creating Manual Backup:**

```bash
# Backup primary database
pg_dump -h <delhi-db-ip> -U dbadmin -d appdb \
  -F c -f /backup/appdb-$(date +%Y%m%d-%H%M%S).backup

# Copy to safe location
scp /backup/appdb-*.backup user@backup-server:/backups/
```

**Restoring from Backup:**

```bash
# Stop backend services
systemctl stop backend.service

# Restore database
pg_restore -h <db-ip> -U dbadmin -d appdb \
  -c /backup/appdb-20241118-120000.backup

# Restart backend services
systemctl start backend.service

# Verify data integrity
psql -h <db-ip> -U dbadmin -d appdb -c "
  SELECT count(*) FROM themes;"
```

---

## Post-Incident Checklist

After any incident or failover drill:

- [ ] Document actual timings (detection, failover, recovery)
- [ ] Review metrics: error rate, latency, throughput, replication lag
- [ ] Note automation gaps and manual interventions required
- [ ] Update runbooks with lessons learned
- [ ] Schedule postmortem meeting (within 48 hours)
- [ ] Create tickets for follow-up improvements
- [ ] Schedule next drill (recommended: quarterly)
- [ ] Update documentation based on findings

---

## Monitoring Dashboard Checklist

**Daily Checks:**

- [ ] UptimeRobot status (all monitors green)
- [ ] Route 53 health checks (both regions healthy)
- [ ] Replication lag (< 1 second)
- [ ] CPU/Memory usage (< 60%)
- [ ] Disk space (> 30% free)

**Weekly Checks:**

- [ ] Review error logs
- [ ] Check backup success
- [ ] Verify SSL certificates validity
- [ ] Review access logs for anomalies
- [ ] Test failover procedure (dry run)

**Monthly Checks:**

- [ ] Full disaster recovery drill
- [ ] Review and update documentation
- [ ] Security updates (OS patches)
- [ ] Capacity planning review
- [ ] Cost optimization review
