package models

// FaaSFunctionCreateRequest for creating a new function
type FaaSFunctionCreateRequest struct {
	Name            string                 `json:"name"`
	Runtime         string                 `json:"runtime"`
	Template        string                 `json:"template,omitempty"`
	HandlerFunction string                 `json:"handler_function,omitempty"`
	CodeInline      string                 `json:"code_inline,omitempty"`
	CodeArchive     string                 `json:"code_archive,omitempty"` // Base64 encoded ZIP
	Requirements    string                 `json:"requirements,omitempty"`
	Config          *FaaSFunctionConfig    `json:"config,omitempty"`
	Environment     map[string]string      `json:"environment,omitempty"`
	Secrets         []string               `json:"secrets,omitempty"`
	Labels          map[string]string      `json:"labels,omitempty"`
	Annotations     map[string]string      `json:"annotations,omitempty"`
}

// FaaSFunctionConfig for function configuration settings
type FaaSFunctionConfig struct {
	MemoryMB       int    `json:"memory_mb"`
	TimeoutSeconds int    `json:"timeout_seconds"`
	Replicas       int    `json:"replicas"`
	HardwareType   string `json:"hardware_type"`
	MinScale       int    `json:"min_scale,omitempty"`
	MaxScale       int    `json:"max_scale,omitempty"`
}

// FaaSFunctionResponse from API
type FaaSFunctionResponse struct {
	ID              string                 `json:"id"`
	Name            string                 `json:"name"`
	Namespace       string                 `json:"namespace"`
	Runtime         string                 `json:"runtime"`
	Template        string                 `json:"template"`
	HandlerFunction string                 `json:"handler_function"`
	InvokeURL       string                 `json:"invoke_url"`
	Status          string                 `json:"status"` // Deploying, Running, Failed
	Version         string                 `json:"version"`
	ErrorMessage    string                 `json:"error_message,omitempty"`
	Config          *FaaSFunctionConfig    `json:"config"`
	Environment     map[string]string      `json:"environment"`
	Secrets         []string               `json:"secrets"`
	Labels          map[string]string      `json:"labels"`
	Annotations     map[string]string      `json:"annotations"`
	CreatedAt       string                 `json:"created_at"`
	UpdatedAt       string                 `json:"updated_at"`
	InvocationCount int64                  `json:"invocation_count,omitempty"`
}

// FaaSFunctionCodeUpdateRequest for updating function code
type FaaSFunctionCodeUpdateRequest struct {
	CodeInline      string `json:"code_inline,omitempty"`
	CodeArchive     string `json:"code_archive,omitempty"`
	Requirements    string `json:"requirements,omitempty"`
	HandlerFunction string `json:"handler_function,omitempty"`
}

// FaaSFunctionConfigUpdateRequest for updating function configuration
type FaaSFunctionConfigUpdateRequest struct {
	MemoryMB       int `json:"memory_mb,omitempty"`
	TimeoutSeconds int `json:"timeout_seconds,omitempty"`
	Replicas       int `json:"replicas,omitempty"`
}

// FaaSFunctionEnvUpdateRequest for updating environment and secrets
type FaaSFunctionEnvUpdateRequest struct {
	Environment map[string]string `json:"environment"`
	Secrets     []string          `json:"secrets"`
}

// FaaSFunctionMetadataUpdateRequest for updating labels and annotations
type FaaSFunctionMetadataUpdateRequest struct {
	Labels      map[string]string `json:"labels"`
	Annotations map[string]string `json:"annotations"`
}

// FaaSSecretCreateRequest for creating a secret
type FaaSSecretCreateRequest struct {
	Name      string `json:"name"`
	Value     string `json:"value"`
	Namespace string `json:"namespace,omitempty"`
}

// FaaSSecretResponse from API
type FaaSSecretResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Namespace string `json:"namespace"`
	CreatedAt string `json:"created_at"`
}

// FaaSRuntime represents an available runtime
type FaaSRuntime struct {
	Name      string   `json:"name"`
	Version   string   `json:"version"`
	Templates []string `json:"templates"`
	Hardware  []string `json:"hardware"` // cpu, gpu
}

// FaaSRuntimesResponse from API
type FaaSRuntimesResponse struct {
	Runtimes []FaaSRuntime `json:"runtimes"`
}

// FaaSFunctionListResponse for listing functions
type FaaSFunctionListResponse struct {
	Functions []FaaSFunctionResponse `json:"functions"`
	Total     int                    `json:"total"`
}
