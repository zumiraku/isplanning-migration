/* ---------------------------------------------------------------------------
   layout-audit.js — 重なり・親からのはみ出し・文字切れ・つぶれ を全ページで拾う

   🔴 「横にはみ出していない」だけを測っていました

      山口様のご指摘は**ズレと重なり**です。画面の外に出ていなくても、
      文字が文字に重なっていれば読めません。これまでの検査は
      1件も見ていませんでした。

     node tools/cdp/layout-audit.js            全ページ・1280と375
     node tools/cdp/layout-audit.js top 375    1つだけ
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const EXPR = fs.readFileSync(__dirname + "/exprs/overlap.js", "utf8");

const PAGES = [
  ["トップ", 2], ["商品詳細", 3], ["商品カテゴリー", 4], ["商品検索結果", 5],
  ["買い物カゴ", 6], ["レビュー一覧", 7], ["レビュー投稿", 8],
  ["お知らせ一覧", 9], ["お知らせ詳細", 10], ["利用案内", 11],
  ["会社概要", 12], ["特定商取引法", 13], ["プライバシー", 14]
];

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const onlyName = process.argv[2];
const onlyWidth = Number(process.argv[3] || 0);
const WIDTHS = onlyWidth ? [onlyWidth] : [1280, 375];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  let total = 0;

  for (const [name, type] of PAGES) {
    if (onlyName && onlyName !== name) { continue; }
    for (const w of WIDTHS) {
      const mobile = w < 700;
      await p.send("Emulation.setDeviceMetricsOverride",
        { width: w, height: 900, deviceScaleFactor: 1, mobile: mobile });
      await p.send("Network.setUserAgentOverride",
        { userAgent: mobile ? IPHONE : "", platform: mobile ? "iPhone" : "" });

      await p.navigate("about:blank");
      await sleep(300);
      await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
      let ready = false;
      for (let i = 0; i < 60 && !ready; i++) {
        await sleep(500);
        ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
      }
      if (!ready) { console.log(name + " " + w + "  🔴 編集画面が開けません"); continue; }
      const wasAt = await p.evaluate("location.href");
      await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
      for (let i = 0; i < 40; i++) {
        await sleep(700);
        const u = await p.evaluate("location.href");
        if (u.indexOf("isp-sp.com") >= 0 && u !== wasAt) { break; }
      }
      await sleep(3800);
      await p.evaluate("window.scrollTo(0, document.body.scrollHeight); 1");
      await sleep(1200);
      await p.evaluate("window.scrollTo(0, 0); 1");
      await sleep(700);

      const r = await p.evaluate(EXPR);
      const c = r.count;
      const sum = c.重なり + c.親からはみ出し + c.文字切れ + c.つぶれ;
      total += sum;
      console.log((name + " " + w + "px").padEnd(22) +
        (sum ? "🔴 " : "✅ ") +
        "重なり " + String(c.重なり).padStart(3) +
        " / 親からはみ出し " + String(c.親からはみ出し).padStart(3) +
        " / 文字切れ " + String(c.文字切れ).padStart(2) +
        " / つぶれ " + String(c.つぶれ).padStart(2));
      r.overlaps.forEach(function (o) {
        console.log("      重なり " + o.pct + "%  " + o.a + "  ×  " + o.b);
      });
      r.outOfParent.forEach(function (o) {
        console.log("      はみ出し " + o.what + "  （" + o.parent + " から 右" + o.右 + " 左" + o.左 + " 下" + o.下 + "）");
      });
      r.clipped.forEach(function (o) { console.log("      文字切れ " + o); });
      r.tiny.forEach(function (o) { console.log("      つぶれ " + o); });
    }
  }

  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
  console.log("");
  console.log(total ? "🔴 気になるもの 合計 " + total + " 件" : "✅ 重なりもズレもありません");
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
