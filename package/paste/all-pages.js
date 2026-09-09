/* ==========================================================================
   🔴 このファイルは JavaScript 欄の【先頭】に置きます。末尾ではありません。

   Basics 標準の 67 行は、この下に置いてください。順番が逆だと、こちらの
   コードは1行も動きません。2026-09-05 に実際にそうなりました。

     Uncaught ReferenceError: $ is not defined    at user-...:1:1

   $ は jQuery です。Basics 標準のコードはそれを前提に書かれていますが、
   こちらが作り直した11ページは jQuery を読み込みません。ここにあるものは
   すべて素の JavaScript で、必要としないからです。

   読み込まれていない $ を Basics のコードが呼びに行って、**ファイルの
   1行目で例外**になります。JavaScript はそこで止まるので、下に何行
   書いてあっても実行されません。タブは畳まれず、ギャラリーのサムネイルと
   点は無反応のまま。**行数を数えても正しく見えます。**

   こちらを先に置けば、Basics が落ちる前に走り終わっています。Basics 側は
   まだ作り直していない4ページ（商品レビュー一覧・投稿／まとめ買い割引／
   会員制・年齢確認）で今まで通り動きます。あちらは jQuery を読み込む
   テンプレートのままなので。**消さずに、下に置くだけです。**

   先頭のセミコロンも残してください。将来この順番が崩れたとき、直前の行が
   セミコロンで終わっていないと `(function(){...}())` が「その式を関数として
   呼ぶ」と解釈されて、同じ止まり方をします。1文字で防げます。
   ========================================================================== */
;

/* ==========================================================================
   発見マーケット — ページの挙動
   貼り付け先: クリエイターモード › 全ページ共通 › JavaScript の【先頭】

   既存のjQueryのコードは消さないでください。Basicsのグローバルナビを
   動かしているもので、まだ作り直していないページが依存しています。

   ここにあるものは、いずれも素のJavaScriptで書かれており jQuery に依存
   しません。同居して干渉しません。

   4つとも「無くても内容には到達できる」作りにしてあります。
     gallery.js       スワイプ自体はCSSのスクロールスナップ。JSはサムネイルと
                      点の追随だけ
     tabs.js          3つのパネルは最初から全部表示されており、JSが動いたとき
                      だけタブに畳まれる
     quote-prefill.js 動かなければ、見積フォームは今と同じ挙動に戻るだけ
     price-format.js  動かなければ 55000円（税込）── 読みにくいだけで、
                      間違ってはいない

   検証: preview/verify-gallery.html / verify-tabs.html /
         verify-quote-prefill.html。tools/check-browser.sh がヘッドレスChromeで
         毎回走らせます。
   ========================================================================== */

/* ---------- port-chrome.js ---------- */
/* ---------------------------------------------------------------------------
   port-chrome.js — 旧サイトの共通headにあった挙動の移植 ＋ スマホの引き出し

   🔴 「上部固定がない」の正体はここでした

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
     🔴 山口様のご指摘「画像が拡大できない」

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
     * 🔴 探すクラスは .search-box と #r_searchInput です
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
