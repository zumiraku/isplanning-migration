#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 *  _prune-dead-css.js — 使われていないCSS規則を落とす
 *
 *  最初は正規表現1本で書いて、**ファイルを49KBから92KBに増やしました。**
 *  規則を拾いながら残りも連結していたので、同じ内容が二重に出ていました。
 *  正規表現で入れ子のあるCSSを切り貼りするのは無理です。
 *
 *  ここでは波括弧の深さを数えます。@media の中に入り、中身を刈ってから、
 *  空になった @media ごと落とします。グループ化されたセレクタは、**全部が
 *  対象のときだけ**落とします（`.dead, .alive { … }` は残す）。
 *
 *  使い方: node tools/_prune-dead-css.js <css> <dead1> <dead2> …
 *  結果は標準出力。元ファイルは書き換えません。
 * ------------------------------------------------------------------------- */
'use strict';

const fs = require('fs');
const [file, ...dead] = process.argv.slice(2);
if (!file) { console.error('usage: _prune-dead-css.js <css> <dead-class>...'); process.exit(2); }

const deadSet = new Set(dead);
const src = fs.readFileSync(file, 'utf8');

let removed = 0, kept = 0;

/* ひとつのブロックの中身を刈って返します。i は '{' の次を指し、
   戻り値は { text, end } — end は対応する '}' の位置。 */
function pruneBlock(s, i) {
  let out = '';
  let prelude = '';
  while (i < s.length) {
    const ch = s[i];

    if (ch === '}') {
      return { text: out + prelude, end: i };
    }

    if (ch === '{') {
      const sel = prelude;
      const inner = pruneBlock(s, i + 1);
      i = inner.end + 1;
      prelude = '';

      const atRule = /^\s*@/.test(sel);
      if (atRule) {
        // 中身が空になった @media は落とします
        if (inner.text.trim() === '') { removed++; }
        else { out += sel + '{' + inner.text + '}'; }
      } else {
        const classes = sel.match(/\.[A-Za-z_][A-Za-z0-9_-]*/g) || [];
        const names = classes.map((c) => c.slice(1));
        const allDead = names.length > 0 && names.every((n) => deadSet.has(n));
        if (allDead) { removed++; }
        else { out += sel + '{' + inner.text + '}'; kept += names.length ? 1 : 0; }
      }
      continue;
    }

    // コメントはそのまま運びます（中に { } があっても数えない）
    if (ch === '/' && s[i + 1] === '*') {
      const close = s.indexOf('*/', i + 2);
      const end = close === -1 ? s.length : close + 2;
      prelude += s.slice(i, end);
      i = end;
      continue;
    }

    prelude += ch;
    i++;
  }
  return { text: out + prelude, end: i };
}

const result = pruneBlock(src + '}', 0);
let out = result.text;
out = out.replace(/\n{3,}/g, '\n\n');

process.stdout.write(out);
console.error(`  規則を削除 ${removed} / 残した ${kept}`);
