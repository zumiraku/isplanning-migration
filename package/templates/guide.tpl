<{* ==========================================================================
     ご利用案内 — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_（タグのみ）.txt のままで、タグとURLだけ
     置き換えています。class も id も並び順も変えていません。
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

<div id="O_adminPagearea" class="company guide">
	<h2>ご利用案内</h2>

	<h3 id="about_order">商品のご注文方法</h3>
	<div class="article"><{$guide.order}></div>

	<h3 id="about_payment">お支払いについて</h3>
	<div class="article"><{$guide.payment}></div>

	<h3 id="about_delivaly">配送について</h3>
	<div class="article"><{$guide.delivery}></div>

	<h3 id="about_tax">消費税について</h3>
	<div class="article"><{$guide.tax}></div>

	<h3 id="about_return">返品について</h3>
	<div class="article"><{$guide.return}></div>

	<{* 🔴 id は現行サイトのアンカーに合わせてあります。
	     フッターや商品ページから /view/guide#about_payment のように
	     直接飛んでくるリンクが十数本あり、id が変わると全部
	     ページ頭に着地します。 *}>
</div>

    </div><!-- /.M_mainContents -->
  </div><!-- /#O_container -->
</div><!-- /#wrapper -->
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
