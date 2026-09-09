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
                <div class="item-inner"> 
                    <!--パンくず-->
                    <div class="breadcrumb">
                        <span class="breadcrumb-item"><a href="<{$url.top}>">ホーム</a></span>
                        <span class="breadcrumb-item current"><a href="<{$item.url}>"><{$item.name|escape:html}></a>のレビュー一覧</span>
                    </div>
                    <h2 class="section-title review-title"><{$item.name|escape:html}>のレビュー一覧</h2>
                    <div class="detail">
                        <div class="review-item-wrap">
                            <div class="review-item-image"><img src="<{$item.image_S}>" alt="<{$item.name|escape:html}>"></div>
                            <div class="review-item-info">
                                <p class="review-category-name"><{$item.base_category.name}></p>
                                <p class="review-item-name"><a href="<{$item.url}>"><{$item.name|escape:html}></a></p>
                                <{if $review.has_item}>
                                    <div class="total-review">
                                        <div class="review-star"><{$review.star_html}></div>
                                        <p class="review-average"><{$review.average}></p>
                                        <p class="review-count">（<{$review.total_count}>件）</p>
                                    </div>
                                <{/if}>
                            </div>
                        </div>
                        <div class="review-item-btn"><a href="<{$review.post_url}>" class="btn btn-review-post">レビューを書く</a></div>
                    </div>
                    <div class="list-head">
                        <p class="review-count-all">全<{$review.total_count}>件中<{$review.display_count}>件表示</p>
                    </div>
                    <{if $review.has_item}>
                    <!--レビュー一覧--> 
                        <ul class="review-list all-review">
                            <{section name=i loop=$review.list}>
                                <li class="review-list-unit">
                                    <div class="review-list-head">
                                        <div class="review-head-wrap">
                                            <p class="review-name"><i class="fa fa-user-circle-o" aria-hidden="true"></i><span><{$review.list[i].reviewer_name}></span>さん</p>
                                            <div class="review-list-score-wrap">
                                                <div class="review-star"><{$review.list[i].star_html}></div>
                                                <p class="review-score"><{$review.list[i].score}></p>
                                            </div>
                                        </div>
                                        <p class="review-list-date"><{$review.list[i].date.year}>/<{$review.list[i].date.month}>/<{$review.list[i].date.day}>&nbsp;<{$review.list[i].date.hour}>:<{$review.list[i].date.minute}></p>
                                    </div>
                                    <div class="review-list-content"><{$review.list[i].content}></div>
                                </li>
                            <{/section}>
                        </ul>
                        <{if $review.pager.has_item}>
                            <div class="review-pager">
                                <ul class="pager">
                                    <{if !$review.pager.is_first}>
                                        <li><a href="<{$review.pager.prev_url}>"><span>&#171;</span></a></li>
                                    <{/if}>
                                    <{section name=i loop=$review.pager.list}>
                                        <{if $review.pager.list[i].is_current_page}>
                                            <li><span class="current"><{$review.pager.list[i].number}></span></li>
                                        <{else}>
                                            <li><a href="<{$review.pager.list[i].url}>"><span><{$review.pager.list[i].number}></span></a></li>
                                        <{/if}>
                                    <{/section}>
                                    <{if !$review.pager.is_last}>
                                        <li><a href="<{$review.pager.next_url}>"><span>&#187;</span></a></li>
                                    <{/if}>
                                </ul>
                            </div>
                        <{/if}>
                    <{else}>
                        <p class="empty">この商品のレビューはまだありません。</p>
                    <{/if}>
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