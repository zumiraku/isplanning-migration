#!/bin/sh
# inventory-basic-tags.sh — every Basic Mode variable tag the shop's templates use

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

