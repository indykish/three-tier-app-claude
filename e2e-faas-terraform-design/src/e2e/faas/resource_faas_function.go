package faas

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/hashicorp/terraform-plugin-sdk/v2/diag"
	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/resource"
	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/schema"
	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/validation"

	"github.com/e2eterraformprovider/terraform-provider-e2e/client"
	"github.com/e2eterraformprovider/terraform-provider-e2e/models"
)

// ResourceFaaSFunction returns the resource schema for e2e_faas_function
func ResourceFaaSFunction() *schema.Resource {
	return &schema.Resource{
		Description: "Manages a FaaS (Function-as-a-Service) function on E2E Networks",

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
			// Required fields
			"name": {
				Type:        schema.TypeString,
				Required:    true,
				ForceNew:    true,
				Description: "Function name (lowercase alphanumeric and hyphens, 3-63 characters)",
				ValidateFunc: validation.All(
					validation.StringMatch(
						regexp.MustCompile(`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`),
						"must be lowercase alphanumeric with hyphens, starting and ending with alphanumeric",
					),
					validation.StringLenBetween(3, 63),
				),
			},
			"runtime": {
				Type:        schema.TypeString,
				Required:    true,
				ForceNew:    true, // Changing runtime requires new function
				Description: "Runtime environment (python3.11, node20, node18, csharp7.0, php8.2, go1.21, pytorch2.1.2, tensorflow2.19.0, custom)",
				ValidateFunc: validation.StringInSlice([]string{
					"python3.11", "node20", "node18", "csharp7.0",
					"php8.2", "go1.21", "pytorch2.1.2", "tensorflow2.19.0",
					"custom",
				}, false),
			},

			// Optional fields
			"template": {
				Type:        schema.TypeString,
				Optional:    true,
				Default:     "http",
				Description: "Function template (http, flask, fastapi, node, go)",
				ValidateFunc: validation.StringInSlice([]string{
					"http", "flask", "fastapi", "node", "go",
				}, false),
			},
			"code_path": {
				Type:          schema.TypeString,
				Optional:      true,
				Description:   "Path to directory containing function code (will be zipped automatically)",
				ConflictsWith: []string{"code_archive", "code_inline"},
			},
			"code_archive": {
				Type:          schema.TypeString,
				Optional:      true,
				Description:   "Path to ZIP archive containing function code",
				ConflictsWith: []string{"code_path", "code_inline"},
			},
			"code_inline": {
				Type:          schema.TypeString,
				Optional:      true,
				Description:   "Inline function code",
				ConflictsWith: []string{"code_path", "code_archive"},
			},
			"handler_function": {
				Type:        schema.TypeString,
				Optional:    true,
				Default:     "handle",
				Description: "Handler function name (default: handle)",
			},
			"requirements": {
				Type:        schema.TypeString,
				Optional:    true,
				Description: "Package requirements (e.g., requirements.txt content for Python)",
			},
			"config": {
				Type:        schema.TypeList,
				Optional:    true,
				MaxItems:    1,
				Description: "Function configuration settings",
				Elem: &schema.Resource{
					Schema: map[string]*schema.Schema{
						"memory_mb": {
							Type:         schema.TypeInt,
							Optional:     true,
							Default:      128,
							Description:  "Memory allocation in MB (64-8192)",
							ValidateFunc: validation.IntBetween(64, 8192),
						},
						"timeout_seconds": {
							Type:         schema.TypeInt,
							Optional:     true,
							Default:      30,
							Description:  "Execution timeout in seconds (1-900)",
							ValidateFunc: validation.IntBetween(1, 900),
						},
						"replicas": {
							Type:         schema.TypeInt,
							Optional:     true,
							Default:      1,
							Description:  "Number of replicas (1-5 for CPU functions)",
							ValidateFunc: validation.IntBetween(1, 5),
						},
						"hardware_type": {
							Type:         schema.TypeString,
							Optional:     true,
							Default:      "cpu",
							Description:  "Hardware type (cpu or gpu)",
							ValidateFunc: validation.StringInSlice([]string{"cpu", "gpu"}, false),
						},
					},
				},
			},
			"environment": {
				Type:        schema.TypeMap,
				Optional:    true,
				Elem:        &schema.Schema{Type: schema.TypeString},
				Description: "Environment variables as key-value pairs",
			},
			"secrets": {
				Type:        schema.TypeList,
				Optional:    true,
				Elem:        &schema.Schema{Type: schema.TypeString},
				Description: "List of secret names to bind to the function",
			},
			"labels": {
				Type:        schema.TypeMap,
				Optional:    true,
				Elem:        &schema.Schema{Type: schema.TypeString},
				Description: "Function labels for metadata",
			},
			"annotations": {
				Type:        schema.TypeMap,
				Optional:    true,
				Elem:        &schema.Schema{Type: schema.TypeString},
				Description: "Function annotations",
			},

			// Computed (read-only) attributes
			"id": {
				Type:        schema.TypeString,
				Computed:    true,
				Description: "Function ID",
			},
			"invoke_url": {
				Type:        schema.TypeString,
				Computed:    true,
				Description: "Function invocation URL",
			},
			"status": {
				Type:        schema.TypeString,
				Computed:    true,
				Description: "Function status (Deploying, Running, Failed)",
			},
			"version": {
				Type:        schema.TypeString,
				Computed:    true,
				Description: "Current deployed version",
			},
			"namespace": {
				Type:        schema.TypeString,
				Computed:    true,
				Description: "Function namespace",
			},
			"created_at": {
				Type:        schema.TypeString,
				Computed:    true,
				Description: "Creation timestamp",
			},
			"updated_at": {
				Type:        schema.TypeString,
				Computed:    true,
				Description: "Last update timestamp",
			},
		},
	}
}

// CRUD Operations

func resourceFaaSFunctionCreate(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*client.Client)

	log.Printf("[DEBUG] Creating FaaS function: %s", d.Get("name").(string))

	// Build create request
	funcReq := &models.FaaSFunctionCreateRequest{
		Name:            d.Get("name").(string),
		Runtime:         d.Get("runtime").(string),
		Template:        d.Get("template").(string),
		HandlerFunction: d.Get("handler_function").(string),
		Environment:     expandStringMap(d.Get("environment").(map[string]interface{})),
		Secrets:         expandStringList(d.Get("secrets").([]interface{})),
		Labels:          expandStringMap(d.Get("labels").(map[string]interface{})),
		Annotations:     expandStringMap(d.Get("annotations").(map[string]interface{})),
	}

	// Handle code source (mutually exclusive)
	if v, ok := d.GetOk("code_inline"); ok {
		funcReq.CodeInline = v.(string)
		log.Printf("[DEBUG] Using inline code for function")
	} else if v, ok := d.GetOk("code_archive"); ok {
		zipData, err := ioutil.ReadFile(v.(string))
		if err != nil {
			return diag.Errorf("failed to read code archive: %s", err)
		}
		funcReq.CodeArchive = base64.StdEncoding.EncodeToString(zipData)
		log.Printf("[DEBUG] Using ZIP archive for function")
	} else if v, ok := d.GetOk("code_path"); ok {
		zipData, err := createZipFromDirectory(v.(string))
		if err != nil {
			return diag.Errorf("failed to create ZIP from directory: %s", err)
		}
		funcReq.CodeArchive = base64.StdEncoding.EncodeToString(zipData)
		log.Printf("[DEBUG] Created ZIP from directory for function")
	}

	// Handle requirements
	if v, ok := d.GetOk("requirements"); ok {
		funcReq.Requirements = v.(string)
	}

	// Handle config block
	if v, ok := d.GetOk("config"); ok {
		configList := v.([]interface{})
		if len(configList) > 0 && configList[0] != nil {
			config := configList[0].(map[string]interface{})
			funcReq.Config = &models.FaaSFunctionConfig{
				MemoryMB:       config["memory_mb"].(int),
				TimeoutSeconds: config["timeout_seconds"].(int),
				Replicas:       config["replicas"].(int),
				HardwareType:   config["hardware_type"].(string),
			}
		}
	}

	// Create function via API
	log.Printf("[DEBUG] Sending create request to API")
	funcResp, err := c.CreateFaaSFunction(funcReq)
	if err != nil {
		return diag.Errorf("failed to create function: %s", err)
	}

	d.SetId(funcResp.ID)
	log.Printf("[DEBUG] Function created with ID: %s, waiting for deployment", funcResp.ID)

	// Wait for deployment to complete
	err = waitForFunctionStatus(ctx, c, funcResp.ID, "Running", d.Timeout(schema.TimeoutCreate))
	if err != nil {
		return diag.Errorf("function deployment failed: %s", err)
	}

	log.Printf("[DEBUG] Function deployment completed successfully")

	return resourceFaaSFunctionRead(ctx, d, m)
}

func resourceFaaSFunctionRead(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*client.Client)

	log.Printf("[DEBUG] Reading FaaS function: %s", d.Id())

	funcResp, err := c.GetFaaSFunction(d.Id())
	if err != nil {
		// Handle 404 - resource deleted outside Terraform
		if client.IsNotFoundError(err) {
			log.Printf("[WARN] Function %s not found, removing from state", d.Id())
			d.SetId("")
			return nil
		}
		return diag.Errorf("failed to read function: %s", err)
	}

	// Set all attributes from API response
	d.Set("name", funcResp.Name)
	d.Set("runtime", funcResp.Runtime)
	d.Set("template", funcResp.Template)
	d.Set("handler_function", funcResp.HandlerFunction)
	d.Set("invoke_url", funcResp.InvokeURL)
	d.Set("status", funcResp.Status)
	d.Set("version", funcResp.Version)
	d.Set("namespace", funcResp.Namespace)
	d.Set("created_at", funcResp.CreatedAt)
	d.Set("updated_at", funcResp.UpdatedAt)
	d.Set("environment", funcResp.Environment)
	d.Set("secrets", funcResp.Secrets)
	d.Set("labels", funcResp.Labels)
	d.Set("annotations", funcResp.Annotations)

	// Set config block
	if funcResp.Config != nil {
		config := []map[string]interface{}{
			{
				"memory_mb":       funcResp.Config.MemoryMB,
				"timeout_seconds": funcResp.Config.TimeoutSeconds,
				"replicas":        funcResp.Config.Replicas,
				"hardware_type":   funcResp.Config.HardwareType,
			},
		}
		d.Set("config", config)
	}

	log.Printf("[DEBUG] Function read successfully: status=%s", funcResp.Status)

	return nil
}

func resourceFaaSFunctionUpdate(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*client.Client)

	log.Printf("[DEBUG] Updating FaaS function: %s", d.Id())

	// Track if any updates were made
	updated := false

	// Update code if changed
	if d.HasChange("code_inline") || d.HasChange("code_archive") || d.HasChange("code_path") || d.HasChange("requirements") || d.HasChange("handler_function") {
		log.Printf("[DEBUG] Updating function code")

		codeReq := &models.FaaSFunctionCodeUpdateRequest{
			HandlerFunction: d.Get("handler_function").(string),
		}

		// Handle code source
		if v, ok := d.GetOk("code_inline"); ok {
			codeReq.CodeInline = v.(string)
		} else if v, ok := d.GetOk("code_archive"); ok {
			zipData, err := ioutil.ReadFile(v.(string))
			if err != nil {
				return diag.Errorf("failed to read code archive: %s", err)
			}
			codeReq.CodeArchive = base64.StdEncoding.EncodeToString(zipData)
		} else if v, ok := d.GetOk("code_path"); ok {
			zipData, err := createZipFromDirectory(v.(string))
			if err != nil {
				return diag.Errorf("failed to create ZIP from directory: %s", err)
			}
			codeReq.CodeArchive = base64.StdEncoding.EncodeToString(zipData)
		}

		if v, ok := d.GetOk("requirements"); ok {
			codeReq.Requirements = v.(string)
		}

		_, err := c.UpdateFaaSFunctionCode(d.Id(), codeReq)
		if err != nil {
			return diag.Errorf("failed to update function code: %s", err)
		}
		updated = true
	}

	// Update config if changed
	if d.HasChange("config") {
		log.Printf("[DEBUG] Updating function configuration")

		configList := d.Get("config").([]interface{})
		if len(configList) > 0 && configList[0] != nil {
			config := configList[0].(map[string]interface{})
			configReq := &models.FaaSFunctionConfigUpdateRequest{
				MemoryMB:       config["memory_mb"].(int),
				TimeoutSeconds: config["timeout_seconds"].(int),
				Replicas:       config["replicas"].(int),
			}
			_, err := c.UpdateFaaSFunctionConfig(d.Id(), configReq)
			if err != nil {
				return diag.Errorf("failed to update function config: %s", err)
			}
			updated = true
		}
	}

	// Update environment and secrets if changed
	if d.HasChange("environment") || d.HasChange("secrets") {
		log.Printf("[DEBUG] Updating function environment")

		envReq := &models.FaaSFunctionEnvUpdateRequest{
			Environment: expandStringMap(d.Get("environment").(map[string]interface{})),
			Secrets:     expandStringList(d.Get("secrets").([]interface{})),
		}
		_, err := c.UpdateFaaSFunctionEnvironment(d.Id(), envReq)
		if err != nil {
			return diag.Errorf("failed to update function environment: %s", err)
		}
		updated = true
	}

	// Update labels and annotations if changed
	if d.HasChange("labels") || d.HasChange("annotations") {
		log.Printf("[DEBUG] Updating function metadata")

		metaReq := &models.FaaSFunctionMetadataUpdateRequest{
			Labels:      expandStringMap(d.Get("labels").(map[string]interface{})),
			Annotations: expandStringMap(d.Get("annotations").(map[string]interface{})),
		}
		_, err := c.UpdateFaaSFunctionMetadata(d.Id(), metaReq)
		if err != nil {
			return diag.Errorf("failed to update function metadata: %s", err)
		}
		updated = true
	}

	// Wait for redeployment if updates were made
	if updated {
		log.Printf("[DEBUG] Waiting for function redeployment")
		err := waitForFunctionStatus(ctx, c, d.Id(), "Running", d.Timeout(schema.TimeoutUpdate))
		if err != nil {
			return diag.Errorf("function redeployment failed: %s", err)
		}
	}

	log.Printf("[DEBUG] Function update completed successfully")

	return resourceFaaSFunctionRead(ctx, d, m)
}

func resourceFaaSFunctionDelete(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*client.Client)

	log.Printf("[DEBUG] Deleting FaaS function: %s", d.Id())

	err := c.DeleteFaaSFunction(d.Id())
	if err != nil {
		if !client.IsNotFoundError(err) {
			return diag.Errorf("failed to delete function: %s", err)
		}
		log.Printf("[DEBUG] Function already deleted")
	}

	// Wait for deletion to complete
	err = waitForFunctionDeleted(ctx, c, d.Id(), d.Timeout(schema.TimeoutDelete))
	if err != nil {
		return diag.Errorf("failed to confirm function deletion: %s", err)
	}

	d.SetId("")
	log.Printf("[DEBUG] Function deleted successfully")

	return nil
}

// Helper Functions

func waitForFunctionStatus(ctx context.Context, c *client.Client, id, targetStatus string, timeout time.Duration) error {
	log.Printf("[DEBUG] Waiting for function %s to reach status: %s", id, targetStatus)

	return resource.RetryContext(ctx, timeout, func() *resource.RetryError {
		funcResp, err := c.GetFaaSFunction(id)
		if err != nil {
			return resource.NonRetryableError(fmt.Errorf("error getting function: %w", err))
		}

		log.Printf("[DEBUG] Function status: %s (target: %s)", funcResp.Status, targetStatus)

		if funcResp.Status == "Failed" {
			errMsg := "deployment failed"
			if funcResp.ErrorMessage != "" {
				errMsg = funcResp.ErrorMessage
			}
			return resource.NonRetryableError(fmt.Errorf("function %s", errMsg))
		}

		if funcResp.Status != targetStatus {
			return resource.RetryableError(fmt.Errorf("function status is %s, waiting for %s", funcResp.Status, targetStatus))
		}

		return nil
	})
}

func waitForFunctionDeleted(ctx context.Context, c *client.Client, id string, timeout time.Duration) error {
	log.Printf("[DEBUG] Waiting for function %s to be deleted", id)

	return resource.RetryContext(ctx, timeout, func() *resource.RetryError {
		_, err := c.GetFaaSFunction(id)
		if err != nil {
			if client.IsNotFoundError(err) {
				log.Printf("[DEBUG] Function %s confirmed deleted", id)
				return nil // Successfully deleted
			}
			return resource.NonRetryableError(fmt.Errorf("error checking function: %w", err))
		}

		return resource.RetryableError(fmt.Errorf("function still exists"))
	})
}

func expandStringMap(input map[string]interface{}) map[string]string {
	result := make(map[string]string)
	for k, v := range input {
		result[k] = v.(string)
	}
	return result
}

func expandStringList(input []interface{}) []string {
	result := make([]string, len(input))
	for i, v := range input {
		result[i] = v.(string)
	}
	return result
}

func createZipFromDirectory(dirPath string) ([]byte, error) {
	log.Printf("[DEBUG] Creating ZIP from directory: %s", dirPath)

	buf := new(bytes.Buffer)
	zipWriter := zip.NewWriter(buf)

	err := filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Get relative path
		relPath, err := filepath.Rel(dirPath, path)
		if err != nil {
			return err
		}

		// Skip hidden files and common ignore patterns
		if strings.HasPrefix(filepath.Base(path), ".") {
			return nil
		}

		// Create file in zip
		writer, err := zipWriter.Create(relPath)
		if err != nil {
			return err
		}

		// Read and write file content
		data, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}

		_, err = writer.Write(data)
		return err
	})

	if err != nil {
		return nil, fmt.Errorf("failed to walk directory: %w", err)
	}

	err = zipWriter.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close zip writer: %w", err)
	}

	return buf.Bytes(), nil
}
