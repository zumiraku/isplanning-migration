#!/bin/sh
# check-all.sh — every automated check, in the order that fails cheapest first

fail=0
run() {
  name="$1"; shift
  echo ""
  echo "=============================================================="
  echo "  $name"
  echo "=============================================================="
  if "$@"; then
    echo "  -> OK"
  else
    echo "  -> FAILED"
    fail=1
  fi
}

run "markup well-formedness (the migration risk)" sh tools/check-tag-balance.sh
run "content integrity - no text altered"         sh tools/check-content-preserved.sh
run "Basic Mode tag inventory"                    sh tools/inventory-basic-tags.sh
run "Basic -> Creator tag mapping"                sh tools/map-tags-to-creator.sh
run "platform hooks are wired to href, not submit"  sh tools/check-platform-hooks.sh
run "all-pages.css is rebuilt from its sources"   sh tools/check-css-fresh.sh
run "all-pages.js is rebuilt from its sources"    sh tools/check-js-fresh.sh
run "package/templates is rebuilt too"            sh tools/check-templates-fresh.sh
run "the paste guide counts match the files"      node tools/port/sync-paste-guide.js --check
run "CSS variables all resolve"                    sh tools/check-css-vars.sh
run "CSS and templates line up"                   sh tools/check-css-coverage.sh
run "Creator Mode templates parse"                sh tools/check-smarty.sh
run "配列をそのまま出していないか"              node tools/port/check-array-output.js
run "CSSのコメントが閉じているか"              node tools/port/check-css-comments.js
run "現行のclass/idが移植版にもあるか"        node tools/port/check-class-parity.js
run "tags match the official reference"           sh tools/check-against-reference.sh
run "text around each Basic tag survived"         sh tools/check-tag-context.sh
run "page templates are whole documents"          sh tools/check-page-templates.sh
run "all 82 独自ページ are held"                    sh tools/check-freepage-coverage.sh
run "prices are tax-inclusive everywhere (C36)"   sh tools/check-tax-display.sh
run "reviews are u-komi only, on every product"   sh tools/check-review-unified.sh
run "every page type renders"                     sh tools/check-render-all.sh
run "internal links that the URL change breaks"   sh tools/inventory-internal-links.sh
run "every internal link has a target"            sh tools/check-internal-links.sh
run "browser checks (headless Chrome)"            sh tools/check-browser.sh
run "nothing overflows at 320px and 375px"        sh tools/check-overflow.sh

echo ""
echo "=============================================================="
if [ "$fail" -eq 0 ]; then
  echo "  all checks passed"
else
  echo "  SOMETHING FAILED - see above"
fi
echo ""
echo "  The four browser harnesses now run above, headless. Open them in a"
echo "  real browser when you want to look at one, not to find out whether"
echo "  it passes."
echo ""
echo "  Still by hand - it takes screenshots, so a person has to look:"
echo "    .\tools\check-responsive.ps1 -Also '../product','../category',\\"
echo "        '../category-season','../category-season-summer','../top','../cart'"
echo "=============================================================="
exit $fail
