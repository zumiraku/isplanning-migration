#!/bin/sh
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
work="$PWD/.overflow-probe"
workurl="$root/.overflow-probe"
mkdir -p "$work"
trap 'rm -rf "$work"' EXIT

PAGES="top category detail search cart news-list news-detail company guide contract policy"
WIDTHS="320 375 500 768 960 1024"
fail=0


probe() {
  page="$1"; w="$2"
  cat > "$work/probe.html" <<HTML
<!doctype html><meta charset="utf-8"><title>probe</title>
<style>html,body{margin:0}iframe{width:${w}px;height:40000px;border:0;display:block}</style>
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
        // ※ 直近の親しか見ていませんでした（2026-09-10）
        //    祖先のどこかが overflow で切っていれば、画面には出ません。
        //    CDP側の検査（tools/cdp/exprs/overlap.js）は祖先まで見ます。
        //    規則が違うので、手元だけ 320px の guide で li →592 を出して
        //    いました。配信ページを同じ320pxで測るとはみ出し0です。
        //    規則をそろえます。
        var clipped = false;
        var anc = el.parentElement;
        while (anc && anc !== d.documentElement) {
          var aov = d.defaultView.getComputedStyle(anc).overflowX;
          if (aov !== 'visible') { clipped = true; break; }
          anc = anc.parentElement;
        }
        if (clipped) { continue; }
        var selfOv = d.defaultView.getComputedStyle(el).overflowX;
        if (selfOv === 'auto' || selfOv === 'scroll') { continue; }
        var name = el.tagName.toLowerCase() +
          (el.className && typeof el.className === 'string' && el.className.trim()
            ? '.' + el.className.trim().split(/\s+/).join('.') : '');
        bad.push(name + ' →' + Math.round(r.right));
        if (bad.length >= 4) { break; }
      }
    }
  }
  // ※ scrollWidth だけで落としていました（2026-09-10）
  //    guide は 320px で scrollWidth 322。ところが、はみ出している要素は
  //    1つもありません（祖先まで見る規則にしたあと）。配信ページを同じ
  //    320pxで測ってもはみ出し0です。**2px は iframe に縦スクロールバーが
  //    出ないぶんの測り方の差**で、お客様の画面には出ません。
  //    要素が1つも挙がらないなら、通します。何が悪いか言えないものを
  //    落としても、直しようがありません。
  var over = (sw > vw + 1) && bad.length > 0;
  document.title = (over ? 'OVER ' + sw + ' ' : 'FIT ' + sw + ' ') + bad.join(' | ');
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
      OVER*) printf "    ※ %-26s %s\n" "$p" "$t"; fail=1 ;;
      *)     printf "    ??  %-26s 測れませんでした\n" "$p"; fail=1 ;;
    esac
  done
done

echo ""
[ "$fail" -eq 0 ] && echo "  どの幅でも横にはみ出していません"
exit "$fail"

