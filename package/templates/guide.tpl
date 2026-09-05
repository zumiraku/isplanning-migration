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

<{* ==========================================================================
     サイト共通ヘッダー — 検索・カート・会員導線・カテゴリメニュー
   ========================================================================== *}>
<div class="utilbar">
  <div class="container utilbar__inner">
    <span>30,000円(税別)以上で送料無料 ※離島除く／代引無料</span>
    <span>2000年8月オープン｜25年間の粗品販売実績</span>
    <nav class="utilbar__links" aria-label="会員メニュー">
      <a href="<{$url.guide}>">ご利用ガイド</a>
      <{if $member.is_logged_in}>
        <a href="<{$url.mypage}>">マイページ</a>
        <a href="<{$url.logout}>">ログアウト</a>
      <{else}>
        <{if $shop.is_member_entry_enabled}><a href="<{$url.member_entry}>">新規会員登録</a><{/if}>
        <a href="<{$url.login}>">ログイン</a>
      <{/if}>
    </nav>
  </div>
</div>

<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-logo" href="<{$url.top}>">
      <{if $shop.logo_url}><img src="<{$shop.logo_url}>" alt="<{$shop.name}>"><{else}><{$shop.name}><{/if}>
    </a>

    <{* 商品検索。$search_form.*_id はフォーム部品のIDを返すので、name属性
         ではなくこの値を使うこと。 *}>
    <form class="searchbox" action="<{$search_form.search_url}>" role="search">
      <label class="visually-hidden" for="<{$search_form.keyword_id}>">商品を検索</label>
      <input type="text" id="<{$search_form.keyword_id}>" placeholder="商品名・キーワードで探す">
      <button type="submit">検索</button>
    </form>

    <div class="site-header__contact"><b><{$shop.tel}></b>平日10時〜12時／13時〜17時</div>
    <div class="site-header__tools">
      <a class="cartlink" href="<{$url.cart}>">カート <b><{$cart.total_quantity}></b>点</a>
    </div>
  </div>

  <{* カテゴリメニュー。ベーシックモードの左サイドバーの中身で、
       スマホでは横に流れます。 *}>
  <{if $category_menu.has_item}>
  <nav class="meganav" aria-label="商品カテゴリー">
    <ul class="meganav__list container">
      <{section name=c loop=$category_menu.list}>
        <li class="meganav__item">
          <a href="<{$category_menu.list[c].url}>"><{$category_menu.list[c].name}></a>
          <{if $category_menu.list[c].child_category.has_item}>
            <div class="meganav__panel">
              <ul class="meganav__cols">
                <{section name=d loop=$category_menu.list[c].child_category.list}>
                  <li><a href="<{$category_menu.list[c].child_category.list[d].url}>"><{$category_menu.list[c].child_category.list[d].name}></a></li>
                <{/section}>
              </ul>
            </div>
          <{/if}>
        </li>
      <{/section}>
    </ul>
  </nav>
  <{/if}>
</header>

<main class="container">
<{* ==========================================================================
     利用案内 — Creator Mode（本文部分）

     独自ページではなく専用のページ種別です。中身は変換済みの
     templates/creator/freepages/info.html と同一で、次を通っています。
       タグ整合 0件 / 本文無傷 / レスポンシブ 375・768・1440px 合格
   ========================================================================== *}>

<h1 class="h-page">ご利用ガイド</h1>

<p>お買い物方法についてのご案内です。<br />お買い物をされる前に、一度目をお通し下さいませ。</p>

	<div id="O_guideAnchor">
		<ul class="notice tilegrid">
			<li><a href="#about_flow">買い物方法</a></li>
			<li><a href="#about_payment">お支払・送料について</a></li>
			<li><a href="#about_delivaly">お届けについて</a></li>
			<li><a href="#about_return">返品交換について</a></li>
			<li><a href="#about_receipt">納品書・領収書について</a></li>
		</ul>
	<div id="O_guideAnchor">
		<ul class="notice tilegrid">
			<li><a href="#about_receipt">インボイスについて</a></li>
		</ul>

	</div>

	<div id="about_flow">
	<h3 class="h-section">買い物方法</h3>

		<h4 class="h-sub">買い物カゴはＳＳＬで保護しておりますのでご安心の上ご利用ください。</h4>
		<p>ロット割れ・大量ご注文・名入れ・包装等は「買物カゴ・カート」ではご注文できませんのでメール・TEL・ＦＡＸにてご注文・見積を依頼してください。</p>
		<p>輸入・製造事情により若干のデザイン・色柄等が変わる場合があります。また、輸入諸事情により、ご注文確定後にお届け出来なくなる場合や、しばらくお待ちいただく場合もございます。
ご理解いただきまして、ご注文をお願いいたします。</p>
		<p class="u-alert">※買い物カゴ（カート）がご利用できない場合は(利用できない場合は直接 <a href="mailto:isp@isp-sp.com">Ｅメール</a>・ ＦＡＸ（072-970-6720）でご注文お願いいたします)。</p>
<p>商品の個別のお問合せは、各商品詳細ページの中の「この商品について問合せる」よりお願い致します。<br>
（商品名が自動で入りますので「この商品について問合せる」からの方が便利です）<br>
何種類かの商品のお問い合わせの時は、一度「買い物かご」にお入れいただき、買い物かご画面内の「買い物かごの商品について、見積もりを依頼する」をクリック頂きますと一度にお問い合わせが可能です。<br>
<a href="https://gigaplus.makeshop.jp/isplanning/images/isplanning_explanation.jpg" alt="商品詳細画面の説明・カゴ内説明画像" target="_blank"><span>商品詳細画面の説明・カゴ内説明画像</span></a>
</p>
<div>
	<div class="flow">
		<h4>STEP1</h4>
		<div><p>それぞれの商品が記載されているページにて、数量を記載していただき、＜カートへ入れる＞ボタンを押してください。買い物かごに一時登録されます。
		数量変更・注文削除は買い物カゴ（カート）の画面上でできます。</p></div>
	</div>
	<div class="flow">
		<h4>STEP2</h4>
		<div>
		<ul class="linklist">
			<li>ご注文情報入力・確認画面に移りますので、商品名と数量をご確認ください。</li>
			<li>数量変更・注文削除は買い物カゴ（カート）の画面上でできます。</li>
			<li>ご注文者情報・お届け先情報を画面に従い記載ください。</li>
			<li>お支払い方法をご選択ください。</li>
			<li>お振込みの場合はご入金確認後の出荷になります。</li>
			<li>配達希望日と時間帯をお選びください。</li>
			<li>時間指定は個人様宅宛のお届け時に指定出来ます</li>
			<li>指定時間帯は目安ですので保証するものではございません、運送会社の諸事情により前後した場合はお許しください。</li>
			<li>ご不在の場合、不在票が入る事があります、その際は、不在票記載の電話番号にご都合のよろしい日時をご連絡くださいませ。</li>
			<li>名入れ・包装・熨斗をご希望の場合選択、記載ください。</li>
			<li>その他、ご要望等ございましたら通信欄に記載ください。</li>
		</ul>
		</div>
	</div>
	<div class="flow">
		<h4>STEP3</h4>
		<div>
		<ul class="linklist">
			<li>送料、手数料、合計金額、および入力された内容をもう一度よくご確認の上、お間違いなければお進み下さい。</li>
		</ul>
		</div>
	</div>
	<div class="flow">
		<h4>STEP4</h4>
		<div>
		<ul class="linklist">
			<li>ご注文完了です。</li>
		</ul>
		<p class="u-alert">
		ご注文後間もなく、１通目の自動返信にて 内容確認のメールを送付致します。<br>
		この時点ではご注文は確定しておりません、後ほどの２通目のメールにて発送日・送料・代引き手数料等を含めました購入金額総合計等お知らせいたします。
		</p>
		<p class="u-alert note-kome">
		２通目メールは即日～３日程かかる場合があります。<br>
		この時点では、在庫等が未確認の場合がありますので、ご注文確定は次項の「本日発送しました」のメールをもって、確定とさせていただきます。
		</p>

		<ul class="linklist">
<li>代引きの場合
	<p>佐川急便　代金引き換え便にて発送いたします。
発送後「本日発送しました」の件名で発送済みメールをお送りさせていただきます。
このメールをお受け取りいただいた時点で、売買契約が交わされたものと見なします。
商品が到着しましたら、メールでお知らせしました金額をお支払いください。
この際に、デビットカード（選択時）・クレジットカード（選択時）（一部離島等ご利用できません）がご利用できます。
（商品が直送、別送の場合は「本日発送しました」メールはお送りいたしておりませんのでご了承ください）</p></li>
</ul>
	</div>
	</div>
</div>
</div>

<div id="about_payment">
	<h3 class="h-section">お支払・送料について</h3>

		<h4 class="h-sub">代金引換</h4>
		<p>【配送業者】佐川急便代引きサービス 　e-collect</p>
                     <p class="u-alert">代引き手数料は当社が負担いたします。（サンプルご購入時と特殊な場合を除く）</p>
		<ul class="linklist">
<li>代引き金額の上限は50万円未満（税込）となります。50万円以上のご注文は振り込みを選択願います。</li>
			<li>代引きの場合、領収書は領収書は、代金をお支払いと引き換えに
佐川急便の配達ドライバーさんが発行いたしますので必ず受け取るようにお願いいたします。</li>
			<li>配達時にご不在の場合、不在票が入る事があります、その際は不在票記載の電話番号にご都合の宜しい日時をご連絡下さいませ。</li>
			<li>離島の一部地域は代引きがご利用できない場合がございます。</li>
			<li>各ページに代引き手数料込みと掲載している物はその表示通りです。 </li>
			<li>正確な代引き手数料は後程のメールをご確認ください。（１通目は自動送信になりますので２通目にお送りするメールをご確認くださいませ）</li>
		</ul>

		<h4 class="h-sub">銀行振込</h4>
		<p>お振込みの場合はご入金確認後の出荷になります。</p>
<p>ご注文後10日間以内にお振込みが確認できない場合はご注文はキャンセルとさせて頂きます。</p>
		<ul class="linklist">
			<li>お振込み手数料はお客様ご負担でお願いいたします。（利用予定銀行：三菱ＵＦＪ銀行）</li>
			<li>お振込先・総合計金額は後ほどのメールをご確認ください。（１通目は自動送信になりますので２通目にお送りするメールをご確認くださいませ）</li>
			<li>お振込み人名義がご注文者と異なる場合は「通信欄」に記載お願いいたします。</li>
		</ul>

		<p class="u-alert">後日請求（お支払い）は現在一切行っておりませんのでご了承ください。</p>

		<h4 class="h-sub">送料全国一律送料800円（税別）北海道・沖縄・離島除く。</h4>
		<p class="u-alert">30,000円（税別）以上で送料無料！北海道・沖縄・離島除　（名入れ代・版代・包装代・のし代含まず）</p>
		<p class="u-alert">代引き手数料は当社負担します※買い物カゴでのご注文で代引きでお支払いの場合(サンプルご購入時と特殊な場合を除く)</p>
		<p class="u-alert">自転車は、１台毎に付・送料 1,500円（税別）を頂戴いたします。<br>（北海道・沖縄・離島は 2,700円（税別）～になります）</p>

		<ul class="linklist">
			<li>離島・北海道・沖縄の送料は別途ご連絡いたします。画面上送料が表示されますが数量や個数でお安くできる場合もございます（逆にお高くなる場合もございます）、お見積りご依頼いただきましたら正確にお伝えさせていただけます。</li>
			<li>各ページに送料を掲載している物は、その表示通りです。 </li>
			<li>個数に関係なく1回のご注文での運賃です。（北海道・沖縄・離島は除く）</li>
			<li>正確な送料は後程のメールをご確認ください。<br>（１通目は自動送信になりますので２通目にお送りするメールをご確認くださいませ）</li>
			<li>下記送料は消費税別になります。</li>
		</ul>

	<dl class="table">
		<dt>北海道 </dt>
		<dd>
			<p>1800円～（税別） </p>
			<span>1ケース毎に必要です、2ケース以上の場合お安くできる場合もございます。商品により送料は異なります。</span>
		</dd>
		<dt>東北
			<span>青森県、秋田県、岩手県、山形県、宮城県、福島県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>関東
			<span>東京都、千葉県、神奈川県、埼玉県、茨城県、群馬県、栃木県、山梨県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>信越
			<span>新潟県、長野県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>東海
			<span>愛知県、三重県、岐阜県、静岡県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>北陸
			<span>石川県、福井県、富山県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>関西
			<span>大阪府、奈良県、和歌山県、兵庫県、京都府、滋賀県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>中国
			<span>広島県、岡山県、島根県、山口県、鳥取県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>四国
			<span>香川県、愛媛県、高知県、徳島県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>九州
			<span>福岡県、佐賀県、大分県、長崎県、熊本県、宮崎県、鹿児島県</span>
		</dt>
		<dd>
			<p>800円（税別）</p>
			<span>（1回のご注文で）（30000円税別以上で無料）（名入れ代・版代・包装代・のし代含まず）</span>
		</dd>
		<dt>沖縄県</dt>
		<dd>
			<p>2500円～（税別）</p>
			<span>1ケース毎に必要です、2ケース以上の場合お安くできる場合もございます。商品により送料は異なります。</span>
		</dd>
		<dt>離島</dt>
		<dd>
			<span>別途、お見積もりさせて頂きます（画面上1ケース2700円（税別）で表示されますが多少前後する場合がございます）。新しく郵便番号が設定された地域は通常の送料が表示されます、後日離島の送料を加算いたしまして新たにご連絡させていただきます。離島地域の送料は後日修正させていただく場合がございます。お支払方法：代引きを選択いただきましても後日お振込みに変更のお願いをさせて頂く場合がございます。</span>
		</dd>
	</dl>

	<div class="table-scroll"><table class="table table">
		<thead>
			<tr>
				<th></th>
				<th>送料(税込)</th>
				<th>手数料</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<th>振込</th>
				<td><span class="note-kome">880円</span></td>
				<td>振込手数料お客様ご負担</td>
			</tr><tr>
				<th>代引き</th>
				<td><span class="note-kome">880円</span></td>
				<td class="u-alert u-bold">代引き手数料無料</td>
			</tr>
		</tbody>
	</table></div>
	<p class="note-kome">33,000円(税込)以上で送料無料(北海道・沖縄・離島除く)<br>(名入れ代・版代・包装代・のし代含まず)</p>
	<ul class="linklist">
			<li>送料は個数、種類に関係なく1回のご注文での料金です。2、3種類のご購入でも配達先1箇所に付き送料は880円(税込)です。</li>
			<li>振込は、ご入金確認後発送条件です。(振込銀行:三菱UFJ銀行)</li>
			<li>サンプル発送時等代引き手数料が必要です。</li>
		</ul>
</div>

<div id="about_delivaly">
	<h3 class="h-section">お届けについて</h3>

		<h4 class="h-sub">宅配業者</h4>
		<p>佐川急便株式会社（直送の場合は未定）</p>

		<h4 class="h-sub">配達希望時間指定</h4>
		<p>配送時間の指定は無料ですので、お気軽にご利用ください。</p>
                <p>時間帯指定は個人様宅宛のお届け時に指定出来ます。</p>
		<p class="u-alert note-kome">
		基本的に郡部地域では配達時間のご指定は出来ません。<br>
		郡部以外でも配達時間のご指定が出来ない地域もございますので予めご了承ください。</p>
		<p class="u-alert note-kome">
		配達時間はあくまでご希望で配達状況により、お客様のご希望通りにならない場合もございますので予めご了承願います。
		</p>
		<p><img loading="lazy" decoding="async" src="https://gigaplus.makeshop.jp/isplanning/images/time.png" alt="配達時間帯"></p>

		<h4 class="h-sub">指定可能時間帯</h4>
		<p>お届けまでの日数3日～5日間<br>
		あくまでも目安なります。道路状況等により配達までに更に日数がかかることもございますので予めご了承願います。
		</p>

		<h4 class="h-sub">配達時ご不在の場合</h4>
		<p>
		「ご不在連絡書」が郵便ポストに届いていますので、お客様自身で「ご不在通知書記載の宅配営業所」にご連絡ををお願い致します。<br>
		お客様ご希望の日・時間を宅配営業所にお申し付けくださいませ。
		</p>
		<p class="u-alert note-kome">
		発送後に受け取り辞退、長期ご不在等でお荷物をお受け取りいただけなかった場合は送料、返送料、決済手数料の実費をご請求いたしますのであらかじめご了承願います。
（その場合、次回からのご注文をお断りすることもございます。）
		</p>
</div>

<div id="about_return">
	<h3 class="h-section">返品交換について</h3>

		<h4 class="h-sub">返品期限</h4>
		<p>
		商品到着後、７日間(但し、未使用品に限る）<br>
		（必ず、メール・ＦＡＸで商品到着後<span class="u-alert">３日以内</span>にご連絡をください）<br>
		尚、名入れ商品のご返品は、いかなる理由でも一切お受けできません。
		</p>

		<h4 class="h-sub">不良品・納期等の損害補償問題</h4>
		<div class="guide-grid">
		<p>不良品：</p>
		<p>商品到着７日後までに、着払いご返品後、良品交換もしくは代金返還致します(但し、未使用品に限る）
		また、海外からの輸入事情・在庫数量・または運送上の事故等により、お約束の納期に遅れる場合があります。ご理解いただいてからのご利用をお願いいたします。
		また、メーカー品は都合上、急な製造打ち切りや、不慮の事故等もございますので、代替商品等でお願いいたします場合もございますのでご理解の程お願いいたします。
		上記、理由での納期遅れ・代替商品に伴う、損害補償等は一切出来ませんのでご理解ください。
		</p>
		</div>
</div>

<div id="about_receipt">
<h3 class="h-section">納品書・領収書はご希望の宛名で発行可能です。</h3>
<h4 class="h-sub">買い物カゴの中の「注文備考」で必要に応じて入力下さい。</h4>
<p><span class="notice">納品書宛名　：　ご注文者と異なるお名前で発行希望の場合に入力下さい。</span></p>
<p><span class="notice">領収書宛名　：　ご必要時に入力下さい。</span></p>
<p>（代引きの場合の領収書は、お届け先のお名前で佐川急便の配達ドライバーさんが発行いたします。お届け先の宛名以外にご必要時のみ記入下さい）</p>
<h3 class="h-section">発見マーケットはインボイス制度に対応しております</h3>
<p><span class="notice">適格請求書事業者登録番号　：　T6122001024522（発見マーケット運営会社：アイエスプランニング株式会社）</span></p>
<img loading="lazy" decoding="async" alt="インボイス画像" src="https://gigaplus.makeshop.jp/isplanning/images/Invoice2023_1.jpg"><p>どなた様にもインボイス制度に対応した納品書・請求書を発行いたします。<br>必要であれば領収書も発行いたします。（請求書は事前又は事後になる場合がございます）</p>
</div>
</div></main>

<{* ==========================================================================
     文書の足 — すべてのページ種別で共通
   ========================================================================== *}>
<footer class="site-footer">
  <div class="container site-footer__cols">
    <div>
      <h2>お買い物について</h2>
      <ul>
        <li><a href="<{$url.guide}>">ご利用ガイド</a></li>
        <li><a href="<{$url.contract}>">特定商取引法に基づく表示</a></li>
        <li><a href="<{$url.policy}>">プライバシーポリシー</a></li>
        <li><a href="<{$url.company}>">会社概要</a></li>
      </ul>
    </div>
    <div>
      <h2>お問い合わせ</h2>
      <ul>
        <li><a href="<{$url.support}>">お問い合わせ</a></li>
        <li><a href="/shop/enq202208200" target="_blank" rel="noopener">見積依頼フォーム</a></li>
        <li><{$shop.tel}></li>
      </ul>
    </div>
    <div>
      <h2>会員の方</h2>
      <ul>
        <{if $member.is_logged_in}>
          <li><a href="<{$url.mypage}>">マイページ</a></li>
          <li><a href="<{$url.favorite}>">お気に入り</a></li>
          <li><a href="<{$url.logout}>">ログアウト</a></li>
        <{else}>
          <li><a href="<{$url.login}>">ログイン</a></li>
          <{if $shop.is_member_entry_enabled}>
            <li><a href="<{$url.member_entry}>">新規会員登録</a></li>
          <{/if}>
        <{/if}>
      </ul>
    </div>
    <{* ベーシックモードの左サイドバーが唯一の入口だったフリーページを、
         ここに移しています。サイドバーを畳んだのは正しい判断でしたが、
         畳んだだけでは6ページが到達不能になっていました。 *}>
    <div>
      <h2>粗品の選び方</h2>
      <ul>
        <li><a href="/html/page9.html">商品別カテゴリー</a></li>
        <li><a href="/html/page8.html">シーンで選ぶ</a></li>
        <li><a href="/html/page5.html">季節で選ぶ粗品</a></li>
        <li><a href="/html/page2.html">名入れ・包装・熨斗のご案内</a></li>
        <li><a href="/html/page4.html">SP SOURCE カタログのご案内</a></li>
      </ul>
    </div>
  </div>
  <div class="container site-footer__legal">
    <p><{$shop.address}></p>
    <p><{$shop.copyright}></p>
  </div>
</footer>

<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
