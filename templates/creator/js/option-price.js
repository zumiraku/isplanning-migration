/* option-price.js — replaces MakeShop's updateOptionPrice / updateOptionPriceAjax */
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
      var chosen = el.tagName === 'SELECT'
        ? Boolean(el.value)
        : (el.type === 'radio' || el.type === 'checkbox') ? el.checked : Boolean(el.value);
      if (!chosen) { continue; }

      var parts = String(el.value).split('_');
      if (parts.length !== 2) { continue; }
      if (!/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) { continue; }
      if (parts[0] === '0' && parts[1] === '0') { continue; }

      return { option1_id: parts[0], option2_id: parts[1] };
    }
    return null;
  };

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

  function effectivePricing(data) {
    if (data.is_member_price !== true) { return data; }
    if (!(Number(data.member_price) > 0)) { return null; }
    return {
      price:        data.member_price,
      no_tax_price: data.member_no_tax_price,
      tax:          data.member_tax,
      point:        data.member_point,
      quantity:     data.quantity
    };
  }

  OptionPricer.prototype.render = function (raw) {
    var data = effectivePricing(raw);
    if (!data) {
      this.fail('価格を取得できませんでした。時間をおいて再度お試しください。');
      return;
    }

    if (this.out.price)  this.out.price.textContent  = yen(data.price);
    if (this.out.noTax)  this.out.noTax.textContent  = yen(data.no_tax_price);
    if (this.out.tax)    this.out.tax.textContent    = yen(data.tax);
    if (this.out.point && data.point >= 0) this.out.point.textContent = yen(data.point);

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
    var token = ++this.token;

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

