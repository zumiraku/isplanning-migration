#!/bin/sh
# =============================================================================
#  check-tag-coverage.sh — ベーシックで生きているタグが、こちらに在るか
#
#  check-tag-context.sh は「タグの隣の文字」を見ます。これは「タグそのもの」を
#  見ます。両方要ります。
#
#    価格の欠落        → タグは在った。**隣の文字**が無かった  … context が拾う
#    セール枠の欠落    → **タグごと**無い                      … こちらが拾う
#
#  🔴 コメントアウトされたタグは対象外です。
#
#     一覧の「カートに入れる」は <!-- --> の中にあり、現行サイトにも出ていま
#     せん。出ていないものを欠落と呼ぶと、本物が埋もれます。
#
#  対応先は inventory/tag-mapping.csv から引きます。「不要」と判断済みの行は
#  飛ばします（レイアウトを作り直したので消えて当然のものが多くあります）。
#
#  出るのは候補です。**1件ずつ人が見る前提**で、EXPECT に理由を書いて外します。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

perl -CS -e '
  use utf8;
  binmode STDOUT, ":encoding(UTF-8)";
  require Encode;

  my @pairs = (
    ["design_brandpage",  "category.tpl",   "カテゴリ"],
    ["design_searchpage", "search.tpl",     "検索"],
    ["design_detailpage", "detail.tpl",     "商品詳細"],
    ["design_basketpage", "cart-body.tpl",  "カート"],
    ["design_mainpage",   "top-body.tpl",   "トップ"],
  );

  # 判断済み。理由を書いてから足すこと。
  my %expect = (
    "[SUGU]"      => "一発購入。廃止機能で、現行もコメントアウト（Q3）",
    "[BASKET_MAIL]" => "買い物かごからの問い合わせ。Creatorに対応タグが無い。見積依頼フォームで代替",
    "[AMAZON_PAY_BUTTON]" => "Amazon Pay。プラットフォームが出す",
    "[RESERVE]"   => "ポイント。現行もコメントアウト",
  );

  # ベーシックタグ → Creatorタグ（tag-mapping.csv から）
  my %map;
  if (open my $m, "<:raw", "inventory/tag-mapping.csv") {
    local $/; my $b = <$m>; close $m; $b =~ s/^\xEF\xBB\xBF//;
    my $t = Encode::decode_utf8($b);
    for my $line (split /\n/, $t) {
      next unless $line =~ /^"(\[[A-Z0-9_]+\])","[^"]*","[^"]*","[^"]*","([^"]*)","([^"]*)"/;
      my ($tag, $eq, $status) = ($1, $2, $3);
      next if $status eq "不要";
      next unless $eq =~ /\$([A-Za-z_][A-Za-z0-9_.]*)/;
      $map{$tag} = $1;
    }
  }

  my $total = 0;
  my $skipped = 0;
  for my $p (@pairs) {
    my ($bn, $cn, $label) = @$p;
    my $bf = "templates/basic-export/design/$bn.txt";
    my $cf = "templates/creator/mode/$cn";
    open my $i, "<:raw", $bf or next;
    local $/; my $raw = <$i>; close $i;
    my $b = eval { Encode::decode("utf8", $raw, Encode::FB_CROAK) };
    $b = Encode::decode("euc-jp", $raw) unless defined $b;
    $b =~ s/<!--.*?-->//gs;                 # コメントの中は出ていない

    open my $j, "<:encoding(UTF-8)", $cf or next;
    my $c = do { local $/; <$j> }; close $j;
    $c =~ s/<\{\*.*?\*\}>//gs;              # Smartyコメントは出力されない

    my (%seen, @miss);
    my $unjudged = 0;
    while ($b =~ /(\[[A-Z0-9_]+\])/g) {
      my $tag = $1;
      next if $seen{$tag}++;
      next if $expect{$tag};
      # 🔴 対応表は210件中174件が空欄です。空欄を「対象外」として黙って
      #    飛ばすと、**何も検査していないのに OK と出ます。** 実際に一度
      #    そうなりました。飛ばした数を必ず出します。
      my $eq = $map{$tag};
      unless ($eq) { $unjudged++; next }
      my $leaf = $eq; $leaf =~ s/.*\.//;    # list.price → price
      next if $c =~ /\Q$leaf\E/;
      push @miss, [$tag, $eq];
    }

    if ($unjudged) {
      printf "── %s: **%d 個は判定できませんでした**（対応表に対応先が書かれていません）
",
        $label, $unjudged;
      $skipped += $unjudged;
    }
    next unless @miss;
    printf "── %s（%s → %s）\n", $label, $bn, $cn;
    printf "   %-22s 対応先 %s\n", $_->[0], $_->[1] for @miss;
    $total += scalar @miss;
    print "\n";
  }

  if ($skipped) {
    printf "\n🔴 判定できなかったタグが合計 %d 個あります。**この検査は、その分について\n", $skipped;
    print   "   何も見ていません。** 対応表 inventory/tag-mapping.csv の\n";
    print   "   creator_equivalent が空だからです（210件中174件）。\n";
    print   "   埋めるまで、この検査の「問題なし」を根拠にしないでください。\n";
  }
  if ($total == 0) {
    print "\n判定できた範囲では、落ちているタグはありません\n";
    exit 0;
  }
  printf "⚠️  %d 件。1件ずつ見て、要らないものは EXPECT に理由を書いて外してください。\n", $total;
  exit 0;
'
