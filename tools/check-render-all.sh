#!/bin/sh
# check-render-all.sh — 全ページ種別をここで描画して、出力を検査する
set -e
cd "$(dirname "$0")/.."

OUT="${TMPDIR:-/tmp}/render-all"
mkdir -p "$OUT"
fail=0

check() {
  tpl="$1"; fx="$2"; want_marker="$3"; want_min="$4"
  o="$OUT/$(basename "$tpl").html"
  merged="$o.fixture.json"
  node -e '
    const fs = require("fs");
    const base = JSON.parse(fs.readFileSync("tools/fixtures/_common.json", "utf8"));
    const page = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    for (const k of Object.keys(page)) {
      base[k] = (base[k] && typeof base[k] === "object" && !Array.isArray(base[k]) &&
                 page[k] && typeof page[k] === "object" && !Array.isArray(page[k]))
        ? Object.assign({}, base[k], page[k]) : page[k];
    }
    fs.writeFileSync(process.argv[2], JSON.stringify(base));
  ' "tools/fixtures/$fx" "$merged"

  if ! node tools/render-smarty.js "templates/creator/mode/$tpl" "$merged" > "$o" 2>"$o.err"; then
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
check detail.tpl            item-addimage.json   'data-zoom'               2
check detail.tpl            item-noimage.json    'itemCount'               1
check category.tpl          cat-ct5-full.json    'class="categorylist"'    3
check category.tpl          cat-ct646.json       'class="categorylist"'    3

check search.tpl            search-keyword.json  'class="M_innerBox"'      3
check search.tpl            search-empty.json    'id="r_searchInput"'      1
check cart.tpl              cart-two-items.json  'class="basketName"'      2
check cart.tpl              cart-empty.json      'class="basketEmpty"'     1
check news-list.tpl         news-list.json       'id="newsList"'        1
check news-detail.tpl       news-detail.json     'id="newsHead"'        1
check guide.tpl             news-detail.json     'id="about_payment"'      1
check company.tpl           news-detail.json     'class="company"'         1
check contract.tpl          news-detail.json     'class="tbl01"'           1
check policy.tpl            news-detail.json     'id="O_adminPagearea"'    1

echo ""
if [ "$fail" -eq 0 ]; then
  echo "描画検査: 全項目 OK"
else
  echo "描画検査: 失敗あり"
fi
exit $fail

