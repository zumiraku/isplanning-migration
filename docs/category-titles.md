# Reproducing the 607 category titles (C4 / Gate A decision A)

Creator Mode drops per-category custom page titles. All 607 are backed up in
`inventory/categories-seo-backup.csv`, so nothing is lost — but they have to be
reproduced, and the client is being asked to choose between generating them from
a rule, setting the important ones by hand, or both.

He cannot choose sensibly on adjectives. `tools/analyse-category-titles.ps1`
measures it. → `inventory/category-title-analysis.csv`

## What the 607 titles actually look like

The true category name comes from each page's own breadcrumb — the `<h1>` is
useless because every page on the site carries the same one (S0-16).

| | |
|---|---:|
| Titles containing their own category name | **591 of 607** |
| Distinct shapes, once the parent name is substituted too | **53** |
| Titles over 60 characters | **0** |

**The dominant shape uses the parent category as well as the current one:**

```
{PARENT}の粗品通販ページ{CATEGORY}まで【粗品と景品の発見マーケット】
```

e.g. 傘 + 100円〜199円 → 「傘の粗品通販ページ100円〜199円まで【粗品と景品の発見マーケット】」

## How far a rule gets

| Rules | Titles reproduced exactly | |
|---:|---:|---|
| 1 | **294** of 607 | 48% |
| 5 | **385** of 607 | 63% |
| 10 | **456** of 607 | 75% |

The top five, with counts:

```
294  {PARENT}の粗品通販ページ{CATEGORY}まで【粗品と景品の発見マーケット】
 28  {PARENT}用品の粗品通販ページ{CATEGORY}まで【粗品と景品の発見マーケット】
 27  {CATEGORY}の粗品通販ページ【粗品と景品の発見マーケット】
 21  {PARENT}の粗品通販ページ{CATEGORY}以上【粗品と景品の発見マーケット】
 15  パソコングッズの粗品の通販ページ {CATEGORY} 【発見マーケット】
```

The tail is mostly the same sentence with a different connector — 用品の, 製品の,
な, no connector at all — which is drift from years of hand-editing rather than
deliberate variety.

## 🔴 The catch, and it decides the whole answer

**The dominant rule needs the PARENT category name, not just the current one.**

If Creator Mode's title tag exposes only the current category, that one rule —
covering 294 of 607, nearly half — cannot be implemented at all, and the
achievable coverage drops to the shapes that use `{CATEGORY}` alone: 27 titles.

**This has to be checked before the client is asked to choose.** Presenting
「案A recovers most of them」 without knowing whether the parent name is available
would be presenting a number we cannot deliver.

Where to check: the Creator Mode template variables for カテゴリページ, in
ショップデザイン → テンプレート選択・編集 → クリエイターモード編集画面へ, or the
manual's variable-tag list.

## The 16 that contain no category name

Those need a decision of their own — a rule cannot touch them, since there is
nothing in the title to key on. They are listed in the analysis CSV with
`contains_name = False`. Sixteen values pasted by hand is an hour's work, so this
part is not the problem regardless of which option is chosen.

## What this means for the recommendation

Option C (rule + hand-set important ones) is still the right shape of answer, but
the split depends entirely on the parent-name question:

| If the parent name IS available | If it is NOT |
|---|---|
| 1 rule → 294, 5 rules → 385, 10 → 456 | 1 rule → 27 |
| Hand-set the remainder by traffic, using Search Console | Hand-setting becomes the main mechanism, and 607 rows is not an afternoon |

Either way the 607 originals are safe in the backup, and either way the client
should hear the real numbers rather than a reassuring summary.
