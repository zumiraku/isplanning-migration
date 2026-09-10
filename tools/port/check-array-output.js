/* ---------------------------------------------------------------------------
   check-array-output.js — 配列をそのまま出している箇所を探します

   ※ 商品グループ50点が、画面に "Array" とだけ出ていました

      `<{$item.group}>` と書いていました。`$item.group` は配列なので、
      そのまま出すと **"Array" という文字**になります。中身は1件も出ません。

      見出しは出るので、未展開タグの検査もリンクの検査も位置の検査も
      全部通り抜けました。**枠の中を数えて初めて分かりました。**

      同じ書き方が他にないかを、機械で洗います。

      見分け方は「`.list` や `has_item` を持つ名前を、葉として出しているか」。
      たとえば `$item.group` は `$item.group.list` と `$item.group.has_item`
      があるので、`<{$item.group}>` は葉ではありません。

     node tools/port/check-array-output.js
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");

const DIRS = ["package/templates", "package/modules", "tools/cdp/freepage-out"];
const LEDGER = "inventory/creator-tags-reference.tsv";

/* 台帳から「子を持つ名前」を集めます */
const parents = new Set();
if (fs.existsSync(LEDGER)) {
  const text = fs.readFileSync(LEDGER, "utf8");
  for (const line of text.split("\n")) {
    const tag = line.split("\t")[0];
    if (!tag || !tag.startsWith("$")) { continue; }
    const parts = tag.split(".");
    for (let i = 1; i < parts.length; i++) {
      parents.add(parts.slice(0, i).join("."));
    }
  }
}
console.log("子を持つ名前: " + parents.size + " 件（台帳から）");
console.log("");

const OUT = /<\{\s*\$([A-Za-z0-9_.\[\]]+?)\s*\}>/g;
let flagged = 0, checked = 0;

for (const dir of DIRS) {
  if (!fs.existsSync(dir)) { continue; }
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(tpl|html)$/.test(f)) { continue; }
    const s = fs.readFileSync(path.join(dir, f), "utf8");
    OUT.lastIndex = 0;
    let m;
    const hits = [];
    while ((m = OUT.exec(s))) {
      checked++;
      /* 配列の添字を外して名前だけにします */
      const name = "$" + m[1].replace(/\[[^\]]*\]/g, "");
      if (!parents.has(name)) { continue; }
      /* section の loop に渡しているものは正しい使い方です */
      const before = s.slice(Math.max(0, m.index - 60), m.index);
      if (/loop\s*=\s*$/.test(before)) { continue; }
      hits.push({ tag: m[0], line: s.slice(0, m.index).split("\n").length });
    }
    if (hits.length) {
      flagged += hits.length;
      console.log("※ " + path.join(dir, f));
      hits.slice(0, 6).forEach(h => console.log("     " + h.line + " 行目  " + h.tag));
    }
  }
}

console.log("");
console.log("出力タグ " + checked + " 箇所を見ました");
console.log(flagged ? "※ 配列をそのまま出している疑い " + flagged + " 箇所"
                    : "OK 配列をそのまま出している箇所はありません");
if (flagged) { process.exit(1); }
