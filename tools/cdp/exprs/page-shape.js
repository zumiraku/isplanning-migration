(function () {
  var b = document.body;
  return {
    url: location.href,
    title: document.title.slice(0, 50),
    text: b ? b.innerText.replace(/[\r\n\t ]+/g, " ").trim().length : 0,
    header: !!document.querySelector("#headerWrap"),
    leftmenu: !!document.querySelector("#M_leftContents"),
    footer: !!document.querySelector("#footer_guideWrap"),
    columns: !!document.querySelector("#colum-wrap"),
    columnLinks: document.querySelectorAll(".column-list li a").length
  };
})()
