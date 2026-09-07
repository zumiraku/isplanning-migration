<{* ==========================================================================
     商品検索結果ページ — Creator Mode

     Replaces design_searchpage.txt. That template was never archived - the
     crawl never hit a search URL - so this page had no mock and was rebuilt
     from the source and the tag reference alone.

     It uses the same [SORT*], [PAGER], [TOTAL] family as the category listing,
     which is why the category components cover it.

     🔴 かつてここに「検索だけメーカー順という6つ目の並び替えがある」と書いて
        いました。**両方にあります。** リファレンスには
        $category.sort_manufacturer_url も載っています。そして山口様の説明で
        分かったとおり、この店舗ではそれが「単価順」です。詳しくは
        category.tpl の並び替えのコメントに書きました。

        タグ名だけを並べて差分を取ると、こういう読み違いをします。
   ========================================================================== *}>

<{* パンくず。先頭に「ホーム」を固定で置いています。プラットフォームが返す
     パンくずが空でも、最低限ホームと現在地が出ている状態を保つためです。
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

<{* 条件をしぼりこむ。現行の検索ページにある7項目のフォームです。

     🔴 丸ごと落としていました。こちらの検索ページは**結果を並べるだけ**で、
        絞り込む手段がありませんでした。9,535商品に対して、ヘッダーの
        キーワード欄しか入口が無い状態です。

          カテゴリー / 商品名 / 価格(予算合計) / 商品単価 / キーワード / 商品コード

     しくみは実測で確認しました。プラットフォームは設定用の隠し要素を出して
     いて、そこに書かれたIDの要素を自前のJSが読みます。

       <input type="hidden" id="makeshop-page-common-search-data"
         data-id-keyword="makeshop-search-keyword"
         data-id-name="makeshop-search-name"
         data-id-price-low="makeshop-search-price-low"
         data-id-price-high="makeshop-search-price-high"
         data-id-category="makeshop-search-category"
         data-id-original-code="makeshop-search-original-code"
         data-search-url="#makeshop-common-search-url">

     **name属性ではなくIDで拾われます。** $search_form.*_id がそのIDを返すので、
     こちらは id に入れるだけです。action も $search_form.search_url をそのまま
     使います（実体は "#makeshop-common-search-url" という目印で、URLでは
     ありません）。IDを書き換えると、入力が届かなくなります。

     ⚠️ キーワード欄はここに置きません。ヘッダーの検索窓が同じ
        makeshop-search-keyword を使っているので、両方に置くと**同じIDが
        ページに2つ**出ます。JSはどちらか片方しか読まず、しかもどちらを読むかは
        こちらから決められません。ヘッダーの窓と併用できるので、機能は落ちません。

     ⚠️ 「商品単価」は再現できません。[PRODUCT] に対応するIDが
        data-id-* にありません（キーワード・商品名・価格帯・カテゴリー・
        商品コードの5つだけ）。**単価での並び替えは在りますが、単価での絞り込みは
        プラットフォームに用意がありません。** 山口様にお伝えする事項です。

     既定では閉じておきます。スマホで7行のフォームが結果より上に居座ると、
     商品が画面から押し出されます。 *}>
<details class="refine">
  <summary class="refine__toggle">条件をしぼりこむ</summary>
  <form class="refine__form" action="<{$search_form.search_url}>">
    <div class="refine__row">
      <label for="<{$search_form.category_id}>">カテゴリー</label>
      <select id="<{$search_form.category_id}>" data-id="<{$search_form.category_id}>">
        <{* 🔴 「すべて」の選択肢は自前で置きません。

             プレビューで実際に出たのはこうでした。

               <option value="">すべて</option>              ← こちらが書いたもの
               <option value="" selected>すべてのカテゴリー</option>  ← 一覧の1件目

             $search_form.category_list の**先頭に「すべてのカテゴリー」が
             すでに入っています。** 値が空の選択肢が2つ並び、しかも選択中は
             プラットフォーム側のほうでした。一覧に何が入っているかを見ずに
             気を利かせたのが誤りです。 *}>
        <{section name=c loop=$search_form.category_list}>
          <option value="<{$search_form.category_list[c].code}>"<{if $search.category.code == $search_form.category_list[c].code}> selected<{/if}>><{$search_form.category_list[c].name}></option>
        <{/section}>
      </select>
    </div>

    <div class="refine__row">
      <label for="<{$search_form.name_id}>">商品名</label>
      <input type="text" id="<{$search_form.name_id}>" data-id="<{$search_form.name_id}>" value="<{$search.name}>">
    </div>

    <div class="refine__row">
      <label for="<{$search_form.original_code_id}>">商品コード（品番）</label>
      <input type="text" id="<{$search_form.original_code_id}>" data-id="<{$search_form.original_code_id}>" value="<{$search.original_code}>">
    </div>

    <div class="refine__row">
      <span class="refine__legend">価格（予算合計）</span>
      <span class="refine__range">
        <label class="visually-hidden" for="<{$search_form.price_low_id}>">下限</label>
        <input type="number" inputmode="numeric" id="<{$search_form.price_low_id}>" data-id="<{$search_form.price_low_id}>" value="<{$search.price_low}>">
        <span aria-hidden="true">〜</span>
        <label class="visually-hidden" for="<{$search_form.price_high_id}>">上限</label>
        <input type="number" inputmode="numeric" id="<{$search_form.price_high_id}>" data-id="<{$search_form.price_high_id}>" value="<{$search.price_high}>">
        <span>円</span>
      </span>
    </div>

    <p class="note-kome">キーワードでの検索は、画面上部の検索窓をお使いください。</p>

    <button class="btn btn--primary" type="submit">この条件で検索</button>
  </form>
</details>

<div class="listbar">
  <p class="listbar__count">全 <b><{$search.total_count}></b> 件</p>

  <nav class="listbar__sort" aria-label="並び替え">
    <span>並び替え：</span>
    <a href="<{$search.sort_new_url}>"<{if $search.is_sort_new_selected}> aria-current="true"<{/if}>>新着順</a>
    <a href="<{$search.sort_recommend_url}>"<{if $search.is_sort_recommend_selected}> aria-current="true"<{/if}>>おすすめ順</a>
    <a href="<{$search.sort_manufacturer_url}>"<{if $search.is_sort_manufacturer_selected}> aria-current="true"<{/if}>>単価順</a>
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
        <span class="card__price"><{$search.item.list[i].price}>円<small>（税込）</small></span>
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

<{* ページャー。カテゴリ側と同じ理由で書き直しました。`<{$search.pager}>` は
     「Array」と表示されます。詳しくは category.tpl の同じ箇所を参照。 *}>
<{if $search.pager.has_item}>
  <nav class="pager" aria-label="ページ送り">
    <{if $search.pager.is_first}>
    <{else}>
      <a href="<{$search.pager.first_url}>">最初へ</a>
      <a href="<{$search.pager.prev_url}>" rel="prev">前へ</a>
    <{/if}>

    <{section name=p loop=$search.pager.list}>
      <{if $search.pager.list[p].is_current_page}>
        <span aria-current="page"><{$search.pager.list[p].number}></span>
      <{else}>
        <a href="<{$search.pager.list[p].url}>"><{$search.pager.list[p].number}></a>
      <{/if}>
    <{/section}>

    <{if $search.pager.is_last}>
    <{else}>
      <a href="<{$search.pager.next_url}>" rel="next">次へ</a>
      <a href="<{$search.pager.last_url}>">最後へ</a>
    <{/if}>
  </nav>
<{/if}>
<{/if}>
