# Admin console extraction checklist — Stage 0, second half

`console.makeshop.jp` · shop `isplanning` · 副管理者 access

**Do every export in section A–F *before* any mode switch, rehearsal included.**
Sections C and D capture data that Creator Mode discards permanently. Once switched,
it is recoverable only from what we saved — and for category titles, not at all.

Save everything under the paths given. Commit after each section.

---

## A. Export the Basic Mode template source 🔴 *unblocks Q1 — the whole pricing question*

We have 195 **rendered** pages in `snapshot/`. We do not have the **source** as it was
typed into the admin, which is what we actually port.

`ショップデザイン → ベーシックモード` — for each editable area, copy the raw
contents of the HTML box into a file:

| Area | Save as |
|---|---|
| 共通ヘッダ | `templates/basic-export/header.html` |
| 共通フッタ | `templates/basic-export/footer.html` |
| トップページ フリースペース (all of them) | `templates/basic-export/top-freespace-NN.html` |
| 商品詳細 フリースペース (all of them) | `templates/basic-export/detail-freespace-NN.html` |
| カテゴリページ フリースペース | `templates/basic-export/category-freespace-NN.html` |
| カゴの中 / 会員関連 free areas | `templates/basic-export/<area>.html` |
| 独自CSS 欄 | `templates/basic-export/custom.css` |
| 独自JS 欄 (if separate) | `templates/basic-export/custom.js` |

**Residual check only — this is now largely answered.** `updateOptionPrice` /
`updateOptionPriceAjax` have been shown to be MakeShop platform JS (see
`spec/option-engine.md` §1). While you are in these boxes, just confirm the code does
**not** also appear in any free-space area. Expected: it does not.

The question that replaced it is **Q1b**, and it is answered in §H below, not here:
does `/shop/shopdetail_option.html` still work under Creator Mode?

---

## B. Independent page source — **120 pages**, we hold 83 🔴

**Console reality, confirmed from a screenshot 2026-09-03:** the menu is
**ショップデザイン**, not デザイン管理, and the surest route to any screen is
ホーム → 機能一覧 → the keyword box, which searches feature names, descriptions
and aliases. See [console-map.md](console-map.md). Search it for 独自ページ.
`ショップデザイン → 独自ページ`. The count of 120 came from the client and still
needs confirming against that list itself — see the note at the end of console-map.md.

**The list is reported as 120, not yet confirmed against this screen.** The sitemap
listed 83, which is what we crawled and converted, so **37 pages have never been
seen** — no URL, no title, no idea whether they are live.

The single most valuable thing from this screen is **the list itself**: names or
numbers for all 120, however rough. That turns 37 unknowns into a finite list.

Then capture the source HTML as entered, plus title and URL, for the pages we do
not hold → `templates/basic-export/freepages/pageNN.html`.

Four are known by name because the live site links to them:

| Page | Title to look for |
|---|---|
| `page4.html` | エスピーソース / SP SOURCE カタログ・名入れのご案内 |
| `page19.html` | 卓上カレンダーを使うメリット |
| `email.html` | お問い合わせ |
| `privacy.html` | 個人情報保護ポリシー |

`privacy` has no ordinary link anywhere — the footer opens it with JavaScript —
which is why neither the sitemap nor the crawl ever found it.

These four can also be fetched without the admin at all: they are live, and a
person opening them in a browser and saving the HTML into `snapshot/manual/`
gives us the same thing. See that folder's README.

---

## C. All 607 category titles and descriptions 🔴 *unrecoverable after the switch*

`商品管理 → カテゴリ管理`. Creator Mode disables per-category custom page titles.
Export **every** category's: category id, name, custom page title, description,
and any per-category HTML.

Use the CSV export if one exists. If it does not, this is a genuine problem worth
raising with MakeShop support before we switch — 607 rows is not a manual job, and
once the switch happens the values are gone.

→ `inventory/categories.csv`

---

## D. Product data export 🔴 *answers Q8*

`商品管理 → 商品データダウンロード` (CSV, all 9,514 products, all fields).

→ `inventory/products-export.csv`

What we need from it:
- how many products have **スマホ用商品詳細説明** populated (that field stops working)
- how many have a **スマホ商品URL** set
- how the option/price fields differ between the 488 old-scheme and 9,025 new-scheme products

This is also the ground truth for reconciling the sitemap's 9,514 against the real
product count (Q11 — `brand0` holding exactly 5,000 smells like a cap).

---

## E. Tag inventory 🔴 *answers Q5*

`ショップ設定 → SEO・SNS・マーケティング` (or wherever tags are injected), **and the
order-completion page specifically**.

Capture verbatim, into `inventory/tags.md`:

- [ ] GA4 — expect `G-BK1PPN5MEV`; confirm it is the only property
- [ ] Google Ads conversion tag (完了ページ)
- [ ] Yahoo!広告 / その他 conversion tags
- [ ] **さぶみっと！レコメンド CV acquisition tag** — its PV-CV feature requires one on the
      completion screen. We know the basic tag is `//d.rcmd.jp/isplanning/item/recommend.js`;
      the CV tag is separate and invisible from outside. If it exists and we drop it,
      their recommendation engine silently stops attributing revenue.
- [ ] Search Console verification method (meta tag / file / DNS)
- [ ] Any other third-party script

---

## F. Which discontinued features are actually in use 🔴 *answers Q3, Q4, Q10 — drives Gate A*

Walk the admin menu and record used / not used for each:

| Feature | Used? | Notes |
|---|---|---|
| 商品見積書 | | **Check first** — no Creator Mode equivalent, and a B2B novelty shop is its natural user |
| インフォメーション | | Is this what generates `/new/*.html`? |
| ニュース | | If `/new/` is this instead, those 101 URLs are safe |
| 一発購入 | | |
| 投票 / 懸賞 | | |
| 移動イベントバナー | | |
| アクセス統計 | | Does the client actually use it? He needs GA4 before we remove it |
| RSS配信 | | |
| WebFTP 複数画像管理 | | |
| 商品レビュー デザイン設定 | | |
| オプションテーブル形式 | | Known used — the 3×7 matrix |

**Q4 is the valuable one.** 101 indexed URLs hang on whether `/new/` is ニュース
(Creator Mode has editable templates → safe) or インフォメーション (discontinued → they
need a plan). Look at which admin screen creates a `/new/YYYY-MM-DD-HHMMSS.html` entry.

**Q10:** find what generates the top-page shipping calendar — hand-edited HTML, a
platform feature, or a third-party widget.

---

## G. Creator Mode reconnaissance *(read-only — do not apply anything)*

`ショップデザイン → クリエイターモード`

- [ ] How many design sets exist, and can we build a **second** set without affecting
      the live Basic Mode shop? If yes, that is our staging environment and it changes
      the schedule for the better.
- [ ] `フリーページ管理` — what URL pattern do new free pages get? Compare against the
      current `/html/pageNN.html`. **This decides whether we need 83 redirects.** (Q7)
- [ ] Is there any redirect / URL mapping facility anywhere in the admin? (Q7)
- [ ] Confirm which checkout, member and mypage screens appear as editable templates. (Q6)

---

## H. Rollback rehearsal — *only after A–F are exported*

Off-peak, and short:

1. Note the exact time.
2. Switch to Creator Mode.
3. Confirm: top page loads, a product page loads, cart works.
4. **Answer Q1b — the single most valuable two minutes in this checklist.**
   With the shop in Creator Mode, run `.\tools\probe-options.ps1 -Label creator`
   from this repo (no login needed — it hits a public endpoint). It POSTs the same
   payloads we captured under Basic Mode and diffs the responses.
   - **Identical responses** → we rebuild only the client side. Tractable.
   - **404 / different shape / error** → option pricing must be baked into the
     template. Substantially larger, and it changes what we tell 山口様 at Gate A.
5. Confirm the Basic Mode content is still intact in its editor.
6. Switch **back** to Basic Mode.
7. Confirm the live site is exactly as before.
8. Re-run `.\tools\probe-options.ps1 -Label basic-after` to prove nothing changed.

Record start/end times and anything surprising → `docs/rollback-rehearsal.md`.

This proves the safety net on *this* shop rather than in a manual, and it is what makes
the 11/11 cutover a rehearsed operation instead of a leap.

---

## I. Access we need alongside the console

- [ ] **Google Search Console** — read access, for the pre/post benchmark and the
      cutover 404 watch. Without it we cannot prove we did no SEO harm.
- [ ] **GA4** — read access to `G-BK1PPN5MEV`, for the traffic and conversion baseline.

---

## J. Two questions only 山口様 can answer

- [ ] **Busy season.** Cutover is pencilled for Wed 2026-11-11. Novelty and 景品 demand
      is seasonal and year-end may already be ramping. If that week is bad, we move it —
      there is room in the schedule.
- [ ] **The 101 news articles.** Many are near-duplicate holiday notices (夏季休業日のお知らせ
      appears 4 times) with roughly one sentence of unique content each. Does he want all
      101 carried over, or the archive consolidated? This is his content decision, and it
      belongs in Gate A.
