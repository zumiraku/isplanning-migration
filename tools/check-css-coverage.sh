#!/bin/sh
# check-css-coverage.sh — CSSとテンプレートが噛み合っているか
set -e
cd "$(dirname "$0")/.."

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

  open my $c, "<:encoding(UTF-8)", $css or die "$css: $!";
  my $src = do { local $/; <$c> };
  close $c;
  $src =~ s{/\*.*?\*/}{}gs;                 # コメントの中は定義ではない
  my (%defined, %subject);
  while ($src =~ /([^{}]+)\{/g) {
    my $sel = $1;
    $defined{$1} = 1 while $sel =~ /\.([A-Za-z_][A-Za-z0-9_-]*)/g;

    for my $one (split /,/, $sel) {
      $one =~ s/^\s+|\s+$//g;
      next unless length $one;
      my @compound = split /\s+|(?<=[>+~])\s*/, $one;
      my $last = $compound[-1];
      $last = "" unless defined $last;
      $subject{$1} = 1 while $last =~ /\.([A-Za-z_][A-Za-z0-9_-]*)/g;
    }
  }

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

  my %platform = map { $_ => 1 } qw(
    review-container u-komi
  );
  my $platform_re = qr/^(?:rcmd|ukomi|makeshop|ms-)/;

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

  my %container_only = map { $_ => 1 } qw(
    stack tabs__panel
  );

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
    print "※ CSSに名前は出るが、そのクラス自身には何も当たっていない
";
    print "    （`.x figure {…}` のように祖先としてしか書かれていない）
";
    printf "   %s
", join("  ", @ancestor_only);
    print "
";
  }

  if (@missing) {
    print "※ 使っているのにCSSに無い（見た目が当たりません）\n";
    printf "   %s\n", join("  ", @missing);
    print "\n";
  } else {
    print "OK  使っているクラスはすべてCSSにあります\n";
  }

  if (@unused) {
    printf "※ CSSにあるのに使われていない %d クラス\n", scalar @unused;
    print "    消す前に「なぜ無いのか」を見てください。マークアップの\n";
    print "    書き忘れだった例が2つあります（点と仕様表）。\n";
    printf "   %s\n", join("  ", @unused);
    print "\n";
  } else {
    print "OK  未使用のクラスなし\n";
  }

  exit(@missing ? 1 : 0);
' "$CSS" templates/creator/mode/*.tpl package/modules/*.tpl

