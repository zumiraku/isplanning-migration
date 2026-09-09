<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title><{$page.title}></title>
<meta name="description" content="<{$page.description}>">
<link rel="canonical" href="<{$page.canonical_url}>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta property="og:type" content="website">
<meta property="og:title" content="<{$page.title}>">
<meta property="og:description" content="<{$page.description}>">
<meta property="og:site_name" content="<{$shop.name}>">
<meta name="twitter:card" content="Summary with Large Image">
<link rel="shortcut icon" type="image/ico" href="<{$shop.favicon_url}>">
<link rel="stylesheet" href="<{$page.css}>">
<{$makeshop.head}>
</head>

<body>
<{$makeshop.body_top}>

    <div class="wrapper">
        <{$module.header}>

        <main class="main">
            <section class="contents-section">
                <div class="product-container item-inner">
                    <{$module.side_bar}>

                    <div class="product-contents-wrap">

                        <!-- パンくず -->
                        <div class="breadcrumb">
                            <span class="breadcrumb-item"><a href="<{$url.top}>">ホーム</a></span>
                            <span class="breadcrumb-item"><{$page.title}></span>
                        </div>

                        <div class="product-wrap">
                            <div class="list-head category-item-list-head">
                                <p class="list-head-count">全<{$bulk.total_count}>件中<{$bulk.display_count}>件表示</p>
                                <dl class="list-head-sort">
                                    <dt>並べ替え：</dt>
                                    <dd><a href="<{$bulk.sort_low_price_url}>">価格の低い順</a></dd>
                                    <dd><a href="<{$bulk.sort_high_price_url}>">価格の高い順</a></dd>
                                    <dd><a href="<{$bulk.sort_recommend_url}>">おすすめ順</a></dd>
                                    <dd><a href="<{$bulk.sort_new_url}>">新着順</a></dd>
                                </dl>
                            </div>
                            <h2 class="section-title section-title-categoryitems"><{$bulk.name}></h2>
                            <{if $bulk.item.has_item}>
                                <{if $bulk.is_set_discount}>
                                    <div class="bulk-group">
                                        <{if $bulk.is_group1_current}>
                                            <{$bulk.group1_name}>
                                        <{else}>
                                            <a href="<{$bulk.group1_url}>"><{$bulk.group1_name}></a>
                                        <{/if}>
                                        /
                                        <{if $bulk.is_group2_current}>
                                            <{$bulk.group2_name}>
                                        <{else}>
                                            <a href="<{$bulk.group2_url}>"><{$bulk.group2_name}></a>
                                        <{/if}>
                                    </div>
                                <{/if}>
                                <ul class="product-list">
                                <{section name=i loop=$bulk.item.list}>
                                    <li class="product-list-item">
                                        <a href="<{$bulk.item.list[i].url}>" class="product-image-link">
                                            <figure class="product-image-wrap"><img src="<{$bulk.item.list[i].image_L}>" alt="<{$bulk.item.list[i].name|escape:html}>"></figure>
                                        </a>
                                        <a href="<{$bulk.item.list[i].url}>" class="product-name-link">
                                            <div class="product-caption-wrap">
                                                <{if $bulk.item.list[i].icon.has_item}>
                                                    <ul class="item-list-icon">
                                                    <{section name=j loop=$bulk.item.list[i].icon.list}>
                                                        <li><img src="<{$bulk.item.list[i].icon.list[j].image_url}>" alt=""></li>
                                                    <{/section}>
                                                    </ul>
                                                <{/if}>
                                                <{if $bulk.item.list[i].is_soldout}>
                                                    <span class="sold-out">SOLD OUT</span><br>
                                                    <span class="product-caption"><{$bulk.item.list[i].name|escape:html}></span><br>
                                                    <span class="product-price">￥<{$bulk.item.list[i].price|number_format}>（税込）</span>
                                                <{elseif $bulk.item.list[i].is_sale}>
                                                    <span class="product-caption"><{$bulk.item.list[i].name|escape:html}></span><br>
                                                    <span class="product-price product-discount">￥<{$bulk.item.list[i].original_price|number_format}>（税込）</span>
                                                    <span class="product-sale-price">￥<{$bulk.item.list[i].price|number_format}>（税込）<br><{$bulk.item.list[i].sale_rate}>%OFF</span>
                                                <{else}>
                                                    <span class="product-caption"><{$bulk.item.list[i].name|escape:html}></span><br>
                                                    <span class="product-price">￥<{$bulk.item.list[i].price|number_format}>（税込）</span>
                                                <{/if}>
                                            </div>
                                        </a>
                                    </li>
                                <{/section}>
                                </ul>
                                <{if $bulk.pager.has_item}>
                                    <div class="pager">
                                        <ul class="pagination">
                                            <{if !$bulk.pager.is_first_display}>
                                                <li class="pre"><a href="<{$bulk.pager.first_url}>"><span>&#171;</span></a></li>
                                            <{/if}>
                                            <{section name=i loop=$bulk.pager.list}>
                                                <{if $bulk.pager.list[i].is_current_page}>
                                                    <li><a href="<{$bulk.pager.list[i].url}>" class="active"><span><{$bulk.pager.list[i].number}></span></a></li>
                                                <{else}>
                                                    <li><a href="<{$bulk.pager.list[i].url}>"><span><{$bulk.pager.list[i].number}></span></a></li>
                                                <{/if}>
                                            <{/section}>
                                            <{if !$bulk.pager.is_last_display}>
                                                <li class="next"><a href="<{$bulk.pager.last_url}>"><span>&#187;</span></a></li>
                                            <{/if}>
                                        </ul>
                                    </div>
                                <{/if}>
                            <{else}>
                                <p class="empty">商品はありません</p>
                            <{/if}>
                        </div>
                    </div>
                </div>
            </section>
        </main>
        <{$module.banner_area}>
        <{$module.footer}>
    </div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="<{$page.javascript}>"></script>
<{$makeshop.body_bottom}>
</body>
</html>