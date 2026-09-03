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
