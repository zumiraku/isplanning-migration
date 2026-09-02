<#
  build-news-previews.ps1 — the ニュース一覧 / ニュース詳細 templates

  Renders the two news templates with the shop's own articles in them, so they can
  be reviewed against something real rather than lorem ipsum.

  If Q4 holds — and the archive says it does — these are the only two things this
  project needs to build for /new/. The 100 articles stay in the platform's news
  store and the URLs do not move.

  What the detail template fixes, in one place for all 100:
  the meta description. 96 of the current pages have raw HTML tags inside it
  (S0-12), which is what shows under the title in search results. The template
  strips tags and truncates on a character count instead.

  Input   inventory/news-articles.csv          from tools\extract-news.ps1
          templates/basic-export/news/*.html   the article bodies
  Output  templates/creator/preview/news-list.html
          templates/creator/preview/news-detail.html

  NOTE: this file is saved WITH a UTF-8 BOM, and must stay that way. It is the
  one tool here that carries Japanese string literals, and PowerShell 5.1 reads a
  BOM-less UTF-8 script as ANSI — without the BOM every Japanese literal below
  becomes mojibake and the script does not even parse. The other tools avoid the
  problem by keeping Japanese out entirely (code points, or the HTML template).
#>

[CmdletBinding()]
param([int]$PerPage = 20)

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$shell   = Join-Path $root 'templates\creator\freepage-template.html'
$bodyDir = Join-Path $root 'templates\basic-export\news'
$outDir  = Join-Path $root 'templates\creator\preview'

$utf8 = [System.Text.Encoding]::UTF8
$enc  = New-Object System.Text.UTF8Encoding($false)

$tpl  = [System.IO.File]::ReadAllText($shell, $utf8)
$rows = Import-Csv (Join-Path $root 'inventory\news-articles.csv') |
        Where-Object { $_.category -ne 'index-page' } |
        Sort-Object date -Descending

function HtmlEscape([string]$s) {
  if ($null -eq $s) { return '' }
  return $s.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}

# The meta-description fix, applied here so it is visible in the preview and
# specified for the template: strip every tag, collapse whitespace, cut to 120.
function MetaFromBody([string]$html) {
  $t = [regex]::Replace($html, '(?s)<[^>]+>', '')
  $t = [regex]::Replace($t, '&nbsp;', ' ')
  $t = [regex]::Replace($t, '\s+', ' ').Trim()
  if ($t.Length -gt 120) { $t = $t.Substring(0, 120) }
  return $t
}

function IsoDate([string]$d) {
  # 2026/07/28 -> 2026-07-28
  if ($d -match '^(\d{4})/(\d{2})/(\d{2})$') { return "$($Matches[1])-$($Matches[2])-$($Matches[3])" }
  return $d
}

# ---------------------------------------------------------------------------
# ニュース一覧
# ---------------------------------------------------------------------------
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('  <ul class="newslist">')
foreach ($r in ($rows | Select-Object -First $PerPage)) {
  [void]$sb.AppendLine('    <li><a href="news-detail.html">' +
    '<time datetime="' + (IsoDate $r.date) + '">' + (HtmlEscape $r.date) + '</time>' +
    '<span>' + (HtmlEscape $r.title) + '</span></a></li>')
}
[void]$sb.AppendLine('  </ul>')

$pages = [math]::Ceiling($rows.Count / [double]$PerPage)
[void]$sb.AppendLine('  <ul class="pager">')
[void]$sb.AppendLine('    <li><span aria-current="page">1</span></li>')
for ($p = 2; $p -le [math]::Min($pages, 5); $p++) {
  [void]$sb.AppendLine('    <li><a href="#">' + $p + '</a></li>')
}
if ($pages -gt 5) { [void]$sb.AppendLine('    <li><a href="#">' + $pages + '</a></li>') }
[void]$sb.AppendLine('  </ul>')

$listTitle = 'お知らせ一覧'
$page = $tpl
$page = $page.Replace('{{TITLE}}',       $listTitle + '｜粗品・景品の発見マーケット')
$page = $page.Replace('{{DESCRIPTION}}', '発見マーケットからのお知らせ一覧です。')
$page = $page.Replace('{{CANONICAL}}',   'https://www.isp-sp.com/new/index.html')
$page = $page.Replace('{{HEADING}}',     $listTitle)
$page = $page.Replace('{{ARCHETYPE}}',   'news-list')
$page = $page.Replace('{{BREADCRUMB}}',  '<li>' + $listTitle + '</li>')
$page = $page.Replace('{{CSSPATH}}',     '../css/')
$page = $page.Replace('{{CONTENT}}',     $sb.ToString())
$page = $page.Replace('href="../top.html"', 'href="top.html"')
$page = $page.Replace('href="info.html"', 'href="freepages/info.html"')
$page = $page.Replace('href="ordercontract.html"', 'href="freepages/ordercontract.html"')
$page = $page.Replace('href="company.html"', 'href="freepages/company.html"')
$page = $page.Replace('href="page1.html"', 'href="freepages/page1.html"')
[System.IO.File]::WriteAllText((Join-Path $outDir 'news-list.html'), $page, $enc)

# ---------------------------------------------------------------------------
# ニュース詳細 — the most recent article, with the real neighbours either side
# ---------------------------------------------------------------------------
$a = $rows[0]
$next = $rows[1]
$bodyPath = Join-Path $bodyDir ($a.slug + '.html')
$body = ''
if (Test-Path $bodyPath) { $body = [System.IO.File]::ReadAllText($bodyPath, $utf8) }

$d = New-Object System.Text.StringBuilder
[void]$d.AppendLine('  <p class="newsmeta"><time datetime="' + (IsoDate $a.date) + '">' + (HtmlEscape $a.date) + '</time></p>')
[void]$d.AppendLine($body)
[void]$d.AppendLine('  <nav class="newsnav">')
[void]$d.AppendLine('    <a class="btn btn--ghost" href="news-list.html">お知らせ一覧へ</a>')
if ($next) {
  [void]$d.AppendLine('    <a class="newsnav__next" href="#"><small>前の記事</small>' + (HtmlEscape $next.title) + '</a>')
}
[void]$d.AppendLine('  </nav>')

$page = $tpl
$page = $page.Replace('{{TITLE}}',       (HtmlEscape $a.title) + '｜粗品・景品の発見マーケット')
$page = $page.Replace('{{DESCRIPTION}}', (HtmlEscape (MetaFromBody $body)))
$page = $page.Replace('{{CANONICAL}}',   'https://www.isp-sp.com/new/' + $a.slug + '.html')
$page = $page.Replace('{{HEADING}}',     (HtmlEscape $a.title))
$page = $page.Replace('{{ARCHETYPE}}',   'news-detail')
$page = $page.Replace('{{BREADCRUMB}}',  '<li><a href="news-list.html">お知らせ</a></li><li>' + (HtmlEscape $a.title) + '</li>')
$page = $page.Replace('{{CSSPATH}}',     '../css/')
$page = $page.Replace('{{CONTENT}}',     $d.ToString())
$page = $page.Replace('href="../top.html"', 'href="top.html"')
$page = $page.Replace('href="info.html"', 'href="freepages/info.html"')
$page = $page.Replace('href="ordercontract.html"', 'href="freepages/ordercontract.html"')
$page = $page.Replace('href="company.html"', 'href="freepages/company.html"')
$page = $page.Replace('href="page1.html"', 'href="freepages/page1.html"')
[System.IO.File]::WriteAllText((Join-Path $outDir 'news-detail.html'), $page, $enc)

Write-Host ('news-list.html   : {0} of {1} articles, {2} pages at {3}/page' -f `
  ([math]::Min($PerPage, $rows.Count)), $rows.Count, $pages, $PerPage)
Write-Host ('news-detail.html : {0} ({1})' -f $a.slug, $a.date)
Write-Host ('  meta description rebuilt from the body, tags stripped: {0} chars' -f (MetaFromBody $body).Length)
