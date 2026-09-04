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

assemble() {
  page="$1"; body="$2"
  {
    cat "$src/_shell-head.tpl"
    cat "$src/_shell-header.tpl"
    cat "$src/$body"
    cat "$src/_shell-main-end.tpl"
    cat "$src/_shell-foot.tpl"
  } > "$out/$page.tpl"
  printf "  %-22s %6s 行  %7s バイト\n" "$page.tpl" "$(wc -l < "$out/$page.tpl")" "$(wc -c < "$out/$page.tpl")"
}

echo "assembled:"
assemble "category"      "category.tpl"
assemble "detail"        "detail.tpl"
assemble "search"        "search.tpl"
assemble "cart"          "cart-body.tpl"

# The includes travel with them.
cp "$src/category-captions.tpl" "$src/category-tiles.tpl" "$out/" 2>/dev/null

echo ""
echo "package : $out"
echo ""
echo "each file is a complete document - paste the whole thing into the page's"
echo "HTML box, replacing what is there."
