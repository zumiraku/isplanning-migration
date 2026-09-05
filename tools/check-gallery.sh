#!/bin/sh
# =============================================================================
#  check-gallery.sh — does 商品詳細 put every sub-image into the gallery?
#
#  C22, in the client's words: 「サブ画像使用（スマホではスワイプできればと
#  思います）」. One of the two features named in the brief.
#
#  🔴 It was absent for a week and nothing caught it.
#
#     MakeShop has two kinds of extra product image and the gallery read one:
#
#       $item.multi_image   拡大画像   image_L / image_S
#       $item.add_image     追加画像   image_url + description
#
#     Product 000000022594 carries five add_image and no multi_image. The
#     gallery rendered one slide with nothing to swipe, while the five images
#     sat in a static block lower down the page - which looked fine. Smarty
#     drops an empty loop silently, so the template read correctly, the line
#     count in the console was right, and the page had no visible defect.
#
#     The dots were worse. Their CSS has been in components.css since the
#     beginning and no template ever emitted the markup, so they had never
#     appeared once. On a phone they are the only thing that says the images
#     scroll.
#
#  This renders 商品詳細 against three shapes of product and counts what comes
#  out. It runs here - no console, no paste, no preview.
#
#    追加画像のみ   main + 5 add    -> 6 slides, 6 dots, 6 thumbs
#    画像なし       main only       -> 1 slide,  0 dots, 0 thumbs
#    両方           main + 2 + 3    -> 6 slides, 6 dots, 6 thumbs
#
#  The last one matters beyond the count: the slides come from two loops, and
#  Smarty cannot continue a counter across them without a variable. That is why
#  data-gallery-slide no longer carries a number and gallery.js reads the
#  position from the DOM. If someone puts the numbering back, the middle of the
#  gallery starts jumping to the wrong slide - and this check will not catch it,
#  so it also asserts that no slide carries an index.
#
#  What it cannot tell you: whether $item.add_image is a real tag name. Only the
#  reference and the live preview answer that. It tells you what the template
#  does with the data it is given, which is the half that kept going wrong.
# =============================================================================
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
# The numbering must NOT come back. See the header.
numbered=$(grep -o 'data-gallery-slide="[0-9]' "$OUT/item-both.json.html" | wc -l | tr -d ' ')
if [ "$numbered" != "0" ]; then
  echo "  NG  data-gallery-slide に番号が書かれています（$numbered 件）"
  echo "      2つのループをまたいで通し番号は続けられません。"
  echo "      番号は付けず、gallery.js にDOM上の位置から数えさせてください。"
  fail=1
else
  echo "  OK  data-gallery-slide に番号なし（DOM順で数える前提が保たれています）"
fi

# The images have to survive as images, not as empty src.
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
