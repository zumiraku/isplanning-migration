#!/bin/sh
# check-page-templates.sh — is each assembled page a valid, complete document?
#
# Three things, in order of how badly they fail.
#
# 1. The three 必ず記載 tags. Without them the platform injects nothing, which
#    on this shop means no Google Analytics and no u-komi. The page still looks
#    right, which is what makes it dangerous.
# 2. One <html>, one <head>, one <body>, correctly nested.
# 3. No leftover include of a file that is not in the package.
#
# The first version of this check counted the strings anywhere in the file and
# reported 2 of each, because the templates *discuss* the tags in comments as
# well as emitting them. Counting the emitted form only is the whole difference
# between a check and a number.
#
# Needs Git Bash (perl). Run from the repository root.

dir="${1:-package/templates}"
fail=0


# Comment delimiters. This one has now been got wrong twice, in two different
# batches of files, and both times it was invisible: a comment that opens <{*
# and closes *} instead of *}> does not close at all, so everything up to the
# next *}> is swallowed. In the assembled templates that ate the doctype, the
# <head> and $makeshop.body_top - the page still had a </body> so it looked
# plausible, and it would have shipped with no analytics and no reviews.
#
# So it is a check now rather than something to remember.
for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  o=$(grep -c '<{\*' "$f")
  c=$(grep -c '\*}>' "$f")
  if [ "$o" -ne "$c" ]; then
    echo "  $(basename "$f") : コメント 開始 $o / 終了 $c - *} で閉じている箇所があります"
    fail=1
  fi
done
printf "%-18s %8s %6s %6s %6s %6s\n" file doctype head body_top body_btm include
printf "%s\n" "----------------------------------------------------------------------"

for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  case "$name" in category-captions.tpl|category-tiles.tpl) continue ;; esac

  # Emitted tags only: <{$makeshop.head}>, not the words in a comment.
  strip=$(perl -CSD -0777 -pe 's/<\{\*.*?\*\}>//gs' "$f")
  n_head=$(printf '%s' "$strip" | grep -c '<{\$makeshop\.head}>')
  n_top=$(printf  '%s' "$strip" | grep -c '<{\$makeshop\.body_top}>')
  n_btm=$(printf  '%s' "$strip" | grep -c '<{\$makeshop\.body_bottom}>')
  n_doc=$(printf  '%s' "$strip" | grep -ci '<!doctype html>')

  # Includes must resolve inside the package.
  missing=0
  for inc in $(printf '%s' "$strip" | grep -o 'include file="[^"]*"' | sed 's/.*file="//; s/"//'); do
    [ -f "$dir/$inc" ] || { missing=$((missing + 1)); }
  done

  ok="OK"
  [ "$n_doc" -eq 1 ] && [ "$n_head" -eq 1 ] && [ "$n_top" -eq 1 ] && [ "$n_btm" -eq 1 ] && [ "$missing" -eq 0 ] || { ok="NG"; fail=1; }
  printf "%-18s %8s %6s %6s %6s %6s   %s\n" "$name" "$n_doc" "$n_head" "$n_top" "$n_btm" "$missing" "$ok"
done

echo ""

# --- 見出しの構造 -------------------------------------------------------------
# ※ トップページに <h1> がありませんでした。
#    商品もカテゴリも1つずつ入っているのに、**サイトでいちばん重要なページ
#    だけ0**。実サイトのHTMLを数えて初めて分かりました。S0-16 で「全ページが
#    同じ h1 を出している」のを直したとき、トップからも消していました。
#    他のページでは正しい修正でしたが、トップにとってはあれが正しい h1 でした。
#
#    1ページに h1 は1つ。0でも2つ以上でも報告します。
#    ※ 2026-09-09、数え方を直しました
#
#       移植後、11ページ全部が「h1 が 0」で落ちました。**h1 はヘッダーに
#       あります。** 店舗の元テンプレートは 上段メニュー に
#
#         <h1>粗品や景品、ノベルティの名入れ通販｜粗品のことなら発見マーケット</h1>
#
#       を置いていて、全ページ共通です。ページ側のファイルだけ数えると0に
#       見えますが、配信されるHTMLには1つあります。**モジュールを足して
#       数えます。**
#
#       ページ側の見出しが <h2> なのも元どおりです。作り変えません。
echo ""
echo "見出し:"
h1fail=0
hdr=package/modules/header.tpl
hdr_h1=0
[ -f "$hdr" ] && hdr_h1=$(perl -CS -0777 -ne 's{<\{\*.*?\*\}>}{}gs; my $c = () = /<h1\b/g; print $c' "$hdr")
printf "  %-22s h1 %s  （全ページ共通）\n" "$(basename "$hdr")" "$hdr_h1"
for f in package/templates/*.tpl; do
  n=$(perl -CS -0777 -ne 's{<\{\*.*?\*\}>}{}gs; my $c = () = /<h1\b/g; print $c' "$f")
  n=$((n + hdr_h1))
  if [ "$n" = "1" ]; then
    printf "  %-22s h1 %s\n" "$(basename "$f")" "$n"
  else
    printf "  %-22s h1 %s   ※\n" "$(basename "$f")" "$n"
    h1fail=1
  fi
done
if [ "$h1fail" -ne 0 ]; then
  echo ""
  echo "  h1 は1ページに1つです。0だと文書に主題がなく、2つ以上だとどれが"
  echo "  主題か決まりません。"
  exit 1
fi

echo ""
[ "$fail" -eq 0 ] && [ "$h1fail" -eq 0 ] && echo "all page templates are complete documents" || echo "SOMETHING IS INCOMPLETE"
exit $(( fail + h1fail ))
