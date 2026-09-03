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

### Q4 — What generates `/new/*.html`? `ANSWERED (pending console confirmation)` 2026-09-02
**Almost certainly ニュース, which Creator Mode keeps.** Answered from the archive,
no crawling and no console needed — see [`docs/news-plan.md`](news-plan.md).

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

### Q7 — What is the フリーページ URL pattern, and are redirects possible? `OPEN`
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
### Q8 — How many products carry SP-only description text or an SP-specific URL? `OPEN`
スマホ用商品詳細説明 and スマホ商品URL both stop working in Creator Mode. Across
9,514 products, any SP-only copy is silently discarded at cutover unless merged first.

### Q9 — What per-category custom titles and descriptions exist? `OPEN`
607 category pages. Creator Mode disables per-category custom page titles. Export all
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

### Q13 — What is the Creator Mode equivalent of `[SYSTEM_CODE]`? `OPEN 🔴`
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
