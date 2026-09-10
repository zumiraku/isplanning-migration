param(
  [string]$SampleCsv = 'inventory\pages-products-sample.csv',
  [string]$OutCsv    = 'inventory\product-variants.csv'
)

$eucjp = [System.Text.Encoding]::GetEncoding(51932)
$rows  = Import-Csv $SampleCsv
$out   = New-Object System.Collections.ArrayList

$NAIRE = [string]::Join('', [char[]](0x540D, 0x5165, 0x308C))   # 名入れ
$TANKA = [string]::Join('', [char[]](0x5358, 0x4FA1))           # 単価

foreach ($r in $rows) {
  if (-not $r.file -or -not (Test-Path "snapshot\desktop\$($r.file)")) { continue }
  $h = $eucjp.GetString([System.IO.File]::ReadAllBytes("snapshot\desktop\$($r.file)"))

  $optVals = [regex]::Matches($h, 'name="brand_option"[^>]*value="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $cols = @(); $rws = @()
  foreach ($v in $optVals) { if ($v -match '^(\d+)_(\d+)$') { $cols += $matches[1]; $rws += $matches[2] } }

  $selects = ([regex]::Matches($h, '(?i)<select[^>]*name="[^"]*opt')).Count

  $class =
    if     ($optVals.Count -gt 0 -and $h -match 'updateOptionPrice') { 'matrix-priced' }
    elseif ($optVals.Count -gt 0)                                    { 'matrix-static' }
    elseif ($selects -gt 0)                                          { 'select-options' }
    else                                                             { 'plain' }

  [void]$out.Add([pscustomobject]@{
    url             = $r.url
    scheme          = if ($r.url -match '/shopdetail/000000') { 'new' } else { 'old' }
    class           = $class
    option_count    = $optVals.Count
    grid_cols       = if ($cols) { ($cols | Sort-Object -Unique).Count } else { 0 }
    grid_rows       = if ($rws)  { ($rws  | Sort-Object -Unique).Count } else { 0 }
    select_count    = $selects
    has_updatePrice = [bool]($h -match 'function\s+updateOptionPrice')
    has_ajaxPrice   = [bool]($h -match 'updateOptionPriceAjax')
    has_naire       = [bool]($h -match [regex]::Escape($NAIRE))
    has_rcmd        = [bool]($h -match 'rcmd\.jp')
    has_qty_table   = [bool]($h -match ('(?s)<table[^>]*>.{0,4000}?' + [regex]::Escape($TANKA)))
    title           = $r.title
  })
}

$out | Export-Csv $OutCsv -NoTypeInformation -Encoding UTF8

Write-Output "=== variant classes ==="
$out | Group-Object class | Sort-Object Count -Descending |
  ForEach-Object { "{0,-16} {1,4}  ({2:P0})" -f $_.Name, $_.Count, ($_.Count / $out.Count) }
Write-Output ""
Write-Output "=== by scheme ==="
$out | Group-Object scheme, class | Sort-Object Name | Select-Object Name, Count
Write-Output ""
Write-Output "=== grid shapes seen (matrix pages) ==="
$out | Where-Object { $_.option_count -gt 0 } |
  Group-Object { "$($_.grid_cols) x $($_.grid_rows)" } | Sort-Object Count -Descending |
  Select-Object Name, Count
Write-Output ""
Write-Output "=== feature prevalence ==="
foreach ($f in 'has_updatePrice','has_ajaxPrice','has_naire','has_rcmd','has_qty_table') {
  "{0,-16} {1,4} / {2}" -f $f, @($out | Where-Object { $_.$f -eq $true }).Count, $out.Count
}
Write-Output ""
Write-Output "-> $OutCsv"

