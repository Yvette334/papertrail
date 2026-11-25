# Ansible: PaperTrail server configuration

This directory configures the PaperTrail application server (the app VM in the private subnet) and deploys the container image from ECR.

The VM has no public IP. Ansible reaches it by SSH **through the bastion host**, using a `ProxyCommand` in the inventory.

## What it does

The playbook (`playbook.yml`) runs three roles, in this order:

| Role | What it does |
|---|---|
| `docker` | Updates apt, installs Docker, Docker Compose v2 and the Python Docker library, and makes sure Docker is running and starts on boot |
| `app` | Checks the deployment variables, installs the AWS CLI, logs in to ECR, copies the compose file to the server, pulls the image, runs `docker compose up -d`, and checks `/health` |
| `security` | Installs UFW (allows SSH and the app port, denies everything else), disables root SSH login and password SSH login |

The `app` role runs before `security`, so the app is deployed and health-checked before the firewall is tightened.

## Directory layout

```
ansible/
├── playbook.yml                  # runs the roles: docker, app, security
├── inventory.ini                 # target host + bastion proxy (key: .ansible_key)
├── inventory.ini.example         # template with placeholders
├── group_vars/all.yml            # defaults: app_port, app_name, ssh_port, ecr_region
├── templates/
│   └── docker-compose.yml.j2     # compose file copied to the server
└── roles/
    ├── docker/tasks/main.yml
    ├── app/tasks/main.yml
    └── security/
        ├── tasks/main.yml
        └── handlers/main.yml     # restarts SSH after config changes
```

## Variables

These must be passed with `-e` (they are never committed to git):

| Variable | Meaning |
|---|---|
| `docker_image` | Full image name, for example `<registry>/papertrail:<tag>` |
| `ecr_url` | ECR registry host (the part before `/papertrail`) |
| `database_url` | PostgreSQL connection string for the RDS database |
| `aws_access_key_id` | AWS access key used for the ECR login |
| `aws_secret_access_key` | AWS secret key used for the ECR login |

Defaults in `group_vars/all.yml`: `app_port: 3000`, `app_name: papertrail`, `ssh_port: 22`, `ecr_region: eu-north-1`.

The first task of the `app` role stops the run with a clear message if any of these is missing.

## Run it from your machine

Ansible does not run on native Windows. Use Linux, macOS or WSL.

**1. Install Ansible and the collections**

```bash
pipx install --include-deps ansible
ansible-galaxy collection install community.docker community.general
```

**2. Add your SSH key**

Copy the private key that matches the key pair in Terraform to `ansible/.ansible_key` and restrict it:

```bash
cp ~/.ssh/<your-key> ansible/.ansible_key
chmod 600 ansible/.ansible_key
```

Never commit this file. Delete it when you are done:

```bash
rm -f ansible/.ansible_key
```

**3. Check the inventory**

`inventory.ini` holds the app VM private IP and the bastion public IP from the Terraform outputs (`app_private_ip`, `bastion_public_ip`). If you redeploy the infrastructure, the IPs change, so update both `inventory.ini` and the GitHub secrets. `inventory.ini.example` shows the format with placeholders.

**4. Test the connection**

```bash
cd ansible
ansible -i inventory.ini papertrail -m ping
```

You should see `"ping": "pong"`.

**5. Put the variables in a file outside the repository**

```yaml
# ~/extra-vars.yml  (chmod 600, never commit)
docker_image: "<registry>/papertrail:latest"
ecr_url: "<registry>"
database_url: "postgresql://<user>:<password>@<rds-endpoint>:5432/papertrail"
aws_access_key_id: "<access key id>"
aws_secret_access_key: "<secret access key>"
```

**6. Run**

```bash
ansible-playbook -i inventory.ini playbook.yml --syntax-check
ansible-playbook -i inventory.ini playbook.yml -e @$HOME/extra-vars.yml
```

Run it a second time. The run should report almost no changes, which shows the playbook is idempotent.

## Check that it worked

The playbook ends with a health check task. You can also run the same check yourself. The app VM is private, so the request is made from the VM itself, through the bastion:

```bash
ansible -i inventory.ini papertrail -m uri -a "url=http://localhost:3000/health"
```

Expected response: `{"status":"ok","service":"papertrail"}`

## Run it from CI

The CD workflow (`.github/workflows/cd.yml`) runs this playbook on every merge to `main`, after the image is built, scanned and pushed to ECR. It reads these **GitHub Secrets**:

| Secret | Used for |
|---|---|
| `ANSIBLE_SSH_PRIVATE_KEY` | SSH key for the bastion and the app VM |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | ECR login |
| `ECR_REPOSITORY_URL` | Image name and registry |
| `DATABASE_URL` | Database connection string |
| `BASTION_IP`, `APP_VM_PRIVATE_IP` | Target addresses |

## Security choices

- **No secrets in git.** Keys, passwords and AWS credentials are passed at run time.
- **`no_log: true`** on the ECR login and the compose template, so credentials never appear in logs.
- **File mode `0600`** on the compose file on the server, because it contains `DATABASE_URL`.
- **Bastion-only access.** The app VM has no public IP, and SSH goes through the bastion.
- **Firewall and SSH hardening** in the `security` role: UFW default deny, root login off, password login off. Make sure your SSH key works before running the playbook, or you can lock yourself out.
- **Fail-fast variable check** with `ansible.builtin.assert`, so a half-configured run cannot deploy.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Connection timed out` to the bastion | The bastion security group does not allow your IP (`allowed_ssh_cidr`), or the instance is stopped |
| `Connection closed` during Gathering Facts | The SSH host-key prompt or the wrong key. The inventory already sets `StrictHostKeyChecking=no` and `IdentitiesOnly=yes` |
| `ansible-playbook` exit code 4 | The host is unreachable (see the two rows above) |
| `Log in to ECR` fails | Wrong or missing AWS credentials, no ECR permission, or the wrong `ecr_url`. Temporarily set `no_log: false` on that task to see the real error (never commit that change) |
| `NoCredentials` from `aws sts get-caller-identity` on the VM | The VM has no IAM role, so the keys must be passed with `-e` |
| `Pull the PaperTrail container image` fails with "not found" | The image is not in ECR yet. Run the CD pipeline once to push it |

## Known limitations

- Long-lived AWS keys are used for the ECR login. An IAM instance profile with ECR read access on the app VM would remove the need for stored keys.
- SSH on the bastion must be reachable from the CI runners, whose IPs change. Restricting it to a fixed range needs a self-hosted runner.
