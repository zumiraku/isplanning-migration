#!/bin/sh
# extract-category-data.sh — turn 53 templates into one data table
#
# C28 is resolved: 52 of the 53 per-category templates are the standard one plus
# a small amount of per-category data. This pulls that data out, so the rebuild
# has one template driven by a table rather than 53 files to keep in step.
#
# The first version of this tool recorded "the banner image" as the per-category
# data and was wrong in a way worth writing down: 36 of the 40 banners are the
# same file, housounosiname3.png. The banner is a shared promotion, not a
# variation - it belongs in the template once.
#
# The real per-category data is the caption. A categotybanner block is a row of
# tiles; the first holds [CATEGORY_IMAGE] with a caption written for that
# category, and the tiles after it are the shared promos. **That caption is the
# only genuinely per-category prose in these files**, it is nowhere else, and it
# is what a rebuild that ignored these templates would have silently dropped.
#
# What else varies, measured (docs/category-templates.md):
#
#   category_image  11 of 53 omit [CATEGORY_IMAGE]
#   subcat_columns  2 use [GROUP3_7] where the rest use [GROUP4_0]
#   price_tag       3 use [PRICE] instead of [TAXPRICE] - that is C36, a live
#                   defect, recorded as what the template does rather than as
#                   something to reproduce
#
# ct646 is excluded: genuinely bespoke, needs its own template.
#
# Output: inventory/category-data.csv
# Needs Git Bash (perl). Run from the repository root.

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
