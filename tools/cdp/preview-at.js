/* preview-at.js — 好きなURLを、いまのエディタ内容で描いて測ります */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const TYPE = Number(process.argv[2] || 3);
const PATH = process.argv[3];
const file = process.argv[4];
const WIDTH = Number(process.argv[5] || 0);

if (!PATH || !file) {
  console.error("使い方: node tools/cdp/preview-at.js <ページ種別> <パス> <式のファイル> [幅]");
  process.exit(1);
}
const EXPR = fs.readFileSync(file, "utf8");

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
  let ok = false;
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const n = await p.evaluate("(typeof g_editor_object !== 'undefined' && g_editor_object.html_pc) ? g_editor_object.html_pc.getValue().length : 0");
    if (n > 200 && await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { ok = true; break; }
  }
  if (!ok) { console.error("※ エディタが出ません"); p.close(); process.exit(1); }

  const set =
    "(function(){var f=document.formPreview;" +
    "f.action=f.action.replace(/page_path=.*$/, 'page_path=' + " + JSON.stringify(PATH) + ");" +
    "f.target='_self'; previewContent(); return f.action;})()";
  const action = await p.evaluate(set);

  let url = "";
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    url = await p.evaluate("location.href");
    if (url.indexOf("isp-sp.com") >= 0) { break; }
  }
  await sleep(6000);
  const r = await p.evaluate(EXPR);
  p.close();

  console.log("種別 " + TYPE + " / " + PATH + (WIDTH ? " / " + WIDTH + "px" : ""));
  console.log("  " + action.slice(action.indexOf("page_path=")));
  console.log("  着いた先 " + url.slice(0, 80));
  console.log("");
  console.log(JSON.stringify(r, null, 2));
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

