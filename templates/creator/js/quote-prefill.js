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
