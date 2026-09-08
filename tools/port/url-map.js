/* ---------------------------------------------------------------------------
   url-map.js — 旧URL → クリエイターURL の対応表

   移植では旧テンプレートのリンクをそのまま持ってきます。ベーシックのURL
   （/shopbrand/003/001/X/）は301で飛ぶので放っておいても壊れませんが、
   **左メニューだけで94本、全体で166本が毎回リダイレクトを1回挟む**ことに
   なります。package/url-bulk/*.csv に対応表があるので変換します。

   🔴 #アンカー付きが8本あります

      /html/info.html#about_receipt のように、フラグメント込みで照合すると
      1本も当たりません。切り離して引き、見つかったら付け直します。

   🔴 正規表現にバックスラッシュを使いません

      new RegExp('…\s…\2…') と書いたら、JSの文字列側で \s が s に、\2 が
      制御文字になり、**1本も置換されないのに「未対応0件」と報告**しました。
      失敗が成功に見える形だったので、素直な書き方に変えています。
      対象はすべて href="…" の形なので、これで足ります。
--------------------------------------------------------------------------- */
const fs = require("fs");

function readCsv(p) {
  const raw = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
  return raw.split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const c = []; let cur = "", q = false;
    for (const ch of line) {
      if (ch === '"') { q = !q; continue; }
      if (ch === "," && !q) { c.push(cur); cur = ""; continue; }
      cur += ch;
    }
    c.push(cur);
    return c;
  });
}

const LINK = new RegExp('(href=")(/(?:shopbrand|html|shop|new)/[^"]*)(")', "gi");

const map = new Map();
for (const f of ["categories-url.csv", "freepages-url.csv", "news-url.csv", "pagetypes-url.csv"]) {
  const p = "package/url-bulk/" + f;
  if (!fs.existsSync(p)) continue;
  for (const c of readCsv(p)) {
    const sys = c[1], old = c[4];
    if (!sys || !old) continue;
    const bare = old.endsWith("/") ? old.slice(0, -1) : old;
    map.set(bare, sys);
    map.set(old, sys);
  }
}

function rewrite(html) {
  let n = 0;
  const miss = new Set();
  const out = html.replace(LINK, (m, pre, url, post) => {
    const hash = url.indexOf("#");
    const base = hash < 0 ? url : url.slice(0, hash);
    const frag = hash < 0 ? "" : url.slice(hash);
    const bare = base.endsWith("/") ? base.slice(0, -1) : base;
    const to = map.get(bare) || map.get(base);
    if (!to) { miss.add(url); return m; }
    n++;
    return pre + to + frag + post;
  });
  return { html: out, rewritten: n, missing: [...miss] };
}

module.exports = { map, rewrite };

if (require.main === module) {
  console.log("対応表: " + map.size + " 件");
  const t = rewrite([
    '<a href="/shopbrand/003/001/X/">a</a>',
    '<a href="/html/page9.html">b</a>',
    '<a href="/html/info.html#about_receipt">c</a>',
    '<a href="/shop/enq201306270">d</a>'
  ].join("\n"));
  console.log(t.html.replace(/<a href="/g, "  -> ").replace(/">[a-d]<\/a>/g, ""));
  console.log("  置換 " + t.rewritten + " 本 / 未対応 " + t.missing.length + " 本 " + t.missing.join(" "));
}
