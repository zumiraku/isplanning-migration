<#
  Stage 0, pass 2 - closes the two gaps left by the first pass:
    a) we held the SP version of 11 URLs only, but every URL is two documents
    b) 9,514 product pages were entirely unsampled
#>
$ErrorActionPreference = 'Continue'

Write-Output "=== 1/3 free pages (MOBILE) ==="
.\tools\crawl.ps1 -UrlFile inventory\urls-freepages.txt -UaProfile mobile `
  -OutCsv inventory\pages-freepages-mobile.csv -SaveBody -DelayMs 1200

Write-Output "=== 2/3 news pages (MOBILE) ==="
.\tools\crawl.ps1 -UrlFile inventory\urls-news.txt -UaProfile mobile `
  -OutCsv inventory\pages-news-mobile.csv -SaveBody -DelayMs 1200

Write-Output "=== 3/3 product sample (desktop) ==="
.\tools\sample-products.ps1
.\tools\crawl.ps1 -UrlFile inventory\urls-products-sample.txt -UaProfile desktop `
  -OutCsv inventory\pages-products-sample.csv -SaveBody -DelayMs 1200

Write-Output "=== classify ==="
.\tools\classify-products.ps1

Write-Output "=== STAGE 0 PASS 2 COMPLETE ==="
