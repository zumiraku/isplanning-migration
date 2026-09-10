/* ---------------------------------------------------------------------------
   css-for.js — 配信されるページで、あるセレクタに効いているCSSを全部並べます

     node tools/cdp/css-for.js headerWrap [page_type] [width]

   推測でCSSを直すと、また外します。**実際に読まれているスタイルシートを、
   ページ自身に読ませます。**
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const NEEDLE = process.argv[2] || "headerWrap";
const TYPE = Number(process.argv[3] || 2);
const WIDTH = Number(process.argv[4] || 375);

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function probe(needle) {
  return `(function () {
    var needle = ${JSON.stringify(needle)};
    var hits = [];
    function walk(rules, sheetName, media) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.type === 4 || r.media) {
          if (r.cssRules) { walk(r.cssRules, sheetName, (media ? media + " & " : "") + (r.conditionText || r.media.mediaText)); }
          continue;
        }
        if (r.cssRules) { walk(r.cssRules, sheetName, media); continue; }
        if (!r.selectorText) { continue; }
        if (r.selectorText.indexOf(needle) < 0) { continue; }
        hits.push({ sheet: sheetName, media: media || "", sel: r.selectorText,
                    text: r.style ? r.style.cssText.slice(0, 220) : "" });
      }
    }
    var sheets = document.styleSheets;
    for (var s = 0; s < sheets.length; s++) {
      var name = (sheets[s].href || "(インライン)").split("/").slice(-1)[0].slice(0, 44);
      try { walk(sheets[s].cssRules, name, sheets[s].media && sheets[s].media.mediaText); }
      catch (e) { hits.push({ sheet: name, media: "", sel: "(読めません)", text: String(e).slice(0, 60) }); }
    }
    return { width: document.documentElement.clientWidth, hits: hits };
  })()`;
}

(async () => {
  const p = await page();
  await p.send("Emulation.setDeviceMetricsOverride",
    { width: WIDTH, height: 812, deviceScaleFactor: 2, mobile: true });
  await p.send("Network.setUserAgentOverride", { userAgent: IPHONE, platform: "iPhone" });

  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
  }
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    const u = await p.evaluate("location.href");
    if (u.indexOf("isp-sp.com") >= 0) { break; }
  }
  await sleep(4000);

  const r = await p.evaluate(probe(NEEDLE));
  console.log('"' + NEEDLE + '" に当たるルール ' + r.hits.length + " 件 / 画面幅 " + r.width);
  console.log("");
  r.hits.forEach(function (h) {
    console.log((h.media ? "@media " + h.media + "\n" : "") + h.sel);
    console.log("    { " + h.text + " }   ← " + h.sheet);
  });

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
