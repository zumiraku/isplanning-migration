#!/bin/sh
# fetch-reference.sh — pull the official tag list into the repository
set -e
cd "$(dirname "$0")/.."

SECTIONS="common category detail search news-list news-detail company guide contract"
TMP="${TMPDIR:-/tmp}/msref"
mkdir -p "$TMP"

echo "取得:"
for s in $SECTIONS; do
  code=$(curl -sS -m 25 -A "Mozilla/5.0" -o "$TMP/$s.html" -w "%{http_code}" \
    "https://reference.makeshop.jp/creator-mode/contents/$s/index.html" 2>/dev/null || echo 000)
  printf "  %-12s HTTP %s  %s bytes\n" "$s" "$code" "$(wc -c < "$TMP/$s.html")"
done

perl -CS -e '
  my ($dir, $out, @sections) = @ARGV;
  my %tag;
  for my $s (@sections) {
    my $f = "$dir/$s.html";
    next unless -f $f;
    open my $fh, "<:encoding(UTF-8)", $f or next;
    local $/; my $h = <$fh>; close $fh;
    while ($h =~ /(\$[a-z_]+(?:(?:\[[a-z]\])?\.[A-Za-z0-9_]+)+(?:\[[a-z]\])?)/g) {
      my $t = $1;
      $t =~ s/\[[a-z]\]//g;
      next if $t =~ /\.$/;
      $tag{$t}{$s} = 1;
    }
  }
  open my $o, ">:encoding(UTF-8)", $out or die "$out: $!";
  print $o "tag\tsections\n";
  for my $t (sort keys %tag) { print $o "$t\t", join(",", sort keys %{$tag{$t}}), "\n" }
  close $o;
  printf "\nタグ %d 件を %s に書き出しました\n", scalar keys %tag, $out;
' "$TMP" inventory/creator-tags-reference.tsv $SECTIONS

