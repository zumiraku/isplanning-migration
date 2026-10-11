#!/bin/sh
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

