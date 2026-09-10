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

## 実サイトで確認済み — 2026-09-05

```
https://www.isp-sp.com/view/category/all_items   タブ表示: すべての商品
```

**表が読まれています。** 組み立てルールなら「すべての商品の粗品通販ページ…」と
長くなるので、この4文字が出た時点で、606件の分岐が評価されていることが確定します。

これで C4 はテンプレート側・貼り付け側・実表示のすべてで通りました。

---

# ※ 取り消し — この文書の前提が誤っていました（2026-09-05）

**クリエイターモードはカテゴリ独自タイトルを落としません。** 実サイトで確認しました。

`_shell-head.tpl` は同じページに2か所タイトルを出しています。片方は当方の表、
もう片方はプラットフォームの値です。**同じページで比べれば答えが出ます。**

```html
<title><{$module.category_title}></title>            当方の表
<meta property="og:title" content="<{$page.title}>">  プラットフォーム
```

| カテゴリ | 結果 |
|---|---|
| ct5 | 同一 |
| all_items | 同一 |
| **ct573** | **違う。当方が全角スペースを半角に潰していた** |
| ct668 | `$page.title` が `■■■` を返す。現行サイトの値そのもの |
| ct640 / ct649 / ct667 | いずれも独自タイトルが返る |

`$page.description` も独自の説明文を返します。

## つまり

- 607件のタイトルも、601件の説明文も、**最初から失われていません**
- 復元の86KBは不要で、**31件をわずかに劣化させていました**
- C4・C35・Q9 は、いずれもこの誤った前提の上に立っていました

## なぜ気づけなかったか

**リファレンスに「$page.title がカテゴリ独自タイトルを返す」とは書かれていません。**
書かれていないことを「無い」と読み、バックアップの存在が対策の必要性を裏づけて
いるように見えたので、疑う理由が無くなっていました。

実際に確かめられたのは、**同じページに両方が出ている状態を作ってしまった後**です。
比較対象が並んだのは偶然でした。

## 残したもの

`contingency/category_title.tpl` と生成・検証の道具は残してあります。この挙動は
リファレンスに書かれていないので、仕様が変われば必要になり得ます。1回の貼り付けで
戻せる状態にしてあります。

## ct668

タイトルが `■■■` のままです。テンプレートで細工するのではなく、**管理画面の
カテゴリ設定で直す**のが正しい直し方です。データの問題です。

### ct668 — 直りました（2026-09-07）

「管理画面のカテゴリ設定で直すのが正しい」と書いた、そのとおりになりました。
山口様が **「■粗品（価格変更予定）」** に変更済みです。

そして `■■■` は投げやりな名前ではなく、**用途がありました。**

> メイクショップの管理画面が2年前くらい前にバージョンアップしました、その際に
> 商品画像も登録がS・M・Lサイズの3種が基本で登録（管理画面上でドロップ）
> できてたのが、管理画面でLサイズのみ変更できる仕様に変わりました。
> Ｓ・Ｍは管理画面から変更できなくなり、ＣＳＶでしか登録変更できなくなりました。
> 当社の画面でお解りのようにＳサイズの画像に単価・数量が記載しております。
> （これはスマホのページで合計金額しか表示できない（商品別特殊表示ができない）
> ための苦肉の策でした）
> そのため、これも苦肉の策でＳ・Ｍの画像を変更時に一旦「■■■」のカテゴリに
> ＣＳＶで登録して「■■■」の商品ＣＳＶをダウンロードしてから変更するように
> いたしました。

つまり **S・M画像を差し替えるときの作業台**です。対象商品を一旦ここに入れ、
商品CSVを書き出して、画像を直す。「修正の時だけ使うカテゴリとなりますので
通常空っぽです」。

こちら側の扱い:

- 名称は `inventory/category-admin-changes.csv` に上書きとして持ちます。
  **CSVは切替当日に作り直すので、出来上がりを手で直すと消えます。**
  `build-url-csv-categories.sh` が毎回当て直します
- **noindex=1 を付けました。** 通常空のページを検索結果に出さないためです。
  ご指示は名称のみだったので、不要なら上書き表の1行を消せば戻ります

なお、この説明はもう1つのことを教えています。**S・M画像に単価と数量が
焼き込まれている**のは、スマホサイトが商品ごとの表示を出せなかったからです。
こちらの商品カードは `image_M` を出しているので、その表記はそのまま残ります。
