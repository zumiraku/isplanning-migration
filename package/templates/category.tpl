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

<{* ==========================================================================
     サイト共通ヘッダー — 検索・カート・会員導線・カテゴリメニュー
   ========================================================================== *}>
<div class="utilbar">
  <div class="container utilbar__inner">
    <span>30,000円(税別)以上で送料無料 ※離島除く／代引無料</span>
    <span>2000年8月オープン｜25年間の粗品販売実績</span>
    <nav class="utilbar__links" aria-label="会員メニュー">
      <a href="<{$url.guide}>">ご利用ガイド</a>
      <{if $member.is_logged_in}>
        <a href="<{$url.mypage}>">マイページ</a>
        <a href="<{$url.logout}>">ログアウト</a>
      <{else}>
        <{if $shop.is_member_entry_enabled}><a href="<{$url.member_entry}>">新規会員登録</a><{/if}>
        <a href="<{$url.login}>">ログイン</a>
      <{/if}>
    </nav>
  </div>
</div>

<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-logo" href="<{$url.top}>">
      <{if $shop.logo_url}><img src="<{$shop.logo_url}>" alt="<{$shop.name}>"><{else}><{$shop.name}><{/if}>
    </a>

    <{* 商品検索。$search_form.*_id はフォーム部品のIDを返すので、name属性
         ではなくこの値を使うこと。 *}>
    <form class="searchbox" action="<{$search_form.search_url}>" role="search">
      <label class="visually-hidden" for="<{$search_form.keyword_id}>">商品を検索</label>
      <input type="text" id="<{$search_form.keyword_id}>" placeholder="商品名・キーワードで探す">
      <button type="submit">検索</button>
    </form>

    <div class="site-header__contact"><b><{$shop.tel}></b>平日10時〜12時／13時〜17時</div>
    <div class="site-header__tools">
      <a class="cartlink" href="<{$url.cart}>">カート <b><{$cart.total_quantity}></b>点</a>
    </div>
  </div>

  <{* カテゴリメニュー。ベーシックモードの左サイドバーの中身で、
       スマホでは横に流れます。 *}>
  <{if $category_menu.has_item}>
  <nav class="meganav" aria-label="商品カテゴリー">
    <ul class="meganav__list container">
      <{section name=c loop=$category_menu.list}>
        <li class="meganav__item">
          <a href="<{$category_menu.list[c].url}>"><{$category_menu.list[c].name}></a>
          <{if $category_menu.list[c].child_category.has_item}>
            <div class="meganav__panel">
              <ul class="meganav__cols">
                <{section name=d loop=$category_menu.list[c].child_category.list}>
                  <li><a href="<{$category_menu.list[c].child_category.list[d].url}>"><{$category_menu.list[c].child_category.list[d].name}></a></li>
                <{/section}>
              </ul>
            </div>
          <{/if}>
        </li>
      <{/section}>
    </ul>
  </nav>
  <{/if}>
</header>

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
       [PAGER]         -> $category.pager
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

<nav class="breadcrumb" aria-label="現在位置">
  <ol>
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
    <{include file="category-captions.tpl"}>
  </div>
<{else}>
  <{include file="category-captions.tpl"}>
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

  <{* 並び替え。The live site offers five; Creator Mode has these four plus
       メーカー順, and does not have 単価順. Marking the current one is what
       is_sort_*_selected is for - the Basic Mode template could not do it. *}>
  <nav class="listbar__sort" aria-label="並び替え">
    <span>並び替え：</span>
    <a href="<{$category.sort_new_url}>"<{if $category.is_sort_new_selected}> aria-current="true"<{/if}>>新着順</a>
    <a href="<{$category.sort_recommend_url}>"<{if $category.is_sort_recommend_selected}> aria-current="true"<{/if}>>おすすめ順</a>
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

<div class="pager"><{$category.pager}></div>
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

<{* ==========================================================================
     文書の足 — すべてのページ種別で共通
   ========================================================================== *}>
<footer class="site-footer">
  <div class="container site-footer__cols">
    <div>
      <h2>お買い物について</h2>
      <ul>
        <li><a href="<{$url.guide}>">ご利用ガイド</a></li>
        <li><a href="<{$url.contract}>">特定商取引法に基づく表示</a></li>
        <li><a href="<{$url.policy}>">プライバシーポリシー</a></li>
        <li><a href="<{$url.company}>">会社概要</a></li>
      </ul>
    </div>
    <div>
      <h2>お問い合わせ</h2>
      <ul>
        <li><a href="<{$url.support}>">お問い合わせ</a></li>
        <li><a href="/shop/enq202208200" target="_blank" rel="noopener">見積依頼フォーム</a></li>
        <li><{$shop.tel}></li>
      </ul>
    </div>
    <div>
      <h2>会員の方</h2>
      <ul>
        <{if $member.is_logged_in}>
          <li><a href="<{$url.mypage}>">マイページ</a></li>
          <li><a href="<{$url.favorite}>">お気に入り</a></li>
          <li><a href="<{$url.logout}>">ログアウト</a></li>
        <{else}>
          <li><a href="<{$url.login}>">ログイン</a></li>
          <{if $shop.is_member_entry_enabled}>
            <li><a href="<{$url.member_entry}>">新規会員登録</a></li>
          <{/if}>
        <{/if}>
      </ul>
    </div>
    <{* ベーシックモードの左サイドバーが唯一の入口だったフリーページを、
         ここに移しています。サイドバーを畳んだのは正しい判断でしたが、
         畳んだだけでは6ページが到達不能になっていました。 *}>
    <div>
      <h2>粗品の選び方</h2>
      <ul>
        <li><a href="/html/page9.html">商品別カテゴリー</a></li>
        <li><a href="/html/page8.html">シーンで選ぶ</a></li>
        <li><a href="/html/page5.html">季節で選ぶ粗品</a></li>
        <li><a href="/html/page2.html">名入れ・包装・熨斗のご案内</a></li>
        <li><a href="/html/page4.html">SP SOURCE カタログのご案内</a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__legal">
    <p><{$shop.address}></p>
    <p><{$shop.copyright}></p>
  </div>
</footer>

<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
