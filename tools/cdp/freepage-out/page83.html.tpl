<{* ==========================================================================
     カテゴリー　バナー — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_（独自ページ）.txt のままで、タグとURLだけ
     置き換えています。class も id も並び順も変えていません。
   ========================================================================== *}>
<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>粗品と景品の発見マーケット　ISPLANNING</title>
<meta name="description" content="<{$page.description}>">
<link rel="canonical" href="<{$page.canonical_url}>">
<meta property="og:type" content="website">
<meta property="og:title" content="粗品と景品の発見マーケット　ISPLANNING">
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

<div class="PageArea">
<h2 style="margin:0 0 80px 0;">粗品・景品の発見マーケット　カテゴリー　バナー</h2>

<ul class="categotybanner">
<div class="sample3">
<li><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_unit3.png" alt="数量選択可能"></li><a href="/view/category/ct667"><div class="mask"><div class="caption">ロット単位で多すぎる場合は、<br>数量選択可能商品ページでご検討ください</div></div></a></div>
<div class="sample4">
<li><img src="https://gigaplus.makeshop.jp/isplanning/images/seasonbanner5.svg" alt="季節で選ぶ"></li><a href="/view/page/page5.html"><div class="mask"><div class="caption">季節で選ぶ<br>粗品はこちら</div></div></a></div>
<div class="sample4">
<li><img src="https://gigaplus.makeshop.jp/isplanning/images/housounosiname.svg" alt="包装のし名入れ"></li><a href="/view/page/page2.html"><div class="mask"><div class="caption">粗品の包装・のし・<br>名入れもおまかせください</div></div></a></div>
</ul>

<ul class="categotybanner">
<div class="sample2"><li><img src="https://gigaplus.makeshop.jp/isplanning/images/seasonbanner7.png" alt="季節で選ぶ"></li><a href="/view/page/page5.html"><div class="mask"><div class="caption">季節で選ぶ<br>粗品はこちら</div></div></a></div>
<div class="sample2"><li><img src="https://gigaplus.makeshop.jp/isplanning/images/housounosiname3.png" alt="包装のし名入れ"></li><a href="/view/page/page2.html"><div class="mask"><div class="caption">粗品の包装・のし・<br>名入れもおまかせください</div></div></a></div>
</ul>

<ul class="categotybanner">
<div class="sample2"><li><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_sp_spring2.png" width="450" alt="春画像"></li><div class="mask"><div class="caption">春の粗品に最適な、母の日、バレンタインデー、<br>桜柄の景品をお探しの方は、<br>発見マーケットをご利用ください。<br>販売単位もご相談可能商品もございます。</div></div></div>
<div class="sample2"><li><img src="https://gigaplus.makeshop.jp/isplanning/images/main_bar_mothersday.jpg" width="450" alt="母の日画像"></li><div class="mask"><div class="caption">母の日に最適な粗品の販売ページです。カーネーションやバラをモチーフにした商品が人気です。バッグやポーチなどの小物、日傘やアームカバーなどの紫外線対策グッズなどもおすすめです。</div></div></div>
</ul>


</div>

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
