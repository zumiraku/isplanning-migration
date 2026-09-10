/* search-submit.js — 検索欄で Enter を押したときに検索する */
(function () {
  var data = document.getElementById('makeshop-page-common-search-data');
  var url = data && data.getAttribute('data-search-url');
  if (!url) { return; }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') { return; }

    var el = e.target;
    if (!el || !el.matches || !el.matches('input')) { return; }

    var box = el.closest('.search-box, #r_searchInput');
    if (!box) { return; }

    var go = box.querySelector('a[href="' + url + '"]');
    if (!go) { return; }

    e.preventDefault();
    go.click();
  });
}());

