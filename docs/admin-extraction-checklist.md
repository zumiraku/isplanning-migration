# Admin console extraction checklist — Stage 0, second half

`console.makeshop.jp` · shop `isplanning` · 副管理者 access

**Do every export in section A–F *before* any mode switch, rehearsal included.**
Sections C and D capture data that Creator Mode discards permanently. Once switched,
it is recoverable only from what we saved — and for category titles, not at all.

Save everything under the paths given. Commit after each section.

---

## A. Basic Mode template source OK **CLOSED 2026-09-03**

The client ran デザイン一括バックアップ and sent the ZIP. Unpacked, converted to
UTF-8 and committed to `templates/basic-export/design/` — 73 files including the
header, sidebar, footer, top page, category, product detail, cart, search,
the head blocks, 53 per-category templates, 3 per-category product templates
and the system stylesheet.

**Read [design-backup.md](design-backup.md) before relying on it.** Two things
it changes: the tracking tags are NOT in the design (Q5 stays open), and there
are 56 per-category templates nobody had counted (C28).

The 210 Basic Mode variable tags the templates use are inventoried in
`inventory/basic-mode-tags.csv` — that list is what the Creator Mode rebuild has
to satisfy.

---

## B. Independent page source — **120 pages**, we hold 83 ※

**Console reality, confirmed from a screenshot 2026-09-03:** the menu is
**ショップデザイン**, not デザイン管理, and the surest route to any screen is
ホーム → 機能一覧 → the keyword box, which searches feature names, descriptions
and aliases. See [console-map.md](console-map.md). Search it for 独自ページ.
`ショップデザイン → 独自ページ`. The count of 120 came from the client and still
needs confirming against that list itself — see the note at the end of console-map.md.

**The list holds 82** (confirmed from the client's paste, 2026-09-03).

**CLOSED 2026-09-06 — we now hold all 82.** `comm` against
`inventory/freepages-admin-list.csv` returns nothing in either direction: no page
in the admin list is missing from `package/freepages/`, and no page in
`package/freepages/` is absent from the admin list.

The four the crawl could never reach came in by hand through `snapshot/manual/`
and then went through the same converter as the rest:

| Page | How it was blocked | Now |
|---|---|---|
| `page19.html` | not in the sitemap, no link the crawl could follow | 5,016 B, real body |
| `page4.html` | held only as a placeholder | 11,449 B, real body |
| `privacy.html` | **no ordinary link exists** — the footer opens it from JavaScript | recovered from the live page, 2,881 chars, built into `privacy-body.tpl` |
| `email.html` | a system page, not a free page | `$url.support` — the platform owns the screen |

※ The count of 120 came from the client and was never confirmed. **82 is what
the admin list itself holds**, and that is what we build against. If 120 is real,
then 38 pages exist that the client's own 独自ページ list does not show — which
would be a fact about the console, not a gap in our coverage.

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

## C. All 607 category titles and descriptions ※ *unrecoverable after the switch*

`商品管理 → カテゴリ管理`. Creator Mode disables per-category custom page titles.
Export **every** category's: category id, name, custom page title, description,
and any per-category HTML.

Use the CSV export if one exists. If it does not, this is a genuine problem worth
raising with MakeShop support before we switch — 607 rows is not a manual job, and
once the switch happens the values are gone.

→ `inventory/categories.csv`

---

## D. Product data export ※ *answers Q8*

`商品管理 → 商品データダウンロード` (CSV, all 9,514 products, all fields).

→ `inventory/products-export.csv`

What we need from it:
- how many products have **スマホ用商品詳細説明** populated (that field stops working)
- how many have a **スマホ商品URL** set
- how the option/price fields differ between the 488 old-scheme and 9,025 new-scheme products

This is also the ground truth for reconciling the sitemap's 9,514 against the real
product count (Q11 — `brand0` holding exactly 5,000 smells like a cap).

---

## E. Tag inventory ※ *answers Q5*

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

## F. Which discontinued features are actually in use ※ *answers Q3, Q4, Q10 — drives Gate A*

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
