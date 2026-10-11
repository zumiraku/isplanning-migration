(function () {
  var h = document.querySelector("#headerWrap");
  var out = {
    before: { y: Math.round(window.pageYOffset), cls: h ? h.className : "(ヘッダー無し)" },
    docHeight: document.documentElement.scrollHeight,
    viewHeight: window.innerHeight,
    htmlOverflow: getComputedStyle(document.documentElement).overflowY,
    bodyOverflow: getComputedStyle(document.body).overflowY,
    bodyHeight: getComputedStyle(document.body).height
  };
  window.scrollTo(0, 400);
  out.afterScrollTo = { y: Math.round(window.pageYOffset), cls: h ? h.className : "" };
  window.dispatchEvent(new Event("scroll"));
  out.afterEvent = { y: Math.round(window.pageYOffset), cls: h ? h.className : "" };
  window.scrollTo(0, 0);
  return out;
})()
