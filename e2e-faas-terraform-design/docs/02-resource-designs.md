# Proposed Terraform Resource Designs


## Hybrid Approach (RECOMMENDED)


### Example Usage

```hcl
# Core function resource
resource "e2e_faas_function" "main" {
  name     = "process-orders"
  runtime  = "python3.11"
  template = "http"  # http, flask, fastapi

  code_path = "./function"  # Directory with handler.py + requirements.txt
  # OR
  code_archive = "./function.zip"
  # OR
  code_inline = <<-EOF
    def handle(event, context):
        return {"statusCode": 200, "body": "OK"}
  EOF

  config {
    memory_mb       = 512
    timeout_seconds = 60
    replicas        = 3
    hardware_type   = "cpu"
  }

  environment = {
    LOG_LEVEL = "INFO"
    DB_HOST   = "db.example.com"
  }

  secrets = ["api-key", "db-password"]

  labels = {
    team    = "backend"
    version = "1.0"
  }
}

# Optional: Separate secret management
resource "e2e_faas_secret" "db_pass" {
  name  = "db-password"
  value = sensitive(var.db_password)
}

# Data source for available runtimes
data "e2e_faas_runtimes" "available" {}

output "function_url" {
  value = e2e_faas_function.main.invoke_url
}

output "available_runtimes" {
  value = data.e2e_faas_runtimes.available.runtimes
}
```

### Resources

- `e2e_faas_function` (main resource)
- `e2e_faas_secret` (optional, for reusable secrets)
- Data source: `e2e_faas_runtimes`

### Pros

- Simple main resource (easy to start)
- Flexible code input (inline, path, archive)
- Optional secret resource for reuse
- Config block keeps related settings together
- Room for future expansion
- Balances simplicity and power

### Cons

- Slightly more complex than Option 1
- Secrets can be either inline (environment) or separate resource
- Need to document both patterns clearly

---


| Feature | Hybrid |
|---------|-----------|
| Simplicity | ⭐⭐⭐⭐ |
| Flexibility | ⭐⭐⭐⭐ |
| AWS Lambda-like | ⭐⭐⭐⭐ |
| OpenFaaS-aligned | ⭐⭐⭐⭐ |
| E2E UI-aligned | ⭐⭐⭐⭐ |
| Learning Curve | Low–Medium |
| Resources Count | 2–3 |
| Future

---


### Implementation Phases

1. **Phase 1** (MVP): Basic `e2e_faas_function` with inline code
2. **Phase 2**: Add ZIP/directory upload support
3. **Phase 3**: Add `e2e_faas_secret` resource
4. **Phase 5**: Add advanced features (triggers, logs, metrics)
