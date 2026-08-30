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
| C2 | 商品見積書 | **Gone** | `?` | **Check first.** B2B novelty shop with tiered pricing is its natural user. No equivalent — would need a custom quote form |
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
| C13 | レコメンド (option) | **Verify** | `YES` | 4 rows on 商品詳細, explicitly in scope. Identify the exact product → its Creator Mode install procedure. SP horizontal scroll already approved by client |
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
