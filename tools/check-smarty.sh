#!/bin/sh
# check-smarty.sh — do the Creator Mode templates parse?
#
# These files go into an admin console that has no version history and no dry
# run. A mismatched <{if}> or a <{section}> that is never closed is not caught
# until it is pasted into the live shop, and by then the page is already wrong.
#
# So: balance the block tags, and confirm every variable used appears in the
# tag reference we read (docs/tag-mapping.md). The second check is the one that
# matters - a template can be perfectly balanced and still address a tag that
# does not exist, which renders as nothing at all.
#
# Needs Git Bash (perl). Run from the repository root.

dir="templates/creator/mode"
fail=0

for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  name=$(basename "$f")

  # Block balance. Comments <{* … *}> are stripped first: they contain examples.
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
      # elseif / else outside an if
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

# Every variable used must be one we have actually seen, and the templates must
# not pretend an assumption is a fact. inventory/creator-tags-known.tsv records
# where each tag came from: "confirmed" means it was read off MakeShop's own tag
# reference, "assumed" means it was inferred from a naming pattern.
#
# Assumptions are not errors - some of them are almost certainly right, and the
# templates could not be written without them. What would be an error is
# pasting them into a live shop believing they were checked. So they are counted
# and listed, every time, rather than being allowed to fade into the background.
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
