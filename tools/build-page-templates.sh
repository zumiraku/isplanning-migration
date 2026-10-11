#!/bin/sh
set -e
cd "$(dirname "$0")/.."

src=templates/creator/mode
out=package/templates
mkdir -p "$out"

PAGES="top:top category:category detail:detail search:search cart:cart
news-list:news-list news-detail:news-detail company:company guide:guide
contract:contract policy:policy"

echo "配布:"
for pair in $PAGES; do
  page=${pair%%:*}
  file=${pair##*:}
  s="$src/$file.tpl"
  [ -f "$s" ] || { echo "  ※ 生成元がありません: $s" >&2; exit 1; }

  n=$(grep -c '<!doctype html>' "$s" || true)
  if [ "$n" != "1" ]; then
    echo "  ※ $file.tpl の <!doctype html> が $n 個です（1個であるべき）" >&2
    exit 1
  fi

  cp "$s" "$out/$page.tpl"
  printf "  %-22s %6s 行  %7s バイト\n" "$page.tpl" "$(wc -l < "$out/$page.tpl")" "$(wc -c < "$out/$page.tpl")"
done

mkdir -p package/modules

echo ""
echo "モジュール:"
for m in header leftmenu footer calendar1 calendar2 freespace_calendar; do
  printf "  %-22s %7s バイト  (tools/port/build-chrome.js が生成)\n" "$m.tpl" "$(wc -c < "package/modules/$m.tpl")"
done

node tools/port/strip-template-comments.js

echo ""
echo "package : $out"
echo ""
echo "各ファイルは完全なHTML文書です。そのページ種別のHTML欄に"
echo "Ctrl+A → Ctrl+V で丸ごと置き換えてください。"

