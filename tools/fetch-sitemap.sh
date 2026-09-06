#!/bin/sh
# =============================================================================
#  fetch-sitemap.sh — サイトマップを取り直す
#
#  🔴 21商品が対応表から漏れていました
#
#     `/view/category/all_items` が「全 9,535 件」と返すのに、
#     products-url.csv は 9,513 行しかありませんでした。**22件足りません。**
#
#     原因は、スナップショットが古かったことです。取ったあとに追加された
#     商品コード 000000025483〜000000025503 の21件が入っていませんでした。
#     連番なので、まとめて登録された商品です。
#
#     切替後、この21商品の旧URL `/shopdetail/…` は404になります。**新しい
#     商品ほどSNSやメールで共有されたばかりの可能性が高い**ので、影響は
#     件数の比よりも大きく出ます。
#
#  --- サイトマップは4本に分かれています ---------------------------------------
#
#     /sitemap.xml            索引。中に4本
#       params=brand0         商品 5,000件
#       params=brand1         商品 4,534件
#       params=category0      カテゴリ 607件
#       params=etc0           その他
#
#     商品が2本に分かれているのは、1本あたり5,000件が上限だからです。
#     **10,000件を超えると3本目ができます。** この店舗は9,534件なので、
#     もうすぐ届きます。`brand*` を総当たりで拾う書き方にしてあるのは
#     そのためです。
#
#  切替の直前に一度回してください。**その間に登録された商品が漏れます。**
# =============================================================================
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

# 商品用のファイル名は build-url-csv-products.sh が sitemap_brand*.xml で拾います。
prod=$(grep -oh 'shopdetail/[0-9]*' snapshot/sitemap_brand*.xml 2>/dev/null | sort -u | wc -l | tr -d ' ')
echo ""
printf "  商品（重複除く）: %s\n" "$prod"
echo ""
echo "  🔴 実際の商品数と突き合わせてください。"
echo "     /view/category/all_items の「全 N 件」が正解です。"
echo "     食い違っていたら、サイトマップに載っていない商品があります。"
