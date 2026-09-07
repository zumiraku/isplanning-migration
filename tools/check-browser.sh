#!/bin/sh
# =============================================================================
#  check-browser.sh — ブラウザでしか確かめられない4本を、自動で走らせる
#
#  この4本はずっと「PowerShellとChromeで手作業」と書いてありました。
#
#  🔴 手作業と書いた検証は、走らなくなります。
#
#     tag-balance の失敗は、誰かが思い出したときにだけ叩く道具だったせいで
#     何日も出力の中に埋もれていました。同じことです。ヘッドレスChromeは
#     この環境に入っており、check-responsive.ps1 が既に使っています。
#     使えるのに手作業のままにしておく理由がありません。
#
#  各ページは結果を <title> に書き出します。合否はそこから読みます。
#
#    OK 13                 全部合格
#    OK 10 +1要目視        合格。ただし目で見ないと分からない項目が1つ
#    NG 2                  2件不合格
#    全103件合格 / 不合格N件  （価格計算だけ書式が別）
#
#  「要目視」は失敗にしません。**人が見て判断する項目**です。数は出します。
#
#  Chrome か Edge を探します。見つからないときは飛ばして 0 を返します。
#  ここで止めると、Chromeの無い環境で check-all.sh が丸ごと落ちます。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

CHROME=""
for c in \
  "/c/Program Files/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
  "$LOCALAPPDATA/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  "/c/Program Files/Microsoft/Edge/Application/msedge.exe" \
  "$(command -v google-chrome 2>/dev/null)" \
  "$(command -v chromium 2>/dev/null)"
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
pending_total=0

for name in verify-pricing verify-gallery verify-tabs verify-quote-prefill verify-price-format; do
  page="templates/creator/preview/$name.html"
  [ -f "$page" ] || { echo "  🔴 $page がありません"; fail=1; continue; }

  title=$("$CHROME" --headless --disable-gpu --no-sandbox \
            --virtual-time-budget=8000 --dump-dom "file:///$root/$page" 2>/dev/null \
          | sed -n 's/.*<title>\([^<]*\)<\/title>.*/\1/p' | head -1)

  if [ -z "$title" ]; then
    printf "  🔴 %-22s 結果を読み取れませんでした\n" "$name"
    fail=1
    continue
  fi

  # 「要目視」の件数は数えるだけ。失敗にはしません。
  p=$(printf '%s' "$title" | sed -n 's/.*+\([0-9]*\)要目視.*/\1/p')
  [ -n "$p" ] && pending_total=$((pending_total + p))

  case "$title" in
    NG*|*不合格*)
      printf "  🔴 %-22s %s\n" "$name" "$title"
      fail=1
      ;;
    *)
      printf "  OK %-22s %s\n" "$name" "$title"
      ;;
  esac
done

echo ""
if [ "$pending_total" -gt 0 ]; then
  echo "  目で見て判断する項目が $pending_total 件あります。"
  echo "  ブラウザで該当ページを開いて確認してください（失敗ではありません）。"
fi

exit "$fail"
