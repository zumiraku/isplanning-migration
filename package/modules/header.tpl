<{* ==========================================================================
     サイト共通ヘッダー — モジュール「ヘッダー」に貼るもの
     参照方法: 各ページテンプレートの <{$module.header}>
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

    <{* 商品検索。$search_form.*_id はフォーム部品のIDを返すので、name属性では
         なくこの値を使います。 *}>
    <form class="searchbox" action="<{$search_form.search_url}>" role="search">
      <label class="visually-hidden" for="<{$search_form.keyword_id}>">商品を検索</label>
      <input type="text" id="<{$search_form.keyword_id}>" placeholder="商品名・キーワードで探す">
      <button type="submit">検索</button>
    </form>

    <div class="site-header__contact"><b><{$shop.tel}></b>平日10時〜12時／13時〜17時</div>
    <div class="site-header__tools">
      <a class="cartlink" href="<{$url.cart}>">カート <b><{$cart.total_quantity}></b> 点</a>
    </div>
  </div>

  <{* カテゴリメニュー。<details>/<summary> で組みます。

       🔴 最初は <li><a> と <div class="meganav__panel"> で書いていました。
          components.css の .meganav は details[open] で開閉する前提で、閉じた
          パネルを隠すルールを持ちません。<details> でないと **46カテゴリの
          子パネルが全部開いたまま** になり、実際そうなっていました。ページ
          上部が価格帯の一覧で埋まり、本文がその下に押し出されていました。

       JavaScript を使わないのは他と同じ理由です。<details> は素のHTMLで開閉し、
       キーボードでも操作でき、スクリプトが落ちても中身に到達できます。 *}>
  <{if $category_menu.has_item}>
  <nav class="meganav" aria-label="商品カテゴリー">
    <ul class="meganav__list container">
      <{section name=c loop=$category_menu.list}>
        <li class="meganav__item">
          <{if $category_menu.list[c].child_category.has_item}>
            <details>
              <summary><{$category_menu.list[c].name}></summary>
              <div class="meganav__panel">
                <ul class="meganav__cols">
                  <li><a href="<{$category_menu.list[c].url}>"><{$category_menu.list[c].name}>をすべて見る</a></li>
                  <{section name=d loop=$category_menu.list[c].child_category.list}>
                    <li><a href="<{$category_menu.list[c].child_category.list[d].url}>"><{$category_menu.list[c].child_category.list[d].name}></a></li>
                  <{/section}>
                </ul>
              </div>
            </details>
          <{else}>
            <a href="<{$category_menu.list[c].url}>"><{$category_menu.list[c].name}></a>
          <{/if}>
        </li>
      <{/section}>
    </ul>
  </nav>
  <{/if}>
</header>
