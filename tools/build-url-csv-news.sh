#!/bin/sh
set -e
cd "$(dirname "$0")/.."

SRC=inventory/urls-news.txt
OUT=package/url-bulk/news-url.csv
ART=inventory/news-articles.csv

[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }

perl -CS -e '
  use utf8;
  binmode STDOUT, ":encoding(UTF-8)";
  my ($src, $art, $out) = @ARGV;

  my %title;
  if (-f $art) {
    open my $a, "<:raw", $art or die $!;
    local $/; my $b = <$a>; close $a; $b =~ s/^\xEF\xBB\xBF//;
    require Encode; my $t = Encode::decode_utf8($b); $t =~ s/\r//g;
    my @l = split /\n/, $t; shift @l;
    for my $l (@l) {
      my @f; my $c = ""; my $q = 0;
      for my $ch (split //, $l) {
        if ($q) { if ($ch eq q{"}) { $q = 0 } else { $c .= $ch } }
        else { if ($ch eq q{"}) { $q = 1 } elsif ($ch eq ",") { push @f, $c; $c = "" } else { $c .= $ch } }
      }
      push @f, $c;
      next unless @f > 3 && $f[0] =~ /^\d{4}-/;
      $title{$f[0]} = $f[3];
    }
  }

  open my $i, "<:raw", $src or die "$src: $!";
  local $/; my $raw = <$i>; close $i;
  $raw =~ s/^\xEF\xBB\xBF//;
  require Encode; my $txt = Encode::decode_utf8($raw);
  $txt =~ s/\r//g;

  open my $o, ">:encoding(UTF-8)", $out or die "$out: $!";
  print $o "\x{feff}";
  print $o "URLタイプ,システムURL,名称,canonical属性,追加URL,noindex設定\n";

  my ($n, $list) = (0, 0);
  for my $u (split /\n/, $txt) {
    next unless $u =~ m{/new/([^/]+)\.html};
    my $slug = $1;
    if ($slug eq "index") { $list = 1; next; }
    my $id = $slug; $id =~ s/-//g;
    die "日時の形になっていません: $slug\n" unless $id =~ /^\d{14}$/;
    my $name = $title{$slug} // $slug;
    $name =~ s/"/""/g;
    printf $o "3,/view/news/%s,\"%s\",0,/new/%s.html,0\n", $id, $name, $slug;
    $n++;
  }

  if ($list) {
    print $o "3,/view/news/list,\"お知らせ一覧\",0,/new/index.html,0\n";
    $n++;
  }

  printf "  記事 %d 件 + 一覧 %d 件 = %d 行\n", $n - $list, $list, $n;
' "$SRC" "$ART" "$OUT"

printf "  %-36s %s バイト  BOM:%s\n" "$OUT" "$(wc -c < "$OUT")" \
  "$(head -c 3 "$OUT" | od -An -tx1 | tr -d ' ')"

