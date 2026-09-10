param(
  [string]$Label = 'basic',
  [string[]]$Compare,
  [int]$DelayMs = 800
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$UA  = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
$EP  = 'https://www.isp-sp.com/shop/shopdetail_option.html'

if ($Compare) {
  $a = Import-Csv "spec\price-matrix-$($Compare[0]).csv"
  $b = Import-Csv "spec\price-matrix-$($Compare[1]).csv"
  $map = @{}
  foreach ($r in $b) { $map["$($r.uid)|$($r.option1_id)|$($r.option2_id)"] = $r }
  $nSame = 0; $nDiff = 0; $nMissing = 0
  foreach ($r in $a) {
    $k = "$($r.uid)|$($r.option1_id)|$($r.option2_id)"
    if (-not $map.ContainsKey($k)) { $nMissing++; Write-Output "MISSING in $($Compare[1]): $k"; continue }
    $o = $map[$k]
    if ($o.price -eq $r.price -and $o.no_tax_price -eq $r.no_tax_price -and $o.status -eq $r.status) { $nSame++ }
    else { $nDiff++; Write-Output "DIFF $k : $($Compare[0])=$($r.status)/$($r.price)/$($r.no_tax_price)  $($Compare[1])=$($o.status)/$($o.price)/$($o.no_tax_price)" }
  }
  Write-Output ""
  Write-Output "identical: $nSame   different: $nDiff   missing: $nMissing"
  if ($nDiff -eq 0 -and $nMissing -eq 0) { Write-Output "=> endpoint survives the mode switch. Rebuild the client side only." }
  else { Write-Output "=> endpoint does NOT survive intact. Option pricing must be baked into the template." }
  return
}

$eucjp = [System.Text.Encoding]::GetEncoding(51932)
$sample = Import-Csv inventory\pages-products-sample.csv
$variants = Import-Csv inventory\product-variants.csv | Where-Object { [int]$_.option_count -gt 0 }

$targets = @([pscustomobject]@{
  url = 'https://www.isp-sp.com/shopdetail/000000025283/003/003/X/page1/order/'
  file = 'shopdetail_000000025283_003_003_X_page1_order.16957D17.html'
})
foreach ($v in $variants) {
  $f = ($sample | Where-Object { $_.url -eq $v.url }).file
  if ($f) { $targets += [pscustomobject]@{ url = $v.url; file = $f } }
}

$rows = New-Object System.Collections.ArrayList
foreach ($t in $targets) {
  if (-not (Test-Path "snapshot\desktop\$($t.file)")) { continue }
  $h = $eucjp.GetString([System.IO.File]::ReadAllBytes("snapshot\desktop\$($t.file)"))

  if ($h -notmatch 'updateOptionPriceAjax\(\s*(\d+)') {
    Write-Output "  ! no updateOptionPriceAjax call site in $($t.url) - skipped"
    continue
  }
  $uid = $matches[1]

  $pairs = [regex]::Matches($h,'name="brand_option"[^>]*value="(\d+)_(\d+)"') |
           ForEach-Object { "$($_.Groups[1].Value)_$($_.Groups[2].Value)" } | Sort-Object -Unique
  if (-not $pairs) { continue }

  Write-Output "uid $uid : $($pairs.Count) combinations"
  foreach ($p in $pairs) {
    $o1, $o2 = $p.Split('_')
    $row = [ordered]@{ uid=$uid; option1_id=$o1; option2_id=$o2; status=''
                       price=''; no_tax_price=''; tax=''; point=''; quantity=''; raw='' }
    try {
      $r = Invoke-WebRequest -Uri $EP -Method POST -Body "uid=$uid&option1_id=$o1&option2_id=$o2" `
           -UserAgent $UA -Headers @{ Referer = $t.url } `
           -ContentType 'application/x-www-form-urlencoded' -UseBasicParsing -TimeoutSec 45
      $row.status = [int]$r.StatusCode
      $row.raw = $r.Content.Trim()
      try {
        $j = $r.Content | ConvertFrom-Json
        $row.price = $j.price; $row.no_tax_price = $j.no_tax_price
        $row.tax = $j.tax; $row.point = $j.point; $row.quantity = $j.quantity
      } catch { $row.status = "$($row.status)/UNPARSEABLE" }
    } catch {
      $resp = $_.Exception.Response
      $row.status = if ($resp) { [int]$resp.StatusCode } else { 'ERR' }
      $row.raw = $_.Exception.Message
    }
    [void]$rows.Add([pscustomobject]$row)
    Start-Sleep -Milliseconds $DelayMs
  }
}

$out = "spec\price-matrix-$Label.csv"
$rows | Export-Csv $out -NoTypeInformation -Encoding UTF8
Write-Output ""
Write-Output "captured $($rows.Count) combinations across $(($rows | Group-Object uid).Count) products -> $out"
$rows | Group-Object status | Select-Object Name, Count

