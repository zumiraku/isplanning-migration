const fs = require("fs");
const path = require("path");

const SRC = "templates/basic-export/design";
const OUT = "templates/basic-utf8";

fs.mkdirSync(OUT, { recursive: true });

let n = 0, euc = 0, tilde = 0;
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith(".txt")) continue;
  const b = fs.readFileSync(path.join(SRC, f));
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); euc++; }
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const before = (s.split("〜").length - 1);
  s = s.split("〜").join("～");
  tilde += before;

  fs.writeFileSync(path.join(OUT, f.replace(/\.txt$/, ".html")), s);
  n++;
}
console.log("変換 " + n + " ファイル（EUC-JPだったもの " + euc + " 件 / 波ダッシュを全角チルダに " + tilde + " 件）");

