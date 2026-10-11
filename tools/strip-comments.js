const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const TARGET = [
  /^tools\/[^/]+\.(js|sh|ps1)$/,
  /^tools\/(cdp|port)\/[^/]+\.js$/,
  /^templates\/creator\/js\/[^/]+\.js$/,
  /^templates\/creator\/css\/port-responsive\.css$/
];

/* 取り込んだ実物と生成物は触りません */
const KEEP = [
  /^templates\/basic-/,
  /_extracted-legacy\.js$/,
  /^snapshot\//,
  /^tools\/cdp\/(category|freepage)-src\//,
  /^tools\/cdp\/(freepage-out|preview-out|box-out|sp-out|csv)\//,
  /^package\//,
  /^templates\/creator\/mode\//,
  /^contingency\//
];

const dry = process.argv.indexOf("--check") >= 0;

function stripJs(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  let prev = "";           /* 正規表現判定用 */
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];

    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === q) { break; }
        j++;
      }
      out += src.slice(i, j + 1);
      prev = q;
      i = j + 1;
      continue;
    }

    if (c === "/" && d === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end < 0 ? n : end + 2;
      /* 行頭からなら改行ごと */
      const lineStart = out.lastIndexOf("\n") + 1;
      const onlySpace = /^[ \t]*$/.test(out.slice(lineStart));
      if (onlySpace) {
        out = out.slice(0, lineStart);
        let k = stop;
        while (k < n && (src[k] === " " || src[k] === "\t")) { k++; }
        if (src[k] === "\r") { k++; }
        if (src[k] === "\n") { k++; }
        i = k;
      } else {
        i = stop;
      }
      continue;
    }

    if (c === "/" && d === "/") {
      const lineStart = out.lastIndexOf("\n") + 1;
      const onlySpace = /^[ \t]*$/.test(out.slice(lineStart));
      let k = src.indexOf("\n", i);
      if (k < 0) { k = n; }
      if (onlySpace) { out = out.slice(0, lineStart); i = k + 1; }
      else { i = k; }
      continue;
    }

    if (c === "/" && !/[A-Za-z0-9_$)\]]/.test(prev)) {
      /* 正規表現リテラル */
      let j = i + 1;
      let cls = false;
      while (j < n) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === "[") { cls = true; }
        else if (src[j] === "]") { cls = false; }
        else if (src[j] === "/" && !cls) { break; }
        else if (src[j] === "\n") { j = i; break; }
        j++;
      }
      if (j > i) {
        while (j + 1 < n && /[gimsuy]/.test(src[j + 1])) { j++; }
        out += src.slice(i, j + 1);
        prev = "/";
        i = j + 1;
        continue;
      }
    }

    out += c;
    if (!/\s/.test(c)) { prev = c; }
    i++;
  }
  return out;
}

/* 文字列中の /* は無視 */
function stripCss(src) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '"' || c === "'") {
      const q = c;
      let j = i + 1;
      while (j < n) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === q) { break; }
        j++;
      }
      out += src.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end < 0 ? n : end + 2;
      const lineStart = out.lastIndexOf("\n") + 1;
      if (/^[ \t]*$/.test(out.slice(lineStart))) {
        out = out.slice(0, lineStart);
        let k = stop;
        while (k < n && (src[k] === " " || src[k] === "\t")) { k++; }
        if (src[k] === "\r") { k++; }
        if (src[k] === "\n") { k++; }
        i = k;
      } else { i = stop; }
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

/* 行頭の # だけ */
function stripHash(src) {
  const lines = src.split("\n");
  const out = [];
  let inBlock = false;
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k];
    if (inBlock) { if (/#>/.test(l)) { inBlock = false; } continue; }
    if (/^\s*<#/.test(l)) { inBlock = true; continue; }
    if (k === 0 && /^#!/.test(l)) { out.push(l); continue; }
    if (/^\s*#/.test(l)) { continue; }
    out.push(l);
  }
  return out.join("\n");
}

function headline(src, base) {
  const m = src.match(new RegExp("^\\s*(?:#|\\*|/\\*)?\\s*" +
    base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s+[—-]\\s+(.+)$", "m"));
  if (!m) { return null; }
  return m[1].replace(/\s*\*\/\s*$/, "").trim();
}

function tidy(s) {
  return s.replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "").replace(/[ \t]+$/gm, "");
}

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n").filter(Boolean)
  .filter(f => TARGET.some(re => re.test(f)))
  .filter(f => !KEEP.some(re => re.test(f)));

let changed = 0, removed = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const ext = path.extname(f);
  const base = path.basename(f);
  const title = headline(src, base);

  let out;
  if (ext === ".js") { out = stripJs(src); }
  else if (ext === ".css") { out = stripCss(src); }
  else { out = stripHash(src); }
  out = tidy(out);

  if (title) {
    const line = (ext === ".sh" || ext === ".ps1")
      ? "# " + base + " — " + title
      : "/* " + base + " — " + title + " */";
    if (/^#!/.test(out)) {
      const nl = out.indexOf("\n");
      out = out.slice(0, nl + 1) + line + "\n" + out.slice(nl + 1);
    } else {
      out = line + "\n" + out;
    }
  }
  out = tidy(out) + "\n";

  const before = src.split("\n").length;
  const after = out.split("\n").length;
  if (out === src) { continue; }
  changed++;
  removed += before - after;
  if (!dry) { fs.writeFileSync(f, out); }
}

console.log((dry ? "落とせる行 " : "落とした行 ") + removed + " / " + changed + " ファイル（対象 " + files.length + "）");
