# The desktop and smartphone pages disagree with each other

**Do not merge the SP-only lines mechanically.** That was the first plan and it
was wrong. What looked like content missing from the desktop pages is mostly the
same information written twice, differently — and in places the two versions
contradict each other. Pasting one into the other would put both statements on
one page.

At the switch the two templates collapse into one, so someone has to decide which
version is true. That decision belongs to the client: it is about how their
business actually works, not about markup.

---

## How this was established

`tools/compare-sp-content.sh` lists text present in the smartphone document and
absent from the desktop one → `inventory/sp-only-content.csv`, 135 lines across
46 of the 83 pages.

That list is the **input to a review, not a merge queue.** Read at fact level
rather than line level, most entries turn out to be re-wordings:

| The SP document says | The desktop document says | Verdict |
|---|---|---|
| ■「のし」・「包装」は別途1個に付、のし20円(税別)・包装50円(税別) | のし代は1個＠20円税別、包装代は1個＠50円税別 | Same fact, reworded |
| 原稿はAdobe Illustrator CS6以下のデータで | 原稿は Adobe Illustrator CS6 以下のデータで | Same fact, spacing |
| ページ上に記載の名入れ最低数量以下でも… | ページ上に記載の名入れ最低数量以下でも… | Same, split differently across tags |
| ■版の保管：約半年から1年間 | 版の保管…半年 | Same fact |

## The two that are not re-wordings — `page2`

`page2` is 名入れ・包装・熨斗のご案内, the page a customer reads before committing
to a name-printed order. It is the most-affected page (28 lines) and it carries
two genuine conflicts.

### 1. Lead time ※

| | |
|---|---|
| Desktop | 納期は原稿決定後**約14〜22日間**（休業日除く）必要です |
| Smartphone | ■名入れ納期は、商品・数量にもよりますが**通常約2週間前後** |

Two weeks is 14 days. The desktop page allows up to 22. A customer reading the
phone version can expect delivery a week earlier than the desktop version
promises — and most of this shop's traffic is the phone version.

**Ask the client which is correct.** Do not average them, and do not assume the
desktop one wins because that is the one we converted from.

### 2. Where the options are actually chosen 🟡

| | |
|---|---|
| Desktop | 買物カゴ（カート）内の【注文備考】でご希望選択出来ます |
| Smartphone | 名入れ・包装・熨斗は「決済ページ（住所入力、決済方法選択等）」でご希望選択出来ます |

Different steps of the checkout. The SP page mentions the cart's 注文備考 as well,
so it may simply be more current — but one of the two is describing a flow the
shop no longer uses, and the rebuilt page must describe the one that exists.

This one is also worth re-checking **after** cutover: Creator Mode may put the
option fields somewhere else again, in which case both texts are stale.

### Genuinely SP-only, and minor

`1色刷り〜4色刷り：`, `希望刷り色：`, `イラストレータファイル有・無：` — field
labels from the quote guidance, and a note that 熨斗 may be supplied as 熨斗袋 on
items like pens. Worth carrying over; no conflict.

---


## `ordercontract` — the 特定商取引法 page states two different delivery periods ※

This is the legally required disclosure, and the two templates do not agree.

| | 引渡し時期 |
|---|---|
| Desktop | ご注文受付後、**10日以内**にお届けいたします |
| Smartphone | ご注文受付後、**7日以内**にお届けいたします |

A 特定商取引法に基づく表示 is a statement of what the shop commits to. Right now
the commitment a customer sees depends on which device they used, and the phone
version — the one most customers see — promises the shorter period.

**This one is not ours to resolve and not ours to guess.** Put both versions in
front of 山口様 and use the answer verbatim. Whichever is correct, the other has
been wrong on a live page for some time, so it is worth telling him plainly
rather than quietly picking one.

Also on this page, smaller:

| | |
|---|---|
| Desktop | 代引手数料は無料です。（サンプル購入時等一部除く） |
| Smartphone | 代金引換でご購入の際の代引手数料(一部商品以外は無料) |

Same intent, opposite framing. Worth aligning while the page is open, but no
decision needed.

## What to do with the rest

The remaining 45 pages have not had this treatment. The list is in
`inventory/sp-only-content.csv`, ordered by page, with the heaviest first:

| Page | Lines | |
|---|---:|---|
| `page2` | 28 | **done — two conflicts found** |
| `ordercontract` | 9 | **done — delivery period conflict, 7 days vs 10** |
| `page47` | 6 | |
| `page3` | 6 | |
| `page16` | 6 | |

For each: read at fact level, and sort every line into re-wording, SP-only, or
conflict. Only the last group needs the client.


Three decisions need the client, and they are listed in
`docs/client/sp-divergence-questions.md` ready to send.
