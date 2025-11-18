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
}

variable "image_name" {
  description = "Base OS image for VMs"
  type        = string
}

variable "vm_plan" {
  description = "VM plan specification (C3.8GB = 4 vCPU, 8GB RAM, 100GB disk)"
  type        = string
}

variable "db_plan" {
  description = "DBaaS plan specification"
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
  description = "Database admin username"
  type        = string
}

variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}

variable "frontend_port" {
  description = "Port for frontend application"
  type        = number
}

variable "backend_port" {
  description = "Port for backend API"
  type        = number
}

variable "autoscaling_min" {
  description = "Minimum number of instances in autoscaling group"
  type        = number
}

variable "autoscaling_max" {
  description = "Maximum number of instances in autoscaling group"
  type        = number
}

variable "vpc_cidr_delhi" {
  description = "CIDR block for Delhi VPC"
  type        = string
}

variable "vpc_cidr_chennai" {
  description = "CIDR block for Chennai VPC"
  type        = string
}

variable "github_repo_url" {
  description = "GitHub repository URL for the application"
  type        = string
}
