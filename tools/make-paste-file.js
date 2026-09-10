#!/usr/bin/env node
/* make-paste-file.js — コンソールの箱に貼る「1枚のファイル」を作る */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const [kind, current, outArg] = process.argv.slice(2);
if (!kind || !current) {
  console.error('usage: make-paste-file.js <js|css> <current-box-dump> [out]');
  process.exit(2);
}
if (kind !== 'js' && kind !== 'css') { console.error('kind must be js or css'); process.exit(2); }

const livePath = `templates/creator/mode/all-pages.${kind}`;
const out = outArg || `package/paste/all-pages.${kind}`;

const norm = (s) => s.replace(/\r\n/g, '\n').replace(/\uFEFF/g, '');

const unent = (s) => s
  .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(parseInt(d, 10)))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

const box = norm(fs.readFileSync(current, 'utf8'));
const fresh = norm(fs.readFileSync(livePath, 'utf8')).replace(/\n+$/, '');

const boxLines = box.split('\n');
const boxKey = boxLines.map(unent);

function previousVersions() {
  const list = [];
  let log = '';
  try {
    log = execSync(`git log --format=%H -30 -- ${livePath}`, { encoding: 'utf8' });
  } catch (e) { return list; }
  for (const sha of log.split('\n').filter(Boolean)) {
    try {
      list.push(norm(execSync(`git show ${sha}:${livePath}`,
        { encoding: 'utf8', maxBuffer: 1 << 26 })).replace(/\n+$/, ''));
    } catch (e) {  }
  }
  return list;
}

const candidates = [fresh, ...previousVersions()];
let found = null;
for (const c of candidates) {
  const cl = c.split('\n').map(unent);
  for (let i = 0; i + cl.length <= boxKey.length; i++) {
    let hit = true;
    for (let j = 0; j < cl.length; j++) {
      if (boxKey[i + j] !== cl[j]) { hit = false; break; }
    }
    if (hit) { found = { start: i, len: cl.length, was: c }; break; }
  }
  if (found) { break; }
}

if (!found) {
  console.error('※ 箱の中に、こちらのブロックが見つかりません。');
  console.error('   前に貼った版のどれとも一致しませんでした。箱を直接手で直した');
  console.error('   可能性があります。差し替える範囲が決められないので**何も');
  console.error('   書き出しません。**');
  console.error('');
  console.error(`   箱の中身: ${boxLines.length} 行 / 照合した版: ${candidates.length} 件`);
  process.exit(1);
}

const before = boxLines.slice(0, found.start);
const after = boxLines.slice(found.start + found.len);
const result = before.concat(fresh.split('\n'), after).join('\n');

if (kind === 'css') {
  const lines = result.split('\n');
  let seenRule = false;
  let bad = 0;
  let inComment = false;
  for (let i = 0; i < lines.length; i++) {
    let t = lines[i].trim();
    if (inComment) { if (t.indexOf('*/') !== -1) { inComment = false; } continue; }
    if (t.indexOf('/*') === 0 && t.indexOf('*/') === -1) { inComment = true; continue; }
    t = t.replace(/\/\*.*?\*\//g, '').trim();
    if (!t) { continue; }
    if (t.indexOf('@charset') === 0) { continue; }
    if (t.indexOf('@import') === 0) {
      if (seenRule) { bad++; console.error(`   ${i + 1} 行目: ${t}`); }
      continue;
    }
    seenRule = true;
  }
  if (bad) {
    console.error(`※ @import が ${bad} 件、他の規則より後ろにあります。`);
    console.error('   ブラウザは黙って無視します。このまま貼ると Font Awesome の');
    console.error('   アイコンが消えます。**書き出しません。**');
    process.exit(1);
  }
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, result);

console.log(`種別          : ${kind}`);
console.log(`箱の中身      : ${boxLines.length} 行`);
console.log(`こちらの位置  : ${found.start === 0 ? '先頭から' : `${found.start} 行目のあと`}`);
console.log(`こちらの行数  : ${found.len} → ${fresh.split('\n').length} 行`);
console.log(`Basics側      : ${before.length + after.length} 行（1行も触っていません）`);
console.log(`書き出し      : ${out}  ${result.split('\n').length} 行`);
if (found.was === fresh) {
  console.log('※ 中身は前と同じでした。貼り直す必要はありません。');
}

