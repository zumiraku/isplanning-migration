#!/bin/sh
# check-review-unified.sh — レビューが u-komi 一本になっているか
set -e
cd "$(dirname "$0")/.."

fail=0

hits=$(grep -n -E '\$(item|category\.item\.list\[[a-z]\]|search\.item\.list\[[a-z]\]|bulk\.item\.list\[[a-z]\])\.(has_review|review\.)' \
         templates/creator/mode/*.tpl package/templates/*.tpl package/modules/*.tpl 2>/dev/null \
       | grep -v '<{\*' || true)
hits="$hits$(grep -n '\$review_item\.' templates/creator/mode/*.tpl package/templates/*.tpl package/modules/*.tpl 2>/dev/null | grep -v '<{\*' || true)"

if [ -n "$(printf '%s' "$hits" | tr -d '[:space:]')" ]; then
  echo "※ メイクショップ純正のレビュータグが残っています"
  echo "   u-komi と二重に出ます。ct261/ct646/ct664 と同じ分裂の再発です。"
  printf '%s\n' "$hits" | sed 's/^/   /'
  echo ""
  fail=1
else
  echo "OK  純正レビュータグは1つもありません"
fi

det=templates/creator/mode/detail.tpl
n=$(grep -c 'class="review-container"' "$det" 2>/dev/null || echo 0)
if [ "$n" -eq 1 ]; then
  if grep -q 'data-gname="<{$item.system_code}>"' "$det" && \
     grep -q 'data-pid="<{$item.system_code}>"' "$det"; then
    echo "OK  u-komi のマウントは1つ、id は \$item.system_code"
  else
    echo "※ u-komi の data-gname / data-pid が \$item.system_code ではありません"
    grep -n 'data-gname\|data-pid' "$det" | sed 's/^/   /'
    fail=1
  fi
else
  echo "※ 商品詳細の u-komi マウントが $n 個です（1個であるべき）"
  fail=1
fi

if grep -n 'review-container' "$det" | grep -q 'if '; then
  echo "※ u-komi のマウントが条件分岐の中にあります"
  fail=1
fi
blk=$(grep -n -B4 'class="review-container"' "$det" | grep -E '<\{if .*(category|ct261|ct646|ct664)' || true)
if [ -n "$blk" ]; then
  echo "※ u-komi のマウントがカテゴリで出し分けられています"
  printf '%s\n' "$blk" | sed 's/^/   /'
  fail=1
else
  echo "OK  全商品に同じマウントが出ます（カテゴリでの出し分けなし）"
fi

exit "$fail"

