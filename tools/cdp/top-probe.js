/* ---------------------------------------------------------------------------
   top-probe.js — トップのプレビューが 52文字しか返さない件を突き止めます

   sp-preview で、**トップだけ**が本文52文字（会員制ページの著作権表示と
   同じ長さ）になります。他の13種別は正常です。

     ・タブの残りではありません（about:blank を挟んでも同じ）
     ・保存済みのHTMLは 14,495文字あります（box-audit）
     ・preview.js が取った top.html は 90,565文字あり、167項目に通っています

   何が起きているのかを、押す前と押した後の両方から見ます。

     node tools/cdp/top-probe.js [page_type]
--------------------------------------------------------------------------- */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = Number(process.argv[3] || 5);   /* 対照実験のために切り替えられます */
const TYPE = Number(process.argv[2] || 2);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  await p.navigate("about:blank");
  await sleep(500);
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE);
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    await sleep(500);
    ready = !!(await p.evaluate("(typeof previewContent === 'function') ? 1 : 0"));
  }
  if (!ready) { console.log("※ 編集画面が開けません"); p.close(); return; }

  /* 押す前 — 何を送ろうとしているか */
  const before = await p.evaluate(`(function () {
    var f = document.formPreview;
    var out = { action: f ? f.action : "(フォーム無し)", fields: [] };
    if (f) {
      Array.from(f.elements).forEach(function (e) {
        var v = String(e.value == null ? "" : e.value);
        out.fields.push((e.name || "(無名)") + " = " +
          (v.length > 60 ? "[" + v.length + "文字] " + v.slice(0, 40).replace(/[\\r\\n\\t ]+/g, " ") : v));
      });
    }
    out.editorHtml = (typeof g_editor_object !== "undefined" && g_editor_object.html_pc)
      ? g_editor_object.html_pc.getValue().length : -1;
    return out;
  })()`);

  console.log("送り先 : " + before.action);
  console.log("編集欄 : " + before.editorHtml + " 文字");
  before.fields.forEach(function (f) { console.log("   " + f); });
  console.log("");

  const wasAt = await p.evaluate("location.href");
  await p.evaluate("document.formPreview.target = '_self'; previewContent(); 1");
  let url = "";
  for (let i = 0; i < 40; i++) {
    await sleep(700);
    url = await p.evaluate("location.href");
    if (url.indexOf("isp-sp.com") >= 0 && url !== wasAt) { break; }
  }
  await sleep(4000);

  const after = await p.evaluate(`(function () {
    var b = document.body;
    return {
      url: location.href,
      title: document.title,
      len: document.documentElement.outerHTML.length,
      text: b ? b.innerText.replace(/[\\r\\n\\t ]+/g, " ").trim().length : 0,
      header: !!document.querySelector("#headerWrap"),
      verify: !!document.querySelector(".verify"),
      head: (b ? b.innerHTML : "").slice(0, 240).replace(/[\\r\\n\\t ]+/g, " ")
    };
  })()`);

  console.log("押した後のURL : " + after.url);
  console.log("タイトル      : " + after.title);
  console.log("HTML全体      : " + after.len + " 文字 / 本文 " + after.text + " 文字");
  console.log("ヘッダー      : " + (after.header ? "あり" : "※ 無し"));
  console.log("会員制の枠    : " + (after.verify ? "※ あり（会員制ページが出ています）" : "無し"));
  console.log("本文の先頭    : " + after.head);

  /* もう一度、同じURLを取り直したらどうなるか */
  const again = await p.evaluate(`fetch(location.href, { cache: "reload" })
    .then(function (r) { return r.text(); })
    .then(function (t) {
      return { status: 200, len: t.length,
               verify: t.indexOf("class=\\"verify\\"") >= 0,
               header: t.indexOf("headerWrap") >= 0 };
    })
    .catch(function (e) { return { err: String(e).slice(0, 60) }; })`);
  console.log("取り直し      : " + JSON.stringify(again));

  const html = await p.evaluate("document.documentElement.outerHTML");
  fs.mkdirSync("tools/cdp/box-out", { recursive: true });
  fs.writeFileSync("tools/cdp/box-out/preview-type" + TYPE + ".html", html);
  console.log("保存          : tools/cdp/box-out/preview-type" + TYPE + ".html");
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
