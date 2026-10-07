#!/usr/bin/env bash
set -euo pipefail
project_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$project_dir"
docker run --rm \
  -v "$project_dir/nginx/certbot/conf:/etc/letsencrypt" \
  -v "$project_dir/nginx/certbot/www:/var/www/certbot" \
  certbot/certbot renew --quiet --webroot -w /var/www/certbot
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload
