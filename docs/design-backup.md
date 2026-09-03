# The Basic Mode design source (checklist §A — now complete)

The client ran **デザイン一括バックアップ** on 2026-09-03 and sent the ZIP.
Unpacked, converted from EUC-JP to UTF-8, and committed to
`templates/basic-export/design/`.

This closes section A of the extraction checklist, which had been open since the
project started. Until now every template had been reverse-engineered from
*rendered* HTML in `snapshot/`; this is the source as typed into the admin.

```
design_topmenu.txt        4,435   header
design_leftmenu.txt       8,831   left sidebar — the one we re-homed into the footer
design_bottom.txt        10,826   footer
design_mainpage.txt     10,796   top page
design_brandpage.txt      3,095   category listing
design_detailpage.txt    17,055   product detail
design_basketpage.txt     6,963   cart
design_searchpage.txt     2,647   search results
design_imagepage.txt      1,614   image zoom
design_loginform_in/out     315   login forms
design_popup*.txt           743
m_sys_common.txt        175,971   the system stylesheet
heads/design_head_common.txt   2,049
heads/design_head_top.txt        301
heads/design_head_category.txt     0   (empty)
categorypages/*.txt        53 files, avg 4.3 KB
detailpages/*.txt           3 files (ct261, ct646, ct664)
title_images/*.gif          2 files
```

---

## 🔴 The tracking tags are NOT in the design

Searched every template for `gtag(`, `googletagmanager`, `G-…`, `AW-…`, Yahoo,
Criteo, Meta, Clarity, `conversion`. **The only third-party tag anywhere in the
design is the recommend engine** (`rcmd.jp`), on `design_detailpage.txt` and the
three per-category detail templates.

But GA4 `G-BK1PPN5MEV` fires site-wide — we measured that from the crawl. So it
is injected by the platform from a separate settings screen, not from the design
templates.

**Two consequences, and the second is the point of writing this down:**

1. **Q5 is not answered by this backup.** The conversion tags on the
   order-completion page still have to be read from the tag settings screen
   (ショップ構築 → SEO・マーケティング → タグの設定, per C13).
2. **Taking the design backup and assuming everything is captured would lose
   them.** Anyone reasoning "we have the full design, so we have everything"
   switches mode and finds the analytics gone. They are not in the thing that was
   backed up.

`design_head_common.txt` does hold three `google-site-verification` meta tags,
jQuery, the Google Fonts links, `default.css`, and page-behaviour scripts
(sticky header, back-to-top, cart-count text). Those we now have verbatim.

## The core migration inventory: 210 Basic Mode tags

`tools/inventory-basic-tags.sh` → `inventory/basic-mode-tags.csv`

| | |
|---|---:|
| Distinct tags in use | **210** |
| Output tags | **176** |
| Control-flow tags (`[IF…]`, `[ELSE]`, `[ENDIF]`, `[END]`) | 34 |

**This list is the migration.** Each tag either has a Creator Mode equivalent or
it is a functional gap, and until now we had no idea how many there were. The
heaviest users are the listing templates:

```
113  [BRANDNAME]        brandpage, detailpage, searchpage
108  [BRAND_URL]        brandpage
 58  [WISHLIST]         brandpage, detailpage
 58  [DETAIL]           brandpage, detailpage
 57  [LIST]             brandpage, popup
 55  [SORTRECOMMEND] [SORTPRODUCT] [SORTPRICE] [SORTBRANDNAME] [PAGER] [TOTAL] …
```

Those `[SORT…]` tags are the five sort options the category rebuild was corrected
to — now confirmed from the source rather than inferred from the rendered page.

> Counting these needed `grep -F`. `[BRANDNAME]` is a character class to grep,
> matching any one of B, R, A, N, D, M, E — the first run reported 26,314 uses of
> one tag and claimed every tag appeared in the stylesheet.

## 53 category pages have their own template 🔴

`design_categorypages/` holds **53 files, all different from each other**, each
built as the standard category page plus per-category conditional blocks:

```html
[IF_CATEGORY_CODE_ct19]<ul class="categotybanner">…
```

Three product-detail templates are per-category too (`ct261`, `ct646`, `ct664`).

**This is scope nobody had counted.** The plan had one category template and one
product template; there are 1 + 53 and 1 + 3. Most of the 53 differ only in a
banner block, so they collapse into one template plus data — but that has to be
verified per file, and it is 56 files of bespoke markup either way.

## design_searchpage.txt — a page type we could not build

The search-results template was never archived (the crawl never hit a search
URL), so no mock exists for it. The source is now here, and it uses the same
`[SORT…]`, `[PAGER]`, `[TOTAL]` tags as the category listing — so the category
components should cover it.

## Design-set history

The backup screen lists five saved sets:

| | | |
|---:|---|---|
| 1 | デザインセット_20150203 | 2015/02/03 |
| 2 | 制作部カスタマイズ着手前_20180712 | 2018/07/12 |
| 3 | 制作部カスタマイズ完了_20180717 | 2018/07/17 |
| 4 | 20221221_リニューアル前backup | 2022/12/21 |
| 5 | デザインセット_20221226 | 2022/12/26 |

A shop that has taken a backup before each past change. **One should be saved
before this migration too**, named for it.

## ⚠️ The 適用 button on that screen overwrites the live design

The screen says so in red: 「「適用」ボタンをクリックすると、現在のデザインを上書き
します」. The five rows each have one, next to a delete cross. Nobody should be
sent to that screen without being told which buttons not to press — the download
button at the bottom is read-only, the ones in the table are not.
