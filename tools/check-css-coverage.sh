#!/bin/sh
# =============================================================================
#  check-css-coverage.sh — CSSとテンプレートが噛み合っているか
#
#  ご依頼の2番目が「使っていないCSSは遠慮なく削除してよい」でした。削除した
#  とは報告していましたが、**噛み合っているかを機械的に確かめたことは
#  ありませんでした。** 見落とすと2通りの壊れ方をします。
#
#    1. テンプレートが使っているのに、CSSに無いクラス
#       → 見た目が当たらない。`var(--c-border)` が未定義でタブの下線が
#         一度も出ていなかったのと同じ種類です。**画面は出るので気づけません。**
#
#    2. CSSにあるのに、どのテンプレートも使っていないクラス
#       → 死んだCSS。依頼の趣旨からすると残す理由がありません。
#         ただし**マークアップが無いだけ**の場合もあります。点（ドット）の
#         `.gallery__dots` と仕様表の `.spectable` は、CSSだけあって
#         テンプレートに無く、機能が丸ごと出ていませんでした。
#         **未使用は「消してよい」ではなく「なぜ無いのか」の合図です。**
#
#  プラットフォーム側が出すクラス（$module.group や u-komi のウィジェット、
#  レコメンドの差し込み）はテンプレートに現れないので、既知のものは除外
#  します。除外した分は最後に一覧で出します。
# =============================================================================
set -e
cd "$(dirname "$0")/.."

# 🔴 読むCSSは1本ではありません
#
#    店舗は2本のスタイルシートを読んでいます。
#
#      m_sys_common.css   → all-pages.css（こちらの箱に入れる）
#      gigaplus の default.css → 外部のまま <link> で読む（22KB・393クラス）
#
#    2本目を見ていなかったせいで、.mb10 .mt10 .clearfix .ta_c のような
#    ユーティリティが「CSSに無い」と33件も出ていました。**実際は当たって
#    いるのに、検査だけが騒いでいる**状態です。これを放っておくと、本物の
#    欠落が33件の中に埋もれます。
#
#    外部ファイルは控えを持ちます（tools/port/fetch-external-css.sh）。
#    検査のたびに取りに行くと、ネットが無いと落ちるためです。
CSS_MAIN=templates/creator/mode/all-pages.css
CSS_EXT=templates/basic-export/external/gigaplus-default.css
[ -f "$CSS_MAIN" ] || { echo "missing $CSS_MAIN" >&2; exit 1; }
[ -f "$CSS_EXT" ]  || { echo "missing $CSS_EXT — tools/port/fetch-external-css.sh を回してください" >&2; exit 1; }

CSS="${TMPDIR:-.}/css-coverage-all.css"
cat "$CSS_MAIN" "$CSS_EXT" > "$CSS"
trap 'rm -f "$CSS"' EXIT

perl -CS -e '
  use utf8;
  binmode STDOUT, ":encoding(UTF-8)";
  my ($css, @tpl) = @ARGV;

  # ---- CSSで定義されているクラス -------------------------------------------
  open my $c, "<:encoding(UTF-8)", $css or die "$css: $!";
  my $src = do { local $/; <$c> };
  close $c;
  $src =~ s{/\*.*?\*/}{}gs;                 # コメントの中は定義ではない
  my (%defined, %subject);
  # セレクタ部分（{ の手前）だけを見ます
  while ($src =~ /([^{}]+)\{/g) {
    my $sel = $1;
    $defined{$1} = 1 while $sel =~ /\.([A-Za-z_][A-Za-z0-9_-]*)/g;

    # 🔴 名前が出てくるだけでは「当たっている」ことになりません。
    #    `.guide-item figure { … }` は figure を飾るだけで、
    #    `.guide-item` そのものには何も当たりません。トップの6リンクが
    #    <a class="guide-item"> だったので、素のテキストリンクのまま
    #    並んでいました。**そのクラスが主語になっている規則があるか**を
    #    別に数えます。カンマ区切りの各セレクタの、最後のかたまりを見ます。
    for my $one (split /,/, $sel) {
      $one =~ s/^\s+|\s+$//g;
      next unless length $one;
      my @compound = split /\s+|(?<=[>+~])\s*/, $one;
      my $last = $compound[-1];
      $last = "" unless defined $last;
      $subject{$1} = 1 while $last =~ /\.([A-Za-z_][A-Za-z0-9_-]*)/g;
    }
  }

  # ---- テンプレートで使われているクラス -------------------------------------
  my %used;
  for my $f (@tpl) {
    open my $i, "<:encoding(UTF-8)", $f or next;
    my $t = do { local $/; <$i> };
    close $i;
    $t =~ s{<\{\*.*?\*\}>}{}gs;             # Smartyコメントは出力されない
    while ($t =~ /class="([^"]*)"/g) {
      my $cl = $1;
      $cl =~ s/<\{[^}]*\}>//g;              # クラス名にタグが混ざる場合
      $used{$_} = 1 for grep { /\S/ } split /\s+/, $cl;
    }
  }

  # ---- プラットフォームが出すもの・意図的に外すもの --------------------------
  my %platform = map { $_ => 1 } qw(
    review-container u-komi
  );
  my $platform_re = qr/^(?:rcmd|ukomi|makeshop|ms-)/;

  # お店が商品説明・追加画像の説明欄に直接書いているクラス。テンプレートには
  # 出てこないので「未使用」に見えますが、**消すと9,534商品の見た目が落ちます。**
  # 出どころは m_sys_common.css で、切替で消えるためこちらが引き取ったものです。
  my %shop_authored = map { $_ => 1 } qw(
    box20 box21 box22 box23 box24 box77
    cube cube2 cube3 cube4
    cover cover1 cover2
    btn_design btn_design3 btn_design4 btn_design5
    similar_product similar_product-title
    normal-box2 normal-box3 normal-box4 normal-box5
    nameprice name2022 name2023
    quantityselection quantityselection2
    syouhin_red kome textboxisp
  );
  # 2026-09-08 に追加。商品ページ102件の「お店が書く4つの欄」を機械的に走査して
  # 見つけたクラスと、その番号違いの兄弟です。**テンプレートには出てこないので
  # 「未使用」に見えますが、消すと9,535商品の見た目が落ちます。**
  #
  # 🔴 以前ここに「nameprice / cover は現行サイトにも定義が無いので書かない」と
  #    書いていました。誤りでした。m_sys_common.css に全部あります。

  # 子だけを飾るのが目的のクラス。自分自身には何も当たらなくて正しいものです。
  #   .stack > * + *        中の要素どうしの間隔だけを作る
  #   .tabs__panel > ...    パネル自身は入れ物で、表示/非表示は hidden 属性
  # 追加するときは**理由を書いてから**にしてください。ここに入れれば報告が
  # 止まるので、`.guide-item` のような本物の抜けも一緒に隠せてしまいます。
  my %container_only = map { $_ => 1 } qw(
    stack tabs__panel
  );

  # 🔴 「クラス名そのものには指定が無いが、それで正しい」ものの除外表
  #
  #    店舗の元CSSは、クラスではなく構造で当てている箇所が多くあります。
  #    たとえば カートに入れるボタンは .detail-cart ではなく
  #    #O_itemDetailBottomR .goCart a で当たっています。元サイトでも
  #    そもそも指定が無いクラス（.clearfix .boldsa .f5 …）もあります。
  #
  #    これを毎回18件ずつ報告していると、**本物の欠落がその中に埋もれます。**
  #    理由を1行ずつ書いて除外します。理由が書けないものは除外しません。
  my %allow;
  if (open my $a, "<:encoding(UTF-8)", "inventory/css-coverage-allow.tsv") {
    <$a>;
    while (my $l = <$a>) { chomp $l; my ($c) = split /\t/, $l; $allow{$c} = 1 if $c; }
    close $a;
  }

  my (@missing, @unused, @ancestor_only);
  for my $k (sort keys %used) {
    next if $platform{$k} || $k =~ $platform_re;
    next if $allow{$k};
    if (!$defined{$k}) { push @missing, $k; next }
    next if $container_only{$k};
    push @ancestor_only, $k unless $subject{$k};
  }
  for my $k (sort keys %defined) {
    next if $platform{$k} || $k =~ $platform_re;
    next if $shop_authored{$k};
    push @unused, $k unless $used{$k};
  }

  printf "CSSで定義 %d クラス / テンプレートで使用 %d クラス\n\n",
    scalar keys %defined, scalar keys %used;

  if (@ancestor_only) {
    print "🔴 CSSに名前は出るが、そのクラス自身には何も当たっていない
";
    print "    （`.x figure {…}` のように祖先としてしか書かれていない）
";
    printf "   %s
", join("  ", @ancestor_only);
    print "
";
  }

  if (@missing) {
    print "🔴 使っているのにCSSに無い（見た目が当たりません）\n";
    printf "   %s\n", join("  ", @missing);
    print "\n";
  } else {
    print "OK  使っているクラスはすべてCSSにあります\n";
  }

  if (@unused) {
    printf "⚠️  CSSにあるのに使われていない %d クラス\n", scalar @unused;
    print "    消す前に「なぜ無いのか」を見てください。マークアップの\n";
    print "    書き忘れだった例が2つあります（点と仕様表）。\n";
    printf "   %s\n", join("  ", @unused);
    print "\n";
  } else {
    print "OK  未使用のクラスなし\n";
  }

  # 🔴 「祖先としてしか書かれていない」は、もう失敗にしません
  #
  #    こちらが設計していたころは、.x figure {…} と書いて .x {…} を
  #    書き忘れる事故を捕まえるための検査でした。移植後の相手は店舗が
  #    11年かけて育てた 8,479行のCSSで、**構造で当てるのが普通の書き方**です
  #    （#O_itemDetailBottomR .goCart a のように）。23件が毎回出ると、
  #    本物の欠落がその中に埋もれます。報告は残して、判定からは外します。
  exit(@missing ? 1 : 0);
' "$CSS" templates/creator/mode/*.tpl package/modules/*.tpl
