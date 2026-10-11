#!/bin/sh
src="templates/basic-export/design"
dst="templates/basic-export/design-cleaned"

[ -d "$src" ] || { echo "no $src"; exit 1; }
mkdir -p "$dst/design_detailpages"

clean_one() {
  in="$1"; out="$2"
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

