#!/bin/sh
# =============================================================================
#  check-overflow.sh — 狭い画面で横にはみ出していないか
#
#  ご依頼の1番目が「HTML・CSSの作り込みが崩れないこと（レスポンシブ）」です。
#  崩れ方の中でいちばん分かりやすく、いちばん見落とされるのが**横スクロール**
#  です。1つでもはみ出す要素があると、ページ全体が横に動き、指で縦に送るたびに
#  ずれます。
#
#  🔴 撮影して人が見る、では見つかりません。
#
#     check-responsive.ps1 はスクリーンショットを撮ります。人が見るぶんには
#     良いのですが、**320px で 340px ぶんの幅がある**ことは、縮小された画像を
#     眺めても分かりません。数えれば一発です。
#
#       document.documentElement.scrollWidth  >  window.innerWidth
#
#  2026-09-07 に並び替えが5本から6本になりました（単価順・C37）。
#  .listbar__sort に flex-wrap が無く、**折り返せないまま6本**になっていた
#  ところでした。ここで止まります。
#
#  はみ出している場合は、犯人の要素も出します。「どこかが広い」だけでは
#  直せないためです。
#
#  読み込むCSSについて: プレビューは css/tokens.css と css/components.css を
#  読みます。実際に配信するページが読むのは mode/all-pages.css で、これは
#  build-all-pages-css.sh がその2本から作ります。**components.css を直したら
#  ビルドを回してください。** 回さないと、この検査だけ通って本番が崩れます。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

CHROME=""
for c in \
  "/c/Program Files/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
  "$LOCALAPPDATA/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  "/c/Program Files/Microsoft/Edge/Application/msedge.exe"
do
  [ -n "$c" ] && [ -f "$c" ] && { CHROME="$c"; break; }
done
[ -z "$CHROME" ] && { echo "  ChromeもEdgeも見つかりません。飛ばします。"; exit 0; }

root=$(pwd -W 2>/dev/null || pwd)
# 一時ファイル。TMPDIR が無い環境ではリポジトリ直下に作ってしまい、
# overflow-probe/ が git status に出ました。隠しディレクトリにして、
# 終了時に必ず消します。
work="$PWD/.overflow-probe"
# Chrome に渡すURLは Windows 形式の $root から組み立てます。$PWD は /c/... 形式で、
# 混ぜると file:/// が解決できません（一度ここで全ページ「測れませんでした」に
# なりました）。
workurl="$root/.overflow-probe"
mkdir -p "$work"
trap 'rm -rf "$work"' EXIT

# 🔴 2026-09-09、対象を移植版に差し替えました。
#
#    ここに並んでいた category-season / product / components は、
#    **差し戻された設計の手書きモック**でした。並び替えバーを <select> で
#    書いてあって、出荷していたのは <nav> のリンク。撮って確認していたのは
#    一度も出荷していない画面です。
#
#    いまの preview/*.html は tools/port/build-previews.js が
#    **出荷するテンプレートを実際に描画して**書き出したものです。
PAGES="top category detail search cart news-list news-detail company guide contract policy"
WIDTHS="320 375"
fail=0

# 測るための小さなページを作ります。対象を iframe に入れて、中の
# scrollWidth と、はみ出している要素を数えます。
probe() {
  page="$1"; w="$2"
  cat > "$work/probe.html" <<HTML
<!doctype html><meta charset="utf-8"><title>probe</title>
<style>html,body{margin:0}iframe{width:${w}px;height:2400px;border:0;display:block}</style>
<iframe id="f" src="file:///$root/templates/creator/preview/$page.html"></iframe>
<script>
window.addEventListener('load', function () {
  var d = document.getElementById('f').contentDocument;
  var vw = ${w};
  var sw = Math.max(d.documentElement.scrollWidth, d.body ? d.body.scrollWidth : 0);
  var bad = [];
  if (sw > vw + 1) {
    var all = d.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var r = all[i].getBoundingClientRect();
      if (r.width === 0) { continue; }
      if (r.right > vw + 1) {
        var el = all[i];
        // 中で横スクロールさせるのは正しい作りなので除きます
        var ov = d.defaultView.getComputedStyle(el).overflowX;
        if (ov === 'auto' || ov === 'scroll') { continue; }
        var par = el.parentElement;
        if (par) {
          var pov = d.defaultView.getComputedStyle(par).overflowX;
          if (pov === 'auto' || pov === 'scroll') { continue; }
        }
        var name = el.tagName.toLowerCase() +
          (el.className && typeof el.className === 'string' && el.className.trim()
            ? '.' + el.className.trim().split(/\s+/).join('.') : '');
        bad.push(name + ' →' + Math.round(r.right));
        if (bad.length >= 4) { break; }
      }
    }
  }
  document.title = (sw > vw + 1 ? 'OVER ' + sw + ' ' : 'FIT ' + sw + ' ') + bad.join(' | ');
});
</script>
HTML
  "$CHROME" --headless --disable-gpu --no-sandbox --allow-file-access-from-files \
    --virtual-time-budget=6000 --dump-dom "file:///$workurl/probe.html" 2>/dev/null \
    | sed -n 's/.*<title>\([^<]*\)<\/title>.*/\1/p' | head -1
}

echo "画面幅ごとに、横にはみ出す要素があるかを測ります"
echo ""

for w in $WIDTHS; do
  printf "  --- %spx ---\n" "$w"
  for p in $PAGES; do
    [ -f "templates/creator/preview/$p.html" ] || continue
    t=$(probe "$p" "$w")
    case "$t" in
      FIT*)  printf "    OK  %-26s %s\n" "$p" "$t" ;;
      OVER*) printf "    🔴 %-26s %s\n" "$p" "$t"; fail=1 ;;
      *)     printf "    ??  %-26s 測れませんでした\n" "$p"; fail=1 ;;
    esac
  done
done

echo ""
[ "$fail" -eq 0 ] && echo "  どの幅でも横にはみ出していません"
exit "$fail"
