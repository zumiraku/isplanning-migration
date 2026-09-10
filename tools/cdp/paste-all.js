/* paste-all.js — 11ページ種別と全ページ共通を、まとめて流し込んで確かめる */
const fs = require("fs");
const { page } = require("./cdp.js");

const BASE = "https://shop1.makeshop.jp/makeshop/newmanager/flex_design_page_editor.html";
const SET = 5;

const JOBS = [
  ["common", 1, "css", "package/paste/all-pages.css"],
  ["common", 1, "javascript", "package/paste/all-pages.js"],
  ["top", 2, "html", "package/templates/top.tpl"],
  ["detail", 3, "html", "package/templates/detail.tpl"],
  ["category", 4, "html", "package/templates/category.tpl"],
  ["search", 5, "html", "package/templates/search.tpl"],
  ["cart", 6, "html", "package/templates/cart.tpl"],
  ["news-list", 9, "html", "package/templates/news-list.tpl"],
  ["news-detail", 10, "html", "package/templates/news-detail.tpl"],
  ["guide", 11, "html", "package/templates/guide.tpl"],
  ["company", 12, "html", "package/templates/company.tpl"],
  ["contract", 13, "html", "package/templates/contract.tpl"],
  ["policy", 14, "html", "package/templates/policy.tpl"]
];

const only = process.argv[2];
function lf(s) { return s.split(String.fromCharCode(13) + String.fromCharCode(10)).join(String.fromCharCode(10)); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function unescapeNum(s) { return s.replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n))); }

async function ready(p, field) {
  for (let i = 0; i < 40; i++) {
    await sleep(500);
    const ok = await p.evaluate(
      "(typeof g_editor_object !== 'undefined' && !!g_editor_object['" + field + "_pc']) ? 1 : 0");
    if (ok) { return true; }
  }
  return false;
}

(async () => {
  const p = await page();
  const results = [];

  for (const [name, type, field, file] of JOBS) {
    if (only && only !== name) { continue; }
    const label = (name + "/" + field).padEnd(20);
    const body = lf(fs.readFileSync(file, "utf8"));

    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    if (!await ready(p, field)) {
      console.log(label + "※ エディタが出ません（ログイン切れの可能性）");
      results.push([name + "/" + field, "エディタ無し"]);
      continue;
    }

    const before = await p.evaluate("g_editor_object['" + field + "_pc'].getValue().length");
    await p.evaluate("g_editor_object['" + field + "_pc'].setValue(" + JSON.stringify(body) + ")");
    const inEditor = await p.evaluate("g_editor_object['" + field + "_pc'].getValue().length");
    if (inEditor !== body.length) {
      console.log(label + "※ エディタに入りきりません " + inEditor + "/" + body.length);
      results.push([name + "/" + field, "入りきらない"]);
      continue;
    }

    await p.evaluate("window.confirm = function(){ return true; }; saveContent(); 1");
    await sleep(4500);

    await p.navigate(BASE + "?design_set_id=" + SET + "&page_type=" + type);
    if (!await ready(p, field)) {
      console.log(label + "※ 読み直せません");
      results.push([name + "/" + field, "読み直せない"]);
      continue;
    }
    const live = await p.evaluate("g_editor_object['" + field + "_pc'].getValue()");
    const back = unescapeNum(live);

    if (back === unescapeNum(body)) {
      console.log(label + "OK " + before + " → " + body.length + " 文字");
      results.push([name + "/" + field, "一致"]);
    } else if (live.length === before) {
      console.log(label + "※ 届いていません（" + before + " 文字のまま）");
      results.push([name + "/" + field, "届かず"]);
    } else {
      console.log(label + "※ 変わったが一致しない " + before + " → " + live.length + "（渡した " + body.length + "）");
      results.push([name + "/" + field, "不一致"]);
    }
  }

  p.close();
  console.log("");
  const ng = results.filter(r => r[1] !== "一致");
  console.log("合計 " + results.length + " 件 / 一致 " + (results.length - ng.length) + " 件");
  if (ng.length) {
    console.log("※ 通っていないもの:");
    ng.forEach(r => console.log("   " + r[0] + "  " + r[1]));
    process.exit(1);
  }
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

