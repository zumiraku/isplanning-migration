<#
  check-responsive.ps1 — Stage 5 verification

  Loads every converted free page at 375 / 768 / 1440 CSS px and fails any page
  that scrolls horizontally. Horizontal scroll is the single most common way a
  desktop-era page breaks on a phone, and the whole point of this migration is
  that it does not.

  Why it works this way: headless Chrome on Windows will not open a window
  narrower than about 485 CSS px, so a phone width cannot be tested by sizing
  the window. Measuring inside an iframe can be, and an iframe of width 375
  gives the embedded document a real 375px layout viewport, media queries and
  all. Reading across the frame boundary from file:// needs
  --allow-file-access-from-files.

  One browser launch per page, because headless ends its virtual time budget
  when the main frame first goes idle: a single run that walks all 83 pages
  sequentially reports a pass on the 82 it never measured.

  Usage:  .\tools\check-responsive.ps1
          .\tools\check-responsive.ps1 -Only page68
          .\tools\check-responsive.ps1 -Chrome "C:\path\to\chrome.exe"
#>

[CmdletBinding()]
param(
  [string]$Only = '',
  [string]$Chrome = '',
  [int]$TimeoutSec = 25
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

# window.FREEPAGES = ["a","b",...];
$js = [System.IO.File]::ReadAllText($pagesJs, [System.Text.Encoding]::UTF8)
$slugs = [regex]::Matches($js, '"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
if ($Only) { $slugs = $slugs | Where-Object { $_ -eq $Only } }
if (-not $slugs) { throw "no pages to check (Only='$Only')" }

$profile = Join-Path $env:TEMP ('rc-' + [guid]::NewGuid().ToString('N').Substring(0, 8))

# Setup is done; from here a stray line on Chrome's stderr must not end the run.
$ErrorActionPreference = 'Continue'
$rows = New-Object System.Collections.Generic.List[object]
$i = 0

foreach ($slug in $slugs) {
  $i++
  $url = 'file:///' + ((Join-Path $dir 'responsive-check.html') -replace '\\', '/') + '?page=' + $slug

  # Every concatenation parenthesised: inside an array literal, `+` binds looser
  # than the comma, so '--user-data-dir=' + $profile becomes TWO arguments and
  # Chrome reads the path as a second URL — "Multiple targets are not supported".
  $chromeArgs = @(
    '--headless=new', '--disable-gpu', '--no-sandbox', '--mute-audio',
    '--allow-file-access-from-files',
    # Without these, Chrome writes background-networking errors to stderr, and
    # PowerShell turns a native command's stderr into a terminating error.
    '--no-first-run', '--disable-background-networking', '--disable-sync',
    '--disable-default-apps', '--log-level=3',
    ('--user-data-dir=' + $profile),
    '--window-size=1200,1000',
    '--virtual-time-budget=20000',
    '--dump-dom', $url
  )

  # No 2>$null: redirecting a native command's stderr in PowerShell 5.1 wraps
  # each line in an ErrorRecord, which under ErrorActionPreference=Stop kills
  # the run 82 pages in. Stderr is left where it is and stdout is what we read.
  $dom = (& $Chrome @chromeArgs | Out-String)

  $title = ''
  $m = [regex]::Match($dom, '(?is)<title>(.*?)</title>')
  if ($m.Success) { $title = $m.Groups[1].Value }

  # "RC <slug> 1440:OK 375:NG(489>375)[form.searchbox] 768:OK"
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
