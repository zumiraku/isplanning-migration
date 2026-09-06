#!/bin/sh
# =============================================================================
#  check-internal-links.sh — 内部リンクの行き先が本当に存在するか
#
#  323本の旧URLを新URLに書き換えました。**書き換えたことと、行き先があることは
#  別です。** 対応表に無いカテゴリを当てずっぽうで書いていれば、404か、もっと
#  悪ければ別のカテゴリへ送ります。書き換えツールは対応が取れないものを
#  拒否しますが、拒否したことの確認と、行き先の実在確認は別の問いです。
#
#  ここでは、こちらが配信する全ファイルの内部リンクを集めて、行き先が
#  手元の一覧に載っているかを照合します。
#
#    /view/item/コード      → products-url.csv の 9,534件
#    /view/category/ctNNN   → categories-url.csv の 606件
#    /view/page/pageNN.html → freepages-url.csv の 82件
#    /view/news/日時        → news-url.csv の 101件
#    /view/company など     → ページ種別。固定の一覧
#
#  🔴 実在しないカテゴリコードを1つ書くと、そのリンクは404になります。
#     46枚のタイルはトップ・商品詳細・検索結果に出るので、1枚の誤りが
#     3種類のページすべてに出ます。
# =============================================================================
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

  # ページ種別。URLは固定なので一覧で持ちます。
  my %fixed = map { $_ => 1 } qw(
    top cart search company contract policy guide news order estimate favorite
    login logout mypage member_entry support
  );

  # 移行前から切れているリンク。**移行で壊したものではありません。**
  # 販売終了した商品へのリンクが、お店のフリーページに残っているものです。
  # 現行サイトで404を確認した日付と根拠を inventory/known-dead-links.csv に
  # 書いてあります。ここで除外しないと、毎回この4件が出て、**新しく壊れた
  # ものが埋もれます。**
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
    print "🔴 行き先が見つからないリンク\n";
    for my $p (sort keys %bad) {
      my @f = sort keys %{$bad{$p}};
      my $show = join ",", @f[0 .. ($#f > 2 ? 2 : $#f)];
      printf "   %-40s %2d ファイル: %s\n", $p, scalar @f, $show;
    }
    exit 1;
  }
  print "OK  すべての内部リンクに行き先があります\n";
' package/freepages/*.html templates/creator/mode/*.tpl package/modules/*.tpl
