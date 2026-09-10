/* build-top.js — トップページを移植する */
const fs = require("fs");
const { shell } = require("./shell.js");
const { grid, ranking, news } = require("./items.js");
const { tiles } = require("./_tiles.js");
const { rewrite } = require("./url-map.js");

let body = fs.readFileSync("templates/basic-utf8/design_mainpage.html", "utf8");

body = body.replace(/^\s*<div class="M_mainContents">\s*/, "");

body = body.replace("[NEWSEVENT2N]", news());
body = body.replace('href="/new/index.html?mode=list"', 'href="<{$url.news}>"');

body = body.replace("[IF_RANKING]", "<{if $ranking_item.has_item}>")
           .replace("[ENDIF_RANKING]", "<{/if}>");
const rankStart = body.indexOf("[RANKING_1_5]");
const rankEnd = body.indexOf("[ENDRANKING]") + "[ENDRANKING]".length;
if (rankStart < 0 || rankEnd < 0) { console.error("ランキングの範囲が取れません"); process.exit(1); }
body = body.slice(0, rankStart) + ranking() + body.slice(rankEnd);

body = body.replace("[NEW1NN]", grid("$new_item", "nw2", 16));
body = body.replace("[SUISEN1NN]", grid("$recommend_item", "rc", 12));
body = body.replace('href="/shop/shopbrand.html?search="', 'href="<{$url.top}>"');

const revStart = body.indexOf("[IF_REVIEW]");
const revEnd = body.indexOf("[ENDIF_REVIEW]") + "[ENDIF_REVIEW]".length;
if (revStart < 0 || revEnd < 0) { console.error("レビュー枠の範囲が取れません"); process.exit(1); }
body = body.slice(0, revStart) + body.slice(revEnd);


body = body.replace("[IF_RECENT]", "<{if $recently_item.has_item}>")
           .replace("[ENDIF_RECENT]", "<{/if}>");
body = body.replace("[RECENT2]",
  tiles({ list: "$recently_item.list", name: "rcn", tableId: "recent", perRow: 4 }));

body = body.split("<!--.mainContents--></div>").join("");

const r = rewrite(body);
body = r.html;

const out = shell({ name: "トップ", from: "mainpage", slider: true, body: body.trim() });
fs.writeFileSync("templates/creator/mode/top.tpl", out);

console.log("トップ: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{3,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));

