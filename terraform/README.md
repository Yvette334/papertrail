# PaperTrail Infrastructure (Terraform)

Provisions the AWS infrastructure for the PaperTrail backend: a VPC, a public subnet, network security rules, and one EC2 instance with a stable public IP. The server is configured and the container deployed afterwards with Ansible (see `../ansible/`).

## What it creates

| Resource | Purpose |
|----------|---------|
| VPC (`10.0.0.0/16`) | Isolated virtual network |
| Internet gateway, public subnet, route table + association | Gives the subnet a route to the internet |
| Default security group (no rules) | Locks down the VPC's default group |
| Application security group | SSH (22) from one admin IP only; app port (3000) open to the internet; outbound limited to HTTPS and HTTP for images and package downloads |
| Key pair | Created from your SSH **public** key so Ansible/you can log in |
| EC2 instance (Ubuntu 24.04 LTS, `t3.micro`) | Application server: IMDSv2 required, encrypted gp3 root volume |
| Elastic IP | Stable public IP for the server |

Resources: 10 in total. The Ubuntu image is looked up with data sources, not hardcoded.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) 1.5 or later
- [AWS CLI](https://aws.amazon.com/cli/) configured with an IAM user that can manage EC2/VPC resources (`aws configure`, then check with `aws sts get-caller-identity`)
- An SSH key pair (`ssh-keygen -t ed25519`)

Never put AWS access keys in `.tf` or `.tfvars` files. They are read from your AWS CLI configuration.

## Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `aws_region` | yes | none | AWS region (we use `<your-region>`) |
| `allowed_ssh_cidr` | yes | none | Your public IPv4 + `/32`. `0.0.0.0/0` is rejected by validation |
| `ssh_public_key` | yes | none | Contents of your SSH **public** key (`.pub` file) |
| `project_name` | no | `papertrail` | Name prefix and tags |
| `environment` | no | `dev` | Environment name |
| `vpc_cidr` | no | `10.0.0.0/16` | VPC range |
| `public_subnet_cidr` | no | `10.0.1.0/24` | Subnet range |
| `instance_type` | no | `t3.micro` | EC2 size |
| `app_port` | no | `3000` | Port the container listens on |

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
   Read the plan summary before continuing.
3. Apply the saved plan:
   ```bash
   terraform apply "tfplan"
   ```
4. Show the outputs:
   ```bash
   terraform output
   ```
5. Test SSH (the default user on the Ubuntu image is `ubuntu`):
   ```bash
   ssh -i ~/.ssh/id_ed25519 ubuntu@<instance_public_ip>
   ```

## Outputs

| Output | Description |
|--------|-------------|
| `vpc_id` | ID of the VPC |
| `public_subnet_id` | ID of the public subnet |
| `security_group_id` | ID of the application security group |
| `instance_id` | ID of the EC2 instance |
| `instance_public_ip` | Elastic IP: use it in the Ansible inventory |
| `app_url` | URL the app will be reachable on after deployment |
| `ssh_command` | Example SSH command |

## Clean up

The instance and Elastic IP cost money while they exist. When you have finished:

```bash
terraform destroy
```

Then check in the AWS console (region `<your-region>`) that the instance, Elastic IP and VPC are gone. After a new `apply` the public IP will be different, so update the Ansible inventory.

## Security notes

- SSH is only reachable from `allowed_ssh_cidr`. If you change network, your IP changes: update the variable and re-apply.
- State files (`*.tfstate`) and `terraform.tfvars` can contain sensitive data and are git-ignored.
- The lock file `.terraform.lock.hcl` is committed so everyone uses the same provider version.
- Security scan results and accepted risks are documented in the repository's `SECURITY.md`.
