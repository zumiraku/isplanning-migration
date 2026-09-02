<#
  build-freepage-previews.ps1 — Stage 5 review build

  Renders every converted free-page fragment into the full page shell so the
  result can actually be looked at, at every width, before any of it goes near
  the console. Also writes an index so all 83 can be walked in one sitting.

  This is the Gate C artefact: the client asked for テンプレート化 and 見やすく,
  which is a judgement he can only make by seeing the pages.

  Inputs   templates/creator/freepage-template.html   the shell
           templates/creator/freepages/*.html         converted fragments
           inventory/freepage-conversion-report.csv    headings + review flags
           inventory/freepage-archetypes.csv           archetype per page
           inventory/freepage-seo-plan.csv             the new titles

  Output   templates/creator/preview/freepages/*.html
           templates/creator/preview/freepages/index.html

  No Japanese string literals live in this file: PowerShell 5.1 reads a BOM-less
  UTF-8 script as ANSI, so every piece of Japanese comes from the template or
  from the CSVs, read with an explicit UTF-8 decode.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$root      = Split-Path -Parent $PSScriptRoot
$shellPath = Join-Path $root 'templates\creator\freepage-template.html'
$fragDir   = Join-Path $root 'templates\creator\freepages'
$outDir    = Join-Path $root 'templates\creator\preview\freepages'

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$utf8 = [System.Text.Encoding]::UTF8
$enc  = New-Object System.Text.UTF8Encoding($false)

$shell = [System.IO.File]::ReadAllText($shellPath, $utf8)

$report     = Import-Csv (Join-Path $root 'inventory\freepage-conversion-report.csv')
$archetypes = Import-Csv (Join-Path $root 'inventory\freepage-archetypes.csv')
$seoPlan    = Import-Csv (Join-Path $root 'inventory\freepage-seo-plan.csv')

$archBySlug = @{}
foreach ($a in $archetypes) { $archBySlug[$a.slug] = $a }
$seoBySlug = @{}
foreach ($s in $seoPlan) { $seoBySlug[$s.slug] = $s }

function HtmlEscape([string]$s) {
  if ($null -eq $s) { return '' }
  return $s.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}

$rows = New-Object System.Collections.Generic.List[object]

foreach ($r in $report) {
  $slug = $r.slug
  $fragPath = Join-Path $fragDir ($slug + '.html')
  if (-not (Test-Path $fragPath)) { continue }
  $content = [System.IO.File]::ReadAllText($fragPath, $utf8)

  $arch = 'article'
  if ($archBySlug.ContainsKey($slug) -and $archBySlug[$slug].archetype) { $arch = $archBySlug[$slug].archetype }

  # Title: the SEO plan's proposal where it made one, otherwise what is there now.
  $title = ''
  if ($seoBySlug.ContainsKey($slug)) {
    $title = $seoBySlug[$slug].proposed_title
    if (-not $title) { $title = $seoBySlug[$slug].current_title }
  }
  if (-not $title -and $archBySlug.ContainsKey($slug)) { $title = $archBySlug[$slug].title }

  # Heading: what the converter lifted out of the body. Where it found none,
  # take the first heading that appears anywhere in the fragment; only if there
  # is none at all does the title get used, trimmed at its first separator.
  #
  # The separators are built from code points, not typed as literals: PowerShell
  # 5.1 reads this BOM-less UTF-8 file as ANSI, so a literal ｜ in the pattern
  # arrives mangled and matches nothing — which is why an entire 45-character
  # SEO title was being rendered as an <h1>.
  $heading = $r.page_heading
  if (-not $heading) {
    $mh = [regex]::Match($content, '(?is)<h[1-4][^>]*>(.*?)</h[1-4]>')
    if ($mh.Success) {
      $heading = [regex]::Replace($mh.Groups[1].Value, '(?s)<[^>]+>', '').Trim()
    }
  }
  if (-not $heading -and $title) {
    $seps = @(0xFF5C, 0x3010, 0xFF5E, 0x301C, 0x7C, 0x5B) | ForEach-Object { [regex]::Escape([string][char]$_) }
    $heading = (($title -split ($seps -join '|'))[0]).Trim()
  }

  $desc = ''
  if ($archBySlug.ContainsKey($slug)) { $desc = $archBySlug[$slug].title }

  $page = $shell
  $page = $page.Replace('{{TITLE}}',       (HtmlEscape $title))
  $page = $page.Replace('{{DESCRIPTION}}', (HtmlEscape $desc))
  $page = $page.Replace('{{CANONICAL}}',   'https://www.isp-sp.com/html/' + $slug + '.html')
  $page = $page.Replace('{{HEADING}}',     (HtmlEscape $heading))
  $page = $page.Replace('{{ARCHETYPE}}',   $arch)
  $page = $page.Replace('{{BREADCRUMB}}',  '<li>' + (HtmlEscape $heading) + '</li>')
  $page = $page.Replace('{{CSSPATH}}',     '../../css/')
  $page = $page.Replace('{{CONTENT}}',     $content)

  [System.IO.File]::WriteAllText((Join-Path $outDir ($slug + '.html')), $page, $enc)

  $rows.Add([pscustomobject]@{
    slug      = $slug
    archetype = $arch
    heading   = $heading
    title     = $title
    titleLen  = $title.Length
    bytes     = [int]$r.bytes_out
    images    = [int]$r.images
    tables    = [int]$r.tables
    review    = $r.review
    unmapped  = [int]$r.classes_unmapped
    fpLinks   = [int]$r.freepage_links
  })
}

# ---------------------------------------------------------------------------
# The index. Built with a StringBuilder rather than string concatenation in a
# loop, and with every value HTML-escaped: these titles contain & and ～.
# ---------------------------------------------------------------------------
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<!doctype html>')
[void]$sb.AppendLine('<html lang="ja"><head><meta charset="utf-8">')
[void]$sb.AppendLine('<meta name="viewport" content="width=device-width, initial-scale=1">')
[void]$sb.AppendLine('<title>Free page review index</title>')
[void]$sb.AppendLine('<link rel="stylesheet" href="../../css/tokens.css">')
[void]$sb.AppendLine('<link rel="stylesheet" href="../../css/components.css">')
[void]$sb.AppendLine('<style>')
[void]$sb.AppendLine('body{font:14px/1.6 system-ui,sans-serif;margin:0;padding:24px;background:#f6f7f9;color:#16181d}')
[void]$sb.AppendLine('h1{font-size:20px;margin:0 0 4px}.sub{color:#5a616e;margin:0 0 20px}')
[void]$sb.AppendLine('table{border-collapse:collapse;width:100%;background:#fff;font-size:13px}')
[void]$sb.AppendLine('th,td{border:1px solid #dfe3ea;padding:6px 8px;text-align:left;vertical-align:top}')
[void]$sb.AppendLine('th{background:#eef1f6;position:sticky;top:0}')
[void]$sb.AppendLine('td.num{text-align:right;font-variant-numeric:tabular-nums}')
[void]$sb.AppendLine('tr.flag{background:#fff8e6}')
[void]$sb.AppendLine('.tile{display:inline-block;background:#fff;border:1px solid #dfe3ea;border-radius:8px;padding:10px 14px;margin:0 8px 16px 0}')
[void]$sb.AppendLine('.tile b{display:block;font-size:22px}')
[void]$sb.AppendLine('.long{color:#b3261e;font-weight:700}')
[void]$sb.AppendLine('</style></head><body>')
[void]$sb.AppendLine('<h1>Free page review index</h1>')
[void]$sb.AppendLine('<p class="sub">83 converted pages in the Creator Mode shell. Check each at 375px, 768px and 1440px. Titles over 60 characters truncate in search results and are marked.</p>')

$byArch = $rows | Group-Object archetype | Sort-Object Count -Descending
foreach ($g in $byArch) {
  [void]$sb.AppendLine('<span class="tile"><b>' + $g.Count + '</b>' + (HtmlEscape $g.Name) + '</span>')
}
[void]$sb.AppendLine('<span class="tile"><b>' + ($rows | Where-Object { $_.review }).Count + '</b>flagged for review</span>')
[void]$sb.AppendLine('<span class="tile"><b>' + ($rows | Where-Object { $_.titleLen -gt 60 }).Count + '</b>titles over 60 chars</span>')

[void]$sb.AppendLine('<table><thead><tr><th>page</th><th>archetype</th><th>heading</th><th>title</th><th>len</th><th>KB</th><th>img</th><th>tbl</th><th>unmapped</th><th>/html/ links</th><th>review</th></tr></thead><tbody>')
foreach ($row in ($rows | Sort-Object archetype, slug)) {
  $cls = ''
  if ($row.review) { $cls = ' class="flag"' }
  $lenCls = ''
  if ($row.titleLen -gt 60) { $lenCls = ' class="long"' }
  [void]$sb.Append('<tr' + $cls + '>')
  [void]$sb.Append('<td><a href="' + $row.slug + '.html">' + (HtmlEscape $row.slug) + '</a></td>')
  [void]$sb.Append('<td>' + (HtmlEscape $row.archetype) + '</td>')
  [void]$sb.Append('<td>' + (HtmlEscape $row.heading) + '</td>')
  [void]$sb.Append('<td>' + (HtmlEscape $row.title) + '</td>')
  [void]$sb.Append('<td' + $lenCls + '>' + $row.titleLen + '</td>')
  [void]$sb.Append('<td class="num">' + [math]::Round($row.bytes / 1024.0, 1) + '</td>')
  [void]$sb.Append('<td class="num">' + $row.images + '</td>')
  [void]$sb.Append('<td class="num">' + $row.tables + '</td>')
  [void]$sb.Append('<td class="num">' + $row.unmapped + '</td>')
  [void]$sb.Append('<td class="num">' + $row.fpLinks + '</td>')
  [void]$sb.Append('<td>' + (HtmlEscape $row.review) + '</td>')
  [void]$sb.AppendLine('</tr>')
}
[void]$sb.AppendLine('</tbody></table></body></html>')

[System.IO.File]::WriteAllText((Join-Path $outDir 'index.html'), $sb.ToString(), $enc)

# The page list, for the responsive checker to iterate.
$listJs = New-Object System.Text.StringBuilder
[void]$listJs.AppendLine('/* GENERATED by tools\build-freepage-previews.ps1 */')
[void]$listJs.Append('window.FREEPAGES = [')
$first = $true
foreach ($row in ($rows | Sort-Object slug)) {
  if (-not $first) { [void]$listJs.Append(',') }
  [void]$listJs.Append('"' + $row.slug + '"')
  $first = $false
}
[void]$listJs.AppendLine('];')
[System.IO.File]::WriteAllText((Join-Path $outDir 'pages.js'), $listJs.ToString(), $enc)

Write-Host ('built {0} preview pages -> templates\creator\preview\freepages\' -f $rows.Count)
Write-Host ('  flagged for review    : {0}' -f ($rows | Where-Object { $_.review }).Count)
Write-Host ('  titles over 60 chars  : {0}' -f ($rows | Where-Object { $_.titleLen -gt 60 }).Count)
Write-Host ('  pages with no heading : {0}' -f ($rows | Where-Object { -not $_.heading }).Count)
Write-Host ('  index                 : preview\freepages\index.html')
