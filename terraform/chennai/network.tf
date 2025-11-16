# Chennai Region - VPC Configuration

resource "e2e_vpc" "chennai_vpc" {
  vpc_name   = "three-tier-chennai-vpc"
  location   = "Chennai"
  project_id = var.project_id
  ipv4       = var.vpc_cidr
}

output "vpc_id" {
  description = "Chennai VPC ID"
  value       = e2e_vpc.chennai_vpc.vpc_id
}

output "vpc_network_id" {
  description = "Chennai VPC Network ID"
  value       = e2e_vpc.chennai_vpc.network_id
}

output "vpc_gateway" {
  description = "Chennai VPC Gateway IP"
  value       = e2e_vpc.chennai_vpc.gateway_ip
}
