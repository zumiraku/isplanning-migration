#!/bin/sh
dir="${1:-package/templates}"
fail=0


for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  o=$(grep -c '<{\*' "$f")
  c=$(grep -c '\*}>' "$f")
  if [ "$o" -ne "$c" ]; then
    echo "  $(basename "$f") : コメント 開始 $o / 終了 $c - *} で閉じている箇所があります"
    fail=1
  fi
done
printf "%-18s %8s %6s %6s %6s %6s\n" file doctype head body_top body_btm include
printf "%s\n" "----------------------------------------------------------------------"

for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  case "$name" in category-captions.tpl|category-tiles.tpl) continue ;; esac

  strip=$(perl -CSD -0777 -pe 's/<\{\*.*?\*\}>//gs' "$f")
  n_head=$(printf '%s' "$strip" | grep -c '<{\$makeshop\.head}>')
  n_top=$(printf  '%s' "$strip" | grep -c '<{\$makeshop\.body_top}>')
  n_btm=$(printf  '%s' "$strip" | grep -c '<{\$makeshop\.body_bottom}>')
  n_doc=$(printf  '%s' "$strip" | grep -ci '<!doctype html>')

  missing=0
  for inc in $(printf '%s' "$strip" | grep -o 'include file="[^"]*"' | sed 's/.*file="//; s/"//'); do
    [ -f "$dir/$inc" ] || { missing=$((missing + 1)); }
  done

  ok="OK"
  [ "$n_doc" -eq 1 ] && [ "$n_head" -eq 1 ] && [ "$n_top" -eq 1 ] && [ "$n_btm" -eq 1 ] && [ "$missing" -eq 0 ] || { ok="NG"; fail=1; }
  printf "%-18s %8s %6s %6s %6s %6s   %s\n" "$name" "$n_doc" "$n_head" "$n_top" "$n_btm" "$missing" "$ok"
done

echo ""

echo ""
echo "見出し:"
h1fail=0
hdr=package/modules/header.tpl
hdr_h1=0
[ -f "$hdr" ] && hdr_h1=$(perl -CS -0777 -ne 's{<\{\*.*?\*\}>}{}gs; my $c = () = /<h1\b/g; print $c' "$hdr")
printf "  %-22s h1 %s  （全ページ共通）\n" "$(basename "$hdr")" "$hdr_h1"
for f in package/templates/*.tpl; do
  n=$(perl -CS -0777 -ne 's{<\{\*.*?\*\}>}{}gs; my $c = () = /<h1\b/g; print $c' "$f")
  n=$((n + hdr_h1))
  if [ "$n" = "1" ]; then
    printf "  %-22s h1 %s\n" "$(basename "$f")" "$n"
  else
    printf "  %-22s h1 %s   ※\n" "$(basename "$f")" "$n"
    h1fail=1
  fi
done
if [ "$h1fail" -ne 0 ]; then
  echo ""
  echo "  h1 は1ページに1つです。0だと文書に主題がなく、2つ以上だとどれが"
  echo "  主題か決まりません。"
  exit 1
fi

echo ""
[ "$fail" -eq 0 ] && [ "$h1fail" -eq 0 ] && echo "all page templates are complete documents" || echo "SOMETHING IS INCOMPLETE"
exit $(( fail + h1fail ))

