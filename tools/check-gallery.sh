#!/bin/sh
# check-gallery.sh — does 商品詳細 put every sub-image into the gallery?
set -e
cd "$(dirname "$0")/.."

TPL=templates/creator/mode/detail.tpl
OUT="${TMPDIR:-/tmp}/gallery-check"
mkdir -p "$OUT"

fail=0

count() { grep -o "$2" "$1" | wc -l | tr -d ' '; }

check() {
  label="$1"; fixture="$2"; want_slides="$3"; want_dots="$4"; want_thumbs="$5"
  node tools/render-smarty.js "$TPL" "tools/fixtures/$fixture" > "$OUT/$fixture.html"

  s=$(count "$OUT/$fixture.html" 'class="gallery__slide"')
  d=$(count "$OUT/$fixture.html" 'data-gallery-dot')
  t=$(count "$OUT/$fixture.html" 'class="gallery__thumb"')

  status="OK"
  if [ "$s" != "$want_slides" ] || [ "$d" != "$want_dots" ] || [ "$t" != "$want_thumbs" ]; then
    status="NG"; fail=1
  fi
  printf "  %-14s slides %2s/%-2s  dots %2s/%-2s  thumbs %2s/%-2s  %s\n" \
    "$label" "$s" "$want_slides" "$d" "$want_dots" "$t" "$want_thumbs" "$status"
}

echo "商品詳細のギャラリー — 3つの商品の形で描画して数える"
echo ""
check "追加画像のみ" item-addimage.json 6 6 6
check "画像なし"     item-noimage.json  1 0 0
check "両方"         item-both.json     6 6 6

echo ""
numbered=$(grep -o 'data-gallery-slide="[0-9]' "$OUT/item-both.json.html" | wc -l | tr -d ' ')
if [ "$numbered" != "0" ]; then
  echo "  NG  data-gallery-slide に番号が書かれています（$numbered 件）"
  echo "      2つのループをまたいで通し番号は続けられません。"
  echo "      番号は付けず、gallery.js にDOM上の位置から数えさせてください。"
  fail=1
else
  echo "  OK  data-gallery-slide に番号なし（DOM順で数える前提が保たれています）"
fi

empty=$(grep -o 'src=""' "$OUT/item-addimage.json.html" | wc -l | tr -d ' ')
if [ "$empty" != "0" ]; then
  echo "  NG  src が空の <img> が $empty 件あります（タグ名の綴り違いの疑い）"
  fail=1
else
  echo "  OK  空の src なし"
fi

echo ""
if [ "$fail" -eq 0 ]; then
  echo "ギャラリー: 全項目 OK"
else
  echo "ギャラリー: 失敗あり"
fi
exit $fail

