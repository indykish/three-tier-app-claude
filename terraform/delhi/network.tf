# Delhi Region - VPC Configuration

resource "e2e_vpc" "delhi_vpc" {
  vpc_name   = "three-tier-delhi-vpc"
  location   = "Delhi"
  project_id = var.project_id
  ipv4       = var.vpc_cidr
}

output "vpc_id" {
  description = "Delhi VPC ID"
  value       = e2e_vpc.delhi_vpc.id
}

output "vpc_network_id" {
  description = "Delhi VPC Network ID"
  value       = e2e_vpc.delhi_vpc.network_id
}

output "vpc_gateway" {
  description = "Delhi VPC Gateway IP"
  value       = e2e_vpc.delhi_vpc.gateway_ip
}
