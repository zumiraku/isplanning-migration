/* ---------------------------------------------------------------------------
   file-eval.js — 手元のHTMLファイルを実ブラウザで開いて、式を走らせます

     node tools/cdp/file-eval.js mirror/detail.html tools/cdp/exprs/overflow-who.js 375

   写し（mirror/）を測るために作りました。プレビューと違って結び直しが
   要らないので、幅を変えながら何度でも測れます。
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const { page } = require("./cdp.js");

const file = process.argv[2];
const exprFile = process.argv[3];
const width = Number(process.argv[4] || 1280);
if (!file || !exprFile) {
  console.error("使い方: node tools/cdp/file-eval.js <HTMLファイル> <式のファイル> [幅]");
  process.exit(1);
}
const FULL = path.resolve(file);
if (!fs.existsSync(FULL)) { console.error("※ ありません: " + FULL); process.exit(1); }
const EXPR = fs.readFileSync(exprFile, "utf8");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  await p.send("Emulation.setDeviceMetricsOverride",
    { width: width, height: 900, deviceScaleFactor: 1, mobile: false });
  await p.navigate("file:///" + FULL.replace(/\\/g, "/"));
  await sleep(4000);
  const r = await p.evaluate(EXPR);
  await p.send("Emulation.clearDeviceMetricsOverride", {});
  p.close();
  console.log(file + "  " + width + "px");
  console.log(JSON.stringify(r, null, 2));
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
