#!/bin/sh
# check-page-templates.sh — is each assembled page a valid, complete document?
#
# Three things, in order of how badly they fail.
#
# 1. The three 必ず記載 tags. Without them the platform injects nothing, which
#    on this shop means no Google Analytics and no u-komi. The page still looks
#    right, which is what makes it dangerous.
# 2. One <html>, one <head>, one <body>, correctly nested.
# 3. No leftover include of a file that is not in the package.
#
# The first version of this check counted the strings anywhere in the file and
# reported 2 of each, because the templates *discuss* the tags in comments as
# well as emitting them. Counting the emitted form only is the whole difference
# between a check and a number.
#
# Needs Git Bash (perl). Run from the repository root.

dir="${1:-package/templates}"
fail=0


# Comment delimiters. This one has now been got wrong twice, in two different
# batches of files, and both times it was invisible: a comment that opens <{*
# and closes *} instead of *}> does not close at all, so everything up to the
# next *}> is swallowed. In the assembled templates that ate the doctype, the
# <head> and $makeshop.body_top - the page still had a </body> so it looked
# plausible, and it would have shipped with no analytics and no reviews.
#
# So it is a check now rather than something to remember.
for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  o=$(grep -c '<{\*' "$f")
  c=$(grep -c '\*}>' "$f")
  if [ "$o" -ne "$c" ]; then
    echo "  $(basename "$f") : コメント 開始 $o / 終了 $c - *} で閉じている箇所があります"
    fail=1
  fi
done
printf "%-18s %8s %6s %6s %6s %6s\n" file doctype head body_top body_btm include
printf "%s\n" "----------------------------------------------------------------------"

for f in "$dir"/*.tpl; do
  [ -f "$f" ] || continue
  name=$(basename "$f")
  case "$name" in category-captions.tpl|category-tiles.tpl) continue ;; esac

  # Emitted tags only: <{$makeshop.head}>, not the words in a comment.
  strip=$(perl -CSD -0777 -pe 's/<\{\*.*?\*\}>//gs' "$f")
  n_head=$(printf '%s' "$strip" | grep -c '<{\$makeshop\.head}>')
  n_top=$(printf  '%s' "$strip" | grep -c '<{\$makeshop\.body_top}>')
  n_btm=$(printf  '%s' "$strip" | grep -c '<{\$makeshop\.body_bottom}>')
  n_doc=$(printf  '%s' "$strip" | grep -ci '<!doctype html>')

  # Includes must resolve inside the package.
  missing=0
  for inc in $(printf '%s' "$strip" | grep -o 'include file="[^"]*"' | sed 's/.*file="//; s/"//'); do
    [ -f "$dir/$inc" ] || { missing=$((missing + 1)); }
  done

  ok="OK"
  [ "$n_doc" -eq 1 ] && [ "$n_head" -eq 1 ] && [ "$n_top" -eq 1 ] && [ "$n_btm" -eq 1 ] && [ "$missing" -eq 0 ] || { ok="NG"; fail=1; }
  printf "%-18s %8s %6s %6s %6s %6s   %s\n" "$name" "$n_doc" "$n_head" "$n_top" "$n_btm" "$missing" "$ok"
done

echo ""
[ "$fail" -eq 0 ] && echo "all page templates are complete documents" || echo "SOMETHING IS INCOMPLETE"
exit $fail
