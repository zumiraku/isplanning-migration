(function () {
  var box = document.querySelector("#itemImg, #Item_detail_Image");
  if (!box) { return { found: false }; }
  var r = box.getBoundingClientRect();
  var imgs = Array.prototype.map.call(box.querySelectorAll("img"), function (i) {
    var b = i.getBoundingClientRect();
    return Math.round(b.width) + "x" + Math.round(b.height) + "  " +
      (i.getAttribute("alt") || "") + "  " + (i.currentSrc || i.src || "").split("/").pop().slice(0, 40);
  });
  return {
    found: true,
    id: box.id,
    left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height),
    thumbs: box.querySelectorAll(".M_imageThumbnail-item").length,
    imgs: imgs
  };
})()
