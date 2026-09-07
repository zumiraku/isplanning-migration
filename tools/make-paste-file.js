#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 *  make-paste-file.js — コンソールの箱に貼る「1枚のファイル」を作る
 *
 *  🔴 CSS と JavaScript で、こちらのブロックの位置が逆です。
 *
 *      CSS          Basics標準 2,326行  →  こちら          （こちらが後ろ）
 *      JavaScript   こちら              →  Basics標準 67行 （こちらが前）
 *
 *     JavaScript を逆にすると、Basics の1行目が $ を呼んで落ち、**こちらの
 *     コードは1行も動きません**。2026-09-05 に実際にそうなりました。
 *     CSS を逆にすると、Basics の指定がこちらに勝って見た目が壊れます。
 *
 *     この順番を毎回人が思い出しながら、箱の一部だけを選んで貼る ── これは
 *     いつか必ず間違えます。説明を丁寧にして防ぐ種類のものではないので、
 *     道具にしました。
 *
 *  やること: いま箱に入っているものを受け取り、**こちらのブロックだけ**を
 *  最新版に差し替えて、そのまま Ctrl+A → Ctrl+V で戻せる1枚を書き出します。
 *  Basics のコードには1行も触れません。
 *
 *  こちらのブロックの範囲は、**前に貼った版の中身そのもの**で探します。
 *  行数や目印からの推測ではありません。見つからなければ書き出さずに止まります
 *  ── 範囲を取り違えると Basics のコードを消すからです。
 *
 *  使い方:
 *    node tools/make-paste-file.js js  <箱の中身.js>  [出力先]
 *    node tools/make-paste-file.js css <箱の中身.css> [出力先]
 * ------------------------------------------------------------------------- */
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

/* 🔴 コンソールは一部の文字を HTML の実体参照に変えて返します。
 *
 *    実測（2026-09-07、JavaScript の箱 447行）で変わっていたのは5箇所だけ:
 *      🔴 → &#128308;      › → &#8250;（2）      — → &#8212;（2）
 *
 *    5文字ですが、そのままでは1バイトも一致しません。**照合のときだけ**戻します。
 *    書き出す中身には手を加えません。 */
const unent = (s) => s
  .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(parseInt(d, 10)))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

const box = norm(fs.readFileSync(current, 'utf8'));
const fresh = norm(fs.readFileSync(livePath, 'utf8')).replace(/\n+$/, '');

/* 行単位で探します。実体参照を戻しても**行数は変わらない**ので、正規化した側で
 * 見つけた行番号を、そのまま元の側の切り出しに使えます。文字位置で持つとずれます。 */
const boxLines = box.split('\n');
const boxKey = boxLines.map(unent);

/* 前に貼った版を git から取ります。箱の中にあるのはそれです。 */
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
    } catch (e) { /* そのコミットには無い */ }
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
  console.error('🔴 箱の中に、こちらのブロックが見つかりません。');
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

/* 🔴 CSS の @import は、他の規則より前になければ効きません。
 *
 *      @import url(//use.fontawesome.com/releases/v5.0.11/css/all.css);
 *
 *    ブラウザは位置の悪い @import を**黙って無視**します。エラーも警告も
 *    出ません。この1行が効かなくなると Font Awesome が読み込まれず、
 *    アイコンだけが消えます。
 *
 *    最初、この検査を「箱の1行目と結果の1行目を比べる」形で書きました。
 *    **入れ替えた箱を渡したら素通りしました。** 箱の側がすでに壊れていると
 *    「1行目どうしが同じ」になってしまうためです。比べるのではなく、
 *    **@import が先頭にあるか**そのものを見ます。
 *
 *    これが「CSS はこちらのブロックが後ろ」である理由です。順番の理由が
 *    ファイルの中にあるので、覚えておく話にせず、毎回確かめます。 */
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
    console.error(`🔴 @import が ${bad} 件、他の規則より後ろにあります。`);
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
