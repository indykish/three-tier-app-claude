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

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "external_api_key" {
  description = "External API key"
  type        = string
  sensitive   = true
}

# Create secrets
resource "e2e_faas_secret" "db_password" {
  name  = "db-password"
  value = sensitive(var.db_password)
}

resource "e2e_faas_secret" "external_api_key" {
  name  = "external-api-key"
  value = sensitive(var.external_api_key)
}

# Function that uses secrets
resource "e2e_faas_function" "data_processor" {
  name    = "data-processor"
  runtime = "python3.11"

  code_inline = <<-EOF
    import os
    import json

    def handle(event, context):
        """Process data using secrets"""

        # Access secrets from environment
        db_pass = os.environ.get("db-password", "")
        api_key = os.environ.get("external-api-key", "")

        # Verify secrets are available (don't log actual values!)
        secrets_available = bool(db_pass and api_key)

        # Parse request body
        try:
            body = json.loads(event.get("body", "{}"))
        except json.JSONDecodeError:
            return {
                "statusCode": 400,
                "body": {"error": "Invalid JSON body"}
            }

        # Process data (example)
        result = {
            "message": "Data processed successfully",
            "secrets_configured": secrets_available,
            "input_keys": list(body.keys()) if isinstance(body, dict) else [],
            "timestamp": context.get("hostname", "unknown")
        }

        return {
            "statusCode": 200,
            "body": result
        }
  EOF

  requirements = <<-EOF
    requests==2.31.0
    python-dateutil==2.8.2
  EOF

  config {
    memory_mb       = 256
    timeout_seconds = 60
    replicas        = 2
    hardware_type   = "cpu"
  }

  environment = {
    LOG_LEVEL   = "INFO"
    DB_HOST     = "db.example.com"
    DB_PORT     = "5432"
    DB_NAME     = "myapp"
  }

  # Bind the secrets to this function
  secrets = [
    e2e_faas_secret.db_password.name,
    e2e_faas_secret.external_api_key.name,
  ]

  labels = {
    environment = "production"
    team        = "data-platform"
    tier        = "backend"
  }

  annotations = {
    "prometheus.io/scrape" = "true"
    "prometheus.io/port"   = "8080"
  }
}

# Outputs
output "function_url" {
  value = e2e_faas_function.data_processor.invoke_url
}

output "secrets_created" {
  value = [
    e2e_faas_secret.db_password.name,
    e2e_faas_secret.external_api_key.name,
  ]
}

output "test_command" {
  value = "curl -X POST '${e2e_faas_function.data_processor.invoke_url}' -H 'Content-Type: application/json' -d '{\"key\": \"value\"}'"
}
