const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_module_editor.html";
const SET = 5;
const CM = "document.querySelector('.CodeMirror').CodeMirror";
const HAS = "(document.querySelector('.CodeMirror') && document.querySelector('.CodeMirror').CodeMirror) ? 1 : 0";

const id = process.argv[2];
const file = process.argv[3];
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function lf(s) { return s.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)); }

(async () => {
  const p = await page();
  await p.navigate(BASE + "?design_set_id=" + SET + "&module_id=" + id);
  let ok = false;
  for (let i = 0; i < 24 && !ok; i++) { await sleep(400); ok = !!(await p.evaluate(HAS)); }
  if (!ok) { console.log("※ 開けません"); p.close(); process.exit(1); }
  const live = await p.evaluate(CM + ".getValue()");
  p.close();

  const theirs = live.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)));
  const mine = lf(fs.readFileSync(file, "utf8"));
  console.log("手元       : " + mine.length + " 文字");
  console.log("サーバー側 : " + live.length + " 文字（数値参照を戻すと " + theirs.length + "）");
  if (mine === theirs) { console.log("OK 一致"); return; }

  const a = mine.split("\n"), b = theirs.split("\n");
  console.log("行数: 手元 " + a.length + " / 向こう " + b.length);
  let shown = 0;
  for (let i = 0; i < Math.max(a.length, b.length) && shown < 10; i++) {
    if (a[i] === b[i]) { continue; }
    console.log("");
    console.log("  " + (i + 1) + "行目");
    console.log("    手元  : " + JSON.stringify(String(a[i]).slice(0, 110)));
    console.log("    向こう: " + JSON.stringify(String(b[i]).slice(0, 110)));
    shown++;
  }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

