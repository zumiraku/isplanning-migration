#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 *  make-paste-file.js — コンソールの箱に貼る「1枚のファイル」を作る
 *
 *  🔴 CSS と JavaScript で、こちらのブロックの位置が逆です。
 *
 *      CSS          Basics標準 2,326行  →  こちら       （こちらが後ろ）
 *      JavaScript   こちら        →  Basics標準 67行   （こちらが前）
 *
 *     JavaScript を逆にすると、Basics の1行目が $ を呼んで落ち、**こちらの
 *     コードは1行も動きません**。2026-09-05 に実際にそうなりました。
 *     CSS を逆にすると、Basics の指定がこちらに勝って見た目が壊れます。
 *
 *     この順番を毎回人が思い出すのは無理です。だから道具にします。
 *
 *  やること: いま箱に入っているものを1つ受け取り、**こちらのブロックだけ**を
 *  最新版に差し替えて、そのまま Ctrl+A → Ctrl+V で戻せる1枚を書き出します。
 *  Basics のコードには触りません。
 *
 *  こちらのブロックの範囲は、**前に貼った版の中身そのもの**で探します。
 *  行数や目印の推測ではありません。見つからなければ書き出さずに止まります。
 *  黙って当てずっぽうで並べると、Basics のコードを消しかねません。
 *
 *  使い方:
 *    node tools/make-paste-file.js js  <箱の中身.js>  [出力先]
 *    node tools/make-paste-file.js css <箱の中身.css> [出力先]
 * ------------------------------------------------------------------------- */
'use strict';
const fs = require('fs');
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

const box = norm(fs.readFileSync(current, 'utf8'));
const fresh = norm(fs.readFileSync(livePath, 'utf8')).replace(/\n+$/, '');

/* 前に貼った版を git から取ります。箱の中にあるのはそれです。 */
function previousVersions() {
  const out = [];
  let log = '';
  try {
    log = execSync(`git log --format=%H -20 -- ${livePath}`, { encoding: 'utf8' });
  } catch (e) { return out; }
  for (const sha of log.split('\n').filter(Boolean)) {
    try {
      out.push(norm(execSync(`git show ${sha}:${livePath}`, { encoding: 'utf8', maxBuffer: 1 << 26 })).replace(/\n+$/, ''));
    } catch (e) { /* そのコミットには無い */ }
  }
  return out;
}

const candidates = [fresh, ...previousVersions()];
let found = null;
for (const c of candidates) {
  const at = box.indexOf(c);
  if (at !== -1) { found = { text: c, at: at }; break; }
}

if (!found) {
  console.error('🔴 箱の中に、こちらのブロックが見つかりません。');
  console.error('   前に貼った版のどれとも一致しませんでした。箱を直接手で');
  console.error('   直した可能性があります。差し替える範囲が決められないので');
  console.error('   **何も書き出しません。**');
  console.error('');
  console.error('   箱の中身:', box.split('\n').length, '行');
  console.error('   照合した版:', candidates.length, '件');
  process.exit(1);
}

const before = box.slice(0, found.at);
const after = box.slice(found.at + found.text.length);

const result = before + fresh + after;

fs.mkdirSync(require('path').dirname(out), { recursive: true });
fs.writeFileSync(out, result);

const L = (s) => (s ? s.split('\n').length : 0);
const same = found.text === fresh;

console.log(`種別          : ${kind}`);
console.log(`箱の中身      : ${L(box)} 行`);
console.log(`こちらの位置  : ${found.at === 0 ? '先頭' : `${L(before)} 行目のあと`}`);
console.log(`こちらの行数  : ${L(found.text)} → ${L(fresh)} 行`);
console.log(`Basics側      : ${L(before) - (found.at === 0 ? 0 : 1) + L(after)} 行（触っていません）`);
console.log(`書き出し      : ${out}  ${L(result)} 行`);
if (same) { console.log('※ 中身は前と同じでした。貼り直す必要はありません。'); }
