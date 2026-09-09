/* ---------------------------------------------------------------------------
   sp-check.js — スマホとして見たとき、何が返るかを確かめる

   デザインセットは「レスポンシブ＝入」で、スマホ側のHTML欄は空です。
   **PCのテンプレートが両方に出る**はずですが、確かめずに切り替えると、
   スマホの客に何が出るか分からないまま公開することになります。

     node tools/cdp/sp-check.js

   プレビューのタブに iPhone の名乗りをかぶせて、返ってきたHTMLを読みます。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const PAGES = [["top", 2], ["detail", 3], ["category", 4], ["contract", 13]];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  fs.mkdirSync("tools/cdp/sp-out", { recursive: true });
  const p = await page();

  for (const [name, type] of PAGES) {
    /* プレビューを押し直してから、スマホの名乗りで開きます */
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    let ok = false;
    for (let i = 0; i < 30 && !ok; i++) {
      await sleep(500);
      ok = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
    }
    if (!ok) { console.log(name.padEnd(10) + "🔴 エディタが出ません"); continue; }

    await p.send("Emulation.setUserAgentOverride", { userAgent: UA });
    await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
    let url = "";
    for (let i = 0; i < 30; i++) {
      await sleep(700);
      url = await p.evaluate("location.href");
      if (url.indexOf("isp-sp.com") >= 0) { break; }
    }
    await sleep(1800);
    const html = await p.evaluate("document.documentElement.outerHTML");
    fs.writeFileSync("tools/cdp/sp-out/" + name + ".html", html);

    const has = k => html.split(k).length - 1;
    console.log(name.padEnd(10) +
      String(html.length).padStart(7) + " 文字  " +
      "ヘッダー" + (has("headerWrap") ? "○" : "×") +
      " 左メニュー" + (has("M_leftContents") ? "○" : "×") +
      " 本文" + (has("M_mainContents") ? "○" : "×") +
      " スマホ専用" + (has("/smartphone/") ? "🔴あり" : "無") +
      "  " + url.slice(0, 46));
  }

  await p.send("Emulation.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
