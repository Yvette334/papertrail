variable "aws_region" {
  description = "AWS region to deploy into (set in terraform.tfvars, not hardcoded)"
  type        = string
}

variable "project_name" {
  description = "Prefix used in resource names and tags"
  type        = string
  default     = "papertrail"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type for the application server"
  type        = string
  default     = "t3.micro"
}

variable "app_port" {
  description = "Port the PaperTrail container listens on"
  type        = number
  default     = 3000
}

variable "allowed_ssh_cidr" {
  description = "Your IP range allowed to SSH in, e.g. 203.0.113.10/32. Never use 0.0.0.0/0."
  type        = string

  validation {
    condition     = can(cidrnetmask(var.allowed_ssh_cidr)) && var.allowed_ssh_cidr != "0.0.0.0/0"
    error_message = "allowed_ssh_cidr must be a valid CIDR block and must not be 0.0.0.0/0."
  }
}

variable "ssh_public_key" {
  description = "Contents of your SSH PUBLIC key (the .pub file), used to create the EC2 key pair"
  type        = string
}
