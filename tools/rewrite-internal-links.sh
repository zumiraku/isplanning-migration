#!/bin/sh
changed=0
files=0

for f in templates/creator/freepages/*.html \
         templates/creator/mode/*.tpl \
         package/modules/*.tpl; do
  [ -f "$f" ] || continue
  before=$(grep -c 'href="/html/' "$f" 2>/dev/null)
  [ "$before" -eq 0 ] && continue
  perl -CSD -i -pe 's|href="/html/(page\d+)\.html"|href="/view/page/$1.html"|g' "$f"
  after=$(grep -c 'href="/html/page' "$f" 2>/dev/null)
  n=$((before - after))
  changed=$((changed + n))
  files=$((files + 1))
done

echo ""
echo "rewritten : $changed links in $files files"
echo ""
echo "残っている /html/ リンク（page 以外 - company や info など専用ページ）:"
grep -roh 'href="/html/[a-z0-9]*\.html"' templates/creator/freepages/ templates/creator/mode/ package/modules/ 2>/dev/null | sort | uniq -c | sort -rn | head

for f in templates/creator/freepages/*.html templates/creator/mode/*.tpl package/modules/*.tpl; do
  [ -f "$f" ] || continue
  perl -CSD -i -pe '
      s|href="/html/info\.html"|href="<{\$url.guide}>"|g;
      s|href="/html/company\.html"|href="<{\$url.company}>"|g;
      s|href="/html/ordercontract\.html"|href="<{\$url.contract}>"|g;
      s|href="/html/privacy\.html"|href="<{\$url.policy}>"|g;
    ' "$f"
done

echo ""
echo "専用ページへのリンクをタグに置換しました。"
echo "残り（要確認）:"
grep -roh 'href="/html/[a-z0-9]*\.html"' templates/creator/freepages/ templates/creator/mode/ package/modules/ 2>/dev/null | sort | uniq -c

for f in templates/creator/freepages/*.html templates/creator/mode/*.tpl package/modules/*.tpl; do
  [ -f "$f" ] || continue
  perl -CSD -i -pe 's|href="/html/email\.html"\s+onclick="javascript:window\.open\([^)]*\)[^"]*"|href="<{\$url.support}>"|g; s|href="/html/email\.html"|href="<{\$url.support}>"|g' "$f"
done
echo ""
echo "email.html を \$url.support に置換しました。"
echo "最終確認 - 残る /html/ リンク:"
n=$(grep -roh 'href="/html/' templates/creator/freepages/ templates/creator/mode/ package/modules/ 2>/dev/null | wc -l)
echo "  $n 本"

for f in templates/creator/freepages/*.html templates/creator/mode/*.tpl package/modules/*.tpl; do
  [ -f "$f" ] || continue
  perl -CSD -i -pe '
      s|href="/html/(page\d+)\.html(#[^"]*)"|href="/view/page/$1.html$2"|g;
      s|href="/html/info\.html(#[^"]*)"|href="<{\$url.guide}>$1"|g;
      s|href="/html/company\.html(#[^"]*)"|href="<{\$url.company}>$1"|g;
      s|href="/html/ordercontract\.html(#[^"]*)"|href="<{\$url.contract}>$1"|g;
    ' "$f"
done
echo ""
echo "アンカー付きリンクを置換しました。"
echo "最終: 残る /html/ リンク $(grep -roh 'href="/html/' templates/creator/freepages/ templates/creator/mode/ package/modules/ 2>/dev/null | wc -l) 本"

