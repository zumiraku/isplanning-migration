#!/usr/bin/env node
'use strict';

const fs = require('fs');
const [file, ...dead] = process.argv.slice(2);
if (!file) { console.error('usage: _prune-dead-css.js <css> <dead-class>...'); process.exit(2); }

const deadSet = new Set(dead);
const src = fs.readFileSync(file, 'utf8');

let removed = 0, kept = 0;

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

