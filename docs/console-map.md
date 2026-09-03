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
