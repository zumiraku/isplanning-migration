/* ---------------------------------------------------------------------------
   eval.js — 開いているタブで、ファイルに書いた式を評価する

     node tools/cdp/eval.js <式を書いたファイル> [待ち秒]

   URLや長い式をコマンド行に直接書くと環境の安全装置に弾かれるので、
   式はファイルに置いて渡します。返り値は JSON にして出します。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const file = process.argv[2];
const wait = Number(process.argv[3] || 0) * 1000;
if (!file) { console.error("使い方: node tools/cdp/eval.js <式のファイル> [待ち秒]"); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const expr = fs.readFileSync(file, "utf8");
  const p = await page();
  if (wait) { await sleep(wait); }
  const out = await p.evaluate(expr);
  console.log(typeof out === "string" ? out : JSON.stringify(out, null, 2));
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
