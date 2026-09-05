#!/usr/bin/perl
# -----------------------------------------------------------------------------
#  _rewrite-links.pl — 残っている旧URLを新URLに書き換える
#
#  rewrite-remaining-links.sh から呼ばれます。対応が取れないものは書き換えず、
#  一覧にして返します。推測で当てると、別の商品やカテゴリへ誘導することに
#  なります。
# -----------------------------------------------------------------------------
use strict;
use warnings;
use utf8;
use Encode qw(decode_utf8);
binmode STDOUT, ':encoding(UTF-8)';
binmode STDERR, ':encoding(UTF-8)';

sub fields {
    my ($l) = @_;
    my @f; my $c = ''; my $q = 0; my @ch = split //, $l;
    for (my $i = 0; $i <= $#ch; $i++) {
        my $x = $ch[$i];
        if ($q) {
            if ($x eq '"') {
                if (defined $ch[$i+1] && $ch[$i+1] eq '"') { $c .= '"'; $i++; }
                else { $q = 0; }
            } else { $c .= $x; }
        } else {
            if    ($x eq '"') { $q = 1; }
            elsif ($x eq ',') { push @f, $c; $c = ''; }
            else              { $c .= $x; }
        }
    }
    push @f, $c;
    return @f;
}

my ($csv, @files) = @ARGV;
die "usage: _rewrite-links.pl <categories-url.csv> <file>...\n" unless @files;

# ---- カテゴリ 旧URL -> 新URL ------------------------------------------------
my %cat;
open my $c, '<:raw', $csv or die "$csv: $!";
my $b = do { local $/; <$c> };
close $c;
$b =~ s/^\xEF\xBB\xBF//;
my $t = decode_utf8($b);
$t =~ s/\r//g;
my @lines = split /\n/, $t;
shift @lines;
for my $l (@lines) {
    next unless $l =~ /\S/;
    my @f = fields($l);
    next unless @f > 4 && $f[1] =~ m{/view/category/};
    my $old = $f[4];
    $cat{$old} = $f[1];
    my $bare = $old; $bare =~ s{/$}{};
    $cat{$bare} = $f[1];
    $cat{"$bare/"} = $f[1];
}

# ---- ページ種別になった旧システムページ -------------------------------------
# フリーページではありません。クリエイターモードのページ種別に変わったものです。
my %page = (
    '/html/company.html'       => '/view/company',
    '/html/ordercontract.html' => '/view/contract',
    '/html/privacy.html'       => '/view/policy',
    '/html/info.html'          => '/view/guide',
);

my (%count, @unmapped, %files_changed);

for my $f (@files) {
    open my $i, '<:encoding(UTF-8)', $f or next;
    my $src = do { local $/; <$i> };
    close $i;
    my $before = $src;

    $src =~ s{(href=")([^"]*)(")}{
        my ($a, $u, $z) = ($1, $2, $3);
        my $path = $u;
        $path =~ s{^https?://(?:www\.)?isp-sp\.com}{};
        my $new;

        if ($path =~ m{^/html/(page\d+\.html)$}) {
            $new = "/view/page/$1";                       # フリーページ
            $count{freepage}++;
        } elsif (exists $page{$path}) {
            $new = $page{$path};                          # ページ種別
            $count{pagetype}++;
        } elsif ($path =~ m{^/shopdetail/(\d+)/?}) {
            $new = "/view/item/$1";                       # 商品。コードは同じ
            $count{item}++;
        } elsif ($path =~ m{^/shopbrand/}) {
            my $hit = $cat{$path};
            if ($hit) { $new = $hit; $count{category}++ }
            else { push @unmapped, "$f\t$path"; }
        }

        $files_changed{$f} = 1 if defined $new;
        $a . (defined $new ? $new : $u) . $z;
    }ge;

    next if $src eq $before;
    open my $o, '>:encoding(UTF-8)', $f or die "$f: $!";
    print $o $src;
    close $o;
}

printf "  フリーページ  %4d 本\n", $count{freepage} // 0;
printf "  ページ種別    %4d 本\n", $count{pagetype} // 0;
printf "  商品          %4d 本\n", $count{item}     // 0;
printf "  カテゴリ      %4d 本\n", $count{category} // 0;
printf "  書き換えたファイル %d 件\n", scalar keys %files_changed;

if (@unmapped) {
    my %u;
    for (@unmapped) { my (undef, $p) = split /\t/; $u{$p}++ }
    printf "\n  🔴 対応の取れないカテゴリURL %d 種 / %d 本\n", scalar keys %u, scalar @unmapped;
    printf "     %-34s %d 本\n", $_, $u{$_} for sort keys %u;
    print  "     推測で当てると別のカテゴリへ誘導することになるので、そのままにしています。\n";
    exit 1;
}
