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
     なるのはそのためで、is_base_category が付いているものが基本カテゴリです。

     🔴 最初はカテゴリ側と同じ $item.breadcrumb_list と書いていました。存在
        しないタグで、プレビューではパンくずが丸ごと消えていました。Smarty は
        黙って捨てるので、エラーは出ません。実機で見なければ気づけない類の
        誤りで、まさにそのために1枚だけ先に貼っていただきました。 *}>
<{if $item.breadcrumb_list_group.has_item}>
<nav class="breadcrumb" aria-label="現在位置">
  <{section name=g loop=$item.breadcrumb_list_group.list}>
    <{if $item.breadcrumb_list_group.list[g].is_base_category}>
      <ol>
        <{section name=i loop=$item.breadcrumb_list_group.list[g].list}>
          <li>
            <a href="<{$item.breadcrumb_list_group.list[g].list[i].url}>"><{$item.breadcrumb_list_group.list[g].list[i].name}></a>
          </li>
        <{/section}>
        <li><span aria-current="page"><{$item.name}></span></li>
      </ol>
    <{/if}>
  <{/section}>
</nav>
<{/if}>

<div class="pd">

  <{* サブ画像ギャラリー — the client asked for swipe on smartphone by name.
       The swipe itself is CSS scroll-snap in components.css, so every image is
       reachable with JavaScript off; js/gallery.js only keeps the thumbnails
       and dots in step. C22. *}>
  <div class="gallery" data-gallery>
    <div class="gallery__track" data-gallery-track>
      <div class="gallery__slide" data-gallery-slide="0">
        <img src="<{$item.image_L}>" alt="<{$item.name}>">
      </div>
      <{section name=m loop=$item.multi_image.list}>
        <div class="gallery__slide" data-gallery-slide="<{$smarty.section.m.index_next}>">
          <img src="<{$item.multi_image.list[m].image_L}>" alt="<{$item.name}>" loading="lazy">
        </div>
      <{/section}>
    </div>

    <{if $item.multi_image.has_item}>
      <div class="gallery__thumbs">
        <button type="button" class="gallery__thumb" data-gallery-thumb="0" aria-label="メイン画像">
          <img src="<{$item.image_L}>" alt="" loading="lazy">
        </button>
        <{section name=t loop=$item.multi_image.list}>
          <button type="button" class="gallery__thumb" data-gallery-thumb="<{$smarty.section.t.index_next}>"
                  aria-label="サブ画像">
            <img src="<{$item.multi_image.list[t].image_L}>" alt="" loading="lazy">
          </button>
        <{/section}>
      </div>
    <{/if}>
  </div>

  <div>
    <h1 class="h-page"><{$item.name}></h1>
    <p class="card__code">商品コード <{$item.system_code}></p>

    <{* 価格。price_html carries the platform own formatting and any member
         price. is_member_price is the flag the pricing rebuild reasoned its way
         to for C23 before the tag reference confirmed it exists. *}>
    <div class="pricebox">
      <div class="pricebox__row">
        <span class="pricebox__label">販売価格</span>
        <span class="pricebox__main"><{$item.price_html}></span>
      </div>
      <{if $item.is_member_price}>
        <p class="pricebox__note">会員価格が適用されています。</p>
      <{/if}>
    </div>

    <{* 在庫。詳細ページのリファレンスに stock_quantity の記載が無いため、
         数量は出さずフラグだけ使います。無いタグを書けば黙って消えるだけで、
         「在庫」という見出しの横が空になります。 *}>
    <{if $item.is_soldout}>
      <p class="card__unit">在庫切れ</p>
    <{/if}>

    <{if $item.has_option}>
      <div class="optmatrix">
        <p class="optmatrix__head">数量・カラーをお選びください</p>
        <{$item.option_html}>
      </div>
    <{/if}>

    <{if $item.is_soldout}>
      <p class="notice notice--warn">申し訳ございません。ただいま品切れです。</p>
    <{else}>
      <ul class="buystack">
        <li><a class="btn btn--cart" href="<{$item.cart_entry_url}>">カートに入れる</a></li>
        <li><a class="btn btn--ghost" href="<{$item.favorite_entry_url}>">お気に入りリストに追加</a></li>
      </ul>
    <{/if}>

    <{* 見積依頼。The client main order channel - more orders start here than
         in the cart. The product travels in the URL so it does not have to be
         retyped; js/quote-prefill.js reads it back if the form page renders
         inside this template. docs/quote-form.md. *}>
    <ul class="cartquote">
      <li>
        <a class="btn btn--primary"
           href="/shop/enq202208200?item=<{$item.name|escape:"url"}>&code=<{$item.system_code}>"
           target="_blank" rel="noopener">見積依頼フォーム</a>
        <small class="buystack__note">数量・名入れの有無によって単価が変わります。</small>
      </li>
    </ul>

    <{* 商品説明。$item.description ひとつだけです。

         🔴 最初は description2〜4 も並べて出していました。プレビューで同じ
            仕様表が2回出て発覚。ベーシックの [ITEMCAPTION_1〜3] を「追加の
            説明文」だと思い込んだのが誤りで、元テンプレートを読み直したら
            そうではありませんでした。

              [ITEMCAPTION_1]  <dd class="itemCount">[ITEMCAPTION_1] X [QUANTITY]
                               → 販売単位。数量欄の一部で、説明文ではない
              [ITEMCAPTION_2]  <div id="Item_detail_caption2">…追加画像説明文2
              [ITEMCAPTION_3]  <div id="Item_detail_caption3">…追加画像説明文3
                               → どちらも「追加画像に付く説明」

            対応先は $item.description2〜4 ではなく
            $item.add_image.list[i].description です。下の追加画像ブロックが
            それにあたります。 *}>
    <div class="article">
      <{$item.description}>
    </div>

    <{* 追加画像とその説明文。[ITEMCAPTION_2] [ITEMCAPTION_3] の対応先。 *}>
    <{if $item.add_image.has_item}>
      <div class="stack">
        <{section name=a loop=$item.add_image.list}>
          <figure>
            <img src="<{$item.add_image.list[a].image_url}>" alt="" loading="lazy">
            <{if $item.add_image.list[a].description}>
              <figcaption class="tilecap"><{$item.add_image.list[a].description}></figcaption>
            <{/if}>
          </figure>
        <{/section}>
      </div>
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
