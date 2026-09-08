<{* ==========================================================================
     文書の頭 — すべてのページ種別で共通
     各ページのHTML欄は「完全なHTML文書」です。本文の断片ではありません。

     🔴 $makeshop.head / $makeshop.body_top / $makeshop.body_bottom は必須。
        リファレンスに「必ず記載」と書かれており、これが無いと
        プラットフォームが差し込んでいるものが一切読み込まれません。
        この店舗の場合、具体的には次が消えます。

          - Googleアナリティクス（G-BK1PPN5MEV）
          - u-komi のレビュー読み込みスクリプト
          - かご投入などプラットフォーム側の挙動

        C32 で「GA4はプラットフォーム側から出ているので移行で消えない」と
        書いたのは正しいのですが、それは**このタグを書いていれば**の話です。
        書き忘れれば、壊れようがないと思っていたものが壊れます。
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Mochiy+Pop+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<{$page.css}>">
<{$makeshop.head}>
</head>
<body>
<{$makeshop.body_top}>
<{$module.header}>
<main class="container">
<{* ==========================================================================
     商品詳細 — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_detailpage.txt のままで、タグとURLだけ
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

<div class="M_topicPath">
	<a href="<{$url.top}>">ホーム</a> &nbsp;&gt;
	<{if $item.breadcrumb_list_group.has_item}>
	  <{section name=g loop=$item.breadcrumb_list_group.list}>
	    <{if $item.breadcrumb_list_group.list[g].is_base_category}>
	      <{section name=b loop=$item.breadcrumb_list_group.list[g].list}>
	        <a href="<{$item.breadcrumb_list_group.list[g].list[b].url}>"><{$item.breadcrumb_list_group.list[g].list[b].name}></a> &nbsp;&gt;
	      <{/section}>
	    <{/if}>
	  <{/section}>
	<{/if}>
	</div>
	
	<h2 class="brandname"><p><{$item.name}></p></h2>


<!--<div id="NextPage"><span class="PageLeft"><a href=>< 前の商品</a></span><span class="PageRight"><a href=>次の商品 ></a></span></div>-->
	<div class="O_itemDetailTop">	
		<div id="O_itemDetailL">
		<div id="itemImg">
            <a href="<{$item.image_L}>" class="js-zoom" data-zoom><img src="<{$item.image_L}>" alt="<{$item.name}>" border="0" class="M_cl_img"></a>
			<{if $item.multi_image.has_item}>
			<div class="M_imageThumbnail">
			  <{section name=m loop=$item.multi_image.list}>
			  <div class="M_imageThumbnail-item"><a href="<{$item.multi_image.list[m].image_L}>" class="js-zoom" data-zoom><img src="<{$item.multi_image.list[m].image_S}>" alt="" border="0"></a></div>
			  <{/section}>
			</div>
			<{/if}>
          <img src="https://gigaplus.makeshop.jp/isplanning/images/kakudais2.png" alt="拡大画像"  style="display: block; margin: auto;">
        </div>
		<div id="Other_img">
			<{if $item.add_image.has_item}>
			<{section name=a loop=$item.add_image.list}>
			<div><a href="<{$item.add_image.list[a].image_url}>" class="js-zoom" data-zoom><img src="<{$item.add_image.list[a].image_url}>" alt="" border="0"></a></div>
			<{/section}>
			<{/if}><!-- 商品追加画像3 -->
		</div>

	</div><!-- Item_Detail_Left -->

		<div id="O_itemDetailR">
				
		
		<div class="Item_detail_txt">
			<{$item.description}>		
			
		<div id="Item_detail_caption2"><{$item.description3}></div>		
		
		</div>

	</div>
	</div>
	<div class="O_itemDetailBottom">
		<div id="O_itemDetailBottomL">
		<div class="daibiki-txt">代引き手数料 当社負担で<span>無料！</span></div>
		<div class="price-box">
			<dl class="itemPrice-wrap">
				<dt><span>価格：</span></dt>
				<dd class="itemPrice"><span><{$item.price_html}></span>円（税込）<!--  ポイント --></dd>
			</dl><!-- <dl>【税込み33000円未満の場合は送料が必要です】</dl> -->
			<dl class="itemPrice-wrap">
				<dt><span>数量：</span></dt>
				<dd class="itemCount"><{$item.special_display}> X
					<input type="number" inputmode="numeric" class="quantityInput"
					       id="<{$item.quantity_id}>" data-id="<{$item.quantity_id}>"
					       value="<{if $item.order_quantity_min}><{$item.order_quantity_min}><{else}>1<{/if}>"
					       <{if $item.order_quantity_min}>min="<{$item.order_quantity_min}>"<{/if}>
					       <{if $item.order_quantity_max}>max="<{$item.order_quantity_max}>"<{/if}>>
					<{* 🔴 元は [UPCOUNT] / [DOWNCOUNT] というURLの▲▼でした。
					     クリエイターに同じURLはありません。数値入力欄にすると
					     スマホでも数字キーが出て、押す回数も減ります。 *}></dd>
			</dl>
		</div>
<{if $item.is_sale}>
<div class="saleBox">
<p class="sale"><b>早割りセール </b></p>
<p class="price">通常価格 <{$item.original_price_excluded_tax}>円（税別）から</p>
<p class="saleRate"><b><{$item.sale_rate}>％OFF</b>　名入れ代・版代・送料等除く</p>
</div>
<{/if}>
		</div>

		<div id="O_itemDetailBottomR">
			<div class="detailcart-wrap">
					<p class="goCart"><{if $item.is_soldout}><span class="detaol-soldout">品切れ</span><{else}><a href="<{$item.cart_entry_url}>" class="detail-cart">カートに入れる</a><{/if}></p>
		<ul><!---->
			<ul class="mailestimation">
				<li class="detail-btn"><a href="<{$item.favorite_entry_url}>" class="detail-fav">お気に入りリストに追加</a></li>
				<li class="detail-btn"><a class="detail-mail" href="<{$item.contact_url}>">この商品について問い合わせる</a><span>販売単位数量、納期、在庫等上記よりお問合せ下さい</span></li>
				<li class="detail-btn"><a href="https://www.isp-sp.com/shop/enq202208200" onclick="window.open(this.href, '', 'resizable=yes,status=no,location=no,toolbar=no,menubar=no,fullscreen=no,scrollbars=yes,dependent=no,width=600,height=600'); return false;" class="detail-mitsumori">見積依頼フォーム</a></li></ul>
			</ul>
			</div>
		</div>
	</div>
	<div class="option-wrap">
		<{if $item.has_option}><div class="detail_option"><{$item.option_html}></div><{/if}>
<{if $item.is_name_print and $item.name_print.has_item}>
<div class="nameorderdiv">
  <{if $item.name_print.description}><p class="nameorderp"><{$item.name_print.description}></p><{/if}>
  <{section name=n loop=$item.name_print.list}>
    <p class="nameall"><{$item.name_print.list[n].title}><{if $item.name_print.list[n].is_required}> <span class="red">必須</span><{/if}></p>
    <{$item.name_print.list[n].html}>
    <{if $item.name_print.list[n].total_max}><p class="minikome">最大 <{$item.name_print.list[n].total_max}> 文字</p><{/if}>
  <{/section}>
</div>
<{/if}>
<div class="zaiko9"><{if $item.is_soldout}>品切れ<{elseif $item.is_stock_display and not $item.is_stock_unlimited}>在庫 <{$item.stock_quantity}> 点<{if $item.is_small_stock}>（残りわずか）<{/if}><{elseif $item.is_small_stock}>残りわずか<{/if}> </div>

		<div id="Item_detail_caption3"><{$item.description4}></div>
	</div>

<!-- O_itemDetailR -->
<!-- 商品詳細説明 -->


	
	<div class="tab-area">
 
<input id="tab-btn1" class="tab-btn" name="tab" type="radio" checked>
<input id="tab-btn2" class="tab-btn" name="tab" type="radio">
<input id="tab-btn3" class="tab-btn" name="tab" type="radio">
 
<ul class="tab-list-wrap">
<li><label id="tab-list1" class="tab-list" for="tab-btn1">送料・類似品</label></li>
<li><label id="tab-list2" class="tab-list" for="tab-btn2">商品カテゴリー一覧</label></li>
<li><label id="tab-list3" class="tab-list" for="tab-btn3">この商品の<br>レビューを見る</label></li>
</ul>

<div class="tab-content-wrap">
<div id="tab-content1" class="tab-content">
<div><img src="https://gigaplus.makeshop.jp/isplanning/uploads/souryou2022.png" alt="送料・代引き手数料表" /></div>
		<p><div class="red txta-l mt10 mb20 ft16 lh28">送料は個数、種類に関係なく1回のご注文での料金です。（例：2、3種類かごに入れても送料は800円（税別）です）<br />離島・北海道・沖縄は別途送料、中継料が必要となります。（カゴでは自動計算されません）</div><br />
		<a href="/view/guide#about_payment" class="link_green wd320">送料・代引き手数料のご案内</a></p>

		<ul class="detail_postage">
			<li>ご購入前に<a href="/view/news/list">「お知らせページ」</a>をご覧ください</li>
			<li>販売単位数量以外は「買物カゴ（カート）」ではご注文できませんので<a href="JavaScript:top_sendmail()">メール</a>・<a href="/view/page/page1.html">ＦＡＸ注文・見積用紙</a>にてお気軽に見積依頼又はご注文してください。</li>
			<li>商品のデザイン・色が若干変更になる場合がありますがご了承願います。</li>
			<li>画像は商品の色・素材感が実物とは異なる場合、商品以外の品が添えられている場合があります。</li>
			<li>納期は余裕を持ってご注文お願いいたします。品切れの際はご容赦願います。</li>
			</ul>
	
	<!--最近チェックした商品-->
	<!--
    <div class="M_section border" id="middle_recent">
		<h2 class="main-ttl">最近チェックした商品</h2>
        
	</div>
    -->
	
<!-- イーレコメンド設置タグ -->
<script type="text/javascript">
if (!window._rcmdjp) document.write(unescape("%3Cscript src='" + document.location.protocol + "//d.rcmd.jp/isplanning/item/recommend.js' type='text/javascript' charset='UTF-8'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
try{
  _rcmdjp._displayHistory({
    template: 'deco_history_scroll2-copy'
  });
  _rcmdjp._displayRecommend({
    type: 'pv',
    template: 'deco_recommend_scroll1-copy'
  });
  _rcmdjp._displayRanking({
    type: 'pv',
    span: 'week',
    template: 'deco_ranking_scroll3-copy'
  });
  _rcmdjp._displayPickup({
    label: 'pickup-1',
    template: 'deco_pikup_2018-copy'
  });
} catch(err) {}
</script>


<!--商品グループ--><div id="brandgroupsend"></div>
<div class="M_section" id="middle_recent">
        <{if $item.group.has_item}><h3><{$item.group.name}></h3><{$item.group}><{/if}>
</div>
</div>

<div id="tab-content2" class="tab-content">

<div class="PageArea">
<p>販売単位はほとんどの商品でご相談できますのでお問い合わせください。</p>
<ul class="page_scene">
			<li><a href="/view/category/ct19"><img alt="季節商品※春" src="https://gigaplus.makeshop.jp/isplanning/images/i_spring.jpg"><div class="textboxisp">季節商品※春</div></a></li>
			<li><a href="/view/category/ct22"><img alt="季節商品※夏" src="https://gigaplus.makeshop.jp/isplanning/images/i_summer.jpg"><div class="textboxisp">季節商品※夏</div></a></li>
			<li><a href="/view/category/ct28"><img alt="季節商品※秋" src="https://gigaplus.makeshop.jp/isplanning/images/i_autumn.jpg"><div class="textboxisp">季節商品※秋</div></a></li>
			<li><a href="/view/category/ct31"><img alt="季節商品※冬" src="https://gigaplus.makeshop.jp/isplanning/images/i_winter.jpg"><div class="textboxisp">季節商品※冬</div></a></li></ul>

<ul class="page_scene">
			<li><a href="/view/category/ct4"><img alt="予算別" src="https://gigaplus.makeshop.jp/isplanning/images/i_budget.jpg"><div class="textboxisp">予算で探す</div></a></li>
                        <li><a href="/view/category/ct443"><img alt="スマートフォン" src="https://gigaplus.makeshop.jp/isplanning/images/i_sm2.jpg"><div class="textboxisp">スマートフォン粗品グッズ</div></a></li>
			<li><a href="/view/category/ct51"><img alt="癒し健康" src="https://gigaplus.makeshop.jp/isplanning/images/i_iya2.jpg"><div class="textboxisp">癒し・健康</div></a></li>
			<li><a href="/view/category/ct66"><img alt="便利グッズ" src="https://gigaplus.makeshop.jp/isplanning/images/i_benri2.jpg"><div class="textboxisp">便利グッズ</div></a></li></ul>

<ul class="page_scene">		
			<li><a href="/view/category/ct96"><img alt="おしゃれ小物" src="https://gigaplus.makeshop.jp/isplanning/images/i_osyare2.jpg"><div class="textboxisp">おしゃれ・小物</div></a></li>
			<li><a href="/view/category/ct111"><img alt="エコロジー" src="https://gigaplus.makeshop.jp/isplanning/images/i_eco2.jpg"><div class="textboxisp">エコロジー</div></a></li>
			<li><a href="/view/category/ct126"><img alt="レジャー関係" src="https://gigaplus.makeshop.jp/isplanning/images/i_leisure2.jpg"><div class="textboxisp">レジャーアウトドア</div></a></li>
			<li><a href="/view/category/ct141"><img alt="花" src="https://gigaplus.makeshop.jp/isplanning/images/i_flower2.jpg"><div class="textboxisp">フラワー花</div></a></li></ul>

<ul class="page_scene">	
			<li><a href="/view/category/ct156"><img alt="ステーショナリーグッズ" src="https://gigaplus.makeshop.jp/isplanning/images/i_stationery2.jpg"><div class="textboxisp">ステーショナリー</div></a></li>
			<li><a href="/view/category/ct171"><img alt="ボールペン" src="https://gigaplus.makeshop.jp/isplanning/images/i_pen2.jpg"><div class="textboxisp">ボールペン</div></a></li>
			<li><a href="/view/category/ct186"><img alt="キャラクター" src="https://gigaplus.makeshop.jp/isplanning/images/i_character2.jpg"><div class="textboxisp">キャラクター</div></a></li>
			<li><a href="/view/category/ct201"><img alt="バッグ鞄" src="https://gigaplus.makeshop.jp/isplanning/images/i_bag2.jpg"><div class="textboxisp">バッグ・鞄</div></a></li></ul>

<ul class="page_scene">
			<li><a href="/view/category/ct216"><img alt="時計クロック" src="https://gigaplus.makeshop.jp/isplanning/images/i_clock2.jpg"><div class="textboxisp">時計</div></a></li>
			<li><a href="/view/category/ct231"><img alt="陶器、ガラス製品" src="https://gigaplus.makeshop.jp/isplanning/images/i_Ceramic2.jpg"><div class="textboxisp">陶器・ガラス</div></a></li>
			<li><a href="/view/category/ct246"><img alt="キッチン用品" src="https://gigaplus.makeshop.jp/isplanning/images/i_kitchen2.jpg"><div class="textboxisp">キッチン</div></a></li>
			<li><a href="/view/category/ct261"><img alt="タオル類" src="https://gigaplus.makeshop.jp/isplanning/images/i_taoru2.jpg"><div class="textboxisp">タオル</div></a></li></ul>

<ul class="page_scene">
			<li><a href="/view/category/ct276"><img alt="バス、お風呂関係" src="https://gigaplus.makeshop.jp/isplanning/images/i_spa3.jpg"><div class="textboxisp">バス・お風呂</div></a></li>
			<li><a href="/view/category/ct291"><img alt="傘" src="https://gigaplus.makeshop.jp/isplanning/images/i_umbrella2.jpg"><div class="textboxisp">傘 カサ</div></a></li>
			<li><a href="/view/category/ct306"><img alt="防災グッズ" src="https://gigaplus.makeshop.jp/isplanning/images/i_bousai2.jpg"><div class="textboxisp">防災グッズ</div></a></li>
			<li><a href="/view/category/ct321"><img alt="食品" src="https://gigaplus.makeshop.jp/isplanning/images/i_food2.jpg"><div class="textboxisp">食品</div></a></li></ul>

<ul class="page_scene">
			<li><a href="/view/category/ct336"><img alt="日用品" src="https://gigaplus.makeshop.jp/isplanning/images/i_tissue2.jpg"><div class="textboxisp">日用品</div></a></li>
			<li><a href="/view/category/ct351"><img alt="ギフト詰め合わせ" src="https://gigaplus.makeshop.jp/isplanning/images/i_gift2.jpg"><div class="textboxisp">ギフト詰合せ</div></a></li>
			<li><a href="/view/category/ct366"><img alt="イベント用抽選セット" src="https://gigaplus.makeshop.jp/isplanning/images/i_event2.jpg"><div class="textboxisp">イベント・抽選</div></a></li>
			<li><a href="/view/category/ct381"><img alt="あぶら取り紙" src="https://gigaplus.makeshop.jp/isplanning/images/i_blotting_paper2.jpg"><div class="textboxisp">あぶら取紙</div></a></li></ul>

<ul class="page_scene">
			<li><a href="/view/category/ct469"><img alt="自転車" src="https://gigaplus.makeshop.jp/isplanning/images/i_bicycle2.jpg"><div class="textboxisp">自転車</div></a></li>
			<li><a href="/view/category/ct411"><img alt="その他" src="https://gigaplus.makeshop.jp/isplanning/images/i_etc2.jpg"><div class="textboxisp">その他</div></a></li>
<li><a href="/view/category/ct667"><img alt="数量選択可能" src="https://gigaplus.makeshop.jp/isplanning/images/i_unit.png"><div class="textboxisp">数量選択可能</div></a></li>
<li><a href="/view/category/ct662"><img alt="マスク" src="https://gigaplus.makeshop.jp/isplanning/images/i_mask.jpg"><div class="textboxisp">マスク・除菌類</div></a></li></ul>

<ul class="page_scene">
<li><a href="/view/category/ct659"><img alt="感謝の言葉入り" src="https://gigaplus.makeshop.jp/isplanning/images/i_thankyou.jpg"><div class="textboxisp">感謝の言葉入り粗品</div></a></li>
<li><a href="/view/category/ct474"><img alt="女性向粗品" src="https://gigaplus.makeshop.jp/isplanning/images/i_women-1.jpg"><div class="textboxisp">女性向き粗品</div></a></li>
<li><a href="/view/category/ct488"><img alt="アニマルグッズ" src="https://gigaplus.makeshop.jp/isplanning/images/i_animal-1.jpg"><div class="textboxisp">アニマルグッズ</div></a></li>
<li><a href="/view/category/ct502"><img alt="子供向け" src="https://gigaplus.makeshop.jp/isplanning/images/i_children-1.jpg"><div class="textboxisp">お子さま向け粗品</div></a></li></ul>

<ul class="page_scene">
<li><a href="/view/category/ct81"><img alt="和柄" src="https://gigaplus.makeshop.jp/isplanning/images/i_wagara2-1.jpg"><div class="textboxisp">和柄の粗品</div></a></li>
<li><a href="/view/category/ct516"><img alt="ライト類" src="https://gigaplus.makeshop.jp/isplanning/images/i_light-1.jpg"><div class="textboxisp">ライト類の粗品</div></a></li>
<li><a href="/view/category/ct530"><img alt="タンブラー" src="https://gigaplus.makeshop.jp/isplanning/images/i_tumbler-1.jpg"><div class="textboxisp">タンブラーの粗品</div></a></li>
<li><a href="/view/category/ct544"><img alt="ボトル" src="https://gigaplus.makeshop.jp/isplanning/images/i_bottle-1.jpg"><div class="textboxisp">ボトルの粗品</div></a></li></ul>

<ul class="page_scene">
<li><a href="/view/category/ct558"><img alt="掃除グッズ" src="https://gigaplus.makeshop.jp/isplanning/images/i_clean-1.jpg"><div class="textboxisp">掃除グッズ</div></a></li>
<li><a href="/view/category/ct572"><img alt="パソコン関係" src="https://gigaplus.makeshop.jp/isplanning/images/i_pc-1.jpg"><div class="textboxisp">パソコングッズ</div></a></li>
<li><a href="/view/category/ct428"><img alt="カラーが選べる粗品" 
src="https://gigaplus.makeshop.jp/isplanning/images/i_color-1.jpg"><div class="textboxisp">カラーが選べる粗品</div></a></li>
<li><a href="/view/category/ct653"><img alt="オリジナル印刷できる商品" src="https://gigaplus.makeshop.jp/isplanning/images/i_original-1.jpg"><div class="textboxisp">オリジナル印刷商品</div></a></li></ul>

<ul class="page_scene">
<li><a href="/view/category/ct655"><img alt="石鹸、石鹸セット" src="https://gigaplus.makeshop.jp/isplanning/images/i_soap-1.jpg"><div class="textboxisp">石鹸・石鹸セット</div></a></li>
<li><a href="/view/category/ct646"><img alt="卓上カレンダー" src="https://gigaplus.makeshop.jp/isplanning/images/i_calendar.jpg"><div class="textboxisp">卓上カレンダー</div></a></li>
</ul>
</div>
</div>

<div id="tab-content3" class="tab-content">
<!--<div class="Review">
	
			<h4>この商品のレビュー</h4>
			
			<a href=>［レビューを書きこむ］</a>
		</div>

		<div class="M_section">
			<div class="review-container" data-gname="<{$item.system_code}>" data-pid="<{$item.system_code}>" data-group="true" data-action="widget"></div>
		</div>
</div>-->

<div class="review-container" data-gname="<{$item.system_code}>" data-pid="<{$item.system_code}>" data-group="true" data-action="widget"></div>
<style>
.reviewWidget_inner > div,
.singleReview_body *{
    text-align: left;
}
</style>

</div>
</div>
</div><!-- /.tab-area -->

    </div><!-- /.M_mainContents -->
  </div><!-- /#O_container -->
</div><!-- /#wrapper -->
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
</main>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
