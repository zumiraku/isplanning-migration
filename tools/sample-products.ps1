<#
  Stratified product sample.

  9,514 product pages cannot be tested individually. Sample across both code
  schemes and across the category tree, then classify by variant (see
  classify-products.ps1) so Stage 4 can test one representative per class
  instead of guessing from the single page the client happened to link.
#>
param(
  [int]$OldScheme = 40,   # cccssxxxxxx - 488 exist
  [int]$NewScheme = 60    # 000000xxxxxx - 9,025 exist
)

$rows = Import-Csv inventory\urls-sitemap.csv | Where-Object { $_.url -match '/shopdetail/' }

$old = @($rows | Where-Object { $_.url -notmatch '/shopdetail/000000' })
$new = @($rows | Where-Object { $_.url -match  '/shopdetail/000000' })

Write-Output "population: old-scheme $($old.Count) / new-scheme $($new.Count)"

# Even stride rather than random, so the sample spans the whole id range
# (id order tracks registration order, which tracks template generation).
function Get-Stride($set, $n) {
  if ($set.Count -le $n) { return $set }
  $step = [math]::Floor($set.Count / $n)
  $out = @()
  for ($i = 0; $i -lt $set.Count -and $out.Count -lt $n; $i += $step) { $out += $set[$i] }
  $out
}

$sample = @()
$sample += Get-Stride $old $OldScheme
$sample += Get-Stride $new $NewScheme

$sample | Select-Object -ExpandProperty url | Out-File inventory\urls-products-sample.txt -Encoding utf8
Write-Output "sampled: $($sample.Count) -> inventory\urls-products-sample.txt"
