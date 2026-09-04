# Every URL on this shop changes at the switch — and there is a way out

**2026-09-04.** The client mentioned in passing that he had tested a review on
`https://www.isp-sp.com/view/item/000000023307`. That URL appears **nowhere** in
our archive: not in 195 crawled pages, not in any of the four sitemaps, not in
the design source. The same product is currently at `/shopdetail/000000023307/`.

Chasing it down against the platform's own manual gives the answer, and it is
the largest single risk in this project.

## The two URL spaces

| page | Basic Mode (now) | Creator Mode (after) |
|---|---|---|
| top | `/` | `/` |
| **product** | `/shopdetail/[システム商品コード]` | **`/view/item/[システム商品コード]`** |
| **category** | `/shopbrand/[カテゴリーコード]` | **`/view/category/[カテゴリーコード]`** |
| **free page** | `/html/pageNN.html` | **`/view/<name>`** |
| **news list** | `/new/index.html?mode=list` | **`/view/news/list`** |
| **news article** | `/new/*.html` | **`/view/news/yymmddhhmmss`** |
| cart | `/shop/basket.html` | `/view/cart` |
| search | `/shop/shopbrand.html` | `/view/search?search_keyword=…` |
| 会社概要 | `/html/company.html` | `/view/company` |
| login | `https://www.makeshop.jp/ssl/slogin/` | unchanged |

Source: [ページURL一覧](https://ms-manual.makeshop.jp/shopurl/).

**Only the top page and the SSL member screens keep their address.** Everything
else moves. That is **10,306 URLs** — 9,514 products, 607 categories, 100 news
articles, 82 free pages and the system pages — every one of them indexed today.

### This overturns two things we had written down

- **Q4 said the news URLs stay put.** They do not. `/new/*.html` becomes
  `/view/news/yymmddhhmmss`, and the new form is a timestamp, so the mapping is
  not derivable from the old URL — it has to be read off the platform after the
  switch. 100 URLs, all indexed since 2013.
- **The redirect map covers 1,100 URLs and treats product and category URLs as
  stable.** The real scope is the whole sitemap. What the map has done well —
  the 912 `/smartphone/` URLs — is still right and still needed, but it is now
  the smaller half of the job.

## The way out: URL一括設定

MakeShop has a bulk URL feature that assigns an arbitrary URL to a page, by CSV
([manual](https://ms-manual.makeshop.jp/originalurl/)):

| CSV column | |
|---|---|
| URLタイプ | 1 商品詳細 / 2 カテゴリ / 3 独自ページ / 4 フリーページ |
| システムURL | the platform's own URL |
| 名称 | |
| canonical属性の設定先 | which of the two is canonical |
| 任意URL | `/`-prefixed path, 英数字・ハイフン・アンダースコア・日本語 |
| noindex設定 | |

The decisive sentence is that a page becomes reachable at **both** the system
URL *and* the 任意URL. It is an alias, not a redirect.

**So the current URLs can potentially be re-created as 任意URL and keep working
after the switch** — for products, categories and free pages, which is 10,203 of
the 10,306. That would turn the biggest SEO risk in the project into a CSV
import, and it is the reason this document exists.

### What has to be established before relying on it

1. **Can a 任意URL contain slashes and a `.html` suffix?** Every current URL has
   one or both: `/shopdetail/000000023307/`, `/html/page47.html`. The manual
   permits 英数字・ハイフン・アンダースコア・日本語「等」 and says to enter the
   path under the domain with a leading `/` — which implies slashes are fine and
   leaves `.html` unstated. **Test one page before planning around it.**
2. **Is there a row limit?** 9,514 product rows is not a small import.
3. **Alias, not redirect — so `canonical` is doing the SEO work.** Two live URLs
   for the same page is duplicate content unless canonical points at one of
   them consistently. The CSV column exists for exactly this; it has to be set
   deliberately, not left at a default.
4. **News is not covered.** URLタイプ has no value for お知らせ, so the 100
   article URLs cannot be aliased. They need a different answer.

## What to do about it

- **Test first, on one free page.** `page82` (スマホ用カレンダー・削除しないで
  ください) is the spare — it is not linked from anywhere public.
- Then decide per page class. Products and categories are where the search
  traffic is, so they matter most; free pages we already know carry search entry
  value (page10, page11, page24 and the rest of the column pages).
- News needs its own plan: either accept the change and redirect at the server,
  or accept the loss. 100 URLs indexed for thirteen years is not nothing, and
  this is a Gate-A-sized decision the client has not been asked about yet.

> The lesson worth keeping: this came from one URL the client pasted in passing,
> in a reply about something else entirely. We had crawled 195 pages, read 73
> design files and inventoried 210 tags without ever seeing a Creator Mode URL,
> because the archive can only show what Basic Mode emits. **The destination
> platform's own manual was never read.** That is now the gap being closed.
