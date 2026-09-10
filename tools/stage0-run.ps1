$ErrorActionPreference = 'Continue'

Write-Output "=== 1/4 free pages (desktop) ==="
.\tools\crawl.ps1 -UrlFile inventory\urls-freepages.txt -UaProfile desktop `
  -OutCsv inventory\pages-freepages-desktop.csv -SaveBody -DelayMs 1200

Write-Output "=== 2/4 news pages (desktop) ==="
.\tools\crawl.ps1 -UrlFile inventory\urls-news.txt -UaProfile desktop `
  -OutCsv inventory\pages-news-desktop.csv -SaveBody -DelayMs 1200

Write-Output "=== 3/4 archetypes (desktop) ==="
.\tools\crawl.ps1 -UrlFile inventory\urls-archetypes.txt -UaProfile desktop `
  -OutCsv inventory\pages-archetypes-desktop.csv -SaveBody -DelayMs 1500

Write-Output "=== 4/4 archetypes (mobile) ==="
.\tools\crawl.ps1 -UrlFile inventory\urls-archetypes.txt -UaProfile mobile `
  -OutCsv inventory\pages-archetypes-mobile.csv -SaveBody -DelayMs 1500

Write-Output "=== STAGE 0 CRAWL COMPLETE ==="

