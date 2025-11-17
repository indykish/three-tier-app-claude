# UptimeRobot Monitoring Variables

variable "uptimerobot_api_key" {
  description = "UptimeRobot API key (from My Settings -> API Settings)"
  type        = string
  sensitive   = true
}

variable "delhi_frontend_lb_ip" {
  description = "Delhi frontend load balancer public IP"
  type        = string
}

variable "chennai_frontend_lb_ip" {
  description = "Chennai frontend load balancer public IP"
  type        = string
}

variable "delhi_backend_lb_ip" {
  description = "Delhi backend load balancer public IP"
  type        = string
}

variable "chennai_backend_lb_ip" {
  description = "Chennai backend load balancer public IP"
  type        = string
}

variable "failover_webhook_url" {
  description = "Webhook URL for automated failover (e.g., AWS Lambda, Cloud Function)"
  type        = string
}

variable "slack_webhook_url" {
  description = "Slack incoming webhook URL for alerts (optional)"
  type        = string
  default     = ""
}

variable "ops_email" {
  description = "Operations team email for alerts"
  type        = string
}
