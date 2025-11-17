package faas

import (
	"context"
	"log"

	"github.com/hashicorp/terraform-plugin-sdk/v2/diag"
	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/schema"

	"github.com/e2eterraformprovider/terraform-provider-e2e/client"
)

// DataSourceFaaSRuntimes returns the data source schema for e2e_faas_runtimes
func DataSourceFaaSRuntimes() *schema.Resource {
	return &schema.Resource{
		Description: "Lists available FaaS runtimes on E2E Networks",

		ReadContext: dataSourceFaaSRuntimesRead,

		Schema: map[string]*schema.Schema{
			"filter_hardware": {
				Type:        schema.TypeString,
				Optional:    true,
				Description: "Filter runtimes by hardware type (cpu or gpu)",
			},
			"runtimes": {
				Type:        schema.TypeList,
				Computed:    true,
				Description: "List of available runtimes",
				Elem: &schema.Resource{
					Schema: map[string]*schema.Schema{
						"name": {
							Type:        schema.TypeString,
							Computed:    true,
							Description: "Runtime name (e.g., python3.11)",
						},
						"version": {
							Type:        schema.TypeString,
							Computed:    true,
							Description: "Runtime version",
						},
						"templates": {
							Type:        schema.TypeList,
							Computed:    true,
							Description: "Available templates for this runtime",
							Elem:        &schema.Schema{Type: schema.TypeString},
						},
						"hardware": {
							Type:        schema.TypeList,
							Computed:    true,
							Description: "Supported hardware types (cpu, gpu)",
							Elem:        &schema.Schema{Type: schema.TypeString},
						},
					},
				},
			},
		},
	}
}

func dataSourceFaaSRuntimesRead(ctx context.Context, d *schema.ResourceData, m interface{}) diag.Diagnostics {
	c := m.(*client.Client)

	log.Printf("[DEBUG] Reading available FaaS runtimes")

	runtimesResp, err := c.ListFaaSRuntimes()
	if err != nil {
		return diag.Errorf("failed to list runtimes: %s", err)
	}

	// Apply filter if specified
	filterHardware := ""
	if v, ok := d.GetOk("filter_hardware"); ok {
		filterHardware = v.(string)
	}

	runtimes := make([]map[string]interface{}, 0)

	for _, runtime := range runtimesResp.Runtimes {
		// Apply hardware filter if specified
		if filterHardware != "" {
			found := false
			for _, hw := range runtime.Hardware {
				if hw == filterHardware {
					found = true
					break
				}
			}
			if !found {
				continue
			}
		}

		runtimeMap := map[string]interface{}{
			"name":      runtime.Name,
			"version":   runtime.Version,
			"templates": runtime.Templates,
			"hardware":  runtime.Hardware,
		}
		runtimes = append(runtimes, runtimeMap)
	}

	if err := d.Set("runtimes", runtimes); err != nil {
		return diag.Errorf("failed to set runtimes: %s", err)
	}

	// Use a consistent ID for this data source
	d.SetId("e2e-faas-runtimes")

	log.Printf("[DEBUG] Found %d runtimes", len(runtimes))

	return nil
}
