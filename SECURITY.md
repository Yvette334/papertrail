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

### Checkov (IaC scan on `terraform/`)

First run: 18 checks passed, 5 failed. After fixes: 19 passed, 0 failed, 3 skipped with documented reasons.

| Check | Finding | Decision | Details |
|---|---|---|---|
| CKV_AWS_382 | Security group allowed all outbound traffic to the internet | **Fixed** | Egress is now limited to TCP 443 (HTTPS) and TCP 80 (HTTP) for package and image downloads. |
| CKV_AWS_394 | Availability-zone data source was not pinned | **Fixed** | The data source and the explicit zone were removed from the subnet, so AWS chooses the zone. |
| CKV_AWS_126 | Detailed EC2 monitoring not enabled | **Accepted** | Detailed monitoring costs extra per instance; basic monitoring is sufficient for this project. Skipped inline in `main.tf` with the reason. |
| CKV2_AWS_11 | VPC flow logs not enabled | **Accepted** | Flow logs require an IAM role and CloudWatch resources beyond the least-privilege deploy user, and add cost. Recommended for production. Skipped inline with the reason. |
| CKV2_AWS_41 | No IAM role attached to the EC2 instance | **Accepted** | The application does not call AWS APIs, so attaching a role would only add credentials to the server. No role is the least-privilege choice. Skipped inline with the reason. |

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
