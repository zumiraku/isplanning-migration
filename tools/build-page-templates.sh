#!/bin/sh
# =============================================================================
#  build-page-templates.sh — 貼り付け用のページを package/templates に配る
#
#  🔴 2026-09-09、組み立てをやめました
#
#     以前はページごとに部品を継ぎ合わせていました。
#
#       _shell-head.tpl + _shell-header.tpl + <page>-body.tpl
#                       + _shell-main-end.tpl + _shell-foot.tpl
#
#     移植でページ側が**完全なHTML文書**になったあとも、この継ぎ合わせが
#     残っていました。結果、**<!doctype html> が2つある文書**を配って
#     いました（package/templates/top.tpl と detail.tpl で実際にそうなって
#     いました）。貼れば表示は崩れます。
#
#     いまは tools/port/*.js が完成品を作るので、ここは配るだけです。
#     継ぎ合わせの部品（_shell-*.tpl と *-body.tpl）はもう使いません。
#
#  🔴 header / leftmenu / footer は上書きしません
#
#     以前ここに `cp _module-header.tpl package/modules/header.tpl` が
#     ありました。移植後に回すと、**山口様が「文言がない」と指摘された
#     ヘッダーに黙って戻ります。** 生成元は tools/port/build-chrome.js です。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

src=templates/creator/mode
out=package/templates
mkdir -p "$out"

# 左がコンソールのページ種別、右が生成元のファイル名
PAGES="top:top category:category detail:detail search:search cart:cart
news-list:news-list news-detail:news-detail company:company guide:guide
contract:contract policy:policy"

echo "配布:"
for pair in $PAGES; do
  page=${pair%%:*}
  file=${pair##*:}
  s="$src/$file.tpl"
  [ -f "$s" ] || { echo "  🔴 生成元がありません: $s" >&2; exit 1; }

  # 完全な文書であることを確かめてから配ります。継ぎ合わせの残骸や、
  # 本文だけのファイルを黙って配らないためです。
  n=$(grep -c '<!doctype html>' "$s" || true)
  if [ "$n" != "1" ]; then
    echo "  🔴 $file.tpl の <!doctype html> が $n 個です（1個であるべき）" >&2
    exit 1
  fi

  cp "$s" "$out/$page.tpl"
  printf "  %-22s %6s 行  %7s バイト\n" "$page.tpl" "$(wc -l < "$out/$page.tpl")" "$(wc -c < "$out/$page.tpl")"
done

# 🔴 category_tiles / category_captions は退役しました。
#
#    こちらが設計した「カテゴリタイル」で、移植後はどのページからも
#    呼ばれていません（$module.* の参照は header / leftmenu / footer /
#    calendar1 / calendar2 だけ）。商品詳細のカテゴリ一覧タブは、
#    元テンプレートの <ul class="page_scene"> をそのまま持ってきています。
#
#    山口様の「カテゴリーの文字が羅列していて見にくい」は、この自前タイルの
#    ことでした。元の形に戻したので、モジュールごと外しています。
mkdir -p package/modules

echo ""
echo "モジュール:"
for m in header leftmenu footer calendar1 calendar2; do
  printf "  %-22s %7s バイト  (tools/port/build-chrome.js が生成)\n" "$m.tpl" "$(wc -c < "package/modules/$m.tpl")"
done

echo ""
echo "package : $out"
echo ""
echo "各ファイルは完全なHTML文書です。そのページ種別のHTML欄に"
echo "Ctrl+A → Ctrl+V で丸ごと置き換えてください。"
