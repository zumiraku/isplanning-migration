#!/bin/sh
# =============================================================================
#  check-templates-fresh.sh — 貼るテンプレートが、手元から作り直されているか
#
#  CSS と JavaScript で同じ食い違いを2回起こしました。3回目を待つ理由が
#  ありません。
#
#    編集する    templates/creator/mode/*.tpl
#    貼り付ける  package/templates/*.tpl        ← build-page-templates.sh の生成物
#
#  🔴 CSS のときは、直したのに配信物が古いままでした。
#  🔴 JavaScript のときは、**逆方向**でした ── 生成物だけが直っていて、
#     ソースが古いまま。しかも検証ページはソース側を読むので、
#     **不具合の残ったほうを検査して合格していました。**
#
#  ここで作り直して1バイト単位で比べます。元ファイルは書き換えません。
# =============================================================================
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

echo "🔴 package/templates が templates/creator/mode/ と食い違っています。"
echo ""
diff -rq "$tmp" "$live" | sed 's/^/    /'
echo ""
echo "    どちらが新しいかは自動では判断できません。**生成物側を直接直した"
echo "    ことが JavaScript で実際にありました。** 差分を読んでから決めてください。"
echo "    ソース側が正しいなら:  sh tools/build-page-templates.sh"
rm -rf "$tmp"
exit 1
