# E2E FaaS Terraform Provider Design

This repository contains the design documentation and reference implementation for adding FaaS (Functions-as-a-Service) support to the E2E Networks Terraform Provider.

## Contents

```
e2e-faas-terraform-design/
├── README.md                           # This file
├── docs/
│   ├── 01-research-summary.md          # Provider and FaaS research findings
│   ├── 02-resource-designs.md          # Proposed Terraform resource designs
│   ├── 03-detailed-design.md           # Detailed design for recommended approach
│   ├── 04-open-questions.md            # Questions requiring clarification
│   └── 05-build-guide.md               # Steps to build and test the provider
├── src/
│   ├── e2e/faas/
│   │   ├── resource_faas_function.go   # Main resource schema
│   │   └── datasource_faas_runtimes.go # Data source for runtimes
│   ├── client/
│   │   └── faas.go                     # API client wrapper
│   └── models/
│       └── faas.go                     # Request/Response structs
├── examples/
│   ├── basic/main.tf                   # Basic function example
│   ├── with-secrets/main.tf            # Function with secrets
│   └── custom-container/main.tf        # Custom container example
└── tests/
    └── resource_faas_function_test.go  # Acceptance tests
```

## Quick Start

1. Review the research summary in `docs/01-research-summary.md`
2. Choose a resource design from `docs/02-resource-designs.md` (Option 4 recommended)
3. Use the reference implementation in `src/` as starting point
4. Follow the build guide in `docs/05-build-guide.md`

## Key Findings

- E2E Networks uses **OpenFaaS** as the underlying FaaS platform
- Provider follows standard Terraform SDK v2 patterns
- Authentication: Bearer token + API key query parameter
- Resource naming: `e2e_<resource_type>`

## Recommended Approach

**Option 4: Hybrid Approach** - Combines simplicity with extensibility

```hcl
resource "e2e_faas_function" "main" {
  name    = "process-orders"
  runtime = "python3.11"

  code_inline = <<-EOF
    def handle(event, context):
        return {"statusCode": 200, "body": "OK"}
  EOF

  config {
    memory_mb       = 512
    timeout_seconds = 60
    replicas        = 3
  }
}
```

## Critical Next Steps

1. **Obtain E2E FaaS API Documentation** - Contact cloud-support@e2enetworks.com
2. **Verify API endpoints** - Confirm actual REST API paths for FaaS management
3. **Test authentication** - Ensure FaaS API uses same auth as other E2E services
4. **Validate code upload mechanism** - Determine how function code is uploaded

## License

This design documentation is provided for reference purposes.
