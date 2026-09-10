/* ---------------------------------------------------------------------------
   check-css-comments.js — CSSのコメントが正しく閉じているか

   🔴 コメントを1つ壊すと、その後ろのルールが丸ごと消えます

      2026-09-10、コメントに追記したときに閉じ記号を二重にしました。
      2つ目より前が「セレクタ」と解釈され、続くルールごと捨てられます。
      配信されたCSSに文字としては入っているので、grep では見つかりません。
      「直したのに直らない」で時間を取られました。

   🔴 開き記号と閉じ記号の数を数えるやり方は使えません

      現行CSSの302行目に打ち間違いがあります（閉じ記号のつもりで別の字）。
      次の閉じ記号で閉じるので壊れてはいませんが、数は合いません。
      CSSのコメントは入れ子にならないので、**状態を持って読む**のが
      正しい数え方です。

   ⚠️ この説明の中に閉じ記号そのものは書きません。書いた瞬間に、
      このファイルのコメントがそこで終わってしまうためです（実際にやりました）。

     node tools/port/check-css-comments.js
--------------------------------------------------------------------------- */
const fs = require("fs");
const path = require("path");

const FILES = [
  "templates/basic-export/design/m_sys_common.txt",
  "templates/creator/css/tokens.css",
  "templates/creator/css/components.css",
  "templates/creator/css/port-responsive.css",
  "templates/creator/css/freepage.css",
  "templates/creator/css/_extracted-legacy.css",
  "templates/creator/mode/all-pages.css",
  "package/paste/all-pages.css"
];

function scan(file) {
  const s = fs.readFileSync(file, "utf8");
  let i = 0, inC = false, line = 1, openLine = 0, openIdx = -1;
  const strays = [];
  while (i < s.length) {
    if (s[i] === "\n") { line++; i++; continue; }
    if (!inC && s[i] === "/" && s[i + 1] === "*") { inC = true; openLine = line; openIdx = i; i += 2; continue; }
    if (inC && s[i] === "*" && s[i + 1] === "/") { inC = false; i += 2; continue; }
    /* コメントの外にある閉じ記号だけを見ます
     *
     * 最初は「行頭のアスタリスク」で数えて、全称セレクタ（*, *::before）と
     * スターハック（* html …）を誤検知しました。どちらも正しいCSSです。
     * 閉じ過ぎは、**コメントの外に閉じ記号がある**という形でしか出ません。
     * そこだけ見れば誤検知はありません。 */
    if (!inC && s[i] === "*" && s[i + 1] === "/") { strays.push(line); i += 2; continue; }
    i++;
  }
  return { open: inC, openLine: openLine, openIdx: openIdx, strays: strays, src: s };
}

let bad = 0;
for (const f of FILES) {
  if (!fs.existsSync(f)) { continue; }
  const r = scan(f);
  const marks = [];
  if (r.open) {
    marks.push("🔴 " + r.openLine + "行目のコメントが閉じていません");
    bad++;
  }
  if (r.strays.length) {
    marks.push("🔴 閉じたあとにコメントの続きらしい行: " + r.strays.slice(0, 5).join(" ") + "行目");
    bad++;
  }
  console.log((marks.length ? "NG  " : "OK  ") + f.padEnd(48) + marks.join(" / "));
  if (r.open) {
    console.log("      " + r.src.slice(r.openIdx, r.openIdx + 120).split("\n").slice(0, 3).join(" | "));
  }
}

console.log("");
console.log(bad ? "🔴 コメントの閉じ方が壊れています" : "✅ CSSのコメントはすべて正しく閉じています");
if (bad) { process.exit(1); }
