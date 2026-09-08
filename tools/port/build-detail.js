/* ---------------------------------------------------------------------------
   build-detail.js — 商品詳細ページを移植する

   山口様のご指摘のうち、このページに関わるもの:
     商品特殊表示がない / 説明文が2重 / 画像が拡大できない /
     上部固定・左メニュー・フッター（これらは共通側で対応済み）

   🔴 [ITEMCAPTION_1] は $item.special_display です

      元テンプレート:  <dd class="itemCount">[ITEMCAPTION_1] X [QUANTITY]
      公開ページ:      数量： ※オンデマンドフルカラー…単価＠238円（税別）100個入り X …

      以前これを $item.caption_1 という**存在しない名前**だと推定し、
      「未確認だから」と外したまま公開しました。正解はリファレンスに
      「商品別特殊表示」として載っていました。

   🔴 説明文は description だけ

      $item.description2 は $item.description と**完全一致**します（6商品で
      byte比較）。両方出したのが「説明文が2重」です。description3 / 4 は
      別内容（追加説明文）なので、元テンプレートの caption2 / caption3 の
      位置に置きます。

   🔴 画像の拡大

      ベーシックには「商品画像拡大画面」というページ種別があり、[VIEWBUTTON]
      がそこへのリンクでした。**クリエイターにはこのページ種別がありません**
      （16種の一覧に無い）。同じ画面に重ねて表示する形にします。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { shell } = require("./shell.js");
const { rewrite } = require("./url-map.js");

let body = fs.readFileSync("templates/basic-utf8/design_detailpage.html", "utf8");

/* 先頭の jQuery / bxSlider の読み込みは外します。プラットフォームが 3.7.1 を
   読みますし、二重読み込みは元サイトでも起きていた事故です。 */
body = body.replace(/^[\s\S]*?<div class="M_mainContents" id="O_itemDetail">\s*/, "");
body = body.replace(/<\/div><!--\.M_mainContents-->[\s\S]*$/, "");

/* --- パンくず -------------------------------------------------------------- */
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

/* --- 画像 ------------------------------------------------------------------ */
const MAIN_IMG = [
  '<a href="<{$item.image_L}>" class="js-zoom" data-zoom><img src="<{$item.image_L}>" alt="<{$item.name}>" border="0" class="M_cl_img"></a>',
  '\t\t\t<{if $item.multi_image.has_item}>',
  '\t\t\t<div class="M_imageThumbnail">',
  '\t\t\t  <{section name=m loop=$item.multi_image.list}>',
  '\t\t\t  <div class="M_imageThumbnail-item"><a href="<{$item.multi_image.list[m].image_L}>" class="js-zoom" data-zoom><img src="<{$item.multi_image.list[m].image_S}>" alt="" border="0"></a></div>',
  '\t\t\t  <{/section}>',
  '\t\t\t</div>',
  '\t\t\t<{/if}>'
].join("\n");
const MAIN_OLD = '<a href=[VIEWBUTTON]>[MAIN_IMAGE]</a>\n\t\t\t[THUMBNAIL]';
if (body.indexOf(MAIN_OLD) < 0) { console.error("メイン画像の並びが一致しません"); process.exit(1); }
body = body.replace(MAIN_OLD, MAIN_IMG);

/* 追加画像3枚 → add_image のループ。元は1枚ずつ書かれています。 */
const addStart = body.indexOf("[IF_ITEMIMAGE_1]");
const addEnd = body.indexOf("[ENDIF_ITEMIMAGE_3]") + "[ENDIF_ITEMIMAGE_3]".length;
if (addStart < 0) { console.error("追加画像の範囲が取れません"); process.exit(1); }
const ADD_IMG = [
  '<{if $item.add_image.has_item}>',
  '\t\t\t<{section name=a loop=$item.add_image.list}>',
  '\t\t\t<div><a href="<{$item.add_image.list[a].image_url}>" class="js-zoom" data-zoom><img src="<{$item.add_image.list[a].image_url}>" alt="" border="0"></a></div>',
  '\t\t\t<{/section}>',
  '\t\t\t<{/if}>'
].join("\n");
body = body.slice(0, addStart) + ADD_IMG + body.slice(addEnd);

/* --- 説明文 ---------------------------------------------------------------- */
body = body.replace("[DETAIL_EXT]", "");
body = body.replace("[DETAIL]<!-- 商品詳細説明 -->", "<{$item.description}>");
/* 🔴 description2 は description と完全一致するので出しません。 */
body = body.replace("[ITEMCAPTION_2]<!-- 追加画像説明文2 -->", "<{$item.description3}>");
body = body.replace("[ITEMCAPTION_3]<!-- 追加画像説明文3 -->", "<{$item.description4}>");

/* --- 価格・数量・特殊表示 -------------------------------------------------- */
body = body.replace("<span>[TAXPRICE]</span>円（税込）", "<span><{$item.price_html}></span>円（税込）");

const QTY = [
  '<{$item.special_display}> X',
  '\t\t\t\t\t<input type="number" inputmode="numeric" class="quantityInput"',
  '\t\t\t\t\t       id="<{$item.quantity_id}>" data-id="<{$item.quantity_id}>"',
  '\t\t\t\t\t       value="<{if $item.order_quantity_min}><{$item.order_quantity_min}><{else}>1<{/if}>"',
  '\t\t\t\t\t       <{if $item.order_quantity_min}>min="<{$item.order_quantity_min}>"<{/if}>',
  '\t\t\t\t\t       <{if $item.order_quantity_max}>max="<{$item.order_quantity_max}>"<{/if}>>',
  '\t\t\t\t\t<{* 🔴 元は [UPCOUNT] / [DOWNCOUNT] というURLの▲▼でした。',
  '\t\t\t\t\t     クリエイターに同じURLはありません。数値入力欄にすると',
  '\t\t\t\t\t     スマホでも数字キーが出て、押す回数も減ります。 *}>'
].join("\n");
body = body.replace(/\[ITEMCAPTION_1\] X \[QUANTITY\]<ul class="count">[\s\S]*?<\/ul>/, QTY);

/* --- セール ---------------------------------------------------------------- */
body = body.replace("[SALESTART]", "<{if $item.is_sale}>").replace("[SALEEND]", "<{/if}>");
body = body.replace("[DCDAY]", "");
body = body.replace("[ORGPRICE]", "<{$item.original_price_excluded_tax}>");
body = body.replace("[DCRATE]", "<{$item.sale_rate}>");

/* --- カート・お気に入り・問い合わせ ---------------------------------------- */
const CART_OLD = /\[IF\]<a href=\[GETBASKET\] class="detail-cart">カートに入れる<\/a>\[END\]\[ELSE\]<a href=\[GETBASKET\] class="detaol-soldout">品切れ\[ENDIF\]/;
const CART_NEW = '<{if $item.is_soldout}><span class="detaol-soldout">品切れ</span><{else}><a href="<{$item.cart_entry_url}>" class="detail-cart">カートに入れる</a><{/if}>';
body = body.replace(CART_OLD, CART_NEW);
body = body.replace("href=[WISHLIST]", 'href="<{$item.favorite_entry_url}>"');
body = body.replace("href=[QUESTION_MAIL]", 'href="<{$item.contact_url}>"');
body = body.replace(/<li><a href=\[MAIL\]>[\s\S]*?<\/li>/, "");

/* --- オプション・名入れ・在庫 ---------------------------------------------- */
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

/* --- 商品グループ ---------------------------------------------------------- */
body = body.replace("[BRANDGROUP]", '<{if $item.group.has_item}><h3><{$item.group.name}></h3><{$item.group}><{/if}>');

/* --- レビュー（u-komi） ---------------------------------------------------- */
body = body.replace(/\[REVIEW_BUTTON\]|\[REVIEW_WRITE\]/g, "");
body = body.replace("[REVIEW_VIEW_ALL]",
  '<div class="review-container" data-gname="<{$item.system_code}>" data-pid="<{$item.system_code}>" data-group="true" data-action="widget"></div>');
body = body.replace(/\[SYSTEM_CODE\]/g, "<{$item.system_code}>");

/* 残った制御タグ（コメントアウト部分の中身など）を掃除 */
body = body.replace(/\[(IF|END|ELSE|ENDIF|IF_PREV|ENDIF_PREV|IF_NEXT|ENDIF_NEXT|PREV|NEXT|RESERVE|IF_RECENT|ENDIF_RECENT|RECENT)\]/g, "");

/* 🔴 .tab-area が閉じられていません。ベーシックは自動挿入のテーブルで
     帳尻が合っていました。ここで閉じます。 */
body = body.trimEnd() + "\n</div><!-- /.tab-area -->";

const r = rewrite(body);
body = r.html;

const out = shell({ name: "商品詳細", from: "detailpage", slider: false, body: body.trim() });
fs.writeFileSync("templates/creator/mode/detail.tpl", out);

console.log("商品詳細: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{2,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));
