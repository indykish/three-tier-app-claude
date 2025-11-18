# Global Variables for E2E Networks Infrastructure

variable "e2e_api_key" {
  description = "E2E Networks API Key for authentication"
  type        = string
  sensitive   = true
}

variable "e2e_auth_token" {
  description = "E2E Networks Auth Token for authentication"
  type        = string
  sensitive   = true
}

variable "project_id" {
  description = "E2E Networks Project ID"
  type        = string
}

variable "ssh_key_name" {
  description = "Name of existing SSH key in E2E Networks account"
  type        = string
  default     = "KishoreMac"
}

variable "image_name" {
  description = "Base OS image for VMs"
  type        = string
  default     = "Ubuntu-24.04"
}

variable "vm_plan" {
  description = "VM plan specification (C3.8GB = 4 vCPU, 8GB RAM, 100GB disk)"
  type        = string
  default     = "C3.8GB"
}

variable "db_plan" {
  description = "DBaaS plan specification"
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
  description = "Database admin username"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}

variable "frontend_port" {
  description = "Port for frontend application"
  type        = number
  default     = 80
}

variable "backend_port" {
  description = "Port for backend API"
  type        = number
  default     = 3001
}

variable "autoscaling_min" {
  description = "Minimum number of instances in autoscaling group"
  type        = number
  default     = 1
}

variable "autoscaling_max" {
  description = "Maximum number of instances in autoscaling group"
  type        = number
  default     = 5
}

variable "vpc_cidr_delhi" {
  description = "CIDR block for Delhi VPC"
  type        = string
  default     = "10.10.0.0/16"
}

variable "vpc_cidr_chennai" {
  description = "CIDR block for Chennai VPC"
  type        = string
  default     = "10.20.0.0/16"
}
