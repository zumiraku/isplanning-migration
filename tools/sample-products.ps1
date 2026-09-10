param(
  [int]$OldScheme = 40,   # cccssxxxxxx - 488 exist
  [int]$NewScheme = 60    # 000000xxxxxx - 9,025 exist
)

$rows = Import-Csv inventory\urls-sitemap.csv | Where-Object { $_.url -match '/shopdetail/' }

$old = @($rows | Where-Object { $_.url -notmatch '/shopdetail/000000' })
$new = @($rows | Where-Object { $_.url -match  '/shopdetail/000000' })

Write-Output "population: old-scheme $($old.Count) / new-scheme $($new.Count)"

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

