#!/bin/sh
# extract-category-data.sh — turn 53 templates into one data table

dir="templates/basic-export/design/design_categorypages"
out="${1:-inventory/category-data.csv}"
tile="tools/_category-tile.pl"

[ -d "$dir" ] || { echo "no $dir"; exit 1; }

echo '"category","caption","shared_tiles","category_image","subcat_columns","price_tag","note"' > "$out"

for f in "$dir"/*.txt; do
  c=$(basename "$f" .txt | sed 's/^design_categorypage_//')
  [ "$c" = "ct646" ] && continue

  parsed=$(perl -CSD "$tile" "$f")
  cap=$(echo "$parsed"    | cut -f1)
  shared=$(echo "$parsed" | cut -f2)

  if grep -qF '[CATEGORY_IMAGE]' "$f"; then catimg="yes"; else catimg="no"; fi
  if   grep -qF '[GROUP3_7]' "$f"; then cols="3"
  elif grep -qF '[GROUP4_0]' "$f"; then cols="4"
  else cols="none"; fi
  if   grep -qF '[TAXPRICE]' "$f"; then ptag="TAXPRICE"
  elif grep -qF '[PRICE]'    "$f"; then ptag="PRICE"
  else ptag="none"; fi

  note=""
  [ "$ptag" = "PRICE" ] && note="C36 - 税抜を（税込）と表示している。移行時は税込に統一"
  [ "$cols" = "none" ] && note="${note}${note:+ / }子カテゴリ一覧を出していない"
  [ -z "$cap" ] && note="${note}${note:+ / }カテゴリ固有の説明文なし"

  printf '"%s","%s","%s","%s","%s","%s","%s"\n' \
    "$c" "$cap" "$shared" "$catimg" "$cols" "$ptag" "$note" >> "$out"
done

n=$(( $(wc -l < "$out") - 1 ))
withcap=$(sed 's/"//g' "$out" | awk -F, 'NR>1 && $2!=""' | wc -l)
echo ""
echo "categories in the table   : $n   (ct646 excluded - bespoke)"
echo "  with a unique caption   : $withcap   <- prose that exists nowhere else"
echo "  without カテゴリ画像     : $(sed 's/"//g' "$out" | awk -F, 'NR>1 && $4=="no"' | wc -l)"
echo "  3-column sub-cats       : $(sed 's/"//g' "$out" | awk -F, 'NR>1 && $5=="3"' | wc -l)"
echo "  tax-exclusive price     : $(sed 's/"//g' "$out" | awk -F, 'NR>1 && $6=="PRICE"' | wc -l)   <- C36"
echo "report                    : $out"

