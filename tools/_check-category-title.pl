#!/usr/bin/perl
# reads the generated tpl like Smarty would, never the generator's intermediates, else it proves nothing
use strict;
use warnings;
use utf8;
use Encode qw(decode_utf8);

sub fields {
    my ($line) = @_;
    my @f; my $cur = ''; my $inq = 0;
    my @c = split //, $line;
    for (my $i = 0; $i <= $#c; $i++) {
        my $ch = $c[$i];
        if ($inq) {
            if ($ch eq '"') {
                if (defined $c[$i+1] && $c[$i+1] eq '"') { $cur .= '"'; $i++; }
                else { $inq = 0; }
            } else { $cur .= $ch; }
        } else {
            if    ($ch eq '"') { $inq = 1; }
            elsif ($ch eq ',') { push @f, $cur; $cur = ''; }
            else               { $cur .= $ch; }
        }
    }
    push @f, $cur;
    return @f;
}

sub slurp {
    my ($p) = @_;
    open my $fh, '<:raw', $p or die "$p: $!";
    local $/; my $b = <$fh>; close $fh;
    $b =~ s/^\xEF\xBB\xBF//;
    my $t = decode_utf8($b);
    $t =~ s/\r\n/\n/g;
    $t =~ s/\r/\n/g;
    return $t;
}

my ($TPL, $SEO, $URLC, $OVERRIDE, $REPORT) = @ARGV;
die "usage: _check-category-title.pl <tpl> <seo.csv> <url.csv> <overrides.csv> <report.csv>\n"
    unless $REPORT;

my $tpl = slurp($TPL);

# header comment mentions <title>
$tpl =~ s{<\{\*.*?\*\}>}{}gs;

my ($inner) = $tpl =~ m{<title>(.*?)</title>}s;
die "FAIL: the template does not contain exactly one <title> element\n"
    unless defined $inner;
die "FAIL: more than one <title> in the template\n"
    if scalar(() = $tpl =~ m{<title>}g) != 1;

# cut the fallback first; its nested if would read as branches
my $i = index($inner, '<{else}>');
die "FAIL: no <{else}> fallback in the chain\n" if $i < 0;
my $chain = substr($inner, 0, $i);

my @parts = split /(?=<\{(?:if|elseif)\b)/, $chain;
my @branch;
for my $p (@parts) {
    next unless $p =~ /\S/;
    if ($p =~ m{^<\{(?:if|elseif) \$category\.code == '([^']*)'\}>(.*)$}s) {
        my ($c, $body) = ($1, $2);
        $body =~ s/\s+$//;
        push @branch, [$c, $body];
    } else {
        die "FAIL: a branch is not of the expected shape:\n" . substr($p, 0, 120) . "\n";
    }
}

my %rendered;
my %dup;
for my $b (@branch) {
    my ($c, $body) = @$b;
    die "FAIL: ct code $c appears in two branches; the second can never run\n"
        if $dup{$c}++;
    $body =~ s/&lt;/</g;
    $body =~ s/&gt;/>/g;
    $body =~ s/&amp;/&/g;
    die "FAIL: branch for $c still contains a Smarty tag: $body\n"
        if $body =~ /<\{/;
    $rendered{$c} = $body;
}

my %title;
my @seo = split /\n/, slurp($SEO); shift @seo;
for my $l (@seo) {
    next unless $l =~ /\S/;
    my @f = fields($l);
    next unless defined $f[1];
    my $url = $f[0];
    $url =~ s{^https?://[^/]+}{};
    next unless $url =~ m{^/shopbrand/};
    next unless $f[1] =~ /\S/;
    $title{$url} = $f[1];
}
my %code;
my @u = split /\n/, slurp($URLC); shift @u;
for my $l (@u) {
    next unless $l =~ /\S/;
    my @f = fields($l);
    next unless defined $f[4] && defined $f[1];
    next unless $f[1] =~ m{/view/category/(ct\d+)};
    $code{$f[4]} = $1;
}
{
    my @o = split /\n/, slurp($OVERRIDE); shift @o;
    for my $l (@o) {
        next unless $l =~ /\S/;
        my @f = fields($l);
        next unless defined $f[1] && $f[1] =~ /\S/;
        $code{$f[0]} = $f[1];
    }
}

my %excused;
if (-f $REPORT) {
    my @r = split /\n/, slurp($REPORT); shift @r;
    for my $l (@r) {
        next unless $l =~ /\S/;
        my @f = fields($l);
        $excused{$f[1]} = $f[0] if defined $f[1] && $f[1] =~ /^ct\d+$/;
    }
}

my ($ok, @bad, @missing, @extra) = (0);
my %expected;
for my $url (sort keys %title) {
    my $c = $code{$url};
    next unless defined $c;
    next if exists $expected{$c};
    my $t = $title{$url};
    $t =~ s/\s+/ /g; $t =~ s/^\s+//; $t =~ s/\s+$//;
    $expected{$c} = $t;
}

for my $c (sort keys %expected) {
    my $want = $expected{$c};
    my $got  = $rendered{$c};
    if (!defined $got) {
        push @missing, "$c  $want" unless $excused{$c};
        next;
    }
    if ($got eq $want) { $ok++; }
    else { push @bad, "$c\n    元 [$want]\n    出 [$got]"; }
}
for my $c (sort keys %rendered) {
    push @extra, $c unless exists $expected{$c};
}

printf "分岐の数            : %d\n", scalar @branch;
printf "元データと一致      : %d\n", $ok;
printf "不一致              : %d\n", scalar @bad;
print  "  $_\n" for @bad;
printf "テンプレートに無い  : %d  (報告書で除外済みを除く)\n", scalar @missing;
print  "  $_\n" for @missing;
printf "元データに無い分岐  : %d\n", scalar @extra;
print  "  $_\n" for @extra;

if (@bad || @missing || @extra) { print "\nNG\n"; exit 1; }
print "\nOK — 分岐 " . scalar(@branch) . " 件すべてが移行前のタイトルと一字一句一致\n";
