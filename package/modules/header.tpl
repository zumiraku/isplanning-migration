<{* ==========================================================================
     header — ベーシックモードからの移植

     🔴 これは作り直しではありません。design_topmenu.txt の
        マークアップをそのまま持ってきて、タグとURLだけ置き換えたものです。
        class も id も並び順も変えていません。m_sys_common.css がそれらに
        当たっているためです。

        生成物です。直すときは tools/port/build-chrome.js を直してください。
   ========================================================================== *}>
<div id="wrap">    
        <div id="headerWrap">
			<div class="header-txt">
				<div class="h-txt-inner">
					<h1>粗品や景品、ノベルティの名入れ通販｜粗品のことなら発見マーケット</h1>
					<p class="shipping">30,000円(税別)以上で送料無料 <span>※離島除く／代引無料／名入れ代・版代・のし代・包装紙代除く</span></p>
				</div>
			</div>
            <div class="head_nav_contents">
            <div id="header">
                        <div class="head_contents">
							<div class="logo-box">
                            	<a href="<{$url.top}>"><img src="<{$shop.logo_url}>" class="M_ShopLogo" alt="<{$shop.name}>"></a>
							</div>
                            <div class="contents_center">
								<div id="h_logo">
									<!--ヘッダー支払情報-->
									<h2>2000年8月オープン！25年間の粗品の販売実績！と信頼</h2>
                            		<p>粗品の通販、粗品の名入れ 会社や店舗の販売促進にご利用下さい。<br>エスピーソースカタログ商品も通販で取り扱っております。</p>
                        		</div>
                            </div>
							<div class="contents_right">
								<!--ヘッダ小ナビゲーション-->
                            	<ul id="subNav" class="clearfix">
									<li id="subNav-guide"><a href="<{$url.guide}>">ご利用ガイド</a></li>
									<li id="subNav-member"><{if $member.is_logged_in}><a href="<{$url.mypage}>">マイページ</a><{elseif $shop.is_member_entry_enabled}><a href="<{$url.member_entry}>">新規会員登録</a><{/if}></li>
                               		<li id="subNav-login"><{if $member.is_logged_in}><a href="<{$url.logout}>">ログアウト</a><{else}><a href="<{$url.login}>">ログイン</a><{/if}></li>
                        			<li id="subNav-mypage"><a href="<{$url.support}>">お問い合わせ</a></li>
                            	</ul>
								<ul class="h-tel-wrap">
									<li class="h-tel">
										<p>072-970-6710</p>
										<span>平日10時～12時/13時～17時（土日祝休）</span>
									</li>
									<li><div class="M_headBasket" id="M_basketTemp1">
  <div id="M_headBasketSwitch">
    <div id="M_basketClosedBox">
      <a href="<{$url.cart}>" id="M_basket">
        <div class="M_basketMarginBox">買い物かご<{if $cart.has_item}> <em><{$cart.total_quantity}></em><{/if}></div>
      </a>
    </div>
    <div id="M_basketOpenedBox">
      <div class="M_basketMarginBox">
        <table>
          <{if $cart.has_item}>
            <{section name=hb loop=$cart.list}>
            <tr><td><{$cart.list[hb].name}></td><td><{$cart.list[hb].quantity}>点</td><td><{$cart.list[hb].total_price}>円</td></tr>
            <{/section}>
            <tr id="last-child"><td colspan="3"><a href="<{$cart.order_url}>">ご購入手続きへ進む</a></td></tr>
          <{else}>
            <tr id="last-child"><td colspan="3">カートに商品がありません。</td></tr>
          <{/if}>
        </table>
      </div>
    </div>
  </div>
</div></li>
								</ul>
							</div>
                        </div>
                    	<!---ナビゲーション-->
                   		<ul id="gNav" class="clear">
                        <li id="gNav01"><a href="<{$url.top}>">ホーム</a></li>
                        <li id="gNav02"><a href="/view/page/page5.html">季節で選ぶ</a></li>
                        <li id="gNav03"><a href="https://www.makeshop.jp/ssl/enquete/index.html?db=isplanning&form_code=201306270" Target="_blank">無料カタログ</a></li>
                        <li id="gNav04"><a href="/view/page/page4.html">エスピーソース</a></li>
                        <li id="gNav05"><a href="/view/category/ct667">少量購入OK</a></li>
                        <li id="gNav05"><a href="/view/category/ct4">予算で探す</a></li>
                        <li id="gNav06"><div class="search-box"><input type="text" id="MakeShopTopSearchInput" data-id="<{$search_form.keyword_id}>" placeholder="キーワードを入力して検索">
<a id="MakeShopTopSearchButton" href="<{$search_form.search_url}>" role="button" aria-label="検索"></a></div></li>
                    </ul>
                    </div>
                <!--//header--></div>
			
                     <div class="header_keyword">
						 <div class="key-inner">
							<h3>トレンドキーワード</h3>
							 <ul class="torend-key">
                                                                 <li><a href="/view/category/ct22">熱中症・暑さ対策</a></li>
                                                                 <li><a href="/view/category/ct29">敬老の日</a></li>
                                                                 <li><a href="/view/category/ct488">アニマルグッズ</a></li>
                                                                 <li><a href="/view/category/ct306">防災グッズ</a></li>
                                                                 <li><a href="/view/category/ct659">感謝の言葉入り</a></li>
                                                                 <li><a href="/view/category/ct261">タオル</a></li>
                                                                 <li><a href="/view/category/ct126">レジャーアウトドア</a></li>
                                                                 <li><a href="/view/category/ct667">数量選択可能</a></li>
							 </ul>
                     	</div>
					</div>
            <!--//headerWrap--></div>

 <div id="bgMain">
<!--<a href="/view/news/20221224030504"><div class="closed">ホームページリニューアルのお知らせ</a></div>-->
<!--<a href="/view/news/20260728033258"><div class="closed">休業日のお知らせ：8月8日（土）～8月16日（日）まで休業となります。</a></div>-->
<!--<div class="closed">休業日のお知らせ：4月29日（水）～5月6日（水）まで休業となります。</div>-->
<div class="closed"><a href="/view/guide#about_receipt">発見マーケットは<b>インボイス制度</b>に対応しております</a></div>
<button class="l-menu-toggle" type="button" aria-controls="M_leftContents" aria-expanded="false">
  <span class="l-menu-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>
  カテゴリーから探す
</button>
