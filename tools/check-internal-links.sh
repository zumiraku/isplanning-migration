#!/bin/sh
# check-internal-links.sh — 内部リンクの行き先が本当に存在するか
set -e
cd "$(dirname "$0")/.."

perl -CS -e '
  use utf8;
  binmode STDOUT, ":encoding(UTF-8)";
  require Encode;

  my $load = sub {
    my ($file, $re) = @_;
    my %set;
    open my $i, "<:raw", $file or return %set;
    local $/; my $b = <$i>; close $i;
    $b =~ s/^\xEF\xBB\xBF//;
    my $t = Encode::decode_utf8($b);
    while ($t =~ /$re/g) { $set{$1} = 1 }
    return %set;
  };

  my %item = $load->("package/url-bulk/products-url.csv",  qr{/view/item/(\d+)});
  my %cat  = $load->("package/url-bulk/categories-url.csv", qr{/view/category/([A-Za-z0-9_]+)});
  my %page = $load->("package/url-bulk/freepages-url.csv",  qr{/view/page/([A-Za-z0-9_.\-]+)});
  my %news = $load->("package/url-bulk/news-url.csv",       qr{/view/news/([A-Za-z0-9]+)});

  my %fixed = map { $_ => 1 } qw(
    top cart search company contract policy guide news order estimate favorite
    login logout mypage member_entry support
  );

  my %known;
  if (open my $k, "<:raw", "inventory/known-dead-links.csv") {
    local $/; my $b = <$k>; close $k; $b =~ s/^\xEF\xBB\xBF//;
    my $t = Encode::decode_utf8($b);
    while ($t =~ m{"(/view/[^"]+)"}g) { $known{$1} = 1 }
  }

  printf "対応表: 商品 %d / カテゴリ %d / フリーページ %d / お知らせ %d\n",
    scalar keys %item, scalar keys %cat, scalar keys %page, scalar keys %news;
  printf "移行前から切れている既知のリンク: %d 件（除外）\n\n", scalar keys %known;

  my (%bad, %count, $links);
  for my $f (@ARGV) {
    open my $i, "<:encoding(UTF-8)", $f or next;
    my $t = do { local $/; <$i> };
    close $i;
    $t =~ s{<\{\*.*?\*\}>}{}gs;
    my @p = split m{[/\\]}, $f; my $name = $p[-1];

    while ($t =~ /href="([^"]*)"|href=([^"'"'"'\s>]+)/g) {
      my $u = defined $1 ? $1 : $2;
      next unless defined $u;
      next unless $u =~ m{^/view/};
      next if $u =~ /<\{/;              # Smartyタグが入るものは実行時に決まる
      $links++;
      my ($path) = $u =~ m{^([^?#]*)};
      $path =~ s{/$}{};

      my $ok;
      if    ($path =~ m{^/view/item/(\d+)$})            { $ok = $item{$1} }
      elsif ($path =~ m{^/view/category/([A-Za-z0-9_]+)$}) { $ok = $cat{$1} }
      elsif ($path =~ m{^/view/page/(.+)$})             { $ok = $page{$1} }
      elsif ($path =~ m{^/view/news/list$})             { $ok = 1 }
      elsif ($path =~ m{^/view/news/([A-Za-z0-9]+)$})   { $ok = $news{$1} }
      elsif ($path =~ m{^/view/([A-Za-z0-9_]+)$})       { $ok = $fixed{$1} }
      else                                              { $ok = 0 }

      if ($ok)              { $count{ok}++ }
      elsif ($known{$path}) { $count{known}++ }
      else                  { $count{ng}++; $bad{$path}{$name} = 1 }
    }
  }

  printf "内部リンク %d 本 / 行き先あり %d / 既知の切れ %d / 行き先なし %d\n\n",
    $links, ($count{ok} || 0), ($count{known} || 0), ($count{ng} || 0);

  if (%bad) {
    print "※ 行き先が見つからないリンク\n";
    for my $p (sort keys %bad) {
      my @f = sort keys %{$bad{$p}};
      my $show = join ",", @f[0 .. ($#f > 2 ? 2 : $#f)];
      printf "   %-40s %2d ファイル: %s\n", $p, scalar @f, $show;
    }
    exit 1;
  }
  print "OK  すべての内部リンクに行き先があります\n";
' package/freepages/*.html templates/creator/mode/*.tpl package/modules/*.tpl

