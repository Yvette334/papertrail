# Security Policy

## Overview

PaperTrail takes application, dependency, container and infrastructure security seriously. Security checks are included in the development and CI workflow so that problems can be identified before changes are merged into `main`.

## Supported Version

The current `main` branch is the supported development version.

## Security Checks

PaperTrail uses several automated checks as part of Formative 3:

- **npm audit** checks Node.js dependencies for known vulnerabilities.
- **Trivy** scans the container image for known vulnerabilities and security issues.
- **Checkov** scans Terraform infrastructure-as-code for security and configuration problems.
- **GitHub Actions** runs the security checks as part of the CI workflow.
- Pull requests require the configured CI checks to pass before merging.

## Security Findings

The following table records findings identified by the project's security scans.

| Tool | Finding | Severity | Affected Component | Status | Remediation |
|---|---|---|---|---|---|
| npm audit | To be completed from CI results | — | Node.js dependencies | Pending | Review and update affected dependencies |
| Trivy | To be completed from CI results | — | Docker image | Pending | Review and remediate reported vulnerabilities |
| Checkov | To be completed from CI results | — | Terraform | Pending | Review and remediate reported configuration findings |

The table will be updated with the actual findings produced by the team's CI security scans.

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
