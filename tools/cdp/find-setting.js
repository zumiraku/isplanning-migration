/* ---------------------------------------------------------------------------
   find-setting.js — 管理画面のメニューから、探している設定の入口を見つけます

     node tools/cdp/find-setting.js 会員 年齢 認証

   URLを当てずっぽうで叩いて 404 を5回並べたので、**メニューを読ませます。**
--------------------------------------------------------------------------- */
const { page } = require("./cdp.js");

const WORDS = process.argv.slice(2);
if (!WORDS.length) { console.error("使い方: node tools/cdp/find-setting.js <語> …"); process.exit(1); }

const PLACES = [
  "https://shop1.makeshop.jp/makeshop/newmanager/main.html",
  "https://shop1.makeshop.jp/makeshop/newmanager/index.html",
  "https://console.makeshop.jp/dashboard?shopId=isplanning",
  "https://console.makeshop.jp/settings?shopId=isplanning"
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  const seen = {};
  for (const at of PLACES) {
    await p.navigate(at);
    await sleep(4000);
    const r = await p.evaluate(`(function(){
      var words = ${JSON.stringify(WORDS)};
      var out = { url: location.href, title: document.title.slice(0, 50), links: [], frames: [] };
      Array.from(document.querySelectorAll("iframe")).forEach(function (f) { out.frames.push(f.src); });
      Array.from(document.querySelectorAll("a")).forEach(function (a) {
        var t = (a.innerText || a.title || "").replace(/[\\r\\n\\t ]+/g, " ").trim();
        if (!t) { return; }
        for (var i = 0; i < words.length; i++) {
          if (t.indexOf(words[i]) >= 0) { out.links.push(t.slice(0, 40) + "  →  " + (a.href || a.getAttribute("onclick") || "").slice(0, 100)); return; }
        }
      });
      return out;
    })()`);
    console.log("--- " + r.url.slice(0, 80) + "  [" + r.title + "]");
    if (r.frames.length) { r.frames.forEach(f => console.log("    枠: " + f.slice(0, 100))); }
    r.links.forEach(function (l) { if (!seen[l]) { seen[l] = 1; console.log("    " + l); } });
    if (!r.links.length) { console.log("    （該当なし）"); }
  }
  p.close();
})().catch(e => { console.error("🔴 " + e.message); process.exit(1); });
