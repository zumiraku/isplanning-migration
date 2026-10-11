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

function normaliseHref(html) {
  return html.replace(/href=(?!["'])([^\s>]+)/gi, function (m, url) {
    let u = url.replace(/^https?:\/\/www\.isp-sp\.com/i, "").replace(/\?code=isplanning$/i, "");
    return 'href="' + u + '"';
  });
}

const HOLDERS = ['<div class="PageArea"', '<div class="M_mainContents', '<div id="fan_contents"'];

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

  const finder = /<div\b[^>]*>/gi;
  finder.lastIndex = from;
  let open = -1, m;
  while ((m = finder.exec(html))) {
    if (/PageArea|M_mainContents|fan_contents/.test(m[0])) { open = m.index; break; }
  }
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

