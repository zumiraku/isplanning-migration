#!/bin/sh
set -e
cd "$(dirname "$0")/.."

mkdir -p package/paste

src_css=templates/creator/mode/all-pages.css
src_js=templates/creator/mode/all-pages.js
[ -f "$src_css" ] || { echo "missing $src_css" >&2; exit 1; }
[ -f "$src_js" ]  || { echo "missing $src_js" >&2; exit 1; }

cp "$src_css" package/paste/all-pages.css
cp "$src_js"  package/paste/all-pages.js

awk '/^[[:space:]]*@import/ { if (seen) { print "※ @import がルールより後ろにあります: 行" NR; exit 1 } } /\{/ { seen = 1 }' package/paste/all-pages.css

node --check package/paste/all-pages.js

printf 'CSS  %s 行  %s バイト\n' "$(wc -l < package/paste/all-pages.css | tr -d ' ')" "$(wc -c < package/paste/all-pages.css | tr -d ' ')"
printf 'JS   %s 行  %s バイト\n' "$(wc -l < package/paste/all-pages.js  | tr -d ' ')" "$(wc -c < package/paste/all-pages.js  | tr -d ' ')"
printf '\n両方とも、箱の中身を Ctrl+A で選んでから丸ごと置き換えてください。\n'
printf 'Basics 標準のコードは残しません（上のコメントに理由）。\n'

