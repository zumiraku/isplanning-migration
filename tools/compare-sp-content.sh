#!/bin/sh
# compare-sp-content.sh — does the smartphone document carry content the desktop
# one does not?
#
# It matters because the separate /smartphone/ URL space disappears at the switch
# (C18) and every free page was converted from its DESKTOP capture. Anything that
# existed only in the SP document would be lost without anyone noticing.
#
# Two normalisations are essential, and getting either wrong makes the answer
# meaningless:
#   * the two templates differ in character width - desktop writes ＦＡＸ,
#     smartphone writes FAX - so full-width ASCII is folded to half-width
#   * spaces, including the ideographic one, are stripped. NOT newlines: an
#     earlier version used \s, which ate the line endings, collapsed every
#     document to a single line and produced first a wildly inflated count and
#     then a flat zero. Neither was real.
#
# Output: slug<TAB>line for every line present in the SP document and absent from
# the desktop one. Chrome and content are separated afterwards by frequency -
# navigation text repeats across dozens of pages, page content does not.
#
# Needs Git Bash (iconv, perl, comm). Run from the repository root.
out="${1:-inventory/sp-only-raw.tsv}"

norm() {
  iconv -f EUC-JP -t UTF-8 "$1" 2>/dev/null \
    | sed 's/<script[^>]*>/\n/g; s/<style[^>]*>/\n/g; s/<[^>]*>/\n/g' \
    | perl -CSD -pe 'tr/\x{FF01}-\x{FF5E}/\x{21}-\x{7E}/; s/[\x{3000}\t ]+//g' \
    | grep -E '[ぁ-んァ-ヶ一-龠]' \
    | grep -vE '^[#.@}{/]|[{};]$|^[a-z-]+:' \
    | sort -u
}

: > "$out"
for d in snapshot/desktop/html_*.html; do
  base=$(basename "$d" | sed 's/\.[A-F0-9]*\.html$//')
  m=$(ls snapshot/mobile/${base}.*.html 2>/dev/null | head -1)
  [ -z "$m" ] && continue
  slug=$(echo "$base" | sed 's/^html_//; s/\.html$//')
  norm "$d" > /tmp/_nd.txt
  norm "$m" > /tmp/_nm.txt
  comm -13 /tmp/_nd.txt /tmp/_nm.txt | sed "s|^|$slug\t|" >> "$out"
done
echo "wrote $out ($(wc -l < "$out") lines)"
