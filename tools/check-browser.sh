#!/bin/sh
set -e
cd "$(dirname "$0")/.."

CHROME=""
for c in \
  "/c/Program Files/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
  "$LOCALAPPDATA/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  "/c/Program Files/Microsoft/Edge/Application/msedge.exe"
do
  [ -n "$c" ] && [ -f "$c" ] && { CHROME="$c"; break; }
done

if [ -z "$CHROME" ]; then
  echo "  ChromeもEdgeも見つかりません。ブラウザ検証は飛ばします。"
  echo "  （失敗ではありません。手で開けば同じ結果が出ます）"
  exit 0
fi

root=$(pwd -W 2>/dev/null || pwd)
fail=0

echo "ブラウザで動かして数えます"
echo ""

for name in verify-chrome; do
  page="templates/creator/preview/$name.html"
  if [ ! -f "$page" ]; then
    echo "  ※ $page がありません"
    fail=1
    continue
  fi

  dom=$("$CHROME" --headless --disable-gpu --no-sandbox \
          --virtual-time-budget=8000 --dump-dom "file:///$root/$page" 2>/dev/null || true)

  summary=$(printf '%s' "$dom" | sed -n 's/.*<p id="summary">\([^<]*\)<\/p>.*/\1/p' | head -1)

  if [ -z "$summary" ]; then
    printf "  ※ %-16s 結果を読み取れませんでした\n" "$name"
    fail=1
    continue
  fi

  case "$summary" in
    *"NG 0")
      printf "  OK %-16s %s\n" "$name" "$summary"
      ;;
    *)
      printf "  ※ %-16s %s\n" "$name" "$summary"
      printf '%s' "$dom" | sed -n 's/.*<li class="ng">\([^<]*\)<\/li>.*/     NG: \1/p'
      printf '%s' "$dom" | tr '<' '\n' | sed -n 's/^li class="ng">\(.*\)/     NG: \1/p'
      fail=1
      ;;
  esac
done

echo ""
exit "$fail"

