# Proposed Terraform Resource Designs

## Option 1: Monolithic Function Resource

Similar to AWS Lambda's approach - single resource that manages the complete function lifecycle.

### Example Usage

```hcl
resource "e2e_faas_function" "my_func" {
  name        = "my-python-function"
  runtime     = "python3.11"
  handler     = "handler.handle"

  code_zip_path   = "./function.zip"
  # OR
  code_inline     = "def handle(event, context): return {'statusCode': 200}"

  memory_mb       = 256
  timeout_seconds = 30

  environment_variables = {
    API_KEY = "secret123"
  }

  requirements = "requests==2.31.0\nnumpy==1.24.0"

  replicas = 2  # CPU only, 1-5

  hardware_type = "cpu"  # or "gpu"
}
```

### Resources

- `e2e_faas_function` (main)
- `e2e_faas_function_secret` (for sensitive data)

### Pros

- Simple, single resource
- Mirrors AWS Lambda pattern - familiar to users
- Easy to adopt and understand
- Less complexity in state management

### Cons

- Large resource schema
- Less granular control
- Secrets mixed with function definition
- All-or-nothing updates

---

## Option 2: Decomposed Resources (OpenFaaS-aligned)

Closer to OpenFaaS API structure with separate concerns.

### Example Usage

```hcl
resource "e2e_faas_namespace" "ns" {
  name = "production"
}

resource "e2e_faas_function" "my_func" {
  namespace_id = e2e_faas_namespace.ns.id
  name         = "my-function"
  image        = "ghcr.io/myorg/myfunction:latest"  # For custom containers
  runtime      = "python3.11"  # For templates

  constraints  = ["hardware=cpu"]
}

resource "e2e_faas_function_config" "config" {
  function_id = e2e_faas_function.my_func.id

  memory_mb       = 256
  timeout_seconds = 30
  replicas        = 2

  environment = {
    DEBUG = "true"
  }
}

resource "e2e_faas_secret" "api_key" {
  namespace = e2e_faas_namespace.ns.name
  name      = "api-key"
  value     = sensitive("secret123")
}

resource "e2e_faas_function_secret_binding" "binding" {
  function_id = e2e_faas_function.my_func.id
  secret_name = e2e_faas_secret.api_key.name
}
```

### Resources

- `e2e_faas_namespace`
- `e2e_faas_function`
- `e2e_faas_function_config`
- `e2e_faas_secret`
- `e2e_faas_function_secret_binding`

### Pros

- Maximum flexibility
- Matches OpenFaaS model directly
- Reusable secrets across functions
- Granular control over each aspect
- Easier to update individual components

### Cons

- More complex to use
- Higher learning curve
- More resources to manage
- Complex dependency chains
- Verbose configurations

---

## Option 3: Template-First Approach

Focus on E2E's template system (Python/Node/Go templates).

### Example Usage

```hcl
data "e2e_faas_runtime" "python" {
  name    = "python3.11"
  variant = "flask"  # flask, fastapi, http
}

resource "e2e_faas_function" "api" {
  name       = "my-api"
  runtime_id = data.e2e_faas_runtime.python.id

  source_dir = "./src"

  build_config {
    requirements_file = "requirements.txt"
    handler_file      = "handler.py"
    handler_function  = "handle"
  }

  deploy_config {
    memory_mb = 256
    timeout   = 30
    replicas  = 2
  }

  environment = {
    LOG_LEVEL = "INFO"
  }
}

output "api_url" {
  value = e2e_faas_function.api.invoke_url
}
```

### Resources

- `e2e_faas_function`
- Data source: `e2e_faas_runtime`

### Pros

- Matches E2E UI workflow
- Intuitive for E2E users
- Clear separation of build vs deploy config
- Template discovery via data source

### Cons

- Less flexible for advanced use cases
- Tied to template system
- May not support custom containers well
- Limited to E2E-specific patterns

---

## Option 4: Hybrid Approach (RECOMMENDED)

Combines simplicity of Option 1 with extensibility of Option 2.

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

## Comparison Matrix

| Feature | Option 1 | Option 2 | Option 3 | Option 4 |
|---------|----------|----------|----------|----------|
| Simplicity | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Flexibility | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| AWS Lambda-like | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| OpenFaaS-aligned | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| E2E UI-aligned | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Learning Curve | Low | High | Medium | Low-Medium |
| Resources Count | 1-2 | 4-5 | 1-2 | 2-3 |
| Future-proof | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Recommendation

**Option 4 (Hybrid Approach)** is recommended because:

1. **Easy to start**: Single resource for basic use cases
2. **Room to grow**: Can add more resources as needed
3. **Familiar patterns**: Similar to AWS Lambda but not overly complex
4. **Flexible code input**: Supports inline, directory, and archive
5. **Clean configuration**: Config block groups related settings
6. **Optional complexity**: Secrets can be inline or separate resource

### Implementation Phases

1. **Phase 1** (MVP): Basic `e2e_faas_function` with inline code
2. **Phase 2**: Add ZIP/directory upload support
3. **Phase 3**: Add `e2e_faas_secret` resource
4. **Phase 4**: Add `e2e_faas_runtimes` data source
5. **Phase 5**: Add advanced features (triggers, logs, metrics)
