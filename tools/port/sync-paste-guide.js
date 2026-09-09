/* ---------------------------------------------------------------------------
   sync-paste-guide.js — 貼り付け手順書の「行数」を、実物に合わせる

   🔴 手順書の数字がずれていました

      docs/paste-guide.md は、貼ったあとに「行数が合っているか」を
      見てもらうための表です。ところが移植をやり直すたびに実物だけが
      変わり、**表の数字は最初に書いたまま**でした。

        header    88 行 → 実物 110 行
        top      267 行 → 実物 277 行
        CSS    8,851 行 → 実物 9,023 行（177KB → 185KB）

      19個のうち19個ぜんぶずれていました。**数えて確かめてもらう表が
      間違っている**と、合っていても「違う」と見え、本当に貼り損ねても
      気づけません。手順書はいちばん人が信じるものなので、いちばん
      ずれてはいけません。

   使い方
     node tools/port/sync-paste-guide.js          数字を書き直す
     node tools/port/sync-paste-guide.js --check  ずれていたら失敗する

   ⚠️ 正規表現を使いません。このリポジトリでは、シェル経由で書いた
      バックスラッシュが何度も落ちました。表の行は「|」で割れば足ります。
--------------------------------------------------------------------------- */
const fs = require("fs");

const MD = "docs/paste-guide.md";
const CHECK = process.argv.indexOf("--check") >= 0;

function comma(n) {
  const s = String(n);
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) { out += ","; }
    out += s[i];
  }
  return out;
}

function isNumberCell(c) {
  if (!c.length) { return false; }
  for (const ch of c) { if ("0123456789,".indexOf(ch) < 0) { return false; } }
  return true;
}

const lines = fs.readFileSync(MD, "utf8").split("\n");
const diffs = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.indexOf("|") !== 0) { continue; }
  const cells = line.split("|");

  /* ファイルのセルを探します（`package/…` をバッククォートで囲んだもの） */
  let fileAt = -1, file = null;
  for (let c = 0; c < cells.length; c++) {
    const t = cells[c].trim();
    if (t.length > 2 && t[0] === "`" && t[t.length - 1] === "`") {
      const p = t.slice(1, -1);
      if (p.indexOf("package/") === 0) { fileAt = c; file = p; }
    }
  }
  if (fileAt < 0) { continue; }
  if (!fs.existsSync(file)) { diffs.push(file + " : ファイルがありません"); continue; }

  const buf = fs.readFileSync(file);
  const text = buf.toString("utf8");
  /* 末尾の改行で1行余分に数えないようにします */
  const rows = text.length === 0 ? 0
    : text.split("\n").length - (text[text.length - 1] === "\n" ? 1 : 0);

  for (let c = fileAt + 1; c < cells.length; c++) {
    const t = cells[c].trim();
    if (isNumberCell(t)) {
      const want = comma(rows);
      if (t !== want) {
        diffs.push(file + " : 行数 " + t + " → " + want);
        cells[c] = cells[c].replace(t, want);
      }
      break;
    }
  }
  for (let c = fileAt + 1; c < cells.length; c++) {
    const t = cells[c].trim();
    if (t.length > 2 && t.slice(-2) === "KB") {
      const want = Math.round(buf.length / 1024) + "KB";
      if (t !== want) {
        diffs.push(file + " : 大きさ " + t + " → " + want);
        cells[c] = cells[c].replace(t, want);
      }
      break;
    }
  }
  lines[i] = cells.join("|");
}

if (!diffs.length) {
  console.log("OK  手順書の行数・大きさは実物と一致しています");
  process.exit(0);
}
if (CHECK) {
  console.log("🔴 手順書の数字が実物とずれています");
  diffs.forEach(d => console.log("   " + d));
  console.log("");
  console.log("   node tools/port/sync-paste-guide.js で直せます");
  process.exit(1);
}
fs.writeFileSync(MD, lines.join("\n"));
console.log("書き直し: " + MD);
diffs.forEach(d => console.log("   " + d));
