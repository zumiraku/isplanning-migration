/* ---------------------------------------------------------------------------
   build-static-src.js — ご利用案内・特商法の本文を、公開ページから写す

   🔴 タグが読んでいるのは、公開中のページとは別の記録でした

      プレビューで実物を見て分かりました。

        ご利用案内   $guide.order に一部だけ。payment/delivery/return/tax は空。
                     現行の文言 269塊のうち 100塊が出ません。
        特商法       17行は出ますが中身が違います。
                       引き渡し時期        現行「10日以内」→ タグ「7日以内」
                       商品以外の必要代金   現行6項目 → タグ2項目
                     現行にある「サイト名称」の行は、そもそもありません。

      どちらも法律や取引条件に関わるページです。**今と1文字も変えずに
      出す**ことを優先して、公開ページの本文をそのまま持ってきます。
      プライバシーポリシーで先にやっているのと同じやり方です。

      ⚠️ こうすると管理画面から直せなくなります。その代わり、**今日の
         見え方が1文字も変わらない**ことは保証できます。管理画面の値を
         現行に合わせて入れ直せば、いつでもタグに戻せます。

   使い方
     node tools/port/build-static-src.js <公開ページを置いたディレクトリ>
--------------------------------------------------------------------------- */
const fs = require("fs");
const { rewrite } = require("./url-map.js");

const SRC = process.argv[2];
if (!SRC) { console.error("使い方: node tools/port/build-static-src.js <公開ページのディレクトリ>"); process.exit(1); }

function read(name) {
  const b = fs.readFileSync(SRC + "/" + name);
  let s = b.toString("utf8");
  if (s.indexOf("�") >= 0) { s = new TextDecoder("euc-jp").decode(b); }
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/* 開始の div から、対応する閉じまでを切り出します。

   🔴 位置で切ると、必ず途中で切れます。build-static-fixtures.js で
      アンカー位置に切って、閉じタグを足し引きするたびに悪化しました
      （68開き66閉じ → 68開き64閉じ → 68開き60閉じ）。入れ子を追います。 */
function block(html, opener) {
  const i = html.indexOf(opener);
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
  return null;
}

/* 🔴 引用符の無い href が1本あります

     <A class="infoa" href=http://www.isp-sp.com/html/company.html?code=isplanning>

   url-map.js は href=" で始まるものしか見ないので、**書き換えられずに
   素通りします。** 素通りしたリンクは、切り替え後もベーシックのURLを
   指したままになり、301で回るか404になります。

   引用符を付け、ドメインを外して相対パスにしてから対応表にかけます。
   ?code=isplanning は付いていても付いていなくても同じページです。 */
function normaliseHref(html) {
  return html.replace(/href=(?!["'])([^\s>]+)/gi, function (m, url) {
    let u = url;
    u = u.replace(/^https?:\/\/www\.isp-sp\.com/i, "");
    u = u.replace(/\?code=isplanning$/i, "");
    return 'href="' + u + '"';
  });
}

/* 🔴 ご利用案内の本文は、ベーシックの枠を当てにして書かれています

     終わりの3行は、こうなっていました。

       </div><!-- adminPagearea --></td></tr>
       <tr><td class=line height=10>&nbsp;</td></tr>
       </script></table></td></tr><tr><td colspan=4><!--

     `</td></tr>` も `</table>` も、**ベーシックが外側で開いていたもの**です
     （ベーシックは本文の周りに <table><tr><td> を挿し込んでいました）。
     クリエイターは何も挿し込まないので、これらは相手のいない閉じタグです。

     しかも最後の `<!--` が閉じていません。**そこから下のフッターが
     まるごとコメントになって消えます。** 突き合わせ検査が「コラムの
     見出し10本が無い」と報告して気づきました。ブラウザでは何も
     エラーにならず、フッターが出ないだけです。

     div の入れ子だけを数えて切ると、閉じていない <div> のぶん行き過ぎます。
     店舗の本文は `<!-- adminPagearea -->` で終わっているので、そこで切ります。 */
function cutAtAdminPagearea(html) {
  const at = html.indexOf("<!-- adminPagearea -->");
  if (at < 0) { return html; }
  let s = html.slice(0, at);
  /* 直前の </div> は、こちらが出す外枠の閉じです。二重にしません。 */
  const tail = s.replace(/\s+$/, "");
  return tail.endsWith("</div>") ? tail.slice(0, -"</div>".length) : s;
}

/* 切り取った断片のタグを揃えます。

   タグごとに数えて足し引きすると、入れ子で破綻します（実際に
   68開き66閉じ → 68開き64閉じ と悪化させました）。釣り合った
   HTMLから切り取った断片は必ずこの形なので、スタックで追えます。

     先頭に「対応する開きが無い閉じ」が並ぶ
     末尾に「対応する閉じが無い開き」が残る */
const PAIRED = ["div", "table", "tbody", "thead", "tr", "td", "th", "ul", "ol", "li", "p", "span", "a", "dl", "dt", "dd", "form"];

/* 🔴 閉じ忘れは「黙って捨てる」のではなく「閉じる」

     現行の特商法には、閉じていない <td> が1つあります（お支払い方法の行）。

       <td>
       銀行振込・代金引換<br>
       …必ず受け取るようにお願いいたします。
       </tr>              ← <td> が閉じないまま行が終わる

     ブラウザは黙って直すので、公開中のサイトでは何も起きていません。
     最初の版はこれを**捨てて**いました（</tr> に出会ったとき、間に
     残っていた <td> をスタックから外すだけ）。**出力はそのまま
     壊れたまま**です。管理画面が保存前に検査していると、こういう
     ところで黙って弾かれます。

     間に残っているものを、先に閉じてから外します。**見た目は1ピクセルも
     変わりません。**ブラウザがやっていたことを、先にやっておくだけです。 */
function balance(html) {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;
  const stack = [];
  const edits = [];          /* [位置, 消す長さ, 差し込む文字列] */
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === "/";
    const tag = m[2].toLowerCase();
    if (!PAIRED.includes(tag) || m[3] === "/") { continue; }
    if (closing) {
      const at = stack.lastIndexOf(tag);
      if (at < 0) {
        edits.push([m.index, m[0].length, ""]);        /* 相手のいない閉じ */
      } else {
        let fill = "";
        for (let i = stack.length - 1; i > at; i--) { fill += "</" + stack[i] + ">"; }
        if (fill) { edits.push([m.index, 0, fill]); }  /* 閉じ忘れを先に閉じる */
        stack.length = at;
      }
    } else {
      stack.push(tag);
    }
  }
  let out = html;
  let dropped = 0, filled = 0;
  for (let i = edits.length - 1; i >= 0; i--) {
    const [at, len, ins] = edits[i];
    if (len) { dropped++; } else { filled++; }
    out = out.slice(0, at) + ins + out.slice(at + len);
  }
  for (let i = stack.length - 1; i >= 0; i--) { out += "\n</" + stack[i] + ">"; }
  return { html: out, dropped: dropped, filled: filled, closed: stack.length };
}

function save(file, body, label) {
  /* 波ダッシュは公開中のサイトに合わせます（U+301C → U+FF5E）。 */
  const r = rewrite(normaliseHref(body.split("〜").join("～")));
  const b = balance(r.html);
  const out = b.html.trim() + "\n";
  fs.writeFileSync("templates/creator/port-src/" + file, out);
  console.log("  " + label.padEnd(12) + String(out.split("\n").length).padStart(4) + " 行  " +
              String(out.length).padStart(6) + " バイト  / URL書き換え " + r.rewritten +
              " / 相手のいない閉じを外した " + b.dropped +
              " / 閉じ忘れを閉じた " + b.filled + " / 末尾に足した " + b.closed);
  if (r.missing.length) {
    console.log("     🔴 対応表に無いURL " + r.missing.length + " 件: " + r.missing.join("  "));
  }
}

/* --- ご利用案内 ------------------------------------------------------------ */
const g = block(read("p-guide.html"), '<div id="O_adminPagearea" class="M_mainContents shop-guide">');
if (!g) { console.error("🔴 ご利用案内の本文が見つかりません"); process.exit(1); }
save("guide-body.tpl", cutAtAdminPagearea(g), "ご利用案内");

/* --- 特定商取引法 ---------------------------------------------------------- */
const c = block(read("p-contract.html"), '<div class="M_mainContents company transaction">');
if (!c) { console.error("🔴 特商法の本文が見つかりません"); process.exit(1); }
save("contract-body.tpl", c, "特商法");
