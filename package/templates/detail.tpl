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
     商品詳細ページ — Creator Mode

     Replaces design_detailpage.txt, including the three-tab block that closes
     it. That block was missing from the rebuild entirely until 2026-09-04 and
     carried the shipping table, 46 category tiles, four recommend slots,
     商品グループ and the whole review widget (docs/product-tabs.md).

     Basic Mode tags this replaces:
       [SYSTEM_CODE]  -> $item.system_code      (u-komi binds reviews with it)
       [BRANDNAME]    -> $item.name
       [TAXPRICE]     -> $item.price_html
       [ZAIKO]        -> $item.stock_quantity
       [OPTION]       -> $item.option_html
       [ITEMIMAGE]    -> $item.image_L / $item.multi_image
       [BRANDGROUP]   -> 商品グループ
       [REVIEW_*]     -> gone. MakeShop retires 商品レビュー end of Nov 2026
                         and this shop has moved to u-komi (C30).
   ========================================================================== *}>

<{* パンくず。商品は複数のカテゴリに属し得るので、Creator Mode の
     $item.breadcrumb_list_group は「経路の集まり」を返します。二重ループに
     なるのはそのためで、is_base_category が基本カテゴリを示します。

     🔴 最初はカテゴリ側と同じ $item.breadcrumb_list と書いていました。存在
        しないタグで、パンくずが丸ごと消えていました。Smarty は黙って捨てる
        ので、実機で見なければ気づけません。

     そのうえで、常に「ホーム」から始めています。プレビューでは商品にカテゴリ
     文脈が無く has_item が偽になり得ますし、基本カテゴリの指定が無い商品も
     あり得ます。そのとき経路ごと消えるより、最低限ホームと商品名が出ている
     ほうが、お客様にとってもクローラにとっても良い状態です。 *}>
<nav class="breadcrumb" aria-label="現在位置">
  <ol>
    <li><a href="<{$url.top}>">ホーム</a></li>
    <{if $item.breadcrumb_list_group.has_item}>
      <{section name=g loop=$item.breadcrumb_list_group.list}>
        <{if $item.breadcrumb_list_group.list[g].is_base_category}>
          <{section name=i loop=$item.breadcrumb_list_group.list[g].list}>
            <li><a href="<{$item.breadcrumb_list_group.list[g].list[i].url}>"><{$item.breadcrumb_list_group.list[g].list[i].name}></a></li>
          <{/section}>
        <{/if}>
      <{/section}>
    <{/if}>
    <li><span aria-current="page"><{$item.name}></span></li>
  </ol>
</nav>

<div class="pd">

  <{* サブ画像ギャラリー — the client asked for swipe on smartphone by name.
       The swipe itself is CSS scroll-snap in components.css, so every image is
       reachable with JavaScript off; js/gallery.js only keeps the thumbnails
       and dots in step. C22.

       🔴 画像は2種類あります。両方入れないと、片方しか使っていない商品で
          ギャラリーが1枚きりになります。2026-09-05 に実際にそうなりました。

            $item.multi_image  拡大画像。image_L / image_S
            $item.add_image    追加画像。image_url と description

          商品 000000022594 は add_image を5枚持っていて multi_image は
          空でした。ギャラリーが multi_image しか見ていなかったので、
          スワイプするものが無く、追加画像は下のブロックに並ぶだけでした。
          クライアントが名指しした2機能の片方が、丸ごと出ていませんでした。

       data-gallery-slide に番号は書きません。スライドは2つのループから
       出てくるので、Smartyでは変数なしに通し番号を続けられません。
       gallery.js がDOM上の位置から数えるので、印だけ付ければ足ります。 *}>
  <div class="gallery" data-gallery>
    <div class="gallery__track" data-gallery-track>
      <div class="gallery__slide" data-gallery-slide>
        <img src="<{$item.image_L}>" alt="<{$item.name}>">
      </div>
      <{section name=m loop=$item.multi_image.list}>
        <div class="gallery__slide" data-gallery-slide>
          <img src="<{$item.multi_image.list[m].image_L}>" alt="<{$item.name}>" loading="lazy">
        </div>
      <{/section}>
      <{section name=a loop=$item.add_image.list}>
        <div class="gallery__slide" data-gallery-slide>
          <img src="<{$item.add_image.list[a].image_url}>" alt="<{$item.name}>" loading="lazy">
        </div>
      <{/section}>
    </div>

    <{* 点。スマホで「横に送れる」ことを伝える唯一の目印です。CSSは最初から
         書いてありましたが、HTMLが無く一度も出ていませんでした。
         768px以上では隠れます。 *}>
    <{if $item.multi_image.has_item or $item.add_image.has_item}>
      <div class="gallery__dots" aria-hidden="true">
        <span data-gallery-dot data-active></span>
        <{section name=dm loop=$item.multi_image.list}><span data-gallery-dot></span><{/section}>
        <{section name=da loop=$item.add_image.list}><span data-gallery-dot></span><{/section}>
      </div>

      <div class="gallery__thumbs">
        <button type="button" class="gallery__thumb" data-gallery-thumb aria-label="メイン画像">
          <img src="<{$item.image_L}>" alt="" loading="lazy">
        </button>
        <{section name=t loop=$item.multi_image.list}>
          <button type="button" class="gallery__thumb" data-gallery-thumb aria-label="拡大画像">
            <img src="<{$item.multi_image.list[t].image_L}>" alt="" loading="lazy">
          </button>
        <{/section}>
        <{section name=u loop=$item.add_image.list}>
          <button type="button" class="gallery__thumb" data-gallery-thumb aria-label="サブ画像">
            <img src="<{$item.add_image.list[u].image_url}>" alt="" loading="lazy">
          </button>
        <{/section}>
      </div>
    <{/if}>
  </div>

  <div>
    <h1 class="h-page"><{$item.name}></h1>
    <{* 品番。

         🔴 ここは「商品コード <{$item.system_code}>」と出していました。二重に
            間違っています。

              1. 現行の商品詳細ページには**商品コードの表示そのものがありません**。
                 こちらが足したものです
              2. 足したうえに、**画面に出す番号と見積フォームに送る番号が
                 違っていました**。実測: 画面は 003001000005、フォームへは NT1201

            お客様が読み上げた番号で商品を引けないことになります。一覧が
            「品番」と呼んでいるもの（original_code）に揃えます。 *}>
    <{if $item.original_code}>
      <p class="card__code">品番 <{$item.original_code}></p>
    <{/if}>

    <{* 価格。price_html carries the platform own formatting and any member
         price. is_member_price is the flag the pricing rebuild reasoned its way
         to for C23 before the tag reference confirmed it exists. *}>
    <{* 代引き手数料。現行では価格のすぐ上に出ています。

         <div class="daibiki-txt">代引き手数料 当社負担で<span>無料！</span></div>

         🔴 落としていました。値段のすぐ横にある販売条件なので、無いと
            条件が変わったように見えます。文言はそのままです。 *}>
    <p class="u-alert" style="margin-bottom:var(--s-3)">代引き手数料は当社負担で<b>無料</b>です。</p>

    <div class="pricebox">
      <div class="pricebox__row">
        <span class="pricebox__label">販売価格</span>
        <{* 🔴 price_html は**カンマまでで、単位は付きません。**

               実測（プレビュー 2026-09-07）:
                 <span data-id="makeshop-item-price:1">55,000</span>

               一覧の .price が 44572 という生の整数だったので、詳細の
               price_html には単位まで入っていると思い込んでいました。
               入っているのは桁区切りだけです。円と（税込）はこちらで書きます。

               data-id="makeshop-item-price:1" はプラットフォームがオプション
               選択時に中身を書き換えるための目印です。**この span の外に
               単位を置くこと。** 中に入れると書き換えで消えます。 *}>
        <span class="pricebox__main"><{$item.price_html}>円<small>（税込）</small></span>
      </div>
      <{if $item.is_member_price}>
        <p class="pricebox__note">会員価格が適用されています。</p>
      <{/if}>
    </div>

    <{* セール枠。現行の [SALESTART]…[SALEEND] に対応します。

         <p class="sale"><b>早割りセール</b></p>[DCDAY]
         <p class="price">通常価格 [ORGPRICE]円（税別）から</p>
         <p class="saleRate"><b>[DCRATE]％OFF</b> 名入れ代・版代・送料等除く</p>

         🔴 丸ごと落としていました。セール中の商品でだけ出る枠なので、
            プレビューでも見えず、タグ一覧を見ても「使っていないタグ」に
            見えていました。**出ない条件のものは、探しに行かないと見つかり
            ません。** 割引率と通常価格が出ないと、値引きしていることが
            お客様に伝わりません。

         「名入れ代・版代・送料等除く」は現行の文言そのままです。割引の
         範囲を限定する但し書きなので、落とすと表示に問題が出ます。 *}>
    <{if $item.is_sale}>
      <div class="saleflag">
        <p class="saleflag__label">セール中</p>
        <p class="saleflag__was">通常価格 <{$item.original_price_excluded_tax}>円（税別）から</p>
        <{if $item.sale_rate}>
          <p class="saleflag__rate"><b><{$item.sale_rate}>％OFF</b> 名入れ代・版代・送料等除く</p>
        <{/if}>
      </div>
    <{/if}>

    <{* 在庫。

         🔴 ここには「詳細ページのリファレンスに stock_quantity の記載が無い」
            と書いてありました。**在ります。** $item.stock_quantity も
            $item.is_stock_display も $item.is_small_stock も、リファレンスの
            detail に載っています。無いと書いて、確かめずに機能を1つ落として
            いました。

         在庫数を出すかどうかは商品ごとの設定（is_stock_display）なので、
         その通りに従います。 *}>
    <{if $item.is_soldout}>
      <p class="card__unit">在庫切れ</p>
    <{elseif $item.is_stock_display and not $item.is_stock_unlimited}>
      <p class="card__unit">在庫 <{$item.stock_quantity}> 点<{if $item.is_small_stock}>（残りわずか）<{/if}></p>
    <{elseif $item.is_small_stock}>
      <p class="card__unit">残りわずか</p>
    <{/if}>

    <{if $item.has_option}>
      <div class="optmatrix">
        <p class="optmatrix__head">数量・カラーをお選びください</p>
        <{$item.option_html}>
      </div>
    <{/if}>

    <{* 名入れオプション。現行の [IFNAMEOPTION][NAMEOPTION] です。

         🔴 これも丸ごと落としていました。**名入れがこの店舗の商売そのもの**
            です（社名は「粗品・景品 発見マーケット」、商品説明の大半が名入れの
            可否と料金）。入力欄が無ければ、名入れ注文をカートから出せません。

         $item.name_print.list[i].html はプラットフォームが入力欄ごと出します。
         こちらは見出しと説明を添えるだけです。文字数の上限（column_max /
         row_max / total_max）は、お客様が入力前に知る必要があるので出します。 *}>
    <{if $item.is_name_print and $item.name_print.has_item}>
      <div class="nameprint">
        <h2 class="h-sub">名入れのご指定</h2>
        <{if $item.name_print.description}>
          <p class="note-kome"><{$item.name_print.description}></p>
        <{/if}>
        <{section name=n loop=$item.name_print.list}>
          <div class="nameprint__row">
            <p class="nameprint__title">
              <{$item.name_print.list[n].title}>
              <{if $item.name_print.list[n].is_required}><span class="nameprint__req">必須</span><{/if}>
            </p>
            <{$item.name_print.list[n].html}>
            <{if $item.name_print.list[n].total_max}>
              <small class="buystack__note">
                <{if $item.name_print.list[n].character_type}><{$item.name_print.list[n].character_type}> / <{/if}>
                最大 <{$item.name_print.list[n].total_max}> 文字
              </small>
            <{/if}>
          </div>
        <{/section}>
      </div>
    <{/if}>

    <{* 数量。

         🔴 **入力欄がありませんでした。** 現行はこう出しています。

              <dt>数量：</dt>
              <dd>[ITEMCAPTION_1] X [QUANTITY] ▲▼</dd>

            ロット販売の店なので「100個入 × 3」のように単位と個数が並びます。
            こちらは「カートに入れる」リンクだけで、数量を選ぶ手段がありません
            でした。**カートより見積依頼のほうが注文が多い理由の一端がこれ**かも
            しれませんが、いずれにせよカゴから注文できない状態です。

         $item.quantity_id はプラットフォームが読む要素IDです。ヘッダーの検索窓
         と同じ仕組みで、name属性ではなくIDで拾われます（実測で確認済み:
         id="makeshop-search-keyword" / data-id-keyword=…）。**IDを変えると
         数量が届きません。**

         order_quantity_min / max は商品ごとの下限・上限です。 *}>
    <{if not $item.is_soldout}>
      <{* 数量欄の注記について

           現行サイトでは、数量欄のすぐ横に「単価＠238円（税別） 100個入り」や
           「※買い物カゴでのご購入はできません※」という囲みが出る商品があります
           （手元の102件では1件）。中身は [ITEMCAPTION_1] です。

           一度ここに add_image.list[0].description を置きましたが、**87%の商品で
           空になる**ことが分かったので外しました。中身は下の description2〜4 に
           まとめて出しています。内容は消えていません。

           🔴 description2 / 3 / 4 のどれが [ITEMCAPTION_1] なのかは未確認です。
              プレビューで1商品見れば分かるので、確認してからここに戻します。
              それまでは「位置は違うが中身はある」状態です。 *}>
      <div class="qtyrow">
    <{* 🔴 id と data-id の両方に入れます。

         プラットフォームは隠しの設定要素で「どのIDを読むか」を宣言します。
         商品詳細では data-id-quantity="makeshop-item-quantity" です。

         問題は**その値を id で探すのか data-id で探すのか**が書かれていない
         ことです。そして**プラットフォーム自身が出すマークアップは data-id を
         使っています。**

           <select data-id="makeshop-item-option1" …>          オプション
           <span  data-id="makeshop-item-price:1">55,000</span> 価格

         こちらは id にだけ入れていました。片方が外れれば数量が届きません。
         **両方に同じ値を入れれば、どちらでも拾われます。** 害はありません。 *}>
        <label class="qtyrow__label" for="<{$item.quantity_id}>">数量</label>
        <input class="qtyfield" type="number" inputmode="numeric"
               id="<{$item.quantity_id}>" data-id="<{$item.quantity_id}>"
               value="<{if $item.order_quantity_min}><{$item.order_quantity_min}><{else}>1<{/if}>"
               <{if $item.order_quantity_min}>min="<{$item.order_quantity_min}>"<{/if}>
               <{if $item.order_quantity_max}>max="<{$item.order_quantity_max}>"<{/if}>>
        <{if $item.order_quantity_min or $item.order_quantity_max}>
          <small class="buystack__note">
            <{if $item.order_quantity_min}>最少 <{$item.order_quantity_min}><{/if}><{if $item.order_quantity_max}> / 最大 <{$item.order_quantity_max}><{/if}>
          </small>
        <{/if}>
      </div>
    <{/if}>

    <{if $item.is_soldout}>
      <p class="notice notice--warn">申し訳ございません。ただいま品切れです。</p>
      <{if $item.is_restock_enabled}>
        <p><a class="btn btn--ghost" href="<{$item.restock_url}>">再入荷のお知らせを受け取る</a></p>
      <{/if}>
    <{else}>
      <ul class="buystack">
        <li><a class="btn btn--cart" href="<{$item.cart_entry_url}>">カートに入れる</a></li>
        <li><a class="btn btn--ghost" href="<{$item.favorite_entry_url}>">お気に入りリストに追加</a></li>
      </ul>
    <{/if}>

    <{* この商品について問い合わせる。現行 [QUESTION_MAIL] で、添えられている
         一文もそのままです。

         🔴 落としていました。見積依頼フォームを入れたので足りていると思って
            いましたが、**別の導線**です。あちらは商品名を打ち直すマルチフォーム、
            こちらは商品が最初から紐づくプラットフォームの問い合わせ画面です。
            「販売単位数量、納期、在庫等」は、まさにこの店舗でよく訊かれること
            として現行に書かれています。 *}>
    <ul class="buystack">
      <li>
        <a class="btn btn--ghost" href="<{$item.contact_url}>">この商品について問い合わせる</a>
        <small class="buystack__note">販売単位数量、納期、在庫等はこちらからお問い合わせください。</small>
      </li>
    </ul>

    <{* 見積依頼。この店舗で最も注文が入る導線です。カートより多いと山口様。

         商品名と品番をURLに乗せ、js/quote-prefill.js がフォーム側で書き戻し
         ます。山口様のご希望は「商品名と品番が入るよう期待しております」。

         🔴 品番は $item.original_code です。$item.system_code ではありません。

            最初は system_code を送っていました。u-komi がレビューを結び付けて
            いるのが system_code なので、そのまま流用したのが誤りです。

              system_code     000000025283   ← 内部の連番
              original_code   MD18-3521      ← お客様が見ている「品番」

            現行サイトの一覧が `品番：[UBRANDCODE]` と出しており、こちらの
            商品カードも card__code に original_code を入れています。**画面で
            品番と呼ばれているものを送らないと、フォームに届いた番号で商品を
            引けません。**

            original_code が空の商品のために system_code へ落とします。空欄で
            届くより、内部コードでも何か届いたほうが引けます。 *}>
    <ul class="cartquote">
      <li>
        <a class="btn btn--primary"
           href="/shop/enq202208200?item=<{$item.name|escape:"url"}>&code=<{if $item.original_code}><{$item.original_code|escape:"url"}><{else}><{$item.system_code}><{/if}>"
           target="_blank" rel="noopener">見積依頼フォーム</a>
        <small class="buystack__note">数量・名入れの有無によって単価が変わります。</small>
      </li>
    </ul>

    <{* 商品説明。$item.description ひとつだけです。

         ベーシックの [ITEMCAPTION_1〜3] は「追加の説明文」ではありません。
         元テンプレートではこう置かれています。

           [ITEMCAPTION_1]  <dd class="itemCount">[ITEMCAPTION_1] X [QUANTITY]
                            → 販売単位。数量欄の一部で、説明文ではない
           [ITEMCAPTION_2]  <div id="Item_detail_caption2">
           [ITEMCAPTION_3]  <div id="Item_detail_caption3">

         🔴 ここから「対応先は add_image.list[i].description だ」と結論して
            description2〜4 を消しました。**逆でした。** 中身が入っているのは
            description2〜4 のほうです。add_image 側は画像を登録していない商品
            では配列そのものが空になり、102件中89件がそれに当たりました。
            経緯は下のブロックのコメントに残してあります。 *}>
    <div class="article">
      <{$item.description}>
    </div>

    <{* 追加の説明文。現行の [ITEMCAPTION_1] [ITEMCAPTION_2] [ITEMCAPTION_3] です。

         🔴 ここは add_image.list[i].description から取っていました。**87%の商品で
            中身が消えます。**

            手元の商品ページ102件を数えた結果:

              仕様表（販売単位・見積依頼・名入れ・熨斗・包装）あり  102件（全部）
              追加画像 0枚                                          89件
              → 表があるのに画像が無い                              89件

            追加画像の説明文は、**画像が登録されていない商品では配列に出てきません。**
            ところが説明文だけは入っています。管理画面で画像を上げずに説明文だけ
            書けるからです。

         以前ここに description2〜4 を並べて「仕様表が2回出た」ので消しました。
         **消す側を間違えていました。** 2回出たのは add_image 側と重複したからで、
         残すべきはこちらです。add_image の画像は上のギャラリーが出しているので、
         下でもう一度出す必要もありません。

         山口様が「追加説明文1 にCSS使用」と教えてくださって気づきました。 *}>
    <{if $item.description2}>
      <div class="article"><{$item.description2}></div>
    <{/if}>
    <{if $item.description3}>
      <div class="article"><{$item.description3}></div>
    <{/if}>
    <{if $item.description4}>
      <div class="article"><{$item.description4}></div>
    <{/if}>
  </div>
</div>

<{* ==========================================================================
     商品ページ下部の3タブ。All three panels ship visible under their own
     heading; js/tabs.js collapses them only once it runs, so nothing is behind
     JavaScript. 13/13 in preview/verify-tabs.html.
   ========================================================================== *}>
<div class="tabs" data-tabs>
  <ul class="tabs__list">
    <li><button type="button" class="tabs__tab" data-tab-for="tab-shipping">送料・類似品</button></li>
    <li><button type="button" class="tabs__tab" data-tab-for="tab-categories">商品カテゴリー一覧</button></li>
    <li><button type="button" class="tabs__tab" data-tab-for="tab-reviews">この商品の<br>レビューを見る</button></li>
  </ul>

  <div class="tabs__panel" id="tab-shipping">
    <h2 class="h-section">送料・類似品</h2>
    <img src="https://gigaplus.makeshop.jp/isplanning/uploads/souryou2022.png"
         alt="送料・代引き手数料表" loading="lazy" style="width:100%;height:auto">
    <p class="notice notice--warn">
      送料は個数、種類に関係なく1回のご注文での料金です。<br>
      離島・北海道・沖縄は別途送料、中継料が必要となります。（カゴでは自動計算されません）
    </p>
    <ul class="stack">
      <li>ご購入前に<a href="/view/news/list">「お知らせページ」</a>をご覧ください</li>
      <li>販売単位数量以外は「買物カゴ（カート）」ではご注文できませんので、メール・ＦＡＸ注文・見積用紙にてお気軽に見積依頼又はご注文してください。</li>
      <li>商品のデザイン・色が若干変更になる場合がありますがご了承願います。</li>
      <li>画像は商品の色・素材感が実物とは異なる場合、商品以外の品が添えられている場合があります。</li>
      <li>納期は余裕を持ってご注文お願いいたします。品切れの際はご容赦願います。</li>
    </ul>

    <{* さぶみっと！レコメンド。The templates live on rcmd.jp under names ending
         -copy, so what these render is not in this repository and cannot be
         tested here. Confirm all four draw on the rehearsal site. C31. *}>
    <h3 class="h-sub">最近チェックした商品</h3>
    <{$module.checked}>
    <h3 class="h-sub">週間ランキング</h3>
    <div data-rcmd="_displayRanking" data-rcmd-template="deco_ranking_scroll3-copy"></div>
    <h3 class="h-sub">ピックアップ</h3>
    <div data-rcmd="_displayPickup" data-rcmd-template="deco_pikup_2018-copy"></div>

    <{* 商品グループ。ベーシックの [BRANDGROUP] の対応先は、モジュール管理に
         既存で入っている「商品グループ表示」です。 *}>
    <h3 class="h-sub">同じグループの商品</h3>
    <{$module.group}>
  </div>

  <div class="tabs__panel" id="tab-categories">
    <h2 class="h-section">商品カテゴリー一覧</h2>
    <{$module.category_tiles}>
  </div>

  <div class="tabs__panel" id="tab-reviews">
    <h2 class="h-section">この商品のレビュー</h2>
    <{* u-komi. The loader is injected by the platform on every page, so it
         survives the mode switch on its own; this mount does not. Getting the
         code wrong is not cosmetic - the loader would still run and bind all
         9,514 products to one id. Q13. *}>
    <div class="review-container"
         data-gname="<{$item.system_code}>" data-pid="<{$item.system_code}>"
         data-group="true" data-action="widget"></div>
  </div>
</div>
</main>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
