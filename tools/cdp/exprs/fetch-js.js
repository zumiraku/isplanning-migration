(function () {
  var s = document.querySelectorAll("script[src]");
  var url = "";
  for (var i = 0; i < s.length; i++) {
    if (s[i].src.indexOf("/view/asset/user-") >= 0 && s[i].src.indexOf(".js") >= 0) { url = s[i].src; }
  }
  if (!url) { return Promise.resolve({ url: "(見つかりません)" }); }
  return fetch(url).then(function (r) { return r.text(); }).then(function (t) {
    return {
      url: url.slice(0, 70),
      len: t.length,
      headerWrap: t.indexOf("headerWrap") >= 0,
      pageTop: t.indexOf("pageTop") >= 0,
      drawer: t.indexOf("l-menu-toggle") >= 0,
      search: t.indexOf("makeshop-common-search-url") >= 0,
      head: t.slice(0, 120).replace(/\s+/g, " ")
    };
  });
})()
