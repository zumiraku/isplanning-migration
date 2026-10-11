const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const types = process.argv.slice(2).map(Number).filter(Boolean);
if (!types.length) { console.error("使い方: node tools/cdp/box-dump.js <page_type…>"); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  for (const t of types) {
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + t);
    let ok = false;
    for (let i = 0; i < 60 && !ok; i++) {
      await sleep(500);
      ok = !!(await p.evaluate("(typeof g_editor_object !== 'undefined' && Object.keys(g_editor_object).length > 0) ? 1 : 0"));
    }
    if (!ok) { console.log(t + "  ※ 開けません"); continue; }
    const html = await p.evaluate("g_editor_object.html_pc ? g_editor_object.html_pc.getValue() : ''");
    const out = "tools/cdp/box-out/type" + t + ".tpl";
    fs.mkdirSync("tools/cdp/box-out", { recursive: true });
    fs.writeFileSync(out, html);
    const has = s => html.indexOf(s) >= 0 ? "○" : "－";
    console.log(String(t).padStart(3) + "  " + String(html.length).padStart(6) + " 文字  → " + out);
    console.log("      doctype " + has("<!doctype") + has("<!DOCTYPE") +
      " / makeshop.head " + has("$makeshop.head") +
      " / header " + has("$module.header") +
      " / leftmenu " + has("$module.leftmenu") +
      " / footer " + has("$module.footer"));
    console.log("      先頭: " + html.slice(0, 100).replace(/[\r\n\t ]+/g, " "));
  }
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

