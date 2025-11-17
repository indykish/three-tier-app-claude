package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/e2eterraformprovider/terraform-provider-e2e/models"
)

// FaaS API path - adjust based on actual E2E API documentation
const faasAPIPath = "faas/api/v1/"

// NotFoundError represents a 404 response
type NotFoundError struct {
	Message string
}

func (e *NotFoundError) Error() string {
	return e.Message
}

// IsNotFoundError checks if error is NotFoundError
func IsNotFoundError(err error) bool {
	_, ok := err.(*NotFoundError)
	return ok
}

// CreateFaaSFunction creates a new FaaS function
func (c *Client) CreateFaaSFunction(req *models.FaaSFunctionCreateRequest) (*models.FaaSFunctionResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "functions"

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("failed to create function: status=%s, body=%s", resp.Status, string(body))
	}

	var funcResp models.FaaSFunctionResponse
	err = json.Unmarshal(body, &funcResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &funcResp, nil
}

// GetFaaSFunction retrieves a function by ID
func (c *Client) GetFaaSFunction(id string) (*models.FaaSFunctionResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "functions/" + id

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	c.addAPIKeyParam(httpReq)

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode == http.StatusNotFound {
		return nil, &NotFoundError{Message: fmt.Sprintf("function %s not found", id)}
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to get function: status=%s, body=%s", resp.Status, string(body))
	}

	var funcResp models.FaaSFunctionResponse
	err = json.Unmarshal(body, &funcResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &funcResp, nil
}

// ListFaaSFunctions lists all functions
func (c *Client) ListFaaSFunctions() (*models.FaaSFunctionListResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "functions"

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	c.addAPIKeyParam(httpReq)

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to list functions: status=%s, body=%s", resp.Status, string(body))
	}

	var listResp models.FaaSFunctionListResponse
	err = json.Unmarshal(body, &listResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &listResp, nil
}

// UpdateFaaSFunctionCode updates function code
func (c *Client) UpdateFaaSFunctionCode(id string, req *models.FaaSFunctionCodeUpdateRequest) (*models.FaaSFunctionResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "functions/" + id + "/code"

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to update function code: status=%s, body=%s", resp.Status, string(body))
	}

	var funcResp models.FaaSFunctionResponse
	err = json.Unmarshal(body, &funcResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &funcResp, nil
}

// UpdateFaaSFunctionConfig updates function configuration
func (c *Client) UpdateFaaSFunctionConfig(id string, req *models.FaaSFunctionConfigUpdateRequest) (*models.FaaSFunctionResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "functions/" + id + "/config"

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to update function config: status=%s, body=%s", resp.Status, string(body))
	}

	var funcResp models.FaaSFunctionResponse
	err = json.Unmarshal(body, &funcResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &funcResp, nil
}

// UpdateFaaSFunctionEnvironment updates function environment variables and secrets
func (c *Client) UpdateFaaSFunctionEnvironment(id string, req *models.FaaSFunctionEnvUpdateRequest) (*models.FaaSFunctionResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "functions/" + id + "/environment"

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to update function environment: status=%s, body=%s", resp.Status, string(body))
	}

	var funcResp models.FaaSFunctionResponse
	err = json.Unmarshal(body, &funcResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &funcResp, nil
}

// UpdateFaaSFunctionMetadata updates function labels and annotations
func (c *Client) UpdateFaaSFunctionMetadata(id string, req *models.FaaSFunctionMetadataUpdateRequest) (*models.FaaSFunctionResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "functions/" + id + "/metadata"

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to update function metadata: status=%s, body=%s", resp.Status, string(body))
	}

	var funcResp models.FaaSFunctionResponse
	err = json.Unmarshal(body, &funcResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &funcResp, nil
}

// DeleteFaaSFunction deletes a function by ID
func (c *Client) DeleteFaaSFunction(id string) error {
	url := c.Api_endpoint + faasAPIPath + "functions/" + id

	httpReq, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	c.addAPIKeyParam(httpReq)

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		// Already deleted
		return nil
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		body, _ := ioutil.ReadAll(resp.Body)
		return fmt.Errorf("failed to delete function: status=%s, body=%s", resp.Status, string(body))
	}

	return nil
}

// CreateFaaSSecret creates a new secret
func (c *Client) CreateFaaSSecret(req *models.FaaSSecretCreateRequest) (*models.FaaSSecretResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "secrets"

	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("failed to create secret: status=%s, body=%s", resp.Status, string(body))
	}

	var secretResp models.FaaSSecretResponse
	err = json.Unmarshal(body, &secretResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &secretResp, nil
}

// DeleteFaaSSecret deletes a secret by name
func (c *Client) DeleteFaaSSecret(name string) error {
	url := c.Api_endpoint + faasAPIPath + "secrets/" + name

	httpReq, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	c.addAPIKeyParam(httpReq)

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil // Already deleted
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		body, _ := ioutil.ReadAll(resp.Body)
		return fmt.Errorf("failed to delete secret: status=%s, body=%s", resp.Status, string(body))
	}

	return nil
}

// ListFaaSRuntimes lists available runtimes
func (c *Client) ListFaaSRuntimes() (*models.FaaSRuntimesResponse, error) {
	url := c.Api_endpoint + faasAPIPath + "runtimes"

	httpReq, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setFaaSHeaders(httpReq)
	c.addAPIKeyParam(httpReq)

	resp, err := c.HttpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to list runtimes: status=%s, body=%s", resp.Status, string(body))
	}

	var runtimesResp models.FaaSRuntimesResponse
	err = json.Unmarshal(body, &runtimesResp)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return &runtimesResp, nil
}

// Helper functions

func (c *Client) setFaaSHeaders(req *http.Request) {
	req.Header.Add("Authorization", "Bearer "+c.Auth_token)
	req.Header.Add("User-Agent", "terraform-e2e")
}

func (c *Client) addAPIKeyParam(req *http.Request) {
	params := req.URL.Query()
	params.Add("apikey", c.Api_key)
	req.URL.RawQuery = params.Encode()
}
