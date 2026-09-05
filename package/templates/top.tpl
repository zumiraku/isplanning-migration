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
     トップページ — Creator Mode（本文部分）

     🔴 C16 がここで効きます。クリエイターモードには「任意のカテゴリの
        商品一覧」を出すタグがありません。使えるのは5つだけです。

          $new_item        新商品
          $recommend_item  おすすめ商品
          $special_item    スペシャル商品
          $ranking_item    ランキング
          $recently_item   最近チェックした商品

        現行トップページの季節ブロック（冬向け／夏向けなど）は、この5つの
        どれでもありません。**同じ作りでは再現できません。**

        取り得る道は3つで、いずれも山口様のご判断です。
          1. 「スペシャル商品」に季節商品を登録して、そこを季節枠として使う
          2. 商品グループを使う
          3. 季節のカテゴリへ誘導するバナーを手で置く（下の tilegrid が
             その形。いまはこれにしてあります）

        3が最も手堅く、更新も画像の差し替えだけで済みます。1は自動で
        追随しますが、スペシャル商品を他の用途に使っている場合は競合します。
   ========================================================================== *}>

<{if $shop.mainvisual}>
  <div class="hero"><{$shop.mainvisual}></div>
<{/if}>

<{* 季節・シーンの入口。C16 により自動生成できないため、カテゴリタイルを
     置いています。中身は商品詳細ページのタブ2と同じ46枚。 *}>
<section>
  <h2 class="h-section">用途・季節からさがす</h2>
  <{include file="category-tiles.tpl"}>
</section>

<{if $shop.banner.has_item}>
<section style="margin-top:var(--s-12)">
  <ul class="tilegrid">
    <{section name=b loop=$shop.banner.list}>
      <li>
        <a href="<{$shop.banner.list[b].url}>" target="<{$shop.banner.list[b].target}>">
          <img src="<{$shop.banner.list[b].image_url}>" alt="" loading="lazy">
        </a>
      </li>
    <{/section}>
  </ul>
</section>
<{/if}>

<{if $recommend_item.has_item}>
<section style="margin-top:var(--s-12)">
  <h2 class="h-section">おすすめ商品</h2>
  <ul class="rail">
    <{section name=r loop=$recommend_item.list}>
      <li class="card">
        <a href="<{$recommend_item.list[r].url}>">
          <div class="card__media"><img src="<{$recommend_item.list[r].image_M}>" alt="<{$recommend_item.list[r].name}>" loading="lazy"></div>
          <div class="card__body">
            <span class="card__name"><{$recommend_item.list[r].name}></span>
            <span class="card__price"><{$recommend_item.list[r].price}></span>
          </div>
        </a>
      </li>
    <{/section}>
  </ul>
</section>
<{/if}>

<{if $new_item.has_item}>
<section style="margin-top:var(--s-12)">
  <h2 class="h-section">新商品</h2>
  <ul class="rail">
    <{section name=n loop=$new_item.list}>
      <li class="card">
        <a href="<{$new_item.list[n].url}>">
          <div class="card__media"><img src="<{$new_item.list[n].image_M}>" alt="<{$new_item.list[n].name}>" loading="lazy"></div>
          <div class="card__body">
            <span class="card__name"><{$new_item.list[n].name}></span>
            <span class="card__price"><{$new_item.list[n].price}></span>
          </div>
        </a>
      </li>
    <{/section}>
  </ul>
</section>
<{/if}>

<{if $ranking_item.has_item}>
<section style="margin-top:var(--s-12)">
  <h2 class="h-section">人気ランキング</h2>
  <ul class="rail ranking">
    <{section name=k loop=$ranking_item.list}>
      <li class="card">
        <a href="<{$ranking_item.list[k].url}>">
          <div class="card__media"><img src="<{$ranking_item.list[k].image_M}>" alt="<{$ranking_item.list[k].name}>" loading="lazy"></div>
          <div class="card__body">
            <span class="card__name"><{$ranking_item.list[k].name}></span>
            <span class="card__price"><{$ranking_item.list[k].price}></span>
          </div>
        </a>
      </li>
    <{/section}>
  </ul>
</section>
<{/if}>

<{* 粗品選びのご案内。ベーシックモードの左サイドバーが唯一の入口だった
     ページ群への導線を、トップにも置いています。 *}>
<section style="margin-top:var(--s-12)">
  <h2 class="h-section">はじめての方へ</h2>
  <div class="guide-grid">
    <a class="guide-item" href="/html/page2.html">名入れ・包装・熨斗のご案内</a>
    <a class="guide-item" href="/html/page9.html">商品別カテゴリー</a>
    <a class="guide-item" href="/html/page8.html">シーンで選ぶ</a>
    <a class="guide-item" href="/html/page5.html">季節で選ぶ粗品</a>
    <a class="guide-item" href="/html/page1.html">ご注文用紙ダウンロード</a>
    <a class="guide-item" href="<{$url.guide}>">ご利用ガイド</a>
  </div>
</section>
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
