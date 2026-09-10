#!/bin/sh
# =============================================================================
#  check-platform-hooks.sh — プラットフォームのフックに正しくつないでいるか
#
#  ※ これを書いた理由
#
#     公開直後、**検索がまったく動いていませんでした。** 見た目は完璧で、
#     プレビューでも実ページでも「検索窓」と「絞り込み」はきれいに出ており、
#     未展開タグも0件。それでも押すと何も起きませんでした。
#
#     makeshop のクリエイターモードは、カートも検索も問い合わせも
#     「URLらしき文字列」を href に置かせ、**その href のクリックを
#     JavaScript で横取りする**設計です。実サーバの system.js を読むと、
#     検索に張っているのはこれ1本だけでした。
#
#       $('[href="' + searchUrl + '"]').on('click', …)
#
#     system.js の中に [action= は0件、on('submit' も0件です。**フォームの
#     送信は誰も見ていません。** こちらは <form action="…"> と
#     <button type="submit"> で書いていたので、押すとURLに # が付くだけでした。
#
#     未展開タグの検査も、リンク切れの検査も、はみ出しの検査も、
#     ぜんぶ通ります。**属性名がひとつ違うだけだからです。**
#
#  何を見るか
#
#     1. マーカー（#makeshop-…）が href 以外の属性に載っていないか
#     2. テンプレートに <form> や type="submit" が残っていないか
#
#  マーカーを新しく使うときは、まず実サーバの system.js を読んでください。
#  href なのか、data-* に置く設定値なのかは、そこにしか書いてありません。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

fail=0
echo "テンプレートの中で、マーカーがどの属性に載っているかを見ます"
echo

# data-* に載るのは設定値なので正常。href なら正常。それ以外は誤り。
found=0
for f in templates/creator/mode/*.tpl package/templates/*.tpl package/modules/*.tpl; do
  [ -f "$f" ] || continue
  # <{$…search_url}> などタグ経由も含めるため、search_url / contact_url /
  # cart_entry_url / restock_url を持つ属性名を拾います
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
