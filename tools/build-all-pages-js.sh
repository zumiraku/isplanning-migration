#!/bin/sh
# build-all-pages-js.sh — 全ページ共通の JavaScript を組み立てる
set -e
cd "$(dirname "$0")/.."

out="${1:-templates/creator/mode/all-pages.js}"
hdr=templates/creator/js/_bundle-header.txt
parts="port-chrome search-submit"

[ -f "$hdr" ] || { echo "missing $hdr" >&2; exit 1; }

{
  cat "$hdr"
  first=1
  for p in $parts; do
    f="templates/creator/js/$p.js"
    [ -f "$f" ] || { echo "missing $f" >&2; exit 1; }
    [ "$first" -eq 1 ] || printf '\n'
    printf '/* ---------- %s.js ---------- */\n' "$p"
    cat "$f"
    first=0
  done
} > "$out"

printf "parts    : %s\n" "$parts"
printf "lines    : %s\n" "$(wc -l < "$out" | tr -d ' ')"
printf "bytes    : %s\n" "$(wc -c < "$out" | tr -d ' ')"
printf "output   : %s\n" "$out"
node --check "$out" && printf "構文     : OK\n"

