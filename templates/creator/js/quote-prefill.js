/* quote-prefill.js — carry the product into the 見積依頼 form. */
(function () {
  'use strict';

  var LABELS = {
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
        if (f.value) { continue; }
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
    f.dispatchEvent(new Event('input', { bubbles: true }));
    f.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function init() {
    var p = params();
    if (!p.item && !p.code) { return; }

    var form = targetForm();
    if (!form) { return; }

    if (form.dataset && form.dataset.quotePrefilled) { return; }
    if (form.dataset) { form.dataset.quotePrefilled = '1'; }

    var filledItem = p.item ? fill(form, 'item', p.item) : false;
    var filledCode = p.code ? fill(form, 'code', p.code) : false;

    var leftover = [];
    if (p.item && !filledItem) { leftover.push('商品名：' + p.item); }
    if (p.code && !filledCode) { leftover.push('品番：' + p.code); }

    if (leftover.length) {
      var areas = [].slice.call(form.querySelectorAll('textarea'))
        .filter(function (t) { return !t.dataset || !t.dataset.quotePrefilled; });
      if (areas.length) {
        var box = areas[0];
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

