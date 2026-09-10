/* div の開閉を追い、閉じ忘れ・閉じすぎの場所を出す小道具。

   ベーシックのテンプレートは <table><tr><td> をプラットフォームが自動で
   挿入する前提なので、**ファイル単体では釣り合っていません。** 移植では
   自分で閉じる必要があり、どこが足りないかを目で探すのは無理です。 */
const fs = require("fs");
const file = process.argv[2];
const strip = s => s.replace(/<\{\*[\s\S]*?\*\}>/g, "").replace(/<!--[\s\S]*?-->/g, "");
const src = fs.readFileSync(file, "utf8");
const s = strip(src);

const stack = [];
let over = [];
const re = /<(\/?)div\b([^>]*?)(\/?)>/gi;
let m;
while ((m = re.exec(s))) {
  if (m[3] === "/") continue;
  const line = s.slice(0, m.index).split("\n").length;
  if (m[1] === "/") {
    if (stack.length === 0) { over.push(line); continue; }
    stack.pop();
  } else {
    const a = m[2] || "";
    const id = (a.match(/id="([^"]+)"/) || [])[1];
    const cls = (a.match(/class="([^"]+)"/) || [])[1];
    stack.push({ line, label: id ? "#" + id : (cls ? "." + cls.split(" ")[0] : "div") });
  }
}
console.log(file.split("/").pop());
if (!stack.length && !over.length) { console.log("  OK 釣り合っています"); process.exit(0); }
stack.forEach(x => console.log("  ※ 閉じ忘れ  " + x.label + "  (" + x.line + " 行目で開いています)"));
over.forEach(l => console.log("  ※ 閉じすぎ  " + l + " 行目"));
