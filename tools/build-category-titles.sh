#!/bin/sh
# =============================================================================
#  build-category-titles.sh — restore the 606 per-category page titles
#
#  クリエイターモードでは「カテゴリ設定」の独自タイトル欄が使えなくなります。
#  C4 measured what that costs: 607 categories, 604 distinct titles, every one
#  written by hand over thirteen years, and the client asked specifically for
#  page titles to be sorted out as part of this job.
#
#  The plan of record was to regenerate them from a rule. The best rule
#  reproduced 294 of 607 - not because that was good, but because a rule was
#  all we thought we had, and C35 recorded the rule's own weak point: the
#  dominant shape needs the PARENT category name, and there is no
#  $category.parent tag.
#
#  Both halves of that turn out to be wrong.
#
#  1. A rule is not all we have. Two files already in the repository join on
#     the same old /shopbrand/ URL:
#
#        inventory/categories-seo-backup.csv   old URL -> the exact title
#        package/url-bulk/categories-url.csv   old URL -> the new ct code
#
#     so the exact title for each ct code is known. Creator Mode puts <title>
#     in our own template, and a conditional on $category.code - the same
#     construct category.tpl already uses for the 53 per-category variants -
#     emits it verbatim. 606 of 607, character for character, not 294.
#
#  2. C35 is closed. $category.breadcrumb_list.list.name is confirmed in the
#     reference, and the breadcrumb carries the ancestry, so the parent name IS
#     reachable - as the entry before the current one. That no longer decides
#     the 607, but it is what the <{else}> fallback uses for categories added
#     after the migration.
#
#  --- the two that are not restored ------------------------------------------
#
#  /shopbrand/all_items/  is the全商品 listing, not a category. It has no ct
#  code because there is nothing to give it one. This is also the "1 category
#  with no ct mapping" left open against the URL CSV - it was never a category.
#
#  ct668's title on the live site is ■■■. Reproducing that faithfully would be
#  restoring a defect into a job whose brief says to fix page titles, so it is
#  dropped from the table and gets the composed title instead. It is written
#  into inventory/category-titles-report.csv, because a content change nobody
#  is told about is not a fix.
#
#  --- output -----------------------------------------------------------------
#    package/modules/category_title.tpl      the 606-branch table (a module)
#    templates/creator/mode/_category-title.tpl   the one line <head> uses
#    inventory/category-titles-report.csv    what was changed and what was not
#
#  Run tools/check-category-titles.sh afterwards. It reads the generated
#  template back and compares every branch against the original CSV.
# =============================================================================
set -e
cd "$(dirname "$0")/.."

SEO=inventory/categories-seo-backup.csv
URLC=package/url-bulk/categories-url.csv
MODULE=package/modules/category_title.tpl
REF=templates/creator/mode/_category-title.tpl
OVERRIDE=inventory/category-code-overrides.csv
REPORT=inventory/category-titles-report.csv

for f in "$SEO" "$URLC" "$OVERRIDE"; do
  [ -f "$f" ] || { echo "missing $f" >&2; exit 1; }
done
mkdir -p package/modules

perl tools/_category-title.pl "$SEO" "$URLC" "$OVERRIDE" "$MODULE" "$REF" "$REPORT"

echo ""
printf "  %-42s %8s bytes\n" "$MODULE" "$(wc -c < "$MODULE")"
printf "  %-42s %8s bytes\n" "$REF"    "$(wc -c < "$REF")"
printf "  %-42s %8s bytes\n" "$REPORT" "$(wc -c < "$REPORT")"
