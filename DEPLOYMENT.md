# Azure deployment — October 7, 2026

- Repository: https://github.com/oaksoethaww/project-2
- VM: `ogk-gym-tracker.koreacentral.cloudapp.azure.com`
- SSH user: `azureuser`
- Project directory on VM: `/home/azureuser/project-2`
- VM public outgoing IP: `40.82.129.5`

## Completed

The source was pushed to GitHub without secrets and cloned to the VM. Docker Engine and the Compose plugin were installed from Docker's official Ubuntu repository. Both Docker images built successfully. The frontend, backend, and reverse-proxy containers started; the backend health check passed. Nginx configuration validation passed.

The public HTTP frontend, a React deep link, backend health endpoint, authentication rejection, invalid registration validation, and allowed-origin preflight were checked. Production frontend assets use `/backend/api`.

## HTTPS status

After the VM IP was added to Atlas, the MongoDB connection and ping succeeded. All 35 real API integration checks passed against the deployed app, including registration, password hashing in Atlas, login, JWT validation, workout CRUD, CORS, and user isolation. Test accounts and workouts were cleaned up.

HTTPS is active with a trusted Let’s Encrypt certificate. HTTP redirects to HTTPS. All 35 API integration checks passed over HTTPS. Renewal is scheduled twice daily through root cron, followed by an Nginx reload. The current certificate expires January 5, 2027.

## Operations

Connect using your original SSH key, then run:

```sh
cd /home/azureuser/project-2
sudo docker compose ps
sudo docker compose logs --tail=100 backend nginx
```

After pushing source changes, update and rebuild:

```sh
cd /home/azureuser/project-2
git pull --ff-only
sudo docker compose up --build -d
```

The VM's private root `.env` contains runtime secrets and has mode 600. It is excluded from Git and Docker build contexts. Do not print it in screenshots or logs. The SSH key is not stored on the VM or committed to GitHub.

## Certificate setup and maintenance

With HTTP reachable, and after agreeing to the Let's Encrypt subscriber agreement, use your real email:

```sh
cd /home/azureuser/project-2
sudo env CERTBOT_AGREE_TOS=yes bash deploy/enable-https.sh YOUR_EMAIL_ADDRESS
```

The script issues a certificate through the existing HTTP challenge webroot, selects `nginx/https.conf` through `NGINX_CONFIG`, changes `FRONTEND_URL` to HTTPS, recreates the backend and proxy containers, and validates Nginx. It installs a root cron entry to run `deploy/renew-certificates.sh` twice daily using the VM's timezone. Renewal uses Certbot and reloads Nginx afterward. Certificate keys and renewal logs remain ignored by Git.

The public app URL is https://ogk-gym-tracker.koreacentral.cloudapp.azure.com.
