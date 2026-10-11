const fs = require("fs");

const SRC = process.argv[2];
if (!SRC) { console.error("使い方: node tools/port/build-static-fixtures.js <公開ページを置いたディレクトリ>"); process.exit(1); }

function read(name) {
  const p = SRC + "/" + name;
  if (!fs.existsSync(p)) { return null; }
  const b = fs.readFileSync(p);
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); }
  return s;
}

function mainBody(html) {
  let i = html.indexOf('id="O_adminPagearea"');
  if (i < 0) { i = html.indexOf('class="M_mainContents'); }
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
  return html.slice(start);
}

function dropLeadingH2(s) {
  return s.replace(/^\s*<h2[^>]*>[\s\S]*?<\/h2>\s*/i, "");
}

const PAIRED = ["div", "table", "tbody", "thead", "tr", "td", "th", "ul", "ol", "li", "p", "span", "a", "dl", "dt", "dd", "form"];

function balance(html) {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  const stack = [];
  const dropAt = [];
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    const selfClose = m[3] === "/";
    if (!PAIRED.includes(tag) || selfClose) { continue; }
    if (closing) {
      const at = stack.lastIndexOf(tag);
      if (at < 0) { dropAt.push([m.index, m[0].length]); }
      else { stack.length = at; }
    } else {
      stack.push(tag);
    }
  }

  let out = html;
  for (let i = dropAt.length - 1; i >= 0; i--) {
    out = out.slice(0, dropAt[i][0]) + out.slice(dropAt[i][0] + dropAt[i][1]);
  }
  for (let i = stack.length - 1; i >= 0; i--) { out += "</" + stack[i] + ">"; }
  return out;
}

const out = {};

const company = read("p-company.html");
if (company) {
  const body = mainBody(company);
  if (body) { out.company = { content: dropLeadingH2(body).trim(), image_url: "" }; }
}

const contract = read("p-contract.html");
if (contract) {
  const body = mainBody(contract) || contract;
  const rows = [...body.matchAll(/<t[hH][^>]*>([\s\S]*?)<\/t[hH]>\s*<t[dD][^>]*>([\s\S]*?)<\/t[dD]>/g)];
  const clean = s => s.replace(/\s+/g, " ").trim();
  const map = {
    "販売業者": "dealer", "運営統括責任者": "manager", "所在地": "address",
    "電話番号": "tel", "メールアドレス": "mail", "商品以外の必要代金": "other_charge",
    "申し込みの有効期限": "expire_app", "不良品": "defective", "販売数量": "amount",
    "引き渡し時期": "receive_date", "お支払い方法": "pay_method",
    "お支払い期限": "expire_pay", "返品期限": "expire_return", "返品送料": "return_charge"
  };
  const c = {};
  const extra = [];
  for (const r of rows) {
    const label = clean(r[1].replace(/<[^>]*>/g, ""));
    const value = clean(r[2]);
    if (map[label]) { c[map[label]] = value; }
    else if (label) { extra.push(label); }
  }
  out.contract = c;
  if (extra.length) {
    console.log("  ※ 特商法に、リファレンスの14項目に無い行があります:");
    extra.forEach(e => console.log("     " + e));
    console.log("     → 管理画面のどれかの欄に手で書き足されている可能性が高いです。");
    console.log("       プレビューで実物を見て、足りなければテンプレートに追記します。");
  }
}

const guide = read("p-guide.html");
if (guide) {
  const body = mainBody(guide);
  if (body) {
    let g = body;
    const anchorAt = g.indexOf('id="O_guideAnchor"');
    if (anchorAt >= 0) {
      const ulEnd = g.indexOf("</ul>", anchorAt);
      const divEnd = ulEnd >= 0 ? g.indexOf("</div>", ulEnd) : -1;
      if (divEnd >= 0) { g = g.slice(divEnd + "</div>".length); }
    }
    g = g.trim();
    if (g.length < 200) { g = body.trim(); }
    out.guide = { order: balance(g), payment: "", delivery: "", tax: "", "return": "" };
  }
}

const path = "tools/fixtures/static-pages.json";
fs.writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
console.log("");
console.log("書き出し: " + path);
for (const k of Object.keys(out)) {
  const n = JSON.stringify(out[k]).length;
  console.log("  " + k.padEnd(10) + Object.keys(out[k]).length + " 項目  " + n + " バイト");
}

