#!/bin/sh
# =============================================================================
#  check-freepage-coverage.sh — 独自ページを1ページも落としていないか
#
#  ご依頼の3番目が「独自ページはテンプレート化してよい」でした。テンプレート化
#  する前に、**そもそも全ページ手元にあるのか**が先です。
#
#  ※ 一度、80ページしか無い状態で「揃っている」と書いていました。
#
#     クロールで到達できないページが4つあり、そのうち page19 は一度も見た
#     ことがなく、page4 は中身の無い仮置きでした。privacy に至っては
#     フッターのJavaScriptからしか開けず、サイトマップにもクロールにも
#     独自ページ一覧にも出てきません。**入口が3つとも塞がっていたページを
#     「無い」ではなく「揃っている」と書いていた**のが問題でした。
#
#     4つとも手作業で保存して取り込み済みですが、同じ見落としが二度と
#     起きないように、ここで毎回数え直します。
#
#  見るのは3つです。
#
#    1. 管理画面の一覧（inventory/freepages-admin-list.csv）と、配信する
#       package/freepages/ が**両方向で**一致すること。片方向だけだと
#       「余分に作った」に気づけません
#    2. 仮置きの文言が本文に残っていないこと。privacy には移行作業中の
#       メモが本文として入ったまま、**お客様に表示される状態**でした
#    3. 本文が極端に短いページの一覧。これは失敗にしません。元から短い
#       ページが実際にあります（page82 はスマホ用カレンダーのダミー、
#       page6 はメルマガのiframe1本）。**目視のための表示**です
# =============================================================================
set -e
cd "$(dirname "$0")/.."

LIST=inventory/freepages-admin-list.csv
DIR=package/freepages
[ -f "$LIST" ] || { echo "missing $LIST" >&2; exit 1; }

work="${TMPDIR:-.}/.freepage-coverage.$$"
mkdir -p "$work"
trap 'rm -rf "$work"' EXIT

tail -n +2 "$LIST" | sed 's/^"//; s/".*//; s/\.html$//' | grep . | sort -u > "$work/admin"
ls "$DIR"/*.html 2>/dev/null | sed 's#.*/##; s/\.html$//' | sort -u > "$work/held"

comm -23 "$work/admin" "$work/held" > "$work/missing"
comm -13 "$work/admin" "$work/held" > "$work/extra"

printf "管理画面の一覧 %s ページ / 配信するもの %s ページ\n\n" \
  "$(wc -l < "$work/admin" | tr -d ' ')" "$(wc -l < "$work/held" | tr -d ' ')"

fail=0

if [ -s "$work/missing" ]; then
  echo "※ 管理画面にあるのに、こちらに無いページ"
  sed 's/^/   /' "$work/missing"
  echo ""
  fail=1
fi

if [ -s "$work/extra" ]; then
  echo "※ こちらにあるのに、管理画面の一覧に無いページ"
  echo "   （ページ番号を取り違えている可能性があります）"
  sed 's/^/   /' "$work/extra"
  echo ""
  fail=1
fi

[ "$fail" -eq 0 ] && echo "OK  両方向で一致。落としているページはありません"
echo ""

# --- 2. 仮置きの文言が残っていないか -----------------------------------------
# privacy は「このページは独自ページではありません（調査中）」を本文として
# 出していました。コメントではなく本文です。
if grep -l -E '調査中|準備中|仮置き|あとで差し替え|TODO' "$DIR"/*.html >/dev/null 2>&1; then
  echo "※ 仮置きの文言が本文に残っています（そのままお客様に出ます）"
  grep -l -E '調査中|準備中|仮置き|あとで差し替え|TODO' "$DIR"/*.html | sed 's#.*/#   #'
  echo ""
  fail=1
else
  echo "OK  仮置きの文言は残っていません"
fi
echo ""

# --- 3. 本文が短いページ（表示のみ・失敗にしない） ---------------------------
echo "本文の短いページ（元から短いものもあります。目視用）"
for f in "$DIR"/*.html; do
  # <main> の中身から、全ページ共通のパンくずを消して文字数を数えます。
  # ※ ここを「先頭4行を捨てる」で済ませると、本文が1行しか無いページが
  #    0文字と出ます。パンくずの範囲を名指しで消します。
  n=$(sed -n '/<main/,/<\/main>/p' "$f" \
      | sed '/<nav class="breadcrumb"/,/<\/nav>/d' \
      | sed 's/<[^>]*>//g; s/<{[^}]*}>//g' \
      | tr -d ' 	' | grep -v '^$' | wc -c | tr -d ' ')
  printf "%6s  %s\n" "$n" "$(basename "$f")"
done | sort -n | head -6 | sed 's/^/   /'

exit "$fail"
