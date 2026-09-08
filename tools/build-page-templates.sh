#!/bin/sh
# build-page-templates.sh — assemble the full documents the console expects
#
# Each page's HTML box holds a **complete HTML document**, not a body fragment.
# The stock トップ template opens with <!doctype html>, and the reference marks
# three tags 必ず記載:
#
#   $makeshop.head          in <head>
#   $makeshop.body_top      immediately after <body>
#   $makeshop.body_bottom   immediately before </body>
#
# Those are how the platform injects its own scripts - which on this shop means
# Google Analytics and the u-komi loader. C32 concluded GA4 survives the switch
# because the platform emits it; that is true, and it is true *only if these
# tags are present*. Leave one out and the thing we called unbreakable breaks.
#
# The first drafts of category.tpl and detail.tpl were body fragments. They
# would have produced pages with no <head>, no analytics and no reviews.
#
# Output: package/templates/<page>.tpl - paste-ready, one file per page type.
# Needs Git Bash. Run from the repository root.

src="templates/creator/mode"
out="package/templates"
mkdir -p "$out"

# The shared <head> carries <title><{$page.title}></title>, which is right for
# most pages. The category pages are the exception: クリエイターモード drops the
# per-category title field, and 606 hand-written titles would go with it. Those
# are restored from a table (_category-title.tpl), so a page type may hand in a
# replacement for that one line.
#
# If the line ever moves or changes shape, this must fail loudly rather than
# quietly assemble a page with the wrong title on 606 URLs.
swap_title() {
  TF="$1" perl -e '
    open my $f, "<:encoding(UTF-8)", $ENV{TF} or die "$ENV{TF}: $!";
    my $t = do { local $/; <$f> };   # scoped: an unscoped $/ makes <STDIN> slurp too
    close $f;
    binmode STDOUT, ":encoding(UTF-8)";
    my $n = 0;
    while (my $l = <STDIN>) {
      utf8::decode($l);
      if ($l =~ m{^<title><\{\$page\.title\}></title>\s*$}) { print $t; $n++; }
      else { print $l; }
    }
    die "build-page-templates.sh: the <title> line in _shell-head.tpl was not found\n"
      if $n != 1;
  '
}

assemble() {
  page="$1"; body="$2"; titlefile="$3"
  {
    if [ -n "$titlefile" ]; then
      swap_title "$src/$titlefile" < "$src/_shell-head.tpl"
    else
      cat "$src/_shell-head.tpl"
    fi
    cat "$src/_shell-header.tpl"
    cat "$src/$body"
    cat "$src/_shell-main-end.tpl"
    cat "$src/_shell-foot.tpl"
  } > "$out/$page.tpl"
  printf "  %-22s %6s 行  %7s バイト\n" "$page.tpl" "$(wc -l < "$out/$page.tpl")" "$(wc -c < "$out/$page.tpl")"
}

echo "assembled:"
assemble "top"           "top-body.tpl"
assemble "category"      "category.tpl"
assemble "detail"        "detail.tpl"
assemble "search"        "search.tpl"
assemble "cart"          "cart-body.tpl"
assemble "news-list"     "news-list-body.tpl"
assemble "news-detail"   "news-detail-body.tpl"
assemble "company"       "company-body.tpl"
assemble "guide"         "info-body.tpl"
assemble "contract"      "ordercontract-body.tpl"
assemble "policy"        "privacy-body.tpl"

# The includes travel with them.
cp "$src/category-captions.tpl" "$src/category-tiles.tpl" "$out/" 2>/dev/null

# 🔴 package/modules/ は貼り付け用の写しです。ここを更新し忘れると、
#    テンプレートを直したのに貼るファイルは古いまま、という事故になります。
#    実際に起きました: カテゴリタイルのリンクを新URLに書き換えたあと、
#    package/modules/category_tiles.tpl だけ旧URLのまま残っていました。
#    以後はここで同期します。
mkdir -p package/modules
cp "$src/category-tiles.tpl"    package/modules/category_tiles.tpl
cp "$src/category-captions.tpl" package/modules/category_captions.tpl
# 🔴 header / leftmenu / footer はここでは触りません。
#
#    以前はここに `cp "$src/_module-header.tpl" package/modules/header.tpl`
#    がありました。2026-09-08 に移植へ切り替えたあとも残っていたら、
#    **このスクリプトを回すたびに、移植したヘッダーが差し戻された設計の
#    ヘッダーで上書きされます。** 山口様に「ヘッダーの文言がない」と
#    言われた、まさにその版に戻ります。
#
#    いまの生成元は tools/port/build-chrome.js です。
echo ""
echo "modules synced:"
for m in category_tiles category_captions; do
  printf "  %-22s %7s バイト\n" "$m.tpl" "$(wc -c < "package/modules/$m.tpl")"
done
for m in header leftmenu footer; do
  printf "  %-22s %7s バイト  (tools/port/build-chrome.js が生成)\n" "$m.tpl" "$(wc -c < "package/modules/$m.tpl")"
done

echo ""
echo "package : $out"
echo ""
echo "each file is a complete document - paste the whole thing into the page's"
echo "HTML box, replacing what is there."
