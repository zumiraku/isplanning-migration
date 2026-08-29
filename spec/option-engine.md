# 商品詳細 pricing engine — behaviour specification

**Status:** partial. Reverse-engineered from the live page source only.
The authoritative source read happens in the admin console (Stage 0).

**Reference page:**
`https://www.isp-sp.com/shopdetail/000000025283/003/003/X/page1/order/`
(マックス ハンコ 角型 Ω型 ポンポン木製スタンプ / SP34460)

This is the single highest-risk component in the migration. It takes money.
The only acceptable outcome is **identical pricing behaviour on different markup**.

---

## 1. What the page actually is

Not a styled product page — a hand-built quoting tool bolted onto the MakeShop
cart form. The customer picks a colour and a quantity tier from a radio matrix;
JavaScript recalculates the displayed price and marshals the selection into the
hidden field the cart consumes.

## 2. Observed inputs

### 2.1 Option matrix — 21 radios

```html
<input type="radio" name="brand_option" value="1_1" onclick="javascript:updateOptionPrice()">
<input type="radio" name="brand_option" value="2_1" onclick="javascript:updateOptionPrice()">
...
<input type="radio" name="brand_option" value="3_7" onclick="javascript:updateOptionPrice()">
```

`value` is `{col}_{row}`, col ∈ 1..3, row ∈ 1..7 — a 3 × 7 grid.

| Axis | Cardinality | Almost certainly |
|---|---:|---|
| col | 3 | Colour: SP34460**BK** / **GE** / **RD** |
| row | 7 | Quantity tier: 10 / 15 / 20 / 30 / 40 / 50 / 84 個 |

**→ VERIFY IN ADMIN:** which axis is which. If col/row are transposed, every
price in the matrix is wrong in a way that still *looks* plausible.

### 2.2 Quantity

```html
<input type=text name=amount value="1" size=2 maxlength="9">
```
Stepped by `count_change(0)` / `count_change(1)`.

### 2.3 名入れ (name printing)

Stated on the page as: 名入れ可能文字数 252字 · 最低ロット 100個 · 別途 ¥7,500.

**→ VERIFY IN ADMIN:** is the ¥7,500 surcharge applied by this script, by a
MakeShop option, or handled manually after the order? This changes whether the
migration must reproduce it in code at all.

## 3. Observed outputs

```html
<input name="price2" id="M_price2" class="m_price" value="18,295">   <!-- displayed, tax-in -->
<input type='hidden' name='price1' value='16632'>                     <!-- tax-excluded -->
<input type='hidden' name='taxview'>
```

`#M_price2` is comma-formatted (`numberFormat()` is defined on the page).

## 4. The cart contract — must be preserved byte-for-byte

```html
<form name=form1 method=post action="/shop/basket.html">
  amount        <!-- quantity -->
  brandcode     <!-- 000000025283 -->
  ordertype
  opts          <!-- serialised option selection -->
  spcode / spcode2
```

Submitted via `send('','')`.

**`opts` is the contract.** Whatever markup we build, the POST body that reaches
`/shop/basket.html` must be identical to what Basic Mode sends today. Capture real
POST bodies before cutover (DevTools → Copy as cURL) and diff them after.

## 5. The open question that decides the workload

Functions defined on the page:

```
updateOptionPrice()        updateOptionPriceAjax()      send()
count_change()             numberFormat()               openOptionWindow()
```

**Are `updateOptionPrice` / `updateOptionPriceAjax` shop-authored, or MakeShop
platform JavaScript that only exists in the Basic Mode context?**

- **If shop-authored** → we port and harden them. Moderate work.
- **If platform-provided** → they vanish at the switch and the entire pricing
  behaviour must be reimplemented from scratch. Large work, and it must be
  scheduled in week two, not discovered in week nine.

The `Ajax` suffix suggests a call to a platform endpoint. If so, capture:
the endpoint URL, request payload, response shape, and whether that endpoint is
reachable from a Creator Mode page.

Everything else in this file is secondary to answering this.

## 6. Ground-truth capture (do this while Basic Mode is still live)

Build `spec/price-matrix.csv` from the **live Basic Mode site**, before any switch.
This is the oracle the migrated page is tested against — without it we are
comparing a rebuild to an opinion.

| Case | col | row | qty | 名入れ | expected price1 | expected price2 | expected opts |
|---|---|---|---|---|---|---|---|
| 3 colours × 7 tiers | 1–3 | 1–7 | tier qty | off | | | |
| …same with 名入れ | 1–3 | 1–7 | tier qty | on | | | |
| below 名入れ minimum | 1 | 1 | 10 | on | | | |
| no option selected | – | – | 1 | – | | | |
| qty 0 / negative / non-numeric / 99999999 | 1 | 1 | edge | off | | | |
| sold-out variant | ? | ? | 1 | off | | | |
| free-shipping threshold (¥30,000) | 1 | 7 | 84 | off | | | |

42 base cells + edges. Capture programmatically, not by hand.

## 7. Rebuild rules

1. **No dependency on `id`/`name` collisions.** Bind via `data-*` attributes on a
   container; look up children within scope. Creator Mode emits different ids.
2. **No jQuery.** One self-contained module. (The site currently loads three
   jQuery builds — see README.)
3. **Fail loud, not silent.** If the expected inputs are missing, disable the
   add-to-cart button rather than posting an unpriced order.
4. **Same payload, different markup.** The visible behaviour and the POST body are
   the spec; the DOM is not.

## 8. Variant classes — this page is not the only one

There are **9,514 product pages** in the sitemap, on two code schemes
(9,025 × `000000xxxxxx`, 488 × `cccssxxxxxx`). We cannot test them individually.

**→ TODO (Stage 1):** classify product pages into variant classes — plain, colour
options only, quantity-tier matrix, 名入れ, old-scheme — count each, and test one
representative per class. Sample the catalogue to build this; do not assume the
reference page is typical.
