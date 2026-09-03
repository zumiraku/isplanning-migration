# Stage 5 — the 83 free pages

`独自ページ` → Creator Mode `フリーページ`. Client's instruction was
**「独自ページ：テンプレート化で結構です…見やすくして頂ければ結構です」**, with
titles to be tidied and unused CSS free to delete.

Status: **converted, rendered and verified responsive. Awaiting Gate C sign-off.**

---

## The pipeline

```powershell
.\tools\convert-freepages.ps1        # source bodies -> content fragments
.\tools\build-freepage-previews.ps1  # fragments -> full pages + review index
.\tools\check-responsive.ps1         # every page at 375 / 768 / 1440px
```

| | |
|---|---|
| `templates/basic-export/freepages/*.html` | input: the 83 extracted Basic Mode bodies |
| `templates/creator/freepages/*.html` | output: content fragments, chrome-free |
| `templates/creator/freepage-template.html` | the page shell |
| `templates/creator/css/freepage.css` | the components the conversion maps onto |
| `templates/creator/preview/freepages/` | 83 rendered pages + `index.html` |
| `inventory/freepage-conversion-report.csv` | per page: what changed |
| `inventory/freepage-unmapped.csv` | everything no rule claimed, with where it was defined |
| `inventory/freepage-responsive-check.csv` | the 375/768/1440 result per page |

**Rule the converter follows: nothing is dropped silently.** Every class and every
CSS declaration is mapped, or dropped by a rule that names it and says why, or
reported as unmapped for a person to decide. A converter that quietly discards
what it does not recognise is how a page loses a phone number.

## What the conversion did

| | |
|---|---:|
| Pages converted | **83** |
| Bytes in → out | 1,063,817 → **502,820** (−53%) |
| Inline `style` attributes processed | **1,545** |
| Declarations dropped by a named rule | 3,549 |
| Declarations mapped to a component | 169 |
| Legacy classes dropped | **1,313** |
| Embedded `<style>` blocks lifted out | **18** |
| `<script>` blocks lifted out | **49** |
| Duplicate breadcrumb trails removed | **43** |
| Page headings lifted into metadata | **60** |

## Four things the survey had not seen

### 1. Chrome survived the extraction on 24 pages 🔴

The Stage 0 extraction derived chrome from what all 83 bodies share, so it left
chrome behind wherever a page's chrome differs from the corpus.

- **20 pages still carried the entire site footer** — `#footerWrap`, the company
  address, payment icons, copyright, and a `JavaScript:bottom_sendmail()` link
  that will not exist in Creator Mode. Between **23% and 78%** of each file.
  Pasted into a free page as-is, those 20 pages would each have rendered a
  second, stale footer inside their own content.
- **4 pages** (`company`, `info`, `ordercontract`, `page32`) carried the header,
  the basket widget *and* the left sidebar — and their real content sits **after**
  all of it. Trimming from the sidebar would have deleted the 会社概要 page.

So the converter finds a content *window* rather than trimming one end:
`#O_adminPagearea` → `.M_mainContents` → `.PageArea` for the start, then
`<p class="pageTop">` / `#O_container` / MakeShop's hex comment for the end.

It also means **S0-15's per-page content sizes were inflated** for those 24 pages.

### 2. Thirteen pages ship a duplicated CSS framework

Pages 68–80 each carry their own `<style>` block of 80–106 rules — about **54 KB
of near-identical CSS**, one copy per page, differing mainly in per-page anchor
offsets (`#i1`…`#i4` set `margin-top:-200px; padding-top:200px` to clear a fixed
header — `scroll-margin-top` does that in one line, without leaving 200px of
invisible clickable padding over the preceding element).

All of it is now one shared set of rules in `freepage.css`. The originals are kept
in `templates/creator/css/_extracted-legacy.css` for review; that file is loaded
nowhere.

### 3. Thirty-eight pages carry their own breadcrumb trail

Complete with schema.org `BreadcrumbList` markup. The template emits breadcrumbs
itself, so leaving these would give those pages two visible trails and two
`BreadcrumbList` items in the structured data — worse than having none.

### 4. The malformed markup is deliberate, and documented in their own source

`company.html` says so directly:

> 後述でtd等自動挿入されるため MakeShop独自のテーブルタグを強制的に閉じないようにしております。

That is S0-3 confirmed from the inside: the pages depend on Basic Mode
auto-closing tags it emits later. Creator Mode does not. It also shows up as
container openers arriving as `div class="…">` with **no `<` at all** — which is
why the converter's start markers are written `<?div`. Requiring the bracket
missed 53 of the 83 pages.

## The identical-h1 defect is fixed here

Every page on the site currently ships the same `<h1>`
(粗品や景品、ノベルティの名入れ通販｜粗品のことなら発見マーケット — S0-16), with the
real page heading demoted to `<h2>` in the body. The converter lifts that leading
heading out into metadata and the template emits it as the page's own `<h1>`.
60 of 83 pages had one to lift; the rest take their heading from the title plan.

## Verification

`tools\check-responsive.ps1` loads all 83 at 375 / 768 / 1440 CSS px and fails any
page that scrolls horizontally. **83 / 83 pass.**

Two mechanical notes, both of which cost time and would cost it again:

- Headless Chrome on Windows will not open a window narrower than about **485 CSS
  px**, so a phone width cannot be tested by sizing the window. It can be tested
  inside an iframe, which gives the embedded document a real 375px layout viewport,
  media queries included. Reading across that boundary from `file://` needs
  `--allow-file-access-from-files`.
- Headless ends its virtual time budget when the main frame first goes idle —
  which is after the *first* iframe loads. A single run walking all 83 pages
  sequentially reports **“1 of 1 OK”** and never looks at the other 82. So the
  checker launches one browser per page and loads the three widths in parallel.

The check found a real defect on its first run: the header search box overflowed
at 375px — in shared chrome, so on **every page type**, not just free pages. It
was landing in an `auto` grid column where its width came from the input's
intrinsic size rather than the space available. Fixed in `components.css`.


## The class map is complete — 2026-09-02

**Zero unmapped classes, zero unmapped declarations.** Every class and every CSS
declaration across all 83 pages now resolves to a named rule.

The 63 that were open all had the same problem: they were styled *only* by
stylesheets that do not survive the switch, so "leave them alone" was never an
option — each was rebuild or drop. Mapped from what their rules actually did,
never from their names. Five new components absorbed most of them:

| Component | Replaces | What the original did |
|---|---|---|
| `.panel` / `.panel__head` | `m-box-main`, `m-box-h`, `nap-box` | bordered box with a dashed heading rule, pinned to `width: 70%` |
| `.calloutbox` | `box-itema/b/c` | three centred colour tiles differing only in shade of green |
| `.flow` | `flow`, `step-wrap`, `step-inner`, `icon` | numbered process steps, the number drawn as a 50px circle |
| `.scenetile` | `page_scenep`, `page_scene3`–`7` | six hard-coded gradient variants |
| `.tilegrid` / `.tilecap` | `itemwrapping*`, `categotybanner`, `page_scene`, `textboxisp` | 290×290 tiles in a flex row pinned to 900px |

Everything pinned to a pixel width became fluid — those widths are precisely what
breaks on a phone. Spacing and type-size utilities (`mt30`, `ft14`, `u-pt20` …)
were dropped: the token scale owns both now.

### Three defects this pass turned up

- **A malformed attribute in the source.** `page75` line 137 reads
  `class="u-m0 u-pb1em style="margin:50px 0 0 0;">` — the class attribute never
  closes, so it swallows the start of the style attribute. A naive
  `class="([^"]*)"` match then reads a "class name" containing markup, and the
  paragraph's styling is lost. One occurrence corpus-wide, now repaired by a
  counted rule rather than tolerated.
- **`textboxisp` was mapped by name, not by behaviour.** It reads like a text
  box, so it went to `.notice` — but its rule is a grey centred caption strip
  under a thumbnail, and it appears only on the two scene pages. As a notice it
  drew a green box around every thumbnail and squeezed the caption into a
  one-character-per-line column. Fixed to `.tilecap`, and the blanket
  `.scenegrid a` rule that caused the green box is gone. **This is the argument
  for screenshots: it passed every automated check.**
- **A 45-character SEO title was being rendered as an `<h1>`** on the 23 pages
  with no heading to lift. The fallback split the title on ｜ and 【 — typed as
  literals in a BOM-less UTF-8 PowerShell file, which 5.1 reads as ANSI, so the
  pattern arrived mangled and matched nothing. Separators are now built from
  code points, and the first fallback is the first heading in the page itself.


## Four free pages are missing from the inventory 🔴 *found 2026-09-03*

Diffing every `/html/*.html` link in the corpus against the 83 we hold turns up
four pages the live site links to and we have never seen:

| Page | Linked from | In sitemap | Archived |
|---|---:|---|---|
| `/html/page4.html` | **30** free pages | no | no |
| `/html/page19.html` | **20** free pages | no | no |
| `/html/privacy.html` | **20** free pages | no | no |
| `/html/email.html` | 2 free pages | no | no |

These are not obscure. `page4` is linked from more than a third of the free pages,
and `privacy.html` is the privacy policy — a page a shop is legally expected to
have and which the footer's own JavaScript opened.

**The sitemap is therefore not a complete inventory of the free pages.** It listed
83; there are at least 87. That is the same shape of problem as the 912-URL
smartphone space (S0-19): live, linked, indexed, and absent from the sitemap.

They cannot be crawled — the site returns 403 to our automated requests and the
no-crawl rule stands. They come from the console: `ショップデザイン → 独自ページ`, whose
list is authoritative in a way the sitemap has now twice proven not to be
(checklist §B). Added to the redirect map as `MISSING` so they cannot be forgotten
at cutover.

**Until they are recovered, Stage 5 is 83 of at least 87 pages, not complete.**


## C25 — the calendar category page

`https://www.isp-sp.com/shopbrand/051/O/`, one of the five 変わった作りのページ the
client flagged. Rebuilt: `tools\build-category-calendar.ps1` →
`templates/creator/preview/category-calendar.html`.

It is not a category listing. It is a hand-built 3-column
`<table class="calender_List">` of 25 curated products sitting under two
business-day calendars, all inside the category free space. Since no Creator Mode
variable tag reproduces an arbitrary curated list (C16), the layout is rebuilt as
template markup and the content carried across from the archive — the closed days,
the 25 cells and the intro copy all come out of the captured page.

Three things deliberately change:

- **The 3-column table becomes a responsive card grid.** Three product photos
  across a 375px screen is unusable, and this page is reached from a phone in Q4
  by people buying next year's calendars.
- **The NEW badge stops being invisible.** The live markup is
  `<SPAN style="color: yellow;">NEW</span>` — yellow text on a white background.
  It becomes the design system's `.badge--new`.
- **Closed days stop being colour-only.** The platform marks them with
  `bgcolor=#cccccc` and nothing else; each closed cell now also carries a label
  that only assistive technology reads.

### Two defects caught in building it, both worth remembering

**A regex that spanned two cells produced a card with one product's name and
another product's image and link** (マジカルエコカレンダー's name against
3か月カスタムエコカレンダー's photo and `/shopdetail/000000025459/`). One cell had a
`<br />` the others did not, the whole-cell expression failed there, and the lazy
group expanded across the boundary. On a shop page that sends the customer to the
wrong product — worse than dropping the row, because nothing looks wrong. Cells are
now isolated before being parsed.

**The month length was derived from the cells we managed to scrape**, which
silently truncated August at the 30th and September at the 27th. A business-day
calendar missing the end of the month is wrong information. It now comes from
`[DateTime]::DaysInMonth`.

Q10 still stands: whether the calendar is a platform feature or pasted HTML decides
whether we embed a tag or generate it. The markup is platform-shaped
(`<font color=#FF0033>`, `bgcolor`), so a tag is likely.


## Navigation coverage sweep — 2026-09-03

Converting a page is not much use if nothing links to it. This sweep took every
class and every link destination out of the four archived page types (top,
category, product, cart) and asked which ones nothing in our templates accounts
for.

### What it found: six free pages had become unreachable

The Basic Mode left sidebar (`#M_leftContents` / `#O_sideMenu`) was the only
route to these:

| Page | | In our set |
|---|---|---|
| `page3` | 名入れサンプル・名入れのメリット | yes |
| `page5` | 季節で選ぶ粗品 | yes |
| `page6` | メールマガジン登録 | yes |
| `page8` | シーンで選ぶ | yes |
| `page9` | 商品別カテゴリー | yes |
| `page4` | エスピーソースカタログ | **never captured** |

Plus `info.html#about_receipt`, the インボイス制度 anchor.

Dropping the sidebar was right — a fixed left column of links is a poor use of a
phone screen, and the category tree lives in the header nav now. But nothing
picked up its content, so five converted pages and one uncaptured one had no
inbound link from anywhere in the rebuild. They would have shipped as orphans:
still at their URLs, still indexed for a while, reachable only by typing the
address.

All of it now lives in a four-column footer, present on every template.

### page4 and privacy now have placeholder pages

Both are linked from the live site and neither was ever captured. Rather than
leave two dead links in the review, each has a fragment saying plainly that the
page is still to be recovered from the admin. The preview builder was changed to
walk the fragments on disk rather than the conversion report, so pages we do not
yet hold still appear — the gap stays visible instead of being skipped.

### One bug this turned up in the tooling

The builders rewrote free-page links for root-level pages from a fixed list of
four names. The new footer links to nine, so the other five silently pointed at
files that were not there — the same class of bug the footer was added to fix.
Now a pattern, not a list.

### Verified

**1,679 internal links across 98 pages, none broken.** 85 free pages and 8
templates all pass at 375 / 768 / 1440.


## The smartphone pages carry content the desktop pages do not 🔴 *2026-09-03*

Every free page was converted from its **desktop** capture. The separate
`/smartphone/` URL space disappears at the switch (C18). So anything that exists
only in the SP document is lost, silently, and nobody would notice until a
customer asked why a price had vanished.

`tools/compare-sp-content.sh` answers it: **135 lines of page-specific content,
across 46 of the 83 pages**, present in the smartphone document and nowhere in
the desktop one. → `inventory/sp-only-content.csv`

Most are cross-sell links the SP template carries and the desktop one does not
(●防災粗品販売ページはこちら, ●卓上カレンダーの販売ページ). Some are not.

**`page2` — 名入れ・包装・熨斗のご案内 — has 28 lines of it**, and they are the
kind a buyer reads before committing to an order:

- 「■「のし」・「包装」は別途1個に付、のし20円(税別)・包装50円(税別)の追加料金になります」
- 「1色刷り〜4色刷り:」
- 「■名入れ代・版代・名入れスペース」
- 「(ページ上に記載の名入れ最低数量以下でも名入れ出来る物もございますのでご希望数量でお問合せください)」

Pricing, print-colour options, and the note that the stated minimum quantity is
negotiable. On a shop where most traffic is mobile, that is the page the SP
template was clearly maintained for.

**Action:** merge the SP-only lines into the converted fragments before Gate C,
starting with page2, ordercontract, page47, page3 and page16. The CSV is ordered
by page for exactly that.

### The measurement was wrong three times before it was right

Worth writing down, because each wrong answer looked plausible:

| Attempt | Answer | Why it was wrong |
|---|---:|---|
| Line diff, raw | 2,162 lines | Desktop writes ＦＡＸ, smartphone writes FAX. Character width, not content |
| Normalised, `\s` stripped | 0 lines | `\s` includes the newline, so every document collapsed to one line |
| Normalised correctly | 2,075 lines | Text both documents carry but split differently across tags — the invoice number is one table cell on desktop and one sentence on SP |
| Substring test + frequency split | **135 lines** | Only counts text absent from the desktop document entirely, and separates the 24 chrome lines that appear on all 78 pages |

A diff between two templates of the same content is mostly noise. The number
only became trustworthy once each source of noise was named and removed.


## The admin lists 120 free pages, not 83 🔴 *2026-09-03*

The client read the count off the 独自ページ list in the console: **120**.

| Source | Count | |
|---|---:|---|
| Client's original estimate | 60〜70 | in the brief |
| sitemap.xml | 83 | what we crawled and converted |
| Links found in the corpus | ≥87 | page4, page19, privacy, email |
| **Admin 独自ページ list** | **120** | the only authoritative source |

**So 37 pages are invisible from outside.** Not in the sitemap, not linked from
anything in the 195-page archive, never crawled. We do not know their URLs, their
titles or whether they are live, orphaned drafts or seasonal pages left in place.

That makes this the third time the sitemap has under-reported — after the 912-URL
smartphone space (S0-19) and the four linked-but-unlisted pages. It is not an
inventory of anything and should not be treated as one again.

### What this changes

- **Stage 5 is 83 of 120, not complete.** Every count in this document describes
  the 83 we hold; they are all still true of those 83.
- The two archetypes cover 75 of 83. Whether they cover the other 37 is unknown —
  a third template may be needed.
- The redirect map is missing 37 rows.
- Gate C cannot honestly be called ready on 83 pages while 37 are unexamined.

### What is needed

The page list itself: names or numbers for all 120, however rough. That turns 37
unknown pages into a finite list, and it is the difference between "we converted
what the sitemap showed" and "we converted the shop".

## Still open

| | |
|---|---|
| ~~63 unmapped classes~~ | **CLOSED 2026-09-02.** All mapped from what their rules in the dying stylesheet actually did — see "The class map is complete" below. `inventory/freepage-unmapped.csv` is now empty |
| **19 pages flagged** `over-half-removed` | All 24 chrome-carrying pages plus `page82`. Expected — but each should be eyeballed against `snapshot/` before Gate C |
| **4 missing free pages** | `page4`, `page19`, `privacy`, `email` — linked from the live site, absent from the sitemap and the archive. Recover from `ショップデザイン → 独自ページ` (checklist §B), convert, and fill in their redirect rows |
| **66 images on `/design/isplanning/`** | Root-relative into the Basic Mode design folder, across 35 pages. Whether that path survives the switch is a console question — the design set moves. Counted in the report as `design_imgs`, deliberately not rewritten |
| **418 links to `/html/*.html`** | Internal links between free pages. Creator Mode gives free pages new URLs (Q7), so every one of these needs rewriting at cutover, along with the redirect map |
| **17 inline event handlers** | Mostly `window.open` popups for PDFs and the quote-request form. Needs rebuilding as ordinary links or a small handler — one of them is a commercial route (C20) |
| **`page82`** | 「spカレンダー用ダミーページ」, 14 characters. Tied to the SP site, which disappears. Check for references, then retire |

## For Gate C

Open `templates/creator/preview/freepages/index.html`. It lists all 83 with
archetype, heading, new title, size, image and table counts, and any review flag,
each linking to the rendered page. Titles over 60 characters are marked — there
are currently **none**, down from the 13 the survey found.
