<#
  extract-news.ps1 — the /new/ archive

  Pulls the article out of each archived news page and classifies it, so the
  consolidation decision the client was asked for at Gate A can be made from the
  actual content rather than from titles.

  The pages are MakeShop's ニュース feature output and the markup is uniform:

      <div class="rightContents" id="news">
        <div class="section" id="r_news">
          <div id="newsHead"><span class="date">2013/08/01</span>TITLE</div>
          <div id="newsContents"> ARTICLE </div>

  100 of the 101 archived files carry it; the 101st is /new/index.html, the list
  page (#newsList). That is worth recording on its own — see docs/news-plan.md.

  Input   snapshot/desktop/new_*.html   raw EUC-JP bytes as captured
  Output  templates/basic-export/news/<date>.html   article bodies, UTF-8
          inventory/news-articles.csv               one row per article

  No Japanese string literals: PowerShell 5.1 reads this BOM-less UTF-8 file as
  ANSI, so every Japanese pattern below is built from code points.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$root   = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $root 'snapshot\desktop'
$dstDir = Join-Path $root 'templates\basic-export\news'
$outCsv = Join-Path $root 'inventory\news-articles.csv'

if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }

$euc  = [System.Text.Encoding]::GetEncoding(51932)   # EUC-JP
$enc  = New-Object System.Text.UTF8Encoding($false)

function Chars([int[]]$points) { -join ($points | ForEach-Object { [char]$_ }) }

# Classification keywords, from code points.
$KW = @{
  closure   = Chars 0x4F11, 0x696D                                  # 休業
  newyear   = Chars 0x5E74, 0x672B, 0x5E74, 0x59CB                  # 年末年始
  summer    = Chars 0x590F, 0x5B63                                  # 夏季
  summer2   = Chars 0x590F, 0x671F                                  # 夏期
  goldenwk  = Chars 0x30B4, 0x30FC, 0x30EB, 0x30C7, 0x30F3          # ゴールデン
  renewal   = Chars 0x30EA, 0x30CB, 0x30E5, 0x30FC, 0x30A2, 0x30EB  # リニューアル
  price     = Chars 0x4FA1, 0x683C                                  # 価格
  raise     = Chars 0x5024, 0x4E0A, 0x3052                          # 値上げ
  newitem   = Chars 0x65B0, 0x5546, 0x54C1                          # 新商品
  catalog   = Chars 0x30AB, 0x30BF, 0x30ED, 0x30B0                  # カタログ
  delivery  = Chars 0x914D, 0x9001                                  # 配送
}

$rows = New-Object System.Collections.Generic.List[object]

foreach ($f in (Get-ChildItem (Join-Path $srcDir 'new_*.html') | Sort-Object Name)) {
  $html = $euc.GetString([System.IO.File]::ReadAllBytes($f.FullName))

  # new_2013-08-01-173816.html.95B356D9.html -> 2013-08-01-173816
  $slug = ($f.Name -replace '^new_', '') -replace '\.html\..*$', ''

  if ($html -notmatch 'id="newsHead"') {
    $rows.Add([pscustomobject]@{
      slug = $slug; url = 'https://www.isp-sp.com/new/' + $slug + '.html'
      date = ''; title = ''; body_len = 0; links = 0; images = 0
      category = 'index-page'; duplicate_of = ''; action = 'list template'
      body_text = ''
    })
    continue
  }

  $head = [regex]::Match($html, '(?is)<div id="newsHead">(.*?)</div>')
  $date = ''
  $title = ''
  if ($head.Success) {
    $inner = $head.Groups[1].Value
    $d = [regex]::Match($inner, '(?is)<span class="date">(.*?)</span>')
    if ($d.Success) { $date = $d.Groups[1].Value.Trim() }
    $title = [regex]::Replace($inner, '(?is)<span class="date">.*?</span>', '')
    $title = [regex]::Replace($title, '(?s)<[^>]+>', '').Trim()
  }

  $body = ''
  $c = [regex]::Match($html, '(?is)<div id="newsContents">(.*?)(?:<!--\s*<p id="newsAccess"|<hr\b|</div>\s*<hr)')
  if ($c.Success) { $body = $c.Groups[1].Value }
  else {
    $c2 = [regex]::Match($html, '(?is)<div id="newsContents">(.*?)</div>')
    if ($c2.Success) { $body = $c2.Groups[1].Value }
  }
  $body = $body.Trim()

  $links  = ([regex]::Matches($body, '(?i)<a\s')).Count
  $images = ([regex]::Matches($body, '(?i)<img\s')).Count
  $text   = [regex]::Replace($body, '(?s)<[^>]+>', '')
  $text   = [regex]::Replace($text, '\s+', ' ').Trim()

  # Title first, body only as a fallback: a closure notice that happens to
  # mention a catalogue is still a closure notice, and a plain `if` cascade lets
  # the last test win, which mislabelled 57 of the 100 as product news.
  # Closure is the most specific classification here, so it is tested first.
  $hay = $title
  if (-not $hay) { $hay = $text }

  $category = 'other'
  if     ($hay.Contains($KW.newyear))  { $category = 'closure-newyear' }
  elseif ($hay.Contains($KW.summer) -or $hay.Contains($KW.summer2)) { $category = 'closure-summer' }
  elseif ($hay.Contains($KW.closure) -or $hay.Contains($KW.goldenwk)) { $category = 'closure' }
  elseif ($hay.Contains($KW.renewal)) { $category = 'renewal' }
  elseif ($hay.Contains($KW.price) -or $hay.Contains($KW.raise)) { $category = 'pricing' }
  elseif ($hay.Contains($KW.newitem) -or $hay.Contains($KW.catalog)) { $category = 'product' }

  [System.IO.File]::WriteAllText((Join-Path $dstDir ($slug + '.html')), $body, $enc)

  $rows.Add([pscustomobject]@{
    slug         = $slug
    url          = 'https://www.isp-sp.com/new/' + $slug + '.html'
    date         = $date
    title        = $title
    body_len     = $text.Length
    links        = $links
    images       = $images
    category     = $category
    duplicate_of = ''
    action       = ''
    body_text    = $(if ($text.Length -gt 300) { $text.Substring(0, 300) } else { $text })
  })
}

# ---------------------------------------------------------------------------
# Duplicates and the proposed action.
#
# The rule: anything with real content is kept. A closure notice is kept if it is
# the most recent of its kind, and folded into that one if it is not — the dates
# are years past and the page says nothing else. Nothing is deleted outright;
# retired URLs redirect, so no inbound link or index entry 404s.
# ---------------------------------------------------------------------------
$articles = $rows | Where-Object { $_.category -ne 'index-page' }
$byTitle = $articles | Group-Object title

foreach ($g in $byTitle) {
  if ($g.Count -lt 2) { continue }
  $sorted = $g.Group | Sort-Object date -Descending
  $keeper = $sorted[0]
  foreach ($dup in ($sorted | Select-Object -Skip 1)) { $dup.duplicate_of = $keeper.slug }
}

$closureLatest = @{}
foreach ($a in ($articles | Where-Object { $_.category -like 'closure*' } | Sort-Object date -Descending)) {
  if (-not $closureLatest.ContainsKey($a.category)) { $closureLatest[$a.category] = $a.slug }
}

# Default is keep. These pages are the platform's ニュース feature, so they carry
# over with the feature rather than being migrated one by one, and deleting them
# buys nothing we can measure yet. Only the superseded closure notices are put
# forward as candidates, and even those wait for Search Console: proposing to
# delete 25 indexed pages without traffic data in front of us is a guess.
foreach ($a in $articles) {
  if ($a.category -like 'closure*' -and $closureLatest[$a.category] -ne $a.slug) {
    $a.action = 'consolidation candidate (needs Search Console)'
  } elseif ($a.body_len -lt 40) {
    $a.action = 'review - almost no content'
  } else {
    $a.action = 'keep'
  }
}

$rows | Export-Csv -Path $outCsv -NoTypeInformation -Encoding UTF8

Write-Host ''
Write-Host ('archived /new/ pages : {0}' -f $rows.Count)
Write-Host ('  articles           : {0}' -f $articles.Count)
Write-Host ('  list page          : {0}' -f ($rows | Where-Object { $_.category -eq 'index-page' }).Count)
Write-Host ''
Write-Host 'by category:'
$articles | Group-Object category | Sort-Object Count -Descending | ForEach-Object {
  Write-Host ('  {0,-18} {1,3}' -f $_.Name, $_.Count)
}
Write-Host ''
Write-Host 'proposed action:'
$articles | Group-Object action | Sort-Object Count -Descending | ForEach-Object {
  Write-Host ('  {0,-26} {1,3}' -f $_.Name, $_.Count)
}
Write-Host ''
$median = ($articles | Sort-Object body_len | Select-Object -Skip ([int]($articles.Count / 2)) -First 1).body_len
Write-Host ('median article length : {0} characters' -f $median)
Write-Host ('report                : {0}' -f (Split-Path $outCsv -Leaf))
