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
}());
