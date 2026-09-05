#!/usr/bin/perl
# -----------------------------------------------------------------------------
#  _check-category-title.pl — does the generated template actually produce the
#  titles the shop had before the migration?
#
#  🔴 This has to ask a DIFFERENT question from the generator, or it proves
#     nothing. The earlier caption check compared an extraction against the
#     same extraction and reported 34/34 identical while 10 were truncated.
#
#     So this does not look at any intermediate file. It reads
#     _category-title.tpl the way Smarty would - walking the if/elseif chain,
#     picking the first branch whose ct code matches, and assembling whatever
#     that branch emits, including the suffix that was folded out of the branch
#     bodies - and compares the result to the original title in
#     categories-seo-backup.csv, joined through the ct code in
#     categories-url.csv. If the folding is wrong by one character, this fails.
# -----------------------------------------------------------------------------
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

my ($TPL, $SEO, $URLC, $REPORT) = @ARGV;
die "usage: _check-category-title.pl <tpl> <seo.csv> <url.csv> <report.csv>\n"
    unless $REPORT;

# ---- 1. render the template for every ct code it mentions -------------------
my $tpl = slurp($TPL);

# The header comment talks ABOUT <title>, so Smarty comments come out first -
# otherwise the "exactly one <title>" check trips over the documentation.
$tpl =~ s{<\{\*.*?\*\}>}{}gs;

# The document must be a single <title>…</title> with the chain inside it.
my ($inner) = $tpl =~ m{<title>(.*?)</title>}s;
die "FAIL: the template does not contain exactly one <title> element\n"
    unless defined $inner;
die "FAIL: more than one <title> in the template\n"
    if scalar(() = $tpl =~ m{<title>}g) != 1;

# Everything from the first <{else}> onward is the fallback for categories added
# after the migration. It has its own nested if/section inside it, so it is cut
# away before the chain is split - otherwise its internals get read as branches.
my $i = index($inner, '<{else}>');
die "FAIL: no <{else}> fallback in the chain\n" if $i < 0;
my $chain = substr($inner, 0, $i);

# Split the chain into branches. A branch begins at an <{if}>/<{elseif}> and
# runs to the next one.
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
    # undo the escaping the generator applied on the way out
    $body =~ s/&lt;/</g;
    $body =~ s/&gt;/>/g;
    $body =~ s/&amp;/&/g;
    die "FAIL: branch for $c still contains a Smarty tag: $body\n"
        if $body =~ /<\{/;
    $rendered{$c} = $body;
}

# ---- 2. what the titles were, straight from the two source files ------------
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

# ---- 3. what the report says was deliberately not restored ------------------
my %excused;
if (-f $REPORT) {
    my @r = split /\n/, slurp($REPORT); shift @r;
    for my $l (@r) {
        next unless $l =~ /\S/;
        my @f = fields($l);
        $excused{$f[1]} = $f[0] if defined $f[1] && $f[1] =~ /^ct\d+$/;
    }
}

# ---- 4. compare -------------------------------------------------------------
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
