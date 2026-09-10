#!/bin/sh
# build-url-csv.sh — URL一括設定 にアップロードするCSVを作る

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

