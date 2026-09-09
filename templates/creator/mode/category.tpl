<{* ==========================================================================
     商品カテゴリー — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_brandpage.txt のままで、タグとURLだけ
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

<!--▼商品分類段階リンク-->
	<div class="M_topicPath">
	<a href="<{$url.top}>">ホーム</a>&nbsp;&gt;
	<{section name=b loop=$category.breadcrumb_list.list}>
	  <{if $category.breadcrumb_list.list[b].is_current}><span><{$category.breadcrumb_list.list[b].name}></span>
	  <{else}><a href="<{$category.breadcrumb_list.list[b].url}>"><{$category.breadcrumb_list.list[b].name}></a>&nbsp;&gt;<{/if}>
	<{/section}>
	</div>
	
	<!--▼商品カテゴリー名-->
	<h2><{$module.category_title1}></h2>

	<div id="O_subCategory">
	<{if $category.child_category.has_item}>
	<ul class="subcats">
	<{section name=c loop=$category.child_category.list}>
	  <{* 🔴 件数を落としていました。現行は「熱中症対策(387)」のように出ます。
	       $category.child_category.list[c].item_count というタグがあるのに、
	       名前だけを出していました。 *}>
	  <li><a href="<{$category.child_category.list[c].url}>"><{$category.child_category.list[c].name}>(<{$category.child_category.list[c].item_count}>)</a></li>
	<{/section}>
	</ul>
	<{/if}>
	</div>


	<{$module.category_extra1}><{$module.category_extra2}><{$module.category_extra3}>

	<div class="O_ItemLine">
	<p class="total">全 <{$category.total_count}> 件</p> <div class="list-link">並び替え：<a href="<{$category.sort_new_url}>">新着順</a> <a href="<{$category.sort_recommend_url}>">おすすめ順</a> <a href="<{$category.sort_manufacturer_url}>">単価順</a> <a href="<{$category.sort_low_price_url}>">価格</a> <a href="<{$category.sort_name_url}>">商品名</a></div>
	</div>


<table class="tbl02">
	<{section name=i loop=$category.item.list}>
	<{if $smarty.section.i.index % 4 == 0}><tr><{/if}>
		<td class="categorylist">
			<table>
				<tr>
					<td class="itemimg">
						<a href="<{$category.item.list[i].url}>"><img border="0" align="middle" alt="<{$category.item.list[i].name}>"
						src="<{$category.item.list[i].image_S}>" class="M_cl_img"></a>
					</td>
					<td class="itemtext">
						<div style="padding-left:10px;">
							<{$category.item.list[i].description}>
							<p class="soldout2"><{if $category.item.list[i].is_soldout}>＝ 品切れ中 ＝<{/if}></p>
							<p class="M_mgnT5"><{if $category.item.list[i].icon.has_item}><{section name=ic loop=$category.item.list[i].icon.list}><img src="<{$category.item.list[i].icon.list[ic].image_url}>" align="absmiddle" border="0"><{/section}><{/if}></p>
							<p class="M_mgnT5">品番：<{$category.item.list[i].original_code}></p>
							<p class="item-name"><span>品名：</span><a href="<{$category.item.list[i].url}>"><{$category.item.list[i].name}></a></p>
							<p class="red"><{$category.item.list[i].special_display}></p>
							<p class="M_cl_price red">販売価格<span class="M_cl_taxPrice"><{$category.item.list[i].price}></span>円<span class="M_outtax">（税込）</span></p>
						</div>
						<{* 🔴 「カートに入れる」「お気に入り」は元テンプレートでも
						     コメントアウトされています。山口様の「不要」は、
						     こちらが足したものを外せという意味でした。 *}>
					</td>
				</tr>
			</table>
		</td>
	<{if $smarty.section.i.index % 4 == 3}></tr><{/if}>
<{/section}>
	<{if $category.total_count % 4 != 0}></tr><{/if}>
</table>
	<div id="pager">
		<{if $category.pager.has_item}>
	  <{if not $category.pager.is_first}><a href="<{$category.pager.first_url}>">最初へ</a> <a href="<{$category.pager.prev_url}>" rel="prev">&laquo; 前の<{$category.display_count}>件</a><{/if}>
	  <{section name=p loop=$category.pager.list}>
	    <{if $category.pager.list[p].is_current_page}><span><{$category.pager.list[p].number}></span>
	    <{else}><a href="<{$category.pager.list[p].url}>"><{$category.pager.list[p].number}></a><{/if}>
	  <{/section}>
	  <{* 🔴 文言を現行に合わせます。現行は「次の40件 »」「« 前の40件」です。
	       「次へ」だと、何件ずつ進むのかが読めません。 *}>
	  <{if not $category.pager.is_last}><a href="<{$category.pager.next_url}>" rel="next">次の<{$category.display_count}>件 &raquo;</a> <a href="<{$category.pager.last_url}>">最後へ</a><{/if}>
	<{/if}>
	</div>


  <h2 class="categorybottom">粗品選びは【発見マーケット】にお任せ！</h2>
  <p style="margin: 0 0 50px 0; padding: 1px 100px 30px 100px; line-height: 1.8; font-size:18px; text-align:left;">
【発見マーケット】でお取り扱いしている粗品の定番アイテムには、タオルやボールペン、卓上カレンダーなどの実用品が揃っています。宣伝効果や販売促進を目的とした粗品には、普段の生活でよく使う実用性が高いものを選ぶことがおすすめです。<br />
粗品選びに困ったら【発見マーケット】へ。定番アイテムだけでなく、スマートフォンを使う際に便利なスマホグッズもご用意しています。人気のスマホグッズを景品やノベルティとして活用したい方は、ぜひご利用ください。</p>


	<h3>こちらの商品もおすすめです。</h3>
<div class="section" id="r_recommend_ct">
	<{$module.category_bottom1}>

	<{if $category.recommend_item.has_item}>
	<table class="tbl02"><tr>
	<{section name=rc loop=$category.recommend_item.list}>
	  <{if $smarty.section.rc.index > 0 and $smarty.section.rc.index % 4 == 0}></tr><tr><{/if}>
	  <td class="categorylist">
	    <a href="<{$category.recommend_item.list[rc].url}>"><img src="<{$category.recommend_item.list[rc].image_S}>" alt="<{$category.recommend_item.list[rc].name}>" border="0" class="M_cl_img"></a>
	    <p class="item-name"><a href="<{$category.recommend_item.list[rc].url}>"><{$category.recommend_item.list[rc].name}></a></p>
	    <{if $category.recommend_item.list[rc].special_display}><p class="red"><{$category.recommend_item.list[rc].special_display}></p><{/if}>
	    <p class="M_cl_price red">販売価格<span class="M_cl_taxPrice"><{$category.recommend_item.list[rc].price}></span>円<span class="M_outtax">（税込）</span></p>
	  </td>
	<{/section}>
	</tr></table>
	<{/if}>
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
