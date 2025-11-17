# Build Guide: E2E FaaS Terraform Provider

## Prerequisites

- Go 1.19+ installed
- Terraform CLI 1.0+ installed
- Git
- E2E Networks account with FaaS activated
- API key and Auth token from E2E MyAccount

---

## Step 1: Fork and Clone Repository

```bash
# Fork https://github.com/e2eterraformprovider/terraform-provider-e2e on GitHub

# Clone your fork
git clone https://github.com/YOUR_USERNAME/terraform-provider-e2e.git
cd terraform-provider-e2e

# Add upstream remote
git remote add upstream https://github.com/e2eterraformprovider/terraform-provider-e2e.git

# Create feature branch
git checkout -b feature/faas-support
```

---

## Step 2: Set Up Development Environment

```bash
# Verify Go installation
go version
# Should be 1.19 or later

# Install dependencies
go mod download

# Verify Terraform
terraform version
# Should be 1.0 or later

# Set environment variables (for testing)
export SERVICE_API_KEY="your-e2e-api-key"
export SERVICE_AUTH_TOKEN="your-e2e-auth-token"
```

---

## Step 3: Create Directory Structure

```bash
# Create FaaS resource directory
mkdir -p e2e/faas

# Create necessary files
touch e2e/faas/resource_faas_function.go
touch e2e/faas/datasource_faas_runtimes.go
touch client/faas.go
touch models/faas.go

# Verify structure
tree e2e/faas/
# e2e/faas/
# ├── datasource_faas_runtimes.go
# └── resource_faas_function.go
```

---

## Step 4: Implement Models

Edit `models/faas.go`:

```go
package models

// Add to existing models.go or create new file

// FaaSFunctionCreateRequest for creating a function
type FaaSFunctionCreateRequest struct {
    Name            string                 `json:"name"`
    Runtime         string                 `json:"runtime"`
    Template        string                 `json:"template,omitempty"`
    HandlerFunction string                 `json:"handler_function,omitempty"`
    CodeInline      string                 `json:"code_inline,omitempty"`
    CodeArchive     string                 `json:"code_archive,omitempty"`
    Requirements    string                 `json:"requirements,omitempty"`
    Config          *FaaSFunctionConfig    `json:"config,omitempty"`
    Environment     map[string]string      `json:"environment,omitempty"`
    Secrets         []string               `json:"secrets,omitempty"`
    Labels          map[string]string      `json:"labels,omitempty"`
    Annotations     map[string]string      `json:"annotations,omitempty"`
}

// FaaSFunctionConfig configuration settings
type FaaSFunctionConfig struct {
    MemoryMB       int    `json:"memory_mb"`
    TimeoutSeconds int    `json:"timeout_seconds"`
    Replicas       int    `json:"replicas"`
    HardwareType   string `json:"hardware_type"`
}

// FaaSFunctionResponse from API
type FaaSFunctionResponse struct {
    ID           string                 `json:"id"`
    Name         string                 `json:"name"`
    Namespace    string                 `json:"namespace"`
    Runtime      string                 `json:"runtime"`
    Template     string                 `json:"template"`
    InvokeURL    string                 `json:"invoke_url"`
    Status       string                 `json:"status"`
    Version      string                 `json:"version"`
    ErrorMessage string                 `json:"error_message,omitempty"`
    Config       *FaaSFunctionConfig    `json:"config"`
    Environment  map[string]string      `json:"environment"`
    Secrets      []string               `json:"secrets"`
    Labels       map[string]string      `json:"labels"`
    CreatedAt    string                 `json:"created_at"`
    UpdatedAt    string                 `json:"updated_at"`
}

// ... add other structs from reference implementation
```

---

## Step 5: Implement Client Methods

Edit `client/faas.go` (or add to `client/client.go`):

```go
package client

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"

    "github.com/e2eterraformprovider/terraform-provider-e2e/models"
)

const faasAPIPath = "faas/api/v1/"

// CreateFaaSFunction creates a new function
func (c *Client) CreateFaaSFunction(req *models.FaaSFunctionCreateRequest) (*models.FaaSFunctionResponse, error) {
    // Implementation from reference
}

// GetFaaSFunction gets function by ID
func (c *Client) GetFaaSFunction(id string) (*models.FaaSFunctionResponse, error) {
    // Implementation from reference
}

// UpdateFaaSFunctionCode updates function code
func (c *Client) UpdateFaaSFunctionCode(id string, req *models.FaaSFunctionCodeUpdateRequest) (*models.FaaSFunctionResponse, error) {
    // Implementation from reference
}

// DeleteFaaSFunction deletes a function
func (c *Client) DeleteFaaSFunction(id string) error {
    // Implementation from reference
}

// ListFaaSRuntimes lists available runtimes
func (c *Client) ListFaaSRuntimes() ([]models.FaaSRuntime, error) {
    // Implementation
}
```

---

## Step 6: Implement Resource Schema

Edit `e2e/faas/resource_faas_function.go`:

```go
package faas

import (
    "context"
    "regexp"
    "time"

    "github.com/hashicorp/terraform-plugin-sdk/v2/diag"
    "github.com/hashicorp/terraform-plugin-sdk/v2/helper/resource"
    "github.com/hashicorp/terraform-plugin-sdk/v2/helper/schema"
    "github.com/hashicorp/terraform-plugin-sdk/v2/helper/validation"

    "github.com/e2eterraformprovider/terraform-provider-e2e/client"
)

func ResourceFaaSFunction() *schema.Resource {
    return &schema.Resource{
        CreateContext: resourceFaaSFunctionCreate,
        ReadContext:   resourceFaaSFunctionRead,
        UpdateContext: resourceFaaSFunctionUpdate,
        DeleteContext: resourceFaaSFunctionDelete,

        Importer: &schema.ResourceImporter{
            StateContext: schema.ImportStatePassthroughContext,
        },

        Timeouts: &schema.ResourceTimeout{
            Create: schema.DefaultTimeout(10 * time.Minute),
            Update: schema.DefaultTimeout(10 * time.Minute),
            Delete: schema.DefaultTimeout(5 * time.Minute),
        },

        Schema: map[string]*schema.Schema{
            // ... full schema from reference implementation
        },
    }
}

// CRUD implementations
func resourceFaaSFunctionCreate(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
    // Implementation from reference
}

func resourceFaaSFunctionRead(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
    // Implementation from reference
}

func resourceFaaSFunctionUpdate(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
    // Implementation from reference
}

func resourceFaaSFunctionDelete(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
    // Implementation from reference
}

// Helper functions
func waitForFunctionStatus(ctx context.Context, client *client.Client, id, targetStatus string, timeout time.Duration) error {
    // Implementation from reference
}
```

---

## Step 7: Register Resource in Provider

Edit `e2e/provider.go`:

```go
package e2e

import (
    // ... existing imports
    "github.com/e2eterraformprovider/terraform-provider-e2e/e2e/faas"
)

func Provider() *schema.Provider {
    return &schema.Provider{
        Schema: map[string]*schema.Schema{
            // ... existing schema
        },

        ResourcesMap: map[string]*schema.Resource{
            "e2e_node":          node.ResourceNode(),
            "e2e_faas_function": faas.ResourceFaaSFunction(),  // ADD THIS
        },

        DataSourcesMap: map[string]*schema.Resource{
            "e2e_node":            node.DataSourceNode(),
            "e2e_images":          image.DataSourceImages(),
            "e2e_security_groups": securitygroup.DataSourceSecurityGroups(),
            "e2e_ssh_keys":        sshkey.DataSourceSshKeys(),
            "e2e_vpcs":            vpc.DataSourceVpcs(),
            "e2e_faas_runtimes":   faas.DataSourceFaaSRuntimes(),  // ADD THIS
        },

        ConfigureContextFunc: providerConfigure,
    }
}
```

---

## Step 8: Build Provider Binary

```bash
# Format code
go fmt ./...

# Run static analysis
go vet ./...

# Build the provider
go build -o terraform-provider-e2e

# Verify binary was created
ls -la terraform-provider-e2e
```

---

## Step 9: Install Provider Locally

```bash
# Determine your OS and architecture
go env GOOS GOARCH
# Example: linux amd64

# Create local plugin directory
mkdir -p ~/.terraform.d/plugins/registry.terraform.io/e2eterraformprovider/e2e/99.0.0/linux_amd64/

# Adjust path based on your OS:
# - darwin_amd64 (Mac Intel)
# - darwin_arm64 (Mac M1/M2)
# - windows_amd64 (Windows)
# - linux_amd64 (Linux)

# Copy binary
cp terraform-provider-e2e ~/.terraform.d/plugins/registry.terraform.io/e2eterraformprovider/e2e/99.0.0/linux_amd64/

# Make executable
chmod +x ~/.terraform.d/plugins/registry.terraform.io/e2eterraformprovider/e2e/99.0.0/linux_amd64/terraform-provider-e2e
```

---

## Step 10: Create Test Configuration

```bash
# Create test directory
mkdir -p test-faas
cd test-faas
```

Create `test-faas/main.tf`:

```hcl
terraform {
  required_providers {
    e2e = {
      source  = "e2eterraformprovider/e2e"
      version = "99.0.0"  # Local development version
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

resource "e2e_faas_function" "test" {
  name    = "terraform-test-function"
  runtime = "python3.11"

  code_inline = <<-EOF
    def handle(event, context):
        name = event.get("query", {}).get("name", "World")
        return {
            "statusCode": 200,
            "body": f"Hello, {name}! This function was created by Terraform."
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
    managed_by = "terraform"
    environment = "test"
  }
}

output "function_id" {
  value = e2e_faas_function.test.id
}

output "function_url" {
  value = e2e_faas_function.test.invoke_url
}

output "function_status" {
  value = e2e_faas_function.test.status
}
```

Create `test-faas/terraform.tfvars` (gitignore this!):

```hcl
api_key    = "your-actual-api-key"
auth_token = "your-actual-auth-token"
```

---

## Step 11: Test CRUD Operations

```bash
# Initialize Terraform
terraform init

# Expected output:
# Initializing the backend...
# Initializing provider plugins...
# - Finding e2eterraformprovider/e2e versions matching "99.0.0"...
# - Installing e2eterraformprovider/e2e v99.0.0...

# Validate configuration
terraform validate

# Plan (tests Read/validation)
terraform plan

# Apply (tests Create)
terraform apply
# Review the plan, type 'yes' to confirm

# Verify outputs
terraform output function_url

# Test the function
curl "$(terraform output -raw function_url)?name=Terraform"

# Make changes (tests Update)
# Edit main.tf - change memory_mb to 256
terraform apply

# Show state
terraform state show e2e_faas_function.test

# Destroy (tests Delete)
terraform destroy
```

---

## Step 12: Write Acceptance Tests

Create `e2e/faas/resource_faas_function_test.go`:

```go
package faas

import (
    "fmt"
    "testing"

    "github.com/hashicorp/terraform-plugin-sdk/v2/helper/resource"
    "github.com/hashicorp/terraform-plugin-sdk/v2/terraform"
)

func TestAccFaaSFunction_basic(t *testing.T) {
    resource.Test(t, resource.TestCase{
        PreCheck:     func() { testAccPreCheck(t) },
        Providers:    testAccProviders,
        CheckDestroy: testAccCheckFaaSFunctionDestroy,
        Steps: []resource.TestStep{
            {
                Config: testAccFaaSFunctionConfig_basic(),
                Check: resource.ComposeTestCheckFunc(
                    testAccCheckFaaSFunctionExists("e2e_faas_function.test"),
                    resource.TestCheckResourceAttr("e2e_faas_function.test", "name", "acc-test-function"),
                    resource.TestCheckResourceAttr("e2e_faas_function.test", "runtime", "python3.11"),
                    resource.TestCheckResourceAttrSet("e2e_faas_function.test", "invoke_url"),
                    resource.TestCheckResourceAttr("e2e_faas_function.test", "status", "Running"),
                ),
            },
        },
    })
}

func TestAccFaaSFunction_update(t *testing.T) {
    resource.Test(t, resource.TestCase{
        PreCheck:     func() { testAccPreCheck(t) },
        Providers:    testAccProviders,
        CheckDestroy: testAccCheckFaaSFunctionDestroy,
        Steps: []resource.TestStep{
            {
                Config: testAccFaaSFunctionConfig_basic(),
                Check: resource.ComposeTestCheckFunc(
                    resource.TestCheckResourceAttr("e2e_faas_function.test", "config.0.memory_mb", "128"),
                ),
            },
            {
                Config: testAccFaaSFunctionConfig_updated(),
                Check: resource.ComposeTestCheckFunc(
                    resource.TestCheckResourceAttr("e2e_faas_function.test", "config.0.memory_mb", "256"),
                ),
            },
        },
    })
}

func testAccFaaSFunctionConfig_basic() string {
    return `
resource "e2e_faas_function" "test" {
    name    = "acc-test-function"
    runtime = "python3.11"

    code_inline = "def handle(event, context): return {'statusCode': 200, 'body': 'test'}"

    config {
        memory_mb = 128
        timeout_seconds = 30
        replicas = 1
        hardware_type = "cpu"
    }
}
`
}

func testAccFaaSFunctionConfig_updated() string {
    return `
resource "e2e_faas_function" "test" {
    name    = "acc-test-function"
    runtime = "python3.11"

    code_inline = "def handle(event, context): return {'statusCode': 200, 'body': 'updated'}"

    config {
        memory_mb = 256
        timeout_seconds = 60
        replicas = 2
        hardware_type = "cpu"
    }
}
`
}

func testAccCheckFaaSFunctionExists(n string) resource.TestCheckFunc {
    return func(s *terraform.State) error {
        rs, ok := s.RootModule().Resources[n]
        if !ok {
            return fmt.Errorf("not found: %s", n)
        }
        if rs.Primary.ID == "" {
            return fmt.Errorf("no ID set")
        }
        return nil
    }
}

func testAccCheckFaaSFunctionDestroy(s *terraform.State) error {
    // Check that function no longer exists
    return nil
}
```

Run tests:

```bash
# Set credentials
export SERVICE_API_KEY="your-api-key"
export SERVICE_AUTH_TOKEN="your-auth-token"

# Run acceptance tests
TF_ACC=1 go test ./e2e/faas/ -v -timeout 30m

# Run specific test
TF_ACC=1 go test ./e2e/faas/ -v -run TestAccFaaSFunction_basic -timeout 30m
```

---

## Step 13: Create Documentation

Create `docs/resources/faas_function.md`:

```markdown
# e2e_faas_function Resource

Manages a FaaS (Function-as-a-Service) function on E2E Networks.

## Example Usage

### Basic Inline Function

\`\`\`hcl
resource "e2e_faas_function" "hello" {
  name    = "hello-world"
  runtime = "python3.11"

  code_inline = <<-EOF
    def handle(event, context):
        return {
            "statusCode": 200,
            "body": "Hello, World!"
        }
  EOF

  config {
    memory_mb       = 128
    timeout_seconds = 30
  }
}
\`\`\`

### Function with ZIP Archive

\`\`\`hcl
resource "e2e_faas_function" "api" {
  name         = "my-api"
  runtime      = "node20"
  code_archive = "./function.zip"

  config {
    memory_mb       = 256
    timeout_seconds = 60
    replicas        = 2
  }

  environment = {
    NODE_ENV = "production"
  }
}
\`\`\`

## Argument Reference

- `name` - (Required) Function name. Must be lowercase alphanumeric with hyphens.
- `runtime` - (Required) Runtime environment. See supported runtimes below.
- `code_inline` - (Optional) Inline function code.
- `code_archive` - (Optional) Path to ZIP archive.
- `code_path` - (Optional) Path to directory containing function code.
- `config` - (Optional) Configuration block:
  - `memory_mb` - Memory allocation in MB (default: 128)
  - `timeout_seconds` - Execution timeout (default: 30)
  - `replicas` - Number of replicas, 1-5 (default: 1)
  - `hardware_type` - `cpu` or `gpu` (default: cpu)

...
```

---

## Step 14: Version and Release

```bash
# Commit changes
git add .
git commit -m "Add FaaS function resource support"

# Tag version
git tag v1.1.0

# Push to fork
git push origin feature/faas-support
git push origin v1.1.0

# Create pull request to upstream
# Or maintain as separate fork
```

---

## Step 15: Publish to Terraform Registry (Optional)

1. **Configure GoReleaser** - Update `.goreleaser.yml`
2. **Sign with GPG** - Required for registry verification
3. **Create GitHub Release** - From tagged version
4. **Register on Terraform Registry** - https://registry.terraform.io

---

## Debugging Tips

### Enable Terraform Debug Logs

```bash
export TF_LOG=DEBUG
terraform apply
```

### Add Provider Debug Logging

```go
log.Printf("[DEBUG] Creating FaaS function: %s", req.Name)
log.Printf("[DEBUG] API response: %+v", resp)
```

### Inspect State

```bash
terraform state list
terraform state show e2e_faas_function.test
terraform state pull > state.json
```

### Common Issues

1. **404 Not Found**: Check API endpoint path
2. **401 Unauthorized**: Verify auth token and API key
3. **Timeout**: Increase timeout values
4. **State Drift**: Run `terraform refresh`

---

## Next Steps After Basic Implementation

1. **Add Secret Resource** - `e2e_faas_secret`
2. **Add Runtimes Data Source** - `e2e_faas_runtimes`
3. **Add Import Support** - Test import functionality
4. **Add Examples** - More usage examples
5. **Add Validation** - More robust input validation
6. **Add Error Handling** - Better error messages
7. **Add Retry Logic** - Handle transient failures
8. **Add Documentation** - Complete docs for registry
