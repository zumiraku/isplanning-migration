# isp-sp.com — MakeShop ベーシックモード → クリエイターモード 移行

Working repo for the migration of **発見マーケット (www.isp-sp.com)** from MakeShop
Basic Mode to Creator Mode (responsive).

| | |
|---|---|
| Client | アイエスプランニング株式会社 / 山口裕二様 |
| Shop ID | `isplanning` |
| Contract | 2026-08-24 (仮払い済 2026-08-24) |
| Admin access | 2026-08-27 (副管理者) |
| Delivery | **2026-11-16 (Mon)** |
| Platform deadline | Basic Mode abolished **2027-03-31 15:00** |
| Plan dossier | https://claude.ai/code/artifact/26d0e5aa-3260-4527-92bb-65a2d1bfc713 |

## Why this repo exists

The MakeShop admin console has **no version history**. A mis-paste into a template
field is unrecoverable from the platform side. Every template, stylesheet and script
is exported here and committed after each change, so we can always diff and always
restore. This repo — not the console — is the source of truth.

> Note: `git.exe` is installed at `C:\Program Files\Git\cmd\git.exe` but is **not on
> PATH** in this shell. Scripts here call it by full path, or add it to PATH with:
> `$env:PATH += ";C:\Program Files\Git\cmd"`

## Site size (measured 2026-08-29 from sitemap.xml)

| Class | Count | Notes |
|---|---:|---|
| Free pages `/html/*.html` | **83** | The 独自ページ the client estimated at "60〜70" |
| News articles `/new/*.html` | **101** | 2013 → 2026, still indexed. Plus `/new/index.html` |
| Category pages `/shopbrand/…` | **607** | |
| Product pages `/shopdetail/…` | **9,514** | 9,025 on `000000xxxxxx`, 488 on an older `cccssxxxxxx` scheme |
| **Total in sitemap** | **10,306** | |

Notes:
- `robots.txt` returns **404**. Fix at cutover.
- `sitemap.xml` is a sitemap index → 4 sub-sitemaps. `brand0` holds exactly 5,000
  URLs, i.e. it is capped — confirm nothing is being silently omitted.
- The client never mentioned the catalogue size. 9,514 product pages means the
  product-detail template and its pricing logic must be validated by **variant class**,
  not page by page.

## Layout

```
docs/         analysis, registers, decisions, client-facing summaries
snapshot/     immutable "before" archive — raw bytes, EUC-JP preserved
  desktop/    crawled with a desktop UA
  mobile/     crawled with an iPhone UA (the /smartphone/ site only appears here)
  assets/     CSS / JS / images pulled from the live site
inventory/    CSV inventories: URLs, per-page metadata, free pages, tags
spec/         behaviour specs we must reproduce (pricing engine, page types)
baseline/     full-page screenshots at 375 / 414 / 768 / 1024 / 1440
templates/    creator/ = what we build; basic-export/ = exported Basic Mode source
tools/        crawl + capture scripts
```

## Tools

```powershell
# Full Stage 0 capture (sequential, rate-limited — live production shop)
.\tools\stage0-run.ps1

# One list, one user-agent profile
.\tools\crawl.ps1 -UrlFile inventory\urls-freepages.txt -UaProfile desktop `
                  -OutCsv inventory\pages-freepages-desktop.csv -SaveBody
```

`crawl.ps1` archives **raw bytes** and never re-encodes. The site is EUC-JP; it is
decoded for parsing only. Anything salvaged for Creator Mode passes through an
explicit EUC-JP → UTF-8 conversion with a mojibake check.

## Crawl etiquette

This is the client's live shop, in trading hours, with no staging environment.
One request at a time, 1.2–1.5s apart, honest user-agent. Do not parallelise.
Do not crawl all 9,514 product pages — sample by variant class instead.

## Ground rules

- **Never commit credentials.** The sub-admin login arrived in plain chat; it stays
  out of this repo. Ask the client to rotate it at handover.
- **Never edit a Creator Mode template without exporting the current version first.**
- **Three client sign-off gates** — A: functional changes (wk 2) · B: design direction
  (wk 3) · C: free-page templates (wk 6). Nothing downstream starts until each closes.
- **Weekly written report to the client, Mondays.**

---

## Current state — 2026-08-30

### Done (no console access required)

| | |
|---|---|
| Baseline archive | 195 pages, raw bytes, EUC-JP preserved, desktop + iPhone UA |
| Asset archive | all 18 referenced CSS/JS files (1.4 MB) |
| Product sample | 100 products, stratified, classified into variant classes |
| Free-page content | all 83 bodies extracted, de-chromed, UTF-8 |
| Pricing oracle | 73 option combinations across 16 products, all verified |
| Design system | tokens + components + the rebuilt pricing module |
| Gate B mocks | top page and product detail, real content throughout |
| Redirect map | 184 at-risk URLs (83 free pages + 101 news) |

### Blocked on the MakeShop console

See [docs/admin-extraction-checklist.md](docs/admin-extraction-checklist.md).
Two items are urgent because Creator Mode destroys them permanently:

1. **607 category custom titles and descriptions.** If カテゴリ管理 has no CSV
   export, then inventory/pages-categories-desktop.csv — crawled from the
   rendered pages — is the only recovery path.
2. **Full product CSV**, to count products carrying スマホ用商品詳細説明, which
   stops working at the switch.

### What the survey changed

- Stage 4 is a **rebuild**, not a port: the pricing engine is MakeShop platform
  JavaScript, emitted by a feature Creator Mode discontinues.
- Stage 5 is **smaller** than the brief implied: two templates cover 75 of 83 pages.
- The design must be **rebuilt from tokens**: the stylesheet that survives the
  switch contains no colours and no typography at all.

### Shell notes for this machine

- Git is installed under Program Files but is **not on PATH**.
- The Bash tool strips single quotes, so quoted heredocs fail. Use an unquoted
  delimiter — and remember that backticks and dollar signs still expand, so keep
  them out of appended content or escape them.
- PowerShell 5.1 reads a BOM-less UTF-8 script file as ANSI. Japanese literals in
  the tools are built from code points for that reason.
