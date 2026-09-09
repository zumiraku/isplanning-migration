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
                        <span class="breadcrumb-item current"><a href="<{$item.url}>"><{$item.name|escape:html}></a>のレビュー投稿</span>
                    </div>
                    <h2 class="section-title review-title"><{$item.name|escape:html}>のレビュー投稿</h2>
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
                                <{else}>
                                    <p>まだレビューはありません</p>
                                <{/if}>
                            </div>
                        </div>
                        <div class="review-form-wrap">
                            <dl class="review-form">
                                <dt class="review-form-title">ニックネーム</dt>
                                <dd class="review-form-content">
                                    <input type="text" data-id="<{$review.name_id}>">
                                </dd>
                            </dl>
                            <dl class="review-form">
                                <dt class="review-form-title">評価</dt>
                                <dd class="review-form-content"><{$review.star_select_html}></dd>
                            </dl>
                            <dl class="review-form">
                                <dt class="review-form-title">コメント</dt>
                                <dd class="review-form-content">
                                    <textarea name="" id="" cols="30" rows="10" data-id="<{$review.content_id}>"></textarea>
                                </dd>
                            </dl>
                            <a href="<{$review.entry_url}>" class="btn review-post-btn">この内容でレビューを投稿する</a>
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