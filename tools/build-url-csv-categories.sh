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
# ※ 切替後にしか投入できません（フリーページ82件で確認済み）。
#
# Output: package/url-bulk/categories-url.csv
# Needs Git Bash. Run from the repository root.

# ※ クロール結果は「あの時点の本番サイト」です。その後の変更は別に持ちます。
#
#    ct668 のカテゴリ名は、クロール時点で ■■■ でした。山口様がその後
#    「■粗品（価格変更予定）」に変更されています。
#
#    ここで inventory/pages-categories-desktop.csv を直接書き換えるのは
#    間違いです。あれは**測定結果**で、測っていないことを書き込むと、
#    あとから何が事実で何が推測か分からなくなります。
#
#    そして、このCSVは**切替日に作り直します**（cutover-runbook.md）。
#    出来上がったCSVを手で直しても、その日に消えます。上書きは表で持ち、
#    毎回この生成で当て直します。
#
#    inventory/category-admin-changes.csv
#      カテゴリコード,項目,新しい値,出典,確認日
#      項目は 名称 と noindex の2つ。

src="inventory/pages-categories-desktop.csv"
ovr="inventory/category-admin-changes.csv"
ovr2="inventory/category-code-overrides.csv"
out="package/url-bulk/categories-url.csv"
[ -f "$src" ] || { echo "no $src"; exit 1; }
mkdir -p "$(dirname "$out")"

printf '\357\273\277' > "$out"
printf 'URLタイプ,システムURL,名称,canonical属性,追加URL,noindex設定\n' >> "$out"

# 上書きは先に1回だけ読みます。
#
# ※ 最初は行ごとに grep を2回叩いていました。606行 × 2 プロセスで、
#    生成に7分かかりました。Windowsではプロセス起動が高いので、ループの
#    中で外部コマンドを呼ぶ設計そのものが誤りです。case はシェル組み込みで、
#    実際に一致した2件だけ sed を呼びます。
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
  # 名称は管理用。長いタイトルをそのまま入れると読みにくいので、
  # 【…】以降の店舗名は落として先頭40文字までにします。
  t=$(printf '%s' "$title" | sed 's/【.*//' | cut -c1-120 | sed 's/"/""/g')
  [ -z "$t" ] && t="$ct"

  # 管理画面で変えられたぶんを当て直します。
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


# ※ ct番号を持たないカテゴリを足します。
#
#    /shopbrand/all_items/（すべての商品）は rel="alternate" に
#    category_code=ct… を持たないので、上のループが飛ばします。**でも実在し、
#    サイトマップにも載っていて、いまも 200 で開きます。** 入れないと切替後に
#    このページの旧URLだけ404になります。
#
#    クリエイター側のコードは確認済みです（/view/category/all_items が開く）。
#    根拠は inventory/category-code-overrides.csv に書いてあります。
#
#    「対応が取れなかった」と報告して終わりにしていました。**取れなかったの
#    ではなく、取り方が1つしか無いと思っていただけ**でした。
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
