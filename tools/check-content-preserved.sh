#!/bin/sh
# check-content-preserved.sh — did the conversion damage any text?
#
# Each fragment in templates/creator/freepages/ has been through roughly fifteen
# regex passes: chrome windowing, style and script extraction, attribute
# stripping, class mapping, inline-style mapping, div balancing, grid merging,
# heading lifting, tidying. Any one of them can eat a character it was not meant
# to, and the failure is invisible - a sentence with a word missing still reads
# like a sentence.
#
# So this checks the one property that must hold: **every line of text in the
# converted fragment must appear verbatim in its source.** Conversion is allowed
# to remove text (chrome) and to change markup; it is never allowed to invent or
# alter text. A line in the output that is not in the input means something was
# corrupted.
#
# Normalisation matches tools/compare-sp-content.sh: full-width ASCII folded to
# half-width, spaces stripped - but NOT newlines, which is the mistake that made
# that tool's first two answers meaningless.
#
# Needs Git Bash (iconv, perl). Run from the repository root.

frag_dir="templates/creator/freepages"
src_dir="templates/basic-export/freepages"
out="${1:-inventory/content-preserved.csv}"

# Tags are stripped with perl in slurp mode, not sed. sed works a line at a
# time, and this corpus has tags that span two lines - an <img> with its src on
# the next line. A line-based strip leaves "<imgloading=..." behind as text and
# then reports it as corrupted content, which is exactly the false alarm this
# check exists to avoid.
norm() {
  perl -CSD -0777 -pe '
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
  # Lines in the fragment that are not in the source. Substring, not exact line:
  # the converter legitimately rejoins text that was split across tags.
  missing=0
  while IFS= read -r line; do
    [ ${#line} -lt 8 ] && continue
    grep -qF -- "$line" /tmp/_src.txt || missing=$((missing + 1))
  done < /tmp/_frag.txt

  total=$((total + 1))
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
echo "report                   : $out"
