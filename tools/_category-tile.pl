# Per-category data out of a categotybanner block.
#
# The block is a row of tiles. The first holds [CATEGORY_IMAGE] with a caption
# written for that category - that caption is the only genuinely per-category
# text in these files, and it is what would be lost. The tiles after it are
# shared promotions: seasonbanner -> /html/page5.html, housounosiname3.png for
# 包装・のし・名入れ. 36 of the 40 templates carry the same one, so they are a
# common block in the template rather than 36 rows of data.
#
# 🔴 The caption is read to </div>, not to the next '<'.
#
# The first version used class="caption">([^<]*) and stopped at the first tag.
# The captions contain <br>, so ten of the thirty-four were cut off mid-sentence
# - 「ステーショナリーや文具は職場や家庭」 instead of the whole paragraph - and
# they were pasted into the shop that way.
#
# The check that should have caught it did not, because it compared this
# extraction against the same extraction run over the source. Verifying an
# extraction with itself proves the code is deterministic and nothing else.
# tools/check-captions.sh now compares against the raw file by a different
# route.
#
# <br> is kept: these are deliberate line breaks in a short marketing caption,
# and stripping them would run four sentences together.
use strict;
my $h = do { local $/; <> };
my $cap = '';
my @shared;
while ($h =~ /<div class="sample2">(.*?)(?=<div class="sample2">|<\/ul>)/gs) {
  my $tile = $1;
  my ($c) = $tile =~ /class="caption">(.*?)<\/div>/s;
  $c = '' unless defined $c;
  $c =~ s/\s*\n\s*//g;      # authoring newlines, not content
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
