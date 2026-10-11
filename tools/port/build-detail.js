const fs = require("fs");
const { shell } = require("./shell.js");
const { rewrite } = require("./url-map.js");

let body = fs.readFileSync("templates/basic-utf8/design_detailpage.html", "utf8");

body = body.replace(/^[\s\S]*?<div class="M_mainContents" id="O_itemDetail">\s*/, "");
body = body.replace(/<\/div><!--\.M_mainContents-->[\s\S]*$/, "");

const CRUMB = [
  '<a href="<{$url.top}>">ホーム</a> &nbsp;&gt;',
  '\t<{if $item.breadcrumb_list_group.has_item}>',
  '\t  <{section name=g loop=$item.breadcrumb_list_group.list}>',
  '\t    <{if $item.breadcrumb_list_group.list[g].is_base_category}>',
  '\t      <{section name=b loop=$item.breadcrumb_list_group.list[g].list}>',
  '\t        <a href="<{$item.breadcrumb_list_group.list[g].list[b].url}>"><{$item.breadcrumb_list_group.list[g].list[b].name}></a> &nbsp;&gt;',
  '\t      <{/section}>',
  '\t    <{/if}>',
  '\t  <{/section}>',
  '\t<{/if}>'
].join("\n");
body = body.replace('<a href="/">ホーム</a> &nbsp;&gt;[LIST_NO_ICON]', CRUMB);

body = body.replace("[BRANDNAME]", "<{$item.name}>");

const MAIN_IMG = [
  '<a href="<{$item.image_L}>" data-zoom><img src="<{$item.image_M}>" alt="<{$item.name}>" border="0" class="M_cl_img"></a>',
  '\t\t\t<{if $item.multi_image.has_item}>',
  '\t\t\t<div class="M_imageThumbnail">',
  '\t\t\t  <{section name=m loop=$item.multi_image.list}>',
  '\t\t\t  <div class="M_imageThumbnail-item"><a href="<{$item.multi_image.list[m].image_L}>" data-zoom><img src="<{$item.multi_image.list[m].image_S}>" alt="" border="0"></a></div>',
  '\t\t\t  <{/section}>',
  '\t\t\t</div>',
  '\t\t\t<{/if}>'
].join("\n");
const MAIN_OLD = '<a href=[VIEWBUTTON]>[MAIN_IMAGE]</a>\n\t\t\t[THUMBNAIL]';
if (body.indexOf(MAIN_OLD) < 0) { console.error("メイン画像の並びが一致しません"); process.exit(1); }
body = body.replace(MAIN_OLD, MAIN_IMG);

const addStart = body.indexOf("[IF_ITEMIMAGE_1]");
const addEnd = body.indexOf("[ENDIF_ITEMIMAGE_3]") + "[ENDIF_ITEMIMAGE_3]".length;
if (addStart < 0) { console.error("追加画像の範囲が取れません"); process.exit(1); }
const ADD_IMG = [
  '<{if $item.add_image.has_item}>',
  '\t\t\t<{section name=a loop=$item.add_image.list}>',
  '\t\t\t<div><a href="<{$item.add_image.list[a].image_url}>" data-zoom><img src="<{$item.add_image.list[a].image_url}>" alt="" border="0"></a></div>',
  '\t\t\t<{/section}>',
  '\t\t\t<{/if}>'
].join("\n");
body = body.slice(0, addStart) + ADD_IMG + body.slice(addEnd);

body = body.replace("[DETAIL_EXT]", "");
body = body.replace("[DETAIL]<!-- 商品詳細説明 -->", "<{$item.description}>");
body = body.replace("[ITEMCAPTION_2]<!-- 追加画像説明文2 -->", "<{$item.description2}>");
body = body.replace("[ITEMCAPTION_3]<!-- 追加画像説明文3 -->", "<{$item.description4}>");

body = body.replace("<span>[TAXPRICE]</span>円（税込）", "<span><{$item.price_html}></span>円（税込）");

const QTY = [
  '<{if $item.special_display}><{$item.special_display}> X<{/if}>',
  '\t\t\t\t\t<input type="number" inputmode="numeric" class="quantityInput"',
  '\t\t\t\t\t       id="<{$item.quantity_id}>" data-id="<{$item.quantity_id}>"',
  '\t\t\t\t\t       value="<{if $item.order_quantity_min}><{$item.order_quantity_min}><{else}>1<{/if}>"',
  '\t\t\t\t\t       <{if $item.order_quantity_min}>min="<{$item.order_quantity_min}>"<{/if}>',
  '\t\t\t\t\t       <{if $item.order_quantity_max}>max="<{$item.order_quantity_max}>"<{/if}>>',
  '\t\t\t\t\t<{* ※ 元は [UPCOUNT] / [DOWNCOUNT] というURLの▲▼でした。',
  '\t\t\t\t\t     クリエイターに同じURLはありません。数値入力欄にすると',
  '\t\t\t\t\t     スマホでも数字キーが出て、押す回数も減ります。 *}>'
].join("\n");
body = body.replace(/\[ITEMCAPTION_1\] X \[QUANTITY\]<ul class="count">[\s\S]*?<\/ul>/, QTY);

body = body.replace("[SALESTART]", "<{if $item.is_sale}>").replace("[SALEEND]", "<{/if}>");
body = body.replace("[DCDAY]", "");
body = body.replace("[ORGPRICE]", "<{$item.original_price_excluded_tax}>");
body = body.replace("[DCRATE]", "<{$item.sale_rate}>");

const CART_OLD = /\[IF\]<a href=\[GETBASKET\] class="detail-cart">カートに入れる<\/a>\[END\]\[ELSE\]<a href=\[GETBASKET\] class="detaol-soldout">品切れ\[ENDIF\]/;
const CART_NEW = '<{if $item.is_soldout}><span class="detaol-soldout">品切れ</span><{else}><a href="<{$item.cart_entry_url}>" class="detail-cart">カートに入れる</a><{/if}>';
body = body.replace(CART_OLD, CART_NEW);
body = body.replace("href=[WISHLIST]", 'href="<{$item.favorite_entry_url}>"');
body = body.replace("href=[QUESTION_MAIL]", 'href="<{$item.contact_url}>"');
body = body.replace(/<li><a href=\[MAIL\]>[\s\S]*?<\/li>/, "");

const OPT_OLD = '<p class="detail_option">[OPTION1]</p>\n        <p class="detail_option">[OPTION2]</p>';
body = body.replace(OPT_OLD, '<{if $item.has_option}><div class="detail_option"><{$item.option_html}></div><{/if}>');

const NAME_PRINT = [
  '<{if $item.is_name_print and $item.name_print.has_item}>',
  '<div class="nameorderdiv">',
  '  <{if $item.name_print.description}><p class="nameorderp"><{$item.name_print.description}></p><{/if}>',
  '  <{section name=n loop=$item.name_print.list}>',
  '    <p class="nameall"><{$item.name_print.list[n].title}><{if $item.name_print.list[n].is_required}> <span class="red">必須</span><{/if}></p>',
  '    <{$item.name_print.list[n].html}>',
  '    <{if $item.name_print.list[n].total_max}><p class="minikome">最大 <{$item.name_print.list[n].total_max}> 文字</p><{/if}>',
  '  <{/section}>',
  '</div>',
  '<{/if}>'
].join("\n");
body = body.replace(/\[IFNAMEOPTION\][\s\S]*?\[IFENDNAMEOPTION\]/, NAME_PRINT);

const ZAIKO = '<{if $item.is_soldout}>品切れ<{elseif $item.is_stock_display and not $item.is_stock_unlimited}>在庫 <{$item.stock_quantity}> 点<{if $item.is_small_stock}>（残りわずか）<{/if}><{elseif $item.is_small_stock}>残りわずか<{/if}>';
body = body.replace("[ZAIKO]", ZAIKO);
body = body.replace("[ENDFORM]<!-- 商品詳細フォームの終わりに必ず入力するタグ -->", "");

const { tiles } = require("./_tiles.js");
const GROUP = "<{if $item.group.has_item}><h3><{$item.group.name}></h3>" +
  tiles({ list: "$item.group.list", name: "g", tableId: "M_group", spe: true, icons: true, perRow: 4 }) +
  "<{/if}>";
body = body.replace("[BRANDGROUP]", GROUP);

body = body.replace(/\[REVIEW_BUTTON\]|\[REVIEW_WRITE\]/g, "");
body = body.replace("[REVIEW_VIEW_ALL]", "");
body = body.replace(/\[SYSTEM_CODE\]/g, "<{$item.system_code}>");

body = body.replace(/\[(IF|END|ELSE|ENDIF|IF_PREV|ENDIF_PREV|IF_NEXT|ENDIF_NEXT|PREV|NEXT|RESERVE|IF_RECENT|ENDIF_RECENT|RECENT)\]/g, "");

body = body.trimEnd() + "\n</div><!-- /.tab-area -->";

body = body.replace(
  '<h2 class="brandname"><p><{$item.name}></p></h2>',
  '<h2 class="brandname"><p><{$item.name}></p><{if $item.base_category.code == "ct261"}>粗品におすすめタオル類<{/if}></h2>');

body = body.replace(
  '<p class="sale"><b>早割りセール </b></p>',
  '<p class="sale"><b><{if $item.base_category.code == "ct261"}>在庫一掃特別セール<{else}>早割りセール<{/if}> </b></p>');

const TABS = [
  ['tab-btn1', '送料・類似品', '送料について'],
  ['tab-btn2', '商品カテゴリー一覧', 'その他おすすめ商品'],
  ['tab-btn3', 'この商品の<br>レビューを見る', 'この商品の類似品<br>レビュー']
];
for (const [btn, std, ct646] of TABS) {
  const from = 'for="' + btn + '">' + std + '</label>';
  const to = 'for="' + btn + '"><{if $item.base_category.code == "ct646"}>' + ct646 +
             '<{else}>' + std + '<{/if}></label>';
  if (body.indexOf(from) < 0) { console.log('  ※ タブが見つかりません: ' + btn); }
  body = body.split(from).join(to);
}

const IS646 = '$item.base_category.code == "ct646"';
const IS_SOLO_IMAGE = '$item.base_category.code == "ct646" or $item.base_category.code == "ct664"';

body = body.replace('<div id="itemImg">',
  '<div id="<{if ' + IS_SOLO_IMAGE + '}>Item_detail_Image<{else}>itemImg<{/if}>">');

const RECENT = '<div class="M_section border" id="middle_recent"><h2 class="main-ttl">最近チェックした商品</h2>' +
  "<{if $recently_item.has_item}>" +
  tiles({ list: "$recently_item.list", name: "rc", tableId: "recent", perRow: 4 }) +
  "<{/if}></div>";

const RC_MARK = "<!-- イーレコメンド設置タグ -->";
const GRP_MARK = "<!--商品グループ-->";
const TAB2 = '<div id="tab-content2" class="tab-content">';
const TAB3 = '<div id="tab-content3" class="tab-content">';

const iRc = body.indexOf(RC_MARK), iGrp = body.indexOf(GRP_MARK);
const iTab2 = body.indexOf(TAB2), iTab3 = body.indexOf(TAB3);
if (iRc < 0 || iGrp < 0 || iTab2 < 0 || iTab3 < 0 || !(iRc < iGrp && iGrp < iTab2 && iTab2 < iTab3)) {
  console.log("  ※ タブの目印が見つからないので、ct646 の入れ替えを飛ばしました");
} else {
  const between = body.slice(iRc, iTab2);
  const cutG = between.indexOf(GRP_MARK);
  const rcmdBlock = between.slice(0, cutG);
  const rest = between.slice(cutG);
  const cutClose = rest.lastIndexOf("</div>");
  const groupBlock = rest.slice(0, cutClose);
  const tab1Close = rest.slice(cutClose);

  const tab2Inner = body.slice(iTab2 + TAB2.length, iTab3);
  const cutT2 = tab2Inner.lastIndexOf("</div>");
  const tab2Body = tab2Inner.slice(0, cutT2);
  const tab2Close = tab2Inner.slice(cutT2);

  const head = body.slice(0, iRc);
  const tail = body.slice(iTab3 + TAB3.length);

  body = head +
    "<{if " + IS646 + "}>\n" + RECENT + "\n<{else}>\n" +
    rcmdBlock + groupBlock +
    "<{/if}>\n" + tab1Close +
    TAB2 + "\n<{if " + IS646 + "}>\n" + rcmdBlock + "<{else}>" +
    tab2Body + "<{/if}>\n" + tab2Close +
    TAB3 + "\n<{if " + IS646 + "}>\n" + groupBlock + "<{/if}>\n" + tail;
  console.log("  ct646: タブの中身を入れ替えました（最近チェック" + RECENT.length +
              "字 / イーレコメンド" + rcmdBlock.length + "字 / グループ" + groupBlock.length + "字）");
}

const r = rewrite(body);
body = r.html;

const out = shell({ name: "商品詳細", from: "detailpage", slider: false, mainId: "O_itemDetail",
                    ogImage: "<{$item.image_L}>", ogType: "product", body: body.trim() });
fs.writeFileSync("templates/creator/mode/detail.tpl", out);

console.log("商品詳細: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{2,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));

