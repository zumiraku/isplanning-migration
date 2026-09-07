# 見積依頼フォーム — carrying the product into it

**2026-09-04, at the client's request.** In his own words:

> 見積依頼フォームはメイクショップの「マルチフォーム」を使っているだけなので
> 細かな設定は出来ません、自動で品名や品番が入力できれば良いんですが無理なようで。
> もし、簡単にできるようでしたら大山様にお願いしたいのですが。（無理でしたら無視してください）

Two things in the same reply make this worth more than it looks:

> これは頻度は高いです。… 買い物かごでの注文より、見積もりから や FAX注文
> メール問い合わせ、電話からの注文が多いです。

**The quote form, not the cart, is where most of this shop's orders start.**
A migration that rebuilds the cart perfectly and leaves the quote route as it is
has improved the wrong thing.

## What the live site does today

The same bare URL on the product page and on four free pages (page1, page2,
page21, page75), opened in a 600×600 popup:

```html
<a href="https://www.isp-sp.com/shop/enq202208200"
   onclick="window.open(this.href, '', 'resizable=yes,status=no,…')">
```

Nothing identifies the product. A customer looking at a specific item clicks
through and retypes what they were just reading — and the shop receives a quote
request that may or may not name the product correctly.

## What MakeShop offers: nothing

Checked the マルチフォーム manual (both the old and new console versions), the
support site and a search across all four MakeShop documentation domains.
**There is no documented way to seed a マルチフォーム field** — no URL parameter,
no hidden item, no product-page binding. The form is a form; you link to it.

The 商品見積書 feature that would do this properly is a paid option the client
has already declined (C2).

The one native route that *does* carry the product is
「この商品について問い合わせる」, which POSTs `brandcode` to `/ssl/contact/` and
auto-fills the product name — but the client says its fields cannot be changed,
which is precisely why he uses the マルチフォーム instead.

## What we can do instead

We control the product template in Creator Mode, so the product travels in the
link, and a script writes it back into the form:

```
/shop/enq202208200?item=$item.name&code=$item.system_code
```

`js/quote-prefill.js` reads those back and fills the matching fields.

**Two things are unverified, and both fail safe:**

1. **Whether the マルチフォーム page renders inside the Creator Mode template.**
   If it does, the script loads there and works. If it does not, the form simply
   ignores two unknown query parameters and behaves exactly as it does today.
2. **What the fields are called.** The form page is not in our archive and the
   live shop is not to be crawled, so the script does not guess a field name —
   it reads **the label a customer reads** (「商品名」「品番」…), the way a person
   filling the form would.

Neither failure can make anything worse than the current behaviour. That was the
design constraint, because the alternative is worse than doing nothing: a quote
request arriving with an empty product line is a nuisance, but one arriving with
the *wrong* product in it is a real problem for a shop whose main order channel
this is.

So the script never overwrites a field the customer has typed in, never fills a
field twice, and falls back to writing the product into the free-text box rather
than dropping it silently.

### The bug the verification caught

The first version searched the whole document for a field labelled 商品.
**A MakeShop page has a keyword search box in the header, and its label reads
商品検索** — so on a real page it would have typed the product name into the
search box. Now the form is chosen first: search forms are excluded by `action`
and `role`, a form with a single text field is treated as a search box, and the
quote form is the one with the most free-text fields.

`preview/verify-quote-prefill.html` — **6/6**, including a header search box
sitting on the page specifically to prove it is left alone.

## What to test on the real form, in a browser

Not automated, and not a crawl — open it by hand:

1. Open `https://www.isp-sp.com/shop/enq202208200?item=テスト商品&code=000000025283`
2. Look at whether the 商品名 field is filled.
   - **Filled** → the form page carries our template. Done.
   - **Empty** → the form page is outside our template. Then the honest answer to
     the client is that MakeShop does not permit this, and the fallback is to put
     the product name in the link text so at least the customer can see and copy
     it.
3. Either way, send one real quote request through and confirm what arrives.

Until step 2 is done, this is built and safe but **not promised to the client**.

---

## 山口様の回答 — 2026-09-07

> 見積フォームですが、デザインは拘りはないので切り替えてから確認
> いたします。商品名と品番が入るよう期待しております。

### 送っていた「品番」が品番ではありませんでした

リンクはこうなっていました。

```
/shop/enq202208200?item=$item.name&code=$item.system_code
```

**`system_code` は品番ではありません。**

```
system_code     000000025283   内部の連番
original_code   MD18-3521      お客様が見ている「品番」
```

u-komi がレビューを結び付けるのに `system_code` を使っているので、そのまま
流用していました。用途が違います。**見積依頼が届いても、その番号で商品を
引けなければ意味がありません。** 現行サイトの一覧も `品番：[UBRANDCODE]` と
出しており、こちらの商品カードも `card__code` に `original_code` を入れて
います。画面で品番と呼ばれているものを送ります。

```
code=<{if $item.original_code}><{$item.original_code|escape:"url"}><{else}><{$item.system_code}><{/if}>
```

`original_code` が空の商品だけ `system_code` に落とします。空欄で届くより、
内部コードでも何か届いたほうが引けます。

### 品番が黙って消える経路がありました

マルチフォームは店舗が項目を自由に作れるので、**「商品名・品番」で1つの欄**に
なっていることがあります。そのとき何が起きていたか:

1. `item` が先に走り、その欄に商品名が入る
2. `code` が走る。`findField` は**値の入っている欄を飛ばす**ので、見つからない
3. 予備の自由記入欄への書き出しは「**両方**失敗したとき」だけ動く条件だった
4. `filledItem` が真なので動かない。**品番はどこにも行かず消える**

山口様が名指しされた「商品名と品番」の、まさに品番のほうが落ちる経路です。
いまは項目ごとに独立して判定し、入らなかったものだけ自由記入欄へ回します。

```
商品名：マックス ハンコ 角型
品番：MD18-3521
```

書き出しは**先頭に足す**だけで、お客様が書いた文章は消しません。

### 同じフォームで二度動かないようにしました

`DOMContentLoaded` がもう一度飛ぶ場面（プラットフォーム側のスクリプト、
bfcache からの復帰）で `init` が再実行されます。名前付きの欄は値があるので
守られますが、**その「守られた」状態が「入れられなかった」と判定される**ので、
自由記入欄への書き出しがもう一度走ります。お客様から見ると要望欄が勝手に
増えていきます。フォーム要素に印を付けて1回だけにしました。

### 検証は 6項目 → 13項目

`preview/verify-quote-prefill.html`。フォームの作りを3通り並べています。

| | |
|---|---|
| 表組み・ラベルが隣のセル | 商品名と品番がそれぞれの欄に入る |
| 商品名が入力済み | 上書きせず、品番だけ入れて、商品名は自由記入欄へ |
| 該当する欄が無い | 両方を自由記入欄へ。関係ない欄には触らない |

ヘッダーの「商品検索」欄を置いたままにしてあるのは、そこに商品名を打ち込む
不具合を一度出したからです。`tools/check-browser.sh` がヘッドレスChromeで
毎回走らせます（**手作業と書いた検証は走らなくなります**）。

### まだ確かめられていないこと

**マルチフォームのページがこちらのテンプレートで描画されるかどうか。**
描画されればスクリプトが読み込まれて動きます。されなければ、フォームは
知らないクエリを2つ無視するだけで、いまと同じ動きになります。山口様が
「切り替えてから確認」とおっしゃっているとおり、切替後に実物で見ます。
