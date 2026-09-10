(function () {
  var t = document.body ? document.body.innerText : "";
  return { 印: (t.match(/ZQ\[[^\]]*\]ZQ/g) || []).slice(0, 8) };
})()
