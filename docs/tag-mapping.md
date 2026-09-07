# The 210 tags, and where each one goes

`design-backup.md` put it plainly: **"This list is the migration."** Every Basic
Mode tag the shop's templates use either has a Creator Mode counterpart or it is
a functional gap — and a gap found by a customer is the failure this project
exists to prevent.

Until 2026-09-04 we were inferring those counterparts from the archive. We did
not need to. **The destination platform publishes a tag reference**, one page per
page type:

```
http://reference.makeshop.jp/taglist/creator-mode/common.html      全ページ共通
                                                 /category.html    商品カテゴリー
                                                 /detail.html      商品詳細
                                                 /search.html      商品検索結果
                                                 /news-list.html   お知らせ一覧
                                                 /news-detail.html お知らせ詳細
                                                 /guide.html       利用案内
                                                 /company.html     会社概要
                                                 /contract.html    特定商取引法
                                                 /modifier.html    修飾子
                                                 /hook.html        フック関数
```

`tools/map-tags-to-creator.sh` → `inventory/tag-mapping.csv`

## Where it stands

| | tags | uses |
|---|---:|---:|
| **判明** — counterpart read off the reference | 23 | **1,154 (47%)** |
| **不要** — dissolves, retired, or already unused here | 12 | 350 (14%) |
| **欠落** — no counterpart exists | **1** | 55 (2%) |
| **要確認** | 174 | 902 (37%) |

**63% of all tag use is settled.** Twenty-three tags carry 47% of it on their
own, because the listing templates use the same handful a hundred times each. Coverage by
*use* is the number that matters; coverage by *count* makes the work look barely
started when the heaviest lifting is done.

## The shape changes, so a one-to-one row is a bookkeeping device

Basic Mode tags are standalone substitutions — `[BRANDNAME]` means "the product
name, here". Creator Mode is a loop with a subject:

```
[BRANDNAME]   →   $item.name                        (商品詳細)
              →   $category.item.list[i].name       (一覧の中)
```

Same tag, two answers, depending on which template it sits in. The CSV records
both and says so; it is not a search-and-replace instruction.

## What is already settled

| Basic | Creator | |
|---|---|---|
| `[SYSTEM_CODE]` | `$item.system_code` | Q13. u-komi binds reviews with it |
| `[BRANDNAME]` | `$item.name` / `$category.item.list[i].name` | |
| `[BRAND_URL]` `[DETAIL]` | `$category.item.list[i].url` | Basic had the URL and the link as separate tags |
| `[WISHLIST]` | `…favorite_entry_url` | |
| `[BASKET]` | `…cart_entry_url` | |
| `[IMAGE_URL]` | `…image_M` | S / M / L available |
| `[ICON]` | `…icon.list[j].image_url` | a loop inside the loop |
| `[TAXPRICE]` | `…price` | 税抜は `price_excluded_tax` |
| `[ZAIKO]` | `…stock_quantity` | 表示可否は `is_stock_display` |
| `[TOTAL]` | `$category.total_count` | |
| `[PAGER]` | `$category.pager` | |
| `[NAMECURRENT]` | `$category.name` | |
| `[SORTRECOMMEND]` | `$category.sort_recommend_url` | |
| `[NEWSORT]` | `$category.sort_new_url` | |
| `[SORTBRANDNAME]` | `$category.sort_name_url` | |
| `[SORTPRICE]` | `sort_high_price_url` / `sort_low_price_url` | **one tag becomes two** |

## The ten that dissolve

`[PRODUCTION_START]`, `[PRODUCTION_ITEM4_START]`, `[PRODUCTION_ITEM_END]`,
`[PRODUCTION_END]`, `[GROUP4_0]`, `[SUISEN4_2]`, `[ADDCLASS]`, `[ADDCODE]` and
their relatives are Basic Mode's **listing-layout system** — open the loop, open
a row of four, inject a class per cell, close. Creator Mode has one loop and the
columns are CSS. There is no counterpart to find, and counting them as unknown
overstated the remaining work by 434 uses.

## The ones that still matter

| uses | tag | why it needs an answer |
|---:|---|---|
| 57 | `[LIST]` | the breadcrumb trail |
| 55 | `[UBRANDCODE]` | |
| 55 | `[SORTPRODUCT]` | **画面では単価順、中身は製造元順.** `$category.sort_manufacturer_url` / `$search.sort_manufacturer_url`。この店舗は製造元フィールドに単価を入れている（下の訂正） |
| 54 | `[SUGU]` | 一発購入. The client has been asked whether it is in use (Gate A) |
| 44 | `[CATEGORY_IMAGE]` | |
| 29 | `[ENDIF_CATEGORY_CODE]` | the per-category conditional the 53 templates are built on |

`[SORTPRODUCT]` はいちばん時間を使った1件です。**「対応先が無い」ではなく
「対応先を見つけられていなかった」でした。** 下の訂正を参照。

---

## ~~The first confirmed loss: 単価順~~ — 誤りでした（訂正 2026-09-07）

**「クリエイターモードに単価順は無い」は間違いです。** 以下は当時書いた内容
ですが、結論が違っていたので消さずに残します。何を根拠にどう間違えたかが
残らないと、同じ間違い方をもう一度します。

`[SORTPRODUCT]` は 単価順 として現行のカテゴリページに出ています:

```html
並び替え：<a href=[NEWSORT]>新着順</a> <a href=[SORTRECOMMEND]>おすすめ順</a>
         <a href=[SORTPRODUCT]>単価順</a> <a href=[SORTPRICE]>価格</a>
         <a href=[SORTBRANDNAME]>商品名</a>
```

クリエイターモードの並び替えはカテゴリ・検索の両方で6種類あります:

```
sort_recommend  sort_new  sort_high_price  sort_low_price  sort_name  sort_manufacturer
```

ここで「この6つに単価順は無い。作る方法も無い」と結論しました。

### なぜ単価順が大事か — この部分は合っていました

粗品店なので、商品は10個・84個・100個といった単位で売られています。**価格は
1セットの値段で、単価は1個の値段です。** 10個入2,680円と100個入9,320円を
比べているお客様が見ているのは 268 と 93 で、価格順に並べると**その人が
気にしている順序の逆**に並びます。この店舗の買い方に一番合った並び替えです。

だからこそ、山口様は無いなら無いで済ませていませんでした。

### 実際に起きていたこと

山口様の説明（2026-09-07）:

> メイクショップの「商品編集」の「詳細情報」の「製造元」を「単価順」に文字を
> 変えています（ロット販売のため合計金額となるため単価順に並べ替えたかったので
> 製造元に商品単価を登録しています　例＠62円　登録100062）

**製造元フィールドに単価が入っています。** @62円 なら 100062。100000 を足して
桁を揃えてあるので、文字列で並べても単価の昇順になります。`[SORTPRODUCT]` は
もともと製造元順で、画面に出る文字だけが「単価順」に書き換えられていました。

対応先は `$category.sort_manufacturer_url` と `$search.sort_manufacturer_url`。
**最初から6つの中にありました。**

### 何を間違えたか

タグ一覧どうしを突き合わせて、名前が対応しないものを「欠落」と判定しました。
**画面に出ている文字と、その裏のタグが一致しているという前提**が入っていて、
そこは確かめていません。商品を1件でも開いて製造元の中身を見ていれば、
`100062` が並んでいるのは見えたはずです。

`欠落` と書いた行は、機能が無いことの証明ではなく、**こちらが対応先を
見つけられなかったことの記録**でした。前者として扱ったのが誤りです。

> タグ棚卸しの意味は変わりません。18個が対応し10個が消えるという集計より、
> **持ち越せないものを1つ見つけるほう**が価値があります。ただし `欠落` の行は
> 「決めれば済む」ではなく「まだ調べ切れていない」として扱うべきでした。

`[LIST]` は同時に確定: `$category.breadcrumb_list.list[i].name` と `.url`、
検索側は `$search.breadcrumb_list`。

---

## 実機プレビューが直したもの — 2026-09-05

テンプレートを1枚だけ先に貼り、プレビューで見たことで、リファレンスを読んだ
だけでは分からなかった誤りが3つ出ました。**どれもエラーを出しません。**

### 1. パンくずのタグ名

```
書いていたもの : $item.breadcrumb_list          存在しない
正しいもの     : $item.breadcrumb_list_group    しかも二重ループ
```

商品は複数のカテゴリに属し得るので、詳細ページのパンくずは「経路の集まり」を
返し、`is_base_category` が基本カテゴリを示します。カテゴリページの
`$category.breadcrumb_list` をそのまま流用したのが誤りで、**それらしすぎて
疑いませんでした**。

### 2. `[ITEMCAPTION_1〜3]` は商品説明ではなかった

`$item.description2〜4` に当てて、同じ仕様表が2回出ました。元テンプレートを
読み直すと、そもそも役割が違います。

```
[ITEMCAPTION_1]  <dd class="itemCount">[ITEMCAPTION_1] X [QUANTITY]
                 → 販売単位。数量欄の一部で、説明文ではない
[ITEMCAPTION_2]  <div id="Item_detail_caption2">…追加画像説明文2
[ITEMCAPTION_3]  <div id="Item_detail_caption3">…追加画像説明文3
                 → 追加画像に付く説明
```

正しい対応先は **`$item.add_image.list[i].description`** です。名前が似ている
ものを、中身を確かめずに結び付けていました。

### 3. `$item.stock_quantity` は詳細ページに無い

一覧側にはあります。詳細側のリファレンスには記載がなく、「在庫」の見出しの
横が空になるだけなので、フラグ（`is_soldout`）だけを使う形に変えました。

---

**この3つは、リファレンスを何度読んでも見つかりません。** 1と3は「無いものを
書いた」ので何も出ず、2は「あるものを間違った意味で書いた」ので二重に出ました。
Smarty は前者を黙って捨て、後者を素直に実行します。

11枚まとめて貼っていたら、同じ誤りを11回直すことになっていました。
