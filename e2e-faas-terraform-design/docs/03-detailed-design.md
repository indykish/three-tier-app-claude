# Detailed Design: Option 4 (Hybrid Approach)

## Resource: `e2e_faas_function`

### Arguments (Required)

| Argument | Type | Description | Validation |
|----------|------|-------------|------------|
| `name` | string | Function name | Lowercase alphanumeric, hyphens, 3-63 chars |
| `runtime` | string | Runtime identifier | Must be valid runtime (python3.11, node20, etc.) |

### Arguments (Optional)

| Argument | Type | Default | Description |
|----------|------|---------|-------------|
| `template` | string | `"http"` | Template type (http, flask, fastapi) |
| `code_path` | string | - | Path to directory containing function code |
| `code_archive` | string | - | Path to ZIP file |
| `code_inline` | string | - | Inline function code |
| `handler_function` | string | `"handle"` | Entry point function name |
| `requirements` | string | - | Inline requirements (requirements.txt content) |
| `config` | block | - | Configuration block (see below) |
| `environment` | map(string) | `{}` | Environment variables |
| `secrets` | list(string) | `[]` | Secret names to bind |
| `labels` | map(string) | `{}` | Metadata labels |
| `annotations` | map(string) | `{}` | Function annotations |

### Config Block

| Argument | Type | Default | Range | Description |
|----------|------|---------|-------|-------------|
| `memory_mb` | number | `128` | 64-8192 | Memory allocation in MB |
| `timeout_seconds` | number | `30` | 1-900 | Execution timeout |
| `replicas` | number | `1` | 1-5 | Number of replicas (CPU only) |
| `hardware_type` | string | `"cpu"` | cpu, gpu | Hardware type |
| `min_scale` | number | `1` | 0-100 | Minimum scale (future) |
| `max_scale` | number | `5` | 1-100 | Maximum scale (future) |

### Attributes (Computed)

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | string | Function ID (UUID or composite) |
| `invoke_url` | string | Function invocation URL |
| `status` | string | Function status (Deploying, Running, Failed) |
| `version` | string | Current deployed version |
| `created_at` | string | Creation timestamp (RFC3339) |
| `updated_at` | string | Last update timestamp (RFC3339) |
| `invocation_count` | number | Total invocations (if available) |
| `namespace` | string | Function namespace |

### Import Format

```bash
# By function ID
terraform import e2e_faas_function.my_func <function_id>

# By name and namespace (if supported)
terraform import e2e_faas_function.my_func <function_name>.<namespace>

# Example
terraform import e2e_faas_function.my_func 12345678-1234-1234-1234-123456789012
terraform import e2e_faas_function.my_func my-function.e2e-faas-20235-dl
```

### Validation Rules

```go
// Name validation
regexp.MustCompile(`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`)
// Length: 3-63 characters

// Runtime validation
[]string{
    "python3.11", "node20", "node18", "csharp7.0",
    "php8.2", "go1.21", "pytorch2.1.2", "tensorflow2.19.0",
    "custom",
}

// Template validation
[]string{"http", "flask", "fastapi", "node", "go"}

// Hardware type validation
[]string{"cpu", "gpu"}

// Memory range
64 <= memory_mb <= 8192

// Timeout range
1 <= timeout_seconds <= 900

// Replicas range
1 <= replicas <= 5

// Code source mutual exclusivity
ConflictsWith: code_path, code_archive, code_inline (only one can be set)
```

---

## CRUD Operations

### Create Operation

**Flow:**

1. **Validate input** - Check name, runtime, code source
2. **Package code** - ZIP if directory/inline, validate archive
3. **Build request** - Construct API request payload
4. **Call API** - `POST /faas/api/v1/functions`
5. **Wait for deployment** - Poll until status is "Running"
6. **Store state** - Save function ID, invoke URL, etc.

**API Request (Estimated):**

```json
POST /faas/api/v1/functions
{
  "name": "process-orders",
  "runtime": "python3.11",
  "template": "http",
  "handler_function": "handle",
  "code_archive": "<base64-encoded-zip>",
  "requirements": "requests==2.31.0",
  "config": {
    "memory_mb": 512,
    "timeout_seconds": 60,
    "replicas": 3,
    "hardware_type": "cpu"
  },
  "environment": {
    "LOG_LEVEL": "INFO"
  },
  "secrets": ["api-key", "db-password"],
  "labels": {
    "team": "backend"
  }
}
```

**Expected Response:**

```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "name": "process-orders",
  "namespace": "e2e-faas-20235-dl",
  "status": "Deploying",
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Wait Logic:**

```go
func waitForFunctionStatus(ctx context.Context, client *Client, id, targetStatus string, timeout time.Duration) error {
    return resource.RetryContext(ctx, timeout, func() *resource.RetryError {
        funcResp, err := client.GetFaaSFunction(id)
        if err != nil {
            return resource.NonRetryableError(err)
        }

        if funcResp.Status == "Failed" {
            return resource.NonRetryableError(fmt.Errorf("function deployment failed: %s", funcResp.ErrorMessage))
        }

        if funcResp.Status != targetStatus {
            return resource.RetryableError(fmt.Errorf("function status is %s, waiting for %s", funcResp.Status, targetStatus))
        }

        return nil
    })
}
```

### Read Operation

**Flow:**

1. **Get function ID** - From Terraform state
2. **Call API** - `GET /faas/api/v1/functions/{id}`
3. **Handle not found** - If 404, clear state (resource deleted externally)
4. **Update state** - Set all attributes from response

**API Request:**

```
GET /faas/api/v1/functions/12345678-1234-1234-1234-123456789012
```

**Expected Response:**

```json
{
  "id": "12345678-1234-1234-1234-123456789012",
  "name": "process-orders",
  "namespace": "e2e-faas-20235-dl",
  "runtime": "python3.11",
  "template": "http",
  "invoke_url": "https://api.e2enetworks.com/faas/function/v1/process-orders.e2e-faas-20235-dl/",
  "status": "Running",
  "version": "v1.2.3",
  "config": {
    "memory_mb": 512,
    "timeout_seconds": 60,
    "replicas": 3,
    "hardware_type": "cpu"
  },
  "environment": {
    "LOG_LEVEL": "INFO"
  },
  "secrets": ["api-key", "db-password"],
  "labels": {
    "team": "backend"
  },
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T11:45:00Z"
}
```

### Update Operation

**Flow:**

1. **Detect changes** - Use `d.HasChange()` for each attribute
2. **Update code** - If code_inline/code_archive/code_path changed
3. **Update config** - If memory/timeout/replicas changed
4. **Update environment** - If environment/secrets changed
5. **Wait for redeployment** - Poll until status is "Running"
6. **Refresh state** - Read updated attributes

**Partial Updates:**

```go
if d.HasChange("code_inline") || d.HasChange("code_archive") || d.HasChange("code_path") || d.HasChange("requirements") {
    // PUT /faas/api/v1/functions/{id}/code
}

if d.HasChange("config") {
    // PUT /faas/api/v1/functions/{id}/config
}

if d.HasChange("environment") || d.HasChange("secrets") {
    // PUT /faas/api/v1/functions/{id}/environment
}

if d.HasChange("labels") || d.HasChange("annotations") {
    // PUT /faas/api/v1/functions/{id}/metadata
}
```

### Delete Operation

**Flow:**

1. **Get function ID** - From Terraform state
2. **Call API** - `DELETE /faas/api/v1/functions/{id}`
3. **Handle not found** - If already deleted, succeed silently
4. **Wait for deletion** - Poll until function no longer exists
5. **Clear state** - Remove from Terraform state

**Wait Logic:**

```go
func waitForFunctionDeleted(ctx context.Context, client *Client, id string, timeout time.Duration) error {
    return resource.RetryContext(ctx, timeout, func() *resource.RetryError {
        _, err := client.GetFaaSFunction(id)
        if err != nil {
            if isNotFoundError(err) {
                return nil // Successfully deleted
            }
            return resource.NonRetryableError(err)
        }

        return resource.RetryableError(fmt.Errorf("function still exists"))
    })
}
```

---

## API Endpoints (Estimated)

Based on OpenFaaS patterns adapted for E2E:

```
Base: https://api.e2enetworks.com/faas/api/v1/

# Function Management
POST   /functions                      # Create function
GET    /functions                      # List all functions
GET    /functions/{id}                 # Get function details
PUT    /functions/{id}                 # Update function (full)
DELETE /functions/{id}                 # Delete function

# Partial Updates
PUT    /functions/{id}/code            # Update code only
PUT    /functions/{id}/config          # Update config only
PUT    /functions/{id}/environment     # Update env/secrets
PUT    /functions/{id}/metadata        # Update labels/annotations

# Operations
POST   /functions/{id}/deploy          # Trigger redeployment
POST   /functions/{id}/scale           # Scale replicas
GET    /functions/{id}/logs            # Get function logs
GET    /functions/{id}/metrics         # Get invocation metrics

# Secrets (separate resource)
POST   /secrets                        # Create secret
GET    /secrets                        # List secrets
DELETE /secrets/{name}                 # Delete secret

# Runtimes (data source)
GET    /runtimes                       # List available runtimes
```

---

## Resource: `e2e_faas_secret`

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Secret name (alphanumeric, hyphens) |
| `value` | string (sensitive) | Yes | Secret value |
| `namespace` | string | No | Namespace (default: user namespace) |

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `id` | string | Secret ID |
| `created_at` | string | Creation timestamp |

### Example

```hcl
resource "e2e_faas_secret" "db_password" {
  name  = "db-password"
  value = sensitive(var.db_password)
}

resource "e2e_faas_function" "app" {
  name    = "my-app"
  runtime = "python3.11"

  # Reference the secret
  secrets = [e2e_faas_secret.db_password.name]

  code_inline = <<-EOF
    import os

    def handle(event, context):
        db_pass = os.environ.get("db-password")
        # Use the secret...
  EOF
}
```

---

## Data Source: `e2e_faas_runtimes`

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `filter_hardware` | string | No | Filter by hardware type (cpu, gpu) |

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `runtimes` | list(object) | Available runtimes |
| `runtimes.name` | string | Runtime name |
| `runtimes.version` | string | Runtime version |
| `runtimes.templates` | list(string) | Available templates |
| `runtimes.hardware` | list(string) | Supported hardware types |

### Example

```hcl
data "e2e_faas_runtimes" "available" {}

output "python_runtimes" {
  value = [for r in data.e2e_faas_runtimes.available.runtimes : r if startswith(r.name, "python")]
}

# Use in validation
resource "e2e_faas_function" "app" {
  name    = "my-app"
  runtime = data.e2e_faas_runtimes.available.runtimes[0].name

  code_inline = "def handle(event, context): return {'statusCode': 200}"
}
```

---

## State Management

### Terraform State Structure

```json
{
  "version": 4,
  "terraform_version": "1.5.0",
  "resources": [
    {
      "mode": "managed",
      "type": "e2e_faas_function",
      "name": "main",
      "provider": "provider[\"registry.terraform.io/e2eterraformprovider/e2e\"]",
      "instances": [
        {
          "schema_version": 0,
          "attributes": {
            "id": "12345678-1234-1234-1234-123456789012",
            "name": "process-orders",
            "runtime": "python3.11",
            "template": "http",
            "code_inline": "def handle(event, context): ...",
            "handler_function": "handle",
            "config": [
              {
                "memory_mb": 512,
                "timeout_seconds": 60,
                "replicas": 3,
                "hardware_type": "cpu"
              }
            ],
            "environment": {
              "LOG_LEVEL": "INFO"
            },
            "secrets": ["api-key"],
            "labels": {
              "team": "backend"
            },
            "invoke_url": "https://api.e2enetworks.com/faas/function/v1/process-orders.e2e-faas-20235-dl/",
            "status": "Running",
            "version": "v1.2.3",
            "created_at": "2025-01-15T10:30:00Z",
            "updated_at": "2025-01-15T11:45:00Z"
          }
        }
      ]
    }
  ]
}
```

### Drift Detection

The Read operation will detect:
- Configuration changes made outside Terraform
- Status changes (Running → Failed)
- Version updates
- Deleted functions

### Force New vs Update

**Force New (recreate):**
- `name` - Changing name creates new function
- `runtime` - Changing runtime requires new deployment
- `hardware_type` - Changing CPU ↔ GPU

**Update in Place:**
- `code_inline`, `code_archive`, `code_path`
- `config.memory_mb`, `config.timeout_seconds`, `config.replicas`
- `environment`
- `secrets`
- `labels`, `annotations`
