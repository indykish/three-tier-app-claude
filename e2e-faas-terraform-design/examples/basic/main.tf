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

# Basic inline Python function
resource "e2e_faas_function" "hello_world" {
  name    = "hello-world"
  runtime = "python3.11"

  code_inline = <<-EOF
    def handle(event, context):
        """Simple hello world function"""
        name = event.get("query", {}).get("name", "World")

        return {
            "statusCode": 200,
            "body": f"Hello, {name}! Welcome to E2E FaaS.",
            "headers": {
                "X-Function-Name": "hello-world"
            }
        }
  EOF

  config {
    memory_mb       = 128
    timeout_seconds = 30
    replicas        = 1
    hardware_type   = "cpu"
  }

  environment = {
    LOG_LEVEL = "INFO"
  }

  labels = {
    environment = "production"
    team        = "platform"
    managed_by  = "terraform"
  }
}

# Output the function details
output "function_id" {
  description = "The ID of the created function"
  value       = e2e_faas_function.hello_world.id
}

output "function_url" {
  description = "The invocation URL of the function"
  value       = e2e_faas_function.hello_world.invoke_url
}

output "function_status" {
  description = "Current status of the function"
  value       = e2e_faas_function.hello_world.status
}

output "test_command" {
  description = "Command to test the function"
  value       = "curl '${e2e_faas_function.hello_world.invoke_url}?name=Terraform'"
}
