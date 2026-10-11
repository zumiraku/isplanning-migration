#!/bin/sh
set -e
cd "$(dirname "$0")/.."

UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
work="$PWD/.find-missing"
mkdir -p "$work"
trap 'rm -rf "$work"' EXIT
OUT="$work/all-items-codes.txt"
: > "$OUT"

total=$(curl -s -A "$UA" --max-time 30 "https://www.isp-sp.com/shopbrand/all_items/" \
        | perl -e 'require Encode; binmode(STDIN, ":raw"); binmode(STDOUT, ":encoding(UTF-8)"); local $/; my $b=<STDIN>; my $t=Encode::decode("euc-jp",$b); print $1 if $t=~/<p class="total">\x{5168}\s*([0-9]+)\s*\x{4EF6}/')
[ -n "$total" ] || { echo "件数が読めませんでした" >&2; exit 1; }

pages=$(( (total + 39) / 40 ))
printf "全 %s 件 / %s ページ\n" "$total" "$pages"
printf "0.4秒おきに取得します。数分かかります。\n\n"

p=1
while [ "$p" -le "$pages" ]; do
  curl -s -A "$UA" --max-time 30 "https://www.isp-sp.com/shopbrand/all_items/page$p/order/" \
    | grep -o '/shopdetail/[0-9A-Za-z]\{12\}' | sed 's|/shopdetail/||' >> "$OUT" || true
  if [ $((p % 20)) -eq 0 ]; then
    printf "  %3s / %s ページ（%s 件収集）\n" "$p" "$pages" "$(sort -u "$OUT" | wc -l | tr -d ' ')"
  fi
  p=$((p + 1))
  sleep 0.4
done

sort -u "$OUT" -o "$OUT"
found=$(wc -l < "$OUT" | tr -d ' ')
printf "\n一覧から集めた商品: %s 件（全 %s 件）\n" "$found" "$total"

perl -CS -e '
  require Encode;
  open my $i, "<:raw", "package/url-bulk/products-url.csv" or die;
  local $/; my $b = <$i>; close $i; $b =~ s/^\xEF\xBB\xBF//;
  my $t = Encode::decode_utf8($b);
  while ($t =~ m{/view/item/([0-9A-Za-z]{12})}g) { print "$1\n" }
' | sort -u > "$work/csv-codes.txt"

echo ""
echo "※ 一覧にあって、対応表に無い商品:"
comm -23 "$OUT" "$work/csv-codes.txt" | sed 's/^/   /' | head -30
n=$(comm -23 "$OUT" "$work/csv-codes.txt" | wc -l | tr -d ' ')
[ "$n" -eq 0 ] && echo "   （ありません）"
echo ""
echo "対応表にあって、一覧に無い商品:"
comm -13 "$OUT" "$work/csv-codes.txt" | sed 's/^/   /' | head -10
m=$(comm -13 "$OUT" "$work/csv-codes.txt" | wc -l | tr -d ' ')
[ "$m" -eq 0 ] && echo "   （ありません）"
echo ""
printf "差: 一覧のみ %s 件 / 対応表のみ %s 件\n" "$n" "$m"

