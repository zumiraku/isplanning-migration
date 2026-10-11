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
      $m = [regex]::Match($html, '(?is)id="M_category"(.*?)</div>')
      if ($m.Success) {
        $parts = [regex]::Split($m.Groups[1].Value, '(?s)<[^>]*>') |
                 ForEach-Object { ($_ -replace '&nbsp;', ' ' -replace '&gt;', '>').Trim() } |
                 Where-Object { $_ -and $_ -ne '>' }
        if ($parts.Count -gt 0) { $catName = $parts[$parts.Count - 1] }
        if ($parts.Count -gt 2) { $parentName = $parts[$parts.Count - 2] }
      }
    } else { $noFile++ }
  } else { $noFile++ }

  if (-not $catName) { $noCrumb++ }

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

