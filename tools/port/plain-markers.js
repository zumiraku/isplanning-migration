const fs = require("fs");
const { execFileSync } = require("child_process");

const MAP = [
  ["🔴", "※"],
  ["⚠️", "※"],
  ["⚠", "※"],
  ["✅", "OK"],
  ["🟢", "OK"],
  ["❌", "NG"]
];

const SKIP = [
  /^snapshot\//,
  /^tools\/cdp\/category-src\//,
  /^tools\/cdp\/freepage-src\//,
  /^templates\/basic-export\//,
  /^templates\/basic-utf8\//,
  /\.(png|jpg|jpeg|gif|ico|pdf|zip|woff2?)$/i
];

const check = process.argv.indexOf("--check") >= 0;

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n").filter(Boolean)
  .filter(f => !SKIP.some(re => re.test(f)));

let touched = 0, hits = 0;
const perFile = [];

for (const f of files) {
  let s;
  try { s = fs.readFileSync(f, "utf8"); } catch (e) { continue; }
  let n = 0;
  let out = s;
  for (const [from, to] of MAP) {
    const parts = out.split(from);
    if (parts.length > 1) { n += parts.length - 1; out = parts.join(to); }
  }
  if (!n) { continue; }
  hits += n;
  touched++;
  perFile.push([f, n]);
  if (!check) {
    out = out.split("※  ").join("※ ");
    fs.writeFileSync(f, out);
  }
}

perFile.sort((a, b) => b[1] - a[1]);
perFile.slice(0, 8).forEach(([f, n]) => console.log("  " + String(n).padStart(4) + "  " + f));
if (perFile.length > 8) { console.log("  … 他 " + (perFile.length - 8) + " ファイル"); }
console.log("");
console.log((check ? "見つけた記号 " : "置き換えた記号 ") + hits + " 個 / " + touched + " ファイル");

