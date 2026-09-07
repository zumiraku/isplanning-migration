# Open questions — first admin console session

Each one is answerable only from inside `console.makeshop.jp` (shop `isplanning`),
and each one changes work downstream. This is the agenda; record answers inline.

Status: `OPEN` · `ANSWERED` · `BLOCKED`

---

### Q1 — Is the pricing script ours or the platform's? `ANSWERED` 2026-08-29
**The platform's.** Present on 100/100 sampled product pages including option-less
ones, carries an `ActiveXObject` IE fallback and MakeShop's own Japanese source
comments, and POSTs to the platform endpoint `/shop/shopdetail_option.html`.

It is emitted by **オプションテーブル形式 / 表形式のオプション**, which Creator Mode
discontinues. **Stage 4 is therefore the large branch: the client-side pricing
behaviour is a from-scratch rebuild.** Full verified spec, including the endpoint
contract and the 3-colour × 7-tier model, in [`spec/option-engine.md`](../spec/option-engine.md).

*Residual check:* confirm in the admin that this code appears in no free-space box.
Expected to confirm; the evidence is already strong.

**Supersedes Q1 → Q1b (now the question that sizes Stage 4):**
Does `/shop/shopdetail_option.html` still exist and behave identically under Creator
Mode? Test it during the rollback rehearsal — two minutes, and it decides whether we
rebuild only the client side or must bake option pricing into the template.

### Q2 — Which レコメンド product is installed? `ANSWERED` 2026-08-29
**さぶみっと！レコメンド (e-Agency)**, account `isplanning`, loaded from
`//d.rcmd.jp/isplanning/item/recommend.js` (live, 282,805 B). A dedicated Creator Mode
installation manual exists — documented re-install, not a custom rebuild.
Loaded on 3/192 desktop pages (product detail only) but 11/11 mobile pages.
Client has already approved the SP horizontal-scroll treatment.
→ See [`docs/findings-stage0.md`](findings-stage0.md) S0-4.
**Follow-on:** its PV-CV feature requires a CV tag on the order-completion page. Folded into Q5.

### Q3 — Which discontinued Basic Mode features are actually in use? `OPEN`
Check each: 商品見積書 · 一発購入 · 投票 · 懸賞 · 移動イベントバナー · インフォメーション ·
アクセス統計 · RSS配信 · WebFTP複数画像管理.
**商品見積書 is the one to check first** — a B2B novelty shop with tiered pricing is
its natural user, and it has no Creator Mode equivalent.

### Q4 — What generates `/new/*.html`? `ANSWERED — but its URL conclusion was wrong`
**It is ニュース, which Creator Mode keeps.** Answered from the archive, no
crawling and no console needed — see [`docs/news-plan.md`](news-plan.md).

🔴 **Correction 2026-09-04: the URLs do NOT stay put.** This entry, the redirect
map and `news-plan.md` all assumed that because the feature survives, the
addresses survive. They do not: Creator Mode serves news at `/view/news/list`
and `/view/news/yymmddhhmmss`. Worse, the new form is a timestamp, so the
mapping cannot be derived from the old URL — it has to be read off the platform
after the switch. 100 URLs indexed since 2013, and URL一括設定 does not cover
news. See [creator-mode-urls.md](creator-mode-urls.md); this needs a client
decision it has not yet had.

Evidence across all 100 detail pages: identical platform markup
(`<div id="newsHead"><span class="date">…</span>TITLE</div>` then
`<div id="newsContents">`), every one linking to `index.html?mode=list`, and
`/new/index.html` built on `#newsList`. The URL shape `/new/YYYY-MM-DD-HHMMSS.html`
is a platform stamp. インフォメーション is a notice block on the shop front, not a set
of dated article URLs.

**If confirmed, there is no content migration here at all** — the articles live in
the platform's news store, so the work is two editable templates and the URLs do
not move. That removes 100 URLs from the redirect risk.

*Residual check (checklist §F):* find which admin screen creates a `/new/…` entry.
Two minutes, and it turns a strong inference into a fact.

Also corrected while doing this: it is **100 articles plus the list page**, not 101
articles, and they are mostly catalogue announcements rather than the thin holiday
notices S0-5 described from a single sample.

### Q5 — What conversion tags sit on the order-completion page? `NARROWED — GA4 is safe`
**Answered from the archive 2026-09-03**, without the console. GA4
`G-BK1PPN5MEV` is **injected by the platform, not by the design**: in every
archived page type it appears above the first line of 共通head管理, its wrapper
is named `makeshop_ga_gtag`, and the cart page emits a `view_cart` ecommerce
event carrying the basket contents — which no design template could produce. It
is a shop setting, so it survives the mode switch. Same for the u-komi loader.

The design backup finding stands but its conclusion inverts: the tags are not
missing from our copy, they are somewhere we cannot break.

What is left is narrow and is one screen: **the order-completion page**. The
crawl never reached `/shop/thanks.html` — it needs a completed order — so if a
Google Ads or Yahoo conversion tag was pasted into a Basic-Mode-only slot, that
is where it is. さぶみっと！レコメンド's PV-CV tag would be on the same page.
See [analytics-tags.md](analytics-tags.md).

### Q6 — Which checkout / member / mypage screens are template-editable? `OPEN`
Creator Mode's editable list covers cart but is unclear on the checkout steps,
member registration, login and mypage. This sets the ceiling on design consistency —
the client should hear it from us before he notices it himself.

### Q7 — What is the フリーページ URL pattern, and are redirects possible? `ANSWERED` 2026-09-04
**`/view/<name>`** — so `/html/pageNN.html` does not survive, and neither does
any other URL on the shop bar the top page. Redirects as such are not offered,
but **URL一括設定** assigns an arbitrary URL to a page by CSV and serves it
alongside the system URL, with a canonical setting. That covers products,
categories and free pages — 10,203 of the 10,306 URLs — and not news.
See [creator-mode-urls.md](creator-mode-urls.md), which lists the four things to
establish before planning around it.

The original entry follows; the 418 internal `/html/` links it blocked are now
unblocked once the alias question is tested.
Current free pages are `/html/pageNN.html`. The admin's 独自ページ list holds
**82 pages** (the sitemap had shown 83; the "120" written here on 2026-09-03 was
wrong and is withdrawn). All 82 are converted.

A converter **does** exist: the 独自ページ form carries a
**「フリーページへ転送」** field and the list has a 「クリエイターモードのフリー
ページへ転送設定済み」 column — see C15. What it does to the markup is still
untested; try it on page82 first, which is a spare.

The open part is the URLs. If they differ from `/html/pageNN.html` we need
internal link rewriting (418 `/html/` links are waiting on this), a new sitemap,
and Search Console, and the client needs to know before Gate A.
### Q8 — How many products carry SP-only description text or an SP-specific URL? `MEASURED 2026-09-06`
スマホ用商品詳細説明 and スマホ商品URL both stop working in Creator Mode. Across
9,514 products, any SP-only copy is silently discarded at cutover unless merged first.

### Q9 — What per-category custom titles and descriptions exist? `ANSWERED 2026-09-05`
607 category pages, all captured in `inventory/categories-seo-backup.csv` before the
switch. **The titles are no longer a loss** — 606 are restored character for
character by `package/modules/category_title.tpl`, because the backup joins to the
ct codes on the old /shopbrand/ URL and Creator Mode puts `<title>` in our own
template. See C4. The 601 custom **descriptions** are still outstanding and can be
restored the same way. Original note follows.

Export all
current values **before** the switch — once lost they cannot be recovered from the
platform, only from our snapshot.

### Q10 — How is the top-page shipping calendar generated? `OPEN`
Hand-edited HTML, a platform feature, or a third-party widget? Determines whether it
is a rebuild or a re-embed — and who maintains it afterwards.

### Q11 — Is the product sitemap truncated? `OPEN`
`brand0` contains exactly 5,000 URLs, which smells like a cap. Reconcile the sitemap
total (9,514) against the actual product count in 商品管理.

### Q12 — What is the shop's busy season? `OPEN`
Ask the client directly. Cutover is planned for Wed 2026-11-11; novelty and 景品
demand is seasonal and year-end may already be ramping. If 11/11 is bad, move it —

### Q13 — What is the Creator Mode equivalent of `[SYSTEM_CODE]`? `ANSWERED` 2026-09-04
**`$item.system_code`**, from the platform tag reference at
`reference.makeshop.jp/taglist/creator-mode/detail.html`. Applied to the u-komi
mount in `preview/product.html`. The reference also confirms `$item.is_member_price`
exists, which is the flag the pricing rebuild reasoned its way to for C23.

The original entry follows, because the reason it mattered has not changed:
**Raised 2026-09-03.** The product page's u-komi review mount binds reviews to
the product with `data-gname="[SYSTEM_CODE]" data-pid="[SYSTEM_CODE]"`. The
loader script is platform-injected and keeps running after the switch, so if
this tag is not resolved to its Creator Mode counterpart the widget loads on
every product with an identical id — every product shows one product's reviews,
or none. It fails silently and it fails on all 9,514 products at once. See
[product-tabs.md](product-tabs.md).
we have room.

---

## Also confirm

- [ ] `robots.txt` returns 404. Intentional? Fix at cutover.
- [ ] Search Console access — verification method, and whether we get read access.
- [ ] Whether a second design set can be prepared in Creator Mode without affecting
      the live Basic Mode shop (staging-by-design-set).
- [ ] Rollback rehearsal: switch to Creator Mode off-peak, confirm Basic Mode content
      is intact, switch back. Prove it on **this** shop, not in a manual.

---

## Sub-administrator permissions — added 2026-08-30

The sub-admin account can reach **61 of 124** features. Most of 商品管理 is locked,
which blocks two items the project depends on:

- **商品データダウンロード** — needed to count products carrying スマホ用商品詳細説明
- **カテゴリ設定** — needed to read the 607 category titles from the source

Also locked: 商品一覧, 商品設定, オプショングループ, 名入れグループ, カテゴリ内商品管理,
商品の並び順の変更, 注文一覧, 見積書一覧, 帳票類の設定, 領収書ダウンロード.

Accessible and useful: **テンプレート選択・編集** (the Creator Mode / Basic Mode
template editor), ストレージ, and the ショップデザイン screens. So template work can
proceed while permissions are widened.

Request drafted at docs/client/permission-request-draft.md.

### Q3 update — 見積書 is present on this shop

機能一覧 lists **見積書一覧** under 注文管理, described as 会員発行の見積書を検索・管理する.

Presence in the feature list does not prove active use, and the screen is locked to
the sub-admin so neither we nor the client-facing check can look inside yet. But this
is the feature with **no Creator Mode equivalent**, and a B2B novelty shop with tiered
pricing is its natural user. The permission request asks the client directly, since he
can answer that without granting anything.

### Also noted

**オプショングループ移行** exists: 旧機能：オプショングループをカスタムセレクトへ移行する.
MakeShop is moving the option system from オプショングループ to カスタムセレクト. That may
bear directly on how the Stage 4 option UI should be rebuilt — worth investigating once
商品管理 is unlocked, since the current 3x7 matrix sits on the old model.

### Q8 追記 — 実測 2026-09-06

スマホ版とPC版の商品ページを**8商品で突き合わせました。**

```
/smartphone/detail.html?id=CODE   と   /shopdetail/CODE/
```

SP版の本文を30字ずつに切って、PC版に含まれるかを調べたところ、
**38〜44%が「PC版に無い」**と出ました。中身を見ると全部これでした。

```
トレンドキーワード / 熱中症・暑さ対策 / そうめん / 敬老の日 …
カテゴリー一覧 / 季節で選ぶ / 予算で探す …
インフォメーション / 利用ガイド / 会社概要 / 特定商取引法 …
休業日のお知らせ：12月27日（土）〜1月4日（日）まで
品番：MD18-3521 単価35円（税別）1200個入46,200円(税込)
```

**すべてSPサイト側のナビゲーションと価格の表示形式です。商品説明の文章は
1つもありませんでした。** SP版の本文はPC版より短く（約4,000字 対 約5,100字）、
「SP専用の追加文章」がある形ではありません。

### つまり

**8商品の範囲では、スマホ専用の商品説明は使われていません。**

### ただし8件は8件です

9,534商品のうち8件です。「スマホ用商品詳細説明」は商品ごとに設定する項目
なので、一部の商品だけで使われている可能性は残ります。SP商品ページは
クロールで110件しか拾えておらず、全件を取得するのは店舗への負荷が見合いません。

### 確定させる方法

**管理画面の商品CSVダウンロード**に「スマホ用商品詳細説明」の列があります。
1回の書き出しで9,534商品すべてについて確定します。空でない行を数えるだけです。

こちらからは実行できません（管理画面の操作にあたるため）。**移行の可否を
左右する項目ではありませんが、書き出していただければ数分で判定できます。**

---

## 山口様の回答で片付いたもの — 2026-09-07

### Q3 — 商品見積書は使われているか `OVERTAKEN`

見積依頼の話が具体化したので、この問いの形が変わりました。山口様は
**マルチフォーム**を使い続けるおつもりで、「デザインは拘りはないので
切り替えてから確認いたします。商品名と品番が入るよう期待しております」。
有料オプションの商品見積書に移る話は出ていません。C41 / quote-form.md へ。

### Q12 — 繁忙期はいつか `PARTIALLY ANSWERED`

日付は決まっていませんが、**時間帯は決まりました。** 「できましたら夜の
時間帯　PM8時以降でしたら大丈夫です」。適用してからCSVを入れ終わるまでの
404の窓を、注文の少ない時間に寄せます。cutover-runbook.md の冒頭に明記。

### 新しく分かったこと — S・M画像に単価と数量が焼き込まれている

ct668 の説明の副産物ですが、こちらのほうが射程が広い話です。

> 管理画面でLサイズのみ変更できる仕様に変わりました。Ｓ・Ｍは管理画面から
> 変更できなくなり、ＣＳＶでしか登録変更できなくなりました。当社の画面で
> お解りのようにＳサイズの画像に単価・数量が記載しております。
> （これはスマホのページで合計金額しか表示できない（商品別特殊表示ができない）
> ための苦肉の策でした）

つまり **9,534商品の S・M 画像に、単価と数量が画像として入っています。**

- こちらの商品カードは `image_M` を出しているので、その表記はそのまま残ります
- **文字ではなく画像なので、検索にもコピーにも読み上げにも乗りません**
- 元の理由（スマホページが商品別の表示を出せない）は、**移行後には無くなります。**
  レスポンシブ1本になり、カードに `card__code`（品番）と `card__price`（税込）が
  文字で出ます

だからといって画像を作り直す話ではありません。**9,534点ぶんの画像を差し替える
判断はお店のものです。** ただ「なぜそうなっているか」の理由が移行で消えることは、
お伝えしておく価値があります。Q8（スマホ専用の商品説明）と根が同じ話です。
