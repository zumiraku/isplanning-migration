/* ==========================================================================
   発見マーケット — ページの挙動
   貼り付け先: クリエイターモード › 全ページ共通 › JavaScript

   ※ この欄は、中身を全部消してから貼ってください（Ctrl+A → Ctrl+V）。

      2026-09-05 まで、ここには「こちらのコードを【先頭】に置き、Basics
      標準の67行はその下に残す」と書いてありました。**あの手順はもう
      合いません。** そのときの11ページは jQuery を読み込まない自前の
      設計で、Basics の67行と同居させる必要がありました。

      いまの11ページは、お店の現行テンプレートをそのまま移したものです。
      jQuery も bxSlider も、必要なものはプラットフォームが
      `<{$makeshop.head}>` で読ませます。**残す理由が無くなりました。**

      それより、この欄には差し戻された版のコードが入ったままです。
      継ぎ足すと**古い版が動き続けます。** 全部消してください。

   消えるものが1つだけあります

      Basics 標準の67行は、作り直していない4つのページ種別
      （商品レビュー一覧・商品レビュー投稿／まとめ買い割引／
      会員制・年齢確認）で使われていました。この4つは、現行サイトの
      どこからもリンクされていません（保存した公開ページ全部の
      `href` を調べました。レビューは u-komi です）。

   先頭のセミコロンは残してください

      前のブロックが `;` で終わっていないと、`(function(){...}())` が
      「その式を関数として呼ぶ」と解釈されて、ファイルの1行目で
      例外になります。1文字で防げます。

   中身

      port-chrome.js    ヘッダー追従・ページトップ・ドロワー・拡大表示
      search-submit.js  検索窓の Enter を、プラットフォームが待っている
                        リンククリックに変える

      どちらも素の JavaScript です。動かなくても、内容には到達できます。

   検証: preview/verify-chrome.html を tools/check-browser.sh が
         ヘッドレスChromeで毎回走らせます（16項目）。
   ========================================================================== */
;
/* ---------- port-chrome.js ---------- */
/* ---------------------------------------------------------------------------
   port-chrome.js — 旧サイトの共通headにあった挙動の移植 ＋ スマホの引き出し

   ※ 「上部固定がない」の正体はここでした

      旧サイトは 共通head管理 に素のJSを置いていて、スクロールすると
      #headerWrap に .fixed を付けていました。CSS側の #headerWrap.fixed は
      m_sys_common.css の518行目にちゃんとあります。**HTMLとCSSだけ移植して
      JSを見落とすと、固定ヘッダーだけが消えます。**

        $(window).scroll(function () {
          if($(window).scrollTop() > 20) { $('#headerWrap').addClass('fixed'); }
          else { $('#headerWrap').removeClass('fixed'); }
        });

      同じ場所に「ページトップへ戻る」もありました。.pageTop は下段メニューに
      あるのに、出す処理がheadにあったので、片方だけ移しても動きません。

   jQuery に依存しません

      旧サイトは jQuery 3.3.1 を自前で読み、さらに code.jquery.com からも
      読んでいました（二重）。クリエイターモードはプラットフォームが 3.7.1 を
      読むので、**そこに乗るか落ちるかを読み込み順に賭けたくありません。**
      素のJSで書き直しています。挙動は同じです。

   スマホの左メニュー

      山口様のご指摘そのままです ──「左メニュー部分はスマホでは lll で
      呼び出す感じだと思いますが」。960px 未満で引き出しになります。
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  /* --- 1. スクロールでヘッダーを固定 -------------------------------------- */
  var headerWrap = document.getElementById("headerWrap");
  if (headerWrap) {
    var onScroll = function () {
      if (window.pageYOffset > 20) { headerWrap.classList.add("fixed"); }
      else { headerWrap.classList.remove("fixed"); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* --- 2. ページトップへ戻る ---------------------------------------------- */
  var pageTop = document.querySelector(".pageTop");
  if (pageTop) {
    pageTop.style.display = "none";
    var onScroll2 = function () {
      pageTop.style.display = window.pageYOffset > 300 ? "" : "none";
    };
    window.addEventListener("scroll", onScroll2, { passive: true });
    onScroll2();
    pageTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* --- 3. 左メニューの引き出し -------------------------------------------- */
  var menu = document.getElementById("M_leftContents");
  var toggle = document.querySelector(".l-menu-toggle");
  if (menu && toggle) {
    var scrim = null;

    var close = function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (scrim) { scrim.remove(); scrim = null; }
    };

    var open = function () {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      scrim = document.createElement("div");
      scrim.className = "l-menu-scrim";
      scrim.addEventListener("click", close);
      document.body.appendChild(scrim);
    };

    toggle.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) { close(); } else { open(); }
    });

    var closeBtn = menu.querySelector(".l-menu-close");
    if (closeBtn) { closeBtn.addEventListener("click", close); }

    /* Esc で閉じる。開いたまま迷子にならないように。 */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { close(); }
    });

    /* 広い画面に戻したら、開いた状態を残さない */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && menu.classList.contains("is-open")) { close(); }
    });
  }

  /* --- 4. 画像の拡大 -------------------------------------------------------
     ※ 山口様のご指摘「画像が拡大できない」

     ベーシックには「商品画像拡大画面」というページ種別があり、[VIEWBUTTON]
     がそこへのリンクでした。**クリエイターにはこのページ種別がありません**
     （16種の一覧に無い）。別ページに飛ばせないので、同じ画面に重ねます。

     リンクの href が拡大画像そのものなので、**JSが動かなくても画像は開きます。**
     壊れ方が「別タブで画像が開くだけ」で済むようにしてあります。 */
  var zoomLinks = document.querySelectorAll("a[data-zoom]");
  if (zoomLinks.length) {
    var box = null;

    var closeZoom = function () {
      if (!box) { return; }
      box.remove();
      box = null;
      document.removeEventListener("keydown", onKey);
    };

    var onKey = function (e) { if (e.key === "Escape") { closeZoom(); } };

    var openZoom = function (src, alt) {
      closeZoom();
      box = document.createElement("div");
      box.className = "zoombox";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-label", "拡大画像");

      var img = document.createElement("img");
      img.src = src;
      img.alt = alt || "";
      img.className = "zoombox__img";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zoombox__close";
      btn.setAttribute("aria-label", "閉じる");
      btn.textContent = "×";

      box.appendChild(img);
      box.appendChild(btn);
      box.addEventListener("click", function (e) { if (e.target === box || e.target === btn) { closeZoom(); } });
      document.body.appendChild(box);
      document.addEventListener("keydown", onKey);
    };

    Array.prototype.forEach.call(zoomLinks, function (a) {
      a.addEventListener("click", function (e) {
        var href = a.getAttribute("href");
        if (!href) { return; }
        e.preventDefault();
        var img = a.querySelector("img");
        openZoom(href, img ? img.alt : "");
      });
    });
  }
}());

/* ---------- search-submit.js ---------- */
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
