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

/* ---------- gallery.js ---------- */
/* =============================================================================
   gallery.js — product sub-image gallery
   isp-sp.com Creator Mode rebuild.

   Client request (C22): サブ画像使用（スマホではスワイプできればと思います）.

   The swiping itself is CSS scroll-snap and needs no JavaScript. This file only
   adds the things CSS cannot do: keeping the thumbnails and dots in step with
   whichever slide is showing, and moving the track when a thumbnail is chosen.

   If this script fails to load, the gallery still scrolls and every image is
   still reachable - it just loses the active-state highlight. That is the
   intended degradation, and it is why the thumbnails are buttons inside the
   markup rather than being generated here.
   ========================================================================== */
(function () {
  'use strict';

  function initGallery(root) {
    var track = root.querySelector('[data-gallery-track]');
    var slides = [].slice.call(root.querySelectorAll('[data-gallery-slide]'));
    var thumbs = root.querySelectorAll('[data-gallery-thumb]');
    var dots = root.querySelectorAll('[data-gallery-dot]');
    if (!track || !slides.length) { return; }

    function setActive(i) {
      for (var t = 0; t < thumbs.length; t++) {
        thumbs[t].setAttribute('aria-current', String(t === i));
      }
      for (var d = 0; d < dots.length; d++) {
        if (d === i) { dots[d].setAttribute('data-active', ''); }
        else { dots[d].removeAttribute('data-active'); }
      }
    }

    // Thumbnail -> scroll the track. scrollIntoView would also scroll the page,
    // so move the track's own scrollLeft instead.
    for (var t = 0; t < thumbs.length; t++) {
      (function (index) {
        thumbs[index].addEventListener('click', function () {
          track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior: 'smooth' });
          setActive(index);
        });
      })(t);
    }

    // Slide -> thumbnail. IntersectionObserver against the track, so it stays
    // correct however the slide was reached: swipe, click, or keyboard.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) {
            // Position in the track, not a number written into the markup.
            // The slides come from two loops - 拡大画像 and 追加画像 - and Smarty
            // cannot continue a counter across them without a variable. Reading
            // the index here means the template only has to mark a slide, not
            // number it, so the two can never disagree.
            setActive(slides.indexOf(entries[e].target));
          }
        }
      }, { root: track, threshold: 0.6 });
      for (var s = 0; s < slides.length; s++) { io.observe(slides[s]); }
    }

    setActive(0);
  }

  function init() {
    var roots = document.querySelectorAll('[data-gallery]');
    Array.prototype.forEach.call(roots, initGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ---------- tabs.js ---------- */
/*
 * tabs.js - the product page's three-tab block.
 *
 * The Basic Mode original did this with three radio inputs and three labels,
 * a well-known CSS-only pattern. It works, but a screen reader hears three
 * radio buttons named "tab" rather than a tab strip, and the panels are only
 * reachable by understanding that the radios control them.
 *
 * This does it the other way round. The markup ships with every panel visible
 * and each one headed by an <h2>, so with JavaScript disabled - or before this
 * file loads - the page is simply three stacked sections and nothing is
 * unreachable. Only once the script runs do the panels collapse to one and the
 * ARIA roles appear. The same rule the gallery follows: never put content
 * behind a script.
 *
 * Keyboard behaviour follows the WAI-ARIA tabs pattern: arrows move between
 * tabs and activate as they go, Home/End jump to the ends, Tab moves out of
 * the strip and into the open panel.
 *
 * Usage:
 *   <div class="tabs" data-tabs>
 *     <ul class="tabs__list">…<button class="tabs__tab" data-tab-for="x">…
 *     <div class="tabs__panel" id="x"><h2 class="h-section">…</h2>…
 */
(function () {
  'use strict';

  function initTabs(root) {
    var buttons = [].slice.call(root.querySelectorAll('.tabs__tab[data-tab-for]'));
    if (buttons.length < 2) { return; }

    var panels = buttons.map(function (b) {
      return root.querySelector('#' + b.getAttribute('data-tab-for'));
    });
    // If any panel is missing, leave the block alone: three visible sections
    // beat a tab strip whose tabs open nothing.
    if (panels.indexOf(null) !== -1) { return; }

    var list = root.querySelector('.tabs__list');
    if (list) { list.setAttribute('role', 'tablist'); }
    [].forEach.call(root.querySelectorAll('.tabs__list > li'), function (li) {
      li.setAttribute('role', 'presentation');
    });

    buttons.forEach(function (btn, i) {
      var panel = panels[i];
      if (!btn.id) { btn.id = panel.id + '-tab'; }
      btn.setAttribute('role', 'tab');
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', btn.id);
      panel.setAttribute('tabindex', '0');
    });

    function select(i, focus) {
      buttons.forEach(function (btn, j) {
        var on = j === i;
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.setAttribute('tabindex', on ? '0' : '-1');
        panels[j].hidden = !on;
      });
      if (focus) { buttons[i].focus(); }
    }

    root.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.tabs__tab[data-tab-for]') : null;
      var i = btn ? buttons.indexOf(btn) : -1;
      if (i !== -1) { select(i); }
    });

    root.addEventListener('keydown', function (e) {
      var i = buttons.indexOf(document.activeElement);
      if (i === -1) { return; }
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { next = (i + 1) % buttons.length; }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { next = (i - 1 + buttons.length) % buttons.length; }
      else if (e.key === 'Home') { next = 0; }
      else if (e.key === 'End') { next = buttons.length - 1; }
      if (next === null) { return; }
      e.preventDefault();
      select(next, true);
    });

    // data-enhanced is what the stylesheet keys the panel headings off, so it
    // must go on before the first select() or the headings flash visible.
    root.setAttribute('data-enhanced', 'true');
    select(0);
  }

  function init() {
    [].forEach.call(document.querySelectorAll('[data-tabs]'), initTabs);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());

/* ---------- quote-prefill.js ---------- */
/*
 * quote-prefill.js - carry the product into the 見積依頼 form.
 *
 * The client's own words: 「見積依頼フォームはメイクショップの『マルチフォーム』
 * を使っているだけなので細かな設定は出来ません、自動で品名や品番が入力できれば
 * 良いんですが無理なようで」. And this matters more than it sounds - he also says
 * the quote route, not the cart, is where most orders actually start.
 *
 * Today the link is a bare URL. The same href appears on the product page and on
 * four free pages, with nothing identifying the product, so every customer
 * retypes what they were just looking at:
 *
 *   <a href="https://www.isp-sp.com/shop/enq202208200" onclick="window.open(...)">
 *
 * MakeShop documents no way to seed a マルチフォーム field - not a URL parameter,
 * not a hidden item, not a product-page binding. Checked against the マルチフォーム
 * manual, the new-console manual and the support site.
 *
 * So this does it from our side. The product page appends the product to the
 * link; if the form page renders inside our Creator Mode template, this script
 * loads there too and writes the values into the form.
 *
 * 🔴 BOTH UNKNOWNS ARE NOW ANSWERED, and the answer is no. Measured on the
 *    live shop, 2026-09-08 JST, after cutover.
 *
 *    /shop/enq202208200 is not a page. It is a bounce - EUC-JP Basic-mode
 *    markup carrying three hidden fields and document.formEnquete.submit():
 *
 *      <form name="formEnquete" method="post" action="/ssl/enquete/">
 *        db=isplanning  login_id=  form_code=202208200
 *
 *    So (1) our Creator template never renders there and this script never
 *    runs, and (2) the query string we append is dropped by the bounce.
 *
 *    The form itself does have the fields we want - t_00 is 品番 and t_01 is
 *    品名, read off the live markup. But posting them straight to
 *    /ssl/enquete/ does not seed them: the returned inputs come back with no
 *    value attribute at all. GET does not work either, nor does adding mode=.
 *    **The multiform cannot be prefilled.** 山口様 said exactly this
 *    (「自動で品名や品番が入力できれば良いんですが無理なようで」) and he was
 *    right; what is new is that we now know why, and which fields they are.
 *
 *    This script therefore does nothing on the live shop. It is left in place
 *    because it is inert and because the field names are worth keeping next to
 *    the code that would use them, should makeshop ever open the form up.
 *
 * The original note, kept because it is what led to the measurement:
 *
 * TWO THINGS WERE UNVERIFIED, and both fail safe:
 *
 *   1. Whether the マルチフォーム page uses the Creator Mode common template at
 *      all. If it does not, this script never runs there and the link simply
 *      carries parameters the form ignores - the same behaviour as today.
 *   2. What the fields are called. The form page is not in our archive and the
 *      live shop is not to be crawled, so the field is found by looking at the
 *      labels a person reads rather than by a name we guessed.
 *
 * It never overwrites text the customer has already typed, and it never touches
 * a field it is not confident about. A quote request that arrives with an empty
 * product line is a nuisance; one that arrives with the wrong product in it is
 * worse than useless.
 */
(function () {
  'use strict';

  var LABELS = {
    // Field intent -> words that appear in the label a customer reads.
    // Longest first: 商品コード must beat 商品, or the code lands in the name.
    item: ['商品名', '品名', 'ご希望の商品'],
    code: ['商品コード', '品番', 'コード']
  };

  function params() {
    var out = {};
    var q = window.location.search.replace(/^\?/, '');
    if (!q) { return out; }
    q.split('&').forEach(function (pair) {
      var i = pair.indexOf('=');
      if (i < 1) { return; }
      var k = decodeURIComponent(pair.slice(0, i));
      var v = decodeURIComponent(pair.slice(i + 1).replace(/\+/g, ' '));
      if (v) { out[k] = v; }
    });
    return out;
  }

  /* Pick the form before looking at any field.
     A MakeShop page carries a keyword search box in the header, and its label
     reads 商品検索 - so a document-wide hunt for a field labelled 商品 finds the
     search box and types the product name into it. The quote form is the one
     with the most free-text fields; search forms are excluded outright, and a
     form with a single text field is a search box far more often than it is
     something worth pre-filling. */
  function targetForm() {
    var best = null, bestCount = 0;
    [].forEach.call(document.querySelectorAll('form'), function (f) {
      var action = (f.getAttribute('action') || '').toLowerCase();
      if (f.getAttribute('role') === 'search') { return; }
      if (/search|shopbrand|keyword/.test(action)) { return; }
      var n = f.querySelectorAll('input[type="text"], textarea').length;
      if (n > bestCount) { best = f; bestCount = n; }
    });
    return bestCount >= 2 ? best : null;
  }

  /* The text a person sees next to a field: its <label>, or the table cell that
     contains it. MakeShop's form markup is a table, so the label is usually the
     sibling cell rather than a <label for=...>. */
  function labelTextFor(field) {
    var bits = [];
    if (field.id) {
      var lab = document.querySelector('label[for="' + field.id + '"]');
      if (lab) { bits.push(lab.textContent); }
    }
    var row = field.closest ? field.closest('tr, li, dd, .field, p, div') : null;
    if (row) { bits.push(row.textContent || ''); }
    return bits.join(' ');
  }

  function findField(form, kind) {
    var fields = [].slice.call(form.querySelectorAll('input[type="text"], textarea'));
    var words = LABELS[kind];
    for (var w = 0; w < words.length; w++) {
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        if (f.value) { continue; }              // never overwrite
        if (f.dataset && f.dataset.quotePrefilled) { continue; }
        if (labelTextFor(f).indexOf(words[w]) !== -1) { return f; }
      }
    }
    return null;
  }

  function fill(form, kind, value) {
    var f = findField(form, kind);
    if (!f) { return false; }
    f.value = value;
    if (f.dataset) { f.dataset.quotePrefilled = '1'; }
    // Some form scripts watch for input rather than reading on submit.
    f.dispatchEvent(new Event('input', { bubbles: true }));
    f.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function init() {
    var p = params();
    if (!p.item && !p.code) { return; }

    var form = targetForm();
    if (!form) { return; }

    /* Fill a given form once and once only.

       Without this, anything that fires DOMContentLoaded a second time - a
       platform script, a bfcache restore - runs init again. The named fields
       are protected already (findField skips a field that has a value), but
       that protection is exactly what makes the second run think it failed to
       place anything, so it would drop 商品名 and 品番 into the free-text box
       a second time. The customer would watch their 要望欄 grow.

       Marked on the form, not on the module, so a page that genuinely swaps in
       a different form still gets it filled. */
    if (form.dataset && form.dataset.quotePrefilled) { return; }
    if (form.dataset) { form.dataset.quotePrefilled = '1'; }

    var filledItem = p.item ? fill(form, 'item', p.item) : false;
    var filledCode = p.code ? fill(form, 'code', p.code) : false;

    /* Whatever could not be placed in a named field goes into the free-text
       box, so it still reaches the shop.

       The earlier version only did this when BOTH failed, and that left a real
       hole. A form with one field labelled 「商品名・品番」 takes the name, and
       then the code has nowhere to go: findField skips that field because it now
       has a value, and the fallback never runs because filledItem was true.
       品番 disappeared silently - in exactly the case the client asked about
       (「商品名と品番が入るよう期待しております」).

       Each piece is judged on its own now. */
    var leftover = [];
    if (p.item && !filledItem) { leftover.push('商品名：' + p.item); }
    if (p.code && !filledCode) { leftover.push('品番：' + p.code); }

    if (leftover.length) {
      var areas = [].slice.call(form.querySelectorAll('textarea'))
        .filter(function (t) { return !t.dataset || !t.dataset.quotePrefilled; });
      if (areas.length) {
        var box = areas[0];
        /* Prepend, never replace. The customer may have typed here already. */
        box.value = leftover.join('\n') + '\n' + (box.value || '');
        if (box.dataset) { box.dataset.quotePrefilled = '1'; }
        box.dispatchEvent(new Event('input', { bubbles: true }));
        box.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());

/* ---------- price-format.js ---------- */
/*
 * price-format.js - 一覧の価格に桁区切りを入れる。
 *
 * 🔴 なぜテンプレートでやらないのか
 *
 *    一覧の価格タグは生の整数を返します。実測:
 *
 *      一覧   $..item.list[i].price   -> 55000
 *      詳細   $item.price_html        -> <span …>55,000</span>
 *
 *    整形済みなのは詳細だけです。ベーシックモードの [TAXPRICE] は一覧でも
 *    39,600 とカンマ付きで返していたので、これは現行サイトからの後退です。
 *
 *    Smarty 標準の修飾子に number_format はありません（string_format は
 *    sprintf なので桁区切りを作れません）。MakeShop が独自に登録していれば
 *    `|number_format` で入りますが、**未対応ならテンプレートが
 *    コンパイルできず、606カテゴリと検索が同時に落ちます。** 確かめる方法が
 *    プレビューへの貼り付けしかなく、外れたときの被害が大きすぎます。
 *
 *    ここでやれば、動かなかったときに残るのは 55000円（税込）── 読みにくい
 *    だけで、間違ってはいません。ギャラリーやタブと同じ考え方です。
 *
 * 🔴 触ってよいのは一覧の価格だけです。
 *
 *    商品詳細の .pricebox__main には触りません。中身は
 *    <span data-id="makeshop-item-price:1">55,000</span> で、**オプションを
 *    選ぶとプラットフォームが書き換えます。** こちらが整形したそばから
 *    上書きされますし、書き換えの邪魔をする可能性もあります。
 *    すでにカンマ付きなので、そもそも用がありません。
 *
 * 数字以外は一切触りません。「55000円（税込）」の 55000 だけを見て、
 * 4桁以上なら 55,000 にします。すでにカンマがあるものは対象外です。
 */
(function () {
  'use strict';

  function comma(n) {
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function format(el) {
    // 先頭の数字だけを見ます。「円（税込）」やアイコンには触りません。
    var node = el.firstChild;
    while (node && node.nodeType !== 3) { node = node.nextSibling; }
    if (!node) { return; }

    var t = node.nodeValue;

    /* 🔴 最初 /^\s*(\d{4,})\s*$/ と書いて、当たりませんでした。

       テンプレートが出すのは

         <span class="card__price">55000円<small>（税込）</small></span>

       なので、最初のテキストノードは "55000" ではなく **"55000円"** です。
       「数字だけのはず」という思い込みでした。**実際に配信されたHTMLに
       読み込ませて分かりました。** 手元の想像で書いた正規表現を、手元の
       想像で試していたら通っていたはずです。

       先頭の数字の並びだけを見ます。そのあとに何が続いていても構いません。 */
    var m = /^(\s*)(\d{4,})(?!\d)/.exec(t);
    if (!m) { return; }          // 空・カンマ済み・3桁以下は対象外

    node.nodeValue = m[1] + comma(m[2]) + t.slice(m[0].length);
  }

  function init() {
    var list = document.querySelectorAll('.card__price');
    for (var i = 0; i < list.length; i++) { format(list[i]); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
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

    /* 検索欄の中で押されたときだけ。商品ページの数量欄などは対象外です。 */
    var box = el.closest('.searchbox, .refine__form');
    if (!box) { return; }

    var go = box.querySelector('a[href="' + url + '"]');
    if (!go) { return; }

    e.preventDefault();
    go.click();
  });
}());

$(function() {
    // グローバルナビゲーション
    $('a[href="#nav-item-dropdown"]').on('click', function() {
        var dropdown = $(this).next('.drop-nv-wrap');
        if ($(dropdown).css('display') == 'none') {
            $(dropdown).fadeIn('fast');
        } else {
            $(dropdown).fadeOut('fast');
        }
        $('.article-title-pc').toggleClass('open');
        return false;
    });

    // ハンバーガーメニュー
    $('.menu-trigger').on('click', function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $('nav').removeClass('open');
        } else {
            $(this).addClass('active');
            $('nav').addClass('open');
        }
    });
    $('.article-title').on('click', function() {
        $(this).next().slideToggle(200);
        $(this).toggleClass('open');
    });

    // 検索ボックス
    $('.search-keyword').on('keypress', function(e) {
        if (e.keyCode == 13) {
            var index = $('.search-keyword').index(this);
            $('.search-url').get(index).click();
        }
    });
    $('.search-icon').on('click', function() {
        $('.search-box').animate({ width: 'toggle' }, 'slow');
    });
    $('.close').on('click', function() {
        $('.search-box').fadeOut('slow');  
    });

    // カレンダー特定日の設定
    $('.dayList').each(function() {
        var month = $(this).attr('data-month');
        var day = $(this).attr('data-day');
        var color = $(this).attr('data-color');
        $('.makeshop-calendar' + month +' .day' + day).css({
            'background-color': color,
            'color': '#fff',
            'font-weight': 'bold'
        });
    });

    // WebFont
    WebFontConfig = {
        google: {
            families: ['Noto+Sans+JP', 'Roboto']
        }
    };
    (function (d) {
        var wf = d.createElement('script'), s = d.scripts[0];
        wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
        wf.async = true;
        s.parentNode.insertBefore(wf, s);
    })(document);
});