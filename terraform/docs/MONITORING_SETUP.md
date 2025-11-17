# Monitoring & Automatic Failover Setup

## Recommended Stack

1. **UptimeRobot** - Free synthetic monitoring (50 monitors)
2. **PgPool-II** - Database connection proxy with auto-failover
3. **AWS Lambda or E2E Functions** - Webhook handler for automated actions
4. **Slack/PagerDuty** - Alerting

---

## 1. UptimeRobot Setup (Free Tier)

### Create Account
1. Sign up at https://uptimerobot.com
2. Verify email

### Create Monitors

#### Monitor 1: Delhi Frontend
```
Monitor Type: HTTP(s)
Friendly Name: Delhi Frontend LB
URL: http://<DELHI_FRONTEND_LB_IP>/health/
Monitoring Interval: 5 minutes (free tier)
Monitor Timeout: 30 seconds
```

#### Monitor 2: Chennai Frontend
```
Monitor Type: HTTP(s)
Friendly Name: Chennai Frontend LB
URL: http://<CHENNAI_FRONTEND_LB_IP>/health/
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

#### Monitor 3: Delhi Backend (if accessible)
```
Monitor Type: HTTP(s)
Friendly Name: Delhi Backend Health
URL: http://<DELHI_BACKEND_LB_IP>:3001/health
Monitoring Interval: 5 minutes
```

#### Monitor 4: Chennai Backend
```
Monitor Type: HTTP(s)
Friendly Name: Chennai Backend Health
URL: http://<CHENNAI_BACKEND_LB_IP>:3001/health
Monitoring Interval: 5 minutes
```

### Configure Alert Contacts

1. Go to **My Settings** → **Alert Contacts**
2. Add contacts:
   - **Email**: Your ops team email
   - **Slack**: Webhook integration
   - **Webhook**: For automated failover

### Webhook Configuration

Create a webhook alert contact:
```
Contact Type: Webhook
Friendly Name: Failover Automation
URL: https://your-automation-endpoint/uptimerobot-webhook
POST Value:
{
  "monitorID": "*monitorID*",
  "monitorFriendlyName": "*monitorFriendlyName*",
  "alertType": "*alertTypeFriendlyName*",
  "alertDetails": "*alertDetails*",
  "monitorURL": "*monitorURL*"
}
```

---

## 2. Database Proxy Architecture

### Why PgPool-II?

**Without Proxy:**
```
Backend → postgresql://delhi-db-ip:5432/db
         (Must change when failover happens)
```

**With Proxy:**
```
Backend → postgresql://pgpool-ip:5432/db
         (Never changes, proxy handles routing)
```

### PgPool-II Features for Our Use Case

1. **Connection Pooling**: Reduces DB connections
2. **Load Balancing**: Distributes read queries
3. **Automatic Failover**: Detects primary failure
4. **Health Checking**: Monitors both primary and replica
5. **Read/Write Splitting**: Reads from replica, writes to primary

### Deployment Options

#### Option A: Dedicated PgPool VMs (Recommended)
- Deploy PgPool VM in each region
- Each connects to both databases
- Regional backend uses local PgPool
- PgPool handles cross-region routing

```
Delhi Backend → Delhi PgPool → {Delhi Primary OR Chennai Replica}
Chennai Backend → Chennai PgPool → {Delhi Primary OR Chennai Replica}
```

#### Option B: PgPool on Backend VMs
- Install PgPool alongside each backend
- Each backend has local proxy
- Less network hops but more resource usage

---

## 3. Complete Automated Failover Flow

### Scenario: Delhi Region Failure

```
Time 0:00 - Delhi LB stops responding
           ↓
Time 0:05 - UptimeRobot detects failure (5-min check)
           ↓
Time 0:05 - UptimeRobot sends webhook
           ↓
Time 0:05 - Lambda/Cloud Function triggers
           ↓
Time 0:06 - Function calls E2E API to promote Chennai DB
           ↓
Time 0:10 - PgPool detects new primary (health check)
           ↓
Time 0:10 - PgPool redirects writes to Chennai
           ↓
Time 0:10 - Route 53 health check fails for Delhi
           ↓
Time 0:15 - Route 53 routes 100% traffic to Chennai
           ↓
Time ~0:15 - FULL FAILOVER COMPLETE
```

**Total failover time: ~15 minutes** (can be reduced with paid monitoring)

### Faster Failover Options

1. **Paid UptimeRobot**: 1-minute checks = ~5 min failover
2. **StatusCake Pro**: 30-second checks = ~3 min failover
3. **Custom monitoring**: Sub-minute checks = <2 min failover

---

## 4. Alternative Monitoring Services

### Free Options

| Service | Free Monitors | Min Interval | Webhooks |
|---------|--------------|--------------|----------|
| **UptimeRobot** | 50 | 5 min | Yes |
| **Freshping** | 50 | 1 min | Yes |
| **StatusCake** | 10 | 5 min | Yes |
| **Hetrix Tools** | 15 | 1 min | Yes |
| **Better Uptime** | 10 | 3 min | Yes |

### Recommendation Priority

1. **Freshping** - Best free tier (1-min checks)
2. **UptimeRobot** - Most popular, reliable
3. **Better Uptime** - Good UI, incident management

---

## 5. E2E Networks API for DB Promotion

### Check E2E Networks Documentation

The automated failover script needs to call E2E Networks API to promote the replica. Check their API documentation for:

1. **Database promotion endpoint**
2. **Authentication requirements**
3. **Rate limits**

Example API call (hypothetical):
```bash
curl -X POST "https://api.e2enetworks.com/myaccount/api/v1/dbaas/postgresql/<db-id>/actions" \
  -H "Authorization: Bearer <token>" \
  -H "api_key: <api-key>" \
  -d '{"action": "promote_to_primary"}'
```

### If API Promotion Not Available

If E2E Networks doesn't support API-based promotion:

1. **Manual promotion** via console (not ideal)
2. **SSH into replica** and run promotion command
3. **Use Patroni** for automatic promotion (self-managed)

---

## 6. Patroni: Full Automatic HA (Advanced)

If E2E Networks DBaaS doesn't support automatic promotion, consider self-managed PostgreSQL with Patroni.

### Patroni Architecture

```
                    ┌─────────────┐
                    │    etcd     │
                    │  (Cluster)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
        │  Patroni  │ │  Patroni  │ │  Patroni  │
        │  Delhi-1  │ │  Delhi-2  │ │ Chennai-1 │
        │ (Leader)  │ │ (Replica) │ │ (Replica) │
        └───────────┘ └───────────┘ └───────────┘
```

### Patroni Benefits

- **Automatic leader election**
- **Automatic failover** (no external trigger needed)
- **Automatic replica promotion**
- **Split-brain protection**
- **REST API** for management

### Patroni Drawbacks

- **Complex setup** (etcd cluster required)
- **Self-managed** (no DBaaS benefits)
- **Operational overhead**

---

## 7. Recommended Hybrid Approach

### For Your Use Case

1. **Use E2E DBaaS** (simpler management)
2. **Deploy PgPool-II** (connection proxy)
3. **Use UptimeRobot/Freshping** (monitoring)
4. **Implement webhook automation** (failover trigger)
5. **Test failover quarterly** (operational readiness)

### Implementation Steps

1. Deploy infrastructure as currently designed
2. Add PgPool VMs to each region
3. Update backend configs to use PgPool
4. Set up monitoring service
5. Create automation webhook handler
6. Configure alerting
7. Test complete failover scenario

---

## 8. Quick Start: Minimal Automation

If you want to start simple:

1. **UptimeRobot** (free, 5-min checks)
2. **No PgPool** (manual connection updates)
3. **Webhook + Email alert** (semi-automated)
4. **Manual DB promotion** via E2E console

Then gradually add:
- PgPool for connection management
- Faster monitoring (paid tier)
- Fully automated promotion via API

This gives you observability first, then automation incrementally.
