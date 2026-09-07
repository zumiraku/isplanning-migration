#!/bin/sh
# build-all-pages-css.sh — the 全ページ共通 CSS box, as one paste
#
# tokens.css + components.css, with the @charset rules stripped.
#
# @charset must be the very first bytes of a stylesheet to mean anything. In a
# concatenation it cannot be: the header comment precedes it, and there were
# three of them - one from each source file plus the one that ended up mid-file
# after components.css. Browsers ignore an @charset that is not first, so this
# was harmless, but a rule that is ignored is a rule that should not be there.
#
# The console serves the box as UTF-8 regardless, which is what actually makes
# the Japanese comments work.
#
# Output: templates/creator/mode/all-pages.css
# Run from the repository root.

# 出力先は引数で変えられます。check-css-fresh.sh が一時ファイルへ書き出して
# 手元のものと比べるために使います（**ビルドを回し忘れると、プレビューだけ
# 直って本番のCSSが古いまま**になります）。
out="${1:-templates/creator/mode/all-pages.css}"

{
  cat <<'HDR'
/* ==========================================================================
   発見マーケット — デザインシステム
   貼り付け先: クリエイターモード › 全ページ共通 › CSS

   GENERATED - 直接編集しないでください。
   Source : templates/creator/css/tokens.css + components.css
   Build  : sh tools/build-all-pages-css.sh

   Basics標準のCSSを残す場合はこの内容を【末尾】に、置き換える場合は
   CSS欄を全選択してこれを貼ってください。まだ作り直していないページが
   Basicsのスタイルに依存している間は、末尾に足すほうが安全です。
   ========================================================================== */

HDR
  sed '/^@charset/d' templates/creator/css/tokens.css
  echo ""
  sed '/^@charset/d' templates/creator/css/components.css
} > "$out"

echo "lines    : $(wc -l < "$out")"
echo "bytes    : $(wc -c < "$out")"
echo "@charset : $(grep -c '@charset' "$out")   (0 が正しい)"
echo "output   : $out"
