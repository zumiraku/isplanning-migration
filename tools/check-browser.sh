#!/bin/sh
# =============================================================================
#  check-browser.sh — JavaScript が本当に動くかを、ブラウザで数える
#
#  🔴 2026-09-09、見る対象を入れ替えました
#
#     ここで回していたのは verify-pricing / verify-gallery / verify-tabs /
#     verify-quote-prefill / verify-price-format の5本でした。**どれも
#     こちらが設計したJSの台**で、移植で全部無くなりました。ファイルごと
#     消えているので、直前まで「5本とも 🔴 ファイルがありません」と出す
#     だけの検査になっていました。
#
#     いま見るのは all-pages.js の中身です（port-chrome.js と
#     search-submit.js）。
#
#       上部固定       スクロールで #headerWrap に .fixed が付く
#       引き出しメニュー ☰ で開く / × と Esc と背景で閉じる
#       画像の拡大     data-zoom で重なる / × と Esc で閉じる
#       検索欄の Enter リンクのクリックに変わる／欄の外では飛ばない
#
#     どれも新しく書いたコードで、他に試す場所がありません。
#
#  🔴 「開くこと」だけでなく「閉じること」も見ます
#
#     閉じないライトボックスは、スマホでは戻れなくなります。開く側だけ
#     試して満足すると、その手の壊れ方は最後まで見つかりません。
#
#  ChromeもEdgeも無い環境では飛ばします（失敗にはしません）。
# =============================================================================
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
    echo "  🔴 $page がありません"
    fail=1
    continue
  fi

  dom=$("$CHROME" --headless --disable-gpu --no-sandbox \
          --virtual-time-budget=8000 --dump-dom "file:///$root/$page" 2>/dev/null || true)

  summary=$(printf '%s' "$dom" | sed -n 's/.*<p id="summary">\([^<]*\)<\/p>.*/\1/p' | head -1)

  if [ -z "$summary" ]; then
    printf "  🔴 %-16s 結果を読み取れませんでした\n" "$name"
    fail=1
    continue
  fi

  # NG の件数が 0 のときだけ通します。
  case "$summary" in
    *"NG 0")
      printf "  OK %-16s %s\n" "$name" "$summary"
      ;;
    *)
      printf "  🔴 %-16s %s\n" "$name" "$summary"
      # 落ちた項目を並べます。件数だけ見ても直せません。
      printf '%s' "$dom" | sed -n 's/.*<li class="ng">\([^<]*\)<\/li>.*/     NG: \1/p'
      printf '%s' "$dom" | tr '<' '\n' | sed -n 's/^li class="ng">\(.*\)/     NG: \1/p'
      fail=1
      ;;
  esac
done

echo ""
exit "$fail"
