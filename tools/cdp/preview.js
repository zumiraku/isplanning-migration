const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const OUT = "tools/cdp/preview-out";

const PAGES = [
  ["top", 2], ["detail", 3], ["category", 4], ["search", 5], ["cart", 6],
  ["news-list", 9], ["news-detail", 10], ["guide", 11], ["company", 12],
  ["contract", 13], ["policy", 14]
];

const only = process.argv[2];
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const done = [];

  for (const [name, type] of PAGES) {
    if (only && only !== name) { continue; }

    const p = await page();
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    let ok = false;
    for (let i = 0; i < 30 && !ok; i++) {
      await sleep(500);
      ok = !!(await p.evaluate("(typeof previewContent === 'function' && typeof g_editor_object !== 'undefined' && !!g_editor_object.html_pc) ? 1 : 0"));
    }
    if (!ok) { console.log(name.padEnd(13) + "※ エディタが出ません"); p.close(); continue; }

    await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");

    let url = "";
    for (let i = 0; i < 30; i++) {
      await sleep(700);
      url = await p.evaluate("location.href");
      if (url.indexOf("isp-sp.com") >= 0) { break; }
    }
    if (url.indexOf("isp-sp.com") < 0) {
      console.log(name.padEnd(13) + "※ ショップに飛びません（" + url.slice(0, 70) + "）");
      p.close(); continue;
    }
    await sleep(1500);
    const html = await p.evaluate("document.documentElement.outerHTML");
    p.close();

    fs.writeFileSync(OUT + "/" + name + ".html", html);
    console.log(name.padEnd(13) + String(html.length).padStart(7) + " 文字  " + url.slice(0, 62));
    done.push(name);
  }

  console.log("");
  console.log(done.length + " 枚を " + OUT + " に保存しました");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

