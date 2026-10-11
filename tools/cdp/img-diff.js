const fs = require("fs");
const { page } = require("./cdp.js");
const { openAt, sleep } = require("./bind.js");
const { PAGES, landed } = require("./pages.js");

const EXPR = fs.readFileSync(__dirname + "/exprs/img-names.js", "utf8");
const only = process.argv[2];

(async () => {
  const p = await page();
  let bad = 0;
  for (const [name, livePath, portPath, type] of PAGES) {
    if (only && only !== name) { continue; }
    await p.navigate("about:blank"); await sleep(200);
    await p.navigate("https://www.isp-sp.com" + livePath); await sleep(5000);
    const at = await p.evaluate("location.href");
    if (!landed(livePath, at)) { console.log("※ " + name + " ── 現行が飛ばされました"); continue; }
    const live = await p.evaluate(EXPR);

    const bound = await openAt(p, type, portPath, 5000);
    if (!bound.ok) { console.log("※ " + name + " ── " + bound.why); continue; }
    const nu = await p.evaluate(EXPR);

    const keys = [...new Set([...Object.keys(live), ...Object.keys(nu)])].sort();
    const rows = [];
    for (const k of keys) {
      const a = live[k] || 0, b = nu[k] || 0;
      if (a !== b) { rows.push([k, a, b]); }
    }
    const lost = rows.filter(r => r[2] < r[1]);
    if (lost.length) { bad += lost.length; }
    console.log("");
    console.log((lost.length ? "※ " : "   ") + name + "   ちがう画像 " + rows.length + " 種類");
    rows.slice(0, 14).forEach(([k, a, b]) =>
      console.log("     " + String(a).padStart(4) + " → " + String(b).padStart(4) + "  " + k.slice(0, 60)));
    if (rows.length > 14) { console.log("     … 他 " + (rows.length - 14) + " 種類"); }
  }
  p.close();
  console.log("");
  console.log(bad ? "※ 現行より減っている画像 " + bad + " 種類" : "OK 減っている画像はありません");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

