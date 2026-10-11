#!/bin/sh
src="templates/basic-export/design/design_detailpage.txt"
out="${1:-templates/creator/mode/category-tiles.tpl}"

[ -f "$src" ] || { echo "no $src"; exit 1; }

{
  echo '<{* =========================================================================='
  echo '     商品カテゴリー一覧 — 商品詳細ページ タブ2の中身'
  echo ''
  echo '     Source : templates/basic-export/design/design_detailpage.txt'
  echo '     Build  : sh tools/build-category-tiles.sh'
  echo ''
  echo '     GENERATED - do not hand-edit.'
  echo ''
  echo '     The hrefs are Basic Mode URLs. Creator Mode serves categories at'
  echo '     /view/category/..., so these need rewriting unless URL一括設定 can'
  echo '     preserve the current addresses. C33.'
  echo '   ========================================================================== *}>'
  echo ''
  echo '<ul class="tilegrid">'
  awk "/id=\"tab-content2\"/,/id=\"tab-content3\"/" "$src" \
    | perl -CSD -0777 -ne '
        while (m{<a href="([^"]*)"><img alt="([^"]*)"\s*src="([^"]*)"><div class="textboxisp">([^<]*)}gs) {
          printf("  <li><a href=\"%s\"><img src=\"%s\" alt=\"%s\" loading=\"lazy\"><div class=\"tilecap\">%s</div></a></li>\n", $1, $3, $2, $4);
        }'
  echo '</ul>'
} > "$out"

n=$(grep -c '<li>' "$out")
echo ""
echo "tiles written : $n   (the live page has 46)"
echo "template      : $out"
[ "$n" -eq 46 ] || { echo "  MISMATCH - the extraction missed some"; exit 1; }

perl tools/_rewrite-tile-urls.pl package/url-bulk/categories-url.csv "$out"

old=$(grep -c 'href="/shopbrand/' "$out" || true)
echo "旧URLの残り  : $old"
[ "$old" -eq 0 ] || { echo "  旧URLが残っています"; exit 1; }

