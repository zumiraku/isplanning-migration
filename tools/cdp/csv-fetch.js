/* csv-fetch.js — 出来上がったCSVジョブを取りに行く */
const fs = require("fs");
const path = require("path");
const { page } = require("./cdp.js");

const URL = "https://console.makeshop.jp/products/csv/download-job-list?shopId=isplanning";
const OUT = path.resolve("tools/cdp/csv");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const ROWS = `(function(){
  var out = [];
  Array.from(document.querySelectorAll("tr")).forEach(function (tr) {
    var cells = Array.from(tr.querySelectorAll("td")).map(function (c) {
      return (c.innerText || "").replace(/\\s+/g, " ").trim();
    });
    if (!cells.length) { return; }
    var a = tr.querySelector("a[href], button");
    out.push({ cells: cells, action: a ? ((a.innerText||"").replace(/\\s+/g," ").trim() + " " + (a.getAttribute("href")||"")) : "" });
  });
  return out;
})()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const before = new Set(fs.readdirSync(OUT));
  const p = await page();
  await p.navigate(URL);
  await sleep(5000);
  await p.send("Page.enable");
  await p.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: OUT });

  for (let i = 0; i < 40; i++) {
    const rows = await p.evaluate(ROWS);
    if (i === 0) { rows.slice(0, 4).forEach(r => console.log("  " + r.cells.join(" | ") + "   [" + r.action + "]")); }
    const ready = rows.find(r => /ダウンロード/.test(r.action) && !/受付|処理中|待機/.test(r.cells.join(" ")));
    if (ready) {
      console.log("");
      console.log("取りに行きます: " + ready.cells.join(" | "));
      await p.evaluate(`(function(){
        var rows = Array.from(document.querySelectorAll("tr"));
        for (var i = 0; i < rows.length; i++) {
          var a = rows[i].querySelector("a[href], button");
          if (a && /ダウンロード/.test(a.innerText || "")) { a.click(); return "clicked"; }
        }
        return "none";
      })()`);
      for (let j = 0; j < 40; j++) {
        await sleep(1500);
        const now = fs.readdirSync(OUT).filter(f => !before.has(f) && !f.endsWith(".crdownload"));
        if (now.length) {
          now.forEach(f => console.log("落ちました: " + f + "  " + fs.statSync(path.join(OUT, f)).size + " バイト"));
          p.close(); return;
        }
      }
      console.log("※ 押しましたが落ちてきません");
      p.close(); return;
    }
    await sleep(6000);
    await p.navigate(URL);
    await sleep(4000);
  }
  console.log("※ 出来上がりません");
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

