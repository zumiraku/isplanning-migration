/* category-extra.js — カテゴリごとの独自内容を、モジュールに集める */
const fs = require("fs");
const https = require("https");
const { rewrite } = require("../port/url-map.js");

const OUT = "package/modules/category_extra.tpl";
const SRC = "tools/cdp/category-src";
const MAP = "package/url-bulk/categories-url.csv";

function get(path) {
  return new Promise((ok, ng) => {
    const rq = https.get({ host: "www.isp-sp.com", path, timeout: 25000 }, res => {
      const c = [];
      res.on("data", d => c.push(d));
      res.on("end", () => ok({ status: res.statusCode, body: Buffer.concat(c) }));
    });
    rq.on("error", ng);
    rq.on("timeout", () => { rq.destroy(); ng(new Error("timeout")); });
  });
}
function decode(buf) {
  let s = buf.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(buf); }
  return s.replace(/\r\n/g, "\n");
}
const NL = String.fromCharCode(10);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function pairs() {
  const rows = fs.readFileSync(MAP, "utf8").split("\n").filter(Boolean);
  const out = [];
  for (const r of rows) {
    const m = r.match(/\/view\/category\/(ct\d+)[^,]*,[^,]*,\d+,([^,]+),/);
    if (!m) { continue; }
    out.push({ code: m[1], live: m[2] });
  }
  return out;
}

const BOTTOM_STOP = [
  '<h3>こちらの商品もおすすめです。</h3>',
  '<div class="O_ItemLine">',
  '<ul class="pagenavi',
  'id="r_recommend',
  'id="r_new',
  '<p class="pageTop">',
  '<div id="colum-wrap"'
];

function extraBottom(body) {
  const start = body.indexOf('<h2 class="categorybottom"');
  if (start < 0) { return null; }
  let end = body.length;
  for (const e of BOTTOM_STOP) {
    const at = body.indexOf(e, start);
    if (at >= 0 && at < end) { end = at; }
  }
  return body.slice(start, end);
}

function extra(body) {
  const end = body.indexOf('<div class="O_ItemLine">');
  if (end < 0) { return null; }
  let start = -1;
  const dot = body.lastIndexOf("brand_mcode_dot0.gif", end);
  if (dot > 0) {
    const close = body.indexOf("</table>", body.lastIndexOf("</tr>", end));
    if (close > 0 && close < end) { start = close + "</table>".length; }
  }
  if (start < 0) {
    const h2 = body.lastIndexOf("</h2>", end);
    if (h2 > 0) { start = h2 + "</h2>".length; }
  }
  if (start < 0 || start >= end) { return null; }
  return body.slice(start, end);
}

(async () => {
  fs.mkdirSync(SRC, { recursive: true });
  const list = pairs();
  console.log("対応表のカテゴリ: " + list.length + " 件");

  const blocks = [];
  const bottoms = [];
  let empty = 0, failed = 0;
  for (const { code, live } of list) {
    const at = SRC + "/" + code + ".html";
    let html;
    if (fs.existsSync(at) && fs.statSync(at).size > 2000) {
      html = decode(fs.readFileSync(at));
    } else {
      const r = await get(live);
      if (r.status !== 200 || r.body.length < 2000) { console.log("※ 取れない " + code + " " + live + " " + r.status); failed++; continue; }
      fs.writeFileSync(at, r.body);
      html = decode(r.body);
      await sleep(120);
    }
    const body = html.slice(html.search(/<body\b/i));
    const seg = extra(body);
    if (seg === null) { console.log("※ 切り出せない " + code); failed++; continue; }
    const text = seg.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length < 10 && seg.indexOf("<img") < 0) { empty++; continue; }
    blocks.push({ code, html: rewrite(seg.split("〜").join("～")).html.trim() });
    const low = extraBottom(body);
    if (low && low.trim().length > 10) {
      bottoms.push({ code, html: rewrite(low.split("〜").join("～")).html.trim() });
    }
  }

  const head = [
    "<{* ==========================================================================",
    "     カテゴリごとの独自内容 — ベーシックからの移植",
    "",
    "     ※ クリエイターモードにカテゴリ説明のタグはありません。",
    "        $category.* は31個ありますが、説明文を出すものがありません。",
    "        カテゴリ識別コードで振り分けます。",
    "",
    "     生成物です。直すときは tools/cdp/category-extra.js を直してください。",
    "   ========================================================================== *}>"
  ].join("\n");

  function pack(list, prefix) {
    const by = new Map();
    for (const b of list) {
      if (!by.has(b.html)) { by.set(b.html, []); }
      by.get(b.html).push(b.code);
    }
    const units = [...by.entries()].map(([html, codes]) =>
      "<{if " + codes.map(c => "$category.code == '" + c + "'").join(" or ") + "}>" +
      NL + html + NL + "<{/if}>");
    const LIMIT = 70000;
    const parts = [];
    let cur = [], size = 0;
    for (const u of units) {
      if (size + u.length > LIMIT && cur.length) { parts.push(cur); cur = []; size = 0; }
      cur.push(u); size += u.length + 1;
    }
    if (cur.length) { parts.push(cur); }
    const made = [];
    parts.forEach((part, i) => {
      const name = prefix + (i + 1);
      const file = "package/modules/" + name + ".tpl";
      fs.writeFileSync(file, head + NL + part.join(NL) + NL);
      made.push({ name, size: fs.statSync(file).size, blocks: part.length });
    });
    console.log("");
    console.log(prefix + ": " + list.length + " カテゴリ / " + by.size + " 種類");
    made.forEach(n => console.log("  " + n.name.padEnd(18) + String(n.blocks).padStart(4) + " 種類  " + String(n.size).padStart(7) + " バイト"));
    return made;
  }

  const top = pack(blocks, "category_extra");
  const low = pack(bottoms, "category_bottom");

  try { fs.unlinkSync(OUT); } catch (e) {  }

  console.log("");
  console.log("上の領域 " + blocks.length + " カテゴリ / 下の領域 " + bottoms.length + " カテゴリ / 中身なし " + empty + " / 失敗 " + failed);
  console.log("");
  console.log("テンプレートから呼ぶ順:");
  console.log("  商品一覧の上: " + top.map(n => "<{$module." + n.name + "}>").join(""));
  console.log("  商品一覧の下: " + low.map(n => "<{$module." + n.name + "}>").join(""));
})().catch(e => { console.error("※ " + e.message); process.exit(1); });

