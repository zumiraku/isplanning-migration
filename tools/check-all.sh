#!/bin/sh
# check-all.sh — every automated check, in the order that fails cheapest first
#
# The suite grew one tool at a time and there was no way to run it. That is not
# a convenience problem: a check nobody runs is a check that does not exist, and
# the tag-balance failures found on 2026-09-04 had been sitting in the output
# for days because each tool was invoked by hand when someone remembered.
#
# Order is deliberate. Markup well-formedness first, because it is fast and it
# is the failure this project exists to prevent. Content integrity second: if
# text was damaged, nothing downstream matters. The browser checks are last and
# are run separately - they need PowerShell and Chrome, which this script does
# not assume.
#
# Exit code is non-zero if any check fails, so it can gate a commit.
#
# Needs Git Bash. Run from the repository root.

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
run "CSS variables all resolve"                    sh tools/check-css-vars.sh
run "CSS and templates line up"                   sh tools/check-css-coverage.sh
run "Creator Mode templates parse"                sh tools/check-smarty.sh
run "tags match the official reference"           sh tools/check-against-reference.sh
run "page templates are whole documents"          sh tools/check-page-templates.sh
run "all 82 独自ページ are held"                    sh tools/check-freepage-coverage.sh
run "category captions are complete"              sh tools/check-captions.sh
run "gallery renders every sub-image"             sh tools/check-gallery.sh
run "category titles render correctly"            sh tools/check-category-title-render.sh
run "every page type renders"                     sh tools/check-render-all.sh
run "606 category titles restored exactly"        sh tools/check-category-titles.sh
run "internal links that the URL change breaks"   sh tools/inventory-internal-links.sh
run "every internal link has a target"            sh tools/check-internal-links.sh

echo ""
echo "=============================================================="
if [ "$fail" -eq 0 ]; then
  echo "  all shell checks passed"
else
  echo "  SOMETHING FAILED - see above"
fi
echo ""
echo "  Still to run by hand (PowerShell + Chrome):"
echo "    .\tools\check-responsive.ps1 -Also '../product','../category',\\"
echo "        '../category-season','../category-season-summer','../top','../cart'"
echo "    open templates/creator/preview/verify-pricing.html        103 checks"
echo "    open templates/creator/preview/verify-gallery.html         11 checks"
echo "    open templates/creator/preview/verify-tabs.html            13 checks"
echo "    open templates/creator/preview/verify-quote-prefill.html    6 checks"
echo "=============================================================="
exit $fail
