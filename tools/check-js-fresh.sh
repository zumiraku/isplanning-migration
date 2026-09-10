#!/bin/sh
# check-js-fresh.sh — 配信するJavaScriptが、手元のJSから作り直されているか
set -e
cd "$(dirname "$0")/.."

live=templates/creator/mode/all-pages.js
tmp="${TMPDIR:-.}/all-pages-fresh.js"

sh tools/build-all-pages-js.sh "$tmp" > /dev/null 2>&1

if [ ! -f "$live" ]; then
  echo "※ $live がありません"
  rm -f "$tmp"; exit 1
fi

if cmp -s "$live" "$tmp"; then
  printf "OK  all-pages.js は最新です（%s バイト）\n" "$(wc -c < "$live" | tr -d ' ')"
  rm -f "$tmp"
  exit 0
fi

echo "※ all-pages.js が js/*.js と食い違っています。"
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

