const fs = require("fs");
const { rewrite } = require("./url-map.js");

const SRC = process.argv[2];
if (!SRC) { console.error("使い方: node tools/port/build-static-src.js <公開ページのディレクトリ>"); process.exit(1); }

function read(name) {
  const b = fs.readFileSync(SRC + "/" + name);
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); }
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function block(html, opener) {
  const i = html.indexOf(opener);
  if (i < 0) { return null; }
  const start = html.indexOf(">", i) + 1;
  let depth = 1;
  const re = /<(\/?)div\b[^>]*>/gi;
  re.lastIndex = start;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] === "/" ? -1 : 1;
    if (depth === 0) { return html.slice(start, m.index); }
  }
  return null;
}

function normaliseHref(html) {
  return html.replace(/href=(?!["'])([^\s>]+)/gi, function (m, url) {
    let u = url;
    u = u.replace(/^https?:\/\/www\.isp-sp\.com/i, "");
    u = u.replace(/\?code=isplanning$/i, "");
    return 'href="' + u + '"';
  });
}

function cutAtAdminPagearea(html) {
  const at = html.indexOf("<!-- adminPagearea -->");
  if (at < 0) { return html; }
  let s = html.slice(0, at);
  const tail = s.replace(/\s+$/, "");
  return tail.endsWith("</div>") ? tail.slice(0, -"</div>".length) : s;
}

const PAIRED = ["div", "table", "tbody", "thead", "tr", "td", "th", "ul", "ol", "li", "p", "span", "a", "dl", "dt", "dd", "form"];

function balance(html) {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  const stack = [];
  const edits = [];
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (!PAIRED.includes(tag) || m[3] === "/") { continue; }
    if (closing) {
      const at = stack.lastIndexOf(tag);
      if (at < 0) {
        edits.push([m.index, m[0].length, ""]);
      } else {
        let fill = "";
        for (let i = stack.length - 1; i > at; i--) { fill += "</" + stack[i] + ">"; }
        if (fill) { edits.push([m.index, 0, fill]); }
        stack.length = at;
      }
    } else {
      stack.push(tag);
    }
  }
  let out = html;
  let dropped = 0, filled = 0;
  for (let i = edits.length - 1; i >= 0; i--) {
    const [at, len, ins] = edits[i];
    if (len) { dropped++; } else { filled++; }
    out = out.slice(0, at) + ins + out.slice(at + len);
  }
  for (let i = stack.length - 1; i >= 0; i--) { out += "\n</" + stack[i] + ">"; }
  return { html: out, dropped: dropped, filled: filled, closed: stack.length };
}

function save(file, body, label) {
  const r = rewrite(normaliseHref(body.split("〜").join("～")));
  const b = balance(r.html);
  const out = b.html.trim() + "\n";
  fs.writeFileSync("templates/creator/port-src/" + file, out);
  console.log("  " + label.padEnd(12) + String(out.split("\n").length).padStart(4) + " 行  " +
              String(out.length).padStart(6) + " バイト  / URL書き換え " + r.rewritten +
              " / 相手のいない閉じを外した " + b.dropped +
              " / 閉じ忘れを閉じた " + b.filled + " / 末尾に足した " + b.closed);
  if (r.missing.length) {
    console.log("     ※ 対応表に無いURL " + r.missing.length + " 件: " + r.missing.join("  "));
  }
}

const g = block(read("p-guide.html"), '<div id="O_adminPagearea" class="M_mainContents shop-guide">');
if (!g) { console.error("※ ご利用案内の本文が見つかりません"); process.exit(1); }
save("guide-body.tpl", cutAtAdminPagearea(g), "ご利用案内");

const c = block(read("p-contract.html"), '<div class="M_mainContents company transaction">');
if (!c) { console.error("※ 特商法の本文が見つかりません"); process.exit(1); }
save("contract-body.tpl", c, "特商法");

