#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 *  render-smarty.js — run a Creator Mode template against made-up data and
 *  print the HTML it produces.
 *
 *  WHY THIS EXISTS
 *
 *  Every defect this project has hit in the templates was invisible until a
 *  page was pasted into the console and previewed by hand:
 *
 *    - $item.breadcrumb_list did not exist, so the breadcrumb rendered empty
 *    - the gallery read $item.multi_image while the shop uses $item.add_image,
 *      so it showed one slide and the client's swipe feature was simply absent
 *    - the dots had CSS but no markup and had never once appeared
 *
 *  Smarty drops what it does not recognise without complaining, so a template
 *  full of wrong tags renders as a clean page with things missing. Reading the
 *  source does not catch that, and neither does counting lines in the console.
 *
 *  This renders the template here, with data we choose, so the shape of the
 *  output can be asserted before anyone pastes anything.
 *
 *  WHAT IT IS NOT
 *
 *  Not Smarty. It implements the constructs these templates actually use and
 *  nothing else. It cannot tell you whether a TAG NAME is real - only the
 *  reference and the live preview can - but it can tell you what the template
 *  does with the data it is given, which is the half that keeps going wrong.
 *
 *  Unknown variables render empty, exactly as Smarty does. That is deliberate:
 *  the failure mode being reproduced is silence.
 *
 *  Usage:
 *    node tools/render-smarty.js <template.tpl> <fixture.json>
 * ------------------------------------------------------------------------- */
'use strict';

const fs = require('fs');

/* --- data lookup ---------------------------------------------------------- */
/* "item.add_image.list[a].image_url" with a = current index of section "a" */
function lookup(data, path, sections) {
  const parts = String(path).split('.');
  let cur = data;
  for (let p of parts) {
    const m = /^([A-Za-z0-9_]+)\[([A-Za-z0-9_]+)\]$/.exec(p);
    let idx = null;
    if (m) {
      p = m[1];
      const key = m[2];
      idx = /^\d+$/.test(key)
        ? Number(key)
        : (sections[key] ? sections[key].index : null);
    }
    if (cur === null || cur === undefined) { return undefined; }
    cur = cur[p];
    if (idx !== null) {
      if (!Array.isArray(cur)) { return undefined; }
      cur = cur[idx];
    }
  }
  return cur;
}

/* $smarty.section.NAME.field */
function smartyVar(path, sections) {
  const m = /^smarty\.section\.([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)$/.exec(path);
  if (!m) { return undefined; }
  const s = sections[m[1]];
  if (!s) { return undefined; }
  switch (m[2]) {
    case 'index':      return s.index;
    case 'index_next': return s.index + 1;
    case 'index_prev': return s.index - 1;
    case 'iteration':  return s.index + 1;
    case 'total':      return s.total;
    case 'first':      return s.index === 0;
    case 'last':       return s.index === s.total - 1;
    default:           return undefined;
  }
}

function value(path, data, sections) {
  if (path.startsWith('smarty.')) { return smartyVar(path, sections); }
  return lookup(data, path, sections);
}

/* --- expressions ---------------------------------------------------------- */
/* Supports: $a.b, 'str', 123, ==, !=, <, >, <=, >=, +, -, and/&&, or/||, ()
   Enough for every condition in these templates and nothing more. */
function evalExpr(expr, data, sections) {
  const toks = tokenize(expr);
  let pos = 0;

  function peek() { return toks[pos]; }
  function next() { return toks[pos++]; }

  function primary() {
    const t = next();
    if (!t) { return undefined; }
    if (t.type === 'lparen') { const v = orExpr(); next(); return v; }
    if (t.type === 'not')    { return !truthy(primary()); }
    if (t.type === 'var')    { return value(t.value, data, sections); }
    if (t.type === 'str')    { return t.value; }
    if (t.type === 'num')    { return t.value; }
    return undefined;
  }

  /* 🔴 掛け算・割り算・剰余
   *
   *    移植した一覧は「4件ごとに <tr> を入れる」書き方をしています。
   *
   *      <{if $smarty.section.i.index % 4 == 0}><tr><{/if}>
   *
   *    ここに % が無かったせいで、条件が常に undefined になり、
   *    **<tr> が1つも出ませんでした。** 描画は成功して見え、未展開タグも
   *    空srcも0。プレビューを撮って「商品が1行に1件ずつ縦に並んでいる」
   *    のを見て初めて分かりました。
   *
   *    実機のSmartyは % を解釈します。**描画器が追いついていないだけ**で、
   *    それを「テンプレートの不具合」と読み違えるところでした。 */
  function mulExpr() {
    let l = primary();
    while (peek() && peek().type === 'op' &&
           (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
      const op = next().value;
      const r = primary();
      if (op === '*') { l = Number(l) * Number(r); }
      else if (op === '/') { l = Number(r) === 0 ? 0 : Number(l) / Number(r); }
      else { l = Number(r) === 0 ? 0 : Number(l) % Number(r); }
    }
    return l;
  }

  function addExpr() {
    let l = mulExpr();
    while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = next().value;
      const r = mulExpr();
      l = op === '+' ? Number(l) + Number(r) : Number(l) - Number(r);
    }
    return l;
  }

  function cmpExpr() {
    let l = addExpr();
    while (peek() && peek().type === 'cmp') {
      const op = next().value;
      const r = addExpr();
      switch (op) {
        case '==': l = looseEq(l, r); break;
        case '!=': l = !looseEq(l, r); break;
        case '<':  l = Number(l) < Number(r); break;
        case '>':  l = Number(l) > Number(r); break;
        case '<=': l = Number(l) <= Number(r); break;
        case '>=': l = Number(l) >= Number(r); break;
      }
    }
    return l;
  }

  function andExpr() {
    let l = cmpExpr();
    while (peek() && peek().type === 'and') { next(); const r = cmpExpr(); l = truthy(l) && truthy(r); }
    return l;
  }

  function orExpr() {
    let l = andExpr();
    while (peek() && peek().type === 'or') { next(); const r = andExpr(); l = truthy(l) || truthy(r); }
    return l;
  }

  return orExpr();
}

/* Smarty compares loosely; '' == undefined has to be true or every
   `$x == ''` guard in the templates would behave differently here than there. */
function looseEq(a, b) {
  if (a === undefined || a === null) { a = ''; }
  if (b === undefined || b === null) { b = ''; }
  return String(a) === String(b);
}

function truthy(v) {
  if (v === undefined || v === null || v === false) { return false; }
  if (v === 0 || v === '' || v === '0') { return false; }
  if (Array.isArray(v)) { return v.length > 0; }
  return true;
}

function tokenize(src) {
  const out = [];
  const re = /\s*(?:(\$[A-Za-z0-9_.\[\]]+)|'([^']*)'|"([^"]*)"|(\d+)|(==|!=|<=|>=|<|>)|(\|\||&&|\bor\b|\band\b|\bnot\b|!)|([-+*/%])|(\()|(\)))/gy;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (m[1] !== undefined)      { out.push({ type: 'var', value: m[1].slice(1) }); }
    else if (m[2] !== undefined) { out.push({ type: 'str', value: m[2] }); }
    else if (m[3] !== undefined) { out.push({ type: 'str', value: m[3] }); }
    else if (m[4] !== undefined) { out.push({ type: 'num', value: Number(m[4]) }); }
    else if (m[5] !== undefined) { out.push({ type: 'cmp', value: m[5] }); }
    else if (m[6] !== undefined) {
      const v = m[6];
      if (v === '||' || v === 'or') { out.push({ type: 'or' }); }
      else if (v === '&&' || v === 'and') { out.push({ type: 'and' }); }
      else { out.push({ type: 'not' }); }
    }
    else if (m[7] !== undefined) { out.push({ type: 'op', value: m[7] }); }
    else if (m[8] !== undefined) { out.push({ type: 'lparen' }); }
    else if (m[9] !== undefined) { out.push({ type: 'rparen' }); }
    if (re.lastIndex >= src.length) { break; }
  }
  return out;
}

/* --- the template itself -------------------------------------------------- */
/* Split into text and <{ … }> tags, then walk it as a stream. */
function parse(src) {
  const nodes = [];
  const re = /<\{(.*?)\}>/gs;
  let last = 0, m;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) { nodes.push({ t: 'text', v: src.slice(last, m.index) }); }
    nodes.push({ t: 'tag', v: m[1].trim() });
    last = m.index + m[0].length;
  }
  if (last < src.length) { nodes.push({ t: 'text', v: src.slice(last) }); }
  return nodes;
}

function render(src, data) {
  const nodes = parse(src);
  const sections = {};
  let out = '';
  let i = 0;

  /* Returns the rendered string for nodes[from…] until the matching closer,
     and leaves `i` on the node after it. Skipping is the same walk with
     output thrown away, so nested blocks nest correctly either way. */
  function block(stopAt, emit) {
    let s = '';
    while (i < nodes.length) {
      const n = nodes[i];
      if (n.t === 'text') { if (emit) { s += n.v; } i++; continue; }

      const tag = n.v;

      if (/^\*/.test(tag)) { i++; continue; }                 // comment

      if (stopAt.some((k) => tagIs(tag, k))) { return s; }     // caller handles

      if (tagIs(tag, 'if')) {
        i++;
        s += ifBlock(tag, emit);
        continue;
      }

      if (tagIs(tag, 'section')) {
        i++;
        s += sectionBlock(tag, emit);
        continue;
      }

      // a plain output tag: <{$x}> or <{$x|modifier:"y"}>
      i++;
      if (emit && tag.startsWith('$')) {
        const path = tag.replace(/^\$/, '').split('|')[0].trim();
        const v = value(path, data, sections);
        s += (v === undefined || v === null || typeof v === 'object') ? '' : String(v);
      }
      continue;
    }
    return s;
  }

  function tagIs(tag, kw) {
    return tag === kw || tag.startsWith(kw + ' ') || tag === '/' + kw || tag.startsWith('/' + kw);
  }

  function ifBlock(openTag, emit) {
    let taken = emit && truthy(evalExpr(openTag.replace(/^if\s*/, ''), data, sections));
    let done = taken;
    let s = block(['elseif', 'else', '/if'], taken);

    while (i < nodes.length) {
      const n = nodes[i];
      if (n.t !== 'tag') { break; }
      if (n.v === '/if') { i++; break; }
      if (n.v.startsWith('elseif')) {
        i++;
        const take = emit && !done && truthy(evalExpr(n.v.replace(/^elseif\s*/, ''), data, sections));
        s += block(['elseif', 'else', '/if'], take);
        done = done || take;
        continue;
      }
      if (n.v === 'else') {
        i++;
        const take = emit && !done;
        s += block(['/if'], take);
        done = done || take;
        continue;
      }
      break;
    }
    return s;
  }

  function sectionBlock(openTag, emit) {
    const name = (/name=([A-Za-z0-9_]+)/.exec(openTag) || [])[1];
    const loopPath = (/loop=\$([A-Za-z0-9_.\[\]]+)/.exec(openTag) || [])[1];
    const arr = loopPath ? value(loopPath, data, sections) : undefined;
    const total = Array.isArray(arr) ? arr.length : 0;

    const start = i;
    let s = '';

    if (!emit || total === 0) {
      // Walk the body once with output off so `i` lands past <{/section}>.
      i = start;
      block(['/section'], false);
      i++;                                   // consume <{/section}>
      return '';
    }

    for (let k = 0; k < total; k++) {
      sections[name] = { index: k, total: total };
      i = start;
      s += block(['/section'], true);
    }
    delete sections[name];
    i++;                                     // consume <{/section}>
    return s;
  }

  out = block([], true);
  return out;
}

/* --- cli ------------------------------------------------------------------ */
const [tpl, fixture] = process.argv.slice(2);
if (!tpl || !fixture) {
  console.error('usage: node tools/render-smarty.js <template.tpl> <fixture.json>');
  process.exit(2);
}
const src = fs.readFileSync(tpl, 'utf8');
const data = JSON.parse(fs.readFileSync(fixture, 'utf8'));
process.stdout.write(render(src, data));

module.exports = { render };
