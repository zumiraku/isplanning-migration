#!/bin/sh
strict=0
case "$1" in -Strict|--strict) strict=1; shift ;; esac
out="${1:-inventory/tag-balance.csv}"
status=0

OPTIONAL='li|p|tr|td|th|dt|dd|option|thead|tbody|tfoot|colgroup|caption|rt|rp'
if [ "$strict" = "1" ]; then OPTIONAL='__none__'; fi
VOID='area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr'

echo '"file","element","open","close","diff"' > "$out"

check_file() {
  f="$1"
  perl -CSD -0777 -ne '
      my $html = $_;
      $html =~ s/<\{.*?\}>//gs;
      $html =~ s/<!--.*?-->//gs;
      $html =~ s/<script\b.*?<\/script>//gsi;
      $html =~ s/<style\b.*?<\/style>//gsi;

      my (%open, %close);
      while ($html =~ /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g) {
        my ($slash, $tag, $attrs) = ($1, lc $2, $3);
        next if $tag =~ /^(?:'"$VOID"')$/;
        next if $tag =~ /^(?:'"$OPTIONAL"')$/;
        next if !$slash && $attrs =~ m{/\s*$};   # self-closed
        if ($slash) { $close{$tag}++ } else { $open{$tag}++ }
      }
      for my $t (sort keys %{{ %open, %close }}) {
        my $o = $open{$t}  // 0;
        my $c = $close{$t} // 0;
        print "$t\t$o\t$c\n" if $o != $c;
      }
    ' "$f"
}

for f in templates/creator/freepages/*.html \
         templates/creator/preview/*.html \
         templates/creator/preview/freepages/*.html; do
  [ -f "$f" ] || continue
  rel=$(echo "$f" | sed 's|^templates/creator/||')
  check_file "$f" | while IFS='	' read -r tag o c; do
    [ -z "$tag" ] && continue
    printf '"%s","%s","%s","%s","%s"\n' "$rel" "$tag" "$o" "$c" "$((o - c))" >> "$out"
  done
done

bad=$(( $(wc -l < "$out") - 1 ))
files=$(sed 's/"//g' "$out" | awk -F, 'NR>1{print $1}' | sort -u | wc -l)

echo ""
echo "unbalanced elements : $bad"
echo "files affected      : $files"
echo "report              : $out"
if [ "$bad" -gt 0 ]; then
  echo ""
  sed 's/"//g' "$out" | awk -F, 'NR>1{printf "  %-52s %-10s open %s close %s\n", $1, $2, $3, $4}' | head -30
  status=1
fi
exit $status

