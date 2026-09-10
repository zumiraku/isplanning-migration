/* csv-lib.js — 商品CSVを読み書きする */
const fs = require("fs");

function decode(buf) { return new TextDecoder("shift_jis").decode(buf); }

function encode(text) {
  const iconv = require("iconv-lite");
  return iconv.encode(text, "Shift_JIS");
}

function parse(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQ = false; }
      } else { field += c; }
      continue;
    }
    if (c === '"') { inQ = true; continue; }
    if (c === ",") { row.push(field); field = ""; continue; }
    if (c === "\r") { continue; }
    if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
    field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function quote(v) {
  const s = v == null ? "" : String(v);
  return '"' + s.split('"').join('""') + '"';
}

function build(rows) {
  return rows.map(r => r.map(quote).join(",")).join("\r\n") + "\r\n";
}

module.exports = { decode, encode, parse, build, quote };

