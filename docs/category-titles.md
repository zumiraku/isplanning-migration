# The 607 category page titles (C4 / C35)

**Resolved 2026-09-05. 606 of 607 restored character for character.**
Not reproduced from a rule — restored from the originals.

## What was at stake

Creator Mode removes the per-category title field in カテゴリ設定. 607 categories,
604 distinct titles, hand-written over thirteen years, all of them gone at the
moment the design set is applied. Sorting out page titles is one of the three
things the client named in the brief, so leaving these to a default was never an
option.

## What the plan used to be, and why it was wrong

The plan was to regenerate them from a rule. `tools/analyse-category-titles.ps1`
measured how far that gets:

| Rules | Titles reproduced exactly | |
|---:|---:|---|
| 1 | 294 of 607 | 48% |
| 5 | 385 of 607 | 63% |
| 10 | 456 of 607 | 75% |

and C35 recorded the rule's weak point: the dominant shape needs the **parent**
category name, and the reference lists no `$category.parent` tag. If the parent
name were unavailable, coverage collapsed to 27.

Both halves of that were wrong.

### 1. A rule was never necessary

Two files already in this repository join on the same old `/shopbrand/` URL:

```
inventory/categories-seo-backup.csv   old URL -> the exact title
package/url-bulk/categories-url.csv   old URL -> the new ct code
```

The second of those was built for the URL一括設定 CSVs, for an entirely different
reason. Together they give **the exact title for each ct code** — so there is
nothing to approximate.

Creator Mode puts `<title>` inside our own template, and a conditional on
`$category.code` — the same construct `category.tpl` already uses for the 53
per-category variants — prints it verbatim.

**606, character for character. Not 294.**

### 2. C35 is closed, and stopped mattering

`$category.breadcrumb_list.list.name` is confirmed in the reference, and the
breadcrumb carries the whole ancestry. The parent is the entry before the
current one, reachable as `index == total-2` without indexing by a variable —
so the parent name was available all along.

It no longer decides anything. The composed title survives only as the
`<{else}>` at the end of the chain, for categories added **after** the
migration:

```
<{else}><{section name=t loop=$category.breadcrumb_list.list}><{if $smarty.section.t.index == $smarty.section.t.total-2}>…
```

Whether the platform's breadcrumb starts with ホーム is not verified, and a
top-level category would then read 「ホームの粗品通販ページ…」. The fallback
tests for that name explicitly. One comparison, and being right about it stops
being necessary.

## The one that is not restored

**ct668** — its title on the live site is `■■■`. Restoring that faithfully would
be restoring a defect into a job whose brief says to fix page titles. It is
dropped from the table and gets the composed title instead, and it is written
into `inventory/category-titles-report.csv` — a content change nobody is told
about is not a fix.

## 全商品, and why it was almost missed

`/shopbrand/all_items/` had a backed-up title —「すべての商品」— but no ct code,
so it fell out of the join and was written off as "not a category".

The first preview after the module went in settled it. The URL was
`https://www.isp-sp.com/view/category/all_items`, and the last segment of a
category URL **is** `$category.code`. The code is `all_items`. It was never
missing; it simply is not numbered.

Codes that are not ct numbers now live in
`inventory/category-code-overrides.csv`, one row per page **with its evidence**,
read by both the generator and the check. That matters because a wrong code here
does not fail loudly: the branch just never matches, and the page keeps the
fallback title while the table claims to cover it.

This is also the "one category with no ct mapping" left open against the URL
CSV. **No category was ever missing.**

## Why it is a module

`package/modules/category_title.tpl` is 86KB. The largest box known to paste
cleanly in this console is the 10KB `category_captions` module, so 86KB is eight
times past anything proven.

Inside `category.tpl` it would stake the whole category page — 606 URLs, the
product grid, the pager, the tiles — on that size being accepted. As its own
module, `category.tpl` stays at the ~10KB already known to work, and the only
thing at risk is the title.

The 【粗品と景品の発見マーケット】 suffix is on 574 of the 606, so it is written
once outside the branches rather than 574 times. That alone is 22KB.

## How it is checked

`tools/check-category-titles.sh` does **not** look at the generator's working
data. It reads the generated template back as text, walks the if/elseif chain
the way Smarty would, reassembles what each branch prints including the folded
suffix, and compares against the original CSV.

```
分岐の数            : 606
元データと一致      : 606
不一致              : 0
```

This is deliberate. The category caption check once reported 34/34 identical
while 10 were truncated at a `<br>`, because it compared an extraction against
the same extraction. Agreement between a program and itself is not evidence.

## Still outstanding

The **601 custom meta descriptions** are in the same backup and can be restored
the same way. Not done yet. They belong in a separate module for the same
reason the titles do — descriptions are longer, so the table would be larger
than the titles one, and a failed paste should cost one thing rather than two.

## 確認に使うカテゴリを選び間違えないこと

貼り付け後の確認に `ct5` を使いかけました。**あれでは何も分かりません。**

```
表の中身      予算で選ぶの粗品通販ページ～49円まで【粗品と景品の発見マーケット】
<{else}>の結果  予算で選ぶの粗品通販ページ～49円まで【粗品と景品の発見マーケット】
```

`ct5` は最多294件の形そのものなので、**表が読めていなくても同じ文字が出ます。**
一致を見て「606件が生きている」と判断していたら、表がまるごと無視されている
状態を成功と読み違えていました。

確認には **表とルールで結果が違うページ**を使います。

| ページ | 表が読まれていれば | 読まれていなければ |
|---|---|---|
| `/view/category/all_items` | `すべての商品` | `すべての商品の粗品通販ページ…` |
| `/view/category/ct573` | `パソコングッズの粗品の通販ページ ～49円 【発見マーケット】` | `パソコングッズの粗品通販ページ～49円まで【粗品と景品の発見マーケット】` |

`all_items` が一番よい確認先です。**短いのでタブの中で切れません。**
ct573 は違いが「の通販」「までの有無」「【】の中身」と細かく、しかも長いので
タブでは末尾が隠れます。
