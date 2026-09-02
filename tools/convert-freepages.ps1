<#
  convert-freepages.ps1 — Stage 5

  Turns the 83 extracted Basic Mode free-page bodies into Creator Mode content
  fragments built on the token system.

  The rule this follows: nothing is dropped silently. Every class and every CSS
  declaration is either mapped to something in the new system, or deliberately
  dropped by a rule that names it, or reported as unmapped for a human to rule on.
  A converter that quietly discards what it does not recognise is how a page loses
  a phone number.

  Input   templates/basic-export/freepages/*.html   (83 bodies, UTF-8, de-chromed)
  Output  templates/creator/freepages/*.html        content fragments
          inventory/freepage-conversion-report.csv  per page: what changed
          inventory/freepage-unmapped.csv           everything no rule claimed
          templates/creator/css/_extracted-legacy.css  the 15 embedded <style>
                                                       blocks, for review only

  Usage:  .\tools\convert-freepages.ps1
          .\tools\convert-freepages.ps1 -Only page68
#>

[CmdletBinding()]
param(
  [string]$Only = '',
  [switch]$KeepGoingOnError,
  [switch]$Trace          # print the length after each phase — use with -Only
)

$ErrorActionPreference = 'Stop'

$root       = Split-Path -Parent $PSScriptRoot
$srcDir     = Join-Path $root 'templates\basic-export\freepages'
$dstDir     = Join-Path $root 'templates\creator\freepages'
$reportPath = Join-Path $root 'inventory\freepage-conversion-report.csv'
$unmapPath  = Join-Path $root 'inventory\freepage-unmapped.csv'
$legacyCss  = Join-Path $root 'templates\creator\css\_extracted-legacy.css'
$legacyJsPath = Join-Path $root 'templates\creator\js\_extracted-legacy.js'

if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir | Out-Null }

# ---------------------------------------------------------------------------
# 1. Class map.  ''  = drop the class, the new system already handles it.
#    Anything absent from this table is reported as unmapped, not dropped.
# ---------------------------------------------------------------------------
$classMap = @{
  # Basic Mode chrome that leaked into the body
  'PageArea'        = ''
  'M_mainContents'  = ''
  'clear'           = ''
  'clearfix'        = ''

  # the u-* / c-* / l-* mini-framework the agency pasted into 13 pages.
  # Spacing belongs to the token scale now, so these all go.
  'u-m0'            = ''
  'u-p10'           = ''
  'u-pb1em'         = ''
  'u-mb10'          = ''
  'u-mb20'          = ''
  'u-mb30'          = ''
  'u-mt10'          = ''
  'u-mt20'          = ''
  'u-mt30'          = ''
  'u-mt40'          = ''
  'u-pt30'          = ''
  'u-pb30'          = ''
  'c-block'         = ''
  'c-s-block'       = ''
  'l-tertiary'      = ''
  'l-container'     = ''
  'l-secondary'     = ''

  # headings
  'l-heading-secondary' = 'h-section'
  'l-heading-tertiary'  = 'h-sub'
  'midashi'             = 'h-section'

  # links and buttons -> one button component with variants
  'link_green'      = 'btn btn--ghost'
  'btn_link'        = 'btn btn--ghost'
  'btn_design3'     = 'btn btn--ghost'
  'f-button'        = 'btn btn--primary'
  'c-btn'           = 'btn btn--primary'
  'c-btn-anchor'    = 'btn btn--ghost'
  'columnlink'      = 'guide-item'
  'column-list'     = 'guide-grid'

  # boxes
  'normal-box'      = 'linkbox'
  'normal-box2'     = 'linkbox'
  'normal-box3'     = 'linkbox'
  'normal-box4'     = 'linkbox'
  'textboxisp'      = 'notice'
  'box_summer'      = 'notice'
  'kome'            = 'note-kome'
  'nameall'         = ''
  'first_text'      = 'lede'
  'listing'         = ''
  'OrderForm'       = 'linklist'
  'txtList03'       = 'linklist'

  # inline emphasis
  'bold'            = 'u-bold'
  'red'             = 'u-alert'
  'gray'            = 'u-muted'
  'class1'          = ''

  # tables that were styled by the dying system stylesheet
  'payment_small'      = 'table'
  'footer_guide_small' = 'table'

  # the c-* / l-* set from the 13 embedded blocks, mapped from what those rules
  # actually did rather than from their names
  'c-table'            = 'table'          # border-collapse + 1px #ddd + th shading
  'c-linkblock'        = 'linkbox'
  'c-pagelink'         = 'toc'            # ol, decimal markers — a table of contents
  'l-heading-primary'  = 'h-section'      # 18px/1.4 heading
  'l-section'          = ''               # empty rule
  'u-c-a'              = ''               # empty but for an h3 accent, now .article h3
  'c-nap'              = ''               # declared, never given properties
  'u-pb40'             = ''
  'u-pb50'             = ''
  'u-pb60'             = ''
  'M_mgnT10'           = ''               # MakeShop 10px margin utility
  'tbl01'              = 'table'
  'PageList2'          = 'linklist'
  'markList01'         = 'linklist'
  'guide-subttl'       = 'h-sub'
  'newshr'             = ''               # <hr> spacing
  'container_summer'   = ''               # seasonal wrapper, colour came from the dying sheet

  # floated figures -> a component that unfloats on a phone
  'img-right-s'     = 'figure--right'
  'img-right'       = 'figure--right'
  'img-left-s'      = 'figure--left'
  'img-left'        = 'figure--left'
}

# ---------------------------------------------------------------------------
# 2. Declaration rules, applied to every inline style="" declaration.
#    action: drop | class:<name> | keep
#    Ordered — first match wins.
# ---------------------------------------------------------------------------
$declRules = @(
  # layout scaffolding the token system owns
  @{ pattern = '^(margin|margin-top|margin-right|margin-bottom|margin-left)$'; action = 'drop'; why = 'spacing owned by the token scale' }
  @{ pattern = '^(padding|padding-top|padding-right|padding-bottom|padding-left)$'; action = 'drop'; why = 'spacing owned by the token scale' }
  @{ pattern = '^(width|height|min-width|min-height|max-height)$'; action = 'drop'; why = 'fixed sizing defeats the responsive layout' }
  @{ pattern = '^overflow$'; action = 'drop'; why = 'clearfix, no longer needed' }
  @{ pattern = '^(color|background|background-color|background-image|border|border-.*|box-shadow|border-radius)$'; action = 'drop'; why = 'colour and surface owned by tokens' }
  @{ pattern = '^(font-size|font-family|font-weight|font-style|line-height|letter-spacing|word-break|white-space)$'; action = 'drop'; why = 'typography owned by tokens' }
  @{ pattern = '^vertical-align$'; action = 'drop'; why = 'table styling owned by .table' }
  @{ pattern = '^(list-style|list-style-type)$'; action = 'drop'; why = 'list markers owned by .article' }

  @{ pattern = '^clear$'; action = 'drop'; why = 'float clearing, no longer needed' }

  # the few that carry real intent
  @{ pattern = '^text-decoration$'; action = 'textdecoration'; why = 'none/underline dropped; line-through is meaning, kept as .u-strike' }
  @{ pattern = '^(position|top|right|bottom|left|z-index)$'; action = 'keep'; why = 'deliberate positioning — left alone and counted, not guessed at' }
  @{ pattern = '^float$'; action = 'float'; why = 'becomes .figure--left / .figure--right, which unfloat on a phone' }
  @{ pattern = '^text-align$'; action = 'align'; why = 'becomes .u-center / .u-left / .u-right' }
  @{ pattern = '^display$'; action = 'display'; why = 'display:block+margin:auto becomes .u-center' }
)

# ---------------------------------------------------------------------------
$report   = New-Object System.Collections.Generic.List[object]
$unmapped = @{}   # "kind|value" -> count

function Note-Unmapped([string]$kind, [string]$value, [string]$slug) {
  $key = $kind + '|' + $value
  if (-not $unmapped.ContainsKey($key)) {
    $unmapped[$key] = [pscustomobject]@{ kind = $kind; value = $value; count = 0; pages = (New-Object 'System.Collections.Generic.HashSet[string]') }
  }
  $unmapped[$key].count++
  [void]$unmapped[$key].pages.Add($slug)
}

function Convert-ClassAttr([string]$value, [string]$slug, [ref]$dropped, [ref]$unknown) {
  $out = New-Object System.Collections.Generic.List[string]
  foreach ($c in ($value -split '\s+')) {
    if ([string]::IsNullOrWhiteSpace($c)) { continue }
    if ($classMap.ContainsKey($c)) {
      $mapped = $classMap[$c]
      if ($mapped -eq '') { $dropped.Value++ }
      else { foreach ($m in ($mapped -split '\s+')) { if (-not $out.Contains($m)) { [void]$out.Add($m) } } }
    } else {
      Note-Unmapped 'class' $c $slug
      $unknown.Value++
      if (-not $out.Contains($c)) { [void]$out.Add($c) }   # kept, so it is visible in review
    }
  }
  return ($out -join ' ')
}

function Convert-StyleAttr([string]$value, [string]$slug, [ref]$stats) {
  # returns a hashtable: remaining (string), addClasses (string[])
  $addClasses = New-Object System.Collections.Generic.List[string]
  $remaining  = New-Object System.Collections.Generic.List[string]
  $floatDir = ''; $alignDir = ''; $displayBlock = $false; $marginAuto = ($value -match 'margin\s*:\s*(0\s+)?auto')

  foreach ($decl in ($value -split ';')) {
    if ([string]::IsNullOrWhiteSpace($decl)) { continue }
    $parts = $decl -split ':', 2
    if ($parts.Count -ne 2) { continue }
    $prop = $parts[0].Trim().ToLower()
    $val  = $parts[1].Trim().ToLower()

    $rule = $null
    foreach ($r in $declRules) { if ($prop -match $r.pattern) { $rule = $r; break } }

    if ($null -eq $rule) {
      Note-Unmapped 'decl' $prop $slug
      $stats.Value.unmapped++
      [void]$remaining.Add($prop + ':' + $val)
      continue
    }

    switch ($rule.action) {
      'drop'    { $stats.Value.dropped++ }
      'keep'    { $stats.Value.kept++; [void]$remaining.Add($prop + ':' + $val) }
      'float'   { $stats.Value.mapped++; if ($val -match 'right') { $floatDir = 'right' } elseif ($val -match 'left') { $floatDir = 'left' } }
      'align'   { $stats.Value.mapped++; $alignDir = $val }
      'display' { $stats.Value.dropped++; if ($val -match 'block') { $displayBlock = $true } }
      'textdecoration' {
        if ($val -match 'line-through') { $stats.Value.mapped++; [void]$addClasses.Add('u-strike') }
        else { $stats.Value.dropped++ }
      }
    }
  }

  if ($floatDir -eq 'right') { [void]$addClasses.Add('figure--right') }
  if ($floatDir -eq 'left')  { [void]$addClasses.Add('figure--left') }
  if ($alignDir -eq 'center') { [void]$addClasses.Add('u-center') }
  if ($alignDir -eq 'right')  { [void]$addClasses.Add('u-right') }
  if ($displayBlock -and $marginAuto -and $floatDir -eq '') { [void]$addClasses.Add('u-center') }

  return @{ remaining = ($remaining -join ';'); addClasses = $addClasses }
}

# ---------------------------------------------------------------------------
$files = Get-ChildItem -Path $srcDir -Filter '*.html' | Sort-Object Name
if ($Only) { $files = $files | Where-Object { $_.BaseName -eq $Only } }
if (-not $files) { throw "no input files matched (Only='$Only')" }

$legacyBlocks = New-Object System.Collections.Generic.List[string]
$legacyJs     = New-Object System.Collections.Generic.List[string]

foreach ($f in $files) {
  $slug = $f.BaseName
  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $bytesIn = [System.Text.Encoding]::UTF8.GetByteCount($html)

  $stats = [pscustomobject]@{ dropped = 0; mapped = 0; unmapped = 0; kept = 0 }
  $classesDropped = 0; $classesUnknown = 0

  # Counters the MatchEvaluator scriptblocks write to. They must exist before the
  # first ++ or PS 5.1 treats the increment as an error under StrictMode.
  $script:styleAttrsCount = 0
  $script:cDropped = 0
  $script:cUnknown = 0

  # -- embedded <style> blocks: lift out, keep for review, do not carry over ---
  $styleBlocks = [regex]::Matches($html, '(?is)<style[^>]*>.*?</style>')
  if ($styleBlocks.Count -gt 0) {
    [void]$legacyBlocks.Add("/* ===== $slug ===== */")
    foreach ($m in $styleBlocks) { [void]$legacyBlocks.Add($m.Value) }
    $html = [regex]::Replace($html, '(?is)<style[^>]*>.*?</style>', '')
  }

  if ($Trace) { Write-Host ("  after style      : " + $html.Length) }
  # -- <script> blocks: same treatment as <style> -----------------------------
  # These are old chrome helpers — bottom_privercy() and bottom_sendmail() open
  # popups that belong to the Basic Mode footer. None of them should ride into a
  # Creator Mode free page unreviewed, so they are lifted out and saved. If a page
  # turns out to need one, it is in the review file and a human decides.
  $scriptBlocks = [regex]::Matches($html, '(?is)<script[^>]*>.*?</script>')
  if ($scriptBlocks.Count -gt 0) {
    [void]$legacyJs.Add("/* ===== $slug ===== */")
    foreach ($m in $scriptBlocks) { [void]$legacyJs.Add($m.Value) }
    $html = [regex]::Replace($html, '(?is)<script[^>]*>.*?</script>', '')
  }

  if ($Trace) { Write-Host ("  after script     : " + $html.Length) }
  # -- isolate the content window ---------------------------------------------
  # The earlier extraction derived chrome from what all 83 bodies share, which
  # left chrome behind wherever a page's chrome differs from the corpus. Two
  # groups came through carrying it:
  #
  #   * 20 pages still hold the whole site footer — #footerWrap, the address
  #     block, the payment icons, the copyright, and a JavaScript:bottom_sendmail()
  #     link that will not exist in Creator Mode. Between 23% and 78% of the file.
  #   * 4 pages (company, info, ordercontract, page32) hold the header, the basket
  #     widget AND the left sidebar — and their real content sits *after* all of
  #     it. Truncating at the sidebar would have deleted the 会社概要 page.
  #
  # So this finds the content window rather than trimming one end. Start markers
  # in priority order, then the first end marker that follows.
  $bytesBeforeWindow = [System.Text.Encoding]::UTF8.GetByteCount($html)
  $startMarker = 'none'

  # `<?div` rather than `<div`: these container tags are among the ones the shop
  # deliberately leaves malformed, so the opener arrives as `div class="...">`
  # with no `<` at all. Requiring the bracket misses 53 of the 83 pages.
  $mStart = [regex]::Match($html, '(?is)<?div\s[^>]*id\s*=\s*["'']?O_adminPagearea[^>]*>')
  if ($mStart.Success) { $startMarker = 'O_adminPagearea' }
  if (-not $mStart.Success) {
    $mStart = [regex]::Match($html, '(?is)<?div\s[^>]*class\s*=\s*["''][^"'']*M_mainContents[^>]*>')
    if ($mStart.Success) { $startMarker = 'M_mainContents' }
  }
  if (-not $mStart.Success) {
    $mStart = [regex]::Match($html, '(?i)<?div class="PageArea">')
    if ($mStart.Success) { $startMarker = 'PageArea' }
  }
  if ($mStart.Success) { $html = $html.Substring($mStart.Index + $mStart.Length) }
  if ($Trace) { Write-Host ("    after start-marker: " + $html.Length + " [" + $startMarker + "]") }

  # End markers, all of them, earliest wins — they do not appear in a fixed order.
  $endMarker = 'none'
  $cutAt = $html.Length
  foreach ($pat in @('(?i)<p[^>]*class\s*=\s*["'']?pageTop', '(?s)<!--[0-9a-f]{20,}')) {
    $mEnd = [regex]::Match($html, $pat)
    if ($mEnd.Success -and $mEnd.Index -lt $cutAt) { $cutAt = $mEnd.Index; $endMarker = $pat }
  }
  # #O_container sits inside a multi-line comment that also contains <br />, so it
  # cannot be matched as one comment pattern. Cut from the comment that opens it.
  $oc = $html.IndexOf('#O_container')
  if ($oc -ge 0) {
    $open = $html.LastIndexOf('<!--', $oc)
    $ocCut = $(if ($open -ge 0) { $open } else { $oc })
    if ($ocCut -lt $cutAt) { $cutAt = $ocCut; $endMarker = 'O_container' }
  }
  if ($cutAt -lt $html.Length) { $html = $html.Substring(0, $cutAt) }
  if ($Trace) { Write-Host ("    after end-marker  : " + $html.Length + " [" + $endMarker + "]") }

  # Comments go here, before any tail trimming. They are all authoring noise —
  # PageArea, fan_contents, the agency's own content markers — and leaving them
  # in play during the tail strip is a trap: an alternation containing
  # `<!--.*?-->` will happily expand from the *first* comment to the *last* and
  # swallow every paragraph in between. That silently emptied page69 completely.
  $comments = ([regex]::Matches($html, '(?s)<!--.*?-->')).Count
  $html = [regex]::Replace($html, '(?s)<!--.*?-->', '')
  $html = [regex]::Replace($html, '(?s)<!--.*$', '')

  # Cutting a window out of markup that deliberately leaves tags unclosed (S0-3 —
  # and the shop's own comment says so: 「MakeShop独自のテーブルタグを強制的に閉じない
  # ようにしております」) leaves orphaned closers at the tail. Trim only the excess.
  if ($Trace) { Write-Host ("    after comment strips: " + $html.Length) }
  $divsTrimmed = 0
  while ($true) {
    $open  = ([regex]::Matches($html, '(?i)<div\b')).Count
    $close = ([regex]::Matches($html, '(?i)</div\s*>')).Count
    if ($close -le $open) { break }
    $last = $html.LastIndexOf('</div>', [System.StringComparison]::OrdinalIgnoreCase)
    if ($last -lt 0) { break }
    $html = $html.Remove($last, 6)
    $divsTrimmed++
  }
  if ($Trace) { Write-Host ("    after div balance : " + $html.Length + " trimmed=" + $divsTrimmed) }
  # Same for the table scaffolding Basic Mode injects around the content. Looped,
  # because it comes as alternating runs of tags, comments and <br>.
  $html = [regex]::Replace($html, '(?is)^\s*(</t[dhr]>|</table>|<tr[^>]*>|<td[^>]*>|\s)+', '')
  for ($i = 0; $i -lt 12; $i++) {
    $before = $html
    $html = [regex]::Replace($html, '(?is)(</t[dhr]\s*>|</table>|<tr[^>]*>|<td[^>]*>|<br[^>]*>|&nbsp;|\s)+$', '')
    if ($html -eq $before) { break }
  }

  $chromeRemoved = $bytesBeforeWindow - [System.Text.Encoding]::UTF8.GetByteCount($html)

  if ($Trace) { Write-Host ("  after window+tail: " + $html.Length) }
  # -- legacy presentational tags --------------------------------------------
  $fontTags = ([regex]::Matches($html, '(?i)<font[^>]*>')).Count
  $html = [regex]::Replace($html, '(?i)</?font[^>]*>', '')
  $centerTags = ([regex]::Matches($html, '(?i)<center[^>]*>')).Count
  $html = [regex]::Replace($html, '(?i)<center[^>]*>', '<div class="u-center">')
  $html = [regex]::Replace($html, '(?i)</center>', '</div>')

  # -- presentational attributes ---------------------------------------------
  # width/height on images are the main offender: they pin a phone to a desktop
  # column width. The stylesheet gives every image max-width:100%.
  $attrsStripped = ([regex]::Matches($html, '(?i)\s(width|height|align|bgcolor|border|cellpadding|cellspacing|hspace|vspace)\s*=\s*("[^"]*"|''[^'']*''|[^\s>]+)')).Count
  $html = [regex]::Replace($html, '(?i)\s(width|height|align|bgcolor|border|cellpadding|cellspacing|hspace|vspace)\s*=\s*("[^"]*"|''[^'']*''|[^\s>]+)', '')

  # -- style="" -> classes ----------------------------------------------------
  $styleAttrs = 0
  $pendingClasses = @{}   # index -> classes to add, keyed by a marker
  $markerId = 0

  # Both quote styles: 300 of the inline styles in this corpus are single-quoted,
  # and a double-quote-only pattern silently leaves every one of them in place.
  $html = [regex]::Replace($html, '(?i)\sstyle\s*=\s*(?:"([^"]*)"|''([^'']*)'')', {
    param($m)
    $script:styleAttrsCount++
    $raw = if ($m.Groups[1].Success) { $m.Groups[1].Value } else { $m.Groups[2].Value }
    $res = Convert-StyleAttr $raw $slug ([ref]$stats)
    $out = ''
    if ($res.remaining) { $out += ' style="' + $res.remaining + '"' }
    if ($res.addClasses.Count -gt 0) { $out += ' data-addclass="' + ($res.addClasses -join ' ') + '"' }
    return $out
  })
  $styleAttrs = $script:styleAttrsCount
  $script:styleAttrsCount = 0

  # -- class="" rewrite -------------------------------------------------------
  $html = [regex]::Replace($html, '(?i)\sclass\s*=\s*(?:"([^"]*)"|''([^'']*)'')', {
    param($m)
    $d = 0; $u = 0
    $raw = if ($m.Groups[1].Success) { $m.Groups[1].Value } else { $m.Groups[2].Value }
    $mapped = Convert-ClassAttr $raw $slug ([ref]$d) ([ref]$u)
    $script:cDropped += $d; $script:cUnknown += $u
    if ($mapped) { return ' class="' + $mapped + '"' } else { return '' }
  })
  $classesDropped = $script:cDropped; $classesUnknown = $script:cUnknown
  $script:cDropped = 0; $script:cUnknown = 0

  # -- fold the classes the style attributes earned into class="" -------------
  # Done as a second pass so an element that had both keeps both.
  $html = [regex]::Replace($html, '(?i)<(\w+)([^>]*?)\sdata-addclass="([^"]*)"([^>]*?)>', {
    param($m)
    $tag = $m.Groups[1].Value
    $before = $m.Groups[2].Value
    $add = $m.Groups[3].Value
    $after = $m.Groups[4].Value
    $rest = $before + $after
    if ($rest -match '(?i)\sclass\s*=\s*"([^"]*)"') {
      $existing = $Matches[1]
      $merged = (($existing + ' ' + $add) -split '\s+' | Where-Object { $_ } | Select-Object -Unique) -join ' '
      $rest = [regex]::Replace($rest, '(?i)\sclass\s*=\s*"[^"]*"', ' class="' + $merged + '"')
    } else {
      $rest = ' class="' + $add + '"' + $rest
    }
    return '<' + $tag + $rest + '>'
  })

  # -- tables get the scroll wrapper: a wide table must not scroll the page ----
  $tables = ([regex]::Matches($html, '(?i)<table')).Count
  $html = [regex]::Replace($html, '(?i)<table([^>]*)>', {
    param($m)
    $attrs = $m.Groups[1].Value
    if ($attrs -match '(?i)class\s*=\s*"([^"]*)"') {
      $attrs = [regex]::Replace($attrs, '(?i)class\s*=\s*"([^"]*)"', 'class="$1 table"')
    } else {
      $attrs = $attrs + ' class="table"'
    }
    return '<div class="table-scroll"><table' + $attrs + '>'
  })
  $html = [regex]::Replace($html, '(?i)</table>', '</table></div>')

  # -- images: lazy-load below the fold, and never let one overflow -----------
  $imgs = ([regex]::Matches($html, '(?i)<img')).Count
  $html = [regex]::Replace($html, '(?i)<img(?![^>]*\bloading=)', '<img loading="lazy" decoding="async"')

  # -- things the cutover has to know about, counted rather than changed -------
  # Links to /html/pageNN.html: free-page URLs change under Creator Mode (Q7), so
  # every one of these is a link that breaks unless it is rewritten or redirected.
  $freepageLinks = ([regex]::Matches($html, '(?i)href\s*=\s*"[^"]*\/html\/[a-z0-9_-]+\.html')).Count
  # Inline event handlers — one of these opens the quote-request form (C20).
  $inlineJs = ([regex]::Matches($html, '(?i)\son(click|mouseover|mouseout|load|submit)\s*=')).Count

  if ($Trace) { Write-Host ("  after attrs      : " + $html.Length) }
  # -- navigation the Creator Mode template owns ------------------------------
  # 38 pages carry their own schema.org BreadcrumbList inside the content. The
  # template emits breadcrumbs itself, so leaving these gives every one of those
  # pages two breadcrumb trails and two BreadcrumbList items in the structured
  # data — which is worse than none.
  $breadcrumbs = ([regex]::Matches($html, '(?is)<div[^>]*id\s*=\s*["'']?breadcrumbs[^>]*>.*?</div>')).Count
  $html = [regex]::Replace($html, '(?is)<div[^>]*id\s*=\s*["'']?breadcrumbs[^>]*>.*?</div>', '')

  # Leading debris left by cutting at a malformed opener, plus the empty wrappers
  # that remain once their layout classes have been mapped away.
  for ($i = 0; $i -lt 8; $i++) {
    $before = $html
    $html = [regex]::Replace($html, '(?is)^\s*(</?div\s*>|<div>|div>|</?span\s*>|<br[^>]*>|&nbsp;|\s)+', '')
    if ($html -eq $before) { break }
  }

  if ($Trace) { Write-Host ("  after nav strip  : " + $html.Length) }
  # -- lift the page heading out of the body ----------------------------------
  # Every page on this site currently ships the same <h1> (S0-16), with the real
  # page heading demoted to <h2> in the body. In Creator Mode the template emits
  # the <h1> from the page's own title, so the leading <h2> would become a
  # duplicate heading. Lift it into metadata and let the template own it.
  # h1, h2 or h3: the demoted page heading is not consistently one level, because
  # the real <h1> was spent on the site-wide string. info.html uses <h3>.
  $pageHeading = ''
  $mH2 = [regex]::Match($html, '(?is)^\s*<h[123][^>]*>(.*?)</h[123]>')
  if ($mH2.Success) {
    $pageHeading = [regex]::Replace($mH2.Groups[1].Value, '(?s)<[^>]+>', '').Trim()
    $html = $html.Substring($mH2.Index + $mH2.Length)
  }

  if ($Trace) { Write-Host ("  after heading    : " + $html.Length) }
  # -- tidy -------------------------------------------------------------------
  $html = [regex]::Replace($html, '[ \t]+\r?\n', "`r`n")
  $html = [regex]::Replace($html, '(\r?\n){3,}', "`r`n`r`n")
  $html = $html.Trim()

  $bytesOut = [System.Text.Encoding]::UTF8.GetByteCount($html)
  $enc = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Join-Path $dstDir ($slug + '.html')), $html, $enc)

  $savedPct = 0
  if ($bytesIn -gt 0) { $savedPct = [math]::Round(100 - ($bytesOut * 100.0 / $bytesIn), 1) }

  $report.Add([pscustomobject]@{
    slug             = $slug
    page_heading     = $pageHeading
    bytes_in         = $bytesIn
    bytes_out        = $bytesOut
    saved_pct        = $savedPct
    style_attrs      = $styleAttrs
    decls_dropped    = $stats.dropped
    decls_mapped     = $stats.mapped
    decls_unmapped   = $stats.unmapped
    classes_dropped  = $classesDropped
    classes_unmapped = $classesUnknown
    style_blocks     = $styleBlocks.Count
    font_tags        = $fontTags
    center_tags      = $centerTags
    attrs_stripped   = $attrsStripped
    tables           = $tables
    images           = $imgs
    freepage_links   = $freepageLinks
    inline_js        = $inlineJs
    start_marker     = $startMarker
    end_marker       = $endMarker
    script_blocks    = $scriptBlocks.Count
    breadcrumbs      = $breadcrumbs
    comments         = $comments
    chrome_bytes     = $chromeRemoved
    divs_trimmed     = $divsTrimmed
    review           = $(if ($bytesIn -gt 0 -and ($chromeRemoved * 1.0 / $bytesIn) -gt 0.5) { 'over-half-removed' } elseif ($bytesOut -lt 200) { 'almost-empty' } else { '' })
  })
}

# ---------------------------------------------------------------------------
$report | Export-Csv -Path $reportPath -NoTypeInformation -Encoding UTF8

# Where was each unmapped class defined? That is the whole question for review:
# a class defined only in the 171 KB system stylesheet, or in one of the embedded
# blocks, has NO styling after the switch — those are the ones that need a
# decision. One defined nowhere was already dead and can be ignored.
$cssSources = @{}
$sysCss  = Join-Path $root 'snapshot\assets\www.isp-sp.com_design_isplanning_m_sys_common.css'
$defCss  = Join-Path $root 'snapshot\assets\gigaplus.makeshop.jp_isplanning_css_default.css'
foreach ($pair in @(@('sys_common (dies at switch)', $sysCss), @('default.css (survives)', $defCss), @('embedded block (dies)', $legacyCss))) {
  if (Test-Path $pair[1]) { $cssSources[$pair[0]] = [System.IO.File]::ReadAllText($pair[1]) }
}

function Get-DefinedIn([string]$class) {
  $hits = New-Object System.Collections.Generic.List[string]
  $pattern = '\.' + [regex]::Escape($class) + '(?![\w-])'
  foreach ($k in $cssSources.Keys) {
    if ([regex]::IsMatch($cssSources[$k], $pattern)) { [void]$hits.Add($k) }
  }
  if ($hits.Count -eq 0) { return 'nowhere - already dead' }
  return ($hits -join ' + ')
}

$unmapRows = $unmapped.Values |
  Sort-Object -Property @{Expression = 'kind'}, @{Expression = 'count'; Descending = $true} |
  ForEach-Object {
    $definedIn = ''
    if ($_.kind -eq 'class') { $definedIn = Get-DefinedIn $_.value }
    [pscustomobject]@{
      kind       = $_.kind
      value      = $_.value
      count      = $_.count
      page_count = $_.pages.Count
      defined_in = $definedIn
      pages      = (($_.pages | Sort-Object) -join ' ')
    }
  }
$unmapRows | Export-Csv -Path $unmapPath -NoTypeInformation -Encoding UTF8

if ($legacyBlocks.Count -gt 0) {
  $head = "/* Embedded <style> blocks lifted out of the free-page bodies.`r`n" +
          "   REVIEW ONLY - this file is not loaded anywhere. Anything worth keeping`r`n" +
          "   belongs in freepage.css as one shared rule, not pasted into 13 pages. */`r`n`r`n"
  $enc2 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($legacyCss, $head + ($legacyBlocks -join "`r`n"), $enc2)
}

if ($legacyJs.Count -gt 0) {
  $headJs = "/* <script> blocks lifted out of the free-page bodies.`r`n" +
            "   REVIEW ONLY - this file is not loaded anywhere. Mostly Basic Mode`r`n" +
            "   footer helpers (bottom_privercy, bottom_sendmail) that open popups`r`n" +
            "   which will not exist in Creator Mode. Anything a page genuinely needs`r`n" +
            "   gets rebuilt, not pasted back. */`r`n`r`n"
  $enc3 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($legacyJsPath, $headJs + ($legacyJs -join "`r`n"), $enc3)
}

$totalIn  = ($report | Measure-Object -Property bytes_in -Sum).Sum
$totalOut = ($report | Measure-Object -Property bytes_out -Sum).Sum
$unmapClasses = ($unmapRows | Where-Object { $_.kind -eq 'class' }).Count
$unmapDecls   = ($unmapRows | Where-Object { $_.kind -eq 'decl' }).Count

Write-Host ''
Write-Host ('converted {0} pages: {1:N0} bytes -> {2:N0} bytes ({3}% smaller)' -f `
  $report.Count, $totalIn, $totalOut, [math]::Round(100 - ($totalOut * 100.0 / $totalIn), 1))
Write-Host ('  style attributes processed : {0:N0}' -f ($report | Measure-Object -Property style_attrs -Sum).Sum)
Write-Host ('  declarations dropped       : {0:N0}' -f ($report | Measure-Object -Property decls_dropped -Sum).Sum)
Write-Host ('  declarations mapped        : {0:N0}' -f ($report | Measure-Object -Property decls_mapped -Sum).Sum)
Write-Host ('  legacy classes dropped     : {0:N0}' -f ($report | Measure-Object -Property classes_dropped -Sum).Sum)
Write-Host ('  embedded <style> blocks    : {0:N0}' -f ($report | Measure-Object -Property style_blocks -Sum).Sum)
Write-Host ''
Write-Host ('  UNMAPPED, needs a human: {0} class names, {1} declarations -> {2}' -f `
  $unmapClasses, $unmapDecls, (Split-Path $unmapPath -Leaf))
Write-Host ('  report: {0}' -f (Split-Path $reportPath -Leaf))
