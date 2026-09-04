# The test that should have existed from the start

The README has said this since Stage 0, and the client said it back to us in his
own words:

> 現状のサイトは全ページで、HTMLのタグを意図的に閉じない書き方に依存しています。
> これはベーシックモードが自動で補完してくれる前提の作りで、クリエイターモード
> では補完されません。

That is the migration in one sentence. **Basic Mode repairs markup; Creator Mode
does not.** An unclosed `<div>` is invisible today and swallows the rest of the
page tomorrow.

And there was no test for it on our own output. The converter had a div
balancer, `check-responsive.ps1` proved nothing scrolled sideways, and
`check-content-preserved.sh` proved no text was lost — but nothing asserted that
what we produce is *well-formed*. A page could pass all three and still be one
missing `</div>` from collapsing the moment it stopped being auto-repaired.

`tools/check-tag-balance.sh` → `inventory/tag-balance.csv`

## What it found on the first run

**30 unbalanced elements across 24 files**, and then, once its own blind spot was
fixed, **37 more files** with a defect it had been hiding.

| | |
|---|---|
| `page72` | `</style` with no `>` — an unterminated style tag |
| `page54` | `<ber>` — `<br>` mistyped, an element that does not exist |
| `page23` | `alt"クリスマス"` (no `=`) and a `</a>` closing nothing |
| `page73` `page76` | `<h3>…</h2>` — opened at one level, closed at another |
| `page81` | `<h4>…</h2>` |
| `page80` | `</h4></h4>` |
| `company` | a stray `</pre>` whose opener was outside the content window |
| `ordercontract` | the entire 特定商取引法 table with **no `</table>`** |
| `page9` `page34` | files ending mid-`<a>` |
| **37 pages** | ending `</div` — the closing bracket simply absent |

All of it inherited. Every one was confirmed against
`templates/basic-export/freepages/` before being touched.

## The blind spot, which is the interesting part

The first version of the checker reported page8 as having one unclosed `<div>`,
while `grep` counted 32 open and 32 closed. Both were right, and neither was
useful.

page8 contains `</p` with no `>`. A tag-matching regex reading that consumes
everything up to the *next* `>` — which was the following `</div>`. So the
checker ate a closing tag while measuring closing tags, and reported the
symptom in the wrong element.

**That one file's confusion was the thread that led to the other 37.** An
unterminated end tag is worse than an unclosed one, precisely because it does
not sit still: it consumes its neighbour. And the converter's div balancer could
not see them either — `</div` matches neither `<div\b` nor `</div\s*>`, so it was
invisible to both of its counts.

## Fixed in the pipeline, not in the files

Every correction lives in `tools/convert-freepages.ps1` or in
`inventory/source-defects.tsv`, because **the output is regenerated**. A hand
fix survives until the next `convert-freepages.ps1` and then quietly disappears
— which is exactly what happened to the client's approved 「7日以内」 the first
time the converter was re-run after it was applied. A correction that is not
reproducible is not a correction.

Three additions, in order:

1. **Repair unterminated end tags.** `</div` → `</div>`, before anything counts
   tags, so the balancer sees the truth.
2. **Per-page source defects**, from `inventory/source-defects.tsv` — applied
   *last*, against the final markup. The first attempt ran them before attribute
   processing and every entry silently missed, because by then `<h3 class="…"
   style="…">` no longer looked like `<h3>`.
3. **Close what the window left open**, with a stack.

The third needed two attempts and the failure is worth recording. Appending the
missing closers at the end of the file is not enough: `ordercontract` ends
`<td>…\n</div>`, and that `</div>` implicitly closes the `td`, `tr` and `table`
inside it — so by end of file the stack is empty, nothing is appended, and the
markup is still missing `</td></tr></table>`. The closers have to be inserted
**where the implied close happens**, the way a parser does. Order is the whole
point: `</table></tr></td>` balances by count and is still wrong.

The same repair now runs on the news bodies in `build-news-previews.ps1`. One
article opens a styled `<div>` and never closes it; embedded in the preview
shell, that div swallowed the nav and the footer until `</main>` ended it.

## Where it stands

```
sh tools/check-tag-balance.sh              unbalanced elements : 0
sh tools/check-tag-balance.sh --strict     unbalanced elements : 0
```

86 free pages, the news pages and every mock. The default run excludes
elements whose end tag HTML makes optional - an unclosed `<li>` is legal, and
flagging it would bury the real findings in noise. `--strict` includes them, and
the corpus passes that too: once the converter closes everything explicitly,
the stronger claim is available and worth being able to assert. Run it after any change to the
converter, alongside the responsive and content checks — it is the one that
tests the thing this project was hired to prevent.

> The TSV is data rather than literals in the script for a specific reason:
> PowerShell 5.1 reads a BOM-less UTF-8 script as ANSI, so Japanese in a string
> literal does not survive parsing. The first attempt put the table inline and
> the script would not even parse. Same trap `build-news-previews.ps1` documents.
