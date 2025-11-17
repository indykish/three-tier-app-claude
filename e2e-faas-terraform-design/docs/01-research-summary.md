# Research Summary

## E2E Terraform Provider Architecture

### Repository Structure

```
terraform-provider-e2e/
├── .github/workflows/          # CI/CD configuration
├── client/                     # API client implementation
│   └── client.go               # HTTP client with auth
├── constants/                  # Constant definitions
├── docs/                       # Documentation
├── e2e/                        # Resource implementations
│   ├── provider.go             # Provider configuration
│   ├── image/                  # Image data source
│   ├── node/                   # Node resource & data source
│   ├── security_group/         # Security group data source
│   ├── ssh_key/                # SSH key data source
│   └── vpc/                    # VPC data source
├── models/                     # Data models
├── tools/                      # Utility tools
├── main.go                     # Entry point
└── go.mod                      # Go dependencies
```

### Key Patterns Discovered

#### 1. Provider Configuration

```go
func Provider() *schema.Provider {
    return &schema.Provider{
        Schema: map[string]*schema.Schema{
            "api_key": {
                Type:        schema.TypeString,
                Required:    true,
                DefaultFunc: schema.EnvDefaultFunc("SERVICE_API_KEY", nil),
            },
            "auth_token": {
                Type:        schema.TypeString,
                Required:    true,
                DefaultFunc: schema.EnvDefaultFunc("SERVICE_AUTH_TOKEN", nil),
            },
            "api_endpoint": {
                Type:     schema.TypeString,
                Optional: true,
                Default:  "https://api.e2enetworks.com/myaccount/api/v1/",
            },
        },
        ResourcesMap: map[string]*schema.Resource{
            "e2e_node": node.ResourceNode(),
        },
        DataSourcesMap: map[string]*schema.Resource{
            "e2e_node":            node.DataSourceNode(),
            "e2e_images":          image.DataSourceImages(),
            "e2e_security_groups": securitygroup.DataSourceSecurityGroups(),
            "e2e_ssh_keys":        sshkey.DataSourceSshKeys(),
            "e2e_vpcs":            vpc.DataSourceVpcs(),
        },
        ConfigureContextFunc: providerConfigure,
    }
}
```

#### 2. Client Structure

```go
type Client struct {
    Api_key      string
    Auth_token   string
    Api_endpoint string
    HttpClient   *http.Client
}
```

#### 3. HTTP Request Pattern

```go
func (c *Client) SomeAPICall() (interface{}, error) {
    url := c.Api_endpoint + "specific/path"

    req, err := http.NewRequest("METHOD", url, body)
    if err != nil {
        return nil, err
    }

    // Authentication
    req.Header.Add("Authorization", "Bearer "+c.Auth_token)
    req.Header.Add("User-Agent", "terraform-e2e")

    // API key as query parameter
    params := req.URL.Query()
    params.Add("apikey", c.Api_key)
    req.URL.RawQuery = params.Encode()

    resp, err := c.HttpClient.Do(req)
    // ... handle response
}
```

#### 4. Resource CRUD Pattern

```go
func ResourceNode() *schema.Resource {
    return &schema.Resource{
        CreateContext: resourceCreateNode,
        ReadContext:   resourceReadNode,
        UpdateContext: resourceUpdateNode,
        DeleteContext: resourceDeleteNode,

        Schema: map[string]*schema.Schema{
            "name": {
                Type:         schema.TypeString,
                Required:     true,
                ValidateFunc: validateName,
            },
            // ... more fields
        },
    }
}

func resourceReadNode(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
    client := m.(*client.Client)

    // Fetch from API
    nodeResp, err := client.GetNode(d.Id())
    if err != nil {
        return diag.FromErr(err)
    }

    // Update state
    d.Set("name", nodeResp.Name)
    d.Set("status", nodeResp.Status)
    // ...

    return nil
}
```

#### 5. Validation Pattern

```go
func validateName(val interface{}, key string) (warns []string, errs []error) {
    v := val.(string)
    if strings.ContainsAny(v, " ") {
        errs = append(errs, fmt.Errorf("name cannot contain whitespace"))
    }
    return
}
```

---

## E2E FaaS Platform Insights

### Underlying Technology

**Key Discovery**: E2E Networks uses **OpenFaaS** as their FaaS platform backend.

> "E2E Networks Limited is an NSE-listed infrastructure company that uses OpenFaaS to offer their FaaS service alongside VPC, Compute, Object Storage, and Kubernetes services."

### Supported Runtimes

| Runtime | Version | Notes |
|---------|---------|-------|
| Python | 3.11 | Flask, FastAPI, HTTP templates |
| Node.js | 20, 18 | Standard templates |
| C# | .NET 7.0 | Standard templates |
| PHP | 8.2 | Standard templates |
| Go | 1.21 | Standard templates |
| PyTorch | 2.1.2 | ML/AI workloads |
| TensorFlow | 2.19.0 | ML/AI workloads |
| Custom | - | Docker container (linux/amd64) |

### Function Handler Structure

**Python Example:**
```python
def handle(event, context):
    # event contains:
    # - event.body (bytes/JSON)
    # - event.headers (dict)
    # - event.method (string)
    # - event.query (dict)
    # - event.path (string)

    # context contains:
    # - context.hostname

    return {
        "statusCode": 200,
        "body": "Response content",
        "headers": {"key": "value"}  # optional
    }
```

**Node.js Example:**
```javascript
module.exports = async (event, context) => {
    return context.status(200).succeed(result);
};
```

### Configuration Options

- **Memory**: Configurable per function (64MB - 8GB typical)
- **Timeout**: Maximum execution duration (1s - 900s)
- **Replicas**: 1-5 for CPU functions (dedicated replicas)
- **Hardware**: CPU or GPU
- **Environment Variables**: Key-value configuration
- **Requirements**: Package dependencies (requirements.txt, package.json, etc.)

### Function States

```
Deploying → Running
         → Failed (on error)
```

### API Endpoint Pattern

```
https://api.e2enetworks.com/faas/function/v1/{function-name}.{namespace}/
```

Example:
```bash
curl "https://api.e2enetworks.com/faas/function/v1/e2e-function-33711.e2e-faas-20235-dl/?number=5"
```

### OpenFaaS REST API Reference

Since E2E uses OpenFaaS, these endpoints are likely similar:

| Operation | Method | Path |
|-----------|--------|------|
| Deploy Function | PUT | `/system/functions` |
| List Functions | GET | `/system/functions` |
| Get Function | GET | `/system/function/{name}` |
| Update Function | PUT | `/system/functions` |
| Delete Function | DELETE | `/system/functions` |
| Invoke (sync) | POST | `/function/{name}.{namespace}` |
| Invoke (async) | POST | `/async-function/{name}.{namespace}` |
| Create Secret | POST | `/system/secrets` |
| List Secrets | GET | `/system/secrets` |

**Authentication**: Bearer token (`Authorization: Bearer $TOKEN`)

---

## Key Differences from AWS Lambda

| Feature | AWS Lambda | E2E FaaS |
|---------|-----------|----------|
| Trigger Types | Many (API Gateway, S3, SQS, etc.) | HTTP (primary) |
| Cold Starts | Managed by AWS | OpenFaaS handles scaling |
| Code Upload | S3 or inline | Direct upload (ZIP) |
| Layers | Supported | Not mentioned |
| Versioning | Built-in aliases | Not explicitly supported |
| Concurrency | Reserved/Provisioned | Replica count (1-5) |

---

## Implications for Terraform Provider

1. **Single Resource Possible**: Can create monolithic `e2e_faas_function` resource
2. **OpenFaaS Compatibility**: May need to align with OpenFaaS API structures
3. **Code Upload Challenge**: Need to determine exact upload mechanism
4. **Limited Trigger Support**: Focus on HTTP invocation initially
5. **State Management**: Need to track deployment status and wait for completion
