/* ---------------------------------------------------------------------------
   category-archetypes.js — 606カテゴリを型に分けて、代表を選びます

   ※ 606カテゴリのうち6件しか実測していませんでした

      商品ページで「1件しか測っていない」ことが実害（商品グループ50点が
      空）につながりました。カテゴリも同じ状態です。

      型で分けて、型ごとに代表を出します。**型が同じなら通り道も同じ**なので、
      代表が通れば型ごと通ったと言えます。逆に、代表の無い型があるなら
      そこは測っていないのと同じです。

     node tools/port/category-archetypes.js
--------------------------------------------------------------------------- */
const fs = require("fs");

const SRC = "package/url-bulk/categories-url.csv";
if (!fs.existsSync(SRC)) { console.error("※ ありません: " + SRC); process.exit(1); }

/* 既に実測しているもの */
const TESTED = ["ct646", "ct5", "ct22", "ct29", "ct667", "ct306"];

const rows = fs.readFileSync(SRC, "utf8").split("\n").filter(Boolean);
const cats = [];
for (const line of rows) {
  const m = line.match(/\/view\/category\/(ct\d+)/);
  const old = line.match(/\/shopbrand\/([^",]+)/);
  if (!m) { continue; }
  cats.push({ ct: m[1], old: old ? old[1] : "" });
}
console.log("カテゴリ " + cats.length + " 件");
console.log("");

/* 旧URLの形で型を分けます */
function shape(old) {
  const parts = old.replace(/\/$/, "").split("/");
  if (old.indexOf("all_items") >= 0) { return "すべての商品"; }
  if (parts.length === 1) { return "ct直書き（1階層）"; }
  if (parts.length === 2) { return "2階層"; }
  if (parts.length === 3) { return "3階層"; }
  return "その他（" + parts.length + "階層）";
}

const groups = {};
for (const c of cats) {
  const s = shape(c.old);
  (groups[s] = groups[s] || []).push(c);
}

console.log("型                    件数   実測済   代表に選ぶもの");
const pick = [];
Object.entries(groups).sort((a, b) => b[1].length - a[1].length).forEach(function ([s, list]) {
  const done = list.filter(c => TESTED.indexOf(c.ct) >= 0);
  let rep = done.length ? done[0].ct : list[0].ct;
  if (!done.length) { pick.push([rep, list[0].old, s]); }
  console.log(s.padEnd(20) + String(list.length).padStart(5) +
    String(done.length).padStart(8) + "   " + rep + (done.length ? "（済）" : " ※ 未"));
});

console.log("");
if (pick.length) {
  console.log("※ 代表の無い型が " + pick.length + " つあります。追加で測るもの:");
  pick.forEach(([ct, old, s]) => console.log("   " + ct.padEnd(10) + "/shopbrand/" + old + "   （" + s + "）"));
} else {
  console.log("OK どの型にも実測済みの代表があります");
}
