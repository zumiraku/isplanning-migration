#!/bin/sh
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

