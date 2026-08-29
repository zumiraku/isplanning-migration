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

All 83 return 200. None has a viewport. 0 are missing an `h1`; 3 are missing a meta
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
