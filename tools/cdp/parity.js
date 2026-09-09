/* ---------------------------------------------------------------------------
   parity.js — 公開中のページの文言が、配信されたプレビューに出ているか

     node tools/cdp/parity.js

   tools/port/check-content-parity.js を、実際に配信されたHTMLに対して回します。
   **無いものは検査できない**というのが差し戻しの原因でした。現行の文言を
   1つずつ持ってきて、出ているかどうかを数えます。
--------------------------------------------------------------------------- */
const { execFileSync } = require("child_process");
const fs = require("fs");

const LIVE = process.env.LIVE_DIR ||
  (process.env.TEMP || "").split("\\").join("/") +
  "/claude/c--Users-Administrator-Documents-my-work-isplanning-migration/526d844c-8f7e-4727-bda4-06d3cd51b38e/scratchpad/basic";

const PAIRS = [
  ["p-company.html", "company", "会社概要"],
  ["p-contract.html", "contract", "特定商取引法"],
  ["p-guide.html", "guide", "ご利用案内"]
];

for (const [live, mine, label] of PAIRS) {
  const a = LIVE + "/" + live;
  const b = "tools/cdp/preview-out/" + mine + ".html";
  if (!fs.existsSync(a)) { console.log("🔴 現行ページがありません: " + a); continue; }
  if (!fs.existsSync(b)) { console.log("🔴 プレビューがありません: " + b); continue; }
  const out = execFileSync("node", ["tools/port/check-content-parity.js", a, b, label], { encoding: "utf8" });
  console.log(out.split("\n").slice(0, 14).join("\n"));
}
