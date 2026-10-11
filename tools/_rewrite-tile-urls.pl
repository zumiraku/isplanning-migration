#!/usr/bin/perl
# 1件でも対応が取れなければ落とす（旧URLのままだと46本がリダイレクト頼みになる）
use strict;
use warnings;
use utf8;
use Encode qw(decode_utf8);
binmode STDERR, ':encoding(UTF-8)';
binmode STDOUT, ':encoding(UTF-8)';

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

my ($csv, $tpl) = @ARGV;
die "usage: _rewrite-tile-urls.pl <categories-url.csv> <tiles.tpl>\n" unless $tpl;

open my $c, '<:raw', $csv or die "$csv: $!";
my $b = do { local $/; <$c> };
close $c;
$b =~ s/^\xEF\xBB\xBF//;
my $t = decode_utf8($b);
$t =~ s/\r//g;
my @lines = split /\n/, $t;
shift @lines;

my %map;
for my $l (@lines) {
    next unless $l =~ /\S/;
    my @f = fields($l);
    next unless @f > 4;
    next unless $f[1] =~ m{/view/category/};
    $map{$f[4]} = $f[1];
}

open my $i, '<:encoding(UTF-8)', $tpl or die "$tpl: $!";
my $src = do { local $/; <$i> };
close $i;

my (@missing, $n);
$src =~ s{href="(/shopbrand/[^"]*)"}{
    my $u = $1;
    my $bare = $u; $bare =~ s{/$}{};
    my $hit = $map{$u} // $map{"$u/"} // $map{$bare} // $map{"$bare/"};
    if ($hit) { $n++; 'href="' . $hit . '"' }
    else      { push @missing, $u; 'href="' . $u . '"' }
}ge;

if (@missing) {
    print STDERR "対応の取れないタイルが " . scalar(@missing) . " 件あります:\n";
    print STDERR "  $_\n" for @missing;
    print STDERR "旧URLのまま出すと切替後にリダイレクト頼みになります。中止します。\n";
    exit 1;
}

open my $o, '>:encoding(UTF-8)', $tpl or die "$tpl: $!";
print $o $src;
close $o;

print "  タイルのリンクを新URLに書き換え: $n 件\n";
