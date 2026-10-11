#!/bin/sh
set -e
cd "$(dirname "$0")/.."

REF=inventory/creator-tags-reference.tsv
[ -f "$REF" ] || { echo "missing $REF - run tools/fetch-reference.sh" >&2; exit 1; }

perl -CS -e '
  my ($ref, @tpl) = @ARGV;

  my (%doc, %container);
  open my $r, "<:encoding(UTF-8)", $ref or die "$ref: $!";
  <$r>;
  while (my $l = <$r>) {
    chomp $l;
    my ($t) = split /\t/, $l;
    next unless defined $t && $t =~ /^\$/;
    $doc{$t} = 1;
    my @p = split /\./, $t;
    for my $i (1 .. $#p - 1) { $container{join(".", @p[0 .. $i])} = 1; }
  }
  close $r;

  my (%printed, %used, %where);
  for my $f (@tpl) {
    open my $fh, "<:encoding(UTF-8)", $f or next;
    local $/; my $src = <$fh>; close $fh;
    $src =~ s/<\{\*.*?\*\}>//gs;              # comments are not code
    while ($src =~ /<\{(.*?)\}>/gs) {
      my $tag = $1;
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
    print "※ 値として出しているが、中身を持つ入れ物のタグ（Array と表示されます）\n";
    for (@array_bug) { my ($t,$f)=split /\t/; printf "   %-42s %s\n", $t, $f }
    print "\n";
  } else { print "OK  入れ物のタグを値として出している箇所なし\n" }

  if (@unknown) {
    print "※ リファレンスに無いタグ（黙って消えます。ページ種別にリファレンスが\n";
    print "    無いものも混ざるので、1件ずつ確認してください）\n";
    for (@unknown) { my ($t,$f)=split /\t/; printf "   %-42s %s\n", $t, $f }
    print "\n";
  } else { print "OK  リファレンスに無いタグなし\n" }

  exit(@array_bug ? 1 : 0);
' "$REF" templates/creator/mode/*.tpl

