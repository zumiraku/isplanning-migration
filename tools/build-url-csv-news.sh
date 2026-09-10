#!/bin/sh
# =============================================================================
#  build-url-csv-news.sh — お知らせ101件のURL対応表
#
#  ※ 「打ち手なし」と書いていたのは誤りでした
#
#     docs/creator-mode-urls.md にこう書いていました。
#
#       「新しい形は日時なので、旧URLから導出できない。切替後に
#         プラットフォームから読み取るしかない。2013年から索引されている
#         100URL」
#
#     **旧URLを見ていませんでした。** 見れば1行で分かることでした。
#
#       /new/2013-08-01-173816.html
#              ~~~~~~~~~~~~~~~~~
#
#     旧URLそのものが日時です。ハイフンを取るだけで新URLになります。
#
#       /new/2013-08-01-173816.html  ->  /view/news/20130801173816
#
#  --- マニュアルの表記に引っかかりました ---------------------------------------
#
#  公式のページURL一覧には `/view/news/yymmddhhmmss` と書かれています。
#  yy を西暦2桁と読んで `130801173816` を試し、404。実際は**西暦4桁**で、
#  `20130801173816` が正解でした。
#
#      130801173816    HTTP 302 -> /error/404.html
#      20130801173816  HTTP 200
#
#  マニュアルの yy は年を指す慣用表記で、桁数の指定ではありませんでした。
#
#  --- 全件確認済み -------------------------------------------------------------
#
#  100件すべてをプレビューで開いて HTTP 200 を確認しています。推測ではあり
#  ません。1件でも取り違えると、別の記事か404に送ることになります。
#
#  --- URLタイプが無いという問題は残ります --------------------------------------
#
#  URL一括設定のURLタイプは 1=商品 / 2=カテゴリ / 3=独自ページ /
#  4=フリーページ の4つで、**お知らせに当たるものがありません。**
#  3 を当ててあります。通れば101本救えます。弾かれたら、この表は
#  「新URLが分かっている」という記録として残ります（分かっていれば、
#  メイクショップのサポートに転送設定を依頼する材料になります）。
#
#  他のCSVとは混ぜないでください。フリーページ82件のときは1件の問題で
#  82件すべてが落ちました。
#
#  出力: package/url-bulk/news-url.csv
# =============================================================================
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

  # 記事タイトル（名称欄に入れます。空で必須だった場合に落ちないように）
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

  # 一覧ページ。?mode=list 付きの形もありますが、追加URLは1つなので素の方を。
  if ($list) {
    print $o "3,/view/news/list,\"お知らせ一覧\",0,/new/index.html,0\n";
    $n++;
  }

  printf "  記事 %d 件 + 一覧 %d 件 = %d 行\n", $n - $list, $list, $n;
' "$SRC" "$ART" "$OUT"

printf "  %-36s %s バイト  BOM:%s\n" "$OUT" "$(wc -c < "$OUT")" \
  "$(head -c 3 "$OUT" | od -An -tx1 | tr -d ' ')"
