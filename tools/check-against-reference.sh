#!/bin/sh
# =============================================================================
#  check-against-reference.sh — compare every tag we use to the official list
#
#  🔴 Why this had to exist
#
#     `<{$category.pager}>` shipped to 607 live category pages and rendered the
#     word **Array**. Not blank - the literal text "Array", where the page
#     numbers belong. 366 items over 8 pages with no way to reach page 2.
#
#     $category.pager is not a tag. It is a container:
#
#       $category.pager.has_item / .list[i].number / .list[i].url
#                     / .list[i].is_current_page / .prev_url / .next_url
#                     / .first_url / .last_url / .is_first / .is_last
#                     / .is_first_display / .is_last_display / .last_number
#
#     Nothing here caught it. The tag ledger had "$category.pager confirmed",
#     because the name does appear in the reference - as a prefix. The Smarty
#     check passed, the balance check passed, the local renderer printed
#     nothing for it because our fixtures had no pager, and the page looked
#     right in every screenshot because "Array" is one small word in a place
#     nobody reads twice.
#
#     It took fetching the live HTML and reading the reference in the same
#     hour to see it.
#
#  This asks two questions of every tag in the templates:
#
#    1. Is it in the reference at all?
#       A name that is not documented is the failure mode that removed the
#       breadcrumb from every product page - Smarty drops it silently.
#
#    2. Is it printed as a value when the reference only documents children?
#       That is the Array bug, exactly.
#
#  inventory/creator-tags-reference.tsv holds 383 tags scraped from the nine
#  reference pages that exist. Regenerate with tools/fetch-reference.sh when
#  MakeShop updates the documentation.
#
#  What it cannot do: the reference is incomplete. $module.* and $makeshop.*
#  are not in it, and neither are the page types with no reference page (top,
#  cart, freepage, member, review). Those are skipped rather than reported, so
#  a clean run is not proof - it is the absence of one specific class of error.
# =============================================================================
set -e
cd "$(dirname "$0")/.."

REF=inventory/creator-tags-reference.tsv
[ -f "$REF" ] || { echo "missing $REF - run tools/fetch-reference.sh" >&2; exit 1; }

perl -CS -e '
  my ($ref, @tpl) = @ARGV;

  # ---- documented tags, and which of them are containers ------------------
  my (%doc, %container);
  open my $r, "<:encoding(UTF-8)", $ref or die "$ref: $!";
  <$r>;
  while (my $l = <$r>) {
    chomp $l;
    my ($t) = split /\t/, $l;
    next unless defined $t && $t =~ /^\$/;
    $doc{$t} = 1;
    # every prefix of a documented tag is a container, not a value
    my @p = split /\./, $t;
    for my $i (1 .. $#p - 1) { $container{join(".", @p[0 .. $i])} = 1; }
  }
  close $r;

  # ---- what the templates use ---------------------------------------------
  my (%printed, %used, %where);
  for my $f (@tpl) {
    open my $fh, "<:encoding(UTF-8)", $f or next;
    local $/; my $src = <$fh>; close $fh;
    $src =~ s/<\{\*.*?\*\}>//gs;              # comments are not code
    while ($src =~ /<\{(.*?)\}>/gs) {
      my $tag = $1;
      # printed as a value: <{$x}> or <{$x|modifier}>
      if ($tag =~ /^\s*(\$[A-Za-z0-9_.\[\]]+)\s*(\|.*)?$/) {
        my $t = $1; $t =~ s/\[[a-z]+\]//g;
        $printed{$t} = 1; $where{$t} = $f unless $where{$t};
      }
      while ($tag =~ /(\$[A-Za-z0-9_.\[\]]+)/g) {
        my $t = $1; $t =~ s/\[[a-z]+\]//g;
        $used{$t} = 1; $where{$t} = $f unless $where{$t};
      }
    }
  }

  # $module.* and $makeshop.* are the console own, not in the reference.
  # $smarty.* is Smarty itself. $url.* and $shop.* live in common.
  my $skip = qr/^\$(module|makeshop|smarty)\./;

  my (@array_bug, @unknown);
  for my $t (sort keys %printed) {
    next if $t =~ $skip;
    push @array_bug, "$t\t$where{$t}" if $container{$t} && !$doc{$t};
  }
  for my $t (sort keys %used) {
    next if $t =~ $skip;
    next if $doc{$t} || $container{$t};
    push @unknown, "$t\t$where{$t}";
  }

  printf "リファレンスのタグ      : %d\n", scalar keys %doc;
  printf "テンプレートで使用      : %d\n", scalar keys %used;
  print "\n";

  if (@array_bug) {
    print "🔴 値として出しているが、中身を持つ入れ物のタグ（Array と表示されます）\n";
    for (@array_bug) { my ($t,$f)=split /\t/; printf "   %-42s %s\n", $t, $f }
    print "\n";
  } else { print "OK  入れ物のタグを値として出している箇所なし\n" }

  if (@unknown) {
    print "⚠️  リファレンスに無いタグ（黙って消えます。ページ種別にリファレンスが\n";
    print "    無いものも混ざるので、1件ずつ確認してください）\n";
    for (@unknown) { my ($t,$f)=split /\t/; printf "   %-42s %s\n", $t, $f }
    print "\n";
  } else { print "OK  リファレンスに無いタグなし\n" }

  exit(@array_bug ? 1 : 0);
' "$REF" templates/creator/mode/*.tpl
