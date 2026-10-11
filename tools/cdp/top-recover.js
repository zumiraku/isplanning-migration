const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function preview(p, type) {
  await p.navigate("about:blank");
  await sleep(400);
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    if (await p.evaluate("(typeof previewContent === 'function') ? 1 : 0")) { break; }
  }
  const wasAt = await p.evaluate("location.href");
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    const u = await p.evaluate("location.href");
    if (u.indexOf("isp-sp.com") >= 0 && u !== wasAt) { break; }
  }
  await sleep(3000);
  return p.evaluate(`(function(){
    return { url: location.href.slice(0, 70),
             verify: !!document.querySelector(".verify"),
             header: !!document.querySelector("#headerWrap"),
             text: document.body ? document.body.innerText.replace(/[\\r\\n\\t ]+/g, " ").trim().length : 0 };
  })()`);
}

(async () => {
  const p = await page();

  console.log("① いまのトップ");
  console.log("   " + JSON.stringify(await preview(p, 2)));

  console.log("");
  console.log("② キャッシュを外して同じURLを取り直す");
  const bust = await p.evaluate(`(function(){
    var u = location.href + "&_=" + Date.now();
    return fetch(u, { cache: "no-store" }).then(function (r) { return r.text(); }).then(function (t) {
      return { len: t.length, verify: t.indexOf("class=\\"verify\\"") >= 0, header: t.indexOf("headerWrap") >= 0 };
    }).catch(function (e) { return { err: String(e).slice(0, 60) }; });
  })()`);
  console.log("   " + JSON.stringify(bust));

  console.log("");
  console.log("③ 商品詳細をはさむ（別のURLのプレビュー）");
  console.log("   " + JSON.stringify(await preview(p, 3)));

  console.log("");
  console.log("④ もう一度トップ");
  console.log("   " + JSON.stringify(await preview(p, 2)));

  console.log("");
  console.log("⑤ トップを続けて2回");
  console.log("   " + JSON.stringify(await preview(p, 2)));

  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

