/* ---------------------------------------------------------------------------
   build-chrome.js — 上段メニュー・左メニュー・下段メニューを移植する

   🔴 方針は「移植」です。「作り直し」ではありません。

      最初の版は、タグの対応表からデザインを設計し直しました。その結果
      山口様に21件のご指摘をいただきました ── ヘッダーの文言が無い、
      上部固定が無い、左メニューが無い、フッターが簡素すぎる。
      **元テンプレートは最初から手元にあり、使わずに書き直したのが誤り**です。

      ここでは design_topmenu / design_leftmenu / design_bottom の
      **マークアップをそのまま持ってきて、タグとURLだけを置き換えます。**
      class も id も並び順も変えません。m_sys_common.css がそれらに当たって
      いるからです。

   URLについて

      元テンプレートのリンクは全部ベーシックのURL（/shopbrand/003/001/X/）です。
      そのままでも301で飛びますが、**全リンクが毎回リダイレクトを1回挟む**
      ことになります。package/url-bulk/*.csv に対応表があるので変換します。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { rewrite } = require("./url-map.js");

const SRC = "templates/basic-utf8";
const read = f => fs.readFileSync(SRC + "/" + f, "utf8");

/* --- タグの置き換え表 -------------------------------------------------------
   値は Creator のタグ。**href=[HOME] のように引用符が無い書き方**が元テンプレ
   にあるので、URL系は置換後に引用符を補います。 */
/* 会員登録バナーの遷移先。元は /shop/idinfo.html で対応表にありません。 */
const IDINFO = "<{$url.member_entry}>";

const TAGS = {
  "[HOME]":            "<{$url.top}>",
  "[USEINFO]":         "<{$url.guide}>",
  "[EMAIL]":           "<{$url.support}>",
  "[COMPANY]":         "<{$url.company}>",
  "[CONTRACT]":        "<{$url.contract}>",
  "[VIEWPRIVERCY]":    "<{$url.policy}>",
  "[MAILMAGAZINE_URL1]": "<{$url.mail_magazine}>",
  "[LOGO]":            '<img src="<{$shop.logo_url}>" class="M_ShopLogo" alt="<{$shop.name}>">',
};

/* 会員まわり。ベーシックは [LOGINTYPEZ] が2箇所にあり、片方が会員登録、
   もう片方がログインでした。Creator は真偽値と個別URLで書けます。 */
const LOGIN_MEMBER = `<{if $member.is_logged_in}><a href="<{$url.mypage}>">マイページ</a><{elseif $shop.is_member_entry_enabled}><a href="<{$url.member_entry}>">新規会員登録</a><{/if}>`;
const LOGIN_LOGIN  = `<{if $member.is_logged_in}><a href="<{$url.logout}>">ログアウト</a><{else}><a href="<{$url.login}>">ログイン</a><{/if}>`;

/* かご。ベーシックの [CART_INSIDE1] 相当。 */
const CART = `<a class="h-cart" href="<{$url.cart}>">買い物かご<span class="h-cart-count"><{$cart.total_quantity}></span></a>`;

/* 検索。🔴 <form> にしないこと（C44）。system.js は href のクリックだけを
   見ていて、action も submit も参照しません。 */
const SEARCH = `<input type="text" id="<{$search_form.keyword_id}>" data-id="<{$search_form.keyword_id}>" placeholder="キーワードを入力して検索">
<a class="searchbox__go" href="<{$search_form.search_url}>" role="button" aria-label="検索"></a>`;

function convert(html) {
  html = html.split("/shop/idinfo.html").join(IDINFO);
  for (const [k, v] of Object.entries(TAGS)) html = html.split(k).join(v);
  html = html.split("[LOGINTYPEZ]").join("__LOGIN__");           // 2箇所を後で区別
  html = html.split("[CART_INSIDE1]").join(CART);
  html = html.replace(/\[TOP_SEARCH_INPUT\]\s*\[TOP_SEARCH_BUTTON\]/, SEARCH);
  /* href=<{...}> のように引用符が無い箇所を補う */
  html = html.replace(/(href|src)=(<\{\$[^}]*\}>)/g, '$1="$2"');
  return html;
}


/* ☰ ボタン。旧サイトには無い、こちらの追加です。960px 未満でだけ出ます。
   山口様のご指摘「左メニュー部分はスマホでは lll で呼び出す感じ」への対応。 */
const TOGGLE_BTN = [
  '<button class="l-menu-toggle" type="button" aria-controls="M_leftContents" aria-expanded="false">',
  '  <span class="l-menu-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>',
  '  カテゴリー',
  '</button>'
].join(String.fromCharCode(10));

/* --- 1. ヘッダー ---------------------------------------------------------- */
let top = read("design_topmenu.html");
/* スライダーから下は各ページ側で出します（トップだけスライダーが要るため）。
   ここで切ります。 */
const cut = top.indexOf('<div class="slider">');
if (cut < 0) { console.error("slider の位置が見つかりません"); process.exit(1); }
let header = top.slice(0, cut).trimEnd();
header = convert(header);
/* 2つの __LOGIN__ を、元の並び（会員 → ログイン）で置き換える */
header = header.replace("__LOGIN__", LOGIN_MEMBER).replace("__LOGIN__", LOGIN_LOGIN);
header = header + String.fromCharCode(10) + TOGGLE_BTN;
const r1 = rewrite(header);
header = r1.html;

/* --- 2. 左メニュー -------------------------------------------------------- */
let left = read("design_leftmenu.html");
left = left.replace(/<!--[\s\S]*?-->/g, "");        // ベーシック特有の注意書きを除去
left = convert(left);
/* 営業日カレンダーはタグが無いので、既存のモジュールを呼びます */
left = left.replace(/\[CALENDAR_DATE\]\s*\[CALENDAR\]/, "<{$module.calendar1}>")
           .replace(/\[CALENDAR_DATE2\]\s*\[CALENDAR2\]/, "<{$module.calendar2}>");
left = left.replace(/(<div id="M_leftContents">)/, "$1" + String.fromCharCode(10) + '  <button class="l-menu-close" type="button" aria-label="メニューを閉じる">×</button>');
const r2 = rewrite(left);
left = r2.html;

/* --- 3. フッター ---------------------------------------------------------- */
let bottom = read("design_bottom.html");
bottom = bottom.replace(/^<!--[\s\S]*?-->/, "");    // 先頭の </td></tr></table> の注記
bottom = bottom.replace(/<\/td>\s*<\/tr>\s*<\/table>/g, "");  // 自動挿入テーブルの残骸
bottom = convert(bottom);

/* 🔴 開閉の帳尻。
     header が #wrap と #bgMain を開き、各ページが #wrapper / #O_container /
     .M_mainContents を開いて閉じます。footer は元テンプレートの都合で1つしか
     閉じないので、ここで #bgMain と #wrap のぶんを揃えます。ベーシックは
     <table> を自動挿入していたため、元ファイルだけでは釣り合いません。 */
const FOOTER_TAIL = String.fromCharCode(10) + "</div><!-- /#wrap -->";
bottom = bottom + FOOTER_TAIL;
const r3 = rewrite(bottom);
bottom = r3.html;

/* --- 書き出し ------------------------------------------------------------- */
const banner = name => `<{* ==========================================================================
     ${name} — ベーシックモードからの移植

     🔴 これは作り直しではありません。design_${name === "header" ? "topmenu" : name === "leftmenu" ? "leftmenu" : "bottom"}.txt の
        マークアップをそのまま持ってきて、タグとURLだけ置き換えたものです。
        class も id も並び順も変えていません。m_sys_common.css がそれらに
        当たっているためです。

        生成物です。直すときは tools/port/build-chrome.js を直してください。
   ========================================================================== *}>
`;

fs.mkdirSync("package/modules", { recursive: true });
fs.writeFileSync("package/modules/header.tpl",   banner("header") + header + "\n");
fs.writeFileSync("package/modules/leftmenu.tpl", banner("leftmenu") + left.trim() + "\n");
fs.writeFileSync("package/modules/footer.tpl",   banner("footer") + bottom.trim() + "\n");

const stat = (n, s, r) => console.log("  " + n.padEnd(12) + String(s.split("\n").length).padStart(4) + " 行   URL書換 " + String(r.rewritten).padStart(3) + " 本   未対応 " + r.missing.length);
console.log("移植:");
stat("header.tpl", header, r1);
stat("leftmenu.tpl", left, r2);
stat("footer.tpl", bottom, r3);
const allMissing = [...new Set([...r1.missing, ...r2.missing, ...r3.missing])];
if (allMissing.length) {
  console.log("\n🔴 対応表に無いURL（そのまま残しました。301で飛びます）:");
  allMissing.forEach(u => console.log("    " + u));
}
const left0 = (header + left + bottom).match(/\[[A-Z_0-9]{3,}\]/g);
if (left0) console.log("\n🔴 未変換のベーシックタグ: " + [...new Set(left0)].join(" "));
