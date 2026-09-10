/* tabs.js — the product page's three-tab block. */
(function () {
  'use strict';

  function initTabs(root) {
    var buttons = [].slice.call(root.querySelectorAll('.tabs__tab[data-tab-for]'));
    if (buttons.length < 2) { return; }

    var panels = buttons.map(function (b) {
      return root.querySelector('#' + b.getAttribute('data-tab-for'));
    });
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

