#!/bin/sh
# build-url-csv-categories.sh — カテゴリ606件のURL対応CSV
#
# 商品と違い、カテゴリは旧URLと新URLでコード体系が別です。
#
#   旧  /shopbrand/003/001/X/
#   新  /view/category/ct5
#
# 数字を並べ替えれば済む話ではないので、対応表が要ります。手元にあったのは
# クロール時に各カテゴリページが持っていた rel="alternate" で、スマホ版URLに
# category_code=ctNNN が入っていました。SPサイトは移行で消えますが、消える前に
# 記録していたおかげで対応が取れます。607件中606件。
#
# 取れなかった1件は rel="alternate" を持たないページです。CSVには含めず、
# 末尾に印を出します。推測でct番号を当てると、別のカテゴリのURLを別の
# カテゴリに割り当てることになります。
#
# 🔴 切替後にしか投入できません（フリーページ82件で確認済み）。
#
# Output: package/url-bulk/categories-url.csv
# Needs Git Bash. Run from the repository root.

src="inventory/pages-categories-desktop.csv"
out="package/url-bulk/categories-url.csv"
[ -f "$src" ] || { echo "no $src"; exit 1; }
mkdir -p "$(dirname "$out")"

printf '\357\273\277' > "$out"
printf 'URLタイプ,システムURL,名称,canonical属性,追加URL,noindex設定\n' >> "$out"

sed 's/^"//; s/"$//' "$src" | tail -n +2 | awk -F'","' '{print $1"\t"$9"\t"$5}' | \
while IFS="	" read -r url alt title; do
  case "$alt" in *category_code=ct*) ;; *) continue ;; esac
  old=$(printf '%s' "$url" | sed 's|https://www\.isp-sp\.com||')
  ct=$(printf '%s' "$alt" | sed 's|.*category_code=||')
  # 名称は管理用。長いタイトルをそのまま入れると読みにくいので、
  # 【…】以降の店舗名は落として先頭40文字までにします。
  t=$(printf '%s' "$title" | sed 's/【.*//' | cut -c1-120 | sed 's/"/""/g')
  [ -z "$t" ] && t="$ct"
  printf '2,/view/category/%s,"%s",0,%s,0\n' "$ct" "$t" "$old" >> "$out"
done

n=$(( $(wc -l < "$out") - 1 ))
echo "rows   : $n   (607件中、rel=alternate から対応が取れたもの)"
echo "output : $out"
echo ""
sed -n '2,4p' "$out"
echo ""
echo "対応が取れなかったカテゴリ:"
sed 's/^"//; s/"$//' "$src" | tail -n +2 | awk -F'","' '$9 !~ /category_code=ct/ {print "  "$1}'
