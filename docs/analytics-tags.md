# Where the tracking tags actually come from (Q5 — answered from the archive)

**2026-09-03.** GA4 `G-BK1PPN5MEV` fires on every page of the live shop, and it
is in none of the 73 files of the design backup and none of the three
`bodyタグ直下メッセージ` slots. Two console screens had already been searched for
it without success.

It was not necessary to keep looking. **The archived HTML says where it comes
from**, because the shop's own head content has a known first line.

## The boundary

`design_head_common.txt` begins:

```html
<meta name="googlebot" content="NOODP">
```

So in any archived page, everything above that line was emitted by the platform
and everything from it down is the shop's. Locating it in each page type:

| page | GA4 at line | 共通head管理 starts | verdict |
|---|---:|---:|---|
| top (`/`) | 18 | 28 | platform |
| category (`/shopbrand/003/003/X/`) | 15 | 27 | platform |
| product (`/shopdetail/000000003919/`) | 15 | 263 | platform |
| cart (`/shop/basket.html`) | 12 | 16 | platform |
| free page (`/html/page10.html`) | 14 | 20 | platform |
| smartphone (`/smartphone/html/page1.html`) | — | — | platform (same ID) |

**GA4 is injected by MakeShop above the design, on every page type, on both the
desktop and the smartphone site.** It was never in the design and could not have
been.

## The function name is the proof

```js
window.dataLayer = window.dataLayer || [];
function makeshop_ga_gtag(){dataLayer.push(arguments);}
makeshop_ga_gtag('js', new Date());
makeshop_ga_gtag('config', 'G-BK1PPN5MEV');
```

`makeshop_ga_gtag` — the platform names its own wrapper. And the cart page adds:

```js
makeshop_ga_gtag("event", "view_cart", {"currency":"JPY","value":0,"items":[]})
```

An ecommerce event, with the cart contents serialised into it. **A design
template cannot produce that** — it needs the order data. This is MakeShop's
built-in GA4 integration, configured from a settings screen.

## What that means for the migration

**GA4 is a shop setting, not design, so it survives the mode switch.** This is
the opposite of what `design-backup.md` feared when it found no tag in the
design: the risk was that the tags were somewhere we would forget to copy. They
are somewhere we cannot break.

The residue of Q5 is now narrow, and it is worth stating what is *not* settled:

- **Conversion tags on the order-completion page.** The crawl never reached
  `/shop/thanks.html` (it needs a completed order), so the archive cannot answer
  what fires there. If a Google Ads or Yahoo conversion tag was pasted into a
  Basic-Mode-only slot, it is still at risk. This is the one thing left to read
  from the console, and it is a single screen.
- **Whether the GA4 integration is scoped per mode.** Nothing suggests it is —
  it is shop-level — but it costs one glance at the same screen to confirm.

The other watch item: 「さぶみっと！レコメンド」's PV-CV feature wants a CV tag on
that same completion page. Same screen, same check.

## The other thing the platform injects: u-komi

Every desktop page carries exactly two third-party hosts above the design
boundary:

```
api.u-komi.com
www.googletagmanager.com
```

`api.u-komi.com/…/widget.js` is the **u-komi** review service. Like GA4, the
loader is platform-injected and survives the switch. Unlike GA4, it needs
something from the design to be useful: the mount div on the product page,
whose `data-pid` is `[SYSTEM_CODE]`. See [product-tabs.md](product-tabs.md) —
this is the one place where a surviving platform tag makes a design omission
*worse*, because the widget will load and bind every product to the same id.

> The 2026-09-03 note in `design-backup.md` — "the platform injects it from a
> separate settings screen" — was right about the mechanism. What it could not
> say, and what this settles, is that being platform-injected means it is safe.
