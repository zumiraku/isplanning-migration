/* ---------------------------------------------------------------------------
   csv-upload.js — 商品CSVを流し込む

     node tools/cdp/csv-upload.js tools/cdp/csv/test-one.csv

   ⚠️ 商品データを書き換えます。取り消しは、控えのCSVを流し直すことでしか
      できません。**控え: tools/cdp/csv/20260909181742.csv**

   ⚠️ 「ショップに適用」より前に流すと、切り替えまでのあいだ
      PC・スマホの商品ページに表が二重に出ます。
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");
const { page } = require("./cdp.js");

const AT = "https://console.makeshop.jp/products/csv/upload?shopId=isplanning";
const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error("使い方: node tools/cdp/csv-upload.js <CSVファイル>");
  process.exit(1);
}
const full = path.resolve(file);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  await p.navigate(AT);
  for (let i = 0; i < 30; i++) {
    await sleep(600);
    if (await p.evaluate('document.querySelector("input[type=file]") ? 1 : 0')) { break; }
  }
  if (!await p.evaluate('document.querySelector("input[type=file]") ? 1 : 0')) {
    console.log("🔴 ファイル欄が出ません"); p.close(); process.exit(1);
  }

  /* ファイル欄に実ファイルを差し込みます（画面から選ぶのと同じことです） */
  await p.send("DOM.enable");
  const doc = await p.send("DOM.getDocument", { depth: 1 });
  const root = doc.result.root.nodeId;
  const q = await p.send("DOM.querySelector", { nodeId: root, selector: 'input[type="file"]' });
  if (!q.result || !q.result.nodeId) { console.log("🔴 ファイル欄が見つかりません"); p.close(); process.exit(1); }
  await p.send("DOM.setFileInputFiles", { nodeId: q.result.nodeId, files: [full] });
  await sleep(1500);

  const named = await p.evaluate(`(function(){
    var f = document.querySelector("input[type=file]");
    return f && f.files && f.files.length ? f.files[0].name + " / " + f.files[0].size + " バイト" : "(入っていません)";
  })()`);
  console.log("選んだファイル: " + named);
  if (named.indexOf("入っていません") >= 0) { p.close(); process.exit(1); }

  const go = await p.evaluate(`(function(){
    var b = Array.from(document.querySelectorAll("button")).filter(function (x) {
      return (x.innerText || "").replace(/\\s+/g, "") === "アップロード";
    }).pop();
    if (!b) { return "(アップロードのボタンがありません)"; }
    if (b.disabled) { return "(ボタンが押せません)"; }
    b.click();
    return "押しました";
  })()`);
  console.log(go);

  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    const t = await p.evaluate(`(document.body.innerText||"").replace(/\\s+/g," ")`);
    if (/受け付け|完了|エラー|失敗|処理結果/.test(t)) {
      console.log("");
      console.log(t.slice(-500));
      break;
    }
  }
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
