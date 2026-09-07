#!/bin/sh
# =============================================================================
#  check-js-fresh.sh — 配信するJavaScriptが、手元のJSから作り直されているか
#
#  check-css-fresh.sh の JavaScript 版です。**同じ日にCSS側だけ手当てして、
#  こちらを忘れました。** その結果、実際に2種類の食い違いが同時に存在して
#  いました。
#
#    templates/creator/js/gallery.js        ← 古い。不具合が残ったまま
#    templates/creator/mode/all-pages.js    ← 修正済み。直接手で直されていた
#
#    templates/creator/js/quote-prefill.js  ← 修正済み
#    templates/creator/mode/all-pages.js    ← 古い。修正が入っていない
#
#  **逆方向に2つ**です。片方はバンドルだけを直し、もう片方はソースだけを
#  直したためで、どちらも「直した」と記録されていました。
#
#  🔴 しかも検証ページは js/*.js を直接読みます。
#
#     つまり verify-gallery.html は**不具合の残ったほう**を検査していて、
#     しかも通っていました。スワイプ追随の判定が
#     `setActive(Number(getAttribute('data-gallery-slide')))` の結果に依存し、
#     属性が値なしなので常に 0 になり、0番目を見る検査が通ってしまう ──
#     **不具合のおかげで合格していた**という形です。
#
#  ここで毎回、ソースから組み直して1バイト単位で比べます。元ファイルは
#  書き換えません。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

live=templates/creator/mode/all-pages.js
tmp="${TMPDIR:-.}/all-pages-fresh.js"

sh tools/build-all-pages-js.sh "$tmp" > /dev/null 2>&1

if [ ! -f "$live" ]; then
  echo "🔴 $live がありません"
  rm -f "$tmp"; exit 1
fi

if cmp -s "$live" "$tmp"; then
  printf "OK  all-pages.js は最新です（%s バイト）\n" "$(wc -c < "$live" | tr -d ' ')"
  rm -f "$tmp"
  exit 0
fi

echo "🔴 all-pages.js が js/*.js と食い違っています。"
printf "    手元 %s バイト / 作り直すと %s バイト\n" \
  "$(wc -c < "$live" | tr -d ' ')" "$(wc -c < "$tmp" | tr -d ' ')"
echo ""
echo "    どちらが新しいかは自動では判断できません。**バンドル側を直接直した"
echo "    ことが実際にあります。** 差分を読んでから、どちらを残すか決めてください。"
echo ""
diff "$live" "$tmp" | head -16 | sed 's/^/      /'
echo ""
echo "    ソース側が正しいなら:  sh tools/build-all-pages-js.sh"
rm -f "$tmp"
exit 1
