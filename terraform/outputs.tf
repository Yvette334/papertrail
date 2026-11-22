output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "private_subnet_id" {
  description = "ID of the primary private subnet (app VM)"
  value       = aws_subnet.private_a.id
}

output "bastion_security_group_id" {
  description = "ID of the bastion security group"
  value       = aws_security_group.bastion.id
}

output "security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app.id
}

output "bastion_instance_id" {
  description = "ID of the bastion EC2 instance"
  value       = aws_instance.bastion.id
}

output "bastion_public_ip" {
  description = "Public IP of the bastion host (SSH jump box / Ansible ProxyJump)"
  value       = aws_eip.bastion.public_ip
}

output "instance_id" {
  description = "ID of the application EC2 instance"
  value       = aws_instance.app.id
}

output "app_private_ip" {
  description = "Private IP of the application server (reach via bastion)"
  value       = aws_instance.app.private_ip
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint hostname (use in DATABASE_URL)"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS PostgreSQL port"
  value       = aws_db_instance.main.port
}

output "database_url" {
  description = "Connection string for the app (sensitive)"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.db_name}"
  sensitive   = true
}

output "ecr_repository_url" {
  description = "ECR repository URL for docker push/pull"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = aws_ecr_repository.app.name
}

output "app_url" {
  description = "Public URL once traffic is reachable via the bastion (or a reverse proxy on it)"
  value       = "http://${aws_eip.bastion.public_ip}:${var.app_port}"
}

output "ssh_command" {
  description = "SSH to the app VM through the bastion"
  value       = "ssh -i <path-to-private-key> -J ubuntu@${aws_eip.bastion.public_ip} ubuntu@${aws_instance.app.private_ip}"
}
