(function () {
  var box = document.querySelector(".header_keyword, #header .search, #headerWrap form, #header form");
  var a = document.querySelector('#headerWrap a[href="javascript:void(0)"], #header a[href="javascript:void(0)"], a[href="#makeshop-common-search-url"]');
  var out = {};
  if (box) {
    var r = box.getBoundingClientRect();
    out.枠 = box.tagName + (box.id ? "#" + box.id : "") +
      (typeof box.className === "string" && box.className ? "." + box.className.trim().split(/\s+/)[0] : "");
    out.枠の位置 = Math.round(r.left) + "," + Math.round(r.top) + " " + Math.round(r.width) + "x" + Math.round(r.height);
    out.枠のhtml = (box.innerHTML || "").replace(/\s+/g, " ").trim().slice(0, 500);
  } else { out.枠 = "(見つかりません)"; }
  if (a) {
    var q = a.getBoundingClientRect();
    var st = getComputedStyle(a);
    out.ボタン = a.outerHTML.replace(/\s+/g, " ").slice(0, 240);
    out.ボタンの位置 = Math.round(q.left) + "," + Math.round(q.top) + " " + Math.round(q.width) + "x" + Math.round(q.height);
    out.ボタンの文字 = (a.textContent || "").replace(/\s+/g, "") || "(空)";
    out.背景 = st.backgroundImage.slice(0, 90);
    var before = getComputedStyle(a, "::before").content, after = getComputedStyle(a, "::after").content;
    out.疑似要素 = "before=" + before + " after=" + after;
  } else { out.ボタン = "(見つかりません)"; }
  var input = document.querySelector('input[name="keyword"], input[name="search_keyword"], .header_keyword input[type=text]');
  out.入力欄 = input ? (input.name + " placeholder=" + (input.placeholder || "(無し)")) : "(見つかりません)";
  return out;
})()
