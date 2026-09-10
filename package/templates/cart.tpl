<{* ==========================================================================
     買い物カゴ — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_basketpage.txt のままで、タグとURLだけ
     置き換えています。class も id も並び順も変えていません。
   ========================================================================== *}>
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
    <div class="M_mainContents" id="M_basket">

<h2>買い物かご</h2>
<!--<a href="/view/news/20260728033258"><div class="closed">休業日のお知らせ：8月8日（土）～8月16日（日）まで休業となります。</a></div>-->
<!--<div class="closed">休業日のお知らせ：5月29日（水）～5月6日（水）まで休業となります。</a></div>-->
	<p class="M_alignL">数量を変更する時は数量入力後、<em>修正ボタン</em>をクリックしてください。</p>

	    <div class="section" id="r_basket">
        <table id="basketTable">
        <tr>
            <th colspan="3">商品情報</th>
            <th>数量</th>
            <th>価格</th>
            <th></th>
        </tr>
        <{if $cart.has_item}>
<{section name=i loop=$cart.list}>
        <tr>
            <td class="basketNum"><{$cart.list[i].num}></td>
            <td class="basketImg"><a href="<{$cart.list[i].url}>"><img src="<{$cart.list[i].image_S}>" alt="<{$cart.list[i].name}>" border="0"></a></td>
            <td class="basketName">
                <p><a href="<{$cart.list[i].url}>"><{$cart.list[i].name}></a></p>
                <{if $cart.list[i].special_display}><p class="red"><{$cart.list[i].special_display}></p><{/if}>
                <{if $cart.list[i].selected_option.has_item}>
                <div class="basketOption">
                  <{section name=o loop=$cart.list[i].selected_option.list}><{$cart.list[i].selected_option.list[o].title}>：<{$cart.list[i].selected_option.list[o].option_name}> <{/section}>
                </div>
                <{/if}>
                <{if $cart.list[i].name_print.has_item}>
                <div class="basketOption">
                  <{section name=np loop=$cart.list[i].name_print.list}><{$cart.list[i].name_print.list[np].title}>：<{$cart.list[i].name_print.list[np].name}><br><{/section}>
                </div>
                <{/if}>
            </td>
            <td class="basketQuantity">
                <div class="quantityWrap">
                    <div class="quantityInput">
                        <input type="number" inputmode="numeric" min="1"
                               id="<{$cart.list[i].quantity_id}>" data-id="<{$cart.list[i].quantity_id}>"
                               value="<{$cart.list[i].quantity}>">
                    </div>
                    <div class="quantityAmend"><a href="<{$cart.list[i].quantity_url}>">修正</a></div>
                </div>
            </td>
            <td class="basketPrice"><{$cart.list[i].total_price}>円</td>
            <td class="basketBtns">
                <a href="<{$cart.list[i].remove_url}>"><img src="https://gigaplus.makeshop.jp/isplanning/images/del.png" alt="削除"></a>
            </td>
        </tr>
<{/section}>
        <tr>
            <td colspan="6" class="basketTotal">
                <p class="haisou_txt"><{$cart.free_shipping_message}></p>
                <dl class="totalWrap">
                    <dt class="totalItem">合計金額：</dt>
                    <dd class="totalPrice"><em><{$cart.total_price}> <span>(税込)</span></em></dd>
                </dl>
            </td>
        </tr>
<{else}>
        <tr>
            <td colspan="6" class="basketEmpty">
            <p>買い物かごに商品がありません</p>
            </td>
        </tr>
<{/if}>  
        </table> 

        <div class="btnWrap clear">
            <div class="btnBack">
                <a href="<{$url.top}>">買い物を続ける</a>
                
            </div>
            <div class="btnOrder">
                <a href="<{$cart.order_url}>">ご購入手続きへ進む</a>
                <{if $amazonpay.is_enabled}><p class="amazonButtonWrap"><{$amazonpay.button_html}></p><{/if}>
            </div>
        </div>
    </div>

	
 

<p><a class="basketbtn_04" href="/shop/enq202208200" target="_blank" rel="noopener">買い物かごの商品について、購入の前に見積もりを依頼をする場合はこちらからどうぞ</a></p>

<!--<img src="https://gigaplus.makeshop.jp/isplanning/uploads/Closed3.png" style="margin:25px 0; ">-->

<div class="flamenyuka2"><span class="flamenyuka-title">■配達日に関しまして</span>
<p>昨今の物量の増加に伴い、配達日の延滞が起こりえます。<br>特にご使用前日、当日の着日指定は避けて頂いた方がよろしいかと思います。<br>
尚、配達延滞における補償等は一切ございませんのでご了承の上ご利用お願いいたします。</p>
</div>

<div class="flamenyuka2"><span class="flamenyuka-title">■送料について</span>
<p>1回のご注文で800円(税別)。合計30000円（税別）以上で送料無料（北海道・沖縄・離島は別途1ケース毎に送料や中継料が必要となります、画面上送料が表示されますが2ケース以上の場合はお安くできる場合もございます、正式には自動送信メール以降の2通目のメールをご確認ください、また事前にお見積り依頼をいただけましたら正確な料金をお伝えすることが出来ます）</p>
</div>

<div style="margin:25px 0; text-align: left;">
<p><a class="btn_design" href="/view/guide#about_payment">送料、お支払い方法などショッピングガイドはこちらからどうぞ</a></p>
</div>
<div style="margin:25px 0; text-align: left;">
<p><a class="btn_design" href="/view/page/page2.html">名入れ、包装、のし　について</a></p>
</div>
<div style="margin:25px 0 40px 0; text-align: left;">
<p><a class="btn_design" href="/shop/enq202208200" target="_blank" rel="noopener">買い物かごの商品について、見積もりを依頼する</a></p>
</div>
<img src="https://gigaplus.makeshop.jp/isplanning/uploads/tax12.png">


	<!--▼最近チェックした商品-->
	<{if $recently_item.has_item}>
	<div id="M_recent">
	<h3>最近チェックした商品</h3>
	<table id="recent"><tr><{section name=rc loop=$recently_item.list}><{if $smarty.section.rc.index == 0}><{elseif $smarty.section.rc.index % 4 == 0}></tr><tr><{else}><td class="line"><img height="100" width="4" border="0" src="https://shop1-makeshop.akamaized.net/images/01/mk_main_p_line.gif"></td><{/if}><td class="itemBox"><table width="100%"><tr><td height="100" class="itemImg"><a href="<{$recently_item.list[rc].url}>"><img alt="<{$recently_item.list[rc].name}>" src="<{$recently_item.list[rc].image_S}>" border="0" width="220"></a></td></tr><tr><td><p class="name"><a href="<{$recently_item.list[rc].url}>"><{$recently_item.list[rc].name}></a></p><p class="price"><{$recently_item.list[rc].price|number_format}>円（税込）</p></td></tr></table></td><{/section}></tr></table>
	</div>
	<{/if}>

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
