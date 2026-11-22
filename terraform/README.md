# PaperTrail Infrastructure (Terraform)

Provisions the AWS infrastructure for the PaperTrail backend: a VPC with public and private subnets, a bastion jump host, a private app VM, NAT for outbound internet, RDS PostgreSQL, and an ECR repository. The server is configured and the container deployed afterwards with Ansible (see `../ansible/`).

## What it creates

| Resource | Purpose |
|----------|---------|
| VPC (`10.0.0.0/16`) | Isolated virtual network |
| Public subnet (`10.0.1.0/24`) + IGW + public route table | Bastion and NAT gateway |
| Private subnets (`10.0.2.0/24`, `10.0.3.0/24`) + NAT + private route table | App VM and RDS (no public IPs) |
| Bastion EC2 (`t3.micro`) + Elastic IP | SSH jump host; SSH only from `allowed_ssh_cidr` |
| App EC2 (`t3.micro`) in private subnet | Runs the Docker container; SSH only from bastion SG |
| RDS PostgreSQL (`db.t3.micro`) | Quiz attempt history; port 5432 only from app SG |
| ECR repository | Private image registry (`force_delete = true` for easy teardown) |

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) 1.5 or later
- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`, then `aws sts get-caller-identity`)
- An SSH key pair (`ssh-keygen -t ed25519`)

Never put AWS access keys in `.tf` or `.tfvars` files.

## Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `aws_region` | yes | none | AWS region |
| `availability_zones` | yes | none | Exactly two AZ names, e.g. `["eu-north-1a", "eu-north-1b"]` |
| `allowed_ssh_cidr` | yes | none | Your public IPv4 + `/32`. `0.0.0.0/0` is rejected |
| `ssh_public_key` | yes | none | Contents of your SSH **public** key (`.pub` file) |
| `db_password` | yes | none | RDS master password (sensitive) |
| `project_name` | no | `papertrail` | Name prefix and tags |
| `environment` | no | `dev` | Environment name |
| `vpc_cidr` | no | `10.0.0.0/16` | VPC range |
| `public_subnet_cidr` | no | `10.0.1.0/24` | Public subnet |
| `private_subnet_cidr` | no | `10.0.2.0/24` | Private subnet A (app) |
| `private_subnet_cidr_b` | no | `10.0.3.0/24` | Private subnet B (RDS second AZ) |
| `instance_type` | no | `t3.micro` | EC2 size |
| `app_port` | no | `3000` | Container listen port |
| `db_name` / `db_username` | no | `papertrail` | RDS database and user |
| `db_instance_class` | no | `db.t3.micro` | RDS size |

## How to use

1. Create your variables file from the template and fill in real values:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```
   Get your IPv4 with `curl -4 ifconfig.me` (add `/32`). `terraform.tfvars` is git-ignored: never commit it.
2. Initialise, check, and preview:
   ```bash
   terraform init
   terraform fmt
   terraform validate
   terraform plan -out=tfplan
   ```
3. Apply the saved plan:
   ```bash
   terraform apply "tfplan"
   ```
4. Share these outputs with the team:
   ```bash
   terraform output bastion_public_ip
   terraform output app_private_ip
   terraform output rds_endpoint
   terraform output ecr_repository_url
   terraform output -raw database_url
   ```
5. SSH to the app through the bastion:
   ```bash
   ssh -i ~/.ssh/id_ed25519 -J ubuntu@<bastion_public_ip> ubuntu@<app_private_ip>
   ```

## Key outputs for the team

| Output | Who needs it |
|--------|----------------|
| `bastion_public_ip` | Josiane (Ansible ProxyJump), Esther (live URL) |
| `app_private_ip` | Josiane (inventory host) |
| `rds_endpoint` / `database_url` | App `DATABASE_URL` / docker-compose |
| `ecr_repository_url` | Josiane + Yvette (CD image push/pull) |

## Clean up

```bash
terraform destroy
```

NAT Gateway and RDS incur ongoing cost — destroy when you are done. After a new `apply`, IPs change, so update the Ansible inventory.

## Security notes

- SSH to the bastion is only from `allowed_ssh_cidr`. The app VM accepts SSH only from the bastion security group.
- RDS is not publicly accessible; only the app security group can reach port 5432.
- State files (`*.tfstate`) and `terraform.tfvars` can contain secrets and are git-ignored.
- Accepted Checkov risks are documented in the repository's `SECURITY.md`.
