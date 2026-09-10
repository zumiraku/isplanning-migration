(function () {
  function n(s) { return document.querySelectorAll(s).length; }
  function texts(s, cap) {
    return Array.prototype.map.call(document.querySelectorAll(s),
      function (e) { return (e.innerText || "").replace(/\s+/g, "").slice(0, 40); }).slice(0, cap || 24);
  }
  var t = (document.body ? document.body.innerText : "");
  return {
    tabs: texts(".tab-list", 8),
    heads: texts("h2,h3,h4", 24),
    itemImg: n("#itemImg"),
    detailImg: n("#Item_detail_Image"),
    thumbs: n(".M_imageThumbnail img"),
    mainList: n(".M_imageMainList img"),
    imgInBox: n("#itemImg img, #Item_detail_Image img"),
    zoomIcon: n('img[alt="拡大画像"]'),
    review: n(".review-container"),
    nativeReview: n("div.Review"),
    reviewLink: n('a[href*="review"]'),
    saleBox: n(".saleBox"),
    saleP: n("p.sale"),
    saleRate: n("p.saleRate"),
    zaiko9: n("p.zaiko9"),
    zaiko: n("p.zaiko"),
    recent: n(".M_recent, #M_recent, .recentBox"),
    group: n("#M_group"),
    lines: t.split("\n").map(function (x) { return x.trim(); }).filter(Boolean).length,
    text: t.replace(/\s+/g, "")
  };
})()
