#!/bin/sh
# 共通head管理が読む2本目のCSS。配信は gigaplus のまま、控えは check-css-coverage.sh 用（オフラインでも検査できるように）
set -e
cd "$(dirname "$0")/../.."

out=templates/basic-export/external
mkdir -p "$out"

url="https://gigaplus.makeshop.jp/isplanning/css/default.css"
dst="$out/gigaplus-default.css"

code=$(curl -sS -m 30 -A "Mozilla/5.0" -o "$dst.new" -w "%{http_code}" "$url" || echo 000)
if [ "$code" != "200" ]; then
  rm -f "$dst.new"
  echo "※ 取得できません（HTTP $code）。控えはそのままにします。" >&2
  exit 1
fi

# エラーページを控えにしない
if ! grep -q '^\.' "$dst.new"; then
  rm -f "$dst.new"
  echo "※ CSSに見えません。控えはそのままにします。" >&2
  exit 1
fi

mv "$dst.new" "$dst"
printf "取得   : %s\n" "$url"
printf "控え   : %s\n" "$dst"
printf "サイズ : %s バイト / クラス %s 個\n" "$(wc -c < "$dst" | tr -d ' ')" "$(grep -c '^\.' "$dst" | tr -d ' ')"
