(function () {
  var e = document.querySelector("#O_adminPagearea");
  if (!e) { return { err: "#O_adminPagearea がありません" }; }
  var cs = getComputedStyle(e);
  var r = e.getBoundingClientRect();
  var par = e.parentElement;
  var pcs = par ? getComputedStyle(par) : null;
  var pr = par ? par.getBoundingClientRect() : null;
  return {
    自分: {
      class: e.className,
      left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width),
      marginLeft: cs.marginLeft, paddingLeft: cs.paddingLeft,
      width指定: cs.width, display: cs.display, float: cs.cssFloat,
      boxSizing: cs.boxSizing
    },
    親: par ? {
      tag: par.tagName + (par.id ? "#" + par.id : "") +
           (typeof par.className === "string" ? "." + par.className.trim().split(/[\t ]+/).join(".") : ""),
      left: Math.round(pr.left), right: Math.round(pr.right), width: Math.round(pr.width),
      paddingLeft: pcs.paddingLeft, display: pcs.display
    } : null,
    /* どのルールが margin-left を決めているか、その場で試します */
    試し: (function () {
      var before = Math.round(e.getBoundingClientRect().left);
      e.style.marginLeft = "-10px";
      var after = Math.round(e.getBoundingClientRect().left);
      e.style.marginLeft = "";
      return { 前: before, 直接指定したら: after };
    })()
  };
})()
