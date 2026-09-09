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

<div id="O_adminPagearea" class="company">
	<h2>お知らせ一覧</h2>
	<{if $news.has_item}>
	<ul class="infoList">
	<{section name=n loop=$news.list}>
		<li>
			<span class="infodate">[<{$news.list[n].date.year}>/<{$news.list[n].date.month}>/<{$news.list[n].date.day}>]</span>
			<a class="infoa" href="<{$news.list[n].url}>"><{$news.list[n].title}></a>
		</li>
	<{/section}>
	</ul>

	<div class="M_pager">
	<{* 🔴 $news.pager.has_item はリファレンスにありません。
	     カテゴリと検索には $…pager.has_item があるのに、news-list だけ
	     載っていません。無いタグを条件にすると Smarty は黙って偽にするので、
	     **ページ送りが一度も出なくなります。** section は空配列なら何も
	     出さないので、囲む必要がありません。 *}>
	  <{if not $news.pager.is_first}><a href="<{$news.pager.first_url}>">最初へ</a> <a href="<{$news.pager.prev_url}>" rel="prev">前へ</a><{/if}>
	  <{section name=p loop=$news.pager.list}>
	    <{if $news.pager.list[p].is_current_page}><span><{$news.pager.list[p].number}></span>
	    <{else}><a href="<{$news.pager.list[p].url}>"><{$news.pager.list[p].number}></a><{/if}>
	  <{/section}>
	  <{if not $news.pager.is_last}><a href="<{$news.pager.next_url}>" rel="next">次へ</a> <a href="<{$news.pager.last_url}>">最後へ</a><{/if}>
	</div>
	<{else}>
	<p>お知らせはまだありません。</p>
	<{/if}>
</div>

    </div><!-- /.M_mainContents -->
  </div><!-- /#O_container -->
</div><!-- /#wrapper -->
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
