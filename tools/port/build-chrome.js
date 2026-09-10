/* ---------------------------------------------------------------------------
   build-chrome.js — 上段メニュー・左メニュー・下段メニューを移植する

   ※ 方針は「移植」です。「作り直し」ではありません。

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

/* かご。ベーシックの [CART_INSIDE1] 相当。
 *
 * ※ 最初は「買い物かご 0」と数を出すだけにしていました
 *
 *    公開ページを見たら、**ホバーで中身が開く箱**でした。
 *
 *      <div class="M_headBasket" id="M_basketTemp1">
 *        <div id="M_headBasketSwitch" onmouseover='…toggleBasketBox(true)' …>
 *          <div id="M_basketClosedBox"><a id="M_basket">買い物かご</a></div>
 *          <div id="M_basketOpenedBox">…カートに商品がありません。…</div>
 *
 *    クラスは m_sys_common.css に全部あります（.M_headBasket /
 *    .M_basketMarginBox / #M_basketOpenedBox）。**自前の名前で書いていた
 *    ので、CSSが1つも当たっていませんでした。**
 *
 * ※ MakeShop_toggleBasketBox は呼びません
 *
 *    ベーシックのプラットフォームが定義していた関数で、クリエイターに
 *    あるとは限りません。**無ければマウスを乗せるたびにJSエラー**です。
 *    開閉はCSSの :hover でやります（port-responsive.css）。動きは同じで、
 *    JSに依存しません。
 *
 * ※ 数の丸（バッジ）を、空のときに出していませんでした（2026-09-10）
 *
 *    `<{if $cart.has_item}>` で囲っていたので、カゴが空だと <em> ごと
 *    消えていました。公開ページを取り直したら、こうでした。
 *
 *      <a href="/shop/basket.html" id="M_basket"><em>0</em>
 *        <div class="M_basketMarginBox">買い物かご</div></a>
 *
 *    **空でも「0」を出しています。しかも <em> は div の前です。**
 *    CSS（#M_basketClosedBox #M_basket em）は position:absolute の
 *    20px の丸で、右上に重ねる作りです。囲みを外して常に出します。
 *    初めて来た人はカゴが空なので、**大半の訪問で丸が消えていました。** */
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

/* 検索。※ <form> にしないこと（C44）。system.js は href のクリックだけを
   見ていて、action も submit も参照しません。 */
/* ※ id は元のまま、プラットフォーム用は data-id に
 *
 *    m_sys_common.css は**プラットフォームが出していたid**で当てています。
 *
 *      li#gNav06 input#MakeShopTopSearchInput { … }
 *      li#gNav06 #MakeShopTopSearchButton { background: … h-search.png … }
 *
 *    最初は自前の .searchbox__go を付けていました。そのCSSは旧設計側に
 *    書いてあって、退役と一緒に消えたので、**検索ボタンが素の文字リンクに
 *    なっていました。** 新しくCSSを書き足すのではなく、元のidに戻します。
 *
 *    プラットフォームが読むのは data-id と href なので、id は見た目のために
 *    使えます（system.js の getFormValue は [data-id=…] で引いています）。 */
/* ※ 中身を空にしたら、ボタンの高さが 0 になりました（実測・2026-09-10）
 *
 *      現行    30 x 32     <a … id="MakeShopTopSearchButton">検索</a>
 *      移植版  30 x  0     <a … aria-label="検索"></a>
 *
 *    CSSは line-height:32px で高さを作っています。**行が無ければ
 *    line-height は効きません。** 中身を空にした時点で高さが消え、
 *    背景の虫めがね（h-search.png）ごと見えなくなっていました。
 *    高さをCSSで足すのではなく、現行と同じく「検索」の2文字を戻します
 *    （text-indent:20px で外に出るので、見えるのは虫めがねだけです）。 */
const SEARCH = `<input type="text" id="MakeShopTopSearchInput" data-id="<{$search_form.keyword_id}>" placeholder="キーワードを入力して検索">
<a id="MakeShopTopSearchButton" href="<{$search_form.search_url}>" role="button">検索</a>`;

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
/* ※ モジュールの中からモジュールは呼べません
 *
 *    営業日カレンダーにはタグが無いので、最初は左メニューの中で
 *    `<{$module.calendar1}>` と書いていました。**展開されません。**
 *    プレビューを撮って分かりました。
 *
 *      <div id="sideCalender">
 *        <div class="calendar_1"> </div>   ← 空
 *        <div class="calendar_2"> </div>   ← 空
 *      </div>
 *
 *    モジュール（calendar1）には中身が4,502文字ちゃんと入っていて、
 *    呼び出しだけが素通りします。**エラーは出ません。**
 *    ページ種別からモジュールを呼ぶのは効きます（category.tpl の
 *    `<{$module.freespace_calendar}>` は出ています）。効かないのは
 *    モジュールの中からの呼び出しだけです。
 *
 *    中身をそのまま埋め込みます。カレンダーは毎月手で直すものなので、
 *    直す先が左メニューになるだけです（モジュールは残しておきます）。 */
function calendarBody(file) {
  const raw = fs.readFileSync("package/modules/" + file, "utf8");
  /* 先頭の注意書き（<{* … *}>）は、埋め込み先で邪魔になるので落とします */
  return raw.replace(/^<\{\*[\s\S]*?\*\}>\s*/, "").trimEnd();
}
left = left.replace(/\[CALENDAR_DATE\]\s*\[CALENDAR\]/, calendarBody("calendar1.tpl"))
           .replace(/\[CALENDAR_DATE2\]\s*\[CALENDAR2\]/, calendarBody("calendar2.tpl"));
left = left.replace(/(<div id="M_leftContents">)/, "$1" + String.fromCharCode(10) + '  <button class="l-menu-close" type="button" aria-label="メニューを閉じる">×</button>');
const r2 = rewrite(left);
left = r2.html;

/* --- 3. フッター ---------------------------------------------------------- */
let bottom = read("design_bottom.html");
bottom = bottom.replace(/^<!--[\s\S]*?-->/, "");    // 先頭の </td></tr></table> の注記
bottom = bottom.replace(/<\/td>\s*<\/tr>\s*<\/table>/g, "");  // 自動挿入テーブルの残骸
bottom = convert(bottom);

/* ※ フッターの帯は、本文の外です
 *
 *    以前ここに「#colum-wrap も #footer_guideWrap も .M_mainContents の
 *    中にありました」と書いていました。**誤りでした。**
 *    公開中のページを 1280px で測ると、こうなっています。
 *
 *      #footer_guideWrap(1265) < #wrapper(1265) < #bgMain < #wrap
 *      #colum-wrap(1265)       < #wrapper(1265) < #bgMain < #wrap
 *
 *    どちらも #wrapper の直下、**本文の兄弟**です。中に入れると、
 *    幅1200pxの `#footer_guide` が幅990pxの本文に入ることになり、
 *    **1280pxで 1443px まではみ出します。** 実機の幅で測って出ました。
 *    手元のプレビューは1024pxまでしか測っておらず、見つかりませんでした。
 *
 *    「本文が左メニューの下に落ちる」で外に出すのをやめた経緯がありますが、
 *    あれは #O_container が float だった頃の話です。いまは flex なので、
 *    先に閉じても本文は横に並びます。**測って確かめます。**
 *
 *    元テンプレートの末尾には </div> が1つ余分に付いています（ベーシックが
 *    自動挿入したテーブルと帳尻を合わせるためのもの）。それが #wrap を
 *    閉じるぶんになります。 */
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

/* --- 書き出し ------------------------------------------------------------- */
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
