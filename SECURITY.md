# Security

This document describes how security is handled in PaperTrail: how to report a problem, which automated scans run on every pull request, and what those scans found and how we dealt with it.

## Reporting a vulnerability

Please do not open a public issue for security problems. Report them privately to the team lead at `<team-lead-email>`, or through GitHub's "Report a vulnerability" option on the repository's Security tab if it is enabled. Include what you found, how to reproduce it, and the impact. We aim to acknowledge reports within a few days.

## Security scanning in CI

The workflow in `.github/workflows/ci.yml` runs on every pull request to `main` and on pushes to `main`. A failing scan blocks the merge.

| Scan | Tool | What it checks | Job name |
|------|------|----------------|----------|
| Infrastructure as Code scan | Checkov | Terraform configuration in `terraform/` for insecure settings | `iac-scan` |
| Dependency scan | `<tool, e.g. npm audit>` | Known vulnerabilities in Node.js dependencies | `<job name>` |
| Container image scan | `<tool, e.g. Trivy>` | Known vulnerabilities in the Docker image | `<job name>` |

> Rows marked with `<...>` are to be completed by the teammate who owns that scan. Delete rows for scans the team does not add (the brief requires at least two).

## Findings and how they were addressed

### IaC scan (Checkov) on `terraform/`

First run: 18 checks passed and 5 failed. After the changes below: 19 passed, 0 failed, 3 skipped with documented reasons. (The total went from 23 to 22 checks because removing the availability-zone data source removed one check.)

| Check | Finding | Decision | Details |
|-------|---------|----------|---------|
| CKV_AWS_382 | Security group allowed all outbound traffic to the internet | **Fixed** | Egress is now limited to TCP 443 (HTTPS) and TCP 80 (HTTP) for package and image downloads. |
| CKV_AWS_394 | Availability-zone data source was not pinned | **Fixed** | The data source and the explicit zone were removed from the subnet, so AWS chooses the zone. This removes a moving part. |
| CKV_AWS_126 | Detailed EC2 monitoring not enabled | **Accepted** | Detailed monitoring costs extra per instance and basic monitoring is enough for this project. Skipped inline in `main.tf` with the reason. |
| CKV2_AWS_11 | VPC flow logs not enabled | **Accepted** | Flow logs need an IAM role and CloudWatch resources, beyond the least-privilege deploy user used here, and add cost. Recommended for production. Skipped inline with the reason. |
| CKV2_AWS_41 | No IAM role attached to the EC2 instance | **Accepted** | The application does not call AWS APIs, so a role would only add credentials to the server. No role is the least-privilege choice. Skipped inline with the reason. |

Accepted risks are recorded next to the code as `#checkov:skip=<check>:<reason>` comments in `terraform/main.tf`, so the reason is visible in review.

### Dependency scan

`<Teammate: list the findings (package, severity, fix) and what was done: upgraded, replaced, or accepted with a reason.>`

### Container image scan

`<Teammate: list the findings and how they were addressed, or remove this section if the scan was not added.>`

## Other security measures in the repository

- `main` is protected: changes need a pull request, an approval, resolved conversations, and passing status checks.
- Secrets are never committed. `.env`, `terraform.tfvars`, Terraform state files and plan files are git-ignored, and `.env.example` / `terraform.tfvars.example` hold placeholders only.
- Terraform: SSH (port 22) is only open to a single admin IP (the variable rejects `0.0.0.0/0`), the instance requires IMDSv2, the root volume is encrypted, and the VPC's default security group has no rules.
- Docker: the container runs as the non-root `node` user, installs production dependencies only, and does not copy `.env` into the image.
- The API never returns the correct answer for a question before an attempt is submitted.
