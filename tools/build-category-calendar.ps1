<#
  build-category-calendar.ps1 — the calendar category page (C25)

  One of the five pages the client flagged as 変わった作りのページ:
  https://www.isp-sp.com/shopbrand/051/O/

  It is not a normal category listing. It is a hand-built 3-column
  <table class="calender_List"> of curated products sitting under two
  business-day calendars, all of it inside the category free space. There is no
  Creator Mode variable tag that reproduces an arbitrary curated list (C16), so
  the layout is rebuilt as template markup and the content is carried across.

  Everything on the rendered page comes out of the archive - the closed days, the
  25 product cells, the intro copy - so what is reviewed is the real page, not an
  impression of it.

  Two things deliberately change:

    * The 3-column table becomes a responsive card grid. At 375px a 3-column
      table of product photos is unusable, and this is a page people reach from
      a phone in Q4 when they are buying next year's calendars.
    * The NEW badge stops being <SPAN style="color: yellow;">, which is yellow
      text on a white background - invisible on the live site today. It becomes
      the design system's .badge--new.

  Input   snapshot/desktop/shopbrand_051_O.*.html   raw EUC-JP as captured
          templates/creator/freepage-template.html  the page shell
  Output  templates/creator/preview/category-calendar.html

  Saved WITH a UTF-8 BOM: it carries Japanese literals and PowerShell 5.1 reads a
  BOM-less UTF-8 script as ANSI.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$root  = Split-Path -Parent $PSScriptRoot
$src   = Get-ChildItem (Join-Path $root 'snapshot\desktop\shopbrand_051_O.*.html') | Select-Object -First 1
$shell = Join-Path $root 'templates\creator\freepage-template.html'
$out   = Join-Path $root 'templates\creator\preview\category-calendar.html'

$euc  = [System.Text.Encoding]::GetEncoding(51932)
$utf8 = [System.Text.Encoding]::UTF8
$enc  = New-Object System.Text.UTF8Encoding($false)

$html = $euc.GetString([System.IO.File]::ReadAllBytes($src.FullName))
$tpl  = [System.IO.File]::ReadAllText($shell, $utf8)

function HtmlEscape([string]$s) {
  if ($null -eq $s) { return '' }
  return $s.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}

# ---------------------------------------------------------------------------
# 1. The two business-day calendars.
#    Platform output: a header table carrying "2026年 08月", then a grid whose
#    closed days are marked only by bgcolor=#cccccc. Colour as the sole carrier
#    of meaning is why the rebuild adds a text label for screen readers.
# ---------------------------------------------------------------------------
$calBlocks = [regex]::Matches($html, '(?is)<div class="calendar_\d">(.*?)</div>')
$calendars = @()
foreach ($b in $calBlocks) {
  $inner = $b.Groups[1].Value
  $label = ''
  $m = [regex]::Match($inner, '(?s)<b>(\d{4})年\s*(\d{2})月</b>')
  if ($m.Success) { $label = $m.Groups[1].Value + '年' + [int]$m.Groups[2].Value + '月' }

  $closed = @()
  foreach ($c in [regex]::Matches($inner, '(?is)<td[^>]*bgcolor=#cccccc[^>]*>\s*(\d{1,2})\s*<')) {
    $closed += [int]$c.Groups[1].Value
  }
  $open = @()
  foreach ($c in [regex]::Matches($inner, '(?is)<td[^>]*bgcolor=#FFFFFF[^>]*>\s*(\d{1,2})\s*<')) {
    $open += [int]$c.Groups[1].Value
  }
  if ($label) {
    $calendars += [pscustomobject]@{ label = $label; closed = $closed; open = $open }
  }
}

# ---------------------------------------------------------------------------
# 2. The 25 curated product cells.
# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Cell by cell, never across a </td>.
#
# The first version matched name, link and image in one expression spanning the
# whole cell. Where a cell's markup differs slightly - one has <br /> between the
# image and its caption - that expression fails at that cell and the lazy (.*?)
# in the name group expands across the boundary into the NEXT cell, producing a
# card carrying one product's name with another product's image and link. On a
# shop page that sends the customer to the wrong product, so it is worse than
# dropping the row. Cells are isolated first, then parsed independently.
$items = @()
$skipped = 0
foreach ($cellM in [regex]::Matches($html, '(?is)<td>((?:(?!</td>).)*)</td>')) {
  $cell = $cellM.Groups[1].Value
  if ($cell -notmatch 'calender_name') { continue }

  $nm = [regex]::Match($cell, '(?is)<p class="calender_name">(.*?)</p>')
  $am = [regex]::Match($cell, '(?is)<a\s+href="([^"]+)"')
  $im = [regex]::Match($cell, '(?is)<img[^>]*src="([^"]+)"')
  if (-not ($nm.Success -and $am.Success -and $im.Success)) { $skipped++; continue }

  $nameHtml = $nm.Groups[1].Value
  $isNew = ($nameHtml -match 'color:\s*yellow') -or ($nameHtml -match 'NEW')
  $plain = [regex]::Replace($nameHtml, '(?s)<br\s*/?>', '|')
  $plain = [regex]::Replace($plain, '(?s)<[^>]+>', '')
  $parts = $plain -split '\|'
  $name = $parts[0].Trim().TrimStart([char]0x25A0)
  $code = ''
  if ($parts.Count -gt 1) { $code = (($parts[1] -replace 'NEW!?', '')).Trim() }

  $items += [pscustomobject]@{
    name = $name
    code = $code
    href = $am.Groups[1].Value
    img  = $im.Groups[1].Value
    isNew = $isNew
  }
}

# ---------------------------------------------------------------------------
# 3. The intro copy, taken verbatim.
# ---------------------------------------------------------------------------
$intro = @()
foreach ($p in [regex]::Matches($html, '(?is)<p>(表示価格は税別です。.*?)</p>|<p>(2027年卓上カレンダー販売中です。.*?)</p>')) {
  $t = $p.Groups[1].Value + $p.Groups[2].Value
  $t = [regex]::Replace($t, '(?s)<br\s*/?>', "`n")
  $t = [regex]::Replace($t, '(?s)<[^>]+>', '').Trim()
  if ($t) { $intro += $t }
}

# ---------------------------------------------------------------------------
# 4. Render
# ---------------------------------------------------------------------------
$sb = New-Object System.Text.StringBuilder

foreach ($t in $intro) {
  [void]$sb.AppendLine('  <p class="lede">' + (HtmlEscape $t).Replace("`n", '<br>') + '</p>')
}

[void]$sb.AppendLine('  <h2 class="h-section">営業日カレンダー</h2>')
[void]$sb.AppendLine('  <div class="calgrid">')
foreach ($c in $calendars) {
  [void]$sb.AppendLine('    <aside class="calendar">')
  [void]$sb.AppendLine('      <h3>' + (HtmlEscape $c.label) + '</h3>')
  [void]$sb.AppendLine('      <table>')
  [void]$sb.AppendLine('        <thead><tr><th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th></tr></thead>')
  [void]$sb.AppendLine('        <tbody>')

  # All days in the month, in order, with the closed ones marked. The original
  # relied on cell background alone; each closed cell now also carries a label
  # that only assistive technology reads.
  $all = @()
  $all += $c.closed
  $all += $c.open
  # Month length comes from the calendar, not from the cells we managed to
  # scrape. Deriving it from captured days silently truncated August at the 30th
  # and September at the 27th - a business-day calendar missing the end of the
  # month is wrong information, not just a rendering slip.
  $closedSet = @{}
  foreach ($d in $c.closed) { $closedSet[$d] = $true }

  # Work out the leading blank cells from the first day's weekday.
  $monthNum = [int](($c.label -split '年')[1] -replace '月', '')
  $yearNum  = [int](($c.label -split '年')[0])
  $first = Get-Date -Year $yearNum -Month $monthNum -Day 1
  $lead = [int]$first.DayOfWeek
  $maxDay = [DateTime]::DaysInMonth($yearNum, $monthNum)

  [void]$sb.Append('          <tr>')
  for ($i = 0; $i -lt $lead; $i++) { [void]$sb.Append('<td></td>') }
  $col = $lead
  for ($d = 1; $d -le $maxDay; $d++) {
    if ($col -eq 7) { [void]$sb.AppendLine('</tr>'); [void]$sb.Append('          <tr>'); $col = 0 }
    if ($closedSet.ContainsKey($d)) {
      [void]$sb.Append('<td class="is-closed">' + $d + '<span class="visually-hidden">休業日</span></td>')
    } else {
      [void]$sb.Append('<td>' + $d + '</td>')
    }
    $col++
  }
  while ($col -lt 7) { [void]$sb.Append('<td></td>'); $col++ }
  [void]$sb.AppendLine('</tr>')
  [void]$sb.AppendLine('        </tbody>')
  [void]$sb.AppendLine('      </table>')
  [void]$sb.AppendLine('      <p class="calendar__key"><span><i></i>休業日（ご注文は24時間受付）</span></p>')
  [void]$sb.AppendLine('    </aside>')
}
[void]$sb.AppendLine('  </div>')

[void]$sb.AppendLine('  <h2 class="h-section">卓上カレンダー一覧</h2>')
[void]$sb.AppendLine('  <ul class="grid">')
foreach ($it in $items) {
  [void]$sb.Append('    <li class="card"><a href="' + (HtmlEscape $it.href) + '">')
  [void]$sb.Append('<div class="card__media">')
  if ($it.isNew) { [void]$sb.Append('<div class="card__flags"><span class="badge badge--new">NEW</span></div>') }
  [void]$sb.Append('<img loading="lazy" decoding="async" src="' + (HtmlEscape $it.img) + '" alt="' + (HtmlEscape $it.name) + '"></div>')
  [void]$sb.Append('<div class="card__body">')
  if ($it.code) { [void]$sb.Append('<span class="card__code">' + (HtmlEscape $it.code) + '</span>') }
  [void]$sb.Append('<span class="card__name">' + (HtmlEscape $it.name) + '</span>')
  [void]$sb.Append('</div></a></li>')
  [void]$sb.AppendLine('')
}
[void]$sb.AppendLine('  </ul>')

$title = '卓上カレンダー｜粗品・景品の発見マーケット'
$page = $tpl
$page = $page.Replace('{{TITLE}}',       $title)
$page = $page.Replace('{{DESCRIPTION}}', '2027年の卓上カレンダーを名入れ対応で承ります。営業日カレンダーもあわせてご確認ください。')
$page = $page.Replace('{{CANONICAL}}',   'https://www.isp-sp.com/shopbrand/051/O/')
$page = $page.Replace('{{HEADING}}',     '卓上カレンダー')
$page = $page.Replace('{{ARCHETYPE}}',   'category-calendar')
$page = $page.Replace('{{BREADCRUMB}}',  '<li>卓上カレンダー</li>')
$page = $page.Replace('{{CSSPATH}}',     '../css/')
$page = $page.Replace('{{CONTENT}}',     $sb.ToString())
$page = $page.Replace('href="../top.html"', 'href="top.html"')
$page = $page.Replace('href="info.html"', 'href="freepages/info.html"')
$page = $page.Replace('href="ordercontract.html"', 'href="freepages/ordercontract.html"')
$page = $page.Replace('href="company.html"', 'href="freepages/company.html"')
$page = $page.Replace('href="page1.html"', 'href="freepages/page1.html"')

[System.IO.File]::WriteAllText($out, $page, $enc)

Write-Host ('source     : {0}' -f $src.Name)
Write-Host ('calendars  : {0}' -f $calendars.Count)
foreach ($c in $calendars) {
  Write-Host ('  {0}  closed: {1}' -f $c.label, ($c.closed -join ' '))
}
Write-Host ('products   : {0}  (NEW badges: {1})' -f $items.Count, ($items | Where-Object { $_.isNew }).Count)
Write-Host ('intro paras: {0}' -f $intro.Count)
Write-Host ('written    : templates\creator\preview\category-calendar.html')
