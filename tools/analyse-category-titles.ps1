<#
  analyse-category-titles.ps1 — C4 / Gate A decision (A)

  Creator Mode drops per-category custom page titles. All 607 current values are
  backed up in inventory/categories-seo-backup.csv, so nothing is lost — but they
  have to be reproduced somehow, and the client is being asked to choose between:

    A  generate them from a template rule
    B  set the important ones by hand
    C  both

  He cannot choose sensibly without knowing how close a rule would get. This
  measures it instead of guessing.

  Method:
    * the true category name comes from each page's own breadcrumb (#M_category),
      whose last element is the category - the <h1> is useless here because every
      page on the site carries the same one (S0-16)
    * the current title is checked for that name
    * whatever surrounds the name is the editorial part, and those are grouped:
      a handful of recurring shapes means a rule reproduces most titles, many
      one-off shapes means it does not

  No Japanese string literals: every Japanese value comes from the data, read
  with an explicit EUC-JP decode. PowerShell 5.1 reads a BOM-less UTF-8 script as
  ANSI, so literals here would arrive mangled.

  Output: inventory/category-title-analysis.csv
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$backup  = Join-Path $root 'inventory\categories-seo-backup.csv'
$pages   = Join-Path $root 'inventory\pages-categories-desktop.csv'
$snapDir = Join-Path $root 'snapshot\desktop'
$out     = Join-Path $root 'inventory\category-title-analysis.csv'

$euc  = [System.Text.Encoding]::GetEncoding(51932)
$rows = New-Object System.Collections.Generic.List[object]

# url -> archived file
$fileByUrl = @{}
foreach ($p in (Import-Csv $pages)) {
  if ($p.url -and $p.file) { $fileByUrl[$p.url.Trim()] = $p.file.Trim() }
}

$titles = Import-Csv $backup
Write-Host ("categories in the backup : {0}" -f $titles.Count)
Write-Host ("archived files available : {0}" -f $fileByUrl.Count)

$noFile = 0; $noCrumb = 0

foreach ($t in $titles) {
  $url = $t.url.Trim()
  $title = $t.title
  $catName = ''
  $parentName = ''   # must reset each iteration or it leaks from the previous category

  $fname = $fileByUrl[$url]
  if ($fname) {
    $path = Join-Path $snapDir $fname
    if (Test-Path $path) {
      $html = $euc.GetString([System.IO.File]::ReadAllBytes($path))
      # The breadcrumb block, then its last text node.
      $m = [regex]::Match($html, '(?is)id="M_category"(.*?)</div>')
      if ($m.Success) {
        $parts = [regex]::Split($m.Groups[1].Value, '(?s)<[^>]*>') |
                 ForEach-Object { ($_ -replace '&nbsp;', ' ' -replace '&gt;', '>').Trim() } |
                 Where-Object { $_ -and $_ -ne '>' }
        if ($parts.Count -gt 0) { $catName = $parts[$parts.Count - 1] }
        # The element before it is the parent. The dominant title shape uses both -
        # "{parent}の粗品通販ページ{child}まで【shop】" - so a rule that only has the
        # current category name cannot reproduce it.
        if ($parts.Count -gt 2) { $parentName = $parts[$parts.Count - 2] }
      }
    } else { $noFile++ }
  } else { $noFile++ }

  if (-not $catName) { $noCrumb++ }

  # Does the current title contain the category name, and what surrounds it?
  # The parent name is substituted too, because the dominant shape uses both and
  # leaving the parent literal makes one template look like ninety-seven.
  $contains = $false
  $prefix = ''
  $suffix = ''
  if ($catName -and $title -and $title.Contains($catName)) {
    $contains = $true
    $i = $title.IndexOf($catName)
    $prefix = $title.Substring(0, $i)
    $suffix = $title.Substring($i + $catName.Length)
  }

  $rows.Add([pscustomobject]@{
    url           = $url
    category_name = $catName
    current_title = $title
    title_len     = $(if ($title) { $title.Length } else { 0 })
    contains_name = $contains
    prefix        = $prefix
    suffix        = $suffix
    parent_name   = $parentName
    shape         = $(if ($contains) { $sh = $prefix + '{CATEGORY}' + $suffix; if ($parentName -and $sh.Contains($parentName)) { $sh.Replace($parentName, '{PARENT}') } else { $sh } } else { '' })
  })
}

$rows | Export-Csv -Path $out -NoTypeInformation -Encoding UTF8

$withName = @($rows | Where-Object { $_.contains_name })
Write-Host ''
Write-Host ('titles containing their own category name : {0} of {1}' -f $withName.Count, $rows.Count)
Write-Host ('no breadcrumb found                       : {0}' -f $noCrumb)
Write-Host ('no archived file                          : {0}' -f $noFile)
Write-Host ''
Write-Host 'the shapes around the category name, most common first:'
$withName | Group-Object shape |
  Sort-Object Count -Descending | Select-Object -First 12 | ForEach-Object {
    Write-Host ('  {0,4}  {1}' -f $_.Count, $_.Name)
  }
Write-Host ''
$shapes = @($withName | Group-Object shape | Sort-Object Count -Descending)
Write-Host ('distinct shapes (parent substituted) : {0}' -f $shapes.Count)
$top1 = $shapes[0].Count
$top5 = ($shapes | Select-Object -First 5 | Measure-Object Count -Sum).Sum
$top10 = ($shapes | Select-Object -First 10 | Measure-Object Count -Sum).Sum
Write-Host ('  one rule covers        : {0} of {1}' -f $top1, $rows.Count)
Write-Host ('  five rules cover       : {0} of {1}' -f $top5, $rows.Count)
Write-Host ('  ten rules cover        : {0} of {1}' -f $top10, $rows.Count)
Write-Host ('report          : {0}' -f (Split-Path $out -Leaf))
