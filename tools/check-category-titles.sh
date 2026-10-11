#!/bin/sh
set -e
cd "$(dirname "$0")/.."

perl -CS tools/_check-category-title.pl \
  contingency/category_title.tpl \
  inventory/categories-seo-backup.csv \
  package/url-bulk/categories-url.csv \
  inventory/category-code-overrides.csv \
  inventory/category-titles-report.csv

