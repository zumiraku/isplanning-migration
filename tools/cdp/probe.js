const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5, TYPE = 3;
const ORIG = "package/templates/detail.tpl";

const PTK = "45bdf24edcff928f2fc86d299ab4a0dd03aeee10";
const probeFile = process.argv[2];
const itemCode = process.argv[3] || "";
if (!probeFile) { console.error("使い方: node tools/cdp/probe.js <印のファイル> [商品コード]"); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function lf(s) { return s.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)); }

async function editor(p) {
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    if (await p.evaluate("(typeof previewContent === 'function' && typeof g_editor_object !== 'undefined' && !!g_editor_object.html_pc) ? 1 : 0")) { return true; }
  }
  return false;
}

async function save(p, body) {
  await p.evaluate("g_editor_object.html_pc.setValue(" + JSON.stringify(body) + ")");
  await p.evaluate("window.confirm = function(){ return true; }; saveContent(); 1");
  await sleep(4500);
}

(async () => {
  const probe = lf(fs.readFileSync(probeFile, "utf8"));
  const orig = lf(fs.readFileSync(ORIG, "utf8"));
  const at = orig.lastIndexOf("<body>");
  if (at < 0) { console.error("※ <body> が見つかりません"); process.exit(1); }
  const withProbe = orig.slice(0, at + 6) + "\n" + probe + "\n" + orig.slice(at + 6);

  const p = await page();
  if (!await editor(p)) { console.log("※ エディタが出ません"); p.close(); process.exit(1); }

  try {
    await save(p, withProbe);
    if (!await editor(p)) { throw new Error("読み直せません"); }
    let url = "";
    if (itemCode) {
      await p.navigate("https://www.isp-sp.com/view/item/" + itemCode + "?ptk=" + PTK + "&zq=" + Date.now());
      await sleep(4500);
      url = await p.evaluate("location.href");
    } else {
      await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
      for (let i = 0; i < 30; i++) {
        await sleep(700);
        url = await p.evaluate("location.href");
        if (url.indexOf("isp-sp.com") >= 0) { break; }
      }
      await sleep(2000);
    }
    const html = await p.evaluate("document.documentElement.outerHTML");
    fs.writeFileSync("tools/cdp/preview-out/_probe.html", html);

    const found = [...html.matchAll(/ZQ([A-Za-z0-9_]+)START([\s\S]*?)ZQ\1END/g)];
    console.log("URL: " + url.slice(0, 70));
    console.log("");
    if (!found.length) { console.log("※ 印が1つも出ませんでした"); }
    for (const m of found) {
      const text = m[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      console.log(m[1].padEnd(30) + String(m[2].length).padStart(6) + " 文字  " + text.slice(0, 100));
    }
  } finally {
    if (await editor(p)) { await save(p, orig); console.log(""); console.log("元に戻しました"); }
    else { console.log("※ 元に戻せません。node tools/cdp/paste.js detail " + ORIG + " を回してください"); }
    p.close();
  }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

