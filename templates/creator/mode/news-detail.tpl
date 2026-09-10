<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><{$page.title}></title>
<{if $page.description}><meta name="description" content="<{$page.description}>"><{/if}>
<link rel="canonical" href="<{$page.canonical_url}>">
<meta property="og:type" content="website">
<meta property="og:title" content="<{$page.title}>">
<meta property="og:description" content="<{$page.description}>">
<meta property="og:site_name" content="<{$shop.name}>">

<link rel="icon" href="<{$shop.favicon_url}>">
<meta name="googlebot" content="NOODP">
<meta name="google-site-verification" content="L9LBYhUrWwhjZ0gO7jQg6ET8BNBqWbwWlCkeo2ZyP_s">
<meta name="google-site-verification" content="D6YaDg_WQObAhN2-bDzeZpr-rdLLeCzVZFLi1-MuCPo">
<meta name="google-site-verification" content="LvZm_KlYvKyFf9HCkCnvyRUTHeNFcweS7S6_I1qJ9pw">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://gigaplus.makeshop.jp/isplanning/css/default.css">
<link rel="stylesheet" href="<{$page.css}>">
<{$makeshop.head}>
</head>
<body>
<{$makeshop.body_top}>
<{$module.header}>

<div id="wrapper">
  <div id="O_container">
    <{$module.leftmenu}>
    <div class="M_mainContents">

<div class="rightContents" id="news">
	<h2 class="middle-ttl">お知らせ</h2>
	<div class="section" id="r_news">
		<div id="newsHead"><span class="date"><{$news.date.year}>/<{$news.date.month}>/<{$news.date.day}></span><{$news.title}></div>
		<div id="newsContents"><{$news.content}></div>
		<hr>
		<{if $news.prev_url}><p id="newsPrev"><a href="<{$news.prev_url}>" rel="prev">前のお知らせ</a></p><{/if}>
		<{if $news.next_url}><p id="newsNext"><a href="<{$news.next_url}>" rel="next">次のお知らせ</a></p><{/if}>
		<div id="newsListBtn"><a class="link_green-bg linkbar" href="<{$url.news}>">お知らせ一覧へ</a></div>
	</div>
</div>

<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
