# Chennai Region Variables

variable "e2e_api_key" {
  description = "E2E Networks API Key"
  type        = string
  sensitive   = true
}

variable "e2e_auth_token" {
  description = "E2E Networks Auth Token"
  type        = string
  sensitive   = true
}

variable "project_id" {
  description = "E2E Networks Project ID"
  type        = string
}

variable "ssh_key_name" {
  description = "SSH key name in E2E account"
  type        = string
}

variable "image_name" {
  description = "Base OS image"
  type        = string
}

variable "vm_plan" {
  description = "VM plan (C3.8GB)"
  type        = string
}

variable "db_plan" {
  description = "DBaaS plan"
  type        = string
}

variable "db_version" {
  description = "PostgreSQL version"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_user" {
  description = "Database user"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "frontend_port" {
  description = "Frontend port"
  type        = number
}

variable "backend_port" {
  description = "Backend API port"
  type        = number
}

variable "autoscaling_min" {
  description = "Min instances"
  type        = number
}

variable "autoscaling_max" {
  description = "Max instances"
  type        = number
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "github_repo_url" {
  description = "GitHub repository URL for the application"
  type        = string
}

# Critical: Delhi primary database information for replication
variable "delhi_db_primary_ip" {
  description = "Delhi primary database IP for replication and write operations"
  type        = string
}

variable "delhi_db_primary_id" {
  description = "Delhi primary database instance ID for replica setup"
  type        = string
}

variable "is_primary_region" {
  description = "Whether this is the primary region for database"
  type        = bool
  default     = false
}
