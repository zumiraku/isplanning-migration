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
