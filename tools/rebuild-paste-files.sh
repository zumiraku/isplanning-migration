#!/bin/sh
# =============================================================================
#  rebuild-paste-files.sh — 貼り付け用の2ファイルを作り直す
#
#  make-paste-file.js は「コンソールの箱の中身を保存したファイル」から作ります。
#  一度貼り終えたあとは、Basics 標準の部分がリポジトリに控えてあるので、
#  こちらのブロックを差し替えるだけで作り直せます。**箱をコピーしに行く必要は
#  ありません。**
#
#  並び順は逆にできません。理由は package/paste/README.md に書いてあります。
#
#    CSS   Basics標準 → こちら     （こちらが後ろ。でないと Basics が勝つ）
#    JS    こちら → Basics標準     （こちらが前。でないと jQuery で落ちる）
# =============================================================================
set -e
cd "$(dirname "$0")/.."

css_out=package/paste/all-pages.css
js_out=package/paste/all-pages.js
[ -f "$css_out" ] && [ -f "$js_out" ] || { echo "貼り付けファイルがありません" >&2; exit 1; }

# --- 境界を、いまのファイルから測ります（決め打ちしません） -----------------
#     CSS: Basics標準の行数 + 空行1
css_head=$(wc -l < templates/basics-stock/all-pages-css-head.css | tr -d ' ')
#     JS : こちらのブロックの行数は、いまの mode/all-pages.js ではなく
#          **貼り付けファイルに入っている旧版**の行数で測ります
js_basics_at=$(grep -n -F '$(function() {' "$js_out" | head -1 | cut -d: -f1)
[ -n "$js_basics_at" ] || { echo "JS の Basics ブロックが見つかりません" >&2; exit 1; }
js_keep_from=$((js_basics_at - 1))   # 直前の空行から

tmp_css=.paste-css.tmp
tmp_js=.paste-js.tmp
trap 'rm -f "$tmp_css" "$tmp_js"' EXIT

{ head -"$css_head" "$css_out"; echo; cat templates/creator/mode/all-pages.css; } > "$tmp_css"
{ cat templates/creator/mode/all-pages.js; tail -n +"$js_keep_from" "$js_out"; } > "$tmp_js"

# --- 事故の検査 --------------------------------------------------------------
head -"$css_head" "$tmp_css" | diff -q - templates/basics-stock/all-pages-css-head.css >/dev/null \
  || { echo "🔴 CSS: Basics 標準の部分が変わっています" >&2; exit 1; }
grep -q -F '$(function() {' "$tmp_js" || { echo "🔴 JS: Basics の部分が消えました" >&2; exit 1; }
# @import はルールより後ろに置けません
awk '/^[[:space:]]*@import/{ if (seen) { print "🔴 @import がルールより後ろにあります: 行" NR; exit 1 } } /\{/{ seen=1 }' "$tmp_css"

mv "$tmp_css" "$css_out"
mv "$tmp_js" "$js_out"

printf 'CSS  %s 行  (Basics %s + こちら %s)\n' "$(wc -l < "$css_out" | tr -d ' ')" "$css_head" "$(wc -l < templates/creator/mode/all-pages.css | tr -d ' ')"
printf 'JS   %s 行  (こちら %s + Basics)\n'   "$(wc -l < "$js_out"  | tr -d ' ')" "$(wc -l < templates/creator/mode/all-pages.js | tr -d ' ')"
