const { page } = require("./cdp.js");

const WIDTHS = [768, 960, 1280, 1440];
const LIVE = [
  ["トップ", "https://www.isp-sp.com/"],
  ["商品詳細", "https://www.isp-sp.com/shopdetail/003001000005/"],
  ["商品カテゴリー", "https://www.isp-sp.com/shopbrand/all_items/"],
  ["特定商取引法", "https://www.isp-sp.com/html/ordercontract.html"]
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const MEASURE = `(function(){
  var d = document.documentElement, b = document.body;
  var w = Math.max(d.scrollWidth, b ? b.scrollWidth : 0);
  var over = [];
  var all = document.querySelectorAll("body *");
  for (var i = 0; i < all.length; i++) {
    var r = all[i].getBoundingClientRect();
    if (r.width === 0 || r.height === 0) { continue; }
    if (r.right > window.innerWidth + 1) {
      over.push(all[i].tagName + (all[i].id ? "#" + all[i].id : "") +
        (all[i].className && all[i].className.toString ? "." + String(all[i].className).split(" ")[0] : ""));
      if (over.length >= 3) { break; }
    }
  }
  return { view: window.innerWidth, scroll: w, over: over };
})()`;

(async () => {
  const p = await page();
  for (const [name, url] of LIVE) {
    await p.navigate(url);
    await sleep(3500);
    const line = [];
    const notes = [];
    for (const w of WIDTHS) {
      await p.send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
      await sleep(900);
      const r = await p.evaluate(MEASURE);
      const bad = r.scroll > r.view + 1;
      line.push(w + (bad ? "※" + r.scroll : "○"));
      if (bad) { notes.push("    " + w + "px: " + r.over.join(" / ")); }
    }
    console.log("現行 " + name.padEnd(14) + line.join("  "));
    notes.forEach(n => console.log(n));
  }
  await p.send("Emulation.clearDeviceMetricsOverride");
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

