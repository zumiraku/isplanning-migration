# The 53 category templates — and a live pricing defect found inside them

`design-backup.md` flagged 1 + 53 category templates and 1 + 3 product templates
as **scope nobody had counted**, and guessed that "most of the 53 differ only in
a banner block, so they collapse into one template plus data — but that has to
be verified per file". This verifies it.

`tools/analyse-category-templates.sh` → `inventory/category-templates.csv`

Each template is reduced to a *skeleton* — the sequence of tags and Basic Mode
variable tags, with all text, attributes and whitespace removed — and compared
against the standard `design_brandpage.txt`. Per-category content is the point
of these files, so it must not read as a structural difference. The question is
not "are they different"; it is **can they be one template plus data, or are
some genuinely different pages?**

## The answer: 52 of 53 are data

| | |
|---:|---|
| **35** | same variable tags, extra markup — and 34 of those add exactly one thing: `categotybanner` / `caption` / `mask`, the banner block. Two add a button, one adds the seasonal tile block. **Data.** |
| **11** | omit `[CATEGORY_IMAGE]` — no category header image. **A flag.** |
| **3** | use `[GROUP3_7]` instead of `[GROUP4_0]` — sub-categories three across instead of four. **A number.** |
| **3** | use `[PRICE]` where the standard uses `[TAXPRICE]` ※ **not data — see below** |
| **1** | `ct646`, 16 KB, genuinely bespoke. It also has its own product template, and its tab labels differ from every other page's |

So the rebuild needs **one category template, a per-category data table, and one
special case** — not 53 files of bespoke markup. That is the scope reduction the
project needed, and it is measured rather than assumed.

---

## ※ Three categories show prices without tax, labelled 「（税込）」

This is not a migration risk. **It is wrong on the live site right now.**

`ct28`, `ct31`（冬の粗品）and `ct66`（便利な粗品）render `[PRICE]` where every
other category renders `[TAXPRICE]`. The surrounding markup is identical in both,
including the label:

```html
<p class="M_cl_price red">販売価格<span class="M_cl_taxPrice">[PRICE]</span>円<span class="M_outtax">（税込）</span></p>
```

### Proved from the archive, not inferred

40 products appear both on the winter category page and on a category using the
standard template. **Every one of the 40 shows a different price**, and the ratio
is the consumption tax to four decimal places:

| product | winter page | elsewhere |
|---|---:|---:|
| 000000025277 | 31,200 | 34,320 |
| 000000025297 | 23,840 | 26,224 |
| 000000025298 | 14,352 | 15,787 |
| 000000025299 | 14,328 | 15,760 |

```
40 of 40 products, ratio 1.1000 (34 of them exactly, 6 at 1.0999 from rounding)
```

So `[PRICE]` is 税抜 and `[TAXPRICE]` is 税込, and three categories are showing
the pre-tax number under a 税込 label.

### Why it matters more than a display bug

- **The winter category alone lists 1,575 products.** A customer browsing it sees
  31,200円（税込）for something that costs 34,320円 — 10% low, at the moment they
  are deciding.
- Japan's 総額表示義務 requires the tax-inclusive price to be shown. A pre-tax
  figure labelled 税込 is not a formatting preference.
- It is silent. Nothing looks broken; the number is simply wrong, and only on
  three of 607 categories, which is why it has survived.

### What to do

Not our call to make quietly. The fix in the rebuild is trivial — one tag — but
**it is live now and the client should know today rather than at cutover.** He
may also want the two categories we could not name (`ct28`, `ct66` are not in the
crawled category list) checked in the admin, and the same swap looked for in the
`[PRICE]`-using product templates.

> This is the second time reading the templates rather than the rendered pages
> has turned up something the rendered pages could not show. The first was the
> product page's three-tab block. Both were invisible for the same reason: the
> archive shows what Basic Mode emitted, and what it emitted was already the
> output of a template nobody had read.

---

## The data table, and the prose that was nearly lost

`tools/extract-category-data.sh` → `inventory/category-data.csv`

52 rows — one per category, `ct646` excluded as the one bespoke case.

| column | |
|---|---|
| `caption` | **34 categories carry a description written for that category and nowhere else** |
| `shared_tiles` | the promotional tiles beside it |
| `category_image` | 11 say `no` |
| `subcat_columns` | 4, or 3 for two of them |
| `price_tag` | `TAXPRICE`, or `PRICE` for the three in C36 |

### The first version of this tool was wrong, and usefully so

It recorded **the banner image** as the per-category data. Then the totals came
back: 36 of the 40 banners are the same file, `housounosiname3.png`. A banner
that appears in 36 of 52 templates is not a variation — it is a shared promotion
that belongs in the template once, and treating it as data would have produced
36 identical rows describing nothing.

The real per-category data was one level down. A `categotybanner` block is a row
of tiles; the *first* holds `[CATEGORY_IMAGE]` with a caption written for that
category, and the tiles after it are the shared promos.

**That caption is the only per-category prose in these files.** It is not in the
category's SEO description, not in the crawled page inventory, and not anywhere
else in the export. 34 of them, median 17 characters, longest 318:

```
ct111  環境にやさしいエコな粗品を多数掲載しております。SDGsやサステナブル、
       環境保護、リサイクル、持続可能性と多様性がうたわれる昨今、企業イメージ
       が問われる時代です。
ct126  多くのアウトドアグッズ・レジャーグッズを取り揃えています。…
ct141  花の種、観葉植物、花柄の商品の粗品
```

A rebuild that took "the 53 differ only in a banner" at face value would have
dropped all 34 without anything looking wrong. All 34 were verified
character-for-character against the source before this was written down.

> The lesson is the same one C28 and the product tabs taught: **the summary of a
> difference is not the difference.** "They differ only in a banner block" was
> nearly right, and the part it rounded off was the only writing in the files.
