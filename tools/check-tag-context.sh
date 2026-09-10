#!/bin/sh
# check-tag-context.sh — タグの「まわりの文字」が落ちていないか
set -e
cd "$(dirname "$0")/.."

perl -CS -e '
  use utf8;
  binmode STDOUT, ":encoding(UTF-8)";
  require Encode;

  my @pairs = (
    ["templates/basic-export/design/design_brandpage.txt",  "templates/creator/mode/category.tpl",   "カテゴリ"],
    ["templates/basic-export/design/design_searchpage.txt", "templates/creator/mode/search.tpl",     "検索"],
    ["templates/basic-export/design/design_detailpage.txt", "templates/creator/mode/detail.tpl",     "商品詳細"],
    ["templates/basic-export/design/design_basketpage.txt", "templates/creator/mode/cart-body.tpl",  "カート"],
    ["templates/basic-export/design/design_mainpage.txt",   "templates/creator/mode/top-body.tpl",   "トップ"],
  );

  my %expect = (
    "件"           => "件数の単位。listbar__count に「全 N 件」として入れてある",
    "並び替え"     => "listbar__sort の見出しとして入れてある",
    "ホーム"       => "パンくずの先頭に固定で入れてある",
    "品切れ中"     => "同じ意味を badge--soldout の「売切れ」で出している",
    "で検索した結果" => "「◯◯」の検索結果 という言い回しにしてある",
    "修正"         => "数量変更のリンクは「変更」にしてある",
    "買い物を続ける" => "cartactions に同じ文言で入れてある",
    "ご購入手続きへ進む" => "「ご注文手続きへ進む」にしてある。$cart.order_url",
    "円（税込）"   => "価格の単位。一覧は自前で、詳細は $item.price_html。**price_html に入るかは未確認**",
    "円（税別）から" => "セール枠の通常価格。saleflag__was に同じ文言で入れてある",
    "％OFF"        => "セール枠の割引率。saleflag__rate に同じ文言で入れてある",
    "この商品について問い合わ" => "$item.contact_url のボタンとして入れてある",
    "〜"           => "価格帯の区切り。refine__range に入れてある",
    "検索"         => "絞り込みフォームの送信ボタン",
    "買い物かごの商品について" => "[BASKET_MAIL] に Creator の対応タグが無い。カゴの見積依頼フォームで代替（$cart.estimate_url は別機能の見積書発行）",
  );

  my $slurp = sub {
    my ($f) = @_;
    open my $i, "<:raw", $f or return "";
    local $/; my $b = <$i>; close $i;
    my $t = eval { Encode::decode("utf8", $b, Encode::FB_CROAK) };
    $t = Encode::decode("euc-jp", $b) unless defined $t;
    return $t;
  };

  my $total = 0;
  for my $p (@pairs) {
    my ($bf, $cf, $label) = @$p;
    my $b = $slurp->($bf);

    $b =~ s/<!--.*?-->//gs;
    my $c = $slurp->($cf);
    next unless length $b && length $c;

    my $ctext = $c;
    $ctext =~ s/<\{\*.*?\*\}>//gs;      # Smartyコメントは出力されない
    $ctext =~ s/<\{[^}]*\}>//g;         # タグ自体
    $ctext =~ s/<[^>]*>//g;             # HTML
    $ctext =~ s/\s+//g;

    my %seen;
    my @hits;
    while ($b =~ /\[([A-Z0-9_]+)\]((?:<\/[a-z]+>|\s){0,40})([^<\[\s][^<\[]{0,12})/g) {
      my ($tag, $gap, $after) = ($1, $2, $3);
      $after =~ s/\s+$//;
      $after =~ s/^>+//;
      next unless length $after;
      next if $after =~ /^[\x00-\x7F]+$/;      # 記号や英数だけの区切りは対象外
      next if $seen{"$tag|$after"}++;
      my $probe = $after;
      $probe =~ s/\s+//g;
      next if $ctext =~ /\Q$probe\E/;
      next if grep { index($probe, $_) >= 0 } keys %expect;
      push @hits, [$tag, $after];
    }

    next unless @hits;
    printf "── %s（%s → %s）\n", $label, $bf =~ m{([^/]+)$} ? $1 : $bf, $cf =~ m{([^/]+)$} ? $1 : $cf;
    for my $h (@hits) {
      printf "   [%s] の直後にあった文字が、こちらに見当たりません: 「%s」\n", $h->[0], $h->[1];
      $total++;
    }
    print "\n";
  }

  if ($total == 0) {
    print "OK  ベーシックでタグに添えられていた文字は、すべてこちらにもあります\n";
    exit 0;
  }
  printf "※ %d 件。**不具合の一覧ではありません。** 1件ずつ見て、要らないものは\n", $total;
  print "    このスクリプトの EXPECT に理由を書いて外してください。\n";
  exit 0;
'

