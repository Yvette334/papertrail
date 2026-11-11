# Ansible: configure the PaperTrail server

This playbook configures the server created by Terraform. It installs Docker, runs the PaperTrail container from Docker Hub (`josianekk/papertrail:v2`), sets up a firewall and hardens SSH.

## What the playbook does

1. Updates the apt package list
2. Installs Docker and the Python Docker library
3. Starts Docker and enables it on boot
4. Runs the `papertrail` container on port 3000 with a restart policy
5. Installs UFW and allows only SSH (22) and the app (3000)
6. Disables root login and password login over SSH, then restarts SSH

## Files

| File | Purpose |
|---|---|
| `inventory.ini` | The server's IP address, login user and SSH key |
| `playbook.yml` | The tasks that configure the server |

## Prerequisites

- Ansible installed on your computer: `python3 -m pip install --user ansible-core`
- The extra collections:
  ```bash
  ansible-galaxy collection install community.docker community.general
  ```
- The server from the Terraform step, with its public IP
- The SSH private key for that server (for example `~/.ssh/papertrail-key`), with `chmod 400`. Its public key must be in the server's `~/.ssh/authorized_keys`
- The image `josianekk/papertrail:v2` public on Docker Hub
- The server's security group must allow port 3000, and SSH (port 22) from your own IP address (the `allowed_ssh_cidr` value in `terraform.tfvars`)

Never commit a private key. Key files are blocked by `.gitignore`.

## How to run

1. Open `inventory.ini` and replace `1.2.3.4` with the server's public IP from the Terraform output. Change `ansible_user` (`ubuntu` or `ec2-user`) and the key path if needed.

2. Check that Ansible can reach the server:
   ```bash
   ansible -i ansible/inventory.ini papertrail -m ping
   ```

3. Check the syntax:
   ```bash
   ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --syntax-check
   ```

4. Run the playbook:
   ```bash
   ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
   ```

## Check that it worked

```bash
curl http://SERVER_IP:3000/health
```
Expected response: `{"status":"ok","service":"papertrail"}`

## Security notes

- The firewall allows only ports 22 and 3000. Everything else is denied.
- Root login and password login are disabled, so only the SSH key can log in. Make sure the key works before running the playbook, or you can lock yourself out.
- The playbook is safe to run more than once: tasks only change what is not already set.
