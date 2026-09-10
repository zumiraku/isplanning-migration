/* ---------------------------------------------------------------------------
   url-map.js — 旧URL → クリエイターURL の対応表

   移植では旧テンプレートのリンクをそのまま持ってきます。ベーシックのURL
   （/shopbrand/003/001/X/）は301で飛ぶので放っておいても壊れませんが、
   **左メニューだけで94本、全体で166本が毎回リダイレクトを1回挟む**ことに
   なります。package/url-bulk/*.csv に対応表があるので変換します。

   ※ #アンカー付きが8本あります

      /html/info.html#about_receipt のように、フラグメント込みで照合すると
      1本も当たりません。切り離して引き、見つかったら付け直します。

   ※ 正規表現にバックスラッシュを使いません

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

/* ※ shopdetail（商品）が抜けていました
 *
 *    対応表に商品9,535件を入れていなかったので、`/shopdetail/…` のリンクが
 *    1本も書き換わっていませんでした。モジュールと独自ページに403箇所
 *    残っていて、切り替え後は毎回301で回ることになります。
 *    （壊れはしませんが、余分な往復とSEOの目減りになります） */
const LINK = new RegExp('(href=")((?:https?://www\\.isp-sp\\.com)?/(?:shopbrand|shopdetail|html|shop|new)/[^"]*)(")', "gi");

const map = new Map();
for (const f of ["categories-url.csv", "freepages-url.csv", "news-url.csv", "pagetypes-url.csv", "products-url.csv"]) {
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

/* ※ /html/email.html は独自ページではありません
 *
 *    449バイトの中継ページで、開くと自動でお問い合わせフォーム
 *    （/ssl/contact/）へ送信します。デザインセットの82枚には入っておらず、
 *    移行漏れの一覧にも「MISSING」として残っていました。独自ページ3枚から
 *    8箇所リンクされています。
 *
 *    クリエイターにはプラットフォームの印があります。
 *
 *      $url.support → #makeshop-common-contact-url
 *
 *    実データで確認したうえで、こちらに向けます。 */
map.set("/html/email.html", "<{$url.support}>");

/* ※ 検索結果へのリンクだけは、対応表では引けません（2026-09-09）
 *
 *    独自ページに、ベーシックの検索URLが直に書かれています。
 *
 *      /shop/shopbrand.html?search=%A5%C6%A5%A3%A5%C3%A5%B7%A5%E5&sort=recommend&…
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ EUC-JP の「ティッシュ」
 *
 *    クリエイターの検索は**引数の名前が違います**（`search` →
 *    `search_keyword`）。301 で回っても名前が変われば落ちるので、
 *    ここで直します。文字コードも EUC-JP から UTF-8 へ。
 *
 *    実機で確かめました（tools/cdp/search-url.js）。
 *
 *      /view/search?search_keyword=ティッシュ    542件
 *      /view/search?keyword=ティッシュ          9,535件（＝全件。効いていません）
 *
 *    空の絞り込み（money1= など）は落とします。値が入っているものは
 *    そのまま残します。 */
function searchLink(url) {
  const q = url.indexOf("?");
  if (q < 0) { return null; }
  const params = url.slice(q + 1).split("&");
  let word = null;
  const keep = [];
  for (const kv of params) {
    const eq = kv.indexOf("=");
    const k = eq < 0 ? kv : kv.slice(0, eq);
    const v = eq < 0 ? "" : kv.slice(eq + 1);
    if (!v) { continue; }                       /* 空の絞り込みは落とします */
    if (k === "search") {
      try {
        const bytes = Buffer.from(v.split("%").filter(Boolean).map(h => parseInt(h.slice(0, 2), 16)));
        word = new TextDecoder("euc-jp").decode(bytes);
      } catch (e) { word = decodeURIComponent(v); }
      continue;
    }
    keep.push(k + "=" + v);
  }
  if (word === null) { return null; }
  return "/view/search?search_keyword=" + encodeURIComponent(word) +
    (keep.length ? "&" + keep.join("&") : "");
}

function rewrite(html) {
  let n = 0;
  const miss = new Set();
  const out = html.replace(LINK, (m, pre, url, post) => {
    if (url.indexOf("/shop/shopbrand.html") >= 0) {
      const to = searchLink(url);
      if (to) { n++; return pre + to + post; }
    }
    /* ※ ドメイン付きのリンクも引けるようにします
     *
     *    お店の書いたリンクには `https://www.isp-sp.com/html/page68.html` の
     *    ような絶対URLが混ざっています。対応表の鍵は `/html/page68.html`
     *    なので、そのままでは引けず、素通りしていました。 */
    const clean = url.replace(/^https?:\/\/www\.isp-sp\.com/i, "");
    const hash = clean.indexOf("#");
    const base = hash < 0 ? clean : clean.slice(0, hash);
    const frag = hash < 0 ? "" : clean.slice(hash);
    const bare = base.endsWith("/") ? base.slice(0, -1) : base;
    let to = map.get(bare) || map.get(base);

    /* ※ 末尾に並び替えが付いたリンクがあります
     *
     *      /shopdetail/051000000007/order
     *
     *    対応表の鍵は `/shopdetail/051000000007` なので、そのままでは
     *    引けません。**後ろの区切りを1つずつ落として**探します。
     *    /shopbrand/003/001/X/page2/order/ のような形にも効きます。 */
    if (!to) {
      let probe = bare;
      while (!to && probe.split("/").length > 2) {
        probe = probe.slice(0, probe.lastIndexOf("/"));
        to = map.get(probe);
      }
    }
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
