#!/bin/sh
# =============================================================================
#  check-category-title-render.sh — run the title table and read what comes out
#
#  check-category-titles.sh reads the generated template as TEXT and compares
#  every branch to the backup. This one EXECUTES it against five shapes of
#  category and looks at the <title> produced. Different question, and both are
#  needed: the text check proves the 606 values are right, this one proves the
#  Smarty around them behaves.
#
#  ※ Why a rendering check exists at all
#
#     ct5 was used to confirm the table was live, and it confirmed nothing.
#     ct5's stored title and the composed fallback are character-identical,
#     because ct5 is an instance of the dominant shape the fallback was built
#     from. The tab read correctly whether the table was consulted or ignored.
#     It was reported as proof. It was not.
#
#     ct573 is the case that can fail: 「パソコングッズの粗品の通販ページ ～49円
#     【発見マーケット】」 from the table, against 「パソコングッズの粗品通販
#     ページ～49円まで【粗品と景品の発見マーケット】」 from the rule. Different
#     connector, different spacing, different 【】. Nothing else to key on.
#
#  The last case is the one that had no evidence behind it at all. The fallback
#  takes the entry before the current one as the parent, and whether the
#  platform puts ホーム at the head of the breadcrumb was never verified - if it
#  does, a top-level category would read 「ホームの粗品通販ページ…」. A guard was
#  written for it and never exercised. Now it is.
# =============================================================================
set -e
cd "$(dirname "$0")/.."

MOD=contingency/category_title.tpl
fail=0

run() {
  node tools/render-smarty.js "$MOD" "tools/fixtures/$1.json" \
    | tr -d '\n' | sed 's/.*<title>//; s|</title>.*||'
}

check() {
  label="$1"; fixture="$2"; want="$3"
  got=$(run "$fixture")
  if [ "$got" = "$want" ]; then
    printf "  OK  %-22s %s\n" "$label" "$got"
  else
    printf "  NG  %-22s\n      出た : %s\n      期待 : %s\n" "$label" "$got" "$want"
    fail=1
  fi
}

echo "カテゴリタイトル — 実際に描画して読む"
echo ""

# 表から出るもの。ct5 は「これだけでは判定できない例」として残してあります。
check "ct5（判定不可の例）" cat-ct5 \
  "予算で選ぶの粗品通販ページ～49円まで【粗品と景品の発見マーケット】"

# ct番号を持たないページ。プレビューURLの末尾からコードが判明したもの。
check "all_items" cat-allitems "すべての商品"

# 表とルールで結果が違う。表が読まれているかを判定できる唯一の形。
check "ct573（判定可）" cat-ct573 \
  "パソコングッズの粗品の通販ページ ～49円 【発見マーケット】"

# 移行後に増えたカテゴリ。表に無いので組み立てに回る。
check "新規カテゴリ" cat-new \
  "季節商品の粗品通販ページ新しい粗品まで【粗品と景品の発見マーケット】"

# パンくずの先頭がホームだった場合。ホームを親として使ってはいけない。
check "先頭がホーム" cat-home-first \
  "トップ直下カテゴリの粗品通販ページ【粗品と景品の発見マーケット】"

echo ""
if [ "$fail" -eq 0 ]; then
  echo "カテゴリタイトル（描画）: 全項目 OK"
else
  echo "カテゴリタイトル（描画）: 失敗あり"
fi
exit $fail
