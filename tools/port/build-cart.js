const fs = require("fs");
const { shell } = require("./shell.js");
const { rewrite } = require("./url-map.js");
const { tiles } = require("./_tiles.js");

let body = fs.readFileSync("templates/basic-utf8/design_basketpage.html", "utf8");

body = body.replace(/^\s*<\/table>\s*/, "");
body = body.replace(/^\s*<div class="M_mainContents" id="M_basket">\s*/, "");

const IT = "$cart.list[i]";

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
'                <p class="haisou_txt"><{$cart.free_shipping_message}></p>',
'                <dl class="totalWrap">',
'                    <dt class="totalItem">合計金額：</dt>',
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

body = body.replace("<a href=[GOSHOPPING]>買い物を続ける</a>", '<a href="<{$url.top}>">買い物を続ける</a>');
body = body.replace(/<a href=\[CLEAR_BASKET\][^<]*<\/a>/, "");
body = body.replace("<a href=[ORDER]>ご購入手続きへ進む</a>", '<a href="<{$cart.order_url}>">ご購入手続きへ進む</a>');
body = body.replace(/\[IFAMAZON\]<p class="amazonButtonWrap">\[AMAZON_PAY_BUTTON\]<\/p>\[IFENDAMAZON\]/,
  '<{if $amazonpay.is_enabled}><p class="amazonButtonWrap"><{$amazonpay.button_html}></p><{/if}>');

body = body.replace(/href=\[BASKET_MAIL\]/g, 'href="/shop/enq202208200" target="_blank" rel="noopener"');

body = body.replace(/<p class="haisou_txt">\[CARRIAGE_MSG1\]<\/p>/,
  '<{if $cart.free_shipping_price}><p class="haisou_txt">あと <{$cart.free_shipping_price}> 円のお買い上げで送料無料です</p><{/if}>');
body = body.replace(/<p class="">\[CARRIAGE_MSG1\]<\/p>/, "");
body = body.replace("[CARRIAGE_MSG2]", "");

body = body.replace("[IF_RECENT]", "<{if $recently_item.has_item}>").replace("[ENDIF_RECENT]", "<{/if}>");
body = body.replace("[RECENT]",
  tiles({ list: "$recently_item.list", name: "rc", tableId: "recent", perRow: 4 }));

body = body.replace(/\[IF_MATOMEGAI\][\s\S]*?\[IFEND_MATOMEGAI\]/g, "");
body = body.replace(/\[(IFWISH|IFENDWISH|FORWISH|FORENDWISH)\]/g, "");
body = body.replace(/\[[A-Z_0-9]{2,}\]/g, "");

body = body.replace(/\s*<\/table>\s*<!--\s*-->\s*$/, "\n");

body = body.split("<!--.mainContents--></div>").join("");
body = body.trimEnd();

const wishAt = body.indexOf("<!--▼お気に入り商品-->");
if (wishAt >= 0) {
  body = body.slice(0, wishAt).trimEnd();
} else {
  console.error("※ お気に入り表の目印が見つかりません。末尾を確認してください。");
  process.exit(1);
}

const r = rewrite(body);
body = r.html;

const out = shell({ name: "買い物カゴ", from: "basketpage", slider: false, mainId: "M_basket", body: body.trim() });
fs.writeFileSync("templates/creator/mode/cart.tpl", out);

console.log("買い物かご: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{2,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));

