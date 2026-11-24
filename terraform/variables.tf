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

variable "availability_zones" {
  description = "Exactly two AZs: [0] for public + private_a, [1] for private_b (RDS needs two AZs)"
  type        = list(string)

  validation {
    condition     = length(var.availability_zones) == 2
    error_message = "availability_zones must contain exactly two AZ names, e.g. [\"eu-north-1a\", \"eu-north-1b\"]."
  }
}

variable "private_subnet_cidr" {
  description = "CIDR block for the first private subnet (app VM + RDS)"
  type        = string
  default     = "10.0.2.0/24"
}

variable "private_subnet_cidr_b" {
  description = "CIDR block for the second private subnet (RDS requires two AZs)"
  type        = string
  default     = "10.0.3.0/24"
}

variable "instance_type" {
  description = "EC2 instance type for the bastion and application servers"
  type        = string
  default     = "t3.micro"
}

variable "app_port" {
  description = "Port the PaperTrail container listens on"
  type        = number
  default     = 3000
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed to SSH to the bastion. Demo includes 0.0.0.0/0 so GitHub-hosted runners can reach it; login is SSH-key only."
  type        = list(string)

  validation {
    condition     = length(var.allowed_ssh_cidr) > 0 && alltrue([for c in var.allowed_ssh_cidr : can(cidrnetmask(c))])
    error_message = "allowed_ssh_cidr must be a non-empty list of valid CIDR blocks."
  }
}

variable "ssh_public_key" {
  description = "Contents of your SSH PUBLIC key (the .pub file), used to create the EC2 key pair"
  type        = string
}

variable "db_name" {
  description = "Initial PostgreSQL database name"
  type        = string
  default     = "papertrail"
}

variable "db_username" {
  description = "Master username for RDS PostgreSQL"
  type        = string
  default     = "papertrail"
}

variable "db_password" {
  description = "Master password for RDS PostgreSQL (set in terraform.tfvars, never commit)"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}
