/* fix-mojibake.js — 二重エンコードした行だけを直す */
const fs = require("fs");

const file = process.argv[2];
if (!file) { console.error("使い方: node tools/port/fix-mojibake.js <ファイル>"); process.exit(1); }

const lines = fs.readFileSync(file, "utf8").split("\n");
let fixed = 0, skipped = 0;

const out = lines.map(function (line) {
  if (!/[ãÂâ]/.test(line)) { return line; }
  let back;
  try { back = Buffer.from(line, "latin1").toString("utf8"); } catch (e) { skipped++; return line; }
  if (back.indexOf("�") >= 0) { skipped++; return line; }
  if (!/[ぁ-んァ-ヶ一-龥]/.test(back)) { skipped++; return line; }
  fixed++;
  return back;
});

fs.writeFileSync(file, out.join("\n"));
console.log(file.split("/").pop() + ": " + fixed + " 行を復号" + (skipped ? " / " + skipped + " 行は戻せず据え置き" : ""));

