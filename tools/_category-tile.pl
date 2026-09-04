# Per-category data out of a categotybanner block.
#
# The block is a row of tiles. The first holds [CATEGORY_IMAGE] with a caption
# written for that category - that caption is the only genuinely per-category
# text in these files, and it is what would be lost. The tiles after it are
# shared promotions: seasonbanner -> /html/page5.html, housounosiname3.png for
# 包装・のし・名入れ. 36 of the 40 templates carry the same one, so they are a
# common block in the template rather than 36 rows of data.
my $h = do { local $/; <> };
my $cap = '';
my @shared;
while ($h =~ /<div class="sample2">(.*?)(?=<div class="sample2">|<\/ul>)/gs) {
  my $tile = $1;
  my ($c) = $tile =~ /class="caption">([^<]*)/;
  $c = '' unless defined $c;
  $c =~ s/^\s+|\s+$//g;
  $c =~ s/"/'/g;
  if ($tile =~ /\[CATEGORY_IMAGE\]/) {
    $cap = $c;
  } elsif ($tile =~ /<img[^>]*src="([^"]*)"/) {
    my $f = $1; $f =~ s{.*/}{};
    push @shared, $f;
  }
}
print $cap, "\t", join(' ', @shared), "\n";
