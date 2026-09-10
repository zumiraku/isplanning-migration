#!/bin/sh
# =============================================================================
#  check-review-unified.sh — レビューが u-komi 一本になっているか
#
#  山口様のご判断（2026-09-07）:
#
#    > なぜでしょう？移行のボタンを押すだけでよかったと思いますが
#    > 確かにタオル類・卓上カレンダー・資材は旧レビューのままですね・・。
#    > お手数ですがu-komiに統一お願いいたします。
#
#  ベーシックモードでは、商品詳細テンプレートがカテゴリごとに分かれていて
#  （ct261 タオル類 / ct646 卓上カレンダー / ct664 資材）、その3本だけが
#  メイクショップ純正のレビューを出していました。**商品がどのカテゴリに
#  属するかでレビューの仕組みが変わる**状態です。しかも互いのレビューは
#  相手に出ません。
#
#  クリエイターモードの商品詳細テンプレートは1本だけなので、切り替えた時点で
#  この分裂は無くなります。ただし「無くなる」のは**こちらが純正レビューの
#  タグを1つも書いていない場合**に限ります。
#
#  ※ 純正レビューのタグはクリエイターモードにも全部あります。
#
#     $item.review.star_html / .total_count / .list_url / .post_url …
#     $category.item.list[i].has_review / .review.star_html …
#
#     「☆の表示くらい付けようか」と1つ足すだけで、u-komi と純正の両方が
#     画面に出ます。片方は空、片方は中身あり、という並び方をします。
#     **足した本人にはそれが分裂の再発だと見えません。**
#
#  なので、ここで機械的に禁止します。u-komi のマウントが商品詳細に1つある
#  ことと、純正タグがどこにも無いことの2つを見ます。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

fail=0

# --- 1. 純正レビュータグが1つも無いこと ---------------------------------------
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

# --- 2. u-komi のマウントが商品詳細にあること ---------------------------------
det=templates/creator/mode/detail.tpl
n=$(grep -c 'class="review-container"' "$det" 2>/dev/null || echo 0)
if [ "$n" -eq 1 ]; then
  # data-gname / data-pid が $item.system_code で解決されること。
  # 定数のまま出すと 9,534商品が同じidに結び付きます（Q13）。
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

# --- 3. 条件分岐で出し分けていないこと ----------------------------------------
# カテゴリごとに出し分けたら、それは分裂そのものです。
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
