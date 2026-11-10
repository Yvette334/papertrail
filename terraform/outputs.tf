output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app.id
}

output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "Public (Elastic) IP of the application server, used for the Ansible inventory"
  value       = aws_eip.app.public_ip
}

output "app_url" {
  description = "URL where the app will be reachable once deployed"
  value       = "http://${aws_eip.app.public_ip}:${var.app_port}"
}

output "ssh_command" {
  description = "Example SSH command (replace the key path with your private key)"
  value       = "ssh -i <path-to-private-key> ubuntu@${aws_eip.app.public_ip}"
}
