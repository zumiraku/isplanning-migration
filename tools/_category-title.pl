#!/usr/bin/perl
# called from build-category-titles.sh; a file, not perl -e, because of the ' and " quoting
use strict;
use warnings;
use utf8;
use Encode qw(decode_utf8);
binmode STDERR, ':encoding(UTF-8)';

my $SUFFIX = '【粗品と景品の発見マーケット】';

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
    $b =~ s/^\xEF\xBB\xBF//;            # console exports carry a BOM
    my $t = decode_utf8($b);
    $t =~ s/\r\n/\n/g;
    $t =~ s/\r/\n/g;
    return split /\n/, $t;
}

my ($SEO, $URLC, $OVERRIDE, $MODULE, $REF, $REPORT) = @ARGV;
die "usage: _category-title.pl <seo.csv> <url.csv> <overrides.csv> <module.tpl> <ref.tpl> <report.csv>\n"
    unless $REPORT;

my %title;
my @seo = slurp($SEO); shift @seo;
for my $l (@seo) {
    next unless $l =~ /\S/;
    my @f = fields($l);
    my ($url, $t) = ($f[0], $f[1]);
    next unless defined $url && defined $t;
    $url =~ s{^https?://[^/]+}{};       # path is the join key
    next unless $url =~ m{^/shopbrand/};
    next unless $t =~ /\S/;
    $title{$url} = $t;
}

my %code;
my @u = slurp($URLC); shift @u;
for my $l (@u) {
    next unless $l =~ /\S/;
    my @f = fields($l);
    my ($sys, $add) = ($f[1], $f[4]);
    next unless defined $sys && defined $add;
    next unless $sys =~ m{/view/category/(ct\d+)};
    $code{$add} = $1;
}

# codes without a ct number (all_items etc.); a wrong code fails silently, so note the evidence per row
{
    my @o = slurp($OVERRIDE); shift @o;
    for my $l (@o) {
        next unless $l =~ /\S/;
        my @f = fields($l);
        next unless defined $f[1] && $f[1] =~ /\S/;
        $code{$f[0]} = $f[1];
    }
}

my (%seen, @rows, @nocode, @dropped);
for my $url (sort keys %title) {
    my $c = $code{$url};
    if (!defined $c) { push @nocode, $url; next; }
    next if $seen{$c};                  # two old URLs, one category: first wins
    $seen{$c} = 1;
    my $t = $title{$url};
    $t =~ s/\s+/ /g;
    $t =~ s/^\s+//;
    $t =~ s/\s+$//;

    # e.g. ct668 is ■■■ live; drop it to the fallback title and report it
    if ($t !~ /[ぁ-んァ-ヶ一-龥A-Za-z0-9]/) {
        push @dropped, [$c, $url, $t, 'no letters or digits - falls back to the composed title'];
        next;
    }
    push @rows, [$c, $t];
}
my @notitle;
for my $url (sort keys %code) { push @notitle, $url unless exists $title{$url}; }

sub esc_text {
    my $s = shift;
    $s =~ s/&/&amp;/g;
    $s =~ s/</&lt;/g;
    $s =~ s/>/&gt;/g;
    return $s;
}

# char loop, not s///: \ and ' don't survive the layers of quoting
sub esc_str {
    my $s = shift;
    my $bs = chr(92);
    my $q  = chr(39);
    my $out = '';
    for my $ch (split //, $s) {
        $out .= $bs if $ch eq $bs || $ch eq $q;
        $out .= $ch;
    }
    return $out;
}
sub q_ { return chr(39) . esc_str($_[0]) . chr(39); }

# suffix written once outside the branches (600x would dwarf the file); titles without it are tested first
my (@with, @without);
for my $r (@rows) {
    my ($c, $t) = @$r;
    if (length($t) > length($SUFFIX) && substr($t, -length($SUFFIX)) eq $SUFFIX) {
        push @with, [$c, substr($t, 0, length($t) - length($SUFFIX))];
    } else {
        push @without, [$c, $t];
    }
}

my $n = scalar @rows;

# separate module: ~86KB is unproven in the console box (10KB known OK); if refused, only titles are lost
open my $o, '>:encoding(UTF-8)', $MODULE or die "$MODULE: $!";

print $o <<"HEAD";
<{* =========================================================================
     カテゴリページの <title> — 移行前の $n 件をそのまま復元

     クリエイターモードでは「カテゴリ設定」の独自タイトル欄が無くなります。
     ただし <title> がテンプレート側に来るので、こちらで出し直せます。

     中身は推測ではありません。移行前のタイトルそのものです。
     旧URLをキーにして、バックアップ（categories-seo-backup.csv）と
     ct番号の対応表（categories-url.csv）を突き合わせています。

     ※ このファイルは手で編集しないでください。
        tools/build-category-titles.sh が作り直します。

     【粗品と景品の発見マーケット】は600回近く出てくるので、分岐の外に
     一度だけ書いています。これが付かないタイトルは先に分けてあります。
     この畳み方が正しいことは tools/check-category-titles.sh が
     テンプレートを読み直して1件ずつ元データと突き合わせて確認します。

     最後の <{else}> は、移行後に新しく増えたカテゴリのためのものです。
     パンくずの「現在地のひとつ手前」を親カテゴリとして組み立てます。
     ホームがパンくずの先頭に入る仕様だった場合に
     「ホームの粗品通販ページ…」とならないよう、名前で弾いています。
   ========================================================================= *}>
HEAD

print $o '<title>';

my $first = 1;
for my $r (@without) {
    my ($c, $t) = @$r;
    print $o '<{' . ($first ? 'if' : 'elseif') . ' $category.code == ' . q_($c) . '}>'
           . esc_text($t) . "\n";
    $first = 0;
}
for my $r (@with) {
    my ($c, $t) = @$r;
    print $o '<{' . ($first ? 'if' : 'elseif') . ' $category.code == ' . q_($c) . '}>'
           . esc_text($t) . esc_text($SUFFIX) . "\n";
    $first = 0;
}

print $o <<'FALLBACK';
<{else}><{section name=t loop=$category.breadcrumb_list.list}><{if $smarty.section.t.index == $smarty.section.t.total-2}><{if $category.breadcrumb_list.list[t].name == 'ホーム' or $category.breadcrumb_list.list[t].name == ''}><{$category.name}>の粗品通販ページ<{else}><{$category.breadcrumb_list.list[t].name}>の粗品通販ページ<{$category.name}>まで<{/if}><{elseif $smarty.section.t.total == 1}><{$category.name}>の粗品通販ページ<{/if}><{/section}>【粗品と景品の発見マーケット】
<{/if}></title>
FALLBACK

close $o;

open my $ref, '>:encoding(UTF-8)', $REF or die "$REF: $!";
print $ref <<"REF";
<{* カテゴリページのタイトルは module「category_title」が出します。
     移行前の $n 件をそのまま復元した表で、86KBあるためページ本体には
     入れていません。→ package/modules/category_title.tpl *}>
<{\$module.category_title}>
REF
close $ref;

open my $r, '>:encoding(UTF-8)', $REPORT or die "$REPORT: $!";
print $r "\x{feff}";                    # BOM for Excel
print $r "区分,ct番号,旧URL,内容,理由\n";
sub csv { my $s = shift // ''; $s =~ s/"/""/g; return '"' . $s . '"'; }
for my $d (@dropped) {
    print $r join(',', '差し替え', csv($d->[0]), csv($d->[1]), csv($d->[2]), csv($d->[3])) . "\n";
}
for my $u (@nocode) {
    print $r join(',', '対象外', '', csv($u), csv($title{$u} // ''),
        csv('ct番号が振られていないページ。カテゴリではないため対象外')) . "\n";
}
for my $u (@notitle) {
    print $r join(',', 'タイトル無し', csv($code{$u}), csv($u), '',
        csv('バックアップに独自タイトルが無い。組み立てルールで出力')) . "\n";
}
close $r;

print STDERR "restored                        : $n  (suffix folded out: "
    . scalar(@with) . ", written in full: " . scalar(@without) . ")\n";
print STDERR "replaced (unusable title)       : " . scalar(@dropped) . "\n";
print STDERR "  $_->[0]  $_->[2]\n" for @dropped;
print STDERR "not a category (no ct code)     : " . scalar(@nocode) . "\n";
print STDERR "  $_\n" for @nocode;
print STDERR "ct code with no backed-up title : " . scalar(@notitle) . "\n";
