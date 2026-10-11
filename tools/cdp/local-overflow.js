const fs = require("fs");
const path = require("path");
const { page } = require("./cdp.js");

const name = process.argv[2] || "guide";
const width = Number(process.argv[3] || 320);
const FILE = path.resolve("templates/creator/preview/" + name + ".html");
if (!fs.existsSync(FILE)) { console.error("※ ありません: " + FILE); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const LOOK = `(function () {
  var doc = document.documentElement;
  var view = doc.clientWidth;
  function clipped(e) {
    var n = e.parentElement;
    while (n && n !== doc) {
      if (getComputedStyle(n).overflowX !== "visible") { return true; }
      n = n.parentElement;
    }
    return false;
  }
  var out = { view: view, scrollW: doc.scrollWidth, list: [] };
  Array.prototype.slice.call(document.querySelectorAll("body *")).forEach(function (e) {
    var r = e.getBoundingClientRect();
    if (r.width <= 0 || r.right <= view + 2 || clipped(e)) { return; }
    var p = e.parentElement;
    if (p && p.getBoundingClientRect().right > view + 2 && !clipped(p)) { return; }
    var cs = getComputedStyle(e);
    out.list.push({
      what: e.tagName + (e.id ? "#" + e.id : "") +
        (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/[\\t ]+/)[0] : ""),
      right: Math.round(r.right), width: Math.round(r.width),
      cssWidth: cs.width, minWidth: cs.minWidth, whiteSpace: cs.whiteSpace,
      display: cs.display, float: cs.cssFloat, position: cs.position,
      parent: p ? (p.tagName + (typeof p.className === "string" && p.className
        ? "." + p.className.trim().split(/[\\t ]+/)[0] : "")) : "",
      html: (e.outerHTML || "").replace(/[\\r\\n\\t ]+/g, " ").slice(0, 160)
    });
  });
  out.count = out.list.length;
  out.list = out.list.slice(0, 6);
  return out;
})()`;

(async () => {
  const p = await page();
  await p.send("Emulation.setDeviceMetricsOverride",
    { width: width, height: 900, deviceScaleFactor: 1, mobile: false });
  await p.navigate("file:///" + FILE.replace(/\\/g, "/"));
  await sleep(3500);
  const r = await p.evaluate(LOOK);

  console.log(name + " / " + width + "px   画面 " + r.view + " / 横 " + r.scrollW);
  console.log("はみ出し " + r.count + " 件");
  r.list.forEach(function (x) {
    console.log("");
    console.log("  " + x.what + "  右" + x.right + " 幅" + x.width);
    console.log("     css幅 " + x.cssWidth + " / min-width " + x.minWidth +
      " / white-space " + x.whiteSpace + " / display " + x.display +
      " / float " + x.float + " / position " + x.position);
    console.log("     親 " + x.parent);
    console.log("     " + x.html);
  });

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

