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
     特定商取引法 — Creator Mode（本文部分）

     独自ページではなく専用のページ種別です。中身は変換済みの
     templates/creator/freepages/ordercontract.html と同一で、次を通っています。
       タグ整合 0件 / 本文無傷 / レスポンシブ 375・768・1440px 合格

     引渡し時期は「7日以内」。PC版10日以内・スマホ版7日以内の食い違いを
     山口様が確定されたものです（inventory/approved-content-changes.csv）。
     本文を意図して変えた、この案件で唯一の箇所です。法定表示なので
     テンプレートを触るときは必ずこの行を確認してください。
   ========================================================================== *}>

<h1 class="h-page">特定商取引法に基づく表示</h1>

<div class="table-scroll"><table class="table table">
		<tr>
			<th>販売業者</th>
			<td>アイエスプランニング株式会社　　<A href=/view/company>会社概要</a></td>
		</tr>
<TR>
        <TH>サイト名称</TH>
        <TD>粗品と景品の発見マーケット</TD>
      </TR>
		<tr>
			<th>運営統括責任者</th>
			<td>山口裕二</td>
		</tr>
		<tr>
			<th>所在地</th>
			<td>〒581-0014<br />大阪府八尾市中田4-132-3</td>
		</tr>
		<tr>
			<th>電話番号</th>
			<td>072-970-6710</td>
		</tr>
		<tr>
			<th>メールアドレス</th>
			<td>isp@isp-sp.com</td>
		</tr>
		<tr>
			<th>適格請求書事業者登録番号</th>
			<td>T6122001024522</td>
		</tr>
		<tr>
			<th>営業時間</th>
			<td>10時～12時・13時～17時<br>
			お電話受付時間は、季節により変更となる場合がございます。</td>
		</tr>
		<tr>
			<th>定休日</th>
			<td>土・日・祝・年末年始・夏季休業日</td>
		</tr>
		<tr>
			<th>販売価格</th>
			<td>各商品詳細ページに税込価格で表示（一部税別表示）</td>
		</tr>
		<tr>
			<th>商品以外の必要代金</th>
			<td>
			・銀行振込でご購入の際の振込手数料<br>
			・送料（必要時）<br>
			・名入れ代（必要時）<br>
			・版代（必要時）<br>
			・包装代（必要時）<br>
			・のし代（必要時）<br>
			・代引手数料は無料です。（サンプル購入時等一部除く）
			</td>
		</tr>
		<tr>
			<th>申し込みの有効期限</th>
			<td>原則、受注確認（受注確認の為の自動送信メール発信）後、5日間とします。</td>
		</tr>
		<tr>
			<th>不良品</th>
			<td>商品到着日から7日間以内に生じました初期不良に付きましては交換もしくは不良数量分のご返金にて対応をいたします。先ずメール、FAXにてご連絡の程お願いいたします。</td>
		</tr>
		<tr>
			<th>販売数量</th>
			<td>特に指定はございません（商品によって設定あり）</td>
		</tr>
		<tr>
			<th>引き渡し時期</th>
			<td>
			ご注文受付後、7日以内にお届けいたします。<br>
			在庫切れはお客様確認後入荷次第発送。<br>
			（実質翌営業日～3日程で発送、名入れ・包装・のし商品等は都度ご案内いたします）<br>
			天候不順・配送業者の都合・その他何らかの理由により遅延する場合はメール等でお知らせいたします。<br>
			また、海外からの輸入事情・在庫数量・または運送上の事故等により、お約束の納期に遅れる場合があります。<br>
			メーカー品は都合上、急な製造打ち切りや、不慮の事故等もございますので、代替商品等でお願いいたします場合もございますのでご理解の程お願いいたします。
			</td>
		</tr>
		<tr>
			<th>お支払い方法</th>
			<td>
			銀行振込・代金引換<br>
			お振込みの場合はご入金確認後の出荷準備になります。<br>
			（利用予定銀行：三菱ＵＦＪ銀行）<br>
			代引きの場合、デビットカード（選択時）・クレジットカード（選択時）でのお支払いも可能です（佐川急便e-collect ）<br>
			代引きの場合、領収書は代金をお支払いと引き換えに佐川急便の配達ドライバーさんが発行いたしますので必ず受け取るようにお願いいたします。
		</td></tr>
		<tr>
			<th>お支払い期限</th>
			<td>
				<p>
				-銀行振込の場合<br>
				ご注文日より5日以内に当店指定の口座へお振込みください。（三菱ＵＦＪ銀行）<br>
				5日を超えた場合は一旦キャンセル扱いとさせていただきます。<br>
				再度、御注文いただきますようお願いします。
				</p>
				<p>
				-代金引換の場合<br>
				商品のお届け時に、佐川急便配達員に代金のお支払いをお願いします。
				</p>
			</td>
		</tr>
		<tr>
			<th>返品期限</th>
			<td>商品の返品・交換には初期不良、発送商品間違いの場合以外では応じられません。</td>
		</tr>
		<tr>
			<th>返品送料</th>
			<td>初期不良、発送商品間違いの場合、当店着払いにて対応いたします。
</td></tr></table></div></main>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
