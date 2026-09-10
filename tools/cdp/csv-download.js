/* csv-download.js — 商品CSVを丸ごと落とす（まず控えを取る） */
const fs = require("fs");
const path = require("path");
const { page } = require("./cdp.js");

const URL = "https://console.makeshop.jp/products/csv?shopId=isplanning";
const OUT = path.resolve("tools/cdp/csv");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const before = new Set(fs.readdirSync(OUT));

  const p = await page();
  await p.navigate(URL);
  await sleep(6000);

  await p.send("Page.enable");
  await p.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: OUT });
  await p.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: OUT }).catch(() => {});

  const clicked = await p.evaluate(`(function(){
    var b = Array.from(document.querySelectorAll("button,a")).filter(function (x) {
      return (x.innerText || "").replace(/\\s+/g, "") === "CSVダウンロード";
    })[0];
    if (!b) { return "(ボタンがありません)"; }
    b.click();
    return "opened";
  })()`);
  console.log("ダイアログ: " + clicked);
  await sleep(2500);

  const go = await p.evaluate(`(function(){
    var b = Array.from(document.querySelectorAll("button")).filter(function (x) {
      return (x.innerText || "").indexOf("この内容で決定") >= 0;
    })[0];
    if (!b) { return "(決定ボタンがありません)"; }
    b.click();
    return "submitted";
  })()`);
  console.log("決定: " + go);

  for (let i = 0; i < 60; i++) {
    await sleep(2000);
    const now = fs.readdirSync(OUT).filter(f => !before.has(f) && !f.endsWith(".crdownload"));
    if (now.length) {
      now.forEach(f => console.log("落ちました: " + f + "  " + fs.statSync(path.join(OUT, f)).size + " バイト"));
      p.close();
      return;
    }
  }
  const body = await p.evaluate(`(document.body.innerText||"").replace(/\\s+/g," ").slice(-600)`);
  console.log("※ ファイルが落ちてきません。画面の末尾: " + body);
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

