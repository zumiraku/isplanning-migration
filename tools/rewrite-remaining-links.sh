#!/bin/sh
# =============================================================================
#  rewrite-remaining-links.sh — フリーページに残っていた旧URLを書き換える
#
#  ※ 277本が旧URLのままでした
#
#     rewrite-internal-links.sh が379本を /view/page/... に直した時点で、
#     内部リンクは片付いたことにしていました。実際には、そこで扱ったのは
#     `href="/html/pageNN.html"` の形だけです。残っていたもの:
#
#       /shopbrand/…    219本   カテゴリ
#       /shopdetail/…    23本   商品
#       /html/…          35本   絶対URL（https://www.isp-sp.com/html/…）で
#                               書かれていたため、前回のパターンに掛からず
#
#     カテゴリと商品は「URL一括設定で旧URLを再現できるか未検証だから」という
#     理由で保留されていました。検証は済んでいます。**切替後にしか投入できず、
#     投入するまでは404です。** 保留する理由はもうありません。
#
#     46枚のカテゴリタイルも同じ状態で、そちらは build-category-tiles.sh に
#     書き換えを組み込みました。
#
#  対応が取れないものは書き換えません。推測で当てると、別の商品やカテゴリへ
#  誘導することになります。1件でも残れば失敗として返します。
#
#  対象: templates/creator/freepages/*.html
#  カテゴリの対応表: package/url-bulk/categories-url.csv（追加URL→システムURL）
#  商品は旧新でコードが同じなので機械的に変換できます。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

CSV=package/url-bulk/categories-url.csv
[ -f "$CSV" ] || { echo "missing $CSV" >&2; exit 1; }

echo "書き換え前:"
for k in "/shopbrand/" "/shopdetail/" "/html/"; do
  n=$(grep -rohE "href=\"?[^\" >]*$k[^\" >]*" templates/creator/freepages/ templates/creator/mode/ 2>/dev/null | wc -l | tr -d ' ')
  printf "  %-14s %4s 本\n" "$k" "$n"
done

echo ""
echo "書き換え:"
perl tools/_rewrite-links.pl "$CSV" templates/creator/freepages/*.html templates/creator/mode/*.tpl

echo ""
echo "書き換え後:"
rest=0
for k in "/shopbrand/" "/shopdetail/" "/html/"; do
  n=$(grep -rohE "href=\"?[^\" >]*$k[^\" >]*" templates/creator/freepages/ templates/creator/mode/ 2>/dev/null | wc -l | tr -d ' ')
  printf "  %-14s %4s 本\n" "$k" "$n"
  rest=$((rest + n))
done

if [ "$rest" -ne 0 ]; then
  echo ""
  echo "  残っているもの:"
  grep -roh 'href="[^"]*\(/shopbrand/\|/shopdetail/\|/html/\)[^"]*"' templates/creator/freepages/ 2>/dev/null \
    | sort | uniq -c | sort -rn | head -20
  exit 1
fi

echo ""
echo "旧URLの残り 0 本"
