#!/bin/sh
# inventory-basic-tags.sh — every Basic Mode variable tag the shop's templates use
#
# The design backup (templates/basic-export/design/) is the source as typed into
# the admin, so it contains the platform's own variable tags - [BRANDNAME],
# [BASKET_MAIL], [PAGER] and so on. Those tags ARE the functionality: the
# migration succeeds exactly to the extent that each one has a Creator Mode
# equivalent and that equivalent is wired up.
#
# So this counts them and records where each appears. A tag with no Creator Mode
# counterpart is a functional gap, and this list is what makes those findable
# instead of discovered by a customer.
#
# Control-flow tags ([IF...], [ELSE], [ENDIF], [END]) are marked as such: they
# are template logic rather than output, and Creator Mode has its own syntax.
#
# NOTE: every grep here uses -F. A tag like [BRANDNAME] is a character class to
# grep otherwise, matching any one of B,R,A,N,D,M,E - which reported 26,314 uses
# of one tag and claimed every tag appeared in the stylesheet.
#
# Output: inventory/basic-mode-tags.csv
# Needs Git Bash. Run from the repository root.

dir="templates/basic-export/design"
out="${1:-inventory/basic-mode-tags.csv}"

[ -d "$dir" ] || { echo "no $dir - unpack the design backup first"; exit 1; }

echo '"tag","uses","files","kind","where"' > "$out"

grep -oh '\[[A-Z_0-9]\{2,\}\]' "$dir"/*.txt "$dir"/*/*.txt 2>/dev/null \
  | sort -u \
  | while IFS= read -r tag; do
      uses=$(grep -ohF -- "$tag" "$dir"/*.txt "$dir"/*/*.txt 2>/dev/null | wc -l)
      files=$(grep -lF -- "$tag" "$dir"/*.txt "$dir"/*/*.txt 2>/dev/null | wc -l)
      where=$(grep -lF -- "$tag" "$dir"/*.txt 2>/dev/null | xargs -n1 basename 2>/dev/null \
              | sed 's/^design_//; s/\.txt$//' | tr '\n' ' ' | sed 's/ $//')
      case "$tag" in
        '[IF'*|'[ELSE]'|'[ENDIF]'|'[END]'|'[ELSEIF'*) kind="control" ;;
        *) kind="output" ;;
      esac
      printf '"%s","%s","%s","%s","%s"\n' "$tag" "$uses" "$files" "$kind" "$where" >> "$out"
    done

total=$(( $(wc -l < "$out") - 1 ))
ctrl=$(sed 's/"//g' "$out" | awk -F, 'NR>1 && $4=="control"' | wc -l)
echo ""
echo "distinct tags   : $total"
echo "  control flow  : $ctrl"
echo "  output tags   : $(( total - ctrl ))"
echo "report          : $out"
echo ""
echo "most used output tags:"
sed 's/"//g' "$out" | awk -F, 'NR>1 && $4=="output"{printf "%6d  %-22s %s\n", $2, $1, $5}' \
  | sort -rn | head -12
