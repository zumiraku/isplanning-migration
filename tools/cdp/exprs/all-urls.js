(function () {
  var h = document.documentElement.outerHTML;
  var set = {};
  var re = /["'(]\/?(?:makeshop\/newmanager\/)?([a-z0-9_]+\.html)/gi;
  var m;
  while ((m = re.exec(h))) { set[m[1]] = 1; }
  return Object.keys(set).sort();
})()
