# Delhi Region Variables

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
  default     = "KishoreMac"
}

variable "image_name" {
  description = "Base OS image"
  type        = string
  default     = "Ubuntu-24.04"
}

variable "vm_plan" {
  description = "VM plan (C3.8GB)"
  type        = string
  default     = "C3.8GB"
}

variable "db_plan" {
  description = "DBaaS plan"
  type        = string
  default     = "DBS.8GB"
}

variable "db_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "16"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "appdb"
}

variable "db_user" {
  description = "Database user"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "frontend_port" {
  description = "Frontend port"
  type        = number
  default     = 80
}

variable "backend_port" {
  description = "Backend API port"
  type        = number
  default     = 3001
}

variable "autoscaling_min" {
  description = "Min instances"
  type        = number
  default     = 1
}

variable "autoscaling_max" {
  description = "Max instances"
  type        = number
  default     = 5
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.10.0.0/16"
}

variable "github_repo_url" {
  description = "GitHub repository URL for the application"
  type        = string
  default     = "https://github.com/indykish/three-tier-app-claude.git"
}

variable "primary_db_ip" {
  description = "Primary database IP (for replica connection)"
  type        = string
  default     = ""
}

variable "is_primary_region" {
  description = "Whether this is the primary region for database"
  type        = bool
  default     = true
}
