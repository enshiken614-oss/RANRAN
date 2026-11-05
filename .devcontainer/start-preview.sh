#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

preview_ready() {
  curl --silent --fail --max-time 2 http://127.0.0.1:3000 > /dev/null
}

if preview_ready; then
  echo 'HER UNIVERSE 已在 3000 端口运行。'
  exit 0
fi

nohup npm run dev -- --port 3000 > /tmp/her-universe-preview.log 2>&1 < /dev/null &

for attempt in {1..45}; do
  if preview_ready; then
    echo 'HER UNIVERSE 已启动。打开 Ports（端口）中的 3000 即可预览。'
    exit 0
  fi
  sleep 1
done

echo '预览启动未完成，请在终端查看 /tmp/her-universe-preview.log。' >&2
exit 1
