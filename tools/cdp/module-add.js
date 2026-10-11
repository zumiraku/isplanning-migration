const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_module_editor.html";
const SET = 5;

const id = process.argv[2];
const label = process.argv[3];
const file = process.argv[4];
if (!id || !label || !file) {
  console.error("使い方: node tools/cdp/module-add.js <ID> <管理用名称> <ファイル>");
  process.exit(1);
}

const CM = "document.querySelector('.CodeMirror').CodeMirror";
const HAS = "(document.querySelector('.CodeMirror') && document.querySelector('.CodeMirror').CodeMirror) ? 1 : 0";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function lf(s) { return s.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)); }
function un(s) { return s.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n))); }

(async () => {
  const body = lf(fs.readFileSync(file, "utf8"));
  const p = await page();
  await p.navigate(BASE + "?design_set_id=" + SET);
  let ok = false;
  for (let i = 0; i < 26 && !ok; i++) { await sleep(400); ok = !!(await p.evaluate(HAS)); }
  if (!ok) { console.log("※ 追加の画面が出ません"); p.close(); process.exit(1); }

  const set = await p.evaluate(`(function(){
    var f = document.forms.formMain;
    if (!f) { return "(フォームがありません)"; }
    var setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(f.elements.name, ${JSON.stringify(id)});
    f.elements.name.dispatchEvent(new Event("input", { bubbles: true }));
    setter.call(f.elements.description, ${JSON.stringify(label)});
    f.elements.description.dispatchEvent(new Event("input", { bubbles: true }));
    return f.elements.name.value + " / " + f.elements.description.value;
  })()`);
  console.log("入力: " + set);

  await p.evaluate(CM + ".setValue(" + JSON.stringify(body) + ")");
  const inEditor = await p.evaluate(CM + ".getValue().length");
  if (inEditor !== body.length) {
    console.log("※ 入りきりません " + inEditor + "/" + body.length); p.close(); process.exit(1);
  }

  const saved = await p.evaluate(`(function(){
    window.confirm = function(){ return true; };
    if (typeof insertModule === "function") { insertModule(); return "insertModule"; }
    if (typeof updateModule === "function") { updateModule(); return "updateModule"; }
    var b = Array.from(document.querySelectorAll("a,button")).filter(function (x) {
      return (x.innerText || "").replace(/\\s+/g, "") === "保存";
    })[0];
    if (b) { b.click(); return "保存ボタン"; }
    return "(保存の入口がありません)";
  })()`);
  console.log("保存: " + saved);
  await sleep(4500);

  const found = await p.evaluate(`location.href`);
  console.log("いまの画面: " + String(found).slice(0, 90));
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

