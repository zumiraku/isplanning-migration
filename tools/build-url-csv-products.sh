#!/bin/sh
# build-url-csv-products.sh — 商品9,514件のURL対応CSV
#
# 商品URLは /shopdetail/<システム商品コード>/ から /view/item/<同じコード> に
# 変わります。コードは同じなので、対応は完全に機械的です。
#
# 出典はサイトマップ。クロールした一部ではなく、ショップ自身が公開している
# 全商品の一覧なので、取りこぼしがありません。
#
# canonical は 0（/view/item/… を正）。移行後に残るのはそちらです。
#
# 名称にはシステム商品コードを入れています。商品名は9,514件ぶん手元にありま
# せんし、この欄は管理用の見出しで公開されません。空にして必須だった場合、
# 9,513行が一度に落ちます。フリーページのCSVで82件が全滅したときのように、
# 原因の切り分けに時間を取られるより、確実に埋まる値を入れておきます。
#
# 🔴 このCSVは切替後にしか投入できません。URL一括設定は適用中のデザインセット
#    しか見ないことが、フリーページ82件で確認済みです（全件失敗しました）。
#
# Output: package/url-bulk/products-url.csv
# Needs Git Bash. Run from the repository root.

out="package/url-bulk/products-url.csv"
mkdir -p "$(dirname "$out")"

printf '\357\273\277' > "$out"
printf 'URLタイプ,システムURL,名称,canonical属性,追加URL,noindex設定\n' >> "$out"

grep -oh '<loc>[^<]*shopdetail[^<]*</loc>' snapshot/sitemap_brand*.xml 2>/dev/null \
  | sed 's/<[^>]*>//g' \
  | sed 's|https://www\.isp-sp\.com/shopdetail/||; s|/$||' \
  | sort -u \
  | awk '{ printf "1,/view/item/%s,\"%s\",0,/shopdetail/%s/,0\n", $0, $0, $0 }' >> "$out"

# 🔴 サイトマップに載っていない商品を足します。
#
#    実サイトの全商品一覧は「全 9,535 件」、サイトマップから作ると 9,534 件。
#    **1件だけサイトマップに無い商品があります。** 連番の欠番は12,539件あるので
#    （販売終了で歯抜けになる）番号からは絞れず、一覧239ページを辿って
#    突き合わせて見つけました（tools/find-missing-products.sh）。
#
#    ここで足さないと、その商品の旧URL /shopdetail/… だけが切替後に404に
#    なります。そしてこのCSVは切替当日に作り直すので、**出来上がりを手で
#    直しても消えます。**
sup="inventory/products-missing-from-sitemap.csv"
if [ -f "$sup" ]; then
  added=0
  for c in $(tail -n +2 "$sup" | sed 's/^"//; s/".*//' | grep -E '^[0-9A-Za-z]{12}$'); do
    grep -q "/view/item/$c," "$out" && continue
    printf '1,/view/item/%s,"%s",0,/shopdetail/%s/,0\n' "$c" "$c" "$c" >> "$out"
    added=$((added + 1))
  done
  [ "$added" -gt 0 ] && echo "サイトマップに無い商品を $added 件足しました（$sup）"
fi

n=$(( $(wc -l < "$out") - 1 ))
echo "rows   : $n"
echo "bytes  : $(wc -c < "$out")   (上限 2MB / 20,000件)"
echo "output : $out"
echo ""
sed -n '2,3p' "$out"
