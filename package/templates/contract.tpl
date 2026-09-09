<{* ==========================================================================
     特定商取引法 — ベーシックモードからの移植

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

<div class="company transaction">
	<h2>特定商取引に関する法律に基づく表示</h2>
	<table class="tbl01">
		<tr><th width="150">販売業者</th><td><{$contract.dealer}></td></tr>
		<tr><th width="150">運営統括責任者</th><td><{$contract.manager}></td></tr>
		<tr><th width="150">所在地</th><td><{$contract.address}></td></tr>
		<tr><th width="150">電話番号</th><td><{$contract.tel}></td></tr>
		<tr><th width="150">メールアドレス</th><td><{$contract.mail}></td></tr>
		<tr><th width="150">適格請求書事業者登録番号</th><td><{* 🔴 対応するタグがありません。現行の文言のままです *}>T6122001024522</td></tr>
		<tr><th width="150">営業時間</th><td><{* 🔴 対応するタグがありません。現行の文言のままです *}>10時～12時・13時～17時<br>お電話受付時間は、季節により変更となる場合がございます。</td></tr>
		<tr><th width="150">定休日</th><td><{* 🔴 対応するタグがありません。現行の文言のままです *}>土・日・祝・年末年始・夏季休業日</td></tr>
		<tr><th width="150">販売価格</th><td><{* 🔴 対応するタグがありません。現行の文言のままです *}>各商品詳細ページに税込価格で表示（一部税別表示）</td></tr>
		<tr><th width="150">商品以外の必要代金</th><td><{$contract.other_charge}></td></tr>
		<tr><th width="150">申し込みの有効期限</th><td><{$contract.expire_app}></td></tr>
		<tr><th width="150">不良品</th><td><{$contract.defective}></td></tr>
		<tr><th width="150">販売数量</th><td><{$contract.amount}></td></tr>
		<tr><th width="150">引き渡し時期</th><td><{$contract.receive_date}></td></tr>
		<tr><th width="150">お支払い方法</th><td><{$contract.pay_method}></td></tr>
		<tr><th width="150">返品期限</th><td><{$contract.expire_return}></td></tr>
		<tr><th width="150">返品送料</th><td><{$contract.return_charge}></td></tr>
	</table>
	<{* 🔴 現行サイトの表には「サイト名称」「適格請求書事業者登録番号」の
	     行もあります。リファレンスの14項目には無いので、管理画面の
	     どれかの欄に手で書き足されている可能性が高いです。
	     **プレビューで実物を見て、足りなければ追記します。** *}>
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
