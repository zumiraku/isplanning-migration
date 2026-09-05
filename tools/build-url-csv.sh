#!/bin/sh
# build-url-csv.sh — URL一括設定 にアップロードするCSVを作る
#
# 目的は1つ。フリーページ82枚に、移行前と同じ /html/pageNN.html を
# 「追加URL」として持たせることです。これが通れば、貼り終えたページの中にある
# 379本のリンクは1本も直さずに済み、82ページの検索評価も途切れません。
#
# 列と値は管理画面のマニュアルどおり:
#   URLタイプ      4 = フリーページ（クリエイターモード）
#   システムURL    /view/page/pageNN.html   先頭スラッシュあり・ドメインなし
#   名称           管理画面の独自ページ一覧に載っている題名
#   canonical属性  0 = システムURL側 / 1 = 追加URL側
#   追加URL        /html/pageNN.html
#   noindex設定    0 = インデックスされる
#
# canonical は 0（システムURL側）にしています。理由:
#   同じ内容が2つのURLで開ける状態になるので、どちらを正とするかを明示しないと
#   重複コンテンツになります。0 を選ぶと /view/page/... が正になり、
#   /html/... はそこへ集約されます。移行後に残り続けるのは /view/page/... の
#   ほうなので、そちらを正にしておくのが自然です。1 にすると、いずれ捨てる
#   URLを正だと宣言することになります。
#
# 出力は UTF-8 BOM 付き。ダウンロードされたCSVがBOM付きだったのに合わせています。
#
# Output: package/url-bulk/freepages-url.csv
# Needs Git Bash. Run from the repository root.

man="package/freepages/MANIFEST.csv"
out="package/url-bulk/freepages-url.csv"

[ -f "$man" ] || { echo "no $man - run build-freepage-package.sh first"; exit 1; }
mkdir -p "$(dirname "$out")"

printf '\357\273\277' > "$out"
printf 'URLタイプ,システムURL,名称,canonical属性,追加URL,noindex設定\n' >> "$out"

n=0
sed 's/^"//; s/"$//' "$man" | tail -n +2 | while IFS= read -r line; do
  slug=$(echo "$line" | awk -F'","' '{print $2}')
  url=$(echo  "$line" | awk -F'","' '{print $3}')
  title=$(echo "$line" | awk -F'","' '{print $4}')
  [ -z "$slug" ] && continue
  # 題名にカンマが入るので、CSVとして必ず引用符で囲む。中の " は "" に。
  t=$(printf '%s' "$title" | sed 's/"/""/g')
  printf '4,/view/page/%s,"%s",0,/html/%s.html,0\n' "$url" "$t" "$slug" >> "$out"
done

n=$(( $(wc -l < "$out") - 1 ))
echo ""
echo "rows    : $n   (82 が正しい)"
echo "bytes   : $(wc -c < "$out")   (上限 2MB)"
echo "output  : $out"
echo ""
echo "先頭3行:"
sed -n '2,4p' "$out"
