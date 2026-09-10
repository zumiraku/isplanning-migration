/* ---------------------------------------------------------------------------
   csv-lib.js — 商品CSVを読み書きする

   ※ 行単位で切れません

      商品説明はHTMLで、**中に改行もカンマも引用符も入ります。** 行で切ると
      1商品が何行にも割れます。引用符の中かどうかを見ながら1文字ずつ進めます。

   ※ 文字コードは Shift_JIS です

      UTF-8でもEUC-JPでもありません。読むときも書くときも変換します。
--------------------------------------------------------------------------- */
const fs = require("fs");

function decode(buf) { return new TextDecoder("shift_jis").decode(buf); }

/* Shift_JIS への書き出しは Node に無いので、iconv が要ります。
   入っていない環境でも読むほうは動くように、遅延で読み込みます。 */
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
