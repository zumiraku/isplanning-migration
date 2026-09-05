# The console, as it actually looks

Confirmed from a screenshot of the live admin, 2026-09-03. Everything here is
observed, not taken from the manual — the manual describes an older interface and
its menu names do not match.

## Where things are

`https://console.makeshop.jp/settings/feature-catalog?shopId=isplanning`

The left menu reads:

```
ホーム
注文管理
商品管理
会員管理
ショップデザイン          <- NOT 「デザイン管理」
  テンプレート選択・…
  お知らせの管理
  お知らせのデザイン…
  ストレージ
  会社概要の設定
  ショップページ表示…
  トップページ
  商品・カテゴリ
  ショップ案内画面…       (list continues below the fold)
```

**Our documents said `デザイン管理` throughout.** That came from MakeShop's online
manual, was never verified against this shop, and was repeated at the client
several times while he was looking at a menu that does not contain it. Corrected
everywhere; when a path here is unverified, say so.

## 機能一覧 — the reliable way to find anything

`ホーム → 機能一覧`, or the 機能一覧 button top right.

- **125 features** with the 「権限のない機能を表示する」 toggle on. Our notes said
  124 with 61 accessible; that was before the client granted full permissions.
- A keyword box, 「キーワードで絞り込み（機能名・説明・別名）」, searches name,
  description and aliases. This is the route to use when a menu label is unknown —
  it does not depend on knowing the hierarchy.
- Each result is a card showing its category, a description, an 開く button and a
  マニュアル link.
- Category filters: 商品管理 / 注文管理 / 会員管理 / ショップデザイン /
  分析・販促管理 / アプリ管理 / ショップ構築 / ショップ管理

## Still to confirm

- Which category 独自ページ sits in, and its menu path.
- **The number of 独自ページ.** The client reported 120. The 機能一覧 screen shows
  125 features, which is a different thing, so the 120 needs confirming against
  the 独自ページ list itself before it is trusted — the current documents assume
  it is the page count.

---

## ショップデザイン → テンプレート選択・編集

Second screenshot, 2026-09-03. This is the screen checklist §A is about, and it
answers several things at once.

```
エディタ種別   ベーシックモード   ノーコードデザインを使用する

[ ベーシックモード適用中 ]                    クリエイターモード編集画面へ >
[ PC | スマホ ]                              <- two separate template sets

ショップデザイントップ | ファイル管理▼ | トップページ編集▼ | 内部ページ編集Ⅰ▼ | 独自ページ
```

### What it confirms

- **The shop is still in ベーシックモード適用中.** Nothing has been switched.
- **クリエイターモード編集画面へ** is a link on this screen, so Creator Mode can be
  edited without applying it. That is the staging question (a second design set)
  answered in the direction we wanted — worth confirming that editing there does
  not affect the live shop before relying on it.
- **A PC / スマホ toggle.** The two template sets we have been comparing are edited
  here, side by side. This is where C27's divergence came from: two templates,
  maintained separately, drifting apart.
- **独自ページ is a tab on this screen**, and also a button in the
  オリジナルページ作成 box. That is the route to the 120-page question.

### The editable areas, as the diagram lists them

| Group | Screens |
|---|---|
| Global | 共通CSS管理, 共通head管理 |
| Layout | 上段メニュー管理, 左側メニュー管理, 下段メニュー管理 |
| Top page | タイトルイメージ管理, 中央画面（トップページ） |
| 商品デザイン | 商品分類画面, 商品詳細画面, 商品画像拡大画面, 商品検索画面, 買い物かご画面 |
| 各種パーツ | お知らせ・インフォ管理, お知らせ・インフォリスト, ログインフォーム |
| Other | イントロページ, 独自ページ |

That list is the answer to §A: **共通head管理** is where the tags in Q5 will be,
**左側メニュー管理** is the sidebar whose links we re-homed into the footer, and
**買い物かご画面** is the cart template C21 lives in.

`お知らせ・インフォ管理` names both features in one screen, so Q4 will be settled
by opening it — whichever one produces `/new/…` entries is visible there.

### 🔴 The bulk backup does not include 独自ページ

The page says so directly:

> ショップデザインを利用されている場合、一括でバックアップをとることができます。
> **※独自ページは一括バックアップの対象外となります。**

So `デザイン一括バックアップ画面へ` captures the header, footer, CSS, head and the
product/cart templates in one action — most of §A — but **every 独自ページ has to
be exported individually**. With 120 of them, that is the single largest manual
job left in the project, and it is worth knowing before the switch rather than
after.

---

## ショップデザイン → 独自ページ

The client pasted this screen's text, 2026-09-03. It settles more than the page
count.

### The form

| Field | Options |
|---|---|
| ページ選択 | 新しいページ / an existing page |
| ページ名 | free text — the management label, not the `<title>` |
| IP接続制限 | 適用する / 適用しない |
| ページ制限 | 制限なし / 会員専用 / パスワード制限 |
| 左メニュー選択 | 左側基本メニューデザイン(default) |
| **独自ページタイプ** | 左側メニューを含む / 上段メニューだけを含む / ブランクページA（ヘッダータグの出力あり）/ ブランクページB（タグの自動出力なし） |
| **フリーページへ転送** | — see below |

Plus an HTML editor with a preview, and バックアップを読み込む /
バックアップを取る **per page** — which is the only backup 独自ページ get, since
the bulk design backup excludes them.

### 🟢 「フリーページへ転送」 exists

The form has that field, and the URL list has a column legend reading
**「クリエイターモードのフリーページへ転送設定済み」**.

C15 recorded that no 独自ページ → フリーページ converter exists and that all 83
pages would be rebuilt by hand. That was taken from the manual's statement that
pages must be created anew. **The platform provides a transfer.** None of the 82
pages is transferred yet, so nothing has moved, but the assumption underneath a
large slice of the plan was wrong.

What it does to the markup is the next question: if it carries the Basic Mode
HTML across as-is, our converted fragments remain the thing to paste in, and the
transfer just creates the destination page. Worth testing on `page82` or another
page nobody reads, not on `page2`.

### The four tags available inside a 独自ページ

Only when the type is 左側メニューを含む or 上段メニューだけを含む:

```
<a href=[MEMBER]>新規会員登録</a>
<a href=[LOGIN]>ログイン</a>
<a href=[MYPAGE]>マイページ</a>
<a href=[EMAIL]>お問い合わせ</a>
```

**`[EMAIL]` is why `/html/email.html` exists** and why nothing we did could find
it: it is not a page in this list, it is a system-generated contact form. The
same is very likely true of `privacy.html`.

Note also `[MEMBER]` and `[LOGIN]`: the member routes we added to the shared
chrome have real tags behind them, so they are implementable rather than
placeholders.

### 独自ページは最大で10,000ページまで

No ceiling worth planning around.

---

## ショップ構築 → 設定 → SEO設定

`console.makeshop.jp/settings/seo-and-marketing/seo-all-config?shopId=isplanning`

Screenshots, 2026-09-03. This screen matters more than its name suggests.

```
対象設定    [ 商品詳細ページ ▼ ]        <- per page type
適用設定    (o) 一括設定を適用する   ( ) 個別設定を適用する
title       [product]｜粗品と景品の発見マーケット          max 255
description 粗品の[product]の販売。エスピーソースカタログの…   max 500
bodyタグ直下メッセージ   HTML可 / 最大50000文字            (collapsible)
利用可能な変数
```

### 🔴 The body-tag message is empty — the tags are still not found

Opened for 商品詳細ページ: **残り50,000文字**, nothing entered. So GA4
`G-BK1PPN5MEV` is not injected from here either, at least not for this page type.

Two places left to look, and Q5 stays open until one of them has it:

- the same field under a different 対象設定 (a site-wide or top-page setting)
- a separate tag screen under 分析・販促管理

Worth stating plainly: the design backup did not contain the tags, and neither
does this. Whatever is emitting GA4 on every page has not been found yet, and
"we looked in the obvious places" is not the same as having it.

### 🟢 利用可能な変数 — this decides the 607 category titles

| 項目 | 変数 |
|---|---|
| 商品名 | `[product]` |
| **カテゴリ名** | **`[category]`** |
| **現在カテゴリ名** | **`[currentcategory]`** |
| ショップ名 | `[shopname]` |
| JANコード | `[jan]` |
| 製造元 | `[seizou]` |
| 原産地 | `[gensan]` |
| 検索語 | `[kensaku]` |
| 商品別特殊表示 | `[tokushu]` |

**Two distinct category variables exist.** `[category]` and `[currentcategory]`
are separate, and the second is documented as 現在表示中のカテゴリ名 — which reads
as: `[currentcategory]` is the page's own category, `[category]` something
broader, most likely the parent or top-level one.

If that reading holds, the dominant title shape measured in
[category-titles.md](category-titles.md) —

```
{PARENT}の粗品通販ページ{CATEGORY}まで【粗品と景品の発見マーケット】
```

— becomes

```
[category]の粗品通販ページ[currentcategory]まで【[shopname]】
```

which reproduces **294 of 607 titles exactly**, the outcome that was in doubt.

**Do not treat this as settled.** The variable names are suggestive, not proof.
Switching 対象設定 to the category page and reading its title field shows which
variable the shop itself uses, and that is the confirmation.

### And a possible correction to C4 waiting behind it

C4 records that Creator Mode disables per-category custom titles, so all 607
would be lost. But this screen is under **ショップ構築 → 設定**, not under the
design — a shop setting rather than a template. Settings of that kind normally
survive a mode switch.

If the 607 titles are the 個別設定 on this screen, they may not be lost at all,
and a large piece of Gate A's decision (A) dissolves. That is worth confirming
before the client is asked to choose between reproduction strategies for
something that might not need reproducing.

### ⚠️ 更新 saves shop-wide

The blue 更新 button at the bottom writes the setting for every page of the
chosen type. Changing 対象設定 or expanding a section is safe; pressing 更新 is
not, and anyone sent to this screen needs telling.

### SEO設定 — the three page types, and where the 607 titles really live

The 対象設定 dropdown holds exactly three entries:

```
商品詳細ページ ✓
カテゴリページ
その他のページ
```

**No site-wide option.** So the body-tag message exists in three slots, not one.

#### カテゴリページ: 個別設定を適用する 🔴

The radio is set to **個別設定を適用する**, and the screen states plainly:

> 個別設定を選択した場合、SEO設定は**カテゴリ設定画面**から設定出来ます。

The 一括設定 fields are greyed out, showing only their defaults
(`[category]｜粗品と景品の発見マーケット`).

**That is where the 607 titles are: one per category, in カテゴリ設定画面, not
here.** It also means the shop deliberately chose per-category titles over a
rule — the bulk setting exists and is switched off.

So Gate A's decision (A) is not "can a rule reproduce them" alone. It is:

| | |
|---|---|
| Keep 個別設定 | If Creator Mode keeps per-category SEO fields, nothing needs reproducing at all and C4 dissolves |
| Switch to 一括設定 | A rule reproduces 294 of 607 exactly (measured), the rest drift in wording |

**C4's premise — that Creator Mode disables per-category titles — has to be
checked against カテゴリ設定画面 before the client is asked anything.** If it
survives, we have been planning to solve a problem that does not exist.

#### Both category variables are available

For カテゴリページ the variable list is:

| 項目 | 変数 |
|---|---|
| カテゴリ名 | `[category]` |
| 現在カテゴリ名 | `[currentcategory]` |
| ショップ名 | `[shopname]` |

So the two-variable rule is implementable in principle. Whether `[category]`
means the parent is still unproven — the shop uses 個別設定, so its own templates
do not demonstrate it.

#### The tags are not here either

`bodyタグ直下メッセージ` for カテゴリページ: **残り50,000文字**, empty. Two of the
three slots checked, both empty. One left (その他のページ), and if that is empty
too then GA4 comes from somewhere outside this screen entirely.

#### その他のページ — per-URL SEO, and the third empty body field

Selecting その他のページ shows a **per-URL** form. The entry visible is:

```
ページURL     /index.html
title         粗品・景品の通販 発見マーケット｜粗品・景品用グッズ、ノベルティの名入れ
description   粗品・景品の通販なら発見マーケット。粗品・景品用グッズを多数販売！…
bodyタグ直下メッセージ   残り50,000文字   (empty)
```

So the top page's own title and description are set here, not in the design. Note
also the constraint printed on this page type only: **「|（半角パイプ）」は使用でき
ません** — the shop's own titles use the full-width ｜ throughout, which is
consistent.

This form is per-URL, so it is very likely where the free pages' titles live too.
Worth confirming when the free-page titles are finalised, since
`inventory/freepage-seo-plan.csv` assumes we set them somewhere.

### 🔴 GA4 is not in the SEO screen at all

All three body-tag message slots are empty:

| 対象設定 | bodyタグ直下メッセージ |
|---|---|
| 商品詳細ページ | 残り50,000文字 — empty |
| カテゴリページ | 残り50,000文字 — empty |
| その他のページ (/index.html) | 残り50,000文字 — empty |

And the design backup contains no analytics tag either. Yet `G-BK1PPN5MEV` fires
on every page — measured from the crawl, not assumed.

**So the tag comes from somewhere neither the design nor the SEO settings covers**,
most likely 分析・販促管理. Q5 stays open and the search continues there.

This is worth the effort it is taking. A tag nobody can find is a tag nobody will
think to re-apply, and the loss shows up weeks later as a silent hole in the
client's advertising numbers.

---

## テンプレート選択・編集 — the screen, verified 2026-09-04

`https://console.makeshop.jp/design/editor?shopId=isplanning`

Two screenshots, the full page and the ファイル管理 dropdown. This pins down
things that were previously described but not located.

```
エディタ種別      ベーシックモード   ノーコードデザインを使用する

┌────────────────────────────────────────────────────────────────┐
│ 🏳 ベーシックモード適用中          クリエイターモード編集画面へ ›  │  <- dark bar
│ [ PC ] [ スマホ ]                                               │
├────────────────────────────────────────────────────────────────┤
│ ショップデザイントップ │ ファイル管理▼ │ トップページ編集▼ │ 内部ページ編集Ⅰ▼ │ 独自ページ │
└────────────────────────────────────────────────────────────────┘

  ┌─ デザイン設定画面一覧 ────────────────── カスタマイズテンプレート選択画面へ ─┐
  │ 共通CSS管理  共通head管理                                                  │
  │ ┌─────────── 上段メニュー管理 ───────────┐  ┌ 各種パーツ ──────────┐      │
  │ │              タイトルイメージ管理        │  │ お知らせ・インフォ管理 │      │
  │ │ 左側メニュー  中央画面（トップページ）   │  │ お知らせ・インフォリスト│      │
  │ │   管理        商品デザイン               │  │ ログインフォーム       │      │
  │ │               ├ 商品分類画面             │  ├ イントロデザイン ─────┤      │
  │ │               ├ 商品詳細画面             │  │ イントロページ         │      │
  │ │               │  └ 商品画像拡大画面      │  ├ オリジナルページ作成 ─┤      │
  │ │               ├ 商品検索画面             │  │ 独自ページ             │      │
  │ │               └ 買い物かご画面           │  └───────────────────────┘      │
  │ └─────────── 下段メニュー管理 ───────────┘                                 │
  │                                     💾 デザイン一括バックアップ画面へ  <---- │
  └────────────────────────────────────────────────────────────────────────────┘
```

### Where the bulk backup actually is

**Bottom right of the デザイン設定画面一覧 box**, below 下段メニュー管理, a grey
button with a floppy-disk icon: **`💾 デザイン一括バックアップ画面へ`**.

It is not in a menu. `ファイル管理▼` was the obvious guess and it is wrong — that
dropdown holds exactly one item, `ギガプラス10`, the file storage. Checked.

### The staging question is answered on this screen

The dark bar reads **`🏳 ベーシックモード適用中`** on the left and
**`クリエイターモード編集画面へ ›`** on the right.

So Creator Mode has an edit screen reachable **while Basic Mode is still the
applied mode**. That is the answer the whole schedule depends on: the templates
in `templates/creator/mode/` can be pasted, previewed and corrected without the
live shop changing, instead of everything having to happen inside a cutover
window.

Worth confirming once by pasting something harmless and checking the live site is
untouched — but the link's existence, next to a badge that says Basic Mode is
what is applied, is strong.

### Template edit URLs

Hovering 商品分類画面 shows the status bar target:

```
https://shop1.makeshop.jp/makeshop/newmanager/design_brandpage.html
```

So the Basic Mode editors live at `shop1.makeshop.jp/makeshop/newmanager/design_*.html`
and **the names match our exported files** — `design_brandpage.html` is the screen
that produced `design_brandpage.txt`. The mapping between editor screen and
exported file is now direct rather than inferred.

---

## ショップデザイン › クリエイターモード — verified 2026-09-04

Reached from the dark bar's `クリエイターモード編集画面へ ›`. The bar still reads
**`🏳 ベーシックモード適用中`** on this screen, which is the point: this is a
staging area, not a switch.

```
ショップデザイン › クリエイターモード

デザインセット一覧   [ + デザインセットを追加 ]  [ ⤓ デザインセットのインポート ]

┌ Complete（1）✎ ┐ ┌ Advance（1）✎ ┐ ┌ Basics（1）✎ ┐   ┌ ┄┄┄┄ ┐
│  [ショップに適用] │ │ [ショップに適用] │ │ [ショップに適用] │   ┆  +   ┆
│ 2022/07/08 17:46 │ │ 2022/09/02 16:29 │ │ 2026/08/19 04:39 │   └ ┄┄┄┄ ┘
│  ⧉  ⬇  🕘        │ │  ⧉  ⬇  🕘        │ │  ⧉  ⬇  🕘        │
└──────────────────┘ └──────────────────┘ └──────────────────┘

                                      （旧デザイン）ベーシック…
```

### What this settles

**Creator Mode design sets can be created and edited while Basic Mode stays
applied.** The whole build can happen before cutover, and the cutover itself
becomes one button rather than a night of pasting. That was the largest open
scheduling question in the project.

Three sets already exist, all MakeShop stock templates — Complete, Advance,
Basics — none customised for this shop. `Basics` was last updated **2026/08/19**,
which is before our engagement began but recent enough to be worth asking about;
the other two are from 2022.

### ⚠️ 「ショップに適用」 is the switch

The blue button on each card is what changes the live shop over to Creator Mode
with that design. It is not a preview and not a save. **Nothing in the build
phase requires pressing it**, and pressing it with a stock template selected
would replace eleven years of customisation with a demo shop.

The safe controls are `デザインセットを追加` (new empty set), the ⧉ copy icon, and
the ⬇ download icon.

### Two routes in

- **`+ デザインセットを追加`** — build a set from scratch, which is what
  `templates/creator/mode/*.tpl` is for.
- **`⤓ デザインセットのインポート`** — takes a design set as a package. If it
  accepts the format the ⬇ download produces, the templates could be assembled
  and version-controlled here and imported whole, rather than pasted screen by
  screen. Worth establishing early: it changes how the remaining build is done.

### ベーステンプレートの選択 — reached from `+ デザインセットを追加`

The platform states the safety guarantee itself, on the screen:

> デザインセット一覧画面で「ショップに適用」ボタンを押さない限り、ショップには反映されません。

That is the sentence the whole staging plan rests on, in MakeShop's own words
rather than our inference.

14 base templates, each with three colour variants:

```
Complete   Pulsefit   Baycross
Garden     Simplecase Basics
Manabito   &more      BRothers
Wabisabi   Shiro      Advance
Minimum    Debut
```

**The base matters less than it looks, and in one way it matters a lot.** Every
page template gets replaced with `templates/creator/mode/*.tpl`, and the styling
comes from our own `tokens.css` + `components.css`. What the base contributes
after that is CSS we did not write, still loading, still able to win a
specificity fight. So the choice is really "which base leaves least to
override".

Chosen: **Basics**. Three reasons, in order of weight:

1. A `Basics（1）` set **already exists in this shop**, last updated 2026/08/19.
   Whoever made it — the client, or MakeShop support during a consultation — it
   is the one base with a local reference point to compare against.
2. Its preview is a plain, information-dense layout: an INFORMATION table, a
   simple product grid. That is what this shop is. Garden, Wabisabi, BRothers
   and &more are image-led fashion and food designs whose CSS assumes large
   photography and little text.
3. It is not the shop's current design under a different name, so nothing about
   it can be mistaken for progress.

### The set exists — 2026-09-05 03:13 JST

`発見マーケット_移行版`, based on Basics, created and named. **The first Creator
Mode artefact this project has produced inside the shop**, and the shop is still
`ベーシックモード適用中`.

The list now holds five sets:

```
Complete（1）          2022/07/08 17:46:35
Advance（1）           2022/09/02 16:29:35
Basics（1）            2026/08/19 04:39:2…     <- origin unknown, predates us
Basics（2）            2026/09/05 03:13:10     <- stray, created 22s before ours
発見マーケット_移行版   2026/09/05 03:13:32     <- ours
```

⚠️ **`Basics（2）` is a stray.** It was created 22 seconds before ours and never
named, so the add flow evidently creates the set first and asks for a name
second — back out of the naming dialog and the set stays. It is harmless in
itself and it is exactly the hazard the naming step exists to prevent: five
cards, each with a blue `ショップに適用`, and one of them is now an unnamed stock
Basics sitting next to ours. Worth removing once we find where deletion lives —
the cards show only ⬇ download and 🕘 history.

The naming dialog says the name is 管理用 and never shown to customers, which
means it can be as explicit as it needs to be.

---

## クリエイターモード エディタ — the screen the build happens in, 2026-09-05

`ショップデザイン › クリエイターモード › トップ`, still under `ベーシックモード適用中`.

```
┌ 編集中のデザインセット ─┐  ショップデザイン › クリエイターモード › トップ
│ ✎ 発見マーケット_移行版 │
│ 🔵 レスポンシブ  (ON)   │  トップ                            👁 プレビュー
├─────────────────────────┤
│ 全ページ共通            │  ▸ HTML   <{$page.title}> …
│ トップ                  │  ▸ CSS    #wrap .bx-prev { … }
│ 商品カテゴリー          │  ▸ JavaScript  (empty)
│ 商品検索結果            │
│ 商品詳細                │                    [ 保存 ]
│ 商品レビュー一覧        │
│ 商品レビュー投稿        │
│ 買い物カゴ              │
│ お知らせ一覧            │
│ お知らせ詳細            │
│ まとめ買い割引          │
│ 利用案内                │
│ 会社概要                │
│ 特定商取引法            │
│ プライバシーポリシー    │
│ 会員制/年齢確認         │
├─────────────────────────┤
│ フリーページ管理        │
│ モジュール管理          │
├─────────────────────────┤
│ ファイルサーバ          │
│ タグリファレンス        │
└─────────────────────────┘
```

### The syntax is confirmed in the shop's own editor

The stock トップ template opens with exactly the delimiters the manual implied:

```html
<title><{$page.title}></title>
<meta name="description" content="<{$page.description}>">
<link rel="canonical" href="<{$page.canonical_url}>">
<meta property="og:site_name" content="<{$shop.name}>">
```

So `templates/creator/mode/*.tpl` are written in the right dialect. Four new
tags fall out of these twelve lines alone — `$page.title`, `$page.description`,
`$page.canonical_url`, `$shop.name` — and `$page.canonical_url` matters more
than it looks, because C33 says every URL on the shop moves.

### Three boxes per page, not one

**HTML / CSS / JavaScript**, each collapsible, each saved together. That answers
where our assets go:

| ours | goes to |
|---|---|
| `css/tokens.css` + `css/components.css` | **全ページ共通 → CSS** |
| `js/gallery.js`, `js/tabs.js`, `js/quote-prefill.js` | **全ページ共通 → JavaScript** |
| `mode/category.tpl` | 商品カテゴリー → HTML |
| `mode/detail.tpl` | 商品詳細 → HTML |
| the 86 free pages | フリーページ管理 |

### What the page list itself tells us

- **`レスポンシブ` is a toggle, and it is on.** The single sentence of the brief —
  レイアウトが崩れないように — has a switch, and it is already in the right
  position.
- **商品レビュー一覧 / 商品レビュー投稿 are page types.** The feature MakeShop
  retires in November has its own templates here; ours stay empty.
- **モジュール管理** — shared blocks. The header, footer and the promo banner that
  36 of the 53 category templates carry belong here rather than repeated.
- **ファイルサーバ** — where `default.css` and the uploaded images go, the ones the
  design backup explicitly excludes.
- **タグリファレンス is in the sidebar.** The remaining 174 unmapped tags and the
  20 assumed ones can be settled from inside the console, against this shop's own
  build, rather than from the public reference.

---

## 全ページ共通 に土台が入った — 2026-09-05

**The first thing this project has actually installed in the shop.** Verified by
line number rather than by looking at it:

| box | total lines | ends with | |
|---|---:|---|---|
| CSS | **3,979** | `.tabs__tab { flex: 0 0 auto; scroll-snap-align: start; … }` | our last line |
| JavaScript | **763** | `}());` after the `DOMContentLoaded` guard | our last line |

Basics contributed roughly 3,150 lines of CSS and 415 of JavaScript; ours are
the 826 and 348 appended after them. Both were pasted at the end, as intended,
with the stock content intact above.

Checking this mattered. The screenshot taken immediately after the paste showed
CSS lines 106–118 and JS lines 25–37 — stock content in both, because the editor
had simply scrolled back to where it was. **Nothing about that view could
distinguish "pasted" from "not pasted"**, and reading it as success would have
put every later page on a foundation nobody had confirmed. `Ctrl+End` and a
known last line is what settles it.

The shop is still `ベーシックモード適用中`. Customers see none of this yet.

---

## 実サイトでの確認 — 2026-09-05

プレビューURL `https://www.isp-sp.com/view/<page>?ptk=<token>` で確認。

### 確実に動いている 2ページ

**商品詳細** `/view/item/003001000005`

- 未処理の Smarty タグ **ゼロ**
- パンくず：ホーム › ノベルティ商品検索 › 〜49円 › 商品名
- h1・商品コード・価格・カート・3タブ・カテゴリタイル40枚以上、すべて出力
- 空要素なし

**商品カテゴリー** `/view/category/ct111`

- h1「環境配慮・SDGs対応（サステナブル）」
- **`catintro__lead` にカテゴリ固有の説明文が出ている** ── `category_captions`
  モジュールが効いている証拠。53本のテンプレートから救い出した34件の文章が、
  実際にページに乗った
- 並び替え5つ、商品カード40件、子カテゴリ15件、ページャー（全10ページ）
- 未処理タグなし

### 判定できなかったページ

`/view/company` `/view/news/list` `/view/contract` は、当方のテンプレートでは
ない内容を返しました。h1 が「名入れと記念品のオリジナルマーケット」であったり、
`class="newslist"` が無かったりします。

**ただし、これを「貼られていない」とは断定できません。** 理由が2つあります。

1. `ptk` は商品ページ用に発行されたトークンです。ページ種別ごとに別のトークンが
   要る可能性があり、その場合これらのURLは**適用中のベーシックモード**を
   返していることになります（ショップは今も `ベーシックモード適用中`）。
2. 取得内容の要約が信頼できませんでした。文字化けを「未処理のSmartyタグ」と
   報告するなど、明らかな誤読が混じっています。

**確実な確認方法は、エディタの各ページにある「👁 プレビュー」ボタン**です。
そのページ用のトークンで開くので、取り違えようがありません。

---

## クリエイターモード編集画面の左の列 — 2026-09-05

Recorded because an instruction sent to the user was wrong twice over, and the
screenshot showed exactly why.

```
┌──────────────────────────────┐
│ 🏳 ベーシックモード適用中        │  <- stays this way while editing
├──────────────────────────────┤
│ デザインセット一覧          ›  │
├──────────────────────────────┤
│ ✏ 編集中のデザインセット        │
│   発見マーケット_移行版         │  <- THIS is what says you are in Creator Mode
│ ● レスポンシブ                 │
├──────────────────────────────┤
│ 全ページ共通                  │
│ トップ                        │
│ 商品カテゴリー                 │
│ 商品検索結果                   │
│ 商品詳細                      │
│ 商品レビュー一覧               │
│ 商品レビュー投稿               │
│ …                            │  <- CONTINUES BELOW THE FOLD
└──────────────────────────────┘
```

**Two things this settles.**

1. **The dark bar keeps saying ベーシックモード適用中 while you edit the Creator
   Mode set.** It reports the mode the *shop* is serving, not where you are. The
   marker for "you are inside Creator Mode" is 編集中のデザインセット in the
   left column. An instruction that says "press クリエイターモード編集画面へ" is
   wrong once you are already in - there is no such link on this screen.

2. **モジュール管理 and フリーページ管理 are below the fold.** At the default
   window height the column ends at 商品レビュー投稿. Telling someone to "press
   モジュール管理 in the left menu" describes something they cannot see. It needs
   the scroll step, explicitly.

Neither is guessable from the console map as it was written. Both cost a round
trip with the user.

## モジュール管理 — 9件になった 2026-09-05

```
モジュール名              モジュールタグ
─────────────────────────────────────────
フッター                  $module.footer
ヘッダー                  $module.header
サイドメニュー            $module.side_bar
バナーエリア              $module.banner_area
最近チェックした商品      $module.checked
商品グループ表示          $module.group
カテゴリタイル46枚        $module.category_tiles
カテゴリ別説明文34件      $module.category_captions
category_title            $module.category_title      <- 追加、86KB が通った
```

**86KB のモジュールが登録できることが確定しました。** これまで通った最大は
`category_captions` の10KBで、その8倍が入るかどうかは賭けでした。通りました。
カテゴリ独自タイトル606件は、これで貼り付け側の障害がなくなりました。

一覧の列見出しは **モジュール名**、追加画面の入力欄は **管理用名称** です。
別の名前で同じものを指しているので、手順を書くときに取り違えないこと。

### 左の濃い列の全体（この画面で最後まで見えた）

```
全ページ共通 / トップ / 商品カテゴリー / 商品検索結果 / 商品詳細 /
商品レビュー一覧 / 商品レビュー投稿 / 買い物カゴ / お知らせ一覧 /
お知らせ詳細 / まとめ買い割引 / 利用案内 / 会社概要 / 特定商取引法 /
プライバシーポリシー / 会員制/年齢確認
        ── ここで一段あく ──
フリーページ管理 / モジュール管理
```

フリーページ管理とモジュール管理は**区切りの下**にあり、ページ種別ではなく
管理機能として並んでいます。既定のウィンドウ高では画面に入りません。

## 全ページ共通の行数 — 前回の確認は不十分でした 2026-09-05

前回こう書きました。

> | CSS | **3,979** | `.tabs__tab { … }` | our last line |
> Basics contributed roughly 3,150 lines of CSS

**「roughly 3,150」は実測ではありません。** 3,979から自分の826行を引いた
引き算です。今回、素のBasicsを2セット（Basics（1）とBasics（2））で実測した
ところ、どちらも **2,326行** でした。

```
2,326 (Basics)  +  826 (こちら)  +  827 (こちらの2つ目)  =  3,979
```

**こちらのCSSが二重に入っていました。** 末尾の行が期待どおりだったので通したの
ですが、末尾はどちらのコピーの末尾でも同じです。**「最後の行が合っている」は
「1回だけ貼られている」の証拠になりません。**

### 以後の確認は、末尾と行数の両方

| 欄 | 正しい合計 | 内訳 |
|---|---:|---|
| CSS | **3,152** | Basics 2,326 + こちら 826 |
| JavaScript | 未実測 | Basics ? + こちら 348 |

JavaScriptの「415行」も同じ引き算（763 − 348）で出した数字なので、実測が要ります。

### Basics（1）と Basics（2）はどちらも素

`Basics（1）` は 2026/08/19 からあり出所不明、`Basics（2）` はこちらのセットの
22秒前にできた迷子です。**CSSはどちらも2,326行で一致**したので、どちらも
ベーステンプレートのまま触られていないと判断できます。コピー元には、日付の
新しい `Basics（2）` を使います。

### 4種類のページがBasicsのCSSに依存しています

デザインセットのページ種別16のうち、作り直したのは11です。

```
商品レビュー一覧 / 商品レビュー投稿 / まとめ買い割引 / 会員制・年齢確認
```

この4つはBasics標準のHTMLのままなので、Basics標準のCSSが消えると素の見た目に
なります。**この4つをこちらで作り直す判断はしていません。** 中身を出すための
タグが未確認で、作れば「見た目は整うが中身が消えたページ」になるためです。
素の見た目でも中身が出ているほうが上です。

### JavaScript も二重でした — 実測 2026-09-05

```
素のBasics（Basics（2）で実測）   67 行
こちら                          349 行
こちらの2つ目                    349 行
                              ─────
                                765 行   ← 実際に入っていた数
```

前回の記録「Basics contributed roughly 415 lines of JavaScript」も引き算
（763 − 348）でした。**実測は67行です。** CSSとJavaScriptの両方で、初回の
貼り付け時からこちらのブロックが2回入っていたことになります。

JavaScriptの二重は見た目に出ません。`gallery.js` と `tabs.js` の初期化が2回
走るので、**サムネイルを1回押すと2回反応する**、ドットが二重に出る、といった
挙動になります。`quote-prefill.js` だけは `dataset.quotePrefilled` で二重実行を
弾いていたので無事でした。

### 全ページ共通の正しい行数（実測ベース）

| 欄 | 素のBasics | こちら | 合計 |
|---|---:|---:|---:|
| CSS | 2,326 | 826 | **3,152** |
| JavaScript | 67 | 349 | **416** |

継ぎ目に空行が1つ入って ±1 になることがあります。そこは問題ありません。

**確認は必ず「末尾の行」と「合計行数」の両方で行うこと。** 末尾だけでは、
同じブロックが何回入っていても同じに見えます。

## 全ページ共通 JavaScript は、こちらのコードを【先頭】に 2026-09-05

貼る順番で結果が変わります。逆にすると、こちらの365行は**1行も動きません。**

```
Uncaught ReferenceError: $ is not defined    at user-...:1:1
Uncaught TypeError:      $ is not a function at MakeShop_afterItemOptionChange
```

`$` は jQuery です。Basics標準の67行はそれを前提に書かれていますが、**こちらが
作り直した11ページは jQuery を読み込みません。** ここに置いたものは3本とも素の
JavaScript で、必要としないからです。Basicsのテンプレートは自分でjQueryを読んで
いたので、あちらでは成立していました。

読み込まれていない `$` をBasicsのコードが呼びに行き、**ファイルの1行目で例外**に
なります。JavaScriptはそこで止まるので、下に何行あっても実行されません。

### 症状が「壊れている」ように見えないこと

- タブ3枚が縦に並んだまま（これは意図した無JS時の姿なので、正常にも見える）
- ギャラリーのサムネイルと点が無反応（画像自体はCSSでスワイプできる）
- **行数を数えると正しい**。433行、末尾もこちらの最終行

行数と末尾の両方を確認しても通ってしまいます。**Consoleを見るまで分かりません。**

### 正しい順番

```
1行目      こちらの365行（先頭にセミコロン）
その下     Basics標準の67行
合計       433行前後
```

Basics側は消しません。まだ作り直していない4ページ（商品レビュー一覧・投稿／
まとめ買い割引／会員制・年齢確認）では、あちらのテンプレートがjQueryを読み込む
ので今まで通り動きます。

### 確認できたこと

`<script src="<{$page.javascript}>">` は正しく機能しています。ファイルは
読み込まれていました。読み込みの問題ではなく、実行順の問題でした。
