/* ---------------------------------------------------------------------------
   pair-eval.js — 同じ式を、現行と移植版の同じ商品で走らせます

     node tools/cdp/pair-eval.js tools/cdp/exprs/tab3.js 051000000001

   商品コードの代わりにパスを渡すこともできます（先頭が / のとき）。
     node tools/cdp/pair-eval.js tools/cdp/exprs/tab3.js /shopbrand/ct646 /view/category/ct646
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const PTK = "45bdf24edcff928f2fc86d299ab4a0dd03aeee10";
const exprFile = process.argv[2];
const a = process.argv[3];
const b = process.argv[4];
if (!exprFile || !a) {
  console.error("使い方: node tools/cdp/pair-eval.js <式のファイル> <商品コード|現行パス> [移植版パス]");
  process.exit(1);
}
const EXPR = fs.readFileSync(exprFile, "utf8");
const liveUrl = a.startsWith("/") ? "https://www.isp-sp.com" + a
                                  : "https://www.isp-sp.com/shopdetail/" + a + "/";
const portUrl = a.startsWith("/") ? "https://www.isp-sp.com" + b + (b.indexOf("?") >= 0 ? "&" : "?") + "ptk=" + PTK
                                  : "https://www.isp-sp.com/view/item/" + a + "?ptk=" + PTK;

/* ブラウザのキャッシュに当たらないよう、毎回ちがう問合せを付けます */
const BUST = "zq=" + Date.now();
function bust(u) { return u + (u.indexOf("?") >= 0 ? "&" : "?") + BUST; }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function show(label, r) {
  console.log("── " + label);
  if (!r || r.found === false) { console.log("   見つかりません"); return; }
  Object.keys(r).forEach(function (k) {
    const v = r[k];
    if (Array.isArray(v)) {
      console.log("   " + k + " (" + v.length + ")");
      v.slice(0, 40).forEach(x => console.log("      " + String(x).slice(0, 120)));
    } else {
      console.log("   " + k + " : " + String(v).slice(0, 400));
    }
  });
}

(async () => {
  const p = await page();
  await p.navigate("about:blank"); await sleep(250);
  await p.navigate(bust(liveUrl)); await sleep(4500);
  const live = await p.evaluate(EXPR);
  await p.navigate("about:blank"); await sleep(250);
  await p.navigate(bust(portUrl)); await sleep(4500);
  const nu = await p.evaluate(EXPR);
  p.close();
  show("現行  " + liveUrl, live);
  console.log("");
  show("移植版 " + portUrl, nu);
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
