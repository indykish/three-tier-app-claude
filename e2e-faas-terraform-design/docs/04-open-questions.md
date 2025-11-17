# Open Questions Requiring Clarification

## Critical (Blockers)

These questions must be answered before implementation can proceed:

### 1. API Documentation

**Question:** Does E2E Networks have official REST API documentation for FaaS management (not just function invocation)?

**Context:** The public documentation only shows UI-based management and function invocation. No programmatic API for creating/managing functions is documented.

**Action:** Contact cloud-support@e2enetworks.com or check developer portal for API specs.

**Impact:** Without API docs, all endpoint paths and request/response structures are estimates based on OpenFaaS patterns.

---

### 2. Authentication Mechanism

**Question:** How does the FaaS API authenticate?
- Same Bearer token + API key as other E2E services?
- OpenFaaS-specific authentication?
- Different endpoint entirely?

**Context:** Current E2E provider uses:
```
Authorization: Bearer <auth_token>
Query param: apikey=<api_key>
```

**Action:** Verify with E2E Networks if FaaS uses same auth or requires separate credentials.

**Impact:** Incorrect auth will cause all API calls to fail.

---

### 3. Namespace Management

**Question:** Does E2E expose namespace creation via API, or are namespaces auto-created per user?

**Context:** Function URLs include namespace: `process-orders.e2e-faas-20235-dl`

**Possible scenarios:**
- Namespace is auto-created for each user account
- Namespace is created when FaaS plan is activated
- Users can create multiple namespaces

**Action:** Test namespace behavior in E2E MyAccount.

**Impact:** Determines if `e2e_faas_namespace` resource is needed or if it's just user's default namespace.

---

### 4. Code Upload Mechanism

**Question:** What's the exact mechanism for uploading function code?

**Possible methods:**
- Direct file upload to FaaS API (multipart/form-data)
- Base64-encoded in JSON body
- Pre-upload to S3/Object Storage, then reference URL
- Git repository reference
- Container image reference (for custom runtime)

**Context:** E2E docs mention ZIP upload in UI but no API documentation.

**Action:** Inspect network traffic when uploading via UI, or contact support.

**Impact:** Core functionality - without this, cannot create functions programmatically.

---

### 5. API Base Path

**Question:** What is the correct FaaS management API base path?

**Candidates:**
```
https://api.e2enetworks.com/faas/api/v1/
https://api.e2enetworks.com/myaccount/api/v1/faas/
https://faas.api.e2enetworks.com/system/
Direct OpenFaaS gateway access
```

**Context:**
- Function invocation: `https://api.e2enetworks.com/faas/function/v1/`
- Other E2E APIs: `https://api.e2enetworks.com/myaccount/api/v1/`

**Action:** Test API endpoints or check with E2E support.

**Impact:** Wrong base path = 404 errors on all requests.

---

## Important (Design Decisions)

These questions affect design choices but have reasonable defaults:

### 6. Async Deployment Handling

**Question:** How to handle long-running deployments?
- Polling interval (default: 10 seconds?)
- Maximum wait time (default: 10 minutes?)
- Status endpoint available?
- Webhook/callback support?

**Default approach:** Polling with exponential backoff, 10-minute timeout.

---

### 7. Version Management

**Question:** Does E2E track function versions, or just current state?

**Possibilities:**
- Full version history with rollback
- Just current version number
- No versioning at all

**Default approach:** Store version as computed attribute, no version resource.

---

### 8. GPU Functions

**Question:** Are there different API endpoints or constraints for GPU vs CPU functions?

**Considerations:**
- Different replica limits (GPU may not support multiple replicas)
- Different memory constraints
- Different pricing/availability

**Default approach:** Single `hardware_type` field, same API endpoints.

---

### 9. Custom Containers

**Question:** What's the API for custom container image deployments?

**Needed info:**
- How to specify image URL
- Registry authentication
- Image requirements (must be linux/amd64)
- Health check configuration

**Default approach:** `runtime = "custom"` with `image` field.

---

### 10. Rate Limits

**Question:** Are there specific rate limits for FaaS API?

**Context:** General E2E API is 5000 requests/hour.

**Impact:** Need to implement rate limit handling in client.

**Default approach:** Use same rate limit as other E2E APIs.

---

## Nice to Have (Future Features)

These questions relate to advanced features:

### 11. Triggers/Events

**Question:** Does E2E support triggers beyond HTTP?

**Possible triggers:**
- Cron/scheduled invocations
- Object Storage events
- Queue/message triggers
- Webhook triggers

**Impact:** May add `e2e_faas_trigger` resource later.

---

### 12. Monitoring Integration

**Question:** Can metrics be retrieved via API?

**Desired metrics:**
- Invocation count
- Error rate
- Latency (p50, p95, p99)
- Memory usage
- CPU usage

**Impact:** Add metrics to computed attributes or data source.

---

### 13. Log Streaming

**Question:** Can logs be retrieved via API?

**Needed info:**
- Log format
- Retention period
- Filtering capabilities
- Real-time streaming

**Impact:** May add `e2e_faas_function_logs` data source.

---

### 14. Cold Start Behavior

**Question:** How does E2E handle cold starts?

**Considerations:**
- Scale-to-zero support
- Minimum instances
- Warm-up period

**Impact:** May need `min_scale` configuration.

---

### 15. Function Limits

**Question:** What are the limits per account?

**Possible limits:**
- Max functions per namespace
- Max code size
- Max environment variables
- Max secrets per function

**Impact:** Need to document limits and validate in provider.

---

## Information Gathering Strategy

### Method 1: Contact E2E Support

```
To: cloud-support@e2enetworks.com
Subject: FaaS REST API Documentation Request

Hi,

I'm developing Terraform provider support for E2E FaaS. I need:

1. REST API documentation for function management (CRUD operations)
2. Authentication requirements for FaaS API
3. Code upload mechanism details
4. API endpoint paths

Is there official API documentation available?

Thanks
```

### Method 2: Network Traffic Analysis

1. Open browser DevTools (Network tab)
2. Go to MyAccount FaaS UI
3. Perform operations (create, update, delete function)
4. Capture API requests:
   - HTTP method
   - Endpoint path
   - Request headers
   - Request body
   - Response body

### Method 3: Reverse Engineering

1. Check if OpenFaaS gateway is directly accessible
2. Look for Swagger/OpenAPI specs at common paths:
   - `/swagger.json`
   - `/api/docs`
   - `/openapi.json`

3. Test known OpenFaaS endpoints against E2E infrastructure

### Method 4: Community Resources

- Check E2E Networks developer forum
- Search GitHub for existing integrations
- Look for Python/Node SDKs for E2E FaaS
- Review E2E blog posts for API hints
