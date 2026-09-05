#!/bin/sh
# rewrite-internal-links.sh — /html/pageNN.html を /view/page/pageNN.html に
#
# なぜ書き換えるのか。URL一括設定で旧URLを「追加URL」として持たせられれば、
# 書き換えは不要なはずでした。実際に試したところ82件すべてが
# 「フリーページのデザインセット情報が取得できませんでした」で失敗します。
# システムURLは一致していたので、原因はデザインセットが未適用であることです。
#
# つまりこの機能は**切替後でないと使えません**。すると次の形になります。
#
#   切替 → その瞬間から /html/... が404 → CSVをアップロード → 復旧
#
# その隙間の長さは、作業する人の手の速さで決まります。**内部リンク379本の
# 生死を、検証できない仕組みと当日の手際に賭ける**ことになります。
#
# なので内部リンクは新URLに書き換えます。そうすればサイトは単体で完結し、
# 追加URLは「外部リンクと検索エンジンのための保険」という位置づけになります。
# 保険が効かなくても、お客様がサイト内で迷子になることはありません。
#
# 対象はフリーページ本文とテンプレート・モジュール。
# Needs Git Bash. Run from the repository root.

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

# 専用ページ種別へのリンク。フリーページではないので /view/page/ ではなく
# それぞれ固有のURLを持ちます（リファレンスの $url.* に対応）。
#   info.html          → 利用案内        $url.guide
#   company.html       → 会社概要        $url.company
#   ordercontract.html → 特定商取引法    $url.contract
#   privacy.html       → プライバシー    $url.policy
# タグで書けばURLの変更に追随するので、固定URLではなくタグにします。
#
# email.html は [EMAIL] が生成するシステムページで、対応先が未確認です。
# 推測でタグを当てず、そのまま残して印を付けます。
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

# email.html は [EMAIL] が生成するお問い合わせフォームです。Creator Mode の
# 対応先は $url.support（リファレンス common/index.html で確認済み）。
#
# onclick の window.open も外します。スマホではポップアップが既定で塞がれる
# ので、開かないリンクになります。見積依頼フォームで同じ判断をしています。
for f in templates/creator/freepages/*.html templates/creator/mode/*.tpl package/modules/*.tpl; do
  [ -f "$f" ] || continue
  perl -CSD -i -pe 's|href="/html/email\.html"\s+onclick="javascript:window\.open\([^)]*\)[^"]*"|href="<{\$url.support}>"|g; s|href="/html/email\.html"|href="<{\$url.support}>"|g' "$f"
done
echo ""
echo "email.html を \$url.support に置換しました。"
echo "最終確認 - 残る /html/ リンク:"
n=$(grep -roh 'href="/html/' templates/creator/freepages/ templates/creator/mode/ package/modules/ 2>/dev/null | wc -l)
echo "  $n 本"

# アンカー付き（#about_payment など）は上の置換が拾いません。href の値が
# 完全一致でないためです。ページ内の位置を指すリンクなので、切り落とすと
# 「送料の項目へ」が「利用案内の先頭へ」になります。#以降は保ちます。
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
