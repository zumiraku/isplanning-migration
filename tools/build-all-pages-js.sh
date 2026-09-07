#!/bin/sh
# =============================================================================
#  build-all-pages-js.sh — 全ページ共通の JavaScript を組み立てる
#
#  🔴 このファイルは、これまで手で貼り合わせていました。
#
#     2026-09-07 に quote-prefill.js を直したあと、**all-pages.js を作り直す
#     のを忘れました。** 直したのは js/ の側で、コンソールに貼るのは mode/ の
#     側です。プレビューは js/*.js を直接読むので**直って見え**、検証13項目も
#     **全部通り**、実際に配信されるものだけが古いまま、という状態でした。
#
#     CSS でまったく同じ危険に気づいて check-css-fresh.sh を作った同じ日に、
#     JavaScript には同じ手当てをしていませんでした。片方だけ直すと、もう
#     片方が「気づかれない側」になります。
#
#  順番が仕様です。詳しくはヘッダに書いてありますが、要点は:
#
#    - 先頭のセミコロン1文字（前のブロックが ; で終わっていない場合の保険）
#    - こちらのブロックが Basics 標準の67行より【上】
#      逆にすると `$ is not defined` で1行も動きません
#
#  option-price.js は**入れていません**。行き先が未確定です（下の README と
#  docs/findings-stage0.md）。黙って足すと、プラットフォーム側の価格計算と
#  二重に動く可能性があり、価格が出ないより悪くなります。
#
#  出力先は引数で変えられます。check-js-fresh.sh が一時ファイルへ書き出して
#  手元のものと比べるために使います。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

out="${1:-templates/creator/mode/all-pages.js}"
hdr=templates/creator/js/_bundle-header.txt
parts="gallery tabs quote-prefill"

[ -f "$hdr" ] || { echo "missing $hdr" >&2; exit 1; }

{
  cat "$hdr"
  first=1
  for p in $parts; do
    f="templates/creator/js/$p.js"
    [ -f "$f" ] || { echo "missing $f" >&2; exit 1; }
    [ "$first" -eq 1 ] || printf '\n'
    printf '/* ---------- %s.js ---------- */\n' "$p"
    cat "$f"
    first=0
  done
} > "$out"

printf "parts    : %s\n" "$parts"
printf "lines    : %s\n" "$(wc -l < "$out" | tr -d ' ')"
printf "bytes    : %s\n" "$(wc -c < "$out" | tr -d ' ')"
printf "output   : %s\n" "$out"
node --check "$out" && printf "構文     : OK\n"
