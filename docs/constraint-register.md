# Constraint register — Basic Mode features Creator Mode does not carry over

Living document. **"Used?" is a question until Stage 0 answers it from the admin console.**
Anything confirmed as *used* **and** *unavailable* is a functional change the client must
decide on at **Gate A (week 2)** — not something we absorb quietly or raise in week ten.

Source: MakeShop オンラインマニュアル「クリエイターモードで対応していない機能について」
<http://ms-manual.makeshop.jp/creator_unavailable/>

Status: `?` unverified · `YES` in use · `NO` not in use · `DECIDED` client has ruled

| # | Feature | Creator Mode | Used? | Evidence / plan |
|---|---|---|---|---|
| C1 | オプションテーブル形式 | **Gone** | `YES` | The 3×7 `brand_option` matrix on 商品詳細. Layout rebuilt in template markup; behaviour preserved by the Stage 4 rewrite |
| C2 | 商品見積書 | **Gone** | `NO` ✅ | **CLOSED 2026-08-30.** Client confirms it is a paid MakeShop option they do not subscribe to. The risk I rated most likely to derail Stage 4 does not exist. **But see C20/C21** — two other quote flows do |
| C3 | インフォメーション | **Gone** | `?` | 101 `/new/*.html` articles, 2013→2026, indexed. If these are インフォメーション and not ニュース, 101 URLs are at risk. See Q4 |
| C4 | カテゴリページ独自タイトル・説明文 | **Gone** | `YES` | **Confirmed comprehensive (S0-17):** 604 unique titles, 601 unique descriptions across 607 categories. Captured to inventory/categories-seo-backup.csv. Reproduction strategy is a Gate A decision |
| C5 | スマホ用商品詳細説明 / スマホ商品URL | **Gone** | `?` | Across 9,514 products. Any SP-only copy is silently discarded at cutover unless merged first |
| C6 | 追加画像レイアウト設定 | **Gone** | `?` | Gallery rebuilt as a template component |
| C7 | 一発購入 | **Gone** | `?` | Verify; if used, agree a replacement purchase flow |
| C8 | 移動イベントバナー | **Gone** | `?` | Possible on the top page. Reproduce as a normal banner/slider component |
| C9 | 投票 / 懸賞 | **Gone** | `?` | Unlikely. Verify and close |
| C10 | アクセス統計 | **Gone** | `?` | Client may still consult it. Move him to GA4 before cutover; walkthrough at handover |
| C11 | RSS配信 / WebFTP複数画像管理 | **Gone** | `?` | Usually low impact |
| C12 | 商品レビューのデザイン設定 | **Gone** | `?` | Restyle via the review templates instead |
| C13 | レコメンド＝**イーレコメンド** | **Verify** | `YES` | Corrected 2026-08-30 (S0-20) — not さぶみっと. Console at e-reco.jp. Two tags: 基本タグ in every page head, 表示タグ on 商品詳細. Creator Mode conversion tag at ショップ構築→設定→SEO・マーケティング→タグの設定. SP horizontal scroll approved by client |
| C14 | Checkout / member / mypage templates | **Verify** | `YES` | Confirm which are editable. Sets the ceiling on design consistency — tell the client early |

## Additional constraints found outside this list

| # | Constraint | Impact |
|---|---|---|
| C15 | **No 独自ページ → フリーページ converter.** MakeShop states pages must be created anew | 83 free pages rebuilt by hand. Client's "テンプレート化で結構です" is what makes this tractable — 3–4 templates, then content |
| C16 | **No variable tag for an arbitrary category's product list.** Only 新商品 / おすすめ商品 / スペシャル商品 / ランキング / 最近見た商品 | The top page's seasonal blocks must be re-sourced via 商品グループ, スペシャル商品, or curated static markup. Editorial cost to the client → belongs in Gate A |
| C17 | **EUC-JP → UTF-8.** Basic Mode is EUC-JP throughout; Creator Mode is UTF-8 | Every salvaged string passes through explicit conversion with a mojibake check. Copy-paste between editors is the classic failure |
| C18 | **Separate `/smartphone/` site disappears.** `rel="alternate"` + UA detection today | Two URL spaces collapse to one. SEO migration, not just layout: dismantle alternate/canonical, handle indexed `/smartphone/*`, merge SP-only copy |
| C19 | **No version history in the admin console** | This repo is the undo button. Export before every edit |

## Cleared / non-issues

| # | Item | Why it's fine |
|---|---|---|
| N1 | Rollback | Basic Mode content survives the switch and the shop can be switched back. Makes the cutover rehearsable — this is the project's safety net |
| N2 | ~~Custom stylesheet on the file server is our bridge for salvaged rules~~ **WITHDRAWN 2026-08-29** | The surviving `default.css` is 22 KB of spacing utilities with **zero colours and zero fonts**. All the actual design sits in the 171 KB Basic Mode system stylesheet, which dies at the switch. The file server is still useful for *staging new* CSS before cutover, but there is nothing to salvage from it. See `docs/findings-stage0.md` S0-13 |
| N3 | Client's appetite for change | "見た目そっくりそのままの移行にこだわりはございません" + explicit authorisation to delete unused CSS. Removes the usual pixel-chase constraint |

## Added from the client reply, 2026-08-30

| # | Item | Status | Detail |
|---|---|---|---|
| C20 | **マルチフォーム 見積依頼** on 商品詳細 | `YES` 🔴 | A quote-request form sits under the カートに入れる button, built with MakeShop マルチフォーム. This is a live commercial flow on the highest-value page type and it was **not** visible in the survey. Confirm マルチフォーム survives Creator Mode, and that the form, its fields and its destination are reproduced exactly |
| C21 | **カゴ内 見積依頼** via `[BASKET_MAIL]` | `YES` 🟡 | The cart carries 「購入の前に見積もりを依頼をする場合はこちらからどうぞ」. Client believes the Creator Mode equivalents are `$$MAIL_ORDER$$` / `$$MAIL_ORDERTOTAL$$` but wrote "たぶん" — **verify, do not assume**. Our archived cart was empty so the tag never rendered; needs a cart with items |
| C22 | **サブ画像のスワイプ（SP）** | New request | Client: 「サブ画像使用（スマホではスワイプできればと思います）」. A second explicit UI request alongside the recommend rail. Same CSS scroll-snap technique — no library |
| C23 | **割引設定** on product pages | `YES` | Client flagged /shopdetail/003003000870/ as using it. Confirm how discounts render and whether the pricing rebuild must account for them — the endpoint returns is_member_price and member_price fields we have not exercised |
| C24 | **追加説明文1 に独自CSS** | `YES` | Two different patterns flagged (/shopdetail/000000023664/ and /shopdetail/051000000001/order). Per-product CSS inside a description field will not survive a token-based rebuild untouched — needs a component instead |
| C25 | **カレンダーのカテゴリページ** | `YES` | /shopbrand/051/O/ — captured in the archive before the block. Distinct layout; treat as its own category-template variant |

### Client decisions already given

- 「これらも近い感じにできればOKです」 — the five unusual pages need to be *close*, not identical. Consistent with his earlier 見た目そっくりそのままにこだわりはない.
- 商品見積書 is not used (C2 closed).
- Full admin permissions granted 2026-08-30.
