#!/bin/sh
# =============================================================================
#  check-render-all.sh — 全ページ種別をここで描画して、出力を検査する
#
#  プレビューは押した1種別しか映しません。11種別を見るには11回押してもらう
#  必要があり、押し直すまで内容も反映されません。**確認のたびに人の手が要る
#  状態では、直すたびに全部を見直すことができません。**
#
#  そこで render-smarty.js で描画し、出力に対して3つ問います。
#
#    1. 未展開の <{ が残っていないか
#       タグ名を間違えると Smarty は黙って消しますが、構文を間違えると
#       そのまま出ます。どちらもページに出る事故です。
#
#    2. src="" や href="" が無いか
#       空のまま出ているのは、存在しないタグを書いた跡です。商品ページの
#       パンくずが丸ごと消えたのも、カテゴリのページャが Array になったのも
#       同じ種類の間違いでした。
#
#    3. 中身のあるフィクスチャで、中身が出ているか
#       商品を2点入れたカゴに <tr> が出ない、といった取りこぼしを拾います。
#
#  🔴 これは実機の代わりにはなりません。
#     タグ名が実在するかは判定できません（リファレンスとの突合は
#     check-against-reference.sh、実表示は実機のプレビューです）。
#     ここで見ているのは「与えたデータをテンプレートがどう扱うか」です。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

OUT="${TMPDIR:-/tmp}/render-all"
mkdir -p "$OUT"
fail=0

check() {
  tpl="$1"; fx="$2"; want_marker="$3"; want_min="$4"
  o="$OUT/$(basename "$tpl").html"
  if ! node tools/render-smarty.js "templates/creator/mode/$tpl" "tools/fixtures/$fx" > "$o" 2>"$o.err"; then
    printf "  NG  %-24s 描画できません: %s\n" "$tpl" "$(head -1 "$o.err")"
    fail=1; return
  fi
  raw=$(grep -o '<{' "$o" | wc -l | tr -d ' ')
  esrc=$(grep -o 'src=""' "$o" | wc -l | tr -d ' ')
  ehref=$(grep -o 'href=""' "$o" | wc -l | tr -d ' ')
  marker=$(grep -o "$want_marker" "$o" | wc -l | tr -d ' ')

  status="OK"
  [ "$raw" -eq 0 ] || status="NG"
  [ "$esrc" -eq 0 ] || status="NG"
  [ "$ehref" -eq 0 ] || status="NG"
  [ "$marker" -ge "$want_min" ] || status="NG"
  [ "$status" = "OK" ] || fail=1

  printf "  %s  %-24s 未展開 %s / 空src %s / 空href %s / %s %s(≧%s)\n" \
    "$status" "$tpl" "$raw" "$esrc" "$ehref" "$want_marker" "$marker" "$want_min"
}

echo "ページ種別ごとに描画して検査"
echo ""
check detail.tpl            item-addimage.json   'class="gallery__slide"'  6
check detail.tpl            item-noimage.json    'class="gallery__slide"'  1
check category.tpl          cat-ct5-full.json    'class="card"'            3
check cart-body.tpl         cart-two-items.json  'carttable__name'         2
check cart-body.tpl         cart-empty.json      'carttable__empty'        1
check news-list-body.tpl    news-list.json       'class="newslist"'        1
check news-detail-body.tpl  news-detail.json     'class="article"'         1
check info-body.tpl         news-detail.json     'class="h-section"'      6
check company-body.tpl      news-detail.json     'class="table-scroll"'   1
check ordercontract-body.tpl news-detail.json    'class="table-scroll"'   1
check privacy-body.tpl      news-detail.json     'class="article"'         1

echo ""
if [ "$fail" -eq 0 ]; then
  echo "描画検査: 全項目 OK"
else
  echo "描画検査: 失敗あり"
fi
exit $fail
