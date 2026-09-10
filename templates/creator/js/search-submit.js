/* -----------------------------------------------------------------------------
   search-submit.js — 検索欄で Enter を押したときに検索する

   検索は <form> ではありません。プラットフォームの system.js が

     $('[href="' + searchUrl + '"]').on('click', …)

   という形でしか検索を張っておらず、action 属性も submit イベントも
   一度も参照しないためです（実サーバの system.js を読んで確認）。

   その結果、<form> をやめた副作用として **Enter が効かなくなります。**
   検索窓に文字を入れて Enter、はいちばん多い操作なので、ここで補います。

   マーカーの文字列は直書きしません。プラットフォームが
   #makeshop-page-common-search-data の data-search-url で公開しているので、
   そちらを読みます。将来 makeshop 側が名前を変えても追従します。

   このファイルが読まれなくても、検索ボタン自体は効きます（バインドしている
   のはプラットフォーム側なので）。落ちるのは Enter だけです。
----------------------------------------------------------------------------- */
(function () {
  var data = document.getElementById('makeshop-page-common-search-data');
  var url = data && data.getAttribute('data-search-url');
  if (!url) { return; }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') { return; }

    var el = e.target;
    if (!el || !el.matches || !el.matches('input')) { return; }

    /* 検索欄の中で押されたときだけ。商品ページの数量欄などは対象外です。
     *
     * ※ 探すクラスは .search-box と #r_searchInput です
     *
     *    最初は .searchbox と .refine__form を見ていました。**どちらも
     *    こちらが設計したときの名前**で、移植で無くなっています。
     *    いまのマークアップは店舗のもので、
     *
     *      ヘッダー      <div class="search-box">      （上段メニュー）
     *      検索ページ    <div id="r_searchInput">      （絞り込みの表）
     *
     *    です。ハイフンの位置が違うだけなので、目では気づけませんでした。
     *    verify-chrome.html が「Enterがリンクのクリックにならない」で
     *    落ちて分かりました。 */
    var box = el.closest('.search-box, #r_searchInput');
    if (!box) { return; }

    var go = box.querySelector('a[href="' + url + '"]');
    if (!go) { return; }

    e.preventDefault();
    go.click();
  });
}());
