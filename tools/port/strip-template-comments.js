const fs = require("fs");
const path = require("path");

const DIRS = ["package/templates", "package/modules", "package/probe", "tools/cdp/probes", "templates/creator/mode", "tools/cdp/freepage-out", "package/freepages", "contingency", "templates/creator/port-src"];

function strip(s) {
  return s.replace(/<\{\*[\s\S]*?\*\}>[ \t]*\r?\n?/g, "").replace(/\n{3,}/g, "\n\n");
}

let files = 0, saved = 0;
for (const d of DIRS) {
  if (!fs.existsSync(d)) { continue; }
  for (const f of fs.readdirSync(d)) {
    if (!/\.tpl$/.test(f)) { continue; }
    const p = path.join(d, f);
    const src = fs.readFileSync(p, "utf8");
    const out = strip(src);
    if (out === src) { continue; }
    fs.writeFileSync(p, out);
    files++;
    saved += src.length - out.length;
  }
}
console.log("  Smarty コメントを落としました: " + files + " ファイル / " + saved + " 文字");
