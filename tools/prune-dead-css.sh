#!/bin/sh
# =============================================================================
#  prune-dead-css.sh — 使われていないCSS規則を落とす
#
#  ご依頼の2番目「使っていないCSSは遠慮なく削除してよい」への対応です。
#
#  ※ 「未使用」は、それだけでは削除の理由になりません
#
#     この案件では、CSSがあってマークアップが無かった箇所が2つありました。
#
#       .gallery__dots   点。CSSは最初からあり、HTMLがどこにも無く、
#                        一度も表示されていませんでした
#       .spectable       仕様表。作り直すつもりで書いたが、実際のHTMLは
#                        お店が追加画像の説明欄に書いていた
#
#     どちらも「未使用だから消す」で処理していたら、**機能が無いことに
#     気づかないまま消していました。** 下の一覧は1つずつ理由を確かめてから
#     並べたものです。機械的に集めたのではありません。
#
#  --- 落とすもの、と理由 -------------------------------------------------------
#
#    optmatrix__* / optswatch   数量・カラーの選択UIを自前で作る想定でしたが、
#                               実際は $item.option_html でプラットフォームが
#                               出します。こちらのクラスは付きません
#    spectable*                 仕様表はお店が書いています（box20/22/23）
#    field*                     フォームはすべてプラットフォーム側の画面です
#    badge--sale/new/naire      アイコンは画像で出しています
#    hero__copy/inner/slide     メインビジュアルは $shop.mainvisual をそのまま
#    trends*                    **スマホサイト専用**。PC版に元から無く、
#                               SPサイトは移行で消えます
#    is-empty / num             対応するマークアップがありません
#    pricebox__sub              価格は price_html 1本にまとめたので出番がない
#
#  グループ化されたセレクタは、**全部が対象のときだけ**落とします。
#  1つでも生きているクラスが混ざっていれば残します。
#
#  ※ 元ファイルを上書きします。反映前に必ず確認してください:
#     - バイト数が減っていること（増えていたら失敗です。実際に一度
#       49KB を 92KB に増やしました）
#     - 波括弧の対応が取れていること
#     - sh tools/check-css-vars.sh が通ること
# =============================================================================
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
