#!/bin/sh

src="inventory/pages-categories-desktop.csv"
ovr="inventory/category-admin-changes.csv"
ovr2="inventory/category-code-overrides.csv"
out="package/url-bulk/categories-url.csv"
[ -f "$src" ] || { echo "no $src"; exit 1; }
mkdir -p "$(dirname "$out")"

printf '\357\273\277' > "$out"
printf 'URLタイプ,システムURL,名称,canonical属性,追加URL,noindex設定\n' >> "$out"

ovr_name=""; ovr_ni=""
if [ -f "$ovr" ]; then
  ovr_name=$(tail -n +2 "$ovr" | sed 's/^"//; s/"$//' | awk -F'","' '$2=="名称"{print $1"="$3}')
  ovr_ni=$(tail -n +2 "$ovr"   | sed 's/^"//; s/"$//' | awk -F'","' '$2=="noindex"{print $1"="$3}')
fi

sed 's/^"//; s/"$//' "$src" | tail -n +2 | awk -F'","' '{print $1"\t"$9"\t"$5}' | \
while IFS="	" read -r url alt title; do
  case "$alt" in *category_code=ct*) ;; *) continue ;; esac
  old=$(printf '%s' "$url" | sed 's|https://www\.isp-sp\.com||')
  ct=$(printf '%s' "$alt" | sed 's|.*category_code=||')
  t=$(printf '%s' "$title" | sed 's/【.*//' | cut -c1-120 | sed 's/"/""/g')
  [ -z "$t" ] && t="$ct"

  ni=0
  case "$ovr_name" in
    "$ct="*|*"
$ct="*) t=$(printf '%s\n' "$ovr_name" | sed -n "s/^$ct=//p" | head -1 | sed 's/"/""/g') ;;
  esac
  case "$ovr_ni" in
    "$ct="*|*"
$ct="*) ni=$(printf '%s\n' "$ovr_ni" | sed -n "s/^$ct=//p" | head -1) ;;
  esac

  printf '2,/view/category/%s,"%s",0,%s,%s\n' "$ct" "$t" "$old" "$ni" >> "$out"
done


if [ -f "$ovr2" ]; then
  tail -n +2 "$ovr2" | sed 's/^"//' | while IFS= read -r line; do
    old=$(printf '%s' "$line" | awk -F'","' '{print $1}')
    code=$(printf '%s' "$line" | awk -F'","' '{print $2}')
    [ -n "$old" ] && [ -n "$code" ] || continue
    grep -q "/view/category/$code," "$out" && continue
    nm=$(grep -F "$old" "$src" | head -1 | sed 's/^"//; s/"$//' | awk -F'","' '{print $5}' | sed 's/【.*//; s/"/""/g')
    [ -z "$nm" ] && nm="$code"
    printf '2,/view/category/%s,"%s",0,%s,0\n' "$code" "$nm" "$old" >> "$out"
    echo "ct番号の無いカテゴリを足しました: $code  $old"
  done
fi
n=$(( $(wc -l < "$out") - 1 ))
echo "rows   : $n   (607件中、rel=alternate から対応が取れたもの)"
echo "output : $out"
echo ""
sed -n '2,4p' "$out"
echo ""
echo "対応が取れなかったカテゴリ:"
sed 's/^"//; s/"$//' "$src" | tail -n +2 | awk -F'","' '$9 !~ /category_code=ct/ {print "  "$1}'

