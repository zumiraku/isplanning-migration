# The /new/ archive — what it actually is

Built from the archive, offline. `tools\extract-news.ps1` decodes all 101 captured
pages, pulls each article out of its chrome, and classifies it →
`inventory/news-articles.csv` plus the bodies in `templates/basic-export/news/`.

---

## Two corrections to what we had recorded

### 1. It is 100 articles, not 101

101 URLs, of which **one is `/new/index.html`** — the list page. Every earlier
count, including the Gate A draft, said 101 articles. Corrected everywhere.

### 2. It is not "thin, duplicated filler" — S0-5 overstated it

S0-5 measured a single page, found one sentence of article inside 4,734 characters
of chrome, and generalised. Measured across all 100:

| | |
|---|---:|
| Median article length | **246 characters** |
| Under 100 characters | 11 |
| 100–300 | 59 |
| 300 or more | 30 |
| Carrying links | **68** |
| Carrying images | **57** |
| Posts in 2026 so far | 4 |

Roughly seven posts a year, every year from 2013 to now. This is a maintained
announcement feed, not an abandoned pile.

**What it is mostly:** seasonal catalogue announcements.

| Category | Count |
|---|---:|
| Catalogue / product news (エスピーソースカタログ etc.) | **53** |
| Closure notices — 年末年始 14, 夏季 9, other 4 | **27** |
| Other | 18 |
| Site renewal | 2 |

The genuine duplication is narrower than "101 near-identical holiday notices": it
is 27 closure notices whose dates are all in the past, and a run of seasonal
catalogue posts each superseded by the next.

---

## Q4 — these URLs are very probably safe OK

Open question Q4 asks whether `/new/` comes from **ニュース** (Creator Mode has
editable ニュース一覧 / ニュース詳細 templates → safe) or **インフォメーション**
(discontinued → 101 indexed URLs at risk). The archive answers it, short of the
console confirming:

- Every one of the 100 detail pages carries the same platform markup:
  `<div id="newsHead"><span class="date">…</span>TITLE</div>` followed by
  `<div id="newsContents">`.
- All 100 link to `index.html?mode=list`.
- `/new/index.html` is a list page built on `#newsList`.
- The URL shape is `/new/YYYY-MM-DD-HHMMSS.html` — a platform-generated stamp, not
  anything a person types.

That is MakeShop's ニュース feature. **インフォメーション is a different thing** — a
notice block on the shop front, not a set of dated article URLs.

**Consequence, if confirmed: there is no content migration here at all.** The
articles live in the platform's own news store and are re-rendered by whatever
templates the shop is running. Our work becomes two editable templates —
ニュース一覧 and ニュース詳細 — and the 101 URLs stay exactly where they are.

**Still confirm in the console** (checklist §F): find which admin screen creates a
`/new/…` entry. Two minutes, and it converts a strong inference into a fact.

---

## What we propose to the client

**Not deletion.** 24 pages are put forward as consolidation *candidates* — the
superseded closure notices — and even those wait for Search Console. Proposing to
remove 24 indexed pages without traffic data in front of us is a guess dressed as
advice, and the client has already been asked for that access at Gate A.

The cheap, certain win is different and needs no decision from him:

**96 of the 101 pages have raw HTML tags inside their meta description** (S0-12) —
the text that shows under the title in search results. That is fixable in the
detail template in one place, and it improves every one of them at once.

| Action | Pages |
|---|---:|
| Keep | 76 |
| Consolidation candidate, pending Search Console | 24 |
| Meta description repaired by the template | 96 |

---

## What this changes in the Gate A message

The draft told the client there were **101** articles, that they were **mostly
repeated closure notices**, and that each was **about one sentence**. All three
were wrong, and the message had not gone out. Rewritten to say what is true:
100 articles, mostly catalogue announcements, a real feed worth keeping, with the
duplication limited to old closure notices — and the decision framed as tidying,
not pruning.
