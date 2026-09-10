#!/bin/sh
# =============================================================================
#  rebuild-paste-files.sh — 全ページ共通の箱に貼るものを用意する
#
#  ※ 2026-09-09、中身が変わりました
#
#     以前はここで **Basics 標準のコード**を先頭（CSS）や末尾（JS）に
#     継ぎ足していました。デザインセットを Basics から作った名残です。
#     継ぐ順番を間違えると壊れる、という理由でこの道具ができました。
#
#       CSS   Basics標準 2,326行 → こちら      （こちらが後ろ）
#       JS    こちら → Basics標準 67行         （こちらが前）
#
#     移植で **Basics 標準は入れないことにしました。** 素のテンプレートの
#     コードで、店舗の実CSS（m_sys_common.css 8,479行）と競合するだけです。
#     JS のほうも、Basics のグローバルナビ用で、移植版では使いません。
#
#     結果、この道具は**そのまま写すだけ**になりました。順番を間違えようが
#     ありません。道具が単純になったのは、方針が単純になったからです。
#
#  ※ Basics 標準を外すと影響するもの
#
#     こちらで作り直していない4つのページ種別が、素の見た目になります。
#
#       商品レビュー一覧 / 商品レビュー投稿 / まとめ買い割引 / 会員制・年齢確認
#
#     いずれもこの店舗では使っていません（まとめ買いは未設定、レビューは
#     u-komi に移行済み）。**必要になったら templates/basics-stock/ に
#     控えがあります。**
#
#  ※ 大きさについて
#
#     CSS が 180KB を超えます。以前の箱は 110KB でした。**箱に入りきるかは
#     貼ってみるまで分かりません。** 入らなければ、m_sys_common.css を
#     ストレージに置いて <link> で読む形に切り替えます（gigaplus の
#     default.css と同じやり方）。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

mkdir -p package/paste

src_css=templates/creator/mode/all-pages.css
src_js=templates/creator/mode/all-pages.js
[ -f "$src_css" ] || { echo "missing $src_css" >&2; exit 1; }
[ -f "$src_js" ]  || { echo "missing $src_js" >&2; exit 1; }

cp "$src_css" package/paste/all-pages.css
cp "$src_js"  package/paste/all-pages.js

# 事故の検査。@import はルールより後ろに置けません。
awk '/^[[:space:]]*@import/ { if (seen) { print "※ @import がルールより後ろにあります: 行" NR; exit 1 } } /\{/ { seen = 1 }' package/paste/all-pages.css

node --check package/paste/all-pages.js

printf 'CSS  %s 行  %s バイト\n' "$(wc -l < package/paste/all-pages.css | tr -d ' ')" "$(wc -c < package/paste/all-pages.css | tr -d ' ')"
printf 'JS   %s 行  %s バイト\n' "$(wc -l < package/paste/all-pages.js  | tr -d ' ')" "$(wc -c < package/paste/all-pages.js  | tr -d ' ')"
printf '\n両方とも、箱の中身を Ctrl+A で選んでから丸ごと置き換えてください。\n'
printf 'Basics 標準のコードは残しません（上のコメントに理由）。\n'
