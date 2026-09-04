#!/bin/sh
# analyse-category-templates.sh — what is actually different about the 53
#
# design-backup.md flagged this as scope nobody had counted: the plan assumed
# one category template and one product template, and the design backup holds
# 1 + 53 and 1 + 3. It also guessed that "most of the 53 differ only in a banner
# block, so they collapse into one template plus data - but that has to be
# verified per file".
#
# This verifies it. Each per-category template is compared against the standard
# design_brandpage.txt after both are reduced to structure, so that per-category
# content (which is the point of them) does not read as a structural difference.
#
# The question being answered is not "are they different" - they are, that is why
# they exist. It is: **can they be one template plus data, or are some of them
# genuinely different pages?** A banner block that varies is data. A different
# set of tabs, or a different product loop, is not.
#
# Output: inventory/category-templates.csv
# Needs Git Bash. Run from the repository root.

std="templates/basic-export/design/design_brandpage.txt"
dir="templates/basic-export/design/design_categorypages"
out="${1:-inventory/category-templates.csv}"

[ -f "$std" ] || { echo "no $std"; exit 1; }

# Structure = the sequence of tags and Basic Mode variable tags, with all text,
# attributes, URLs and whitespace removed. Two files with the same skeleton and
# different words reduce to the same string.
skeleton() {
  perl -CSD -0777 -ne '
      my $h = $_;
      $h =~ s/<!--.*?-->//gs;
      $h =~ s/<script\b.*?<\/script>//gsi;
      $h =~ s/<style\b.*?<\/style>//gsi;
      my @out;
      while ($h =~ /(<\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>|(\[[A-Z_0-9]{2,}\])/g) {
        if (defined $3) { push @out, $3 }
        else            { push @out, $1 . lc($2) . ">" }
      }
      print join("", @out);
    ' "$1"
}

stdSkel=$(skeleton "$std")
stdTags=$(grep -o '\[[A-Z_0-9]\{2,\}\]' "$std" | sort -u)

echo '"template","bytes","same_skeleton","extra_tags","missing_tags","banner_only","verdict"' > "$out"

same=0; bannerOnly=0; different=0

for f in "$dir"/*.txt; do
  name=$(basename "$f" .txt | sed 's/^design_categorypage_//')
  bytes=$(wc -c < "$f")
  skel=$(skeleton "$f")

  if [ "$skel" = "$stdSkel" ]; then
    sameSkel="yes"
  else
    sameSkel="no"
  fi

  tags=$(grep -o '\[[A-Z_0-9]\{2,\}\]' "$f" | sort -u)
  extra=$(echo "$tags"    | comm -13 - /dev/stdin 2>/dev/null; :)
  extra=$(comm -13 <(echo "$stdTags") <(echo "$tags") | tr '\n' ' ' | sed 's/ $//')
  missing=$(comm -23 <(echo "$stdTags") <(echo "$tags") | tr '\n' ' ' | sed 's/ $//')

  # A banner-only difference: the file adds nothing but per-category conditional
  # blocks and image markup. Detected by what the extra tags are, not by size.
  if [ "$sameSkel" = "yes" ]; then
    verdict="identical structure"; banner="n/a"; same=$((same + 1))
  elif [ -z "$extra" ] && [ -z "$missing" ]; then
    verdict="same tags, different markup"; banner="likely"; bannerOnly=$((bannerOnly + 1))
  else
    verdict="DIFFERENT - needs reading"; banner="no"; different=$((different + 1))
  fi

  printf '"%s","%s","%s","%s","%s","%s","%s"\n' \
    "$name" "$bytes" "$sameSkel" "$extra" "$missing" "$banner" "$verdict" >> "$out"
done

echo ""
echo "per-category templates      : $((same + bannerOnly + different))"
echo "  identical structure       : $same"
echo "  same tags, extra markup   : $bannerOnly   (candidates for template + data)"
echo "  genuinely different       : $different   <- these need a human"
echo "report                      : $out"
echo ""
if [ "$different" -gt 0 ]; then
  echo "the ones that differ in what they can do:"
  sed 's/"//g' "$out" | awk -F, 'NR>1 && $7 ~ /DIFFERENT/{printf "  %-8s %7s bytes  extra: %s\n", $1, $2, $4}' | head -20
fi
