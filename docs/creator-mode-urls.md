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

---

## What it costs inside our own deliverable: 646 links

`tools/inventory-internal-links.sh` → `inventory/internal-links.csv`

The converted free pages are full of links written in the old URL shapes. They
are not broken today, and after the switch they will not *look* broken either —
they will 404 one at a time, wherever a customer happens to click.

| class | links | becomes |
|---|---:|---|
| free page (`/html/pageNN.html`) | **404** | `/view/<name>` |
| category (`/shopbrand/…`) | **219** | `/view/category/…` |
| product (`/shopdetail/…`) | **23** | `/view/item/…` |
| | **646** across **80 of 86 pages** | |

The 404 free-page links are the ones to notice. These pages link to each other
heavily — they are a column network, built for search — so the damage is not 404
isolated pages but the internal linking that gives them their search value.

**Both possible outcomes need this number.** If URL一括設定 can re-create the
current URLs, none of these need touching and the number is zero. If it cannot,
646 links across 80 pages is the rewrite, and it is mechanical rather than
difficult — but it cannot be estimated without having counted.

> Worth noting what this does *not* count: the 607 category pages and 9,514
> product pages also link to each other, through templates we have not rebuilt
> yet. The template links are one edit each, because they are generated. These
> 646 are hand-written into page bodies, which is why they are the awkward ones.

## The client's own question, answered

> 季節で選ぶ粗品 https://www.isp-sp.com/html/page5.html
> これは独自ページで大丈夫かな

**Yes.** page5 is converted, renders clean at all three widths, and needs no
special handling as a page.

But it is also a good illustration of the above: page5 is 23 links into the
seasonal categories (`/shopbrand/004/…` spring, `005` summer, `006` autumn,
`007` winter). The page survives the switch. **Every link out of it does not**,
unless the category URLs are preserved. A seasonal landing page whose links all
404 is worse than no landing page, because it is still indexed.

---

## フリーページのURLは `/view/page/` 固定 — 実機で確認、2026-09-05

`page82` を1枚だけ作って確かめました。フリーページ編集画面のURL欄はこうです。

```
ページURL   /view/page/ [ html/page82.html ]
            /view/page/html/page82.html
```

**接頭辞 `/view/page/` は変えられません。** 編集できるのはその後ろだけです。

つまり **現在の `/html/pageNN.html` は再現できません。** エラーで弾かれたのでは
なく、動かせない部分があるという構造上の理由です。

### 分かったこと

- 後半には **スラッシュも `.html` も使えます**（`html/page82.html` が通った）
- したがって、現行URLの「形」は保てるが「位置」は保てない

### 決めたこと: 後半を `html/pageNN.html` にする

`/view/page/html/page82.html` という形になります。冗長に見えますが、理由が
3つあります。

1. **旧→新の対応が機械的**になります。`/html/X` に `/view/page/` を足すだけで、
   82ページ分の対応表が一意に決まります。例外が1つもありません
2. **内部リンク646本の書き換えが、接頭辞の一括挿入で済みます。** ページごとの
   判断が発生しません
3. **サーバ側で転送を設定する場合も、規則1本で書けます**

`page82` のような短い名前にすると見た目は綺麗ですが、82ページ分の対応表を
人が作ることになり、間違えたときに気づけません。

### まだ残る問題

これで**フリーページ82件のURLが変わることが確定**しました。13年分の被リンクと
検索評価がかかっています。残る望みは **URL一括設定**（機能一覧にある別機能、
CSVで任意URLを付与できる）で、そちらで `/html/pageNN.html` を再現できるかを
別途試す必要があります。

フリーページ管理の画面で再現できないことと、URL一括設定で再現できないことは
別の話です。まだ諦める段階ではありません。
