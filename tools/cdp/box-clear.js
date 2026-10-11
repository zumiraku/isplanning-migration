const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;

const types = process.argv.slice(2).map(Number).filter(Boolean);
if (!types.length) { console.error("使い方: node tools/cdp/box-clear.js <page_type…>"); process.exit(1); }
if (types.indexOf(1) >= 0) { console.error("※ 全ページ共通（1）は空にできません。こちらのCSS・JSが入っています。"); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  let ng = 0;
  for (const t of types) {
    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + t);
    let ok = false;
    for (let i = 0; i < 26 && !ok; i++) {
      await sleep(400);
      ok = !!(await p.evaluate("(typeof g_editor_object !== 'undefined' && !!g_editor_object.html_pc) ? 1 : 0"));
    }
    if (!ok) { console.log(String(t).padStart(3) + "  ※ 開けません"); ng++; continue; }

    const before = await p.evaluate(`(function(){
      return { css: g_editor_object.css_pc.getValue().length,
               js: g_editor_object.javascript_pc.getValue().length };
    })()`);
    if (!before.css && !before.js) { console.log(String(t).padStart(3) + "  すでに空です"); continue; }

    await p.evaluate(`(function(){
      g_editor_object.css_pc.setValue("");
      g_editor_object.javascript_pc.setValue("");
      window.confirm = function(){ return true; };
      saveContent();
      return 1;
    })()`);
    await sleep(4500);

    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + t);
    ok = false;
    for (let i = 0; i < 26 && !ok; i++) {
      await sleep(400);
      ok = !!(await p.evaluate("(typeof g_editor_object !== 'undefined' && !!g_editor_object.html_pc) ? 1 : 0"));
    }
    const after = ok ? await p.evaluate(`(function(){
      return { css: g_editor_object.css_pc.getValue().length,
               js: g_editor_object.javascript_pc.getValue().length,
               html: g_editor_object.html_pc.getValue().length };
    })()`) : null;

    if (after && !after.css && !after.js) {
      console.log(String(t).padStart(3) + "  OK CSS " + before.css + "→0 / JS " + before.js + "→0  （HTMLは " + after.html + " 文字のまま）");
    } else {
      console.log(String(t).padStart(3) + "  ※ 空になっていません " + JSON.stringify(after));
      ng++;
    }
  }
  p.close();
  console.log("");
  console.log(ng ? "※ " + ng + " 件が通っていません" : "OK 指定した欄はすべて空になりました");
  if (ng) { process.exit(1); }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

