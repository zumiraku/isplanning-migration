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
</main>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
