#!/bin/sh
# check-captions.sh — are the 34 captions complete?

tpl="templates/creator/mode/category-captions.tpl"
dir="templates/basic-export/design/design_categorypages"
[ -f "$tpl" ] || { echo "no $tpl"; exit 1; }

total=0; bad=0

perl -CSD -0777 -ne '
    while (/<\{(?:else)?if \$category\.code == "([^"]+)"\}>\s*<p class="catintro__lead">(.*?)<\/p>/gs) {
      my ($code, $cap) = ($1, $2);
      print "$code\t$cap\n";
    }
  ' "$tpl" | while IFS="	" read -r code cap; do
  [ -z "$code" ] && continue
  f="$dir/design_categorypage_$code.txt"
  [ -f "$f" ] || { echo "  source missing: $code"; continue; }
  total=$((total + 1))

  r=$(CAP="$cap" perl -CSD -0777 -ne '
      use Encode; my $cap = Encode::decode_utf8($ENV{CAP});
      my $h = $_;
      $h =~ s/\s*\n\s*//g;
      my $i = index($h, $cap);
      if ($i < 0) { print "NOTFOUND"; }
      else {
        my $after = substr($h, $i + length($cap), 12);
        print( $after =~ m{^\s*</div>} ? "OK" : "TRUNCATED:$after" );
      }
    ' "$f")

  case "$r" in
    OK) ;;
    *) echo "  $code : $r"; bad=$((bad + 1)) ;;
  esac
done > /tmp/_capres.txt 2>&1

cat /tmp/_capres.txt
n=$(grep -c 'catintro__lead' "$tpl")
b=$(wc -l < /tmp/_capres.txt)
echo ""
echo "captions checked : $n"
echo "incomplete       : $b"
[ "$b" -eq 0 ] && echo "every caption runs to </div> in its source file" || exit 1

