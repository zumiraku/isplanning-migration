/* sync-ledger.js — タグ台帳を公式リファレンスに追いつかせる */
const fs = require("fs");

const norm = s => s.replace(/\[[^\]]*\]/g, "");

const ref = new Map();
for (const line of fs.readFileSync("inventory/creator-tags-reference.tsv", "utf8").split("\n").slice(1)) {
  if (!line.trim()) continue;
  const [tag, sec] = line.split("\t");
  if (!tag) continue;
  ref.set(norm(tag), sec);
}

const path = "inventory/creator-tags-known.tsv";
const lines = fs.readFileSync(path, "utf8").split("\n");
const have = new Set(lines.map(l => l.split("\t")[0]));

const used = new Set();
for (const dir of ["templates/creator/mode", "package/modules"]) {
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith(".tpl"))) {
    const s = fs.readFileSync(dir + "/" + f, "utf8");
    for (const m of s.matchAll(/\$[a-zA-Z_][a-zA-Z0-9_.\[\]]*/g)) used.add(norm(m[0]));
  }
}

const added = [];
for (const t of used) {
  if (have.has(t)) continue;
  if (!ref.has(t)) continue;
  added.push([t, "confirmed", "reference " + ref.get(t) + "/index.html（tools/fetch-reference.sh で取得）"].join("\t"));
}

if (added.length) {
  const out = lines.filter(l => l.trim()).concat(added).join("\n") + "\n";
  fs.writeFileSync(path, out);
}
console.log("台帳に追加: " + added.length + " 件");
added.forEach(a => console.log("  " + a.split("\t")[0]));

const still = [...used].filter(t => !have.has(t) && !ref.has(t));
if (still.length) {
  console.log("\n※ リファレンスにも無いので、手で理由を書いてください:");
  still.forEach(t => console.log("  " + t));
}

