param(
  [Parameter(Mandatory=$true)][string]$UrlFile,
  [Parameter(Mandatory=$true)][ValidateSet('desktop','mobile')][string]$UaProfile,
  [Parameter(Mandatory=$true)][string]$OutCsv,
  [int]$DelayMs = 1200,
  [int]$Limit = 0,
  [switch]$SaveBody
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$UA = @{
  desktop = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  mobile  = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
}[$UaProfile]

$bodyDir = Join-Path 'snapshot' $UaProfile
if ($SaveBody -and -not (Test-Path $bodyDir)) { New-Item -ItemType Directory -Force -Path $bodyDir | Out-Null }

$eucjp = [System.Text.Encoding]::GetEncoding(51932)
$utf8  = [System.Text.Encoding]::UTF8

function Get-SafeName([string]$url) {
  $u = [uri]$url
  $n = ($u.AbsolutePath + $u.Query) -replace '[^A-Za-z0-9\-_\.]', '_'
  $n = $n.Trim('_')
  if ([string]::IsNullOrWhiteSpace($n)) { $n = 'index' }
  if ($n.Length -gt 90) { $n = $n.Substring(0, 90) }
  $md5 = [System.Security.Cryptography.MD5]::Create()
  $hash = ([BitConverter]::ToString($md5.ComputeHash([Text.Encoding]::UTF8.GetBytes($url))) -replace '-', '').Substring(0, 8)
  "$n.$hash.html"
}

function Get-Match([string]$text, [string]$pattern) {
  $m = [regex]::Match($text, $pattern, 'IgnoreCase, Singleline')
  if ($m.Success) { ($m.Groups[1].Value -replace '\s+', ' ').Trim() } else { '' }
}

$urls = Get-Content $UrlFile | Where-Object { $_ -match '^https?://' }
if ($Limit -gt 0) { $urls = $urls | Select-Object -First $Limit }

$rows = New-Object System.Collections.ArrayList
$i = 0
$total = $urls.Count

foreach ($url in $urls) {
  $i++
  $row = [ordered]@{
    url = $url; status = ''; bytes = 0; charset = ''; title = ''; description = ''
    h1 = ''; canonical = ''; alternate = ''; has_viewport = ''; robots = ''
    script_src_count = 0; inline_script_count = 0; img_count = 0; internal_link_count = 0
    jquery_loads = 0; insecure_http_refs = 0; body_text_len = 0; file = ''; note = ''
  }

  try {
    $r = Invoke-WebRequest -Uri $url -UserAgent $UA -UseBasicParsing -TimeoutSec 60 -MaximumRedirection 5
    $row.status = [int]$r.StatusCode

    $bytes = $null
    if ($r.PSObject.Properties.Name -contains 'RawContentStream' -and $r.RawContentStream) {
      $bytes = $r.RawContentStream.ToArray()
    }
    if (-not $bytes) { $bytes = $eucjp.GetBytes([string]$r.Content) }
    $row.bytes = $bytes.Length

    $ct = [string]$r.Headers['Content-Type']
    $html = if ($ct -match 'utf-?8') { $utf8.GetString($bytes) } else { $eucjp.GetString($bytes) }

    $row.charset      = Get-Match $html 'charset=["'']?([A-Za-z0-9\-]+)'
    $row.title        = Get-Match $html '<title[^>]*>(.*?)</title>'
    $row.description  = Get-Match $html '<meta[^>]+name=["'']description["''][^>]+content=["'']([^"'']*)'
    $row.h1           = Get-Match $html '<h1[^>]*>(.*?)</h1>' -replace '<[^>]+>', ''
    $row.canonical    = Get-Match $html '<link[^>]+rel=["'']canonical["''][^>]+href=["'']([^"'']*)'
    $row.alternate    = Get-Match $html '<link[^>]+rel=["'']alternate["''][^>]+href=["'']([^"'']*)'
    $row.robots       = Get-Match $html '<meta[^>]+name=["'']robots["''][^>]+content=["'']([^"'']*)'
    $row.has_viewport = if ($html -match '(?i)name=["'']viewport["'']') { 'yes' } else { 'no' }

    $row.script_src_count     = ([regex]::Matches($html, '(?i)<script[^>]+src=')).Count
    $row.inline_script_count  = ([regex]::Matches($html, '(?i)<script(?![^>]*src=)[^>]*>')).Count
    $row.img_count            = ([regex]::Matches($html, '(?i)<img[^>]+src=')).Count
    $row.internal_link_count  = ([regex]::Matches($html, '(?i)href=["''](?:https?://www\.isp-sp\.com)?/')).Count
    $row.jquery_loads         = ([regex]::Matches($html, '(?i)jquery[.-][0-9]|jquery\.min\.js')).Count
    $row.insecure_http_refs   = ([regex]::Matches($html, '(?i)(?:src|href)=["'']http://')).Count

    $text = $html -replace '(?is)<script.*?</script>', '' -replace '(?is)<style.*?</style>', '' -replace '<[^>]+>', ' '
    $row.body_text_len = ($text -replace '\s+', ' ').Trim().Length

    if ($SaveBody) {
      $f = Get-SafeName $url
      [System.IO.File]::WriteAllBytes((Join-Path $bodyDir $f), $bytes)
      $row.file = $f
    }
  }
  catch {
    $resp = $_.Exception.Response
    if ($resp) { $row.status = [int]$resp.StatusCode } else { $row.status = 'ERR' }
    $row.note = $_.Exception.Message
  }

  [void]$rows.Add([pscustomobject]$row)
  if ($i % 20 -eq 0 -or $i -eq $total) { Write-Output "[$UaProfile] $i / $total" }
  Start-Sleep -Milliseconds $DelayMs
}

$rows | Export-Csv -Path $OutCsv -NoTypeInformation -Encoding UTF8
Write-Output "DONE -> $OutCsv  ($($rows.Count) rows)"

