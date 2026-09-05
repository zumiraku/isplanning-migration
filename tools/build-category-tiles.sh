#!/bin/sh
# build-category-tiles.sh — the 46 tiles in the product page's second tab
#
# They live in design_detailpage.txt, inside tab-content2. They were invisible
# in the archived HTML because the tab is closed by default, which is why the
# rebuild had none of them until the template itself was read
# (docs/product-tabs.md).
#
# 🔴 The hrefs are left as /shopbrand/... deliberately. Creator Mode serves
# categories at /view/category/... (C33), so every one of these will need
# rewriting - unless URL一括設定 can re-create the current URLs, in which case
# none of them will. That test has not been run, and guessing wrong in either
# direction produces 46 broken links. See docs/creator-mode-urls.md.
#
# Output: templates/creator/mode/category-tiles.tpl
# Needs Git Bash (perl). Run from the repository root.

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

# --- リンクを新URLに書き換える -----------------------------------------------
# 🔴 以前はここを /shopbrand/... のまま残していました。「URL一括設定で旧URLを
#    再現できるか未検証だから」という理由でしたが、検証は済んでいます。
#    切替後にしか投入できず、投入するまで404。フリーページの内部リンク379本は
#    その結論を受けて /view/page/... に書き換えてあります。ここだけ残っていました。
#
#    このタイル46枚は、トップ・商品詳細のタブ・商品検索結果に出ます。
#    **カテゴリへの主要な入口です。** リダイレクト頼みにする理由がありません。
perl tools/_rewrite-tile-urls.pl package/url-bulk/categories-url.csv "$out"

old=$(grep -c 'href="/shopbrand/' "$out" || true)
echo "旧URLの残り  : $old"
[ "$old" -eq 0 ] || { echo "  旧URLが残っています"; exit 1; }
