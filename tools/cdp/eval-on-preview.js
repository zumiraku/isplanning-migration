/* ---------------------------------------------------------------------------
   eval-on-preview.js — 式のファイルを、配信されるページの上で走らせます

     node tools/cdp/eval-on-preview.js tools/cdp/exprs/viewport.js [page_type] [width]

   幅を指定するとスマートフォンの名乗りになります。省略すると等倍のPCです。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const file = process.argv[2];
const TYPE = Number(process.argv[3] || 2);
const WIDTH = Number(process.argv[4] || 0);

if (!file) { console.error("使い方: node tools/cdp/eval-on-preview.js <式のファイル> [page_type] [幅]"); process.exit(1); }

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  if (WIDTH) {
    await p.send("Emulation.setDeviceMetricsOverride",
      { width: WIDTH, height: 812, deviceScaleFactor: 2, mobile: true });
    await p.send("Network.setUserAgentOverride", { userAgent: IPHONE, platform: "iPhone" });
  }
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

  const r = await p.evaluate(fs.readFileSync(file, "utf8"));
  console.log(JSON.stringify(r, null, 2));

  if (WIDTH) {
    await p.send("Emulation.clearDeviceMetricsOverride", {});
    await p.send("Network.setUserAgentOverride", { userAgent: "" });
  }
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
