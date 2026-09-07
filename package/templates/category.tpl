<{* ==========================================================================
     文書の頭 — すべてのページ種別で共通
     各ページのHTML欄は「完全なHTML文書」です。本文の断片ではありません。

     🔴 $makeshop.head / $makeshop.body_top / $makeshop.body_bottom は必須。
        リファレンスに「必ず記載」と書かれており、これが無いと
        プラットフォームが差し込んでいるものが一切読み込まれません。
        この店舗の場合、具体的には次が消えます。

          - Googleアナリティクス（G-BK1PPN5MEV）
          - u-komi のレビュー読み込みスクリプト
          - かご投入などプラットフォーム側の挙動

        C32 で「GA4はプラットフォーム側から出ているので移行で消えない」と
        書いたのは正しいのですが、それは**このタグを書いていれば**の話です。
        書き忘れれば、壊れようがないと思っていたものが壊れます。
   ========================================================================== *}>
<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><{$page.title}></title>
<meta name="description" content="<{$page.description}>">
<link rel="canonical" href="<{$page.canonical_url}>">
<meta property="og:type" content="website">
<meta property="og:title" content="<{$page.title}>">
<meta property="og:description" content="<{$page.description}>">
<meta property="og:site_name" content="<{$shop.name}>">
<link rel="icon" href="<{$shop.favicon_url}>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Mochiy+Pop+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<{$page.css}>">
<{$makeshop.head}>
</head>
<body>
<{$makeshop.body_top}>
<{$module.header}>
<main class="container">
<{* ==========================================================================
     商品カテゴリーページ — Creator Mode

     Replaces design_brandpage.txt and the 53 per-category templates. C28
     established that 52 of those 53 are this template plus data, so the
     per-category parts are conditionals on $category.code rather than 53
     separate files. ct646 is the exception and keeps its own template.

     Basic Mode tags this replaces, with their counterparts:
       [NAMECURRENT]   -> $category.name
       [CATEGORY_IMAGE]-> $category.image_url
       [LIST]          -> $category.breadcrumb_list
       [GROUP4_0]      -> $category.child_category
       [TOTAL]         -> $category.total_count
       [PAGER]         -> $category.pager.list など（入れ物。値として出さないこと）
       [SORT*]         -> $category.sort_*_url
       [BRANDNAME]     -> $category.item.list[i].name
       [BRAND_URL]     -> $category.item.list[i].url
       [IMAGE_URL]     -> $category.item.list[i].image_M
       [TAXPRICE]      -> $category.item.list[i].price
       [BASKET]        -> $category.item.list[i].cart_entry_url
       [WISHLIST]      -> $category.item.list[i].favorite_entry_url
       [ICON]          -> $category.item.list[i].icon.list[j].image_url
       [ZAIKO]         -> $category.item.list[i].stock_quantity
       [SUISEN4_2]     -> $category.recommend_item

     [SORTPRODUCT] (単価順) has no counterpart and is not reproduced here. See
     docs/tag-mapping.md - that is a decision for the client, not a gap to
     paper over.
   ========================================================================== *}>

<{* パンくず。先頭に「ホーム」を固定で置いています。プラットフォームが返す
     パンくずが空でも、最低限ホームと現在地が出ている状態を保つためです。
     パンくずが丸ごと消えた経験を踏まえた作りです。 *}>
<nav class="breadcrumb" aria-label="現在位置">
  <ol>
    <li><a href="<{$url.top}>">ホーム</a></li>
    <{section name=i loop=$category.breadcrumb_list.list}>
      <li>
        <{if $category.breadcrumb_list.list[i].is_current}>
          <span aria-current="page"><{$category.breadcrumb_list.list[i].name}></span>
        <{else}>
          <a href="<{$category.breadcrumb_list.list[i].url}>"><{$category.breadcrumb_list.list[i].name}></a>
        <{/if}>
      </li>
    <{/section}>
  </ol>
</nav>

<h1 class="h-page"><{$category.name}></h1>

<{* The category image and its caption.

     The caption is the only per-category prose in the Basic Mode templates -
     34 of them, and nowhere else in the export (docs/category-templates.md).
     Generated from inventory/category-data.csv by
     tools/build-category-captions.sh; do not hand-edit the block below.

     11 categories have no image, which is why the whole block is conditional
     on $category.image_url rather than on the caption. *}>
<{if $category.image_url}>
  <div class="catintro">
    <img src="<{$category.image_url}>" alt="<{$category.name}>" loading="lazy">
    <{$module.category_captions}>
  </div>
<{else}>
  <{$module.category_captions}>
<{/if}>

<{* ct646（卓上カレンダー）だけの営業日カレンダー。

     C28 が53本のカテゴリ別テンプレートを畳んだとき、**ct646 だけが例外**
     でした。カテゴリ設定のフリースペースに、営業日カレンダー2か月分が
     手組みで入っています。

     🔴 クリエイターモードには、カテゴリのフリースペースを出すタグが
        ありません。公式リファレンスの754タグに該当がなく、受け皿が
        存在しません。**放置すると、この1カテゴリだけ内容が消えます。**

     モジュールに分けているのは、カレンダーが毎月の更新を要するからです。
     ページテンプレート全体を貼り直さずに、モジュール1件だけ直せます。

     元の表にあった卓上カレンダー商品25枚は持ってきていません。価格を
     直書きした写しなので、価格改定や品切れのたびに実際と食い違います。
     下の商品一覧が $category.item.list で実物を出すので、そちらが正確です。 *}>
<{if $category.code == 'ct646'}>
  <{$module.category_calendar}>
<{/if}>

<{* 子カテゴリ。Basic Mode encoded the column count in the tag name -
     [GROUP4_0] four across, [GROUP3_7] three. Here it is one loop and CSS. *}>
<{if $category.child_category.has_item}>
  <ul class="subcats">
    <{section name=c loop=$category.child_category.list}>
      <li>
        <a href="<{$category.child_category.list[c].url}>"><{$category.child_category.list[c].name}></a>
      </li>
    <{/section}>
  </ul>
<{/if}>

<div class="listbar">
  <p class="listbar__count">全 <b><{$category.total_count}></b> 件</p>

  <{* 並び替え。現行サイトと同じ5つ、同じ並び順です。
       新着順 / おすすめ順 / 単価順 / 価格 / 商品名

       🔴 「単価順」は 製造元順（$category.sort_manufacturer_url）です。

          長いあいだ「Creatorに単価順は無い」と記録していました。**間違い
          でした。** 山口様の説明で分かったことです。

          > メイクショップの「商品編集」の「詳細情報」の「製造元」を「単価順」に
          > 文字を変えています（ロット販売のため合計金額となるため単価順に並べ
          > 替えたかったので製造元に商品単価を登録しています 例＠62円 登録100062）

          つまり **製造元フィールドに単価が入っています**。@62円 なら 100062。
          100000 を足して桁を揃えてあるので、文字列で並べても単価の昇順に
          なります。ベーシックの [SORTPRODUCT] は製造元順で、山口様はラベルの
          文字だけを「単価順」に書き換えて使っていました。こちらも同じことを
          します。

          機能が無かったのではなく、**タグ名と画面の文字が一致していないことに
          気づいていなかった**だけです。商品データを見ずにタグ一覧だけで
          「欠落」と判断したのが誤りでした。

       🔴 選択中の印だけタグ名が違います。

          カテゴリー   $category.sort_manufacturer_selected     ← is_ が無い
          検索         $search.is_sort_manufacturer_selected    ← is_ がある

          他の5つはカテゴリー側も is_ が付きます。製造元だけ付きません。
          公式リファレンスにそう書かれているので、**そのとおりに書きます。**
          直感で is_ を足すと、印が一度も出ないまま気づけません。

       $item.manufacturer は**どのページにも出していません。** 出すと
       「100062」がそのままお客様に見えます。並び替えのキーとしてだけ使います。 *}>
  <nav class="listbar__sort" aria-label="並び替え">
    <span>並び替え：</span>
    <a href="<{$category.sort_new_url}>"<{if $category.is_sort_new_selected}> aria-current="true"<{/if}>>新着順</a>
    <a href="<{$category.sort_recommend_url}>"<{if $category.is_sort_recommend_selected}> aria-current="true"<{/if}>>おすすめ順</a>
    <a href="<{$category.sort_manufacturer_url}>"<{if $category.sort_manufacturer_selected}> aria-current="true"<{/if}>>単価順</a>
    <a href="<{$category.sort_low_price_url}>"<{if $category.is_sort_low_price_selected}> aria-current="true"<{/if}>>価格が安い順</a>
    <a href="<{$category.sort_high_price_url}>"<{if $category.is_sort_high_price_selected}> aria-current="true"<{/if}>>価格が高い順</a>
    <a href="<{$category.sort_name_url}>"<{if $category.is_sort_name_selected}> aria-current="true"<{/if}>>商品名順</a>
  </nav>
</div>

<{if $category.total_count == 0}>
  <p class="notice">このカテゴリーには現在商品がございません。</p>
<{else}>
<ul class="grid">
  <{section name=i loop=$category.item.list}>
  <li class="card">
    <a href="<{$category.item.list[i].url}>">
      <div class="card__media">
        <img src="<{$category.item.list[i].image_M}>" alt="<{$category.item.list[i].name}>" loading="lazy">
      </div>
      <div class="card__body">
        <{* アイコン。A loop inside the loop - [ICON] was one tag. *}>
        <{if $category.item.list[i].icon.has_item}>
          <span class="card__flags">
            <{section name=j loop=$category.item.list[i].icon.list}>
              <img src="<{$category.item.list[i].icon.list[j].image_url}>" alt="" loading="lazy">
            <{/section}>
          </span>
        <{/if}>

        <span class="card__name"><{$category.item.list[i].name}></span>
        <span class="card__code"><{$category.item.list[i].original_code}></span>

        <{* 価格は税込。Three Basic Mode templates showed the pre-tax figure
             under a 税込 label (C36); this template has one price and it is
             the tax-inclusive one, everywhere. *}>
        <span class="card__price"><{$category.item.list[i].price}></span>

        <{if $category.item.list[i].is_soldout}>
          <span class="badge badge--soldout">売切れ</span>
        <{elseif $category.item.list[i].is_small_stock}>
          <span class="badge">残りわずか</span>
        <{/if}>
      </div>
    </a>

    <{if $category.item.list[i].is_soldout}>
    <{else}>
      <a class="btn btn--cart" href="<{$category.item.list[i].cart_entry_url}>">カートに入れる</a>
    <{/if}>
    <a class="btn btn--ghost" href="<{$category.item.list[i].favorite_entry_url}>">お気に入り</a>
  </li>
  <{/section}>
</ul>

<{* ページャー。

     🔴 ここは `<{$category.pager}>` と1行で書いていました。**607件のカテゴリ
        ページに「Array」という文字が出ていました。** 数字の代わりに、その5文字
        だけが。366件・8ページのカテゴリで、2ページ目へ行く手段がありません
        でした。

        $category.pager はタグではなく入れ物です。リファレンスにあるのは
        中身の方だけで、入れ物そのものを値として出すと Smarty が配列を
        文字列にして「Array」と書きます。

        お知らせ一覧は最初から正しく書けていたのに、そこのコメントに
        「$category.pager はHTMLがそのまま返る」と書いてありました。
        確かめずに書いた一文が、そのまま実装になっていました。

        検査: tools/check-against-reference.sh *}>
<{if $category.pager.has_item}>
  <nav class="pager" aria-label="ページ送り">
    <{if $category.pager.is_first}>
    <{else}>
      <a href="<{$category.pager.first_url}>">最初へ</a>
      <a href="<{$category.pager.prev_url}>" rel="prev">前へ</a>
    <{/if}>

    <{section name=p loop=$category.pager.list}>
      <{if $category.pager.list[p].is_current_page}>
        <span aria-current="page"><{$category.pager.list[p].number}></span>
      <{else}>
        <a href="<{$category.pager.list[p].url}>"><{$category.pager.list[p].number}></a>
      <{/if}>
    <{/section}>

    <{if $category.pager.is_last}>
    <{else}>
      <a href="<{$category.pager.next_url}>" rel="next">次へ</a>
      <a href="<{$category.pager.last_url}>">最後へ</a>
    <{/if}>
  </nav>
<{/if}>
<{/if}>

<{* おすすめ商品。[SUISEN4_2] was "four across, two rows"; the shape is CSS now. *}>
<{if $category.recommend_item.has_item}>
  <section style="margin-top:var(--s-12)">
    <h2 class="h-section">おすすめ商品</h2>
    <ul class="rail">
      <{section name=r loop=$category.recommend_item.list}>
        <li class="card">
          <a href="<{$category.recommend_item.list[r].url}>">
            <div class="card__media">
              <img src="<{$category.recommend_item.list[r].image_M}>" alt="<{$category.recommend_item.list[r].name}>" loading="lazy">
            </div>
            <div class="card__body">
              <span class="card__name"><{$category.recommend_item.list[r].name}></span>
              <span class="card__price"><{$category.recommend_item.list[r].price}></span>
            </div>
          </a>
        </li>
      <{/section}>
    </ul>
  </section>
<{/if}>
</main>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
