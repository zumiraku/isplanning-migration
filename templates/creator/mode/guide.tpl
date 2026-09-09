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

<div id="O_adminPagearea" class="M_mainContents shop-guide">
	<h3 class="heading cartHeading">ショッピングガイド</h3>
	<p>お買い物方法についてのご案内です。<br>お買い物をされる前に、一度目をお通し下さいませ。</p>
	<div id="O_guideAnchor">
		<ul class="txtList01 guide-list">
			<li><a href="#about_flow">買い物方法</a></li>
			<li><a href="#about_payment">お支払・送料について</a></li>
			<li><a href="#about_delivaly">お届けについて</a></li>
			<li><a href="#about_return">返品交換について</a></li>
			<li><a href="#about_receipt">納品書・領収書について</a></li>
		</ul>
	</div>

	<h3 class="heading" id="about_flow">買い物方法</h3>
	<div><{$guide.order}></div>

	<h3 class="heading" id="about_payment">お支払・送料について</h3>
	<div><{$guide.payment}></div>

	<h3 class="heading" id="about_delivaly">お届けについて</h3>
	<div><{$guide.delivery}></div>

	<h3 class="heading" id="about_return">返品交換について</h3>
	<div><{$guide.return}></div>

	<h3 class="heading" id="about_receipt">納品書・領収書について</h3>
	<div><{$guide.tax}></div>

</div>

<{* 🔴 フッターは .M_mainContents の**中**です

     最初は外に出していました。#colum-wrap は幅指定の無いブロックなので、
     float:left の左メニューと float:right の .M_mainContents のあいだに
     割り込み、**本文がまるごと左メニューの下（top=5516px）に落ちました。**
     ヘッダーも左メニューもコラムも正しく出ているのに本文だけ無い、という
     見え方になります。

     公開ページの骨格を取り直したら、#colum-wrap も #footer_guideWrap も
     .M_mainContents の中にありました。元の入れ子に合わせます。

     .M_mainContents / #O_container / #wrapper / #bgMain / #wrap を閉じるのは
     フッターのモジュール側です。 *}>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
