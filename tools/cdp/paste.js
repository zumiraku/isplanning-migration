/* paste.js — ページ種別のHTMLを流し込んで保存し、**届いたかどうかを読み直す** */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;

const TYPE = {
  common: 1, top: 2, detail: 3, category: 4, search: 5, cart: 6,
  "news-list": 9, "news-detail": 10, guide: 11, company: 12,
  contract: 13, policy: 14
};

const name = process.argv[2];
const file = process.argv[3];
const field = process.argv[4] || "html";

if (!name || !(name in TYPE)) {
  console.error("使い方: node tools/cdp/paste.js <" + Object.keys(TYPE).join("|") + "> [ファイル] [html|css|javascript]");
  process.exit(1);
}
const pageType = TYPE[name];

function lf(s) { return s.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitEditor(p, tries) {
  for (let i = 0; i < (tries || 90); i++) {
    await sleep(500);
    const ok = await p.evaluate(
      "(typeof g_editor_object !== 'undefined' && !!g_editor_object['" + field + "_pc']) ? 1 : 0");
    if (ok) { return true; }
  }
  return false;
}

async function state(p) {
  return p.evaluate(`(function(){
    var ta = document.querySelector('[name="content_${field}_pc"]');
    var ed = (typeof g_editor_object !== "undefined") ? g_editor_object["${field}_pc"] : null;
    return {
      url: location.href,
      login: /login/.test(location.pathname) || /ログイン/.test(document.title),
      set: (document.querySelector('[name=design_set_id]') || {}).value,
      type: (document.querySelector('[name=page_type]') || {}).value,
      taLen: ta ? ta.value.length : -1,
      edLen: ed ? ed.getValue().length : -1,
      head: ed ? ed.getValue().slice(0, 60).replace(/\\s+/g, " ") : ""
    };
  })()`);
}

(async () => {
  const p = await page();
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + pageType);
  if (!await waitEditor(p)) {
    const s = await state(p);
    console.log("※ エディタが出ません。" + (s.login ? "ログインが切れています。" : "URL: " + s.url));
    p.close(); process.exit(1);
  }

  const before = await state(p);
  console.log("開いた: " + name + "（design_set_id=" + before.set + " / page_type=" + before.type + "）");
  console.log("  いまの中身: " + before.edLen + " 文字");
  console.log("  先頭       : " + before.head);

  if (!file) { p.close(); return; }

  const body = lf(fs.readFileSync(file, "utf8"));
  console.log("");
  console.log("流し込む: " + file + "（" + body.length + " 文字）");

  await p.evaluate("g_editor_object['" + field + "_pc'].setValue(" + JSON.stringify(body) + ")");
  const set = await state(p);
  if (set.edLen !== body.length) {
    console.log("※ 入りきっていません: エディタ " + set.edLen + " 文字 / 渡した " + body.length + " 文字");
    p.close(); process.exit(1);
  }
  console.log("  エディタに入りました: " + set.edLen + " 文字");

  await p.evaluate("window.confirm = function(){ return true; }; saveContent(); 1");
  await sleep(4000);

  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + pageType);
  if (!await waitEditor(p)) {
    const s = await state(p);
    console.log("※ 読み直せません。" + (s.login ? "ログインが切れています。" : "URL: " + s.url));
    p.close(); process.exit(1);
  }
  const after = await state(p);

  const live = await p.evaluate("g_editor_object['" + field + "_pc'].getValue()");
  const un = t => t.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)));
  const back = un(live);
  const want = un(body);

  console.log("");
  console.log("読み直した結果");
  console.log("  保存前 : " + before.edLen + " 文字");
  console.log("  渡した : " + body.length + " 文字");
  console.log("  保存後 : " + after.edLen + " 文字（数値参照を戻すと " + back.length + "）");
  if (back === want) {
    console.log("  OK サーバーに届いています（1文字も違いません）");
  } else if (after.edLen === before.edLen) {
    console.log("  ※ 届いていません（中身が変わっていません）");
    p.close(); process.exit(1);
  } else {
    console.log("  ※ 変わりましたが、渡したものと一致しません");
    console.log("     node tools/cdp/diff.js " + name + " " + file + " で中身を見てください");
    p.close(); process.exit(1);
  }
  p.close();
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

