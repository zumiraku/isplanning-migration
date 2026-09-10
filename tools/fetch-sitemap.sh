#!/bin/sh
# fetch-sitemap.sh — サイトマップを取り直す
set -e
cd "$(dirname "$0")/.."

BASE=https://www.isp-sp.com
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/152.0.0.0"
mkdir -p snapshot

echo "索引:"
curl -sS -m 30 -A "$UA" -o snapshot/sitemap-index.xml "$BASE/sitemap.xml"
printf "  sitemap.xml  %s バイト  <sitemap> %s 本\n" \
  "$(wc -c < snapshot/sitemap-index.xml)" \
  "$(grep -o '<sitemap>' snapshot/sitemap-index.xml | wc -l | tr -d ' ')"

echo ""
echo "取得:"
params=$(grep -o 'params=[a-z0-9]*' snapshot/sitemap-index.xml | sed 's/params=//' | sort -u)
total=0
for p in $params; do
  f="snapshot/sitemap_$p.xml"
  curl -sS -m 60 -A "$UA" -o "$f" "$BASE/sitemap_sub.html?id=isplanning&params=$p"
  n=$(grep -o '<loc>' "$f" | wc -l | tr -d ' ')
  d=$(grep -o 'shopdetail/[0-9]*' "$f" | wc -l | tr -d ' ')
  b=$(grep -o 'shopbrand/' "$f" | wc -l | tr -d ' ')
  printf "  %-12s %8s バイト  URL %5s  （商品 %5s / カテゴリ %4s）\n" "$p" "$(wc -c < "$f")" "$n" "$d" "$b"
  total=$((total + n))
done

echo ""
printf "  合計 %s URL\n" "$total"

prod=$(grep -oh 'shopdetail/[0-9]*' snapshot/sitemap_brand*.xml 2>/dev/null | sort -u | wc -l | tr -d ' ')
echo ""
printf "  商品（重複除く）: %s\n" "$prod"
echo ""
echo "  ※ 実際の商品数と突き合わせてください。"
echo "     /view/category/all_items の「全 N 件」が正解です。"
echo "     食い違っていたら、サイトマップに載っていない商品があります。"

