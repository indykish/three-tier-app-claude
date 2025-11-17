terraform {
  required_providers {
    e2e = {
      source  = "e2eterraformprovider/e2e"
      version = ">= 1.0.0"
    }
  }
}

provider "e2e" {
  api_key    = var.api_key
  auth_token = var.auth_token
}

variable "api_key" {
  description = "E2E API Key"
  type        = string
  sensitive   = true
}

variable "auth_token" {
  description = "E2E Auth Token"
  type        = string
  sensitive   = true
}

variable "container_image" {
  description = "Custom container image URL"
  type        = string
  default     = "ghcr.io/myorg/my-custom-function:latest"
}

# Custom container function
resource "e2e_faas_function" "custom_app" {
  name    = "custom-container-app"
  runtime = "custom"

  # For custom runtime, specify the container image
  # Note: Image must be linux/amd64 compatible and publicly accessible
  # OR configure private registry credentials

  code_inline = <<-EOF
    # This is a placeholder for custom container deployment
    # The actual code is in the container image
    # Container must expose port 8080 and respond to:
    # - GET /health for health checks
    # - POST / for function invocation
  EOF

  config {
    memory_mb       = 512
    timeout_seconds = 120
    replicas        = 3
    hardware_type   = "cpu"
  }

  environment = {
    CONTAINER_IMAGE = var.container_image
    LOG_LEVEL       = "INFO"
    APP_ENV         = "production"
  }

  labels = {
    environment = "production"
    team        = "platform"
    app         = "custom-container"
    version     = "1.0.0"
  }

  annotations = {
    "custom-runtime"        = "true"
    "container-image"       = var.container_image
    "maintainer"            = "platform-team@example.com"
  }
}

# Data source to list available runtimes
data "e2e_faas_runtimes" "all" {}

# Filter only CPU runtimes
data "e2e_faas_runtimes" "cpu_only" {
  filter_hardware = "cpu"
}

# Outputs
output "function_url" {
  value = e2e_faas_function.custom_app.invoke_url
}

output "function_status" {
  value = e2e_faas_function.custom_app.status
}

output "available_runtimes" {
  value = data.e2e_faas_runtimes.all.runtimes
}

output "cpu_runtimes" {
  value = data.e2e_faas_runtimes.cpu_only.runtimes
}

output "python_runtimes" {
  value = [
    for r in data.e2e_faas_runtimes.all.runtimes : r
    if startswith(r.name, "python")
  ]
}
