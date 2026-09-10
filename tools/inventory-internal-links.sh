#!/bin/sh
# inventory-internal-links.sh — every internal link that the URL change breaks

dir="templates/creator/freepages"
out="${1:-inventory/internal-links.csv}"

[ -d "$dir" ] || { echo "no $dir"; exit 1; }

echo '"source","href","class","becomes"' > "$out"

for f in "$dir"/*.html; do
  slug=$(basename "$f" .html)
  grep -oh 'href="[^"]*"' "$f" 2>/dev/null | sed 's/^href="//; s/"$//' | while IFS= read -r href; do
    case "$href" in
      *shopdetail/*) class="product";  becomes="/view/item/…" ;;
      *shopbrand/*)  class="category"; becomes="/view/category/…" ;;
      */new/*)       class="news";     becomes="/view/news/… (導出不可)" ;;
      *html/*.html)  class="freepage"; becomes="/view/<name>" ;;
      *smartphone/*) class="sp";       becomes="(SPサイトは消滅)" ;;
      *shop/basket*) class="cart";     becomes="/view/cart" ;;
      http*|//*|\#*|mailto:*|javascript:*|tel:*) continue ;;
      *) continue ;;
    esac
    printf '"%s","%s","%s","%s"\n' "$slug" "$href" "$class" "$becomes" >> "$out"
  done
done

total=$(( $(wc -l < "$out") - 1 ))
echo ""
echo "internal links that change : $total"
echo "report                     : $out"
echo ""
sed 's/"//g' "$out" | awk -F, 'NR>1{c[$3]++} END{for(k in c) printf "  %-10s %5d\n", k, c[k]}' | sort -k2 -rn
echo ""
echo "pages affected             : $(sed 's/"//g' "$out" | awk -F, 'NR>1{print $1}' | sort -u | wc -l)"

