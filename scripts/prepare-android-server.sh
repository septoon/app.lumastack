#!/usr/bin/env bash
# Run once as root on the existing VPS, after reviewing this file.
set -Eeuo pipefail
[[ "$(id -u)" == 0 ]] || { echo 'Требуется root на VPS; deploy имеет право только на ограниченный frontend helper.' >&2; exit 1; }
helper=/usr/local/sbin/deploy-app-lumastack
nginx_site=/etc/nginx/sites-enabled/production-app.lumastack.ru
[[ -f "$helper" && -f "$nginx_site" && -d /var/www/app.lumastack.ru ]] || exit 1
[[ ! -L /var/www/app.lumastack.ru/android ]] || exit 1
stamp="$(date -u +%Y%m%d-%H%M%S)"
backup="/var/backups/app-lumastack/android-setup-$stamp"
mkdir -p "$backup"
cp -p "$helper" "$backup/helper"
cp -pL "$nginx_site" "$backup/nginx"
rollback() {
  cp -p "$backup/helper" "$helper"
  cp -p "$backup/nginx" "$nginx_site"
  echo "Подготовка остановлена; конфиги восстановлены из $backup" >&2
}
trap rollback ERR
touch /run/lock/app-lumastack-deploy.lock
chown root:root /run/lock/app-lumastack-deploy.lock
chmod 644 /run/lock/app-lumastack-deploy.lock
exec 9<>/run/lock/app-lumastack-deploy.lock
flock -n 9 || { echo 'Идёт другой деплой.' >&2; exit 1; }
export ENGINEER_NGINX_SITE="$nginx_site"
python3 - <<'PY'
from pathlib import Path
import os
helper=Path('/usr/local/sbin/deploy-app-lumastack')
s=helper.read_text()
if '--exclude=/android/releases/' not in s:
    assert '  --exclude=/releases/\n' in s, 'Unknown frontend helper layout'
    s=s.replace('  --exclude=/releases/\n','  --exclude=/releases/\n  --exclude=/android/releases/\n  --exclude=/android/latest.json\n  --exclude=/android/history.json\n  --exclude=/android/previous.json\n  --exclude=/android/.publisher-ready\n')
    helper.write_text(s)
p=Path(os.environ['ENGINEER_NGINX_SITE'])
s=p.read_text()
if '# Engineer Android distribution' not in s:
    assert '    location = /source.json {' in s, 'Unknown nginx layout'
    block='''    # Engineer Android distribution
    location = /android/latest.json {
        add_header Cache-Control "no-store" always;
        add_header Access-Control-Allow-Origin "*" always;
        try_files $uri =404;
    }
    location = /android/history.json {
        add_header Cache-Control "no-store" always;
        add_header Access-Control-Allow-Origin "*" always;
        try_files $uri =404;
    }
    location ^~ /android/releases/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        add_header Access-Control-Allow-Origin "*" always;
        add_header Content-Disposition "attachment" always;
        autoindex off;
        try_files $uri =404;
    }

'''
    s=s.replace('    location = /source.json {', block+'    location = /source.json {')
if '# Engineer portal routes' not in s:
    assert '    location = /source.json {' in s
    s=s.replace('    location = /source.json {', '''    # Engineer portal routes
    location ~ ^/(ios|android|changelog|help)/?$ {
        try_files /$1/index.html =404;
    }

    location = /source.json {''')
p.write_text(s)
PY
if ! bash -n "$helper" || ! nginx -t; then
  cp -p "$backup/helper" "$helper"
  cp -p "$backup/nginx" "$nginx_site"
  echo "Проверка не пройдена. Конфиги восстановлены из $backup" >&2
  exit 1
fi
install -d -o deploy -g deploy -m 2775 /var/www/app.lumastack.ru/android
install -d -o deploy -g deploy -m 2775 /var/www/app.lumastack.ru/android/releases
touch /var/www/app.lumastack.ru/android/.publisher-ready
chown deploy:deploy /var/www/app.lumastack.ru/android/.publisher-ready
systemctl reload nginx
trap - ERR
printf 'Android publishing ready. Backup: %s\n' "$backup"
