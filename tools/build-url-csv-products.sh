#!/bin/sh
out="package/url-bulk/products-url.csv"
mkdir -p "$(dirname "$out")"

printf '\357\273\277' > "$out"
printf 'URLタイプ,システムURL,名称,canonical属性,追加URL,noindex設定\n' >> "$out"

grep -oh '<loc>[^<]*shopdetail[^<]*</loc>' snapshot/sitemap_brand*.xml 2>/dev/null \
  | sed 's/<[^>]*>//g' \
  | sed 's|https://www\.isp-sp\.com/shopdetail/||; s|/$||' \
  | sort -u \
  | awk '{ printf "1,/view/item/%s,\"%s\",0,/shopdetail/%s/,0\n", $0, $0, $0 }' >> "$out"

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

