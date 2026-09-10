#!/bin/sh
# check-templates-fresh.sh — 貼るテンプレートが、手元から作り直されているか
set -e
cd "$(dirname "$0")/.."

live=package/templates
tmp="${TMPDIR:-.}/templates-fresh"

rm -rf "$tmp"
cp -r "$live" "$tmp"
sh tools/build-page-templates.sh > /dev/null 2>&1

if diff -rq "$tmp" "$live" > /dev/null 2>&1; then
  n=$(ls "$live"/*.tpl 2>/dev/null | wc -l | tr -d ' ')
  printf "OK  package/templates は最新です（%s 枚）\n" "$n"
  rm -rf "$tmp"
  exit 0
fi

echo "※ package/templates が templates/creator/mode/ と食い違っています。"
echo ""
diff -rq "$tmp" "$live" | sed 's/^/    /'
echo ""
echo "    どちらが新しいかは自動では判断できません。**生成物側を直接直した"
echo "    ことが JavaScript で実際にありました。** 差分を読んでから決めてください。"
echo "    ソース側が正しいなら:  sh tools/build-page-templates.sh"
rm -rf "$tmp"
exit 1

