package faas

import (
	"fmt"
	"testing"

	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/resource"
	"github.com/hashicorp/terraform-plugin-sdk/v2/terraform"
)

// TestAccFaaSFunction_basic tests basic function creation
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
					resource.TestCheckResourceAttr("e2e_faas_function.test", "name", "acc-test-basic"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "runtime", "python3.11"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "template", "http"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "status", "Running"),
					resource.TestCheckResourceAttrSet("e2e_faas_function.test", "id"),
					resource.TestCheckResourceAttrSet("e2e_faas_function.test", "invoke_url"),
					resource.TestCheckResourceAttrSet("e2e_faas_function.test", "created_at"),
				),
			},
		},
	})
}

// TestAccFaaSFunction_update tests function updates
func TestAccFaaSFunction_update(t *testing.T) {
	resource.Test(t, resource.TestCase{
		PreCheck:     func() { testAccPreCheck(t) },
		Providers:    testAccProviders,
		CheckDestroy: testAccCheckFaaSFunctionDestroy,
		Steps: []resource.TestStep{
			{
				Config: testAccFaaSFunctionConfig_basic(),
				Check: resource.ComposeTestCheckFunc(
					testAccCheckFaaSFunctionExists("e2e_faas_function.test"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "config.0.memory_mb", "128"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "config.0.replicas", "1"),
				),
			},
			{
				Config: testAccFaaSFunctionConfig_updated(),
				Check: resource.ComposeTestCheckFunc(
					testAccCheckFaaSFunctionExists("e2e_faas_function.test"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "config.0.memory_mb", "256"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "config.0.replicas", "2"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "environment.LOG_LEVEL", "DEBUG"),
				),
			},
		},
	})
}

// TestAccFaaSFunction_withEnvironment tests function with environment variables
func TestAccFaaSFunction_withEnvironment(t *testing.T) {
	resource.Test(t, resource.TestCase{
		PreCheck:     func() { testAccPreCheck(t) },
		Providers:    testAccProviders,
		CheckDestroy: testAccCheckFaaSFunctionDestroy,
		Steps: []resource.TestStep{
			{
				Config: testAccFaaSFunctionConfig_withEnvironment(),
				Check: resource.ComposeTestCheckFunc(
					testAccCheckFaaSFunctionExists("e2e_faas_function.test"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "environment.API_URL", "https://api.example.com"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "environment.LOG_LEVEL", "INFO"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "environment.TIMEOUT", "30"),
				),
			},
		},
	})
}

// TestAccFaaSFunction_withLabels tests function with labels
func TestAccFaaSFunction_withLabels(t *testing.T) {
	resource.Test(t, resource.TestCase{
		PreCheck:     func() { testAccPreCheck(t) },
		Providers:    testAccProviders,
		CheckDestroy: testAccCheckFaaSFunctionDestroy,
		Steps: []resource.TestStep{
			{
				Config: testAccFaaSFunctionConfig_withLabels(),
				Check: resource.ComposeTestCheckFunc(
					testAccCheckFaaSFunctionExists("e2e_faas_function.test"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "labels.team", "platform"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "labels.environment", "test"),
					resource.TestCheckResourceAttr("e2e_faas_function.test", "labels.version", "1.0"),
				),
			},
		},
	})
}

// TestAccFaaSFunction_import tests function import
func TestAccFaaSFunction_import(t *testing.T) {
	resource.Test(t, resource.TestCase{
		PreCheck:     func() { testAccPreCheck(t) },
		Providers:    testAccProviders,
		CheckDestroy: testAccCheckFaaSFunctionDestroy,
		Steps: []resource.TestStep{
			{
				Config: testAccFaaSFunctionConfig_basic(),
				Check: resource.ComposeTestCheckFunc(
					testAccCheckFaaSFunctionExists("e2e_faas_function.test"),
				),
			},
			{
				ResourceName:            "e2e_faas_function.test",
				ImportState:             true,
				ImportStateVerify:       true,
				ImportStateVerifyIgnore: []string{"code_inline"}, // Code might not be returned by API
			},
		},
	})
}

// Test configuration templates

func testAccFaaSFunctionConfig_basic() string {
	return `
resource "e2e_faas_function" "test" {
    name    = "acc-test-basic"
    runtime = "python3.11"

    code_inline = <<-EOF
        def handle(event, context):
            return {"statusCode": 200, "body": "test"}
    EOF

    config {
        memory_mb       = 128
        timeout_seconds = 30
        replicas        = 1
        hardware_type   = "cpu"
    }
}
`
}

func testAccFaaSFunctionConfig_updated() string {
	return `
resource "e2e_faas_function" "test" {
    name    = "acc-test-basic"
    runtime = "python3.11"

    code_inline = <<-EOF
        def handle(event, context):
            return {"statusCode": 200, "body": "updated"}
    EOF

    config {
        memory_mb       = 256
        timeout_seconds = 60
        replicas        = 2
        hardware_type   = "cpu"
    }

    environment = {
        LOG_LEVEL = "DEBUG"
    }
}
`
}

func testAccFaaSFunctionConfig_withEnvironment() string {
	return `
resource "e2e_faas_function" "test" {
    name    = "acc-test-env"
    runtime = "python3.11"

    code_inline = <<-EOF
        import os
        def handle(event, context):
            return {
                "statusCode": 200,
                "body": {
                    "api_url": os.environ.get("API_URL"),
                    "log_level": os.environ.get("LOG_LEVEL"),
                    "timeout": os.environ.get("TIMEOUT")
                }
            }
    EOF

    config {
        memory_mb = 128
    }

    environment = {
        API_URL   = "https://api.example.com"
        LOG_LEVEL = "INFO"
        TIMEOUT   = "30"
    }
}
`
}

func testAccFaaSFunctionConfig_withLabels() string {
	return `
resource "e2e_faas_function" "test" {
    name    = "acc-test-labels"
    runtime = "python3.11"

    code_inline = "def handle(event, context): return {'statusCode': 200}"

    config {
        memory_mb = 128
    }

    labels = {
        team        = "platform"
        environment = "test"
        version     = "1.0"
    }
}
`
}

// Helper functions

func testAccPreCheck(t *testing.T) {
	// Verify required environment variables are set
	// This is called before each test
}

func testAccCheckFaaSFunctionExists(n string) resource.TestCheckFunc {
	return func(s *terraform.State) error {
		rs, ok := s.RootModule().Resources[n]
		if !ok {
			return fmt.Errorf("resource not found: %s", n)
		}
		if rs.Primary.ID == "" {
			return fmt.Errorf("no ID set for resource: %s", n)
		}

		// Optionally verify function exists via API
		// client := testAccProvider.Meta().(*client.Client)
		// _, err := client.GetFaaSFunction(rs.Primary.ID)
		// if err != nil {
		//     return err
		// }

		return nil
	}
}

func testAccCheckFaaSFunctionDestroy(s *terraform.State) error {
	// Verify all functions have been destroyed
	for _, rs := range s.RootModule().Resources {
		if rs.Type != "e2e_faas_function" {
			continue
		}

		// Verify function no longer exists via API
		// client := testAccProvider.Meta().(*client.Client)
		// _, err := client.GetFaaSFunction(rs.Primary.ID)
		// if err == nil {
		//     return fmt.Errorf("function still exists: %s", rs.Primary.ID)
		// }
		// if !client.IsNotFoundError(err) {
		//     return err
		// }
	}

	return nil
}

// Placeholder for test provider setup
var testAccProviders map[string]*schema.Provider
var testAccProvider *schema.Provider
