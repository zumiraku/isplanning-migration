<#
  build-price-oracle.ps1

  Turns spec/price-matrix-basic.csv - the 73 endpoint responses captured from the
  live Basic Mode shop on 2026-08-29 - into a JS fixture the verification harness
  can load over file://.

  Why a generated .js and not the .csv directly: a browser opened from the file
  system cannot fetch() a local CSV or JSON (CORS blocks it), but it can include
  a <script src>. So the oracle ships as an assignment to window.PRICE_ORACLE.

  Each row carries two things, and the difference matters:
    raw    - the exact response body the live endpoint returned. The stub replays
             this verbatim, so the engine parses what production actually sends.
    expect - the price fields as parsed into their own CSV columns at capture
             time. The harness asserts against these, so a field-mapping error
             (tax rendered into the price slot, say) fails instead of agreeing
             with itself.

  Usage:  .\tools\build-price-oracle.ps1
  Output: templates/creator/preview/price-oracle.js
#>

[CmdletBinding()]
param(
  [string]$Csv = (Join-Path $PSScriptRoot '..\spec\price-matrix-basic.csv'),
  [string]$Out = (Join-Path $PSScriptRoot '..\templates\creator\preview\price-oracle.js')
)

$ErrorActionPreference = 'Stop'

$rows = Import-Csv -Path $Csv
if (-not $rows) { throw "no rows read from $Csv" }

$fixtures = @()
foreach ($r in $rows) {
  if ($r.status -ne '200') {
    Write-Warning "skipping uid=$($r.uid) $($r.option1_id)_$($r.option2_id): status $($r.status)"
    continue
  }
  $fixtures += [pscustomobject]@{
    uid = $r.uid
    o1  = $r.option1_id
    o2  = $r.option2_id
    expect = [pscustomobject]@{
      price  = [int]$r.price
      no_tax = [int]$r.no_tax_price
      tax    = [int]$r.tax
      point  = [int]$r.point
    }
    raw = $r.raw
  }
}

# -Compress keeps the file readable as data rather than 900 lines of formatting.
$json = $fixtures | ConvertTo-Json -Depth 6 -Compress

$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
$uids  = ($fixtures | Select-Object -ExpandProperty uid -Unique).Count

# Built line by line. An -f format operator inside an array literal binds in a way
# that silently ate the assignment target here, producing a fixture file that
# defined nothing at all.
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('/* GENERATED FILE - do not edit by hand.')
$lines.Add('   Source: spec/price-matrix-basic.csv (captured from the live Basic Mode shop,')
$lines.Add('   2026-08-29). Regenerate with tools\build-price-oracle.ps1')
$lines.Add(('   Built {0}: {1} combinations across {2} products. */' -f $stamp, $fixtures.Count, $uids))
$lines.Add('window.PRICE_ORACLE = ' + $json + ';')
$text = ($lines -join "`r`n") + "`r`n"

# UTF8 without BOM: the harness declares utf-8 and a BOM mid-page is noise.
$enc = New-Object System.Text.UTF8Encoding($false)
$dir = (Resolve-Path -LiteralPath (Split-Path $Out -Parent)).Path
[System.IO.File]::WriteAllText((Join-Path $dir (Split-Path $Out -Leaf)), $text, $enc)

Write-Host ("wrote {0} - {1} combinations, {2} products" -f $Out, $fixtures.Count, $uids)
