# 商品詳細 pricing engine — behaviour specification

**Status: VERIFIED** against the live Basic Mode site, 2026-08-29.
Supersedes the earlier hypothesis-based draft.

Reference product: `000000025283` — マックス ハンコ 角型 Ω型 ポンポン木製スタンプ (SP34460)
`https://www.isp-sp.com/shopdetail/000000025283/003/003/X/page1/order/`

---

## 1. Headline finding — Q1 is answered ※

**`updateOptionPrice()` and `updateOptionPriceAjax()` are MakeShop platform
JavaScript, not shop-authored code.**

Evidence:

1. Present on **100 / 100** sampled product pages — including `plain` products that
   have no options at all. Page-level custom code does not behave that way.
2. Contains an `ActiveXObject("Microsoft.XMLHTTP")` fallback — legacy IE support no
   shop owner is writing in 2026.
3. Carries MakeShop's own Japanese source comments (`// 表形式のオプション`,
   `// プルダウン形式のオプション`).
4. POSTs to the platform endpoint `/shop/shopdetail_option.html`.

**Consequence: Stage 4 is the large branch, not the moderate one.** The pricing
behaviour is not ours to port — it is emitted by a Basic Mode feature
(**オプションテーブル形式 / 表形式のオプション**) that Creator Mode **discontinues**.
The client-side behaviour must be rebuilt from scratch.

*Still worth one admin confirmation* (that this code appears in no free-space box),
but the evidence is strong enough to plan against.

## 2. The option model — verified by probing the endpoint

`brand_option` radio values are `{option1_id}_{option2_id}`.

### The general model *(corrected 2026-09-02)*

Two independent axes. **Either may be unused, and a `0` means exactly that** — the
product has no second (or no first) option group. It is not an unmade selection, and
the endpoint prices `n_0` combinations normally.

Measured across all 73 captured combinations:

| | Observed values | Products |
|---|---|---|
| `option1_id` | **1 – 12** | present on all 16 |
| `option2_id` | `0`, or **1 – 7** | non-zero on 2 of 16 |

**47 of 73 combinations are `n_0`** — 14 of the 16 sampled products carry a single
option group. Only `25283` and `1337` use both axes.

Which axis moves the price is **also product-specific**. On `25283` the first axis
is colour and is price-neutral; on `1968`, a single-axis product, the first axis is
the quantity tier and drives the price from ¥5,500 to ¥39,600. Do not assume
axis 1 = colour anywhere in the rebuild.

> **This cost a real defect.** The first rebuild treated a `0` in either position as
> an invalid selection — a rule lifted from the platform's *pulldown* branch (§4),
> which does return early on `"0"`, and wrongly applied to the radio branch. The
> result priced the one 3×7 product we had been staring at perfectly and left the
> cart locked on the other 14. Caught by `templates/creator/preview/verify-pricing.html`
> running the full oracle, and by nothing else. This is what the oracle is for.

### The reference product `25283` specifically

| | Range | Meaning | Affects price? |
|---|---|---|---|
| `option1_id` | 1–3 | **Colour** (SP34460 BK / GE / RD) | **No** |
| `option2_id` | 1–7 | **Quantity tier** | **Yes** |

Proved by four probes: `1_1` and `2_1` return an identical price; `1_7` and `3_7`
return an identical price; `_1` and `_7` differ.

### Quantity tiers — all seven confirmed against the endpoint

Every row below is an endpoint response, cross-checked against the on-page unit
price table. All seven reconcile exactly.

| option2_id | Qty | Unit price | endpoint ex-tax | check |
|---:|---:|---:|---:|---|
| 1 | 10 | ¥338 | ¥3,380 | 10 × 338 OK |
| 2 | 15 | ¥292 | ¥4,380 | 15 × 292 OK |
| 3 | 20 | ¥268 | ¥5,360 | 20 × 268 OK |
| 4 | 30 | ¥245 | ¥7,350 | 30 × 245 OK |
| 5 | 40 | ¥233 | ¥9,320 | 40 × 233 OK |
| 6 | 50 | ¥226 | ¥11,300 | 50 × 226 OK |
| 7 | 84 | ¥198 | ¥16,632 | 84 × 198 OK |

Tier 7 matches the page's rendered default (`price1='16632'`, `price2="18,295"`),
so the page renders pre-selected on the largest tier.

The pricing rule is therefore **total = tier_quantity × tier_unit_price**, with
colour price-neutral. `amount` multiplies on top of this at the cart.

### `uid` is not derivable from the URL ※

`uid` is MakeShop's **internal** product id, and only the `000000xxxxxx` scheme
happens to embed it (`000000025283` → `25283`). The older `cccssxxxxxx` scheme does
not: `003001000005` → uid **37**, `003001000096` → **128**, `003003000674` → **1337**.

Deriving uid from the URL path returns `price: 0` for every old-scheme product —
a silent wrong answer, not an error. The uid must be read from the page's own
`updateOptionPriceAjax(<uid>, …)` call site.

**The rebuild must do the same**, and the Creator Mode template must expose the
internal product id. Confirm that a Creator Mode variable tag for it exists — if it
does not, that is a blocker for the ~1,400 option-priced products.

## 3. The endpoint contract

```
POST /shop/shopdetail_option.html
Content-Type: application/x-www-form-urlencoded

uid=25283&option1_id=1&option2_id=7
```

`uid` is the product id with leading zeros stripped (`000000025283` → `25283`).

Response (HTTP 200, JSON):

```json
{"price":18295,"no_tax_price":"16632","tax":1663,"point":0,"quantity":null,
 "jan_code":null,"is_member_price":false,"member_price":0,
 "member_no_tax_price":0,"member_tax":0,"member_point":0}
```

Note `no_tax_price` is a **string**, the rest numbers. The platform parses this with
`eval()`; our rebuild will use `JSON.parse`.

### How the response is applied

| Response field | Written to |
|---|---|
| `no_tax_price` | `form1.price1` (via `numberFormat()`) |
| `price` | `form1.price2` → displayed as 円（税込） |
| `tax` | `form1.taxview` |
| `point` | `#M_point` innerHTML |
| `price` × 0.01 | `#gmo_point_value` innerHTML |
| `quantity == "0"` | `alert("該当商品のオプションは品切れです…")` and focus `spcode` |

`quantity: null` on this product = no per-option stock management.

## 4. Two option UIs share one code path

```js
if (document.form1.brand_option) {  // 表形式のオプション  → radio matrix
    ...split(value, '_') → option1_id / option2_id
} else {                            // プルダウン形式のオプション → select boxes
    option1_id = form1.spcode.value
    option2_id = form1.spcode2.value
    // returns early if either is "0"
}
```

The rebuild must handle **both**, because both exist across the catalogue.

## 5. The cart contract — preserve byte-for-byte

```html
<form name=form1 method=post action="/shop/basket.html">
  amount · brandcode · ordertype · opts · spcode · spcode2
```

Whatever markup we build, the POST body reaching `/shop/basket.html` must be
identical to what Basic Mode sends today. Capture real POST bodies before cutover
(DevTools → Copy as cURL) and diff after.

## 6. The question that now decides the rebuild

**Does `/shop/shopdetail_option.html` still exist, and behave identically, when the
shop is in Creator Mode?**

- **If yes** → we rebuild only the client side: our own option markup, our own
  fetch to this endpoint, our own DOM updates. Tractable.
- **If no** → the option price/stock data must be baked into the template at render
  time, which is a substantially larger job and needs a data source.

**Test this during the rollback rehearsal** (`docs/admin-extraction-checklist.md` §H)
— switch to Creator Mode, POST the same payload, compare the response, switch back.
It takes two minutes and it sizes the rest of Stage 4.

## 7. Ground-truth capture — do it while Basic Mode is live

`tools/probe-options.ps1` walks the endpoint across every option combination for a
set of products and writes `spec/price-matrix-<label>.csv` — the Basic Mode run is
`spec/price-matrix-basic.csv`. This is the oracle the rebuilt page is tested
against. Without it we are comparing a rebuild to an opinion.

Cover: all 3 × 7 combinations for the reference product, plus every other
`matrix-priced` product in the sample, plus the `select-options` path.

## 8. Rebuild rules

1. **`data-*` contract, not id/name lookups.** Creator Mode emits different markup.
2. **No jQuery.** One self-contained module.
3. **`JSON.parse`, never `eval`.**
4. **Fail loud.** If expected inputs are missing, disable add-to-cart rather than
   posting an unpriced order.
5. **Same payload, different markup.** Visible behaviour and the POST body are the
   spec; the DOM is not.

## 9. Catalogue prevalence (100-product stratified sample)

| Class | Sample | Est. of 9,514 |
|---|---:|---:|
| `plain` — no options | 85% | ~8,100 |
| `matrix-priced` — radio option table | 15% | ~1,400 |

Option-group counts seen on matrix pages: 1 group with 1–8 choices is typical; the
reference product's 3 × 7 is the largest shape found so far. Old-scheme products are
disproportionately matrix-priced (20% vs 12%).

25% of sampled pages contain a 単価 table — so some `plain` products carry a static
price table with no interactive options. Those need no JS, only layout.

> Sample caveat: the `has_naire` column in `inventory/product-variants.csv` is
> **unreliable** — 名入れ appears in global header copy on every page, so it returned
> 100/100. Ignore that column; it does not indicate a name-printing option.

---

## 10. Verifying the rebuild against the oracle

`templates/creator/preview/verify-pricing.html` runs the production
`templates/creator/js/option-price.js` — unmodified, the same file the shop will
load — against all 73 captured responses plus behavioural cases. Open it in a
browser; it needs no server and makes **no network requests at all**. The recorded
responses are replayed by a stub routed on the POST body, so the request the engine
builds is under test too.

Regenerate the fixture after any re-probe:

```powershell
.\tools\build-price-oracle.ps1     # spec\price-matrix-basic.csv -> preview\price-oracle.js
```

Headless, for a pass/fail without opening a window:

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu `
  --virtual-time-budget=6000 --dump-dom `
  "file:///C:/Users/Administrator/Documents/isp-sp/isplanning-migration/templates/creator/preview/verify-pricing.html"
```

`--virtual-time-budget` matters: the assertions run after the stubbed responses
settle, which is past the load event.

### What it covers — 103 checks, all passing as of 2026-09-02

| Group | Checks | Source of truth |
|---|---:|---|
| A. All measured combinations, remote path | 73 | Oracle — **measured** |
| B. Inline price-table path (used by the mocks) | 21 | Oracle — **measured** |
| C. Failure behaviour: cart must lock, never show a plausible wrong price | 6 | Synthetic |
| D. Member / discount pricing | 1 | **Synthetic — unverified** |
| E. Endpoint contract (path, method, parameters) | 1 | Basic Mode capture |
| F. Rapid re-selection: a slow earlier response must not overwrite a newer price | 1 | Synthetic |

### Two things it deliberately does not prove

1. **Member and discount pricing (C23).** Every one of the 73 probes was anonymous,
   so all returned `is_member_price:false`. The engine now renders `member_price`
   when the flag is true, and fails loud when the flag is true but the amount is 0 —
   but that branch is reasoned from field names, not observed. **Confirm against
   /shopdetail/003003000870/ while logged in as a member before cutover**, then
   re-probe and promote group D to measured.
2. **That the endpoint still exists under Creator Mode** (Q1b, §6). The harness
   replays Basic Mode responses; it cannot tell us the endpoint survives the switch.
   That is the rollback rehearsal's job.
