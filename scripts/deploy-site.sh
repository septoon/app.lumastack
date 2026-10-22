#!/usr/bin/env bash
set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SSH_HOST="${SSH_HOST:-lumastack-selectel}"
[[ "$SSH_HOST" =~ ^[a-zA-Z0-9_.@-]+$ && "$SSH_HOST" != -* ]] || exit 1
cd "$PROJECT_DIR"
npm test
npm run build
ssh -o BatchMode=yes -o ConnectTimeout=10 "$SSH_HOST" "grep -q -- '--exclude=/android/releases/' /usr/local/sbin/deploy-app-lumastack && mkdir -p /home/deploy/app-lumastack-deploy/dist"
rsync -az --delete -e 'ssh -o BatchMode=yes -o ConnectTimeout=10' \
  --exclude='/source.json' --exclude='/icon.png' --exclude='/releases/' \
  --exclude='/android/releases/' --exclude='/android/latest.json' \
  --exclude='/android/history.json' --exclude='/android/previous.json' \
  --exclude='/android/.publisher-ready' \
  dist/ "$SSH_HOST:/home/deploy/app-lumastack-deploy/dist/"
ssh -o BatchMode=yes -o ConnectTimeout=10 "$SSH_HOST" 'sudo -n /usr/local/sbin/deploy-app-lumastack'
