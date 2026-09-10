/* freepage-preview.js — 独自ページのプレビューを押して、配信されるHTMLを見る */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_freepage_editor.html";
const SET = 5;
const OUT = "tools/cdp/freepage-preview";
const ids = process.argv.slice(2).map(Number).filter(Boolean);
if (!ids.length) { console.error("使い方: node tools/cdp/freepage-preview.js <freepage_id…>"); process.exit(1); }

const WIDTHS = [375, 768, 1280];
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const MEASURE = `(function(){
  var d = document.documentElement, b = document.body;
  return { view: window.innerWidth, scroll: Math.max(d.scrollWidth, b ? b.scrollWidth : 0) };
})()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const p = await page();
  for (const id of ids) {
    await p.navigate(BASE + "?design_set_id=" + SET + "&freepage_id=" + id);
    let ok = false;
    for (let i = 0; i < 30 && !ok; i++) {
      await sleep(500);
      ok = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
    }
    if (!ok) { console.log(String(id).padStart(3) + " ※ プレビューの入口がありません"); continue; }
    await p.evaluate("if (document.formPreview) { document.formPreview.target = '_self'; } previewContent(); 1");
    let url = "";
    for (let i = 0; i < 30; i++) {
      await sleep(700);
      url = await p.evaluate("location.href");
      if (url.indexOf("isp-sp.com") >= 0) { break; }
    }
    if (url.indexOf("isp-sp.com") < 0) { console.log(String(id).padStart(3) + " ※ ショップに飛びません"); continue; }
    await sleep(1800);
    const html = await p.evaluate("document.documentElement.outerHTML");
    fs.writeFileSync(OUT + "/" + id + ".html", html);
    const has = k => html.split(k).length - 1;

    const widths = [];
    for (const w of WIDTHS) {
      await p.send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
      await sleep(800);
      const r = await p.evaluate(MEASURE);
      widths.push(w + (r.scroll > r.view + 1 ? "※" + r.scroll : "○"));
    }
    await p.send("Emulation.clearDeviceMetricsOverride");

    console.log(String(id).padStart(3) + "  " + String(html.length).padStart(7) + " 文字  " +
      "ヘッダー" + (has("headerWrap") ? "○" : "×") +
      " 左メニュー" + (has("M_leftContents") ? "○" : "×") +
      " 本文" + (has("M_mainContents") ? "○" : "×") +
      " フッター" + (has("footer_guideWrap") ? "○" : "×") +
      " 未展開" + has("<{") + "  " + widths.join(" ") + "  " + url.slice(0, 44));
  }
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

