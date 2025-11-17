# UptimeRobot Synthetic Monitoring

This module sets up free synthetic monitoring for your three-tier application using UptimeRobot.

## Prerequisites

1. **UptimeRobot Account** (free)
   - Sign up at https://uptimerobot.com
   - Go to My Settings → API Settings
   - Create "Main API Key" (read-write)

2. **Infrastructure deployed**
   - Delhi region deployed (get LB IPs)
   - Chennai region deployed (get LB IPs)

3. **Automation endpoint** (for webhook-triggered failover)
   - AWS Lambda, Cloud Function, or any HTTP endpoint
   - Will receive alerts and trigger failover actions

## Setup

1. Copy variables:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Fill in values:
```hcl
uptimerobot_api_key   = "u1234567-abc123def456..."
delhi_frontend_lb_ip  = "103.x.x.x"  # From delhi terraform output
chennai_frontend_lb_ip = "103.x.x.x"  # From chennai terraform output
delhi_backend_lb_ip   = "103.x.x.x"
chennai_backend_lb_ip = "103.x.x.x"
failover_webhook_url  = "https://your-automation/webhook"
slack_webhook_url     = "https://hooks.slack.com/services/..."  # Optional
ops_email             = "ops@yourcompany.com"
```

3. Deploy:
```bash
terraform init
terraform plan
terraform apply
```

## What Gets Created

1. **4 Monitors**:
   - Delhi Frontend LB (HTTP /health/)
   - Chennai Frontend LB (HTTP /health/)
   - Delhi Backend API (HTTP /health)
   - Chennai Backend API (HTTP /health)

2. **Alert Contacts**:
   - Webhook (for automation)
   - Email (for ops team)
   - Slack (optional)

3. **Status Page**:
   - Public URL showing your app status
   - Useful for customers

## How It Works

1. UptimeRobot checks your endpoints every 5 minutes
2. If Delhi Frontend fails 3 times → webhook triggered
3. Your automation endpoint receives alert
4. Automation can:
   - Call E2E Networks API to promote Chennai DB
   - Send additional notifications
   - Log the incident

## UptimeRobot Alternatives (with Terraform)

### Freshping (Better Stack)
```hcl
# No official Terraform provider
# Use HTTP provider with their API
```

### StatusCake
```hcl
terraform {
  required_providers {
    statuscake = {
      source  = "StatusCakeDev/statuscake"
      version = "~> 2.0"
    }
  }
}
```

### Datadog (Paid, but comprehensive)
```hcl
terraform {
  required_providers {
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.0"
    }
  }
}
```

## Free Tier Limitations

- **5-minute intervals** (minimum)
- **50 monitors** (more than enough)
- **No custom keyword checks** (HTTP status only)
- **Limited alert contacts**

## Upgrading to Paid

If 5-minute checks are too slow:

- **Solo Plan ($7/mo)**: 1-minute checks
- **Starter Plan ($15/mo)**: 1-minute + more monitors
- **Pro Plan ($27/mo)**: 30-second checks (SMS alerts included)

Recommendation: Start with free tier, upgrade if faster failover needed.

## Testing

After deployment:

1. Check UptimeRobot dashboard
2. Verify all monitors show "Up"
3. Test webhook:
   - Temporarily stop Delhi frontend
   - Wait for alert
   - Verify webhook received
   - Restart Delhi frontend

## Common Issues

1. **Monitor shows Down but service is up**
   - Check firewall rules
   - Verify health endpoint is accessible from internet
   - UptimeRobot uses multiple locations (US, EU, Asia)

2. **Webhook not triggered**
   - Check alert contact threshold (default: 3 failures)
   - Verify webhook URL is correct
   - Check UptimeRobot logs

3. **API key invalid**
   - Regenerate key in UptimeRobot settings
   - Ensure it's the "Main API Key", not "Monitor-Specific"
