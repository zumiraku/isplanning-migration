const fs = require("fs");
const [file, sel, lenArg] = process.argv.slice(2);
const len = Number(lenArg || 1400);

const buf = fs.readFileSync(file);
let s = buf.toString("utf8");
if (s.indexOf("\uFFFD") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }

const needle = sel.startsWith(".") ? 'class="' + sel.slice(1) : 'id="' + sel;
const i = s.indexOf(needle);
if (i < 0) { console.log("（" + sel + " は見つかりません）"); process.exit(0); }

let start = s.lastIndexOf("<", i);
console.log(s.slice(start, start + len).replace(/\n\s*\n/g, "\n"));

