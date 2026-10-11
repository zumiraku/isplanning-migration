[CmdletBinding()]
param([int]$PerPage = 20)

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$shell   = Join-Path $root 'templates\creator\freepage-template.html'
function Repair-Markup([string]$html) {
  if (-not $html) { return $html }
  $stack = New-Object System.Collections.Generic.List[string]
  $sb    = New-Object System.Text.StringBuilder
  $void  = 'area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr'
  $pos   = 0
  foreach ($m in [regex]::Matches($html, '<\s*(/?)\s*([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>')) {
    $isClose = $m.Groups[1].Value -eq '/'
    $name    = $m.Groups[2].Value.ToLower()
    if ($name -match "^($void)$") { continue }
    if (-not $isClose -and $m.Groups[3].Value -match '/\s*$') { continue }
    if ($isClose) {
      $at = $stack.LastIndexOf($name)
      [void]$sb.Append($html.Substring($pos, $m.Index - $pos))
      if ($at -ge 0) {
        for ($i = $stack.Count - 1; $i -gt $at; $i--) { [void]$sb.Append('</' + $stack[$i] + '>') }
        [void]$sb.Append($m.Value)
        $stack.RemoveRange($at, $stack.Count - $at)
      }
      $pos = $m.Index + $m.Length
    } else {
      [void]$stack.Add($name)
    }
  }
  [void]$sb.Append($html.Substring($pos))
  for ($i = $stack.Count - 1; $i -ge 0; $i--) { [void]$sb.Append('</' + $stack[$i] + '>') }
  return $sb.ToString()
}

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

function MetaFromBody([string]$html) {
  $t = [regex]::Replace($html, '(?s)<[^>]+>', '')
  $t = [regex]::Replace($t, '&nbsp;', ' ')
  $t = [regex]::Replace($t, '\s+', ' ').Trim()
  if ($t.Length -gt 120) { $t = $t.Substring(0, 120) }
  return $t
}

function IsoDate([string]$d) {
  if ($d -match '^(\d{4})/(\d{2})/(\d{2})$') { return "$($Matches[1])-$($Matches[2])-$($Matches[3])" }
  return $d
}

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
$page = [regex]::Replace($page, 'href="((?:page\d+|info|company|ordercontract|privacy)\.html)', 'href="freepages/$1')
[System.IO.File]::WriteAllText((Join-Path $outDir 'news-list.html'), $page, $enc)

$a = $rows[0]
$next = $rows[1]
$bodyPath = Join-Path $bodyDir ($a.slug + '.html')
$body = ''
if (Test-Path $bodyPath) { $body = Repair-Markup ([System.IO.File]::ReadAllText($bodyPath, $utf8)) }

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
$page = [regex]::Replace($page, 'href="((?:page\d+|info|company|ordercontract|privacy)\.html)', 'href="freepages/$1')
[System.IO.File]::WriteAllText((Join-Path $outDir 'news-detail.html'), $page, $enc)

Write-Host ('news-list.html   : {0} of {1} articles, {2} pages at {3}/page' -f `
  ([math]::Min($PerPage, $rows.Count)), $rows.Count, $pages, $PerPage)
Write-Host ('news-detail.html : {0} ({1})' -f $a.slug, $a.date)
Write-Host ('  meta description rebuilt from the body, tags stripped: {0} chars' -f (MetaFromBody $body).Length)

