# The product page's closing tab block — and what it was hiding

**Found 2026-09-03**, while tracing where GA4 comes from. The rebuilt product
page stopped after 商品仕様 and a recommend rail. The Basic Mode template does
not: `design_detailpage.txt` lines 93–289 — **the last two thirds of the file** —
are a three-tab block that the rebuild had no equivalent of at all.

| tab | label | what is in it |
|---|---|---|
| 1 | 送料・類似品 | 送料・代引き手数料表 (an image), the per-order shipping note, a link to the payment guide, five pre-purchase cautions, **four さぶみっと！レコメンド slots**, and `[BRANDGROUP]` |
| 2 | 商品カテゴリー一覧 | **46 category tiles** — image + caption, linking to `/shopbrand/...` |
| 3 | この商品のレビューを見る | the **u-komi** review widget |

Nobody had counted this because the rebuild was driven from the rendered page,
where the two closed tabs are in the DOM but invisible. It took reading the
source to see that a page we had called finished was missing its shipping
table, its category navigation and its entire review system.

## The review system is not MakeShop's

The three native review tags are in the template — and all three are inside an
HTML comment:

```html
<!--<div class="Review">
      <h4>この商品のレビュー</h4>
      [REVIEW_WRITE]
      <a href=[REVIEW_BUTTON]>［レビューを書きこむ］</a>
    </div>
    <div class="M_section">[REVIEW_VIEW_ALL]</div>
</div>-->

<div class="review-container" data-gname="[SYSTEM_CODE]" data-pid="[SYSTEM_CODE]"
     data-group="true" data-action="widget"></div>
```

**This change is days old.** Every one of the 40 archived product pages - crawled
2026-08-29 - renders MakeShop's native review block, uncommented, and carries no
u-komi mount at all. The design source obtained 2026-09-03 has it exactly the
other way round. The two are otherwise the same template: same three tab labels,
same 46 tiles, same four rcmd slots. **Only the review block differs, and it is
inverted.** So the live 商品詳細 template was edited between 2026-08-29 and
2026-09-03, and not by us. Who did it, and whether it was deliberate, is a
question for the client - see docs/client/report-2026-09-07.md.

One consequence is already live, independent of the migration: the block that
displayed existing customer reviews is now commented out, so whatever reviews
those products had accumulated stopped being shown at that moment.

Either way, u-komi is what the current design uses, and it splits across the mode
boundary in an awkward way:

- **The loader survives.** `api.u-komi.com/…/widget.js` is injected by the
  platform, not by the design — it appears *above* the first line of
  共通head管理 in every archived page (see [analytics-tags.md](analytics-tags.md)).
  It will keep loading after the switch whatever we do.
- **The mount does not.** The `div` above is design markup, so it dies with the
  Basic Mode template unless we carry it across — and its two data attributes
  are `[SYSTEM_CODE]`, a Basic Mode tag.

🔴 **Q13: what is the Creator Mode product-code tag?** Ship the mount with the
placeholder unresolved and `data-pid` becomes a literal string that is the same
on all 9,514 products — so either every product shows one product's reviews, or
none of them show any. A loader that still runs makes this worse, not better:
the widget will be present and confidently wrong rather than absent.

## Four recommend slots, and their templates are not ours

Tab 1 declares all four:

```js
_displayHistory({ template: 'deco_history_scroll2-copy' });
_displayRecommend({ type: 'pv', template: 'deco_recommend_scroll1-copy' });
_displayRanking({ type: 'pv', span: 'week', template: 'deco_ranking_scroll3-copy' });
_displayPickup({ label: 'pickup-1', template: 'deco_pikup_2018-copy' });
```

Every template name ends `-copy`: these are **customised copies stored on
rcmd.jp**, not in the design and not in this repository. We can carry the
declarations across verbatim, and the rebuild does, but we cannot see or test
what they render. Confirm on the rehearsal site that all four still draw.

Note they are all `scroll*` templates — the recommend blocks were already
horizontal scrollers. That is worth knowing next to the client's request for
horizontal scrolling on smartphone: it is the pattern this shop already uses.

## How it was rebuilt

`js/tabs.js`, `.tabs` in `components.css`, verified by
`preview/verify-tabs.html` — **13 of 13 automated checks pass**.

The original is the CSS-only radio-and-label pattern: three
`<input type="radio" name="tab">` and three `<label for=…>`. It works, but a
screen reader hears three radio buttons named "tab", and the content is
reachable only by understanding that the radios control it.

The rebuild inverts it. **All three panels ship visible, each under its own
`<h2>`**; `tabs.js` then hides two and adds `role="tablist"`/`tab`/`tabpanel`
and the arrow-key handling. With JavaScript off the page is three stacked
sections and nothing is unreachable — the same rule `gallery.js` follows. The
`data-enhanced` attribute the stylesheet keys the panel headings off is set
*before* the first selection, or the headings flash visible on load.

On a phone the tab strip scrolls horizontally with scroll-snap instead of
wrapping to three lines; tabs are 45px tall, over the 44px minimum.

### Two deliberate departures, so they are not mistaken for oversights

1. **The `_displayRecommend` rail stays outside the tabs.** The client asked for
   the recommend rail to scroll horizontally on smartphone, by name, having
   tried and failed to build it himself. A feature requested by name should not
   open behind a tab. The other three rcmd slots and `[BRANDGROUP]` are inside
   tab 1, so every block still appears exactly once.
2. **The native review tags stay commented out**, exactly as the source has
   them. Reviving them would silently introduce a second review system beside
   u-komi.

### One component moved

`.tilegrid` / `.tilecap` moved from `freepage.css` to `components.css`. Tab 2's
46 tiles are the same component as the free pages' — and only `components.css`
is loaded by both page families. Free pages load all three stylesheets, so
nothing there changes.

> `.tilecap` was `.textboxisp`. Mapping that class by name to `.notice` once
> drew a bordered box around every thumbnail and squeezed the captions to one
> character per line. It is a caption strip, not a notice box.

## The shop is running two review systems at once 🔴

The three per-category product templates were checked against the main one, and
they do not agree:

| template | applies to | reviews | tab labels |
|---|---|---|---|
| `design_detailpage.txt` | every other product | **u-komi** (native tags commented out) | 送料・類似品 / 商品カテゴリー一覧 / この商品のレビューを見る |
| `design_detailpage_ct261.txt` | ct261 | **MakeShop native**, live | same three |
| `design_detailpage_ct664.txt` | ct664 | **MakeShop native**, live | same three |
| `design_detailpage_ct646.txt` | ct646 | **MakeShop native**, live | 送料について / その他おすすめ商品 / **この商品の類似品** |

So a product's review system depends on which category it is in. Products in
ct261, ct646 and ct664 write reviews into MakeShop's own store; every other
product writes into u-komi; **neither shows the other's.**

The three per-category templates were simply not touched by the edit that changed
the main one between 2026-08-29 and 2026-09-03. They still hold what the whole
shop held a week ago. So this split is days old, not years - which makes it more
likely, not less, that nobody has looked at it yet.

Two things follow, and the second is a data question rather than a layout one:

1. **The migration has to pick one.** Carrying the split across means rebuilding
   an inconsistency deliberately. Unifying on u-komi is the obvious call — it is
   what 99% of the catalogue already uses — but it is the client's to make.
2. **Ask whether those three categories have accumulated native reviews.** If
   they have, switching them to u-komi orphans that content: it stays in
   MakeShop's store and stops being displayed. That is customer-written content
   disappearing at cutover, so it needs checking before, not after.

`ct646` also proves the per-category templates drifted in more than the banner
block that C28 assumed — its tabs are differently labelled and its third tab is
類似品, not reviews at all. That is one more reason the 53 + 3 need reading
individually rather than being collapsed on the assumption they are the standard
template plus a banner.

### Which categories those three are

The `ctNNN` codes are MakeShop's internal category codes, and the smartphone
site uses the same ones — so the desktop pages' own `rel="alternate"` names
them:

| code | category | note |
|---|---|---|
| ct261 | タオル類 | `/shopbrand/023/Y/` |
| ct646 | 卓上カレンダー | `/shopbrand/051/O/` — the same category the client flagged as unusual (C25) |
| ct664 | 資材 | `/shopbrand/ct664/` |

Worth naming rather than leaving as codes: these are categories the client can
look at and check for review activity himself, which is what settles whether
unifying on u-komi loses anything.

---

## Removing the retired review feature (client instruction, 2026-09-04)

> 旧タグはPC・スマホ共、コメントアウトにしましたが、11月に終了ですでに移行して
> いるのでついでに消して頂ければと思います。

`tools/strip-old-review-tags.sh` → `templates/basic-export/design-cleaned/`

The archive is never edited: `templates/basic-export/design/` stays
byte-identical as the "before" record, and cleaned copies go to a parallel
directory so the two can be diffed before anything is pasted into the console.

| template | live tags | commented | after |
|---|---:|---:|---:|
| `design_detailpage.txt` | 0 | 3 | 0 |
| `design_detailpage_ct261.txt` | **3** | 0 | 0 |
| `design_detailpage_ct646.txt` | **3** | 0 | 0 |
| `design_detailpage_ct664.txt` | **3** | 0 | 0 |

The diff is eleven lines per file, and it is the review block and nothing else.

### 🔴 The part worth telling the client

He said he commented the tags out **PC・スマホ共** — and for the main product
template he did. **The three per-category product templates still had the tags
live** in the 2026-09-03 export: not commented, three uncommented tags each.

He may well have done those on 9/4 along with everything else, after our export
was taken; we cannot see the current state without a fresh one. But if they were
missed, then products in ct261, ct646 and ct664 are still showing a review
feature that stops working at the end of November — and they are the same three
templates that C28 already flags as having drifted from the standard one.

**This is not something to fix quietly.** Which templates were missed is more
useful to him than the edit itself, because he is the one who can check.

## 実表示で確認 — 2026-09-05

`https://www.isp-sp.com/view/item/003001000005?ptk=…`（プレビュー）

| | |
|---|---|
| タブ切り替え | 押したパネルだけが出る。選択中のタブに緑の下線 |
| 送料・類似品 | 送料表・注意書き・最近チェックした商品・同じグループの商品 |
| 商品カテゴリー一覧 | **タイルが画像付きで並ぶ**（`$module.category_tiles` 生存） |
| この商品のレビューを見る | レビュー枠・「レビューを書く」ボタン・「レビュー投稿がありません。」 |

レビュー枠が出ているということは、`$makeshop.body_bottom` が効いていて
プラットフォーム側のレビュー読み込みが走っています。C32 で「GA4は消えない」と
書いた前提（必須タグを書いていること）も、あわせて成立しています。

**ただしこれは JavaScript の実行順を直した後の状態です。** それ以前は3枚とも
縦に並んだままでした（docs/console-map.md）。

## レビューの統一 — 山口様のご指示、2026-09-07

> なぜでしょう？移行のボタンを押すだけでよかったと思いますが
> 確かにタオル類・卓上カレンダー・資材は旧レビューのままですね・・。
> お手数ですがu-komiに統一お願いいたします。

### なぜ3カテゴリだけ残ったか

C30 のとおり、9/4 の朝に移行ボタンは押されています。押して変わるのは
**商品詳細の標準テンプレート**で、この店舗には**カテゴリ別の商品詳細
テンプレートが3本**あります。

```
design_detailpage_ct261   タオル類
design_detailpage_ct646   卓上カレンダー
design_detailpage_ct664   資材
```

この3本は標準テンプレートではないので、ボタンの対象外でした。押し忘れでは
ありません。**押しても届かない場所があった**という話です。

### 直し方 — 直すというより無くなります

クリエイターモードの商品詳細テンプレートは**1本**です。カテゴリ別という
仕組みそのものが無くなるので、切り替えた時点で9,534商品すべてが `detail.tpl`
の u-komi マウントを出します。C36（税抜表示）とまったく同じ構造で、同じ
直り方をします。

過去の投稿は移行ボタンで u-komi 側に引き継がれています（C30。この店舗は
2〜3件）。

### 再発する経路があります

**メイクショップ純正のレビュータグは、クリエイターモードにも全種類あります。**

```
$item.review.star_html / .total_count / .list_url / .post_url / .list[i].content …
$category.item.list[i].has_review / .review.star_html / .review.average …
$search.item.list[i].has_review …
$review_item.list[i]…            （共通・レビュー一覧ページ用）
```

一覧に☆を出したくなって `$category.item.list[i].review.star_html` を1つ足せば、
u-komi と純正の両方が画面に出ます。片方は空、片方は中身あり、という並びに
なります。**足した本人には、それが分裂の再発だとは見えません。**

`tools/check-review-unified.sh` で機械的に止めました。見ているのは3つです。

1. 純正レビュータグがテンプレートに1つも無いこと
2. u-komi のマウントが商品詳細にちょうど1つ、`data-gname` / `data-pid` が
   `$item.system_code` であること（定数のままだと9,534商品が同じidに結び付く）
3. マウントがカテゴリで出し分けられていないこと ── 出し分けたらそれが分裂そのもの

### 作り直していないページ種別が2つあります

デザインセットのページ種別のうち **商品レビュー一覧** と **商品レビュー投稿**
は Basics 標準のHTMLのままです（console-map.md）。こちらのテンプレートからは
1本もリンクしていないので、通常の導線では到達しません。Basics標準のCSS
2,326行とJS 67行はこちらのブロックの下に残してあるので、素の見た目にも
なりません。メイクショップ自身が旧レビューを2026年11月末に廃止します。
