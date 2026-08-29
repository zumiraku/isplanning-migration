/* =============================================================================
   option-price.js — replaces MakeShop's updateOptionPrice / updateOptionPriceAjax
   isp-sp.com Creator Mode rebuild.

   Why this exists: the Basic Mode pricing behaviour is platform JavaScript emitted
   by オプションテーブル形式, which Creator Mode discontinues. See spec/option-engine.md.

   Contract preserved from Basic Mode:
     POST /shop/shopdetail_option.html
     body: uid=<internal id>&option1_id=<n>&option2_id=<n>
     ->   {"price":18295,"no_tax_price":"16632","tax":1663,"point":0,
           "quantity":null,"is_member_price":false, ...}

   Differences from the code it replaces, all deliberate:
     - no jQuery, no global functions
     - JSON.parse, never eval()
     - binds via data-* attributes, not id/name lookups, because Creator Mode
       emits different markup and id-based selectors would break silently
     - uid comes from the template, never derived from the URL: the older
       cccssxxxxxx product codes do not embed it and deriving it returns
       price 0 rather than an error
     - fails loud - disables add-to-cart rather than letting an unpriced or
       stale-priced order through
   ========================================================================== */
(function () {
  'use strict';

  var ENDPOINT = '/shop/shopdetail_option.html';

  function yen(n) {
    return Number(n).toLocaleString('ja-JP');
  }

  function OptionPricer(root) {
    this.root = root;
    this.uid = root.getAttribute('data-uid');
    this.source = root.getAttribute('data-price-source') || 'remote';
    this.out = {
      price:    root.querySelector('[data-price-out="price"]'),
      noTax:    root.querySelector('[data-price-out="no_tax_price"]'),
      tax:      root.querySelector('[data-price-out="tax"]'),
      point:    root.querySelector('[data-price-out="point"]'),
      status:   root.querySelector('[data-price-out="status"]')
    };
    this.submit = root.querySelector('[data-cart-submit]');
    this.inputs = root.querySelectorAll('[data-option-input]');
    this.token = 0;

    if (!this.uid || !this.inputs.length) {
      this.fail('商品オプションを読み込めませんでした。お手数ですがページを再読み込みしてください。');
      return;
    }
    this.bind();
    this.update();
  }

  OptionPricer.prototype.bind = function () {
    var self = this;
    Array.prototype.forEach.call(this.inputs, function (el) {
      el.addEventListener('change', function () { self.update(); });
    });
  };

  OptionPricer.prototype.selection = function () {
    for (var i = 0; i < this.inputs.length; i++) {
      var el = this.inputs[i];
      if (el.checked || (el.tagName === 'SELECT' && el.value)) {
        var raw = el.tagName === 'SELECT' ? el.value : el.value;
        var parts = String(raw).split('_');
        if (parts.length === 2 && parts[0] !== '0' && parts[1] !== '0') {
          return { option1_id: parts[0], option2_id: parts[1] };
        }
      }
    }
    return null;
  };

  /* Locking the cart whenever the displayed price is not known-good is the whole
     point: a wrong price that looks plausible is worse than a visible error. */
  OptionPricer.prototype.setEnabled = function (ok, message) {
    if (this.submit) {
      this.submit.disabled = !ok;
      this.submit.setAttribute('aria-disabled', String(!ok));
    }
    if (this.out.status) {
      this.out.status.textContent = message || '';
      this.out.status.hidden = !message;
    }
  };

  OptionPricer.prototype.fail = function (message) {
    this.setEnabled(false, message);
  };

  OptionPricer.prototype.render = function (data) {
    if (this.out.price)  this.out.price.textContent  = yen(data.price);
    if (this.out.noTax)  this.out.noTax.textContent  = yen(data.no_tax_price);
    if (this.out.tax)    this.out.tax.textContent    = yen(data.tax);
    if (this.out.point && data.point >= 0) this.out.point.textContent = yen(data.point);

    // quantity === "0" means this combination is out of stock. null means the
    // product has no per-option stock management, which is not an error.
    if (String(data.quantity) === '0') {
      this.fail('選択されたオプションは品切れです。他の組み合わせをお選びください。');
      return;
    }
    this.setEnabled(true, '');
  };

  OptionPricer.prototype.update = function () {
    var sel = this.selection();
    if (!sel) {
      this.fail('オプションを選択してください。');
      return;
    }

    var self = this;
    var token = ++this.token;   // stale responses must never overwrite a newer one

    if (this.source === 'inline') {
      var node = this.root.querySelector('[data-price-table]');
      var table = node ? JSON.parse(node.textContent) : {};
      var hit = table[sel.option1_id + '_' + sel.option2_id];
      if (!hit) { this.fail('価格を取得できませんでした。'); return; }
      this.render(hit);
      return;
    }

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'uid=' + encodeURIComponent(this.uid) +
            '&option1_id=' + encodeURIComponent(sel.option1_id) +
            '&option2_id=' + encodeURIComponent(sel.option2_id)
    })
      .then(function (r) {
        if (!r.ok) { throw new Error('HTTP ' + r.status); }
        return r.text();
      })
      .then(function (text) {
        if (token !== self.token) { return; }
        var data = JSON.parse(text);
        if (typeof data.price === 'undefined') { throw new Error('unexpected shape'); }
        self.render(data);
      })
      .catch(function () {
        if (token !== self.token) { return; }
        self.fail('価格の取得に失敗しました。時間をおいて再度お試しください。');
      });
  };

  function init() {
    var roots = document.querySelectorAll('[data-option-pricer]');
    Array.prototype.forEach.call(roots, function (el) { new OptionPricer(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
