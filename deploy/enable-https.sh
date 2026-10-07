#!/usr/bin/env bash
set -euo pipefail
if [[ ${EUID} -ne 0 ]]; then echo "Run with sudo."; exit 1; fi
if [[ ${CERTBOT_AGREE_TOS:-} != yes ]]; then
  echo "Confirm the Let's Encrypt subscriber agreement before running: CERTBOT_AGREE_TOS=yes"
  exit 1
fi
cert_email=${1:?"Provide your Let's Encrypt contact email"}
project_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$project_dir"
mkdir -p nginx/certbot/conf nginx/certbot/www .deployment
docker run --rm \
  -v "$project_dir/nginx/certbot/conf:/etc/letsencrypt" \
  -v "$project_dir/nginx/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --non-interactive --agree-tos --email "$cert_email" \
  --webroot -w /var/www/certbot -d ogk-gym-tracker.koreacentral.cloudapp.azure.com
python3 - <<'PYTHON'
from pathlib import Path
import re
p=Path('.env')
s=p.read_text()
for key,value in [('FRONTEND_URL','https://ogk-gym-tracker.koreacentral.cloudapp.azure.com'),('NGINX_CONFIG','./nginx/https.conf')]:
    if re.search(r'^'+key+r'=',s,re.M): s=re.sub(r'^'+key+r'=.*$',key+'='+value,s,flags=re.M)
    else: s+='\n'+key+'='+value+'\n'
p.write_text(s)
p.chmod(0o600)
PYTHON
docker compose config --quiet
docker compose up -d --force-recreate backend nginx
docker compose exec -T nginx nginx -t
# Preserve existing root cron jobs and replace only this project's renewal entry.
cron_existing=$(crontab -l 2>/dev/null || true)
{ printf '%s\n' "$cron_existing" | sed '/# gym-tracker-certificate-renewal$/d';
   printf '17 3,15 * * * /bin/bash %s/deploy/renew-certificates.sh >> %s/.deployment/certbot-renewal.log 2>&1 # gym-tracker-certificate-renewal\n' "$project_dir" "$project_dir";
} | crontab -
echo "HTTPS enabled; certificate renewal scheduled twice daily."
