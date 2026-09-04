/* ==========================================================================
   発見マーケット — ページの挙動
   貼り付け先: クリエイターモード › 全ページ共通 › JavaScript の【末尾】

   既存のjQueryのコードは消さないでください。Basicsのグローバルナビを
   動かしているもので、まだ作り直していないページが依存しています。

   ここにあるものは、いずれも素のJavaScriptで書かれており jQuery に依存
   しません。同居して干渉しません。

   3つとも「無くても内容には到達できる」作りにしてあります。
     gallery.js       スワイプ自体はCSSのスクロールスナップ。JSはサムネイルと
                      点の追随だけ
     tabs.js          3つのパネルは最初から全部表示されており、JSが動いたとき
                      だけタブに畳まれる
     quote-prefill.js 動かなければ、見積フォームは今と同じ挙動に戻るだけ

   検証: preview/verify-gallery.html 11項目 / verify-tabs.html 13項目 /
         verify-quote-prefill.html 6項目、いずれも全合格
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
    var slides = root.querySelectorAll('[data-gallery-slide]');
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
            setActive(Number(entries[e].target.getAttribute('data-gallery-slide')));
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
 * TWO THINGS ARE UNVERIFIED, and both fail safe:
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

    var filledItem = p.item ? fill(form, 'item', p.item) : false;
    var filledCode = p.code ? fill(form, 'code', p.code) : false;

    /* If neither field could be identified, put the product somewhere the
       customer and the shop can both see it rather than dropping it silently:
       the form's largest free-text box. */
    if (!filledItem && !filledCode) {
      var areas = [].slice.call(form.querySelectorAll('textarea'))
        .filter(function (t) { return !t.value; });
      if (areas.length) {
        var line = p.item + (p.code ? '（商品コード ' + p.code + '）' : '');
        areas[0].value = line + '\n';
        areas[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());

