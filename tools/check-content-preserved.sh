#!/bin/sh
# check-content-preserved.sh — did the conversion damage any text?

frag_dir="templates/creator/freepages"
src_dir="templates/basic-export/freepages"
out="${1:-inventory/content-preserved.csv}"
exceptions="inventory/approved-content-changes.csv"

norm() {
  perl -CSD -0777 -pe '
      s/<\{.*?\}>//gs;
      s/<script.*?<\/script>//gsi;
      s/<style.*?<\/style>//gsi;
      s/<!--.*?-->//gs;
      s/<[^>]*>/\n/gs;
      tr/\x{FF01}-\x{FF5E}/\x{21}-\x{7E}/;
      s/[\x{3000}\t ]+//g;
      s/&nbsp;//g; s/&amp;/&/g; s/&lt;/</g; s/&gt;/>/g;
    ' "$1" \
    | grep -E '[ぁ-んァ-ヶ一-龠]' \
    | sort -u
}

echo '"slug","fragment_lines","lines_not_in_source","status"' > "$out"
total=0; bad_pages=0; bad_lines=0

for f in "$frag_dir"/*.html; do
  slug=$(basename "$f" .html)
  src="$src_dir/$slug.html"
  [ -f "$src" ] || { printf '"%s","","","no source - placeholder"\n' "$slug" >> "$out"; continue; }

  norm "$f"   > /tmp/_frag.txt
  norm "$src" > /tmp/_src.txt

  n=$(wc -l < /tmp/_frag.txt)
  missing=0; approved=0
  while IFS= read -r line; do
    [ ${#line} -lt 8 ] && continue
    grep -qF -- "$line" /tmp/_src.txt && continue
    if grep -F -- "$line" "$exceptions" 2>/dev/null | grep -qF "\"$slug\","; then
      approved=$((approved + 1))
    else
      missing=$((missing + 1))
    fi
  done < /tmp/_frag.txt

  total=$((total + 1)); approved_total=$((approved_total + approved))
  if [ "$missing" -eq 0 ]; then
    printf '"%s","%s","0","ok"\n' "$slug" "$n" >> "$out"
  else
    printf '"%s","%s","%s","CORRUPTED"\n' "$slug" "$n" "$missing" >> "$out"
    bad_pages=$((bad_pages + 1))
    bad_lines=$((bad_lines + missing))
    echo "  CORRUPTED  $slug: $missing lines not found in source"
  fi
done

echo ""
echo "pages checked            : $total"
echo "pages with altered text  : $bad_pages"
echo "altered lines            : $bad_lines"
echo "approved changes         : $approved_total"
echo "report                   : $out"

