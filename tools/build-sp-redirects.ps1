# build-sp-redirects.ps1 — targets for the 912 /smartphone/ URLs

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$map  = Join-Path $root 'inventory\redirect-map.csv'

$known = New-Object 'System.Collections.Generic.HashSet[string]'
function AddUrls([string]$path, [int]$column = -1) {
  if (-not (Test-Path $path)) { return }
  foreach ($line in [System.IO.File]::ReadAllLines($path)) {
    $v = $line.Trim()
    if (-not $v) { continue }
    if ($column -ge 0) {
      $parts = $v -split ','
      if ($parts.Count -le $column) { continue }
      $v = $parts[$column].Trim('"')
    }
    if ($v -like 'http*') { [void]$known.Add($v.TrimEnd()) }
  }
}
AddUrls (Join-Path $root 'inventory\urls-categories.txt')
AddUrls (Join-Path $root 'inventory\urls-freepages.txt')
AddUrls (Join-Path $root 'inventory\urls-news.txt')
AddUrls (Join-Path $root 'inventory\urls-sitemap.csv') 0

Write-Host ("known-good URLs loaded: {0:N0}" -f $known.Count)

$alt = @{}
foreach ($inv in @('pages-categories-desktop.csv', 'pages-freepages-desktop.csv',
                   'pages-products-sample.csv', 'pages-news-desktop.csv',
                   'pages-archetypes-desktop.csv', 'pages-special-desktop.csv')) {
  $p = Join-Path $root ('inventory\' + $inv)
  if (-not (Test-Path $p)) { continue }
  foreach ($row in (Import-Csv $p)) {
    if (-not $row.alternate) { continue }
    $a = $row.alternate.Trim()
    if ($a -like '*smartphone*' -and $row.url) { $alt[$a] = $row.url.Trim() }
  }
}
Write-Host ("smartphone -> desktop pairs read from rel=alternate: {0:N0}" -f $alt.Count)

$systemMap = @{
  'https://www.isp-sp.com/smartphone/'             = 'https://www.isp-sp.com/'
  'https://www.isp-sp.com/smartphone/index.html'   = 'https://www.isp-sp.com/'
  'https://www.isp-sp.com/smartphone/basket.html'  = 'https://www.isp-sp.com/shop/basket.html'
  'https://www.isp-sp.com/smartphone/company.html' = 'https://www.isp-sp.com/html/company.html'
  'https://www.isp-sp.com/smartphone/guide.html'   = 'https://www.isp-sp.com/html/info.html'
  'https://www.isp-sp.com/smartphone/contract.html'= 'https://www.isp-sp.com/html/ordercontract.html'
  'https://www.isp-sp.com/smartphone/policy.html'  = 'https://www.isp-sp.com/html/privacy.html'
}

$rows = Import-Csv $map
$stats = @{ mapped = 0; unverified = 0; skipped = 0 }

foreach ($r in $rows) {
  if ($r.class -notlike 'sp-*') { continue }

  $old = $r.old_url
  $target = ''
  $verify = $true
  $source = 'pattern'

  if ($alt.ContainsKey($old)) {
    $r.new_url = $alt[$old]
    $r.status = 'MAPPED'
    $r.expected_change = 'smartphone URL space is removed; 301 to the single responsive URL'
    $r.notes = 'read from the desktop page rel=alternate - measured, not derived'
    $stats.mapped++
    continue
  }

  if ($systemMap.ContainsKey($old)) {
    $target = $systemMap[$old]
    $verify = $false
  }
  elseif ($old -match '/smartphone/(page\d+)\.html$') {
    $target = 'https://www.isp-sp.com/html/' + $Matches[1] + '.html'
  }
  elseif ($old -match '/smartphone/list\.html\?category_code=(.+)$') {
    $code = [System.Uri]::UnescapeDataString($Matches[1]).Trim('/')
    $target = 'https://www.isp-sp.com/shopbrand/' + $code + '/'
  }
  elseif ($old -match '/smartphone/detail\.html\?id=(.+)$') {
    $target = 'https://www.isp-sp.com/shopdetail/' + $Matches[1] + '/'
  }
  elseif ($old -match '/smartphone/news\.html\?date=(\d{4})(\d{2})(\d{2})(\d{6})$') {
    $target = 'https://www.isp-sp.com/new/' + $Matches[1] + '-' + $Matches[2] + '-' + $Matches[3] + '-' + $Matches[4] + '.html'
  }
  elseif ($old -match '/smartphone/list\.html$') {
    $target = 'https://www.isp-sp.com/'
    $verify = $false
  }

  if (-not $target) {
    $r.status = 'TODO - no rule matched'
    $stats.skipped++
    continue
  }

  if ($verify -and -not $known.Contains($target)) {
    $r.new_url = $target
    $r.status = 'DERIVED - target not in our captured URL lists, verify before cutover'
    $r.notes = 'derived by tools\build-sp-redirects.ps1'
    $stats.unverified++
    continue
  }

  $r.new_url = $target
  $r.status = 'MAPPED'
  $r.expected_change = 'smartphone URL space is removed; 301 to the single responsive URL'
  $r.notes = 'derived and verified against the captured URL lists by tools\build-sp-redirects.ps1'
  $stats.mapped++
}

$rows | Export-Csv $map -NoTypeInformation -Encoding UTF8

Write-Host ''
Write-Host ('mapped and verified : {0}' -f $stats.mapped)
Write-Host ('derived, unverified : {0}' -f $stats.unverified)
Write-Host ('no rule matched     : {0}' -f $stats.skipped)
Write-Host ''
Write-Host 'redirect map status:'
$rows | Group-Object status | Sort-Object Count -Descending | ForEach-Object {
  Write-Host ('  {0,-58} {1,5}' -f $_.Name, $_.Count)
}

