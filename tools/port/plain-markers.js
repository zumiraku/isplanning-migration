/* ---------------------------------------------------------------------------
   plain-markers.js — コメントと画面出力の記号を、普通の書き方にそろえます

   絵文字で印を付けていましたが、テキストのログや差分では潰れて読めません。
   端末によっては幅も揃いません。日本語の技術メモでは「※」が普通なので、
   そちらに寄せます。

     ※   注意・引っかかった点（もとの 赤丸 と 警告 の両方）
     OK  通った
     NG  通らなかった

   置き換えるのは追跡しているテキストファイルだけです。取り込んだ
   スナップショットや外部の資産（snapshot/ など）は触りません。

     node tools/port/plain-markers.js --check    件数を見るだけ
     node tools/port/plain-markers.js            書き換える
--------------------------------------------------------------------------- */
const fs = require("fs");
const { execFileSync } = require("child_process");

const MAP = [
  ["🔴", "※"],   /* 赤丸  → ※ */
  ["⚠️", "※"],   /* 警告  → ※ */
  ["⚠", "※"],
  ["✅", "OK"],             /* チェック → OK */
  ["🟢", "OK"],       /* 緑丸   → OK */
  ["❌", "NG"]              /* バツ   → NG */
];

/* 取り込んだ外部ファイルは対象外です */
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
    /* 「※ 」の後ろが二重の空白になることがあるので詰めます */
    out = out.split("※  ").join("※ ");
    fs.writeFileSync(f, out);
  }
}

perFile.sort((a, b) => b[1] - a[1]);
perFile.slice(0, 8).forEach(([f, n]) => console.log("  " + String(n).padStart(4) + "  " + f));
if (perFile.length > 8) { console.log("  … 他 " + (perFile.length - 8) + " ファイル"); }
console.log("");
console.log((check ? "見つけた記号 " : "置き換えた記号 ") + hits + " 個 / " + touched + " ファイル");
