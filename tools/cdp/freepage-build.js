/* ---------------------------------------------------------------------------
   freepage-build.js — 独自ページ82枚を、11ページと同じ骨格に入れ直す

     node tools/cdp/freepage-build.js

   ※ デザインセットの82枚は、差し戻された版のままでした

        <body>
          <{$module.header}>
          <main class="container">      ← 旧設計のレイアウト
          …
          <{$module.footer}>

      左メニューが無く、`#wrapper` も `#O_container` も `.M_mainContents` も
      無く、`.container` `.breadcrumb` `.notice` `.btn--primary` という
      **削除した旧CSSのクラス**を使っています。82枚とも同じ状態でした。

      ページ種別11枚を直しても、独自ページは直りません。**別物です。**

   本文の切り出し

      公開中のページでは `<div class="PageArea">` … `</div><!-- PageArea -->`
      の中が独自ページの中身です。そこだけ取り、11枚と同じ shell に入れます。

   出力: tools/cdp/freepage-out/<pageN.html>.tpl
--------------------------------------------------------------------------- */
const fs = require("fs");
const { shell } = require("../port/shell.js");
const { rewrite } = require("../port/url-map.js");

const SRC = "tools/cdp/freepage-src";
const OUT = "tools/cdp/freepage-out";
const LIST = "tools/cdp/freepage-ids.txt";

const PAIRED = ["div", "table", "tbody", "thead", "tr", "td", "th", "ul", "ol", "li", "p", "span", "a", "dl", "dt", "dd", "form", "center"];

function read(p) {
  const b = fs.readFileSync(p);
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); }
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/* 断片のタグを揃えます。相手のいない閉じは外し、閉じ忘れは閉じます。
   ベーシックは本文の周りに <table><tr><td> を挿し込んでいたので、
   お店の本文はそれを当てにした閉じタグを持っています。 */
function balance(html) {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  const stack = [], edits = [];
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === "/", tag = m[2].toLowerCase();
    if (!PAIRED.includes(tag) || m[3] === "/") { continue; }
    if (closing) {
      const at = stack.lastIndexOf(tag);
      if (at < 0) { edits.push([m.index, m[0].length, ""]); }
      else {
        let fill = "";
        for (let i = stack.length - 1; i > at; i--) { fill += "</" + stack[i] + ">"; }
        if (fill) { edits.push([m.index, 0, fill]); }
        stack.length = at;
      }
    } else { stack.push(tag); }
  }
  let out = html, dropped = 0, filled = 0;
  for (let i = edits.length - 1; i >= 0; i--) {
    const [at, len, ins] = edits[i];
    if (len) { dropped++; } else { filled++; }
    out = out.slice(0, at) + ins + out.slice(at + len);
  }
  for (let i = stack.length - 1; i >= 0; i--) { out += "\n</" + stack[i] + ">"; }
  return { html: out, dropped, filled, closed: stack.length };
}

/* 引用符の無い href は url-map が見ないので、先に整えます。 */
function normaliseHref(html) {
  return html.replace(/href=(?!["'])([^\s>]+)/gi, function (m, url) {
    let u = url.replace(/^https?:\/\/www\.isp-sp\.com/i, "").replace(/\?code=isplanning$/i, "");
    return 'href="' + u + '"';
  });
}

/* ※ 終わりの目印は当てになりません
 *
 *    最初は `<!-- PageArea -->` というコメントで切っていました。**82枚中
 *    76枚にそのコメントがありません。** 6枚しか作れませんでした。
 *    div の入れ子を数えて、対応する閉じで切ります。 */
/* ※ 入れ物は1種類ではありません
 *
 *      <div class="PageArea">        22枚
 *      <div class="M_mainContents">  残り
 *
 *    片方だけ見ていたので、82枚中60枚が「本文が見つからない」でした。
 *    お店が長年かけて増やしたページなので、書き方が揃っていません。 */
const HOLDERS = ['<div class="PageArea"', '<div class="M_mainContents', '<div id="fan_contents"'];

/* ※ 文書の先頭から探してはいけません
 *
 *    `M_mainContents` はヘッダーの中にも出てきます。先頭から探すと
 *    そちらに当たり、入れ子の数が合わずに「本文が無い」になりました。
 *    ベーシックが本文を入れるセル（valign=top width=640）から後ろだけを見ます。 */
/* ※ 入れ物のdivを信じてはいけません
 *
 *    page81 はこうなっています。
 *
 *      <div id="fan_contents"><h4>少量購入できる粗品…</h2></div>
 *      <div style="text-align: center"><img …></div>
 *      …本文の続き…
 *
 *    **見出しだけを囲って、すぐ閉じています。** その div を取ると
 *    見出し1行しか残りません（16塊中13塊が欠落しました）。
 *
 *    ベーシックが独自ページを入れているのは「セル」です。
 *    セルの中身をまるごと取ります。閉じる位置は、ページ共通の後始末
 *    （bottom_privercy のスクリプト、ページトップのリンク、コラム）の手前。 */
/* ※ 「最初の <script>」で切ってはいけません
 *
 *    本文の途中にスクリプトを置いているページがあります（page3 は
 *    39塊中37塊が消えました）。**ページ共通の後始末**だけを目印にします。 */
const ENDERS = ['<p class="pageTop">', '<div id="colum-wrap"', "</table></td></tr>"];

function cellBody(html) {
  const cell = html.indexOf("valign=top width=640");
  if (cell < 0) { return null; }
  const td = html.indexOf("<td align=left>", cell);
  if (td < 0) { return null; }
  const start = td + "<td align=left>".length;
  let end = html.length;
  for (const e of ENDERS) {
    const at = html.indexOf(e, start);
    if (at >= 0 && at < end) { end = at; }
  }
  /* 後始末のスクリプト（bottom_privercy）は本文ではありません。
     その手前の <script> まで戻します。 */
  const priv = html.indexOf("bottom_privercy", start);
  if (priv > 0 && priv < end) {
    const tag = html.lastIndexOf("<script", priv);
    if (tag > start) { end = Math.min(end, tag); }
  }
  return html.slice(start, end);
}

function pageArea(html) {
  const byCell = cellBody(html);
  if (byCell && byCell.trim().length > 20) { return byCell; }

  const cell = html.indexOf("valign=top width=640");
  const from = cell >= 0 ? cell : 0;

  /* ※ 属性の順番も引用符も揃っていません
   *
   *      <div class="PageArea">
   *      <div class="M_mainContents">
   *      <div style="text-align: left;" class="M_mainContents">
   *      <div id=fan_contents>
   *
   *    11年ぶんの手書きなので、当然そろっていません。**タグ全体を見て、
   *    その中に名前が入っているか**で判断します。 */
  const finder = /<div\b[^>]*>/gi;
  finder.lastIndex = from;
  let open = -1, m;
  while ((m = finder.exec(html))) {
    if (/PageArea|M_mainContents|fan_contents/.test(m[0])) { open = m.index; break; }
  }
  /* ※ 入れ物が無いページが1枚あります
   *
   *    page82「スマホ用カレンダー（削除しないでください）」は
   *    `spカレンダー用ダミーページ` という文字だけで、div が1つもありません。
   *    セルの中身をそのまま取ります。 */
  if (open < 0) {
    const td = html.indexOf("<td align=left>", from);
    if (td < 0) { return null; }
    const s2 = td + "<td align=left>".length;
    const e2 = html.indexOf("<script", s2);
    return e2 > 0 ? html.slice(s2, e2) : null;
  }
  const start = html.indexOf(">", open) + 1;
  let depth = 1;
  const walk = /<(\/?)div\b[^>]*>/gi;
  walk.lastIndex = start;
  let w;
  while ((w = walk.exec(html))) {
    depth += w[1] === "/" ? -1 : 1;
    if (depth === 0) { return html.slice(start, w.index); }
  }
  /* 閉じが足りない本文もあります（ベーシックの枠を当てにしたもの）。
     そのときは、続きのフッターに入る手前で切ります。 */
  const stop = html.indexOf('<div id="colum-wrap"', start);
  return stop > 0 ? html.slice(start, stop) : null;
}

fs.mkdirSync(OUT, { recursive: true });
const lines = fs.readFileSync(LIST, "utf8").split("\n").filter(Boolean);
const report = [];
let bad = 0;

for (const line of lines) {
  const sp = line.indexOf(" ");
  const id = line.slice(0, sp);
  const rest = line.slice(sp + 1);
  const sp2 = rest.indexOf(" ");
  const pageId = sp2 < 0 ? rest : rest.slice(0, sp2);
  const name = sp2 < 0 ? "" : rest.slice(sp2 + 1);

  const at = SRC + "/" + pageId;
  if (!fs.existsSync(at)) { console.log("※ 元が無い: " + pageId); bad++; continue; }
  const live = read(at);

  const body = pageArea(live);
  if (!body) { console.log("※ PageArea が無い: " + pageId); bad++; continue; }

  const title = (live.match(/<title>([\s\S]*?)<\/title>/) || ["", name])[1].trim();
  const r = rewrite(normaliseHref(body.split("〜").join("～")));
  const b = balance(r.html);

  /* 独自ページのタイトルは、そのページ固有です。$page.title ではなく
     現行の <title> をそのまま持ってきます（切替でSEOを動かさないため）。 */
  let doc = shell({ name: name || pageId, from: "（独自ページ）", slider: false, body: b.html.trim() });
  doc = doc.replace("<title><{$page.title}></title>", "<title>" + title + "</title>");
  doc = doc.replace('<meta property="og:title" content="<{$page.title}>">',
                    '<meta property="og:title" content="' + title.replace(/"/g, "&quot;") + '">');

  fs.writeFileSync(OUT + "/" + pageId + ".tpl", doc);
  report.push({ id: Number(id), pageId, title, len: doc.length, dropped: b.dropped, filled: b.filled, closed: b.closed, rewritten: r.rewritten, missing: r.missing.length });
}

fs.writeFileSync("tools/cdp/freepage-build.json", JSON.stringify(report, null, 1));
console.log("作った " + report.length + " 枚 / 作れない " + bad + " 枚  → " + OUT);
console.log("");
console.log("URL書き換え合計 " + report.reduce((a, r) => a + r.rewritten, 0) +
            " / 対応表に無いURL " + report.reduce((a, r) => a + r.missing, 0));
console.log("相手のいない閉じを外した " + report.reduce((a, r) => a + r.dropped, 0) +
            " / 閉じ忘れを閉じた " + report.reduce((a, r) => a + r.filled, 0) +
            " / 末尾に足した " + report.reduce((a, r) => a + r.closed, 0));
const big = report.slice().sort((a, b) => b.len - a.len).slice(0, 3);
console.log("いちばん大きいもの: " + big.map(r => r.pageId + " " + r.len).join(" / "));
