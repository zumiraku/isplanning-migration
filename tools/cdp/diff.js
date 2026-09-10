/* ---------------------------------------------------------------------------
   diff.js — 保存されている中身を取り出して、手元のファイルと突き合わせる

     node tools/cdp/diff.js contract package/templates/contract.tpl

   文字数が合わないときに「届いていない」と決めつけないための道具です。
   サーバー側が保存時に書き換える文字（実体参照など）があるので、
   **どこがどう違うか**を見ないと判断できません。
--------------------------------------------------------------------------- */
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
if (!name || !(name in TYPE)) { console.error("使い方: node tools/cdp/diff.js <ページ> <ファイル> [html|css|javascript]"); process.exit(1); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const p = await page();
  await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + TYPE[name]);
  let ok = false;
  for (let i = 0; i < 30 && !ok; i++) {
    await sleep(500);
    ok = !!(await p.evaluate("(typeof g_editor_object !== 'undefined' && !!g_editor_object['" + field + "_pc']) ? 1 : 0"));
  }
  if (!ok) { console.log("※ エディタが出ません"); p.close(); process.exit(1); }

  const live = await p.evaluate("g_editor_object['" + field + "_pc'].getValue()");
  p.close();

  if (!file) {
    fs.writeFileSync("tools/cdp/last-fetched.txt", live);
    console.log("保存されている中身: " + live.length + " 文字 → tools/cdp/last-fetched.txt");
    return;
  }

  const mine = fs.readFileSync(file, "utf8").split("\r\n").join("\n");
  const theirs = live.split("\r\n").join("\n");
  console.log("手元       : " + mine.length + " 文字");
  console.log("サーバー側 : " + theirs.length + " 文字");

  if (mine === theirs) { console.log("OK 完全に一致しています"); return; }

  const a = mine.split("\n"), b = theirs.split("\n");
  console.log("行数: 手元 " + a.length + " / サーバー " + b.length);
  let shown = 0;
  for (let i = 0; i < Math.max(a.length, b.length) && shown < 12; i++) {
    if (a[i] === b[i]) { continue; }
    console.log("");
    console.log("  " + (i + 1) + "行目");
    console.log("    手元  : " + String(a[i]).slice(0, 120));
    console.log("    向こう: " + String(b[i]).slice(0, 120));
    shown++;
  }
  if (shown === 0) { console.log("（行ごとの差はありません。改行コードだけの違いです）"); }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });
