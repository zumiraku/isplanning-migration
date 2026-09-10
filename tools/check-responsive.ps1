# check-responsive.ps1 — Stage 5 verification

[CmdletBinding()]
param(
  [string]$Only = '',
  [string]$Chrome = '',
  [int]$TimeoutSec = 25,
  [string[]]$Also = @()
)

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$dir     = Join-Path $root 'templates\creator\preview\freepages'
$pagesJs = Join-Path $dir 'pages.js'
$outCsv  = Join-Path $root 'inventory\freepage-responsive-check.csv'

if (-not (Test-Path $pagesJs)) { throw "pages.js not found - run tools\build-freepage-previews.ps1 first" }

if (-not $Chrome) {
  foreach ($c in @(
      "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
      "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
      "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe")) {
    if (Test-Path $c) { $Chrome = $c; break }
  }
}
if (-not $Chrome -or -not (Test-Path $Chrome)) { throw 'no Chrome or Edge found - pass -Chrome' }

$js = [System.IO.File]::ReadAllText($pagesJs, [System.Text.Encoding]::UTF8)
$slugs = [regex]::Matches($js, '"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
if ($Only) { $slugs = $slugs | Where-Object { $_ -eq $Only } }
if ($Also) { $slugs = @($slugs) + $Also }
if ($Only -and $Also) { $slugs = $Also }
if (-not $slugs) { throw "no pages to check (Only='$Only')" }

$profile = Join-Path $env:TEMP ('rc-' + [guid]::NewGuid().ToString('N').Substring(0, 8))

$ErrorActionPreference = 'Continue'
$rows = New-Object System.Collections.Generic.List[object]
$i = 0

foreach ($slug in $slugs) {
  $i++
  $url = 'file:///' + ((Join-Path $dir 'responsive-check.html') -replace '\\', '/') + '?page=' + $slug

  $chromeArgs = @(
    '--headless=new', '--disable-gpu', '--no-sandbox', '--mute-audio',
    '--allow-file-access-from-files',
    '--no-first-run', '--disable-background-networking', '--disable-sync',
    '--disable-default-apps', '--log-level=3',
    ('--user-data-dir=' + $profile),
    '--window-size=1200,1000',
    '--virtual-time-budget=20000',
    '--dump-dom', $url
  )

  $dom = (& $Chrome @chromeArgs | Out-String)

  $title = ''
  $m = [regex]::Match($dom, '(?is)<title>(.*?)</title>')
  if ($m.Success) { $title = $m.Groups[1].Value }

  $row = [ordered]@{ slug = $slug; w375 = '?'; w768 = '?'; w1440 = '?'; detail = '' }
  foreach ($part in ($title -split '\s+')) {
    if ($part -match '^(\d+):(.+)$') {
      $w = $Matches[1]; $v = $Matches[2]
      switch ($w) {
        '375'  { $row.w375  = $v }
        '768'  { $row.w768  = $v }
        '1440' { $row.w1440 = $v }
      }
      if ($v -ne 'OK') { $row.detail = ($row.detail + ' ' + $w + 'px ' + $v).Trim() }
    }
  }
  $bad = @($row.w375, $row.w768, $row.w1440) | Where-Object { $_ -ne 'OK' }
  $row.result = $(if ($bad.Count -eq 0) { 'OK' } else { 'NG' })
  $rows.Add([pscustomobject]$row)

  $mark = $(if ($row.result -eq 'OK') { '.' } else { 'X' })
  Write-Host -NoNewline $mark
  if ($i % 40 -eq 0) { Write-Host '' }
}

Write-Host ''
Remove-Item $profile -Recurse -Force -ErrorAction SilentlyContinue

$rows | Export-Csv -Path $outCsv -NoTypeInformation -Encoding UTF8

$ng = @($rows | Where-Object { $_.result -ne 'OK' })
Write-Host ''
Write-Host ('checked {0} pages at 375 / 768 / 1440px' -f $rows.Count)
Write-Host ('  passing : {0}' -f ($rows.Count - $ng.Count))
Write-Host ('  failing : {0}' -f $ng.Count)
foreach ($r in $ng) { Write-Host ('    {0,-14} {1}' -f $r.slug, $r.detail) }
Write-Host ('  report  : {0}' -f (Split-Path $outCsv -Leaf))

