<{* ==========================================================================
     商品検索結果 — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_searchpage.txt のままで、タグとURLだけ
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

<h2>商品検索</h2>

	<div class="section" id="r_searchName">
		<p class="searchResult"><{$search.keyword}>で検索した結果</p>
	</div>

	<div class="section" id="r_searchInput">
        <table>
        <tr>
            <th>カテゴリー<div class="triangle-right"></div></th>
            <td id="searchCategory"><select data-id="<{$search_form.category_id}>" aria-label="カテゴリー">
			  <{section name=c loop=$search_form.category_list}>
			    <option value="<{$search_form.category_list[c].code}>"<{if $search.category.code == $search_form.category_list[c].code}> selected<{/if}>><{$search_form.category_list[c].name}></option>
			  <{/section}>
			</select></td>
            <th>商品名<div class="triangle-right"></div></th>
            <td id="searchBrand"><input type="text" data-id="<{$search_form.name_id}>" value="<{$search.name}>" aria-label="商品名"></td>
			 </tr>
       		 <tr>
            <th>価格(予算合計)<div class="triangle-right"></div></th>
            <td id="searchPrice"><input type="number" inputmode="numeric" data-id="<{$search_form.price_low_id}>" value="<{$search.price_low}>" aria-label="価格の下限">〜<input type="number" inputmode="numeric" data-id="<{$search_form.price_high_id}>" value="<{$search.price_high}>" aria-label="価格の上限"></td>       
            <th>商品単価<div class="triangle-right"></div></th>
            <td id="searchProduct"><span class="minikome">単価での絞り込みは、並び替えの「単価順」をお使いください</span></td>
			 </tr>
        	<tr>
            <th>キーワード<div class="triangle-right"></div></th>
            <td id="searchContent"><input type="text" data-id="<{$search_form.keyword_id}>" value="<{$search.keyword}>" aria-label="キーワード"></td>
            <th>商品コード<div class="triangle-right"></div></th>
            <td id="searchCode"><input type="text" data-id="<{$search_form.original_code_id}>" value="<{$search.original_code}>" aria-label="商品コード"></td>
        </tr>
        </table>
        
        <div class="btnWrap"><a href="<{$search_form.search_url}>" role="button">検索</a></div>
    </div>

	<div class="section clear" id="r_resultInfo">
		<p class="total">全<{$search.total_count}>件</p>
		<ul class="listSort clear">
        	<li>並び替え：</li>
        	<li><a href="<{$search.sort_new_url}>">新着順</a></li>
        	<li><a href="<{$search.sort_recommend_url}>">おすすめ順</a></li>
        	<li><a href="<{$search.sort_manufacturer_url}>">単価順</a></li>
        	<li><a href="<{$search.sort_low_price_url}>">価格</a></li>
        	<li><a href="<{$search.sort_name_url}>">商品名</a></li>
		</ul>
    </div>

	<h3>商品検索結果</h3>
<p class="searchinner-txt">■販売単位数量はほとんどの商品でご相談可能です■	</p>
	<div id="M_categoryList">
		<ul class="M_innerList">
			<{section name=i loop=$search.item.list}>
			<li>
				<div class="M_innerBox">
					<div class="M_cl_imgWrap">
					<a href="<{$search.item.list[i].url}>"><img src="<{$search.item.list[i].image_S}>" alt="<{$search.item.list[i].name}>" border="0"></a>
					</div>
					<p class="soldout"><{if $search.item.list[i].is_soldout}>＝ 品切れ中 ＝<{/if}></p>
					<div class="M_cl_detail">品番：<{$search.item.list[i].original_code}>
						<p class="M_cl_name"><a href="<{$search.item.list[i].url}>"><{$search.item.list[i].name}></a></p>
						<p><span class="M_cl_taxadd"><{$search.item.list[i].special_display}></span></p>
						<p class="M_cl_price"><span class="M_cl_taxPrice"><{$search.item.list[i].price}>円（税込）</span></p>
						<{* 🔴 カートボタンは元テンプレートでもコメントアウトされています。 *}>
					</div>
					<br class="clear">
				</div>
			</li>
<{/section}>
			</ul>
	</div><!--M_categoryList-->
	<div id="pager">
	<{if $search.pager.has_item}>
	  <{if not $search.pager.is_first}><a href="<{$search.pager.first_url}>">最初へ</a> <a href="<{$search.pager.prev_url}>" rel="prev">前へ</a><{/if}>
	  <{section name=p loop=$search.pager.list}>
	    <{if $search.pager.list[p].is_current_page}><span><{$search.pager.list[p].number}></span>
	    <{else}><a href="<{$search.pager.list[p].url}>"><{$search.pager.list[p].number}></a><{/if}>
	  <{/section}>
	  <{if not $search.pager.is_last}><a href="<{$search.pager.next_url}>" rel="next">次へ</a> <a href="<{$search.pager.last_url}>">最後へ</a><{/if}>
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
