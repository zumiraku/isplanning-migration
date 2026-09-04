#!/bin/sh
# strip-old-review-tags.sh — remove the retired review feature from the templates
#
# The client asked for this directly:
#
#   旧タグはPC・スマホ共、コメントアウトにしましたが、11月に終了ですでに移行して
#   いるのでついでに消して頂ければと思います。
#
# MakeShop retires the old 商品レビュー around the end of November 2026 and u-komi
# becomes the standard; past posts migrate on their own. So [REVIEW_WRITE],
# [REVIEW_BUTTON] and [REVIEW_VIEW_ALL] are dead weight either way.
#
# Two things this script exists to get right.
#
# First, the archive is not edited. templates/basic-export/ is the "before"
# record and stays byte-identical; cleaned copies are written to
# templates/basic-export/design-cleaned/ so the two can be diffed.
#
# Second, and this is the part worth reading: the main product template has the
# review block commented out, but **the three per-category product templates
# still have the tags live** as of the 2026-09-03 export - ct261, ct646, ct664,
# three uncommented tags each. The client believes he commented them out
# everywhere ("PC・スマホ共"), and for the main template he did. If those three
# were not also done, then products in those categories are still showing a
# review feature that stops working in November.
#
# So this reports what it found per file rather than silently cleaning, because
# "which templates were missed" is the answer that matters more than the edit.
#
# Output: templates/basic-export/design-cleaned/*.txt
# Needs Git Bash. Run from the repository root.

src="templates/basic-export/design"
dst="templates/basic-export/design-cleaned"

[ -d "$src" ] || { echo "no $src"; exit 1; }
mkdir -p "$dst/design_detailpages"

clean_one() {
  in="$1"; out="$2"
  # Remove the commented-out block first, then any live tags and the anchor that
  # wraps [REVIEW_BUTTON]. Slurp mode: these blocks span lines, and a line-based
  # pass would leave half a comment behind.
  perl -CSD -0777 -pe '
      s{<!--\s*<div class="Review">.*?</div>-->\s*}{}gs;
      s{<div class="Review">.*?\[REVIEW_VIEW_ALL\].*?</div>\s*</div>\s*}{}gs;
      s{<a href=\[REVIEW_BUTTON\]>[^<]*</a>\s*}{}g;
      s{\[REVIEW_(?:WRITE|BUTTON|VIEW_ALL)\]\s*}{}g;
    ' "$in" > "$out"
}

echo "file                                        live  commented  ->  after"
echo "---------------------------------------------------------------------"
for f in "$src"/design_detailpage.txt "$src"/design_detailpages/*.txt; do
  [ -f "$f" ] || continue
  rel=$(echo "$f" | sed "s|^$src/||")
  out="$dst/$rel"
  mkdir -p "$(dirname "$out")"

  live=$(perl -0777 -ne '$t=$_; $t=~s/<!--.*?-->//gs; print scalar(()=$t=~/\[REVIEW_[A-Z_]+\]/g)' "$f")
  all=$(grep -o '\[REVIEW_[A-Z_]*\]' "$f" | wc -l)
  commented=$(( all - live ))

  clean_one "$f" "$out"
  after=$(grep -o '\[REVIEW_[A-Z_]*\]' "$out" | wc -l)

  flag=""
  [ "$live" -gt 0 ] && flag="  <-- 生きたまま残っていた"
  printf "%-42s %4s  %9s  ->  %4s%s\n" "$rel" "$live" "$commented" "$after" "$flag"
done

echo ""
echo "cleaned copies : $dst"
echo "the archive at $src is unchanged - diff the two before pasting anything"
