#!/bin/sh
# =============================================================================
#  check-category-titles.sh — do the restored titles actually come out right?
#
#  🔴 This asks a DIFFERENT question from the generator, deliberately.
#
#     The category caption check once reported 34/34 identical while 10 of the
#     34 were truncated at a <br>. It compared an extraction against the same
#     extraction. Agreement between a program and itself is not evidence.
#
#     So this check never looks at the generator's working data. It reads
#     package/modules/category_title.tpl as text, walks the if/elseif chain the
#     way Smarty would - first matching branch wins - reassembles what each
#     branch would print, INCLUDING the 【粗品と景品の発見マーケット】 suffix
#     that was folded out of the branch bodies to save 22KB, and compares the
#     result against the original title in categories-seo-backup.csv, joined
#     through the ct code in categories-url.csv.
#
#     If the folding is off by one character, this fails. If two branches carry
#     the same ct code - which would make the second unreachable - this fails.
#     If a branch still contains a Smarty tag, meaning a title got mangled into
#     something that will be evaluated rather than printed, this fails.
#
#  The only titles allowed to be absent are the ones inventory/
#  category-titles-report.csv says were deliberately replaced.
# =============================================================================
set -e
cd "$(dirname "$0")/.."

perl -CS tools/_check-category-title.pl \
  package/modules/category_title.tpl \
  inventory/categories-seo-backup.csv \
  package/url-bulk/categories-url.csv \
  inventory/category-code-overrides.csv \
  inventory/category-titles-report.csv
