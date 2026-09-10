#!/bin/sh
# prune-dead-css.sh — 使われていないCSS規則を落とす
set -e
cd "$(dirname "$0")/.."

SRC=templates/creator/css/components.css
[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }

DEAD="optmatrix__colours optmatrix__facts optmatrix__qty optmatrix__tier
optmatrix__total optmatrix__unit optswatch
spectable spectable__label spectable__state spectable__state--act
spectable__state--no spectable__state--yes
field field__error field__help field__label field__req
badge--sale badge--new badge--naire
hero__copy hero__inner hero__slide
trends trends__inner trends__label
is-empty num pricebox__sub"

before=$(wc -c < "$SRC")
tmp="${TMPDIR:-/tmp}/pruned-components.css"
node tools/_prune-dead-css.js "$SRC" $DEAD > "$tmp"
after=$(wc -c < "$tmp")

if [ "$after" -ge "$before" ]; then
  echo "  ※ バイト数が減っていません（$before → $after）。反映しません。" >&2
  exit 1
fi

cp "$tmp" "$SRC"
printf "  components.css %s → %s バイト（%s 減）\n" "$before" "$after" "$((before - after))"
echo ""
sh tools/build-all-pages-css.sh 2>&1 | grep -E "bytes|output"

