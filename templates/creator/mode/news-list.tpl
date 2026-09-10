<{* ==========================================================================
     お知らせ一覧 — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_（タグのみ）.txt のままで、タグとURLだけ
     置き換えています。class も id も並び順も変えていません。
   ========================================================================== *}>
<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>お知らせ一覧ページ</title>
<{if $page.description}><meta name="description" content="<{$page.description}>"><{/if}>
<link rel="canonical" href="<{$page.canonical_url}>">
<meta property="og:type" content="website">
<meta property="og:title" content="お知らせ一覧ページ">
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
	<h2 class="middle-ttl">お知らせ一覧</h2>
	<div class="section" id="r_news">
	<{if $news.has_item}>
	<div id="newsList">
	<table border="0" cellpadding="0" cellspacing="0" width="100%">
	<tr><td class="line" height="1" bgcolor="#dadada" colspan="2">&nbsp;</td></tr>
	<{section name=n loop=$news.list}>
	<tr bgcolor="#ffffff" height="25">
		<td class="lims" width="80%">&nbsp;<a href="<{$news.list[n].url}>"><{$news.list[n].title}></a></td>
		<td class="lims" align="center" width="20%"><{$news.list[n].date.year}>/<{$news.list[n].date.month}>/<{$news.list[n].date.day}></td>
	</tr>
	<{/section}>
	</table>
	</div>

	<div id="pager">
	<table border="0" cellpadding="0" cellspacing="0" width="368">
	<tr><td class="line" height="10">&nbsp;</td></tr>
	<tr><td align="center">
	<{if not $news.pager.is_first}><a href="<{$news.pager.first_url}>"><font class="woong" color="#0000FF">[最初]</font></a>&nbsp;&nbsp;<{/if}>
	<{section name=p loop=$news.pager.list}>
	<{if $news.pager.list[p].is_current_page}><font class="woong">[<{$news.pager.list[p].number}>]</font>&nbsp;&nbsp;
	<{else}><a href="<{$news.pager.list[p].url}>"><font class="woong" color="#0000FF">[<{$news.pager.list[p].number}>]</font></a>&nbsp;&nbsp;<{/if}>
	<{/section}>
	<{if not $news.pager.is_last}><a href="<{$news.pager.last_url}>"><font class="woong" color="#0000FF">[最後]</font></a>&nbsp;&nbsp;<{/if}>
	</td></tr>
	</table>
	</div>
	<{else}>
	<p>お知らせはまだありません。</p>
	<{/if}>
	</div>
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
