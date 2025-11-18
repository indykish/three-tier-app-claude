# UptimeRobot Monitoring Variables
# These values are automatically pulled from Delhi and Chennai outputs

variable "uptimerobot_api_key" {
  description = "UptimeRobot API key (from My Settings -> API Settings)"
  type        = string
  sensitive   = true
}

variable "delhi_frontend_lb_ip" {
  description = "Delhi frontend load balancer public IP (from Delhi output)"
  type        = string
}

variable "chennai_frontend_lb_ip" {
  description = "Chennai frontend load balancer public IP (from Chennai output)"
  type        = string
}

variable "failover_webhook_url" {
  description = "Webhook URL for automated failover (e.g., AWS Lambda, Cloud Function)"
  type        = string
  default     = "https://example.com/webhook"  # Replace with your actual webhook
}

variable "slack_webhook_url" {
  description = "Slack incoming webhook URL for alerts (optional)"
  type        = string
  default     = ""
}

# Note: Backend LBs are internal and cannot be monitored by UptimeRobot
# Note: Email alerts are configured manually in UptimeRobot web interface
