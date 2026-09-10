/* ---------------------------------------------------------------------------
   build-cart.js — 買い物かごページを移植する

   山口様のご指摘のうち、このページに関わるもの:
     商品特殊表示がない / 商品画像がすべてLサイズ / 説明文がない /
     上部固定・フッター（共通側で対応済み）

   ※ 「説明文がない」の中身

      元テンプレートの下半分は、まるごと案内文です。

        ■配達日に関しまして（延滞の注意）
        ■送料について（800円・30,000円以上無料・北海道沖縄離島の但し書き）
        送料・お支払い方法のガイドへのボタン
        名入れ・包装・のし へのボタン
        買い物かごの商品について見積もりを依頼するボタン
        税率の画像

      **注文直前にいちばん読まれる場所**です。こちらの版はカゴの表と
      合計金額しか出しておらず、丸ごと落ちていました。

   ※ [BASKET_ADDCODE2] は $cart.list[i].special_display です

      商品詳細の [ITEMCAPTION_1]、カテゴリの [ADDCODE] と同じ「商品別特殊表示」。
      **カートの分だけは以前から使えていました**（cart-body.tpl に1箇所）。
      詳細・カテゴリ・検索で書き忘れていたのが今回の指摘です。

   ※ 数量の ▲▼ は数値入力欄にします

      元は [BASKET_UPCOUNT] / [BASKET_DOWNCOUNT] というURLで、押すたびに
      ページが再読み込みされていました。クリエイターに同じURLはありません。
      修正ボタン（$cart.list[i].quantity_url）は元どおり残します。
--------------------------------------------------------------------------- */
/* ※ 一覧の価格に桁区切りがありません（実測・2026-09-10）
 *
 *      現行    販売価格39,600円（税込）
 *      移植版  販売価格39600円（税込）
 *
 *    商品詳細には $item.price_html（55,000）がありますが、**一覧の
 *    タグには price_html がありません。** 試しに書くと空になり、
 *    価格そのものが消えました。
 *
 *    Smarty の修飾子は使えます（$item.group.list|@count で確認済み）。
 *    number_format を通すと現行と1文字も違わなくなりました。 */
const fs = require("fs");
const { shell } = require("./shell.js");
const { rewrite } = require("./url-map.js");
const { tiles } = require("./_tiles.js");

let body = fs.readFileSync("templates/basic-utf8/design_basketpage.html", "utf8");

/* 先頭の </table> はベーシックが自動挿入したテーブルの残骸です */
body = body.replace(/^\s*<\/table>\s*/, "");
body = body.replace(/^\s*<div class="M_mainContents" id="M_basket">\s*/, "");

const IT = "$cart.list[i]";

/* --- 商品の繰り返し -------------------------------------------------------- */
const s = body.indexOf("[IFBASKET]");
const e = body.indexOf("[IFENDBASKET]") + "[IFENDBASKET]".length;
if (s < 0 || e < 0) { console.error("かごループの範囲が取れません"); process.exit(1); }

const rows = [
'<{if $cart.has_item}>',
'<{section name=i loop=$cart.list}>',
'        <tr>',
'            <td class="basketNum"><{' + IT + '.num}></td>',
'            <td class="basketImg"><a href="<{' + IT + '.url}>"><img src="<{' + IT + '.image_S}>" alt="<{' + IT + '.name}>" border="0"></a></td>',
'            <td class="basketName">',
'                <p><a href="<{' + IT + '.url}>"><{' + IT + '.name}></a></p>',
'                <{if ' + IT + '.special_display}><p class="red"><{' + IT + '.special_display}></p><{/if}>',
'                <{if ' + IT + '.selected_option.has_item}>',
'                <div class="basketOption">',
'                  <{section name=o loop=' + IT + '.selected_option.list}><{' + IT + '.selected_option.list[o].title}>：<{' + IT + '.selected_option.list[o].option_name}> <{/section}>',
'                </div>',
'                <{/if}>',
'                <{if ' + IT + '.name_print.has_item}>',
'                <div class="basketOption">',
'                  <{section name=np loop=' + IT + '.name_print.list}><{' + IT + '.name_print.list[np].title}>：<{' + IT + '.name_print.list[np].name}><br><{/section}>',
'                </div>',
'                <{/if}>',
'            </td>',
'            <td class="basketQuantity">',
'                <div class="quantityWrap">',
'                    <div class="quantityInput">',
'                        <input type="number" inputmode="numeric" min="1"',
'                               id="<{' + IT + '.quantity_id}>" data-id="<{' + IT + '.quantity_id}>"',
'                               value="<{' + IT + '.quantity}>">',
'                    </div>',
'                    <div class="quantityAmend"><a href="<{' + IT + '.quantity_url}>">修正</a></div>',
'                </div>',
'            </td>',
'            <td class="basketPrice"><{' + IT + '.total_price}>円</td>',
'            <td class="basketBtns">',
'                <a href="<{' + IT + '.remove_url}>"><img src="https://gigaplus.makeshop.jp/isplanning/images/del.png" alt="削除"></a>',
'            </td>',
'        </tr>',
'<{/section}>',
'        <tr>',
'            <td colspan="6" class="basketTotal">',
/* ※ 配送の案内を落としていました（2026-09-10）
 *
 *    元テンプレートの合計行の頭に、こう入っています。
 *
 *      <p class="haisou_txt">[CARRIAGE_MSG1]</p>
 *
 *    下のほうに置換を書いてあったのですが、**この行ごと作り直して
 *    いるので、置換する相手がもう居ませんでした。** 静かに消えます。
 *    クラスの数を現行と突き合わせて初めて分かりました。
 *
 *    リファレンスに $cart.free_shipping_message があります。
 *    「対応するタグはありません」と書いていたのは誤りです。 */
'                <p class="haisou_txt"><{$cart.free_shipping_message}></p>',
'                <dl class="totalWrap">',
'                    <dt class="totalItem">合計金額：</dt>',
/* ※ 合計金額に「円」を足しません
 *
 *    元テンプレートはこう書いています。
 *
 *      <td class="basketPrice">[BASKET_PRICE]円</td>          ← 円あり
 *      <dd class="totalPrice"><em>[BASKET_TOTALPRICE] <span>(税込)</span>  ← 円なし
 *
 *    **1件ごとの価格には付け、合計には付けない。** 店舗がそう書いている
 *    ということは、合計のほうは単位込みで返ってくるということです。
 *    こちらが足したせいで、プレビューが「58,300円円」になっていました。
 *    元のとおりにします。 */
'                    <dd class="totalPrice"><em><{$cart.total_price}> <span>(税込)</span></em></dd>',
'                </dl>',
'            </td>',
'        </tr>',
'<{else}>',
'        <tr>',
'            <td colspan="6" class="basketEmpty">',
'            <p>買い物かごに商品がありません</p>',
'            </td>',
'        </tr>',
'<{/if}>'
].join("\n");
body = body.slice(0, s) + rows + body.slice(e);

/* --- ボタン ---------------------------------------------------------------- */
body = body.replace("<a href=[GOSHOPPING]>買い物を続ける</a>", '<a href="<{$url.top}>">買い物を続ける</a>');
/* かごを空にするURLはクリエイターにありません。1件ずつの削除は残ります。 */
body = body.replace(/<a href=\[CLEAR_BASKET\][^<]*<\/a>/, "");
body = body.replace("<a href=[ORDER]>ご購入手続きへ進む</a>", '<a href="<{$cart.order_url}>">ご購入手続きへ進む</a>');
body = body.replace(/\[IFAMAZON\]<p class="amazonButtonWrap">\[AMAZON_PAY_BUTTON\]<\/p>\[IFENDAMAZON\]/,
  '<{if $amazonpay.is_enabled}><p class="amazonButtonWrap"><{$amazonpay.button_html}></p><{/if}>');

/* 見積依頼。元は [BASKET_MAIL] で、かごの中身つきの問い合わせでした。
   クリエイターに同等のタグが無いので、店舗のマルチフォームに送ります。 */
body = body.replace(/href=\[BASKET_MAIL\]/g, 'href="/shop/enq202208200" target="_blank" rel="noopener"');

/* --- 送料メッセージ -------------------------------------------------------- */
/* 残りの [CARRIAGE_MSG1] / [CARRIAGE_MSG2]（コメントアウトされている枠）を掃除します。
   合計行のぶんは上で $cart.free_shipping_message に置き換えました。 */
body = body.replace(/<p class="haisou_txt">\[CARRIAGE_MSG1\]<\/p>/,
  '<{if $cart.free_shipping_price}><p class="haisou_txt">あと <{$cart.free_shipping_price}> 円のお買い上げで送料無料です</p><{/if}>');
body = body.replace(/<p class="">\[CARRIAGE_MSG1\]<\/p>/, "");
body = body.replace("[CARRIAGE_MSG2]", "");

/* --- 最近チェックした商品 -------------------------------------------------- */
body = body.replace("[IF_RECENT]", "<{if $recently_item.has_item}>").replace("[ENDIF_RECENT]", "<{/if}>");
/* ※ 現行の「最近チェックした商品」は table#recent です（2026-09-10 実測）
 *
 *    こちらは td.lims の4列で出していました。現行は商品グループと同じ
 *    td.itemBox の形で、**あいだに区切りの画像**（mk_main_p_line.gif）が
 *    入り、名前のうしろにアイコンが付き、画像は image_S です。
 *    画像名の突き合わせで mk_main_p_line.gif が 3枚 → 0枚 と出ました。
 *    形は tools/port/_tiles.js に1つにまとめてあります。 */
body = body.replace("[RECENT]",
  tiles({ list: "$recently_item.list", name: "rc", tableId: "recent", perRow: 4 }));

/* --- 残りの制御タグを掃除 -------------------------------------------------- */
body = body.replace(/\[IF_MATOMEGAI\][\s\S]*?\[IFEND_MATOMEGAI\]/g, "");
body = body.replace(/\[(IFWISH|IFENDWISH|FORWISH|FORENDWISH)\]/g, "");
body = body.replace(/\[[A-Z_0-9]{2,}\]/g, "");

/* コメントアウトされたお気に入り表の残骸で </table> が余っています */
body = body.replace(/\s*<\/table>\s*<!--\s*-->\s*$/, "\n");

/* ※ 末尾の <!--.mainContents--></div> と、コメントアウトされたお気に入り表の
     </table> が残ります。どちらもベーシックが自動で面倒を見ていた部分です。
     .M_mainContents は shell が開いて閉じるので、ここで閉じると1つ余ります。

     ※ ここは正規表現を使いません。/ を含む文字列を正規表現リテラルに
        書くとスラッシュで閉じてしまい、しかもシェル経由で書き込むと
        バックスラッシュが落ちます。実際に2回そうなりました。 */
body = body.split("<!--.mainContents--></div>").join("");
body = body.trimEnd();

/* ※ コメントアウトされた「お気に入り」表は、丸ごと落とします
 *
 *    元テンプレートの末尾には、使っていないお気に入り一覧が
 *    1行ずつコメントアウトされて残っています。厄介なのは、
 *
 *      <!--<table id="M_basketTable">-->   ← 開きはコメントの中
 *      …
 *      </table>                            ← 閉じだけコメントの外
 *
 *    という形になっていることです。ベーシックでは他のタグと相殺して
 *    帳尻が合っていました。
 *
 *    最初は「末尾が </table> なら落とす」と書きましたが、そのあとにも
 *    コメント行が続くので一度も成立しません。次に「数えて余った閉じを
 *    落とす」に変えたら、今度は開きだけが残って **開3/閉2** になりました。
 *    div は釣り合っていたので、どちらも check-tag-balance が
 *    「preview/cart.html  table  open 8 close 9」で拾うまで気づけません。
 *
 *    片方だけ動かすから合わなくなります。**使っていないものを丸ごと
 *    落とす**のが正しい直し方です。 */
const wishAt = body.indexOf("<!--▼お気に入り商品-->");
if (wishAt >= 0) {
  body = body.slice(0, wishAt).trimEnd();
} else {
  console.error("※ お気に入り表の目印が見つかりません。末尾を確認してください。");
  process.exit(1);
}

const r = rewrite(body);
body = r.html;

/* ※ id="M_basket" を落としていました。#M_basket を前提にしたCSSが効かず、
   「ご購入手続きへ進む」が親から227pxはみ出していました（2026-09-10 実測）。 */
const out = shell({ name: "買い物カゴ", from: "basketpage", slider: false, mainId: "M_basket", body: body.trim() });
fs.writeFileSync("templates/creator/mode/cart.tpl", out);

console.log("買い物かご: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{2,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));
