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
    marks.push("※ " + r.openLine + "行目のコメントが閉じていません");
    bad++;
  }
  if (r.strays.length) {
    marks.push("※ 閉じたあとにコメントの続きらしい行: " + r.strays.slice(0, 5).join(" ") + "行目");
    bad++;
  }
  console.log((marks.length ? "NG  " : "OK  ") + f.padEnd(48) + marks.join(" / "));
  if (r.open) {
    console.log("      " + r.src.slice(r.openIdx, r.openIdx + 120).split("\n").slice(0, 3).join(" | "));
  }
}

console.log("");
console.log(bad ? "※ コメントの閉じ方が壊れています" : "OK CSSのコメントはすべて正しく閉じています");
if (bad) { process.exit(1); }

