/* freepages.js — 独自ページ82枚が、どちらの版で入っているかを調べる */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_freepage_editor.html";
const SET = 5;
const from = Number(process.argv[2] || 1);
const to = Number(process.argv[3] || 82);

const CM = "document.querySelector('.CodeMirror').CodeMirror";
const HAS = "(document.querySelector('.CodeMirror') && document.querySelector('.CodeMirror').CodeMirror) ? 1 : 0";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  const rows = [];
  for (let id = from; id <= to; id++) {
    await p.navigate(BASE + "?design_set_id=" + SET + "&freepage_id=" + id);
    let ok = false;
    for (let i = 0; i < 24 && !ok; i++) { await sleep(400); ok = !!(await p.evaluate(HAS)); }
    if (!ok) { console.log(String(id).padStart(3) + "  ※ 開けません"); continue; }
    const r = await p.evaluate(`(function(){
      var f = document.forms.formMain;
      var g = function (n) { var e = f && f.elements[n]; return e ? e.value : ""; };
      var v = ${CM}.getValue();
      var has = function (k) { return v.split(k).length - 1; };
      return {
        name: g("name").slice(0, 34),
        pageId: g("page_id"),
        len: v.length,
        oldShell: has("<main class=\\"container\\"") + has("breadcrumb"),
        newShell: has("M_mainContents"),
        leftmenu: has("$module.leftmenu"),
        doc: has("<!doctype html>")
      };
    })()`);
    rows.push(Object.assign({ id: id }, r));
    console.log(String(id).padStart(3) + "  " + String(r.pageId).padEnd(10) +
      String(r.len).padStart(7) + " 文字  " +
      (r.newShell ? "OK 新しい骨格" : "※ 旧骨格") + " 左メニュー" + (r.leftmenu ? "有" : "※無") + "  " + r.name);
  }
  fs.writeFileSync("tools/cdp/freepage-scan.json", JSON.stringify(rows, null, 1));
  const old = rows.filter(r => !r.newShell).length;
  console.log("");
  console.log("調べた " + rows.length + " 枚 / 旧骨格のまま " + old + " 枚 / 左メニュー無し " + rows.filter(r => !r.leftmenu).length + " 枚");
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

