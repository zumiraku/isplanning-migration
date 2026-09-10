<{* ==========================================================================
     トップ — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_mainpage.txt のままで、タグとURLだけ
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

<div class="slider">
<{$shop.mainvisual}>
</div>

<div id="wrapper">
  <div id="O_container">
    <{$module.leftmenu}>
    <div class="M_mainContents">

<div class="first-txt">
	<h3>企業様やお店様に欠かせない、粗品や景品を多種多彩に掲載販売</h3>
	<p class="mb15">発見マーケットでは、企業様やお店様に欠かせない、粗品や景品を多種多彩に掲載販売しております。<br>
粗品のご購入数量や名入れ等柔軟に対応いたしますので、ご不明な点やご質問はご遠慮なくお問い合わせください。<br>
名入れが可能な商品も豊富に取り揃えており、ターゲットの心を掴む魅力的な粗品をお探しの方におすすめです。</p>
<p>また、包装やのし紙も各商品ページに「可能」「不可」の表示もしておりますので、ご必要に応じご検討、お気軽にお問い合わせください。<br>
包装１個＠50円（税別）　のし１個＠20円（税別）。<br>
商品が入荷待ちや品切れの場合もございますのでその場合はご了承くださいませ。</p>
</div>

	<!--おしらせ-->
	<div class="section" id="info">
		<div>
			<h2 class="top-news-ttl">お知らせ<a class="link_green-bg news-link" href="<{$url.news}>">お知らせの一覧</a></h2>
			<div class="top-news-wrap">
				<{section name=nw loop=$latest_news.list}>
<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td width="80" class="woong" height="22" valign="top">[<{$latest_news.list[nw].date.year}>/<{$latest_news.list[nw].date.month}>/<{$latest_news.list[nw].date.day}>]</td>
  <td class="woong" valign="top"><a href="<{$latest_news.list[nw].url}>"><{$latest_news.list[nw].title}></a></td>
</tr></table>
<{/section}>
<{* ※ お知らせの枠の「底」を落としていました（2026-09-10 実測）

     現行はお知らせの一覧のあとに、角丸の下辺が入ります。

       <td class="line" width="5" height="5"><img src="/images/left_edge.gif"></td>
       <td class="line" height="5">&nbsp;</td>
       <td class="line" width="5" height="5"><img src="/images/right_edge.gif"></td>

     画像名の突き合わせで left_edge.gif と right_edge.gif が
     **1枚 → 0枚** と出ました。枠の下だけが開いて見えます。 *}>
<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td class="line" width="5" height="5"><img src="/images/left_edge.gif"></td>
  <td class="line" height="5">&nbsp;</td>
  <td class="line" width="5" height="5"><img src="/images/right_edge.gif"></td>
</tr></table>
<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td class="line" height="7" bgcolor="#ffffff">&nbsp;</td>
</tr></table>
			</div>
		</div>
	</div>	
		
	
	
<div id="O_mainLeft">

<h2 class="main-ttl">今人気の粗品・景品！</h2>
<p><a href="/view/category/ct22"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_summer.jpg" width="100%" alt="熱中症対策の粗品" /><br>暑さ・熱中症対策　夏の粗品販売ページ</a></p> 

<ul class="O_mainBnr M_mgnT10">
<li><a href="/view/category/ct29"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_keirou2.jpg" alt="敬老の日" /><br>敬老の日の粗品</a></li>
<li class="none"><a href="/view/category/ct30"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_halloween2.jpg" alt="ハロウィン" /><br>ハロウィンの粗品</a></li>
<li><a href="/view/category/ct306"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_disaster2.jpg" alt="防災" /><br>防災に役立つ粗品です</a></li>
<li class="none"><a href="/view/category/ct667"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_unit2.jpg" alt="少量購入" /><br>ロット単位では多すぎる・・</a></li>
<li><a href="/view/category/ct659"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_thankyou2.jpg" alt="感謝の言葉" /><br>感謝の言葉入りの粗品です</a></li>
<li class="none"><a href="/view/category/ct428"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_color2.jpg" alt="色柄選択可能" /><br>色柄選択可能な商品</a></li>
<li><a href="/view/category/ct261"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_towel2.jpg" alt="タオル" /><br>定番粗品のハンドタオル！</a></li>
<li class="none"><a href="/view/category/ct126"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_leisure2.jpg" alt="アウトドア" /><br>レジャー・アウトドア</a></li>
<li><a href="/view/category/ct488"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_animal2.jpg" alt="アニマルグッズ" /><br>かわいい人気のアニマルグッズ</a></li>
<li class="none"><a href="/view/category/ct111"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_sdgs2.jpg" alt="エコロジー" /><br>好評のエコロジーグッズ</a></li>
<li><a href="/view/category/ct246"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_kitchen.jpg" alt="キッチングッズ" /><br>役立つキッチングッズ</a></li>
<li class="none"><a href="/view/category/ct156"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_stationery.jpg" alt="ステーショナリー" /><br>ステーショナリーの粗品</a></li>
<li><a href="/view/category/ct544"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_bottle2.jpg" alt="ボトルの粗品" /><br>名入れに最適素敵なボトル</a></li>
<li class="none"><a href="/view/category/ct51"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_healing.jpg" alt="癒し健康" /><br>癒し健康におすすめ粗品</a></li>
<li class="none"><a href="/view/category/ct661"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_ecobag2.jpg" alt="エコバッグ" /><br>レジ袋削減に畳めるバッグ</a></li>
<li><a href="/view/category/ct186"><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_character2.jpg" alt="キャラクター" /><br>いろいろありますキャラクターグッズ</a></li>
</ul>

<div class="text_box_fv">
<p>発見マーケットでは、企業様やお店様に欠かせない、粗品や景品を多種多彩に掲載販売しております。粗品のご購入数量や名入れ等柔軟に対応いたしますので、ご不明な点やご質問はご遠慮なくお問い合わせください。名入れが可能な商品も豊富に取り揃えており、ターゲットの心を掴む魅力的な粗品をお探しの方におすすめです。</p>
<p>また、包装やのし紙も各商品ページに「可能」「不可」の表示もしておりますので、ご必要に応じご検討、お気軽にお問い合わせください。包装1個＠50円税別、熨斗（のし）1個＠20円（税別）。商品が入荷待ちや品切れの場合もございますのでその場合はご了承くださいませ。</p>
</div>

<!--#O_mainLeft--></div>

	<!--ランキング-->
	<{if $ranking_item.has_item}>
	<div class="section rank-list index-rank" id="r_ranking">
        <h2 class="main-ttl">人気ランキング<span>粗品の現在の人気順位です、参考にご検討ください。</span></h2>
		<div class="rank-wrap">
        <ul class="clear rank-list">
        <{section name=r loop=$ranking_item.list max=5}>
        <li class="rankList" id="rank<{$smarty.section.r.index_next}>">
            <em><{$smarty.section.r.index_next}></em>
            <div class="rankImg"><a href="<{$ranking_item.list[r].url}>"><img src="<{$ranking_item.list[r].image_M}>" alt="<{$ranking_item.list[r].name}>" width="100" border="0"></a></div>
            <div class="rankDetail">
            	<p class="rankName"><a href="<{$ranking_item.list[r].url}>"><{$ranking_item.list[r].name}></a></p>
            	<p class="rankPrice"><{$ranking_item.list[r].price|number_format}>円（税込）</p>
            </div>
        </li>
<{/section}>
        </ul>
		</div>
	</div>
    <{/if}>


<div class="M_section clear" id="r_new">
<h2 class="main-ttl">新着商品<span>最近追加の粗品をピックアップ、下記は一例です。</span><a class="link_green-bg linkbar" href="<{$url.top}>">新着商品一覧はこちら</a></h2>
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<{section name=nw2 loop=$new_item.list max=16}>
  <{if $smarty.section.nw2.index > 0 and $smarty.section.nw2.index % 4 == 0}></tr><tr><{/if}>
  <td align="center" class="lims" width="25%" valign="top">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" height="80">
      <tr><td align="center" class="M_displayImg">
        <a href="<{$new_item.list[nw2].url}>"><img src="<{$new_item.list[nw2].image_S}>" border="0" alt="<{$new_item.list[nw2].name}>" width="220" height="220"></a>
      </td></tr>
      <tr class="woong"><td valign="top" align="center">
        <a href="<{$new_item.list[nw2].url}>"><{$new_item.list[nw2].name}></a>
        <{if $new_item.list[nw2].icon.has_item}>
          <{section name=nw2i loop=$new_item.list[nw2].icon.list}><img src="<{$new_item.list[nw2].icon.list[nw2i].image_url}>" align="absmiddle" border="0"><{/section}>
        <{/if}>
      </td></tr>
      <tr class="woong"><td valign="top" align="center"><{$new_item.list[nw2].price|number_format}>円（税込）</td></tr>
      <{* ※ 4行目が丸ごと抜けていました（実測・2026-09-10）

           現行のタイルは4行です。最後の行は**その商品の基本カテゴリーへの
           リンク**で、角かっこ付きの太字です。

             <tr height="20" class="woong"><td valign="top" align="center">
               <a href="/view/category/ct6"><b>[50円～99円]</b></a>
             </td></tr>

           現行と移植版の文言を突き合わせて出ました。
           [50円～99円] [100円～199円] [200円～299円] [300円～399円]
           [1000円～1499円] の5種類が、移植版に1つもありませんでした。
           トップの新着16件と定番12件、全部のタイルに付いています。 *}>
      <tr height="20" class="woong"><td valign="top" align="center">
        <a href="<{$new_item.list[nw2].base_category.url}>"><b>[<{$new_item.list[nw2].base_category.name}>]</b></a>
      </td></tr>
    </table>
  </td>
<{/section}>
</tr></table>
</div>

<div class="M_section" id="r_recommend">
<h2 class="main-ttl">定番（人気）の商品<span>人気粗品のご紹介、下記は一例です。販売単位数量はほとんどの商品でご相談可能です。</span></h2>
<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<{section name=rc loop=$recommend_item.list max=12}>
  <{if $smarty.section.rc.index > 0 and $smarty.section.rc.index % 4 == 0}></tr><tr><{/if}>
  <td align="center" class="lims" width="25%" valign="top">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" height="80">
      <tr><td align="center" class="M_displayImg">
        <a href="<{$recommend_item.list[rc].url}>"><img src="<{$recommend_item.list[rc].image_S}>" border="0" alt="<{$recommend_item.list[rc].name}>" width="220" height="220"></a>
      </td></tr>
      <tr class="woong"><td valign="top" align="center">
        <a href="<{$recommend_item.list[rc].url}>"><{$recommend_item.list[rc].name}></a>
        <{if $recommend_item.list[rc].icon.has_item}>
          <{section name=rci loop=$recommend_item.list[rc].icon.list}><img src="<{$recommend_item.list[rc].icon.list[rci].image_url}>" align="absmiddle" border="0"><{/section}>
        <{/if}>
      </td></tr>
      <tr class="woong"><td valign="top" align="center"><{$recommend_item.list[rc].price|number_format}>円（税込）</td></tr>
      <{* ※ 4行目が丸ごと抜けていました（実測・2026-09-10）

           現行のタイルは4行です。最後の行は**その商品の基本カテゴリーへの
           リンク**で、角かっこ付きの太字です。

             <tr height="20" class="woong"><td valign="top" align="center">
               <a href="/view/category/ct6"><b>[50円～99円]</b></a>
             </td></tr>

           現行と移植版の文言を突き合わせて出ました。
           [50円～99円] [100円～199円] [200円～299円] [300円～399円]
           [1000円～1499円] の5種類が、移植版に1つもありませんでした。
           トップの新着16件と定番12件、全部のタイルに付いています。 *}>
      <tr height="20" class="woong"><td valign="top" align="center">
        <a href="<{$recommend_item.list[rc].base_category.url}>"><b>[<{$recommend_item.list[rc].base_category.name}>]</b></a>
      </td></tr>
    </table>
  </td>
<{/section}>
</tr></table>
</div>

<div class="M_section">	
	<div class="bgbeige">
		<h4>粗品販売・粗品の名入れ注文なら、<br><span class="green">季節に合わせた粗品</span>が揃う発見マーケット</h4>
<p><a href="/view/page/page5.html">季節で選ぶ</a></p>
		<p>粗品や景品をお探しなら発見マーケットにお任せください！ <br>シーズンに合わせた粗品・ノベルティグッズを種類豊富にご紹介しております。</p>
		<ul class="season-list">
			<li>
				<img src="https://gigaplus.makeshop.jp/isplanning/images/top-spring-icon.png" alt="春">
				<h5>春向け商品</h5>
				<p>春には母の日やバレンタインデーに最適な商品をご紹介しております。 女性が喜ぶバッグやポーチ、おふろグッズなどが人気です。</p>
				<a href="/view/category/ct19" class="link_green season-list-link">一覧はこちら</a>
			</li>
			<li>
				<img src="https://gigaplus.makeshop.jp/isplanning/images/top-summer-icon.png" alt="夏">
				<h5>夏向け商品</h5>
				<p>定番のうちわや扇子、風鈴、アウトドアグッズなど、夏に必要不可欠なアイテムを多数ご用意しております。 熱中症対策に嬉しいグッズもご好評頂いております。</p>
				<a href="/view/category/ct22" class="link_green season-list-link">一覧はこちら</a>
			</li>			
			<li>
				<img src="https://gigaplus.makeshop.jp/isplanning/images/top-autumn-icon.png" alt="夏">
				<h5>秋向け商品</h5>
				<p>秋には敬老の日など、ご年配の方に嬉しい商品がおすすめです。 ブランケットやタンブラー、健康グッズを贈ってみてはいかがでしょうか。</p>
				<a href="/view/category/ct28" class="link_green season-list-link">一覧はこちら</a>
			</li>			
			<li>
				<img src="https://gigaplus.makeshop.jp/isplanning/images/top-winter-icon.png" alt="夏">
				<h5>冬向け商品</h5>
				<p>クリスマスやお正月、掃除グッズなどの商品が人気です。 名入れの卓上カレンダーはノベルティグッズでも特に人気のアイテムとなっております。</p>
				<a href="/view/category/ct31" class="link_green season-list-link">一覧はこちら</a>
			</li>
		</ul>
		<p class="mb10">その他、スマホグッズやボールペンなど、粗品・ノベルティの定番アイテムも多数取揃えております。 名入れ注文でさら特別感を出すことが出来ますので、そちらも合わせてご活用ください。</p>
		<p class="mb0">粗品・景品・ノベルティをお考えの方に、エスピーソースのカタログを無料でご提供しております。 ご不明点等ございましたら、どうぞお気軽にお問合せください。</p>
	</div>	
</div>
	

<div class="M_section">	
	<div class="bgbeige">
		<h4><span class="green">粗品（名入れ）をお探し</span>なら発見マーケットの通販</h4>
		<p class="mb10">粗品を通販でお求めなら、当店をご利用ください。人気を集めているスマホの便利グッズの通販を行っております。スマートフォンやタブレットの持ち運びに便利なケース、スマートフォンや貴重品を水滴から守るモバイルケースなど、多様なスマホグッズをご用意しています。</p>
		<p class="mb10">スマホグッズの他に、季節で選べる粗品、景品もおすすめです。粗品のご利用シーンや必要とされている品物に合わせてお探し頂けますので、会社や店舗の販売促進にぜひご利用ください。</p>
		<p class="mb10">粗品は実用品として活用できるものを選ぶことがポイントです。粗品には、チラシなどのような単純な宣伝にはない魅力があります。 粗品の定番の名入れのタオルも、日々の生活に欠かせない実用品ですので、企業名やサービス名を目にする機会が単純な宣伝よりも多くなります。 発見マーケットでは実用的な粗品を幅広く取り揃えておりますので、ぜひブランディングにお役立てください。</p>
		<p>またSP SOURCE（エスピーソース）のカタログへの名入れも承っておりますので、お気軽にお見積もりください。 粗品をお求めの際は、2000年のオープン以来、22年間の粗品の販売実績がございます【発見マーケット】の通販をぜひご活用ください。</p>
		<a href="/view/page/page4.html" class="link_green top-naire-link">SP SOURCE（エスピーソースカタログ）名入れのご案内はこちら </a>
	</div>	
</div>
	
<div class="M_section mb70">	
	<div class="bgbeige">
		<h4>ノベルティや粗品の商品は<span class="green">様々なシーンで</span></h4>
		<p class="mb10">粗品は、営業の挨拶まわりやイベント参加のお礼の品としてなど様々なシーンで活用されます。また、ノベルティは実用性が高いものであれば長く使用され、商品名や広告ロゴを多くの人に見られる機会が増える可能性があります。開店祝いやイベントには、お店のスタイルやイメージが伝わるような粗品がおすすめです。</p>
		<p>発見マーケットでは、実用的な粗品・ノベルティグッズを豊富に取り揃えています。粗品やノベルティの名入れ・ご入数のご相談は、お気軽にお問い合わせください。</p>
		<a href="/view/page/page8.html" class="link_green top-naire-link">シーンで選ぶ粗品一覧はこちら</a>
	</div>	
</div>
	
	

	
	
	
<!--最近チェックした商品-->
	<{if $recently_item.has_item}>
    <div class="M_section" id="r_recent">
		<h2 class="main-ttl">最近チェックした商品</h2>
        <table id="recent"><tr><{section name=rcn loop=$recently_item.list}><{if $smarty.section.rcn.index == 0}><{elseif $smarty.section.rcn.index % 4 == 0}></tr><tr><{else}><td class="line"><img height="100" width="4" border="0" src="https://shop1-makeshop.akamaized.net/images/01/mk_main_p_line.gif"></td><{/if}><td class="itemBox"><table width="100%"><tr><td height="100" class="itemImg"><a href="<{$recently_item.list[rcn].url}>"><img alt="<{$recently_item.list[rcn].name}>" src="<{$recently_item.list[rcn].image_S}>" border="0" width="220"></a></td></tr><tr><td><p class="name"><a href="<{$recently_item.list[rcn].url}>"><{$recently_item.list[rcn].name}></a></p><p class="price"><{$recently_item.list[rcn].price|number_format}>円（税込）</p></td></tr></table></td><{/section}></tr></table>
	</div>
    <{/if}>

<{* ※ フッターは .M_mainContents の**中**です

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
