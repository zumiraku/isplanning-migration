# caption runs to </div>, not the next '<': captions contain <br> (kept on purpose)
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
