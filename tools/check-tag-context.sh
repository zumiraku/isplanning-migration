#!/bin/sh
# =============================================================================
#  check-tag-context.sh — タグの「まわりの文字」が落ちていないか
#
#  🔴 これを最初に作るべきでした。
#
#     一覧の価格が <span class="card__price">44572</span> と出ていたのは、
#     ベーシックのテンプレートがこう書いていたからです。
#
#       <span class="M_cl_taxPrice">[TAXPRICE]</span>円<span class="M_outtax">（税込）</span>
#                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#     タグは移しました。**タグの右にあった「円（税込）」を移していませんでした。**
#     タグ単位で対応表を作って突き合わせていたので、タグは全部そろっていて、
#     検査は全部通っていました。**落ちたのはタグではなく、その隣の文字です。**
#
#     同じ抜け方が他にもあるなら、同じ探し方でしか見つかりません。ここでは
#     ベーシックのテンプレートから「タグと、その直前・直後にある文字」を
#     取り出し、対応するクリエイター側に同じ文字があるかを見ます。
#
#  出るのは候補であって、不具合の一覧ではありません。**1件ずつ人が見て
#  判断するための材料**です。レイアウトを作り直しているので、消えて当然の
#  文字もたくさんあります。判断の済んだものは下の EXPECT に理由付きで
#  書いてください。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

perl -CS -e '
  use utf8;
  binmode STDOUT, ":encoding(UTF-8)";
  require Encode;

  # ベーシック側テンプレート → クリエイター側テンプレート
  my @pairs = (
    ["templates/basic-export/design/design_brandpage.txt",  "templates/creator/mode/category.tpl",   "カテゴリ"],
    ["templates/basic-export/design/design_searchpage.txt", "templates/creator/mode/search.tpl",     "検索"],
    ["templates/basic-export/design/design_detailpage.txt", "templates/creator/mode/detail.tpl",     "商品詳細"],
    ["templates/basic-export/design/design_basketpage.txt", "templates/creator/mode/cart-body.tpl",  "カート"],
    ["templates/basic-export/design/design_mainpage.txt",   "templates/creator/mode/top-body.tpl",   "トップ"],
  );

  # 判断済み。**理由を書いてから足してください。** ここに入れれば報告が
  # 止まるので、本物の抜けも一緒に隠せます。
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

    # 🔴 コメントアウトされたマークアップを拾わないこと。
    #
    #    一覧の「カートに入れる」「すぐに購入」「品切れ中」を欠落として3件
    #    報告しました。**どれも <!-- --> の中**で、現行サイトにも出ていません。
    #    出ていないものを「落とした」と言うと、本物が埋もれます。
    $b =~ s/<!--.*?-->//gs;
    my $c = $slurp->($cf);
    next unless length $b && length $c;

    # クリエイター側に出ている文字（タグとHTMLを除いた地の文）
    my $ctext = $c;
    $ctext =~ s/<\{\*.*?\*\}>//gs;      # Smartyコメントは出力されない
    $ctext =~ s/<\{[^}]*\}>//g;         # タグ自体
    $ctext =~ s/<[^>]*>//g;             # HTML
    $ctext =~ s/\s+//g;

    my %seen;
    my @hits;
    # ベーシックの [TAG] と、その直後にある地の文
    while ($b =~ /\[([A-Z0-9_]+)\]((?:<\/[a-z]+>|\s){0,40})([^<\[\s][^<\[]{0,12})/g) {
      my ($tag, $gap, $after) = ($1, $2, $3);
      $after =~ s/\s+$//;
      # 先頭の「>」はタグの閉じ括弧です。地の文ではないので落とします。
      # これを付けたまま比べていたので、こちらにある「新着順」まで欠落と出ました。
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
  printf "⚠️  %d 件。**不具合の一覧ではありません。** 1件ずつ見て、要らないものは\n", $total;
  print "    このスクリプトの EXPECT に理由を書いて外してください。\n";
  exit 0;
'
