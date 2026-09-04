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
     買い物カゴ — Creator Mode（本文部分）

     C21 の [BASKET_MAIL] がここに関わります。ベーシックモードでは、この
     ページの「見積もりを依頼」が basket_mail() を呼び、tempid（カゴの
     セッション）を hidden で /ssl/contact/ に POST していました。tempid が
     載っているからこそ、届いた見積依頼が「何が入っていたカゴか」を知って
     いたわけです。

     クリエイターモードには $cart.estimate_url があり、$cart.is_estimate_enabled
     で有効かどうかを判定できます。ただしこれは「商品見積書」機能のもので、
     山口様からは「オプション（有料）のため使用していない」とご回答済み
     （C2）。つまり **この導線は現状そのままでは存在しません**。

     なので、かご内の見積依頼はマルチフォームへのリンクとして置いています。
     カゴの中身は引き継げませんが、リンクだけは残ります。tempid 相当の
     引き継ぎができるかは、実機で確認しないと分かりません。
   ========================================================================== *}>

<h1 class="h-page">買い物かご</h1>

<{if $cart.has_item}>

  <{if $cart.is_free_shipping_enabled}>
    <p class="notice"><{$cart.free_shipping_message}></p>
  <{/if}>

  <div class="table-scroll">
    <table class="carttable">
      <thead>
        <tr><th>商品</th><th>単価</th><th>数量</th><th>小計</th><th></th></tr>
      </thead>
      <tbody>
        <{section name=i loop=$cart.list}>
        <tr>
          <td class="carttable__name">
            <a href="<{$cart.list[i].url}>">
              <img class="carttable__media" src="<{$cart.list[i].image_M}>" alt="" loading="lazy">
              <{$cart.list[i].name}>
            </a>
            <span class="carttable__code"><{$cart.list[i].system_code}></span>
            <{if $cart.list[i].selected_option.has_item}>
              <span class="carttable__opt"><{$cart.list[i].special_display}></span>
            <{/if}>
            <{if $cart.list[i].is_bulk}>
              <a class="carttable__opt" href="<{$cart.list[i].bulk_url}>"><{$cart.list[i].bulk_name}></a>
            <{/if}>
          </td>
          <td class="carttable__price"><{$cart.list[i].price}></td>
          <td class="qty">
            <label class="visually-hidden" for="<{$cart.list[i].quantity_id}>">数量</label>
            <input class="qtyfield" type="number" min="1" id="<{$cart.list[i].quantity_id}>" value="<{$cart.list[i].quantity}>">
            <a href="<{$cart.list[i].quantity_url}>">変更</a>
          </td>
          <td class="carttable__price"><{$cart.list[i].total_price}></td>
          <td><a href="<{$cart.list[i].remove_url}>">削除</a></td>
        </tr>
        <{/section}>
      </tbody>
    </table>
  </div>

  <{if $cart.bulk.has_item}>
    <div class="notice">
      <{section name=b loop=$cart.bulk.list}>
        <p><{$cart.bulk.list[b].name}>：<{$cart.bulk.list[b].discount_price}> 割引</p>
      <{/section}>
    </div>
  <{/if}>

  <div class="cartsum">
    <div class="cartsum__row"><span>商品点数</span><span><{$cart.total_quantity}> 点</span></div>
    <div class="cartsum__row"><span>消費税</span><span><{$cart.total_tax}></span></div>
    <div class="cartsum__total"><span>合計</span><span><{$cart.total_price}></span></div>
    <p class="cartsum__note">送料は個数・種類に関係なく1回のご注文での料金です。離島・北海道・沖縄は別途送料、中継料が必要です（カゴでは自動計算されません）。</p>
  </div>

  <ul class="cartactions">
    <li><a class="btn btn--primary" href="<{$cart.order_url}>">ご注文手続きへ進む</a></li>
    <li><a class="btn btn--ghost" href="<{$url.top}>">買い物を続ける</a></li>
  </ul>

  <{* 見積依頼。この店舗ではカゴよりこちらからの注文が多い、と山口様。 *}>
  <div class="cartquote">
    <h2 class="h-sub">お見積もりをご希望の場合</h2>
    <p>数量の変更、名入れ・包装・のしのご相談は、見積依頼フォームからお願いいたします。</p>
    <{if $cart.is_estimate_enabled}>
      <a class="btn btn--ghost" href="<{$cart.estimate_url}>">見積書を発行する</a>
    <{/if}>
    <a class="btn btn--primary" href="/shop/enq202208200" target="_blank" rel="noopener">見積依頼フォーム</a>
  </div>

<{else}>
  <{* 空のカゴは行き止まりにしない。 *}>
  <p class="carttable__empty">買い物かごに商品が入っていません。</p>
  <p class="u-center">
    <a class="btn btn--primary" href="<{$url.top}>">粗品・景品をさがす</a>
  </p>
  <h2 class="h-section" style="margin-top:var(--s-12)">最近チェックした商品</h2>
  <{if $recently_item.has_item}>
    <ul class="rail">
      <{section name=r loop=$recently_item.list}>
        <li class="card">
          <a href="<{$recently_item.list[r].url}>">
            <div class="card__media"><img src="<{$recently_item.list[r].image_M}>" alt="<{$recently_item.list[r].name}>" loading="lazy"></div>
            <div class="card__body">
              <span class="card__name"><{$recently_item.list[r].name}></span>
              <span class="card__price"><{$recently_item.list[r].price}></span>
            </div>
          </a>
        </li>
      <{/section}>
    </ul>
  <{/if}>
<{/if}>
</main>

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
