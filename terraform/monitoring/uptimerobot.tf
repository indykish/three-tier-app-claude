# UptimeRobot Monitoring Configuration
# Terraform provider for UptimeRobot (free synthetic monitoring)

terraform {
  required_providers {
    uptimerobot = {
      source  = "louy/uptimerobot"
      version = "~> 0.5"
    }
  }
}

provider "uptimerobot" {
  api_key = var.uptimerobot_api_key
}

# Alert Contact - Webhook for automated failover
resource "uptimerobot_alert_contact" "failover_webhook" {
  friendly_name = "Failover Automation Webhook"
  type          = "webhook"
  value         = var.failover_webhook_url
}

# Alert Contact - Slack (optional)
resource "uptimerobot_alert_contact" "slack" {
  count         = var.slack_webhook_url != "" ? 1 : 0
  friendly_name = "Ops Team Slack"
  type          = "slack"
  value         = var.slack_webhook_url
}

# Alert Contact - Email
resource "uptimerobot_alert_contact" "email" {
  friendly_name = "Ops Team Email"
  type          = "email"
  value         = var.ops_email
}

# Monitor: Delhi Frontend Load Balancer
resource "uptimerobot_monitor" "delhi_frontend" {
  friendly_name = "Three-Tier Delhi Frontend LB"
  type          = "http"
  url           = "http://${var.delhi_frontend_lb_ip}/health/"

  # Check every 5 minutes (free tier)
  interval = 300

  # Alert after 3 failed checks
  alert_contact {
    id         = uptimerobot_alert_contact.failover_webhook.id
    threshold  = 3
    recurrence = 0
  }

  alert_contact {
    id         = uptimerobot_alert_contact.email.id
    threshold  = 1
    recurrence = 0
  }

  dynamic "alert_contact" {
    for_each = var.slack_webhook_url != "" ? [1] : []
    content {
      id         = uptimerobot_alert_contact.slack[0].id
      threshold  = 1
      recurrence = 0
    }
  }

}

# Monitor: Chennai Frontend Load Balancer
resource "uptimerobot_monitor" "chennai_frontend" {
  friendly_name = "Three-Tier Chennai Frontend LB"
  type          = "http"
  url           = "http://${var.chennai_frontend_lb_ip}/health/"

  interval = 300

  alert_contact {
    id         = uptimerobot_alert_contact.failover_webhook.id
    threshold  = 3
    recurrence = 0
  }

  alert_contact {
    id         = uptimerobot_alert_contact.email.id
    threshold  = 1
    recurrence = 0
  }

  dynamic "alert_contact" {
    for_each = var.slack_webhook_url != "" ? [1] : []
    content {
      id         = uptimerobot_alert_contact.slack[0].id
      threshold  = 1
      recurrence = 0
    }
  }
}

# Monitor: Delhi Backend API
resource "uptimerobot_monitor" "delhi_backend" {
  friendly_name = "Three-Tier Delhi Backend API"
  type          = "http"
  url           = "http://${var.delhi_backend_lb_ip}:3001/health"

  interval = 300

  alert_contact {
    id         = uptimerobot_alert_contact.email.id
    threshold  = 1
    recurrence = 0
  }
}

# Monitor: Chennai Backend API
resource "uptimerobot_monitor" "chennai_backend" {
  friendly_name = "Three-Tier Chennai Backend API"
  type          = "http"
  url           = "http://${var.chennai_backend_lb_ip}:3001/health"

  interval = 300

  alert_contact {
    id         = uptimerobot_alert_contact.email.id
    threshold  = 1
    recurrence = 0
  }
}

# Status Page (public status page for your app)
resource "uptimerobot_status_page" "main" {
  friendly_name = "Three-Tier App Status"

  monitors = [
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
  value = "https://stats.uptimerobot.com/${uptimerobot_status_page.main.id}"
}
