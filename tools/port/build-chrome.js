const fs = require("fs");
const { rewrite } = require("./url-map.js");

const SRC = "templates/basic-utf8";
const read = f => fs.readFileSync(SRC + "/" + f, "utf8");

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

const LOGIN_MEMBER = `<{if $member.is_logged_in}><a href="<{$url.mypage}>">マイページ</a><{elseif $shop.is_member_entry_enabled}><a href="<{$url.member_entry}>">新規会員登録</a><{/if}>`;
const LOGIN_LOGIN  = `<{if $member.is_logged_in}><a href="<{$url.logout}>">ログアウト</a><{else}><a href="<{$url.login}>">ログイン</a><{/if}>`;

const CART = [
  '<div class="M_headBasket" id="M_basketTemp1">',
  '  <div id="M_headBasketSwitch">',
  '    <div id="M_basketClosedBox">',
  '      <a href="<{$url.cart}>" id="M_basket"><em><{if $cart.has_item}><{$cart.total_quantity}><{else}>0<{/if}></em>',
  '        <div class="M_basketMarginBox">買い物かご</div>',
  '      </a>',
  '    </div>',
  '    <div id="M_basketOpenedBox">',
  '      <div class="M_basketMarginBox">',
  '        <table>',
  '          <{if $cart.has_item}>',
  '            <{section name=hb loop=$cart.list}>',
  '            <tr><td><{$cart.list[hb].name}></td><td><{$cart.list[hb].quantity}>点</td><td><{$cart.list[hb].total_price}>円</td></tr>',
  '            <{/section}>',
  '            <tr id="last-child"><td colspan="3"><a href="<{$cart.order_url}>">ご購入手続きへ進む</a></td></tr>',
  '          <{else}>',
  '            <tr id="last-child"><td colspan="3">カートに商品がありません。</td></tr>',
  '          <{/if}>',
  '        </table>',
  '      </div>',
  '    </div>',
  '  </div>',
  '</div>'
].join(String.fromCharCode(10));

const SEARCH = `<input type="text" id="MakeShopTopSearchInput" data-id="<{$search_form.keyword_id}>" placeholder="キーワードを入力して検索">
<a id="MakeShopTopSearchButton" href="<{$search_form.search_url}>" role="button">検索</a>`;

function convert(html) {
  html = html.split("/shop/idinfo.html").join(IDINFO);
  for (const [k, v] of Object.entries(TAGS)) html = html.split(k).join(v);
  html = html.split("[LOGINTYPEZ]").join("__LOGIN__");
  html = html.split("[CART_INSIDE1]").join(CART);
  html = html.replace(/\[TOP_SEARCH_INPUT\]\s*\[TOP_SEARCH_BUTTON\]/, SEARCH);
  html = html.replace(/(href|src)=(<\{\$[^}]*\}>)/g, '$1="$2"');
  return html;
}


const TOGGLE_BTN = [
  '<button class="l-menu-toggle" type="button" aria-controls="M_leftContents" aria-expanded="false">',
  '  <span class="l-menu-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>',
  '  カテゴリー',
  '</button>'
].join(String.fromCharCode(10));

let top = read("design_topmenu.html");
const cut = top.indexOf('<div class="slider">');
if (cut < 0) { console.error("slider の位置が見つかりません"); process.exit(1); }
let header = top.slice(0, cut).trimEnd();
header = convert(header);
header = header.replace("__LOGIN__", LOGIN_MEMBER).replace("__LOGIN__", LOGIN_LOGIN);
header = header + String.fromCharCode(10) + TOGGLE_BTN;
const r1 = rewrite(header);
header = r1.html;

let left = read("design_leftmenu.html");
left = left.replace(/<!--[\s\S]*?-->/g, "");
left = convert(left);
function calendarBody(file) {
  const raw = fs.readFileSync("package/modules/" + file, "utf8");
  return raw.replace(/^<\{\*[\s\S]*?\*\}>\s*/, "").trimEnd();
}
left = left.replace(/\[CALENDAR_DATE\]\s*\[CALENDAR\]/, calendarBody("calendar1.tpl"))
           .replace(/\[CALENDAR_DATE2\]\s*\[CALENDAR2\]/, calendarBody("calendar2.tpl"));
left = left.replace(/(<div id="M_leftContents">)/, "$1" + String.fromCharCode(10) + '  <button class="l-menu-close" type="button" aria-label="メニューを閉じる">×</button>');
const r2 = rewrite(left);
left = r2.html;

let bottom = read("design_bottom.html");
bottom = bottom.replace(/^<!--[\s\S]*?-->/, "");
bottom = bottom.replace(/<\/td>\s*<\/tr>\s*<\/table>/g, "");
bottom = convert(bottom);

const FOOTER_HEAD = [
  "</div><!-- /.M_mainContents -->",
  "</div><!-- /#O_container -->",
  ""
].join(String.fromCharCode(10));
const FOOTER_TAIL = [
  "",
  "</div><!-- /#wrapper -->",
  "</div><!-- /#bgMain -->"
].join(String.fromCharCode(10));
bottom = FOOTER_HEAD + bottom + FOOTER_TAIL;
const r3 = rewrite(bottom);
bottom = r3.html;

const banner = name => `<{* ==========================================================================
     ${name} — ベーシックモードからの移植

     ※ これは作り直しではありません。design_${name === "header" ? "topmenu" : name === "leftmenu" ? "leftmenu" : "bottom"}.txt の
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
  console.log("\n※ 対応表に無いURL（そのまま残しました。301で飛びます）:");
  allMissing.forEach(u => console.log("    " + u));
}
const left0 = (header + left + bottom).match(/\[[A-Z_0-9]{3,}\]/g);
if (left0) console.log("\n※ 未変換のベーシックタグ: " + [...new Set(left0)].join(" "));

