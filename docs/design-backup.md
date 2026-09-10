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


> `design_detailpage.txt` is the one to read first. Its last two thirds are a
> three-tab block — 送料表, 46 category tiles, four recommend slots and the
> review widget — that the rebuild had missed entirely, because two of the three
> panels are invisible in the rendered page the rebuild was driven from. See
> [product-tabs.md](product-tabs.md).

---

## The tracking tags are not in the design — and that turned out to be good news OK

Searched every template for `gtag(`, `googletagmanager`, `G-…`, `AW-…`, Yahoo,
Criteo, Meta, Clarity, `conversion`. **The only third-party tag in the design is
the recommend engine** (`rcmd.jp`), on `design_detailpage.txt` and the three
per-category detail templates.

GA4 `G-BK1PPN5MEV` nevertheless fires site-wide. This section used to end there,
warning that the tags were somewhere we might forget to copy.

**Resolved 2026-09-03 from the archive** (see [analytics-tags.md](analytics-tags.md)).
`design_head_common.txt` begins with `<meta name="googlebot" content="NOODP">`,
so that line marks the boundary between platform output and shop content in any
archived page — and GA4 sits **above** it in every page type, on both the
desktop and smartphone sites. Its wrapper is named `makeshop_ga_gtag`, and the
cart page emits `makeshop_ga_gtag("event", "view_cart", …)` carrying the basket
contents, which no design template could produce.

**GA4 is a shop setting, not design. It survives the mode switch.** The same
goes for the u-komi loader, which is the only other third-party host above the
boundary.

So the conclusion inverts. The residue of Q5 is one screen: the
**order-completion page**, which the crawl could never reach because it needs a
completed order. If a Google Ads or Yahoo conversion tag was pasted into a
Basic-Mode-only slot, that is where it is — and さぶみっと！レコメンド's PV-CV
tag would be on the same page.

※ **One place where a surviving platform tag is a hazard rather than a
relief.** u-komi's loader keeps running after the switch, but its mount div is
design markup and binds reviews with `[SYSTEM_CODE]`. Carry the mount across
with that placeholder unresolved and the widget loads on all 9,514 products with
one identical id. Tracked as C30 / Q13 in [product-tabs.md](product-tabs.md).

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

## 53 category pages have their own template ※

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

## ※ The 適用 button on that screen overwrites the live design

The screen says so in red: 「「適用」ボタンをクリックすると、現在のデザインを上書き
します」. The five rows each have one, next to a delete cross. Nobody should be
sent to that screen without being told which buttons not to press — the download
button at the bottom is read-only, the ones in the table are not.

---

## ※ The backup slots are full, verified 2026-09-04

The デザイン一括バックアップ screen, seen for the first time:

```
■ デザインの一括バックアップ
  現在適用されているショップのデザインを一括保存します。デザインセットは最大5件まで保存できます。

  [ 💾 適用中のデザインを一括保存する ]   <- GREYED OUT, disabled
  ⛔ 保存済みのデザインを削除するまで、デザインの一括保存は出来ません。

  No 適用      デザインセット名称                  保存日時
   1 [適用] デザインセット_20150203              2015/02/03 19:11:51  ✕
   2 [適用] 制作部カスタマイズ着手前_20180712    2018/07/12 16:51:14  ✕
   3 [適用] 制作部カスタマイズ完了_20180717      2018/07/17 17:43:54  ✕
   4 [適用] 20221221_リニューアル前backup        2022/12/21 14:38:28  ✕
   5 [適用] デザインセット_20221226              2022/12/26 16:03:32  ✕

  ※「適用」ボタンをクリックすると、現在のデザインを上書きします。

■ デザインの一括ダウンロード
  [ ⬇ 適用中のデザインを一括ダウンロードする ]   <- enabled
```

**All five slots are taken, so no new design set can be saved without deleting
one of the client's own historical backups first.** This document previously
said "one should be saved before this migration too" as though it were simply a
task to do. It is not: it is a decision only the client can make, because the
alternatives are all his history.

### The two backups are not equivalent

| | 一括保存（デザインセット） | 一括ダウンロード |
|---|---|---|
| where | on the platform | a ZIP on the PC |
| restore | **one click, 適用** | paste each template back by hand |
| slots | 5, all full | unlimited |
| blocked? | yes | **no** |

The distinction matters for a migration: the on-platform set is the only thing
that restores in one action. A ZIP is a record, not an undo button.

### What is excluded from both

The screen lists three, and only the first was known:

- 独自ページ
- **「ファイル管理」でアップロードした画像、CSSなど**
- **トップページ編集＞左メニュー管理「独自ページの左側メニュー1〜10」**

The second is the one to notice. `default.css` and the uploaded images are not
in the design backup at all — they live in ファイル管理 / ギガプラス10 and need
their own export.

### So: download now, decide on a slot separately

The download is enabled, safe and read-only, and **it is worth re-running even
though we have the 2026-09-03 ZIP** — the product template changed on 9/4 when
the client swapped the review feature to u-komi (C30). Our copy is already one
revision behind the live design.

Freeing a slot is a separate question for the client. The obvious candidate is
No.1 デザインセット_20150203, eleven years old and superseded by two later
redesigns, but nobody should delete another company's backup on their own
judgement.

## Re-exported 2026-09-05 03:01 JST — nothing has changed, and one thing is confirmed

The client ran 一括ダウンロード again. Both ZIPs are 175,905 bytes; the hashes
differ, but that is the archive metadata, not the contents.

**All 73 files are byte-identical after EUC-JP → UTF-8 conversion.** The design
has not moved since the previous export.

### The dates line up, and a correction follows

The ZIPs are named for when the platform generated them, in JST:

```
backup_original_design_20260904_001312.zip   2026-09-04 00:13 JST
backup_original_design_20260905_030103.zip   2026-09-05 03:01 JST
```

So what this repository has been calling "the 2026-09-03 export" was actually
generated at **00:13 on 2026-09-04** — early morning, which is exactly when the
client says he switched the reviews:

> 実は9/４の朝方にレビューの変更をしております。

That resolves the apparent contradiction in `product-tabs.md`. The 8/29 crawl
shows the native review because it predates his change; the export shows u-komi
because it was taken minutes after it. Nothing mysterious happened, and nobody
edited the shop behind our backs — the two artefacts simply sit either side of a
change the client told us about himself.

### ※ Confirmed against the *current* design: three templates were missed

Not a stale export any more. As of the 2026-09-05 download:

| template | 旧レビュー live | u-komi |
|---|---:|---:|
| `design_detailpage.txt` | 0 | 1 |
| `design_detailpage_ct261.txt` | **3** | 0 |
| `design_detailpage_ct646.txt` | **3** | 0 |
| `design_detailpage_ct664.txt` | **3** | 0 |

The client believes he did it 「PC・スマホ共」, and for the main template he did.
**The three per-category product templates still carry the old review tags,
uncommented, with no u-komi mount.**

This is not a migration issue and it does not wait for cutover. **MakeShop
retires the old review feature at the end of November 2026**, so products in
those three categories will simply stop showing reviews at that point, whatever
we do. The client can fix it in five minutes now that he knows which three.

`tools/strip-old-review-tags.sh` already produces the cleaned versions, and they
still apply unchanged — the input has not moved.
