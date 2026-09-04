#!/bin/sh
# check-tag-balance.sh — the one failure this whole project exists to prevent
#
# From the README, and from the client's own reaction to being told the
# migration was "ボタン一つ":
#
#   現状のサイトは全ページで、HTMLのタグを意図的に閉じない書き方に依存しています。
#   これはベーシックモードが自動で補完してくれる前提の作りで、クリエイターモード
#   では補完されません。
#
# That is the migration in one sentence. Basic Mode closes tags for you; Creator
# Mode does not. An unclosed <div> in Basic Mode is invisible. The same unclosed
# <div> in Creator Mode swallows the rest of the page.
#
# And until now we had no test for it on our own output. The converter has a div
# balancer, the responsive check proves nothing scrolls sideways, the content
# check proves no text was lost - but nothing asserted that what we produce is
# actually well-formed. A page can pass all three and still be one missing
# </div> away from collapsing the moment it stops being auto-repaired.
#
# So: count openings and closings per element, per file, and fail on any
# imbalance. Void elements are excluded, and so are elements HTML legitimately
# allows to be left open - <li>, <p>, <tr>, <td> and friends - because flagging
# those would bury the real findings in noise. The containers that matter are
# the ones that nest: div, section, table, ul, form.
#
# Needs Git Bash (perl). Run from the repository root.

out="${1:-inventory/tag-balance.csv}"
status=0

# Elements whose end tag is optional in HTML5, or void. An unclosed <li> is
# legal and harmless; an unclosed <div> is the bug we are hunting.
OPTIONAL='li|p|tr|td|th|dt|dd|option|thead|tbody|tfoot|colgroup|caption|rt|rp'
VOID='area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr'

echo '"file","element","open","close","diff"' > "$out"

check_file() {
  f="$1"
  perl -CSD -0777 -ne '
      my $html = $_;
      # Comments, scripts and styles can contain anything that looks like markup.
      $html =~ s/<!--.*?-->//gs;
      $html =~ s/<script\b.*?<\/script>//gsi;
      $html =~ s/<style\b.*?<\/style>//gsi;

      my (%open, %close);
      while ($html =~ /<\s*(\/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g) {
        my ($slash, $tag, $attrs) = ($1, lc $2, $3);
        next if $tag =~ /^(?:'"$VOID"')$/;
        next if $tag =~ /^(?:'"$OPTIONAL"')$/;
        next if !$slash && $attrs =~ m{/\s*$};   # self-closed
        if ($slash) { $close{$tag}++ } else { $open{$tag}++ }
      }
      for my $t (sort keys %{{ %open, %close }}) {
        my $o = $open{$t}  // 0;
        my $c = $close{$t} // 0;
        print "$t\t$o\t$c\n" if $o != $c;
      }
    ' "$f"
}

for f in templates/creator/freepages/*.html \
         templates/creator/preview/*.html \
         templates/creator/preview/freepages/*.html; do
  [ -f "$f" ] || continue
  rel=$(echo "$f" | sed 's|^templates/creator/||')
  check_file "$f" | while IFS='	' read -r tag o c; do
    [ -z "$tag" ] && continue
    printf '"%s","%s","%s","%s","%s"\n' "$rel" "$tag" "$o" "$c" "$((o - c))" >> "$out"
  done
done

bad=$(( $(wc -l < "$out") - 1 ))
files=$(sed 's/"//g' "$out" | awk -F, 'NR>1{print $1}' | sort -u | wc -l)

echo ""
echo "unbalanced elements : $bad"
echo "files affected      : $files"
echo "report              : $out"
if [ "$bad" -gt 0 ]; then
  echo ""
  sed 's/"//g' "$out" | awk -F, 'NR>1{printf "  %-52s %-10s open %s close %s\n", $1, $2, $3, $4}' | head -30
  status=1
fi
exit $status
