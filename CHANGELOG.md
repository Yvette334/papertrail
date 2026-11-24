# Changelog

All notable changes to the PaperTrail project are documented in this file.

## [Summative] - 2026-11-18

### Added

- Bastion host in public subnet for secure SSH access
- App VM moved to private subnet
- NAT gateway for outbound internet from the private subnet
- RDS PostgreSQL managed database
- ECR private container registry
- CD pipeline (`cd.yml`): triggers on main, pushes to ECR, runs Ansible
- Quiz attempt history saved to RDS
- Architecture diagram

## [Formative 3] - 2026-11-10

### Added

- Terraform: VPC, subnet, EC2, security groups
- Ansible with roles: docker, app, security (UFW, SSH hardening)
- Security scans: npm audit, Trivy, Checkov

## [Formative 2] - 2026-10-29

### Added

- Multi-stage Dockerfile (Node 24, Alpine 3.23)
- Docker Compose with named network and healthcheck
- CI pipeline: lint, test, Docker build, smoke test, dependency scan, image scan

## [Formative 1] - 2026-10-23

### Added

- Express API with questions and quiz endpoints
- 15 Jest tests
- Branch protection ruleset
- GitHub Projects board

---

## Versioning

Changes are grouped by assignment milestone and feature phase to make the project's development history easy to follow.
