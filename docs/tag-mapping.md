# The 210 tags, and where each one goes

`design-backup.md` put it plainly: **"This list is the migration."** Every Basic
Mode tag the shop's templates use either has a Creator Mode counterpart or it is
a functional gap — and a gap found by a customer is the failure this project
exists to prevent.

Until 2026-09-04 we were inferring those counterparts from the archive. We did
not need to. **The destination platform publishes a tag reference**, one page per
page type:

```
http://reference.makeshop.jp/taglist/creator-mode/common.html      全ページ共通
                                                 /category.html    商品カテゴリー
                                                 /detail.html      商品詳細
                                                 /search.html      商品検索結果
                                                 /news-list.html   お知らせ一覧
                                                 /news-detail.html お知らせ詳細
                                                 /guide.html       利用案内
                                                 /company.html     会社概要
                                                 /contract.html    特定商取引法
                                                 /modifier.html    修飾子
                                                 /hook.html        フック関数
```

`tools/map-tags-to-creator.sh` → `inventory/tag-mapping.csv`

## Where it stands

| | tags | uses |
|---|---:|---:|
| **判明** — counterpart read off the reference | 23 | **1,154 (47%)** |
| **不要** — dissolves, retired, or already unused here | 12 | 350 (14%) |
| **欠落** — no counterpart exists | **1** | 55 (2%) |
| **要確認** | 174 | 902 (37%) |

**63% of all tag use is settled.** Twenty-three tags carry 47% of it on their
own, because the listing templates use the same handful a hundred times each. Coverage by
*use* is the number that matters; coverage by *count* makes the work look barely
started when the heaviest lifting is done.

## The shape changes, so a one-to-one row is a bookkeeping device

Basic Mode tags are standalone substitutions — `[BRANDNAME]` means "the product
name, here". Creator Mode is a loop with a subject:

```
[BRANDNAME]   →   $item.name                        (商品詳細)
              →   $category.item.list[i].name       (一覧の中)
```

Same tag, two answers, depending on which template it sits in. The CSV records
both and says so; it is not a search-and-replace instruction.

## What is already settled

| Basic | Creator | |
|---|---|---|
| `[SYSTEM_CODE]` | `$item.system_code` | Q13. u-komi binds reviews with it |
| `[BRANDNAME]` | `$item.name` / `$category.item.list[i].name` | |
| `[BRAND_URL]` `[DETAIL]` | `$category.item.list[i].url` | Basic had the URL and the link as separate tags |
| `[WISHLIST]` | `…favorite_entry_url` | |
| `[BASKET]` | `…cart_entry_url` | |
| `[IMAGE_URL]` | `…image_M` | S / M / L available |
| `[ICON]` | `…icon.list[j].image_url` | a loop inside the loop |
| `[TAXPRICE]` | `…price` | 税抜は `price_excluded_tax` |
| `[ZAIKO]` | `…stock_quantity` | 表示可否は `is_stock_display` |
| `[TOTAL]` | `$category.total_count` | |
| `[PAGER]` | `$category.pager` | |
| `[NAMECURRENT]` | `$category.name` | |
| `[SORTRECOMMEND]` | `$category.sort_recommend_url` | |
| `[NEWSORT]` | `$category.sort_new_url` | |
| `[SORTBRANDNAME]` | `$category.sort_name_url` | |
| `[SORTPRICE]` | `sort_high_price_url` / `sort_low_price_url` | **one tag becomes two** |

## The ten that dissolve

`[PRODUCTION_START]`, `[PRODUCTION_ITEM4_START]`, `[PRODUCTION_ITEM_END]`,
`[PRODUCTION_END]`, `[GROUP4_0]`, `[SUISEN4_2]`, `[ADDCLASS]`, `[ADDCODE]` and
their relatives are Basic Mode's **listing-layout system** — open the loop, open
a row of four, inject a class per cell, close. Creator Mode has one loop and the
columns are CSS. There is no counterpart to find, and counting them as unknown
overstated the remaining work by 434 uses.

## The ones that still matter

| uses | tag | why it needs an answer |
|---:|---|---|
| 57 | `[LIST]` | the breadcrumb trail |
| 55 | `[UBRANDCODE]` | |
| 55 | `[SORTPRODUCT]` | **単価順.** No matching sort URL is documented, and on this shop everything is priced per unit — losing it is a real loss of function, not a cosmetic one |
| 54 | `[SUGU]` | 一発購入. The client has been asked whether it is in use (Gate A) |
| 44 | `[CATEGORY_IMAGE]` | |
| 29 | `[ENDIF_CATEGORY_CODE]` | the per-category conditional the 53 templates are built on |

`[SORTPRODUCT]` is the one to settle first. Four of the five sort options map
cleanly and the fifth is the one this shop's buyers would miss.

---

## 🔴 The first confirmed loss: 単価順

`[SORTPRODUCT]` is 単価順, and it is on the live category page today:

```html
並び替え：<a href=[NEWSORT]>新着順</a> <a href=[SORTRECOMMEND]>おすすめ順</a>
         <a href=[SORTPRODUCT]>単価順</a> <a href=[SORTPRICE]>価格</a>
         <a href=[SORTBRANDNAME]>商品名</a>
```

Creator Mode offers six sorts, on both the category and the search pages:

```
sort_recommend  sort_new  sort_high_price  sort_low_price  sort_name  sort_manufacturer
```

**単価順 is not among them, and there is no way to construct it.** Four of the
five sorts this shop uses map cleanly; the fifth does not exist.

That is worse here than it would be almost anywhere else. This is a 粗品 shop:
products are sold in units of 10, 84, 100, and 価格 is what a *unit* costs while
単価 is what *one item* costs. A buyer choosing between a ¥2,680 pack of ten and
a ¥9,320 pack of a hundred is comparing 268 against 93 — and 価格順 sorts those
in the opposite order to the one they care about. It is the sort that matches
how this shop's customers actually shop.

There is no technical fix, so it is a decision, not a task. The options are to
accept the loss, to replace it with 価格が安い順 and say so, or to ask MakeShop
whether 単価 sorting is on their roadmap. **The client has not been told**, and
this belongs in the next message to him rather than in a release note.

> This is what the tag inventory was for. Eighteen tags mapped and ten dissolved
> are useful bookkeeping; **finding the one that cannot be carried across is the
> point**. A `欠落` row is not work waiting to be scheduled — it is a capability
> the shop loses unless somebody decides otherwise, which is why the tool counts
> it separately from "not looked at yet".

`[LIST]` is settled at the same time: `$category.breadcrumb_list.list[i].name`
and `.url`, with `$search.breadcrumb_list` on the search page.
