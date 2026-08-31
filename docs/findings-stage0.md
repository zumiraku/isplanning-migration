# Stage 0 findings — baseline crawl, 2026-08-29

Crawled: 83 free pages + 101 news pages + 11 archetypes (desktop UA), 11 archetypes
(iPhone UA). 192 desktop + 11 mobile documents archived to `snapshot/`, raw bytes,
EUC-JP preserved. All 195 URLs returned **200**.

---

## S0-1 — It is not "a PC site plus /smartphone/". Every URL is two documents. 🔴

The dossier understated this. UA detection is **site-wide**, not confined to
`/smartphone/`. Every URL tested returns a completely different document to an
iPhone UA — different markup, different stylesheet, different script stack, and a
viewport meta that the desktop version does not have.

| URL | desktop | iPhone | Δ |
|---|---:|---:|---:|
| `/` | 89,335 B | 134,757 B | +45,422 |
| `/smartphone/` | 89,307 B | 134,711 B | +45,404 |
| `/shopbrand/003/X/` | 110,850 B | 134,875 B | +24,025 |
| `/shopdetail/…25283/…/order/` | 82,644 B | 156,052 B | +73,408 |
| `/shopdetail/000000020354/` | 77,355 B | 153,011 B | +75,656 |
| `/shop/basket.html` | 53,543 B | 108,135 B | +54,592 |
| `/html/info.html` | 60,519 B | 107,807 B | +47,288 |
| `/new/index.html` | 49,692 B | 99,509 B | +49,817 |

`has_viewport` is **no** on all 11 desktop captures and **yes** on all 11 mobile ones.

**Consequence:** the migration is not "make the PC site responsive". It is
*reconciling two complete designs into one* — for every page type. Every SP-only
block, notice and layout decision has to be located and consciously kept or dropped.
The S0 archive is the only record of the SP site once the switch happens.

**Action:** extend the mobile crawl to all 83 free pages and all 101 news pages
before any template work begins. Currently we hold the SP version of 11 URLs only.

---

## S0-2 — The SP stylesheet 404s on every URL except `/smartphone/` 🔴 *live bug*

The mobile template links its reset stylesheet with a **relative** path:

```html
<link rel="stylesheet" href="css/reset.css">
```

Resolution by URL:

| Resolves to | Result |
|---|---|
| `/smartphone/css/reset.css` | **200** (1,779 B) |
| `/css/reset.css` | **404** |
| `/new/css/reset.css` | **404** |
| `/html/css/reset.css` | **404** |
| `/shopdetail/css/reset.css` | **404** |

So the reset loads on exactly one URL on the site. Every other mobile page —
product detail, cart, category, free pages, news — renders without it, on browser
defaults plus `default.css`.

This is happening in production today. Worth telling 山口様: it is evidence that the
current SP site is not in the healthy state it appears to be, and it is fixed for
free by the migration.

---

## S0-3 — 191 of 192 pages depend on deliberately malformed HTML 🔴

Found in the shared template on **191 of 192** desktop pages, verbatim:

> 後述でtd等自動挿入されるため MakeShop独自のテーブルタグを強制的に閉じないようにしております。
> *("Because td etc. are auto-inserted later, we deliberately avoid closing MakeShop's
> own table tags.")*

The site's layout depends on **intentionally unclosed table tags** that Basic Mode's
renderer completes on the fly. Creator Mode does not do this.

This is the single clearest answer to MakeShop's "just press the switch button"
claim, and it is worth showing the client in his own words: the layout is not
merely styled differently, it is structurally dependent on a Basic Mode behaviour
that ceases to exist.

---

## S0-4 — レコメンド identified: さぶみっと！レコメンド (e-Agency) ✅ *closes Q2*

```
//d.rcmd.jp/isplanning/item/recommend.js     (live, 200, 282,805 B)
```

Account ID `isplanning`. This is **さぶみっと！レコメンド**, which publishes a
**dedicated Creator Mode installation manual** — so this is a documented re-install,
not a custom rebuild.

Loading is inconsistent between the two sites:

| | pages referencing `rcmd.jp` |
|---|---|
| desktop | 3 / 192 — product detail only |
| mobile | 11 / 11 — every page, including cart and free pages |

**Follow-on for Q5:** さぶみっと！レコメンド's PV-CV feature requires a **CV acquisition
tag on the order-completion page**. That tag is invisible from outside and must be
inventoried from the admin before cutover, alongside GA4 and any ads tags. If it is
present and we lose it, the client's recommendation engine stops attributing revenue.

---

## S0-5 — 101 news pages are thin, duplicated, and indexed 🟡

`/new/*.html`, 2013 → 2026, all 200, all in the sitemap.

Measured on `2026-07-28-033258.html`: 4,734 characters of extracted text, of which the
actual article is **one sentence** —

> 休業日のお知らせ：8月8日（土）～8月16日（日）まで休業となります。

Everything else is shared header, nav and footer chrome. Duplicate titles across the
archive:

| Title | Count |
|---|---:|
| 夏季休業日のお知らせ | 4 |
| 年末年始の休業日・配達日のお知らせ | 3 |
| 夏期休業日のお知らせ | 3 |
| ■年末年始の休業日＆配達日に関するお知らせ | 2 |
| ホームページリニューアルのお知らせ | 2 |

100 of 101 do have a meta description.

**Recommendation:** do not port all 101 one-for-one. Keep recent and genuinely
informative notices; consolidate the holiday-closure archive. This is an SEO
improvement, not a loss — but it is a content decision, so it belongs to the client
at **Gate A**.

**Still open (Q4):** whether `/new/` is the **ニュース** feature (editable templates
exist in Creator Mode → safe) or **インフォメーション** (discontinued → these URLs need
a plan). Answer from the admin before deciding anything above.

---

## S0-6 — Free pages are SEO content, not filler 🟡 *revises a client assumption*

All 83 return 200. None has a viewport. 0 are missing an h1 (but see S0-16 - all 83 share the SAME h1); 3 are missing a meta
description. Text length 3,196–9,415 chars (avg 5,717), including shared chrome.

The titles show what these pages actually are:

- 引っ越しの挨拶で気をつけたい事 粗品と景品の発見マーケット
- 名入れボールペンのメリットについて 粗品と景品の発見マーケット
- 冬の粗品にブランケットを選ぶ利点 粗品と景品の発見マーケット
- クリスマスの粗品に最適な商品 粗品と景品の発見マーケット
- シーンで選ぶ粗品 …挨拶に使える粗品を種類豊富に販売中～

This is a **content-marketing corpus targeting purchase-intent queries** — not, as
the client put it, pages that "商売には直にかかわるページでもございません".

**Raise with the client.** He authorised a purely cosmetic templating pass on these.
They are more valuable than he thinks, and the templating work should preserve their
search value — heading structure, internal links to the matching category, and the
existing titles — rather than flattening them into a generic layout.

Three pages carry the default site title `粗品と景品の発見マーケット ISPLANNING`
(`page37`, `page82`, `page83`) — untitled pages, exactly the "業者で作成したものや、
自身で作成したのとごちゃごちゃ" the client described. Easy, visible win.

---

## S0-7 — Two conflicting viewport meta tags on every mobile page 🟡

```html
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=2.0, user-scalable=yes">
```

Two tags, contradicting each other on pinch-zoom. The first blocks it — an
accessibility failure. Resolve to a single correct tag in the Creator Mode templates.

---

## S0-8 — Mobile's script stack is cleaner than desktop's ℹ️

Mobile loads **one** jQuery (3.7.1) + migrate. Desktop loads **three** (3.3.1, 3.2.1
over insecure `http://` from an external CDN, 3.7.1) + migrate, and bxSlider twice at
two versions on product detail.

When reconciling the two designs, the **mobile** asset stack is the better starting
point.

---

## S0-9 — The pricing engine is MakeShop's, not the shop's 🔴 *closes Q1*

Full detail in [`spec/option-engine.md`](../spec/option-engine.md). Summary:
`updateOptionPrice` / `updateOptionPriceAjax` appear on **100/100** sampled product
pages including option-less ones, carry an `ActiveXObject` IE fallback and MakeShop's
own Japanese comments, and POST to `/shop/shopdetail_option.html`. They are emitted by
**オプションテーブル形式**, which Creator Mode discontinues.

**Stage 4 is the large branch: the client-side pricing behaviour is a rebuild.**

Oracle captured while Basic Mode is live — 73 combinations across 16 products, all
200, all non-zero → `spec/price-matrix-basic.csv`. Model verified: option1 = colour
(price-neutral), option2 = quantity tier; all seven tiers reconcile exactly against
the on-page unit prices.

## S0-10 — `uid` is not derivable from the URL 🔴

MakeShop's internal product id. The `000000xxxxxx` scheme embeds it; the older
`cccssxxxxxx` scheme does not — `003001000005` → uid **37**, `003003000674` → **1337**.
Deriving it from the path returns `price: 0`, a silent wrong answer rather than an
error. It must be read from the page's own `updateOptionPriceAjax(<uid>, …)` call site.

**Open blocker:** the Creator Mode template must expose that internal id. If no
variable tag provides it, the ~1,400 option-priced products have no way to price
themselves. Verify early.

## S0-11 — Five free pages serve the PC template to phones 🟡 *live bug*

78 of 83 free pages have a viewport under an iPhone UA. These five do not:

| URL | Title |
|---|---|
| `/html/page6.html` | メールマガジン登録 |
| `/html/page7.html` | うちわ メールでのご注文・お見積方法のご案内 |
| `/html/page37.html` | *(default site title)* |
| `/html/page82.html` | *(default site title)* |
| `/html/page83.html` | *(default site title)* |

`page7` is an order/quotation instruction page — commercially relevant and unusable on
a phone today. `page37/82/83` are the same three that carry no custom title (S0-6), so
they are doubly neglected. All five are fixed by definition once the site is responsive.

## S0-12 — News meta descriptions contain raw markup on mobile 🟡 *live SEO bug*

**96 of 101** news pages have a different meta description under an iPhone UA than a
desktop one — and the mobile variant contains escaped HTML:

```
desktop: 2013年8月 ホームページをリニューアルさせて頂きました。検索機能の強化…
mobile : &lt;DIV class=infoh&gt;2013年8月 ホームページを…&lt;BR&gt;検索機能の強化…
```

The SP template builds the description from the article body without stripping tags.
Free pages do not have this problem (0 of 83 differ).

## S0-13 — The design lives in the stylesheet that dies 🔴 *corrects an earlier claim*

I previously recorded the shop's own stylesheet as "our bridge for salvaged rules".
That was wrong, and the correction matters for Stage 2.

| Stylesheet | Fate at switch | Size | Selectors | Colours | Fonts |
|---|---|---:|---:|---:|---:|
| `gigaplus…/isplanning/css/default.css` | **survives** | 22.2 KB | 493 | **0** | **0** |
| `/design/isplanning/m_sys_common.css` | **dies** | 170.9 KB | 1,317 | 785 | 13 |

The surviving file is **entirely spacing utilities** — `.mt0`, `.pl24`, `.ta_c`, every
rule `!important`, evidently generated. It contains no colour and no typography at all.

So the visual design is not something we port from the shop's CSS; it lives in
MakeShop's Basic Mode system stylesheet and disappears on its own. Stage 2 rebuilds the
design from tokens, using the system CSS only as a **reference for what it looked like**.

This also revises what we tell the client. He offered "CSSも不要な部分は消していただいて
結構です" — in fact almost none of the styling is his to delete.

### Brand tokens recovered from the system CSS

| Token | Hex | Uses | Role |
|---|---|---:|---|
| primary | `#007c5a` | 50 | deep green — brand |
| accent | `#98cb00` | 20 | yellow-green |
| accent-dark | `#90b700` | 14 | yellow-green, hover/darker |
| alert | `#e60012` | 14 | red — sale / caution |
| neutrals | `#fff` `#333` `#ccc` `#ddd` | 250+ | ground, text, rules |

Typefaces: **Mochiy Pop One** (display), **Noto Sans JP** (body), Montserrat, plus a
legacy `ＭＳ Ｐゴシック` stack. These carry into the Stage 2 token set.

## S0-14 — ~1.22 MB of JavaScript before a single image 🟡

18 distinct CSS/JS references, all archived to `snapshot/assets/` (`inventory/assets.csv`).

| Script | KB |
|---|---:|
| `gtag/js` (GA4) | 556 |
| `d.rcmd.jp` recommend | 276 |
| jQuery 3.3.1 + 3.2.1 (http) + 3.7.1 | 254 |
| twitter widgets.js | 92 |
| bxSlider 4.1.1 + 4.2.14 | 42 |
| facebook sdk / LINE loader / jquery-migrate | 24 |

Three jQuery builds, two bxSlider builds, and Facebook, Twitter and LINE SDKs — none
of which were visible in the brief. Stage 7 target: one jQuery or none, one slider,
social SDKs replaced with plain share links.

## S0-15 — Free-page content extracted and bucketed; Stage 5 needs 3 templates, not 4 ✅

All 83 free-page bodies are extracted, de-chromed and converted to UTF-8 →
`templates/basic-export/freepages/` (83 files, 1.0 MB). This is the raw material
Stage 5 pours into templates.

Container selectors were useless for this: only 20 of 83 pages use
`<div class="PageArea">`, and the site's `<h1>` sits in the header chrome. The
boundaries are instead derived from the corpus — these are template-generated pages,
so whatever prefix and suffix they all share *is* chrome. Four page-specific values
had to be normalised first or they broke the comparison: the footer's `return_path`
hidden input, the `ssl_tempid` session token, and a long per-page hex comment
MakeShop appends after the footer.

### Archetype distribution

| Archetype | Pages | Avg content | Avg images |
|---|---:|---:|---:|
| `article` | **47** | 1,636 chars | 2.4 |
| `visual-guide` | **28** | 3,122 chars | 8.4 |
| `form` | 4 | 4,906 chars | 14.5 |
| `short-notice` | 2 | 207 chars | 1.5 |
| `link-index` | 1 | 613 chars | 16 |
| `table` | 1 | 89 chars | 0 |

**Two templates cover 75 of 83 pages.** The `form` group is the system-ish pages
(ショッピングガイド, 特定商取引法) which need their own treatment anyway. That leaves four
stragglers to handle individually — a materially smaller job than "60–70 pages".

### Three pages are not editorial pages at all *(corrected 2026-08-30)*

These three carry the default site title, have almost no content, and serve the PC
template to phones. I first recorded all three as retirement candidates. Reading
their actual content shows that was wrong — they are functional pages, and each
needs different handling:

| Page | Content | What it actually is | Handling |
|---|---:|---|---|
| `page37` | 400 chars | The **福袋カタログ PDF** landing page — a real, purposeful page | **Keep.** Give it a proper title; do not retire |
| `page82` | 14 chars | Literally *"spカレンダー用ダミーページ"* — a placeholder for the smartphone calendar | Tied to the SP site, which disappears. Check references, then retire |
| `page83` | 320 chars | A category-banner fragment, 7 images, likely included by other pages | Check references before removing — deleting an include source breaks its callers |

The lesson generalises: **low character count does not mean disposable.** Two of
these are machinery rather than content, and one is a genuine page that simply lost
its title. Every retirement candidate gets its content read before it is proposed
for deletion.

### Also surfaced

- **13 of 83 titles exceed 60 characters** and will truncate in search results.
  `page75` is **120 characters** — its `<title>` has been filled with what reads as a
  meta description ("手ぬぐいは粗品として人気です。名入れなら知名度アップにも…"). Straightforward
  fix during the templating pass, and exactly the "ごちゃごちゃの状態" the client described.
- **1,902 inline `style=` attributes** across the 83 content bodies. These must be
  stripped into the Stage 2 token system rather than carried across, or they will
  defeat the responsive layout at every breakpoint.

## Corrections to the published dossier

| Item | Was | Now |
|---|---|---|
| F2 | "separate `/smartphone/` site" | UA switching is **site-wide**; every URL is two documents (S0-1) |
| Free pages | "60–70" | **83**, all 200 |
| News | not known | **101** thin/duplicated indexed pages (S0-5) |
| Products | not known | **9,514** on two code schemes |
| Categories | not known | **607** |
| Q2 レコメンド | unknown vendor | **さぶみっと！レコメンド**, Creator Mode manual exists (S0-4) |

---

## Next actions

1. Mobile crawl of all 83 free pages + 101 news pages — we hold SP versions of 11 URLs only.
2. Product-variant sampling across the 9,514 products to build variant classes.
3. Export all 607 category titles/descriptions before anything is switched.
4. Admin session: Q1, Q3, Q4, Q5, Q6, Q7 (see `docs/open-questions.md`).

---

## S0-16 — Every page on the site shares one identical h1 🔴 *site-wide SEO defect*

Checked across every archived page type. The value is the same string on all of them:

> 粗品や景品、ノベルティの名入れ通販｜粗品のことなら発見マーケット

| Page type | Pages checked | Distinct h1 values |
|---|---:|---:|
| Free pages | 83 | **1** |
| News articles | 101 | **1** |
| Top / category / product / cart | 11 | **1** |

That is the site tagline, output by the shared header. The actual page topic is
marked up as an **h2** underneath it. So:

- No product page has its product name in an h1.
- No category page has its category name in an h1.
- All 83 content-marketing pages compete with each other on an identical h1.

Extrapolated across the sitemap this affects all **10,306** URLs.

**This corrects a misleading line in S0-6.** I recorded "0 of 83 missing an h1",
which was true but hid the real problem: they are not missing, they are all the
same, which for ranking purposes is worse than absent.

**Why it matters here.** The client asked for the pages to be made "SEO的に有利"
and this is very likely the single largest on-page issue on the site. It is also
close to free to fix: in Creator Mode the h1 is set once per template, so the
product template emits the product name, the category template the category name,
and the free-page template the page heading. No per-page work, no content decisions,
and it lands as a side effect of Stage 3.

**Action:** fold into the Stage 3 template rules and the Stage 6 SEO pass. Worth
telling the client at Gate A, because it is a concrete, measurable improvement he
gets from the migration rather than a cost of it.

---

## S0-17 — The 607 category titles are a real, hand-built SEO asset 🔴 *raises C4*

All 607 category pages crawled, all **200**. The metadata is not boilerplate:

| | |
|---|---:|
| Unique **titles** | **604** of 607 |
| Unique **meta descriptions** | **601** of 607 |
| Categories with no description | 2 |
| Titles over 60 characters | **0** |
| Title length | min 3, max 48, avg 38 |

Someone wrote 604 distinct category titles and 601 distinct descriptions, and
sized them correctly for search results. Compare that with the free pages, where
13 titles overflow 60 characters and one is a meta description by mistake — the
category metadata is in markedly better shape than the rest of the site.

Examples:

- 予算で選ぶの粗品通販ページ100円〜199円まで【粗品と景品の発見マーケット】
- あぶら取り紙の粗品 【粗品と景品の発見マーケット】
- イベント・抽選セット 粗品と景品の発見マーケット

**Creator Mode disables per-category custom page titles.** So this is not a
"likely used" register entry any more — it is used comprehensively, it represents
real invested work, and all of it is destroyed by the switch.

### The risk is now captured, but not yet solved

**Captured:** inventory/categories-seo-backup.csv holds every URL, title,
description and h1 for all 607 categories. If カテゴリ管理 turns out to have no CSV
export, this file is the recovery path. That half of the risk is closed.

**Not solved:** whether Creator Mode can reproduce per-category titles *at all*.
Three options, in order of preference, to settle at Gate A:

1. **Template-generated pattern.** 574 of 607 titles already end in the same
   bracketed shop suffix, so a rule like "category name + suffix" reproduces the
   shape of most of them automatically. Not identical, but consistent and correct.
2. **Conditional overrides for the highest-value categories.** If Creator Mode
   supports branching on category id, hand-restore the top categories by traffic.
   607 conditionals is impractical; the top 50 is not. Needs Search Console and
   GA4 data to rank them — another reason to get that access early.
3. **Accept the loss** on the long tail, with the client informed in advance.

**Action:** this belongs in the Gate A message. It is the clearest case yet of a
Creator Mode limitation costing the client something real, and he should hear it
from us with the mitigation already worked out rather than discover it later.

---

## S0-18 — We are blocked from the live site (403) 🔴 *our doing, 2026-08-30*

Every request to www.isp-sp.com now returns **403 with an empty body**, including the
top page. It is site-wide for this IP, not specific to the pages we were fetching.

**Cause: our own crawl volume.** Across the day this machine made roughly 1,000
requests to the client production site — 195 baseline pages, 100 sampled products,
607 category pages, 73 pricing probes, plus assets and spot checks. Every request was
sequential and spaced 1.2-1.5s, and the total was still enough to look like scraping
to whatever protection MakeShop runs in front of the shop.

**Immediate rule: no further automated requests to isp-sp.com.** Not at a slower
rate, not with a different user agent. Retrying is what turns a temporary block into
a longer one, and working around a block on a client production site is not something
to do quietly.

### What this does and does not cost us

Almost nothing was lost, because the block came after the capture:

- 195 baseline pages, both user agents — **archived**
- 607 category pages with all titles and descriptions — **archived**
- 100-product variant sample — **archived**
- All 18 CSS/JS assets — **archived**
- 73-combination pricing oracle — **archived**
- 83 free-page bodies, extracted — **done**

Not captured: the five unusual pages the client flagged on 2026-08-30, and the cart
page. Those now have to come from the admin console or from the client, not the
public site.

### Recovery

1. Ask the client to confirm the shop still loads normally for him and for customers.
   The block is near-certainly scoped to our IP, but that must be verified rather than
   assumed, and he should hear it from us first.
2. If the same network is used for browsing, the block may affect that browser too.
3. Wait it out. Protection blocks of this kind are usually temporary.
4. If it persists, MakeShop support can clear it - but that means telling the client
   why, so tell him first.

### Going forward

The client granted full admin permissions on the same day, which makes this less
costly than it looks: the console is now the correct source for product, category and
template data anyway. Public-site crawling was only ever the workaround for not having
that access. It is no longer needed and should not resume.
