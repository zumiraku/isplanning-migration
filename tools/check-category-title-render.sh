#!/bin/sh
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

check "ct5（判定不可の例）" cat-ct5 \
  "予算で選ぶの粗品通販ページ～49円まで【粗品と景品の発見マーケット】"

check "all_items" cat-allitems "すべての商品"

check "ct573（判定可）" cat-ct573 \
  "パソコングッズの粗品の通販ページ ～49円 【発見マーケット】"

check "新規カテゴリ" cat-new \
  "季節商品の粗品通販ページ新しい粗品まで【粗品と景品の発見マーケット】"

check "先頭がホーム" cat-home-first \
  "トップ直下カテゴリの粗品通販ページ【粗品と景品の発見マーケット】"

echo ""
if [ "$fail" -eq 0 ]; then
  echo "カテゴリタイトル（描画）: 全項目 OK"
else
  echo "カテゴリタイトル（描画）: 失敗あり"
fi
exit $fail

