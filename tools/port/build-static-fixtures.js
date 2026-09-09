/* ---------------------------------------------------------------------------
   build-static-fixtures.js — 会社概要・特商法・ご利用案内の中身を実データにする

   🔴 作り物のデータでは、これらのページを確認できません

      この3枚の中身は $company.content / $contract.* / $guide.* から来ます。
      検査用データに何も入っていないと、プレビューは見出しだけの空ページに
      なり、**「移植で落ちた」のか「データが無いだけ」のかが区別できません。**

      実際、突き合わせ検査は「現行にあって移植版に無い」を会社概要で13件、
      特商法で38件、ご利用案内で115件と報告しました。全部データ不足です。
      この状態では、本物の欠落がまぎれても気づけません。

      公開中のページから中身を取って、検査用データに入れます。

   🔴 これは「本番のデータ」ではありません

      あくまでプレビューを実物に近づけるためのものです。本番では
      プラットフォームが管理画面の値を渡します。**ここで作った値が
      本番に出ることはありません。**
--------------------------------------------------------------------------- */
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

/* 本文の枠（#O_adminPagearea か .M_mainContents）の中身を取ります。 */
function mainBody(html) {
  let i = html.indexOf('id="O_adminPagearea"');
  if (i < 0) { i = html.indexOf('class="M_mainContents'); }
  if (i < 0) { return null; }
  const start = html.indexOf(">", i) + 1;
  /* div の入れ子を数えて、対応する閉じまで */
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

/* 見出しの <h2> は、ページ側のテンプレートが出します。中身からは外します。 */
function dropLeadingH2(s) {
  return s.replace(/^\s*<h2[^>]*>[\s\S]*?<\/h2>\s*/i, "");
}

/* ---------------------------------------------------------------------------
   切り取った断片のタグを揃えます

   🔴 タグごとに数える方式は、入れ子で破綻します

      最初は「div の開きと閉じを数えて差を足し引き」していました。
      入れ子が絡むと、足したり削ったりが打ち消し合って**かえって悪化**します。
      実際 guide.html が 68開き66閉じ → 68開き64閉じ と悪くなりました。

      釣り合ったHTMLから切り取った断片は、必ずこの形です。

        先頭に「対応する開きが無い閉じ」が並ぶ
        末尾に「対応する閉じが無い開き」が残る

      スタックで追えば、どちらも順番どおりに直せます。

   ⚠️ これは検査用データの話です。本番の値はプラットフォームが渡します。
--------------------------------------------------------------------------- */
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
      if (at < 0) { dropAt.push([m.index, m[0].length]); }   // 対応する開きが無い
      else { stack.length = at; }
    } else {
      stack.push(tag);
    }
  }

  /* 先頭側の余った閉じを、後ろから消します（位置がずれないように） */
  let out = html;
  for (let i = dropAt.length - 1; i >= 0; i--) {
    out = out.slice(0, dropAt[i][0]) + out.slice(dropAt[i][0] + dropAt[i][1]);
  }
  /* 末尾に残った開きを、内側から閉じます */
  for (let i = stack.length - 1; i >= 0; i--) { out += "</" + stack[i] + ">"; }
  return out;
}

const out = {};

/* --- 会社概要 -------------------------------------------------------------- */
const company = read("p-company.html");
if (company) {
  const body = mainBody(company);
  if (body) { out.company = { content: dropLeadingH2(body).trim(), image_url: "" }; }
}

/* --- 特定商取引法。<th>項目名</th><td>値</td> を拾います ---------------------- */
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
    console.log("  🔴 特商法に、リファレンスの14項目に無い行があります:");
    extra.forEach(e => console.log("     " + e));
    console.log("     → 管理画面のどれかの欄に手で書き足されている可能性が高いです。");
    console.log("       プレビューで実物を見て、足りなければテンプレートに追記します。");
  }
}

/* --- ご利用案内 -------------------------------------------------------------
   🔴 分割をやめました

      最初はアンカー（#about_flow …）の位置で5つに切り分けていました。
      **釣り合ったHTMLを位置で切ると、必ず途中で切れます。** 閉じタグを
      足し引きして揃えようとしましたが、入れ子が絡んで直すたびに悪化しました。

        68開き66閉じ → 68開き64閉じ → 68開き60閉じ

      そもそも**5項目の分かれ方は実機でしか分かりません**（現行の5節が
      order/payment/delivery/tax/return のどれに入っているかは推測です）。
      推測で切ったものを、さらに機械で繕う意味がありません。

      本文をまるごと $guide.order に入れます。プレビューは中身が全部出て、
      突き合わせ検査も効きます。**分かれ方はプレビューで実物を見て決めます。**
--------------------------------------------------------------------------- */
const guide = read("p-guide.html");
if (guide) {
  const body = mainBody(guide);
  if (body) {
    /* 見出し・案内文・目次はページ側のテンプレートが出すので落とします。
     *
     * 🔴 正規表現を使いません。/ を含む文字列を正規表現リテラルに書くと
     *    スラッシュで閉じてしまい、シェル経由だとバックスラッシュも落ちます。
     *    このファイルで実際に2回起きました。 */
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
