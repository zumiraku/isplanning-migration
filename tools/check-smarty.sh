#!/bin/sh
# check-smarty.sh — do the Creator Mode templates parse?

dir="templates/creator/mode"
fail=0

for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  name=$(basename "$f")

  r=$(perl -CSD -0777 -ne '
      my $h = $_;
      $h =~ s/<\{\*.*?\*\}>//gs;
      my @stack;
      my @err;
      while ($h =~ /<\{\s*(\/?)(if|section|foreach|literal)\b[^}]*\}>/g) {
        my ($close, $tag) = ($1, $2);
        if ($close) {
          if (!@stack)              { push @err, "closing $tag with nothing open" }
          elsif ($stack[-1] ne $tag){ push @err, "closing $tag inside $stack[-1]" }
          else                      { pop @stack }
        } else { push @stack, $tag }
      }
      push @err, "never closed: " . join(",", @stack) if @stack;
      my $depth = 0;
      while ($h =~ /<\{\s*(\/?)(if)\b[^}]*\}>|<\{\s*(elseif|else)\b[^}]*\}>/g) {
        if (defined $2) { $1 ? $depth-- : $depth++ }
        elsif ($depth < 1) { push @err, "$3 outside an if" }
      }
      print join("; ", @err);
    ' "$f")

  if [ -n "$r" ]; then
    echo "  $name : $r"
    fail=1
  fi
done

known="inventory/creator-tags-known.tsv"
used=$(for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  perl -CSD -0777 -ne '
      my $h = $_; $h =~ s/<\{\*.*?\*\}>//gs;
      while ($h =~ /\$([a-z_]+)\.([A-Za-z_.]+(?:\[[a-z]\]\.[A-Za-z_.]+)*)/g) { print "\$$1.$2\n" }
    ' "$f"
done | sed 's/\[[a-z]\]//g' | sed 's/\.$//' | sort -u)

conf=0; asm=0; unk=0
unknown=""
assumed=""
for v in $used; do
  case "$v" in '$smarty.'*) continue ;; esac
  st=$(awk -F'\t' -v k="$v" '$1==k{print $2}' "$known" | head -1)
  case "$st" in
    confirmed) conf=$((conf + 1)) ;;
    assumed)   asm=$((asm + 1)); assumed="$assumed $v" ;;
    *)         unk=$((unk + 1)); unknown="$unknown $v" ;;
  esac
done

echo ""
echo "variables used in the templates:"
echo "  confirmed against the reference : $conf"
echo "  assumed from a naming pattern   : $asm"
echo "  not in the ledger at all        : $unk"
if [ "$asm" -gt 0 ]; then
  echo ""
  echo "  ASSUMED - verify these on the rehearsal site before cutover:"
  for v in $assumed; do
    why=$(awk -F'\t' -v k="$v" '$1==k{print $3}' "$known" | head -1)
    printf "    %-46s %s\n" "$v" "$why"
  done
fi
if [ "$unk" -gt 0 ]; then
  echo ""
  echo "  NOT IN THE LEDGER - either add it with a source, or stop using it:"
  for v in $unknown; do echo "    $v"; done
  fail=1
fi

echo ""
if [ "$fail" -eq 0 ]; then echo "block structure : OK"; else echo "FAILED"; fi
exit $fail

