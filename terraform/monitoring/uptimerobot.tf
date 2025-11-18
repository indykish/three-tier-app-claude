# UptimeRobot Monitoring Configuration
# Terraform provider for UptimeRobot (free synthetic monitoring)

terraform {
  required_providers {
    uptimerobot = {
      source  = "uptimerobot/uptimerobot"
      version = "~> 1.3.0"
    }
  }
}

provider "uptimerobot" {
  api_key = var.uptimerobot_api_key
}

# Integration - Webhook for automated failover
resource "uptimerobot_integration" "failover_webhook" {
  name                     = "Failover Automation Webhook"
  type                     = "webhook"
  value                    = var.failover_webhook_url
  enable_notifications_for = 2 # Down events only
  ssl_expiration_reminder  = false
}

# Integration - Slack (optional)
resource "uptimerobot_integration" "slack" {
  count                    = var.slack_webhook_url != "" ? 1 : 0
  name                     = "Ops Team Slack"
  type                     = "slack"
  value                    = var.slack_webhook_url
  enable_notifications_for = 1 # All events
  ssl_expiration_reminder  = true
}

# Note: Email notifications are configured directly in UptimeRobot web interface
# The Terraform provider doesn't support email type integrations
# Configure email alerts manually at: Settings > Alert Contacts

# Monitor: Delhi Frontend Load Balancer
resource "uptimerobot_monitor" "delhi_frontend" {
  name     = "Three-Tier Delhi Frontend LB"
  type     = "HTTP"
  url      = "http://${var.delhi_frontend_lb_ip}/health/"
  interval = 300

  # Alert contacts with threshold settings
  assigned_alert_contacts = concat(
    [
      {
        alert_contact_id = uptimerobot_integration.failover_webhook.id
        threshold        = 3
        recurrence       = 0
      }
    ],
    var.slack_webhook_url != "" ? [
      {
        alert_contact_id = uptimerobot_integration.slack[0].id
        threshold        = 1
        recurrence       = 0
      }
    ] : []
  )
}

# Monitor: Chennai Frontend Load Balancer
resource "uptimerobot_monitor" "chennai_frontend" {
  name     = "Three-Tier Chennai Frontend LB"
  type     = "HTTP"
  url      = "http://${var.chennai_frontend_lb_ip}/health/"
  interval = 300

  # Alert contacts with threshold settings
  assigned_alert_contacts = concat(
    [
      {
        alert_contact_id = uptimerobot_integration.failover_webhook.id
        threshold        = 3
        recurrence       = 0
      }
    ],
    var.slack_webhook_url != "" ? [
      {
        alert_contact_id = uptimerobot_integration.slack[0].id
        threshold        = 1
        recurrence       = 0
      }
    ] : []
  )
}

# Note: Backend LBs are internal and cannot be monitored by UptimeRobot
# Backend health is monitored through frontend application responses

# Public Status Page
resource "uptimerobot_psp" "main" {
  name = "Three-Tier App Status"

  monitor_ids = [
    uptimerobot_monitor.delhi_frontend.id,
    uptimerobot_monitor.chennai_frontend.id,
  ]

  # Custom domain (optional)
  # custom_domain = "status.yourdomain.com"
}

# Outputs
output "delhi_frontend_monitor_id" {
  value = uptimerobot_monitor.delhi_frontend.id
}

output "chennai_frontend_monitor_id" {
  value = uptimerobot_monitor.chennai_frontend.id
}

output "status_page_url" {
  value = uptimerobot_psp.main.url_key != "" ? "https://stats.uptimerobot.com/${uptimerobot_psp.main.url_key}" : "Check PSP resource for URL"
}
