const fs = require("fs");

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("使い方: node tools/port/build-calendar.js <公開ページのHTML>");
  process.exit(1);
}

const buf = fs.readFileSync(src);
let s = buf.toString("utf8");
if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }

function block(cls) {
  const start = s.indexOf('<div class="' + cls + '">');
  if (start < 0) { return null; }
  let i = start, depth = 0;
  const re = /<(\/?)div\b[^>]*>/gi;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(s))) {
    depth += m[1] === "/" ? -1 : 1;
    if (depth === 0) { return s.slice(start, m.index + m[0].length); }
    i = m.index;
  }
  return null;
}

const banner = n => [
  "<{* =========================================================================",
  "     営業日カレンダー " + n + "か月目 — 左メニュー用",
  "",
  "     ※ クリエイターモードにカレンダーのタグはありません。",
  "        ベーシックの [CALENDAR" + (n === 1 ? "" : "2") + "] が吐いていた表を、そのまま持ってきたものです。",
  "",
  "     ※ 毎月、手で更新してください。",
  "        月の見出しと日付のセルを直します。休業日のセルは bgcolor と",
  "        読み上げ用の文字で示してあります。色だけにしないでください。",
  "",
  "        更新しないと、先月のカレンダーが出たままになります。",
  "        **移行で新しく増える手間**なので、山口様にお伝えしてあります。",
  "   ========================================================================= *}>"
].join("\n");

let n = 0;
for (const [cls, file, idx] of [["calendar_1", "calendar1", 1], ["calendar_2", "calendar2", 2]]) {
  const b = block(cls);
  if (!b) { console.error("※ ." + cls + " が見つかりません"); continue; }
  fs.writeFileSync("package/modules/" + file + ".tpl", banner(idx) + "\n" + b + "\n");
  console.log("  " + file + ".tpl  " + b.length + " バイト");
  n++;
}
if (n !== 2) { process.exit(1); }
console.log("");
console.log("※ このモジュールは毎月の更新が要ります（クリエイターにタグが無いため）。");

