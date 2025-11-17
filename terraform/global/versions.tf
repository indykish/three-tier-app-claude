terraform {
  required_version = ">= 1.0.0"

  required_providers {
    e2e = {
      source  = "e2eterraformprovider/e2e"
      version = "~> 2.2"
    }
  }
}
