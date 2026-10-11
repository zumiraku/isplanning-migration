#!/bin/sh
set -e
cd "$(dirname "$0")/.."

out="${1:-templates/creator/mode/all-pages.css}"
base=templates/basic-utf8/m_sys_common.html
resp=templates/creator/css/port-responsive.css

[ -f "$base" ] || { echo "missing $base — tools/port/to-utf8.js を先に" >&2; exit 1; }
[ -f "$resp" ] || { echo "missing $resp" >&2; exit 1; }

{
  cat <<'HDR'
/* ===========================================================================
   全ページ共通 CSS — 生成物です。直接編集しないでください。

     tools/build-all-pages-css.sh が作ります。中身は2つ。

       1. 店舗の実CSS（m_sys_common.css）をそのまま
       2. port-responsive.css — 狭い画面の折り返しだけを足す層

     1 は1バイトも変えていません。2 は上書きだけで、元の指定を消しません。
   =========================================================================== */
HDR
  sed '/^@charset/d' "$base"
  printf '\n\n'
  cat <<'HDR2'
/* ===========================================================================
   ここから下が、こちらが足した層です。ここまでは店舗の実CSSです。
   =========================================================================== */
HDR2
  sed '/^@charset/d' "$resp"
} > "$out"

printf "lines    : %s\n" "$(wc -l < "$out" | tr -d ' ')"
printf "bytes    : %s\n" "$(wc -c < "$out" | tr -d ' ')"
printf "@charset : %s   (0 が正しい)\n" "$(grep -c '^@charset' "$out" || true)"
printf "output   : %s\n" "$out"

