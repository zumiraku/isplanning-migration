/* compare.js — 現行と移植版を、同じ式で、同じ回のうちに比べます */
const fs = require("fs");
const { page } = require("./cdp.js");
const { openAt, sleep } = require("./bind.js");
const { landed } = require("./pages.js");

const exprFile = process.argv[2];
const TYPE = Number(process.argv[3]);
const LIVE = process.argv[4];
const PORT = process.argv[5];
if (!exprFile || !TYPE || !LIVE || !PORT) {
  console.error("使い方: node tools/cdp/compare.js <式> <ページ種別> <現行のパス> <移植版のパス>");
  process.exit(1);
}
const EXPR = fs.readFileSync(exprFile, "utf8");

function show(label, r) {
  console.log("── " + label);
  if (!r) { console.log("   （読めません）"); return; }
  Object.keys(r).forEach(function (k) {
    const v = r[k];
    if (Array.isArray(v)) {
      console.log("   " + k + " (" + v.length + ")");
      v.slice(0, 20).forEach(x => console.log("      " + String(x).slice(0, 150)));
    } else {
      console.log("   " + k + " : " + String(v).slice(0, 400));
    }
  });
}

(async () => {
  const p = await page();
  await p.navigate("about:blank"); await sleep(250);
  await p.navigate("https://www.isp-sp.com" + LIVE); await sleep(5000);
  const at = await p.evaluate("location.href");
  if (!landed(LIVE, at)) {
    console.log("※ 現行 " + LIVE + " は " + at.split("isp-sp.com").pop() + " に飛ばされました");
  }
  const live = await p.evaluate(EXPR);

  const bound = await openAt(p, TYPE, PORT, 5000);
  if (!bound.ok) { console.error("※ " + bound.why); p.close(); process.exit(1); }
  const nu = await p.evaluate(EXPR);
  p.close();

  show("現行  " + LIVE, live);
  console.log("");
  show("移植版 種別" + TYPE + "  " + PORT, nu);
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

