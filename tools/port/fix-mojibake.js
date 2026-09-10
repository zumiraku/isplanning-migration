/* ---------------------------------------------------------------------------
   fix-mojibake.js — 二重エンコードした行だけを直す

   ※ ファイル全体を変換してはいけません

      privacy-body.tpl は**一部だけ**が二重エンコードでした。見出しと
      コメントは壊れていて、本文は正しいUTF-8です。ファイル全体を
      latin1→utf8 で戻すと、正しい部分のほうが壊れます（実際に762文字が
      U+FFFD になりました）。

      なので行ごとに見て、**戻して読める行だけ**を差し替えます。
      戻せない行はそのまま残します。

   判定のしかた

      1. その行に典型的な化け文字（ã Â â）が含まれているか
      2. latin1→utf8 で戻したとき、U+FFFD が出ないか
      3. 戻した結果に日本語が含まれるか

      3つとも満たしたときだけ差し替えます。
--------------------------------------------------------------------------- */
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
