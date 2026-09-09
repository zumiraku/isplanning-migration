/* ---------------------------------------------------------------------------
   sp-redirect.js — スマホの名乗りで /smartphone/ へ飛ぶページ種別を洗います

   🔴 まとめ買い割引（page_type=18）だけ、iPhoneの名乗りで
      `/smartphone/` に飛びました。他の14種別は飛びません。

      これがプレビュー特有なのか、切替後も起きるのかで意味が変わります。
      **PCの名乗りでも飛ぶのか**、**どのURLへ飛ぶのか**を見ます。

     node tools/cdp/sp-redirect.js [page_type…]
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const types = process.argv.slice(2).map(Number).filter(Boolean);
const TYPES = types.length ? types : [18];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run(p, type, mobile) {
  if (mobile) {
    await p.send("Emulation.setDeviceMetricsOverride",
      { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
    await p.send("Network.setUserAgentOverride", { userAgent: IPHONE, platform: "iPhone" });
  } else {
    await p.send("Emulation.clearDeviceMetricsOverride", {});
    await p.send("Network.setUserAgentOverride", { userAgent: "" });
  }
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
  }
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  let url = "";
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    url = await p.evaluate("location.href");
    if (url.indexOf("isp-sp.com") >= 0) { break; }
  }
  await sleep(2500);
  const r = await p.evaluate(`(function(){
    return { url: location.href, title: document.title,
      creator: !!document.querySelector("#headerWrap"),
      text: document.body ? document.body.innerText.replace(/[\\r\\n\\t ]+/g, " ").trim().slice(0, 70) : "" };
  })()`);
  return r;
}

(async () => {
  const p = await page();
  for (const t of TYPES) {
    const pc = await run(p, t, false);
    const sp = await run(p, t, true);
    console.log("page_type " + t);
    console.log("  PC  : " + (pc.url.indexOf("/smartphone/") >= 0 ? "🔴 /smartphone/ " : "") + pc.url.slice(0, 100));
    console.log("        ヘッダー " + (pc.creator ? "○" : "🔴") + " / " + pc.text);
    console.log("  スマホ: " + (sp.url.indexOf("/smartphone/") >= 0 ? "🔴 /smartphone/ " : "") + sp.url.slice(0, 100));
    console.log("        ヘッダー " + (sp.creator ? "○" : "🔴") + " / " + sp.text);
  }
  await p.send("Emulation.clearDeviceMetricsOverride", {});
  await p.send("Network.setUserAgentOverride", { userAgent: "" });
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
