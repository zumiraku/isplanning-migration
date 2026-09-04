#!/bin/sh
# build-category-captions.sh — the 34 per-category captions, as a Smarty include
#
# C28 established that 52 of the 53 per-category templates are the standard one
# plus data. This turns the data half into template: an <{if}> chain on
# $category.code, generated from inventory/category-data.csv.
#
# It is generated rather than hand-written for the reason the free pages taught
# us the hard way - a hand edit survives until the next regeneration and then
# quietly disappears. Editing the CSV and re-running this is the supported way
# to change a caption; editing the .tpl is not.
#
# The captions are the only per-category prose in the Basic Mode export. They
# are in no SEO field and no crawled inventory, and a rebuild that believed
# "the 53 differ only in a banner" would have dropped all 34.
#
# Output: templates/creator/mode/category-captions.tpl
# Needs Git Bash. Run from the repository root.

src="inventory/category-data.csv"
out="${1:-templates/creator/mode/category-captions.tpl}"

[ -f "$src" ] || { echo "no $src - run extract-category-data.sh first"; exit 1; }

{
  echo '<{* =========================================================================='
  echo '     カテゴリごとの説明文 — GENERATED, do not hand-edit'
  echo ''
  echo '     Source : inventory/category-data.csv'
  echo '     Build  : sh tools/build-category-captions.sh'
  echo ''
  echo '     The only per-category prose in the Basic Mode templates. It sat in the'
  echo '     caption of the first tile of each categotybanner block, is in no SEO'
  echo '     field, and is nowhere else in the export.'
  echo '   ========================================================================== *}>'
  echo ''

  first=1
  sed 's/^"//; s/"$//' "$src" | tail -n +2 | while IFS= read -r line; do
    code=$(echo "$line" | awk -F'","' '{print $1}')
    cap=$(echo  "$line" | awk -F'","' '{print $2}')
    [ -z "$cap" ] && continue
    if [ "$first" = "1" ]; then
      printf '<{if $category.code == "%s"}>\n' "$code"
      first=0
    else
      printf '<{elseif $category.code == "%s"}>\n' "$code"
    fi
    printf '  <p class="catintro__lead">%s</p>\n' "$cap"
  done
  echo '<{/if}>'
} > "$out"

n=$(grep -c 'catintro__lead' "$out")
echo ""
echo "captions written : $n"
echo "template         : $out"
