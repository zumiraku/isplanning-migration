#!/bin/sh
# check-platform-hooks.sh — プラットフォームのフックに正しくつないでいるか
set -e
cd "$(dirname "$0")/.."

fail=0
echo "テンプレートの中で、マーカーがどの属性に載っているかを見ます"
echo

found=0
for f in templates/creator/mode/*.tpl package/templates/*.tpl package/modules/*.tpl; do
  [ -f "$f" ] || continue
  grep -o '[a-zA-Z-]*="<{\$[^}]*\(search_url\|contact_url\|cart_entry_url\|restock_url\|order_url\|favorite_[a-z]*_url\)[^}]*}>"' "$f" 2>/dev/null |
  while IFS= read -r hit; do
    attr=${hit%%=*}
    case "$attr" in
      href) ;;
      data-*) ;;
      *) printf '  ※ %s\n     %s\n     → プラットフォームは href のクリックしか見ません\n' "$f" "$hit"; echo x >> .hookfail ;;
    esac
  done
  found=1
done
[ "$found" = 1 ] || { echo "  テンプレートが見つかりません"; exit 1; }

if [ -f .hookfail ]; then rm -f .hookfail; fail=1; else
  echo "  マーカーはすべて href か data-* に載っています"
fi

echo
echo "テンプレートに <form> と type=\"submit\" が残っていないかを見ます"
hits=$(grep -n '<form\|type="submit"' templates/creator/mode/*.tpl package/templates/*.tpl package/modules/*.tpl 2>/dev/null | grep -v '^\S*:[0-9]*: *<{\*' | grep -v '※\|ではありません\|で書いていました' || true)
if [ -n "$hits" ]; then
  echo "$hits" | sed 's/^/  ※ /'
  echo "     → submit はプラットフォームに届きません。<a href> にしてください"
  fail=1
else
  echo "  残っていません"
fi

echo
if [ "$fail" = 1 ]; then echo "  -> ※ NG"; exit 1; fi
echo "  -> OK"

