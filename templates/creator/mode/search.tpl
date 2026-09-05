<{* ==========================================================================
     商品検索結果ページ — Creator Mode

     Replaces design_searchpage.txt. That template was never archived - the
     crawl never hit a search URL - so this page had no mock and was rebuilt
     from the source and the tag reference alone.

     It uses the same [SORT*], [PAGER], [TOTAL] family as the category listing,
     which is why the category components cover it. The one difference the
     reference shows is that search offers a sixth sort, メーカー順, which the
     category page does not.
   ========================================================================== *}>

<{* パンくず。先頭に「ホーム」を固定で置いています。276{v}.breadcrumb_list が
     空でも、最低限ホームと現在地が出ている状態を保つためです。商品詳細側で
     パンくずが丸ごと消えた経験を踏まえた作りです。 *}>
<nav class="breadcrumb" aria-label="現在位置">
  <ol>
    <li><a href="<{$url.top}>">ホーム</a></li>
    <{section name=i loop=$search.breadcrumb_list.list}>
      <li>
        <{if $search.breadcrumb_list.list[i].is_current}>
          <span aria-current="page"><{$search.breadcrumb_list.list[i].name}></span>
        <{else}>
          <a href="<{$search.breadcrumb_list.list[i].url}>"><{$search.breadcrumb_list.list[i].name}></a>
        <{/if}>
      </li>
    <{/section}>
  </ol>
</nav>

<h1 class="h-page">
  <{if $search.keyword}>「<{$search.keyword}>」の検索結果<{else}>商品検索<{/if}>
</h1>

<div class="listbar">
  <p class="listbar__count">全 <b><{$search.total_count}></b> 件</p>

  <nav class="listbar__sort" aria-label="並び替え">
    <span>並び替え：</span>
    <a href="<{$search.sort_new_url}>"<{if $search.is_sort_new_selected}> aria-current="true"<{/if}>>新着順</a>
    <a href="<{$search.sort_recommend_url}>"<{if $search.is_sort_recommend_selected}> aria-current="true"<{/if}>>おすすめ順</a>
    <a href="<{$search.sort_low_price_url}>"<{if $search.is_sort_low_price_selected}> aria-current="true"<{/if}>>価格が安い順</a>
    <a href="<{$search.sort_high_price_url}>"<{if $search.is_sort_high_price_selected}> aria-current="true"<{/if}>>価格が高い順</a>
    <a href="<{$search.sort_name_url}>"<{if $search.is_sort_name_selected}> aria-current="true"<{/if}>>商品名順</a>
  </nav>
</div>

<{if $search.total_count == 0}>
  <{* A dead end is where a shop loses the customer, so this one is not.
       The categories below are the shop's own entry points, taken from the
       tiles the product page already carries. *}>
  <div class="notice">
    <p><strong>「<{$search.keyword}>」に一致する商品は見つかりませんでした。</strong></p>
    <p>キーワードを短くする、ひらがなやカタカナを変えてみる、といった方法もお試しください。<br>
       販売単位数量や名入れのご相談は、下記からお気軽にお問い合わせください。</p>
  </div>
  <p class="u-center" style="margin-top:var(--s-6)">
    <a class="btn btn--primary" href="/shop/enq202208200" target="_blank" rel="noopener">見積依頼フォーム</a>
  </p>
  <h2 class="h-section" style="margin-top:var(--s-12)">商品カテゴリーから探す</h2>
  <{$module.category_tiles}>
<{else}>

<ul class="grid">
  <{section name=i loop=$search.item.list}>
  <li class="card">
    <a href="<{$search.item.list[i].url}>">
      <div class="card__media">
        <img src="<{$search.item.list[i].image_M}>" alt="<{$search.item.list[i].name}>" loading="lazy">
      </div>
      <div class="card__body">
        <{if $search.item.list[i].icon.has_item}>
          <span class="card__flags">
            <{section name=j loop=$search.item.list[i].icon.list}>
              <img src="<{$search.item.list[i].icon.list[j].image_url}>" alt="" loading="lazy">
            <{/section}>
          </span>
        <{/if}>
        <span class="card__name"><{$search.item.list[i].name}></span>
        <span class="card__code"><{$search.item.list[i].original_code}></span>
        <span class="card__price"><{$search.item.list[i].price}></span>
        <{if $search.item.list[i].is_soldout}>
          <span class="badge badge--soldout">売切れ</span>
        <{/if}>
      </div>
    </a>
    <{if $search.item.list[i].is_soldout}>
    <{else}>
      <a class="btn btn--cart" href="<{$search.item.list[i].cart_entry_url}>">カートに入れる</a>
    <{/if}>
  </li>
  <{/section}>
</ul>

<div class="pager"><{$search.pager}></div>
<{/if}>
