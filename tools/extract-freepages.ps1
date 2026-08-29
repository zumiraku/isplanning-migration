<#
  Extract the unique content body from each archived free page, then classify it
  into a template archetype.

  Container names are not reliable here: only 20 of 83 pages use <div class="PageArea">,
  and the site's <h1> lives in the header chrome, not the content. So instead of
  guessing selectors, derive the chrome boundaries from the corpus itself - these are
  template-generated pages, so whatever prefix and suffix ALL of them share is chrome
  by definition, and what remains is the page's own content.

  Outputs:
    templates/basic-export/freepages/<slug>.html   content body, UTF-8, no BOM
    inventory/freepage-archetypes.csv              one row per page, with signals
#>
param(
  [string]$OutDir = 'templates\basic-export\freepages',
  [string]$OutCsv = 'inventory\freepage-archetypes.csv'
)

$eucjp = [System.Text.Encoding]::GetEncoding(51932)
$utf8  = New-Object System.Text.UTF8Encoding($false)
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$pages = @()
foreach ($r in (Import-Csv inventory\pages-freepages-desktop.csv)) {
  if (-not $r.file -or -not (Test-Path "snapshot\desktop\$($r.file)")) { continue }
  $h = $eucjp.GetString([System.IO.File]::ReadAllBytes("snapshot\desktop\$($r.file)"))
  $b = $h.IndexOf('<body')
  if ($b -lt 0) { continue }
  $body = $h.Substring($b)
  $path = ([uri]$r.url).AbsolutePath

  # The footer carries a hidden input holding the page's own path
  # (<input name="return_path" value="/html/pageNN.html">). That single field stops
  # the common suffix dead at ~300 chars, leaving the whole footer inside "content".
  # Normalise just that attribute to a constant so every page's chrome aligns.
  # Deliberately surgical: a blanket replace of /html/* would also destroy the
  # internal links we need for the Stage 5/6 link-rewrite work.
  $norm = [regex]::Replace($body, '(?i)(name="return_path"\s+value=")[^"]*(")', '${1}__SELF__${2}')
  # ssl_tempid is a per-request session token that appears in several footer forms;
  # it varies between fetches, not between pages, so it must be normalised too.
  $norm = [regex]::Replace($norm, '(?i)(name="ssl_tempid"\s+value=")[0-9a-f]{32}(")', '${1}__TEMPID__${2}')
  # MakeShop appends a long per-page hex comment after the footer; it is the last
  # thing breaking the common suffix, so the tail of the chrome stays inside "content".
  $norm = [regex]::Replace($norm, '<!--[0-9a-f]{32,}', '<!--__HASH__')

  $pages += [pscustomobject]@{
    url = $r.url
    slug = ($path -replace '^/html/','' -replace '\.html$','')
    title = $r.title
    body = $body
    norm = $norm
  }
}
Write-Output "pages loaded: $($pages.Count)"

# --- derive shared chrome ---------------------------------------------------
function Get-CommonPrefixLength($a, $b) {
  $n = [Math]::Min($a.Length, $b.Length); $i = 0
  while ($i -lt $n -and $a[$i] -eq $b[$i]) { $i++ }
  $i
}
function Get-CommonSuffixLength($a, $b) {
  $n = [Math]::Min($a.Length, $b.Length); $i = 0
  while ($i -lt $n -and $a[$a.Length-1-$i] -eq $b[$b.Length-1-$i]) { $i++ }
  $i
}

# A global minimum is worthless here: one structurally different page (page6, one of
# the five that still serve the PC template) drags it to 22 characters. Measure each
# page against a reference page instead, so an outlier only affects itself.
$ref = ($pages | Sort-Object { $_.body.Length })[[int]($pages.Count/2)]
Write-Output "chrome reference: $($ref.slug) ($($ref.body.Length) chars)"

foreach ($p in $pages) {
  $p | Add-Member -NotePropertyName preLen -NotePropertyValue (Get-CommonPrefixLength $ref.norm $p.norm) -Force
  $p | Add-Member -NotePropertyName sufLen -NotePropertyValue (Get-CommonSuffixLength $ref.norm $p.norm) -Force
}
$preStats = $pages | Where-Object { $_.slug -ne $ref.slug } | ForEach-Object { $_.preLen }
$sufStats = $pages | Where-Object { $_.slug -ne $ref.slug } | ForEach-Object { $_.sufLen }
"prefix boundary: min=$(($preStats | Measure-Object -Minimum).Minimum) max=$(($preStats | Measure-Object -Maximum).Maximum) typical=$((($preStats | Group-Object | Sort-Object Count -Descending)[0]).Name)"
"suffix boundary: min=$(($sufStats | Measure-Object -Minimum).Minimum) max=$(($sufStats | Measure-Object -Maximum).Maximum) typical=$((($sufStats | Group-Object | Sort-Object Count -Descending)[0]).Name)"

$rows = New-Object System.Collections.ArrayList
foreach ($p in $pages) {
  $preLen = $p.preLen; $sufLen = $p.sufLen
  if ($p.slug -eq $ref.slug) {
    # The reference cannot be diffed against itself; use the corpus-typical boundary.
    $preLen = [int](($preStats | Group-Object | Sort-Object Count -Descending)[0]).Name
    $sufLen = [int](($sufStats | Group-Object | Sort-Object Count -Descending)[0]).Name
  }
  # Slice the normalised string: boundaries were measured on it, and it differs from
  # the original only in the footer's return_path value, which is chrome regardless.
  $len = $p.norm.Length - $preLen - $sufLen
  $body = if ($len -gt 0) { $p.norm.Substring($preLen, $len) } else { '' }

  $txt = (($body -replace '(?is)<script.*?</script>','' -replace '(?is)<style.*?</style>','' -replace '<[^>]+>',' ') -replace '\s+',' ').Trim()
  $imgs     = ([regex]::Matches($body,'(?i)<img')).Count
  $tables   = ([regex]::Matches($body,'(?i)<table')).Count
  $headings = ([regex]::Matches($body,'(?i)<h[1-4]')).Count
  $lists    = ([regex]::Matches($body,'(?i)<(ul|ol)\b')).Count
  $hasForm  = [bool]($body -match '(?i)<form|<input')
  $links    = ([regex]::Matches($body,'(?i)<a\s[^>]*href')).Count
  $inlineSt = ([regex]::Matches($body,'(?i)style=')).Count

  $arch =
    if     ($hasForm)                             { 'form' }
    elseif ($tables -ge 2)                        { 'table' }
    elseif ($links -ge 15 -and $txt.Length -lt 700) { 'link-index' }
    elseif ($txt.Length -ge 700 -and $imgs -le 3) { 'article' }
    elseif ($imgs -ge 4)                          { 'visual-guide' }
    else                                          { 'short-notice' }

  if ($body) { [System.IO.File]::WriteAllText((Join-Path $OutDir "$($p.slug).html"), $body, $utf8) }

  [void]$rows.Add([pscustomobject]@{
    url=$p.url; slug=$p.slug; archetype=$arch; text_len=$txt.Length; imgs=$imgs
    tables=$tables; headings=$headings; lists=$lists; has_form=$hasForm
    links=$links; inline_styles=$inlineSt; title_len=$p.title.Length
    title=$p.title; file="$($p.slug).html"
  })
}

$rows | Export-Csv $OutCsv -NoTypeInformation -Encoding UTF8

Write-Output ""
Write-Output "=== template archetypes ==="
$rows | Group-Object archetype | Sort-Object Count -Descending |
  ForEach-Object { "  {0,-14} {1,3}" -f $_.Name, $_.Count }
Write-Output ""
$lens = $rows | ForEach-Object { [int]$_.text_len }
"content text: min={0} max={1} avg={2}" -f `
  (($lens | Measure-Object -Minimum).Minimum), (($lens | Measure-Object -Maximum).Maximum), [math]::Round((($lens | Measure-Object -Average).Average))
"inline style= attributes across all pages: $(($rows | Measure-Object inline_styles -Sum).Sum)"
Write-Output ""
Write-Output "=== overlong <title> (>60 chars truncates in search results) ==="
$rows | Where-Object { [int]$_.title_len -gt 60 } | Sort-Object { -[int]$_.title_len } |
  Select-Object -First 8 | ForEach-Object { "  {0,3} chars  {1}" -f $_.title_len, $_.slug }
"  total over 60: $(@($rows | Where-Object { [int]$_.title_len -gt 60 }).Count) of $($rows.Count)"
