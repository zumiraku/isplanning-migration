/* ---------------------------------------------------------------------------
   assets-check.js — 画像・CSS・JSが本当に読めているかを、現行と比べます

   ※ 「参照している」ことは数えていましたが、「出ている」かは見ていません

      inventory/assets-referenced.txt はテンプレートに書いてあるURLの一覧です。
      **書いてあるだけでは、出ているとは限りません。** 404でも、テンプレートは
      無事で、未展開タグの検査も位置の検査も通ります。

      実際にブラウザで描いて、img が読めなかったものだけを名指しします。
      現行にも読めない画像はあるので、**現行で読めていて移植版で読めない
      ものだけ**を欠けとして数えます。

     node tools/cdp/assets-check.js
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");
const { PAGES, landed } = require("./pages.js");
const { openAt } = require("./bind.js");

const EXPR = fs.readFileSync(__dirname + "/exprs/assets.js", "utf8");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function key(s) { return String(s).split("  ⟨")[0]; }

(async () => {
  const p = await page();
  let bad = 0;

  console.log("ページ            画像 現行/移植  出ない 現行/移植   CSS 現行/移植   JS 現行/移植");
  const details = [];

  for (const [name, livePath, portPath, type] of PAGES) {
    await p.navigate("about:blank"); await sleep(250);
    await p.navigate("https://www.isp-sp.com" + livePath); await sleep(5000);
    const at = await p.evaluate("location.href");
    if (!landed(livePath, at)) {
      console.log("※ " + name.padEnd(14) + "現行 " + livePath + " は " + at.split("isp-sp.com").pop() + " に飛ばされました。測りません");
      bad++; continue;
    }
    const live = await p.evaluate(EXPR);
    /* ※ ptk のURLに直接行ってはいけません（bind.js の見出しに理由） */
    const bound = await openAt(p, type, portPath, 5000);
    if (!bound.ok) { console.log("※ " + name.padEnd(14) + bound.why); bad++; continue; }
    const nu = await p.evaluate(EXPR);

    const liveBroken = new Set((live.出ていない画像 || []).map(key));
    const newBroken = (nu.出ていない画像 || []).filter(x => !liveBroken.has(key(x)));
    const cssLost = (nu.読めないCSS || []).filter(x => (live.読めないCSS || []).indexOf(x) < 0);

    if (newBroken.length || cssLost.length) { bad += newBroken.length + cssLost.length; }

    console.log((newBroken.length || cssLost.length ? "※ " : "   ") + name.padEnd(14) +
      String(live.画像の数).padStart(5) + "/" + String(nu.画像の数).padEnd(5) +
      String((live.出ていない画像 || []).length).padStart(7) + "/" + String((nu.出ていない画像 || []).length).padEnd(6) +
      String(live.CSSの数).padStart(5) + "/" + String(nu.CSSの数).padEnd(5) +
      String(live.JSの数).padStart(5) + "/" + String(nu.JSの数).padEnd(5));

    if (newBroken.length) {
      details.push(["※ " + name + " ── 移植版でだけ出ていない画像 " + newBroken.length + " 件",
        ...newBroken.slice(0, 12).map(x => "     " + x)].join("\n"));
    }
    if (cssLost.length) {
      details.push(["※ " + name + " ── 移植版でだけ読めないCSS", ...cssLost.map(x => "     " + x)].join("\n"));
    }
    /* JSの出所が増えたり減ったりしていないか */
    const liveJs = new Set((live.JS一覧 || []).map(u => u.replace(/\?.*$/, "")));
    const nuJs = new Set((nu.JS一覧 || []).map(u => u.replace(/\?.*$/, "")));
    const jsLost = [...liveJs].filter(u => !nuJs.has(u));
    if (jsLost.length) {
      details.push(["   " + name + " ── 現行にあって移植版に無いJS " + jsLost.length + " 件",
        ...jsLost.slice(0, 10).map(x => "     " + x)].join("\n"));
    }
  }

  p.close();
  if (details.length) { console.log(""); details.forEach(d => { console.log(d); console.log(""); }); }
  console.log(bad ? "※ 移植版でだけ読めないもの " + bad + " 件"
                  : "OK 現行で出ているものは、移植版でも全部出ています");
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
