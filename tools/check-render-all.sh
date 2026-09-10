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
  # 🔴 共通部品の値を足してから描画します
  #
  #    ページごとの fixture には $url.* も $shop.* も入っていません。
  #    そのまま描くと、どのページでも 空href 3件・空src 1件 が出ます
  #    （ヘッダーのロゴとホームへのリンク）。**テンプレートの不具合と
  #    区別がつかなくなる**ので、_common.json を重ねます。
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
# 🔴 2026-09-09、期待値をぜんぶ書き換えました
#
#    ここに並んでいた class は gallery__slide / card / carttable__name /
#    newslist / h-section / table-scroll ── **どれもこちらが設計した名前**で、
#    移植で全部なくなりました。放っておくと「もう出荷しない画面」を
#    測り続けます。同じ失敗を前にもしています。
#
#    いまの期待値は、店舗の元マークアップにあるクラスです。
check detail.tpl            item-addimage.json   'data-zoom'               2
check detail.tpl            item-noimage.json    'itemCount'               1
check category.tpl          cat-ct5-full.json    'class="categorylist"'    3
check category.tpl          cat-ct646.json       'class="categorylist"'    3

# 🔴 search.tpl は一度も描画されていませんでした。クロールが検索URLに当たらず
#    実物のHTMLが無いので、リファレンスとソースだけで書いたテンプレートです。
#    **手元に見本が無いものほど、検査していないと壊れます。**
check search.tpl            search-keyword.json  'class="M_innerBox"'      3
check search.tpl            search-empty.json    'id="r_searchInput"'      1
check cart.tpl              cart-two-items.json  'class="basketName"'      2
check cart.tpl              cart-empty.json      'class="basketEmpty"'     1
check news-list.tpl         news-list.json       'id="newsList"'        1
check news-detail.tpl       news-detail.json     'id="newsHead"'        1
check guide.tpl             news-detail.json     'id="about_payment"'      1
# 🔴 会社概要だけ id を外しました（2026-09-09）
#
#    <{$company.content}> が返すHTMLは、プラットフォーム側で
#    <div id="O_adminPagearea" class="M_mainContents"> に入っています。
#    こちらも同じ id を足していたので、**配信ページに同じ id が2つ**
#    ありました（現行サイトは1つ）。こちらの入れ物からは id を外し、
#    class だけにしました。ここで見るのも class にします。
#    「配信ページに1つだけあること」は tools/cdp/verify.js が見ます。
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
