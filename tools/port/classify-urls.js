/* classify-urls.js — サイトマップの全URLを形ごとに分けて、実測済みかを見ます */
const fs = require("fs");

const FILE = "inventory/urls-sitemap.csv";
if (!fs.existsSync(FILE)) { console.error("※ ありません: " + FILE); process.exit(1); }

const TESTED = [
  "/shopdetail/000000003919/",
  "/shopdetail/000000023610/",
  "/shopbrand/003/003/X/",
  "/shopbrand/all_items/",
  "/html/page9.html",
  "/html/page3.html",
  "/nt1201.htm",
  "/"
];

const SHAPES = [
  [/^\/$/,                         "トップ"],
  [/^\/shopdetail\/\d{12}\/?$/,    "商品（12桁）"],
  [/^\/shopdetail\/[^/]+\/?$/,     "商品（その他）"],
  [/^\/shopbrand\/all_items\/?$/,  "すべての商品"],
  [/^\/shopbrand\/[^/]+\/[^/]+\/[^/]+\/?$/, "カテゴリ（3階層）"],
  [/^\/shopbrand\/[^/]+\/?$/,      "カテゴリ（1階層）"],
  [/^\/shopbrand\//,               "カテゴリ（その他）"],
  [/^\/html\/page\d+\.html$/,      "独自ページ"],
  [/^\/html\/[a-z_]+\.html$/,      "案内系ページ"],
  [/^\/html\//,                    "/html/ その他"],
  [/^\/new\/index\.html$/,         "お知らせ一覧"],
  [/^\/new\/[\d-]+\.html$/,        "お知らせ詳細"],
  [/^\/new\//,                     "/new/ その他"],
  [/^\/shop\/basket\.html$/,       "買い物カゴ"],
  [/^\/shop\/shopbrand\.html/,     "検索結果"],
  [/^\/shop\//,                    "/shop/ その他"],
  [/^\/smartphone\//,              "スマホ専用サイト"],
  [/^\/view\//,                    "クリエイターのURL"],
  [/\.htm$/,                       "前サイトからの追加URL（.htm）"],
  [/^\//,                          "その他"]
];

function shapeOf(u) {
  for (const [re, name] of SHAPES) { if (re.test(u)) { return name; } }
  return "（形が取れない）";
}

const text = fs.readFileSync(FILE, "utf8");
const lines = text.split("\n").filter(Boolean);
const head = lines[0];
console.log("見出し: " + head.slice(0, 90));
console.log("");

const tally = {}, sample = {};
let n = 0;
for (let i = 1; i < lines.length; i++) {
  let u = lines[i].split(",")[0].replace(/^﻿/, "").replace(/^"|"$/g, "").trim();
  if (!u) { continue; }
  u = u.replace(/^https?:\/\/www\.isp-sp\.com/i, "");
  if (!u.startsWith("/")) { continue; }
  n++;
  const s = shapeOf(u);
  tally[s] = (tally[s] || 0) + 1;
  if (!sample[s]) { sample[s] = u; }
}

const testedShapes = new Set(TESTED.map(shapeOf));

console.log("サイトマップ " + n + " 本");
console.log("");
console.log("形                            本数   実測  例");
let unchecked = 0;
Object.entries(tally).sort((a, b) => b[1] - a[1]).forEach(function ([s, c]) {
  const done = testedShapes.has(s);
  if (!done) { unchecked += c; }
  console.log((done ? "  OK " : "  ※ ") + s.padEnd(26) + String(c).padStart(6) +
    "   " + (done ? "済" : "未") + "   " + (sample[s] || "").slice(0, 40));
});

console.log("");
console.log("実測した形: " + [...testedShapes].join(" / "));
console.log("");
if (unchecked) {
  console.log("※ 実測していない形に " + unchecked + " 本あります");
} else {
  console.log("OK すべての形が、実測済みの形に収まっています");
}

