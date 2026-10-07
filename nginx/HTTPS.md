# Future HTTPS setup

Compose reserves host port 443, mounts `/etc/letsencrypt`, and serves an HTTP-01 challenge webroot. The current server listens on port 80 only. HTTPS is not enabled and no certificates are supplied. The configured hostname is `ogk-gym-tracker.koreacentral.cloudapp.azure.com`.

For `ogk-gym-tracker.koreacentral.cloudapp.azure.com`:

1. Point its DNS to your VM and permit inbound ports 80 and 443.
2. Set the HTTP server's `server_name` to your domain and obtain a Let's Encrypt certificate using Certbot's webroot mode, with the mounted `nginx/certbot/www` directory as the webroot. Store Certbot's configuration under `nginx/certbot/conf`.
3. Add a separate TLS server with `listen 443 ssl`, your domain's `server_name`, and the actual `ssl_certificate` and `ssl_certificate_key` paths from Certbot. Copy the frontend and backend proxy locations from the HTTP server into it.
4. Keep the ACME challenge location on HTTP; redirect other HTTP requests to HTTPS after verifying the TLS configuration with `nginx -t`.
5. Set `FRONTEND_URL` in the root `.env` to the exact HTTPS origin. Use the same-origin frontend build argument `/backend/api`.
6. Configure automatic Certbot renewal and reload Nginx after renewal. Keep certificate private keys out of source control.

Azure HTTP deployment is complete. Certificate issuance remains pending a contact email and authorization to accept the Let’s Encrypt subscriber agreement. The prepared `deploy/enable-https.sh` automates certificate issuance, configuration activation, and renewal scheduling; see DEPLOYMENT.md.
