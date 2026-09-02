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
| Bytes in → out | 1,063,817 → **504,557** (−53%) |
| Inline `style` attributes processed | **1,545** |
| Declarations dropped by a named rule | 3,549 |
| Declarations mapped to a component | 169 |
| Legacy classes dropped | 1,241 |
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

## Still open

| | |
|---|---|
| **63 unmapped classes** | All styled only by stylesheets that die at the switch (51 in the 171 KB system sheet, 6 in the embedded blocks, 6 defined nowhere and already dead). Each needs a look at the archived rendering to decide: rebuild or drop. `inventory/freepage-unmapped.csv` names each one, its page count and where it was defined |
| **19 pages flagged** `over-half-removed` | All 24 chrome-carrying pages plus `page82`. Expected — but each should be eyeballed against `snapshot/` before Gate C |
| **418 links to `/html/*.html`** | Internal links between free pages. Creator Mode gives free pages new URLs (Q7), so every one of these needs rewriting at cutover, along with the redirect map |
| **17 inline event handlers** | Mostly `window.open` popups for PDFs and the quote-request form. Needs rebuilding as ordinary links or a small handler — one of them is a commercial route (C20) |
| **`page82`** | 「spカレンダー用ダミーページ」, 14 characters. Tied to the SP site, which disappears. Check for references, then retire |

## For Gate C

Open `templates/creator/preview/freepages/index.html`. It lists all 83 with
archetype, heading, new title, size, image and table counts, and any review flag,
each linking to the rendered page. Titles over 60 characters are marked — there
are currently **none**, down from the 13 the survey found.
