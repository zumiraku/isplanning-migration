/* price-format.js — 一覧の価格に桁区切りを入れる。 */
(function () {
  'use strict';

  function comma(n) {
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function format(el) {
    var node = el.firstChild;
    while (node && node.nodeType !== 3) { node = node.nextSibling; }
    if (!node) { return; }

    var t = node.nodeValue;

    var m = /^(\s*)(\d{4,})(?!\d)/.exec(t);
    if (!m) { return; }

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

