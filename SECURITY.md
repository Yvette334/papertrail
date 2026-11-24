# Security Policy

## Overview

PaperTrail takes application, dependency, container and infrastructure security seriously. Security checks are included in the development and CI workflow so that problems can be identified before changes are merged into `main`.

## Supported Version

The current `main` branch is the supported development version.

## Security Checks

PaperTrail uses several automated checks as part of Formative 3:

- **npm audit** checks Node.js dependencies for known vulnerabilities.
- **Trivy** scans the Docker container image for known vulnerabilities and misconfigurations.
- **Checkov** scans Terraform infrastructure-as-code for security and configuration problems.
- **GitHub Actions** runs the security checks on every pull request into `main`.
- Pull requests require the configured CI checks to pass before merging.

## Security Findings

The following table records findings identified by the project's security scans.

### npm audit

| Scope | Findings | Severity | Affected Component | Status | Remediation |
|---|---|---|---|---|---|
| Production only (`--omit=dev --audit-level=high`) | 0 vulnerabilities | — | Runtime dependencies | ✅ Clean | No action required |
| All dependencies | 23 findings (3 low, 20 moderate) | Low / Moderate | Dev tools only: Jest, ESLint, nodemon (deepmerge, glob, minimatch) | Accepted risk | Dev dependencies are never shipped in the container image. Running `npm audit fix --force` would downgrade Jest and ESLint. Risk accepted. |

### Trivy (container image scan)

| Image | Findings | Severity | Affected Component | Status | Remediation |
|---|---|---|---|---|---|
| Node 20.18.0 on Alpine 3.20.3 (before) | 45 findings (3 critical, 42 high) | Critical / High | OS packages: OpenSSL libcrypto3, libssl3, musl, zlib. npm bundled libs: tar, minimatch, brace-expansion, glob, cross-spawn, ip-address, pacote, sigstore | Fixed | Upgraded base image and removed npm from runtime image (see below) |
| Node 24.2.2 on Alpine 3.23 (after) | 0 findings | — | Docker image | ✅ Clean | Base image upgraded to Node 24.2.2 on Alpine 3.23, `apk upgrade` applied, npm removed from the runtime image (app starts with `node` directly) |

None of the findings were in application code. Verified in GitHub Actions: the red run on commit `59b5641` shows the original 45 findings; run #23 shows 0 findings after the fix.

### IaC scan (Checkov) on terraform/

Checkov scans the Terraform code on every pull request (iac-scan job). The job fails the pull request if any check fails, so every finding is either fixed or recorded below as an accepted risk with a reason. Accepted risks are also written next to the code as #checkov:skip=<check>:<reason> comments in terraform/main.tf.

Stage	Infrastructure	Passed	Failed	Skipped
Formative 3, first scan	One VM in a public subnet	18	5	0
Formative 3, after fixes	One VM in a public subnet	19	0	3
Summative, first scan	Private subnets, NAT gateway, bastion, RDS, ECR	51	5	12
Summative, after fixes	Same	52	0	15
Findings fixed
Check	Finding	What we did
CKV_AWS_382 (Formative 3)	Security group allowed all outbound traffic	Outbound is limited to the ports the servers need (HTTPS and HTTP).
CKV_AWS_394	Unpinned availability-zone data source	Availability zones now come from the availability_zones variable, so there is no unpinned lookup. [confirm this matches what you did]
CKV2_AWS_60	A skip was written for "copy tags to snapshots" with the wrong reason	The skip was removed. The setting is enabled (copy_tags_to_snapshot = true) and the check now passes.
Risks accepted (skipped with a reason)
Check	Resource	Why we accepted it	What production would do
CKV_AWS_126 Detailed monitoring	Bastion, app VM	Extra cost per instance; basic monitoring is enough for this project.	Enable detailed monitoring and alarms.
CKV2_AWS_41 IAM role on instance	Bastion	SSH-only host that never calls AWS APIs, so a role would only add permissions.	Keep it role-free, or use Session Manager instead of SSH.
CKV2_AWS_41 IAM role on instance	App VM	The deploy pipeline creates a short-lived ECR login token, so no long-lived AWS keys are stored on the VM. [confirm the pipeline really works this way]	Attach an instance role with read-only ECR access.
CKV_AWS_157 Multi-AZ	RDS	Doubles the database cost; not needed for a student project.	Enable Multi-AZ.
CKV_AWS_161 IAM database authentication	RDS	Needs extra IAM setup beyond the project scope; access is limited to the app security group and a password.	Enable IAM authentication.
CKV_AWS_118 Enhanced monitoring	RDS	Needs an extra IAM role; basic CloudWatch metrics are enough.	Enable enhanced monitoring.
CKV_AWS_353 Performance Insights	RDS	Extra cost for a small database.	Enable it for production workloads.
CKV_AWS_354 Performance Insights KMS	RDS	Not applicable while Performance Insights is off.	Encrypt with a customer-managed key if enabled.
CKV_AWS_293 Deletion protection	RDS	Must stay off so terraform destroy can remove the demo database and stop the cost.	Turn deletion protection on.
CKV_AWS_129 Log exports	RDS	Exported logs create CloudWatch log groups that can outlive terraform destroy and keep costing money.	Export logs and set a retention period.
CKV2_AWS_30 Query logging	RDS	Needs a custom database parameter group, beyond the project scope.	Add a parameter group that logs slow queries.
CKV_AWS_136 KMS encryption	ECR	Images are already encrypted with the AWS-managed AES256 default.	Use a customer-managed KMS key.
CKV_AWS_51 Immutable tags	ECR	The pipeline pushes :latest next to the commit-SHA tag, which an immutable repository would reject.	Deploy by commit SHA only and make tags immutable.
CKV2_AWS_11 VPC flow logs	VPC	Needs IAM and CloudWatch resources beyond the least-privilege deploy user used here.	Enable flow logs with a retention period.
CKV_AWS_24 SSH from 0.0.0.0/0	Bastion SG	GitHub-hosted runners have no stable IP, so the demo opens TCP 22 to the internet. Login is SSH-key only (password auth is off).	Restrict SSH to known IPs or use GitHub-hosted runner IP ranges / a self-hosted runner.

Accepted risks are recorded as `#checkov:skip=<check>:<reason>` comments in `terraform/main.tf`, so the rationale is visible during code review.

## Handling Security Issues

Security findings are reviewed by the team and tracked through GitHub Issues or pull requests where appropriate.

For each finding, the team records:

1. The security tool that detected it.
2. The affected component.
3. The severity.
4. The remediation required.
5. The current status.

Critical or high-severity findings should be reviewed and addressed as a priority before the affected change is merged or deployed.

## Secrets and Sensitive Configuration

Secrets must not be committed to the repository.

Environment-specific values should be stored in local environment files or the appropriate deployment secret store. The repository may contain `.env.example`, but it must contain variable names or safe example values rather than real credentials.

The `.gitignore` file excludes sensitive files such as `.env`.

## Pull Requests and Code Review

Changes to `main` are made through pull requests. Required CI checks and code review provide an additional security control before changes are merged.

Security-related changes should be reviewed by another team member and should not bypass the repository's required checks.

## Reporting a Security Issue

If a security issue is discovered, report it privately to the project team rather than publicly disclosing sensitive details before the issue has been reviewed.

Include:

- a description of the issue
- affected file, component or endpoint
- steps needed to reproduce the issue, where appropriate
- potential impact
- any suggested remediation

The team will review the report and track the required remediation through the repository's issue and pull-request workflow.
