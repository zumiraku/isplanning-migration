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
  '<a href="<{$item.image_L}>" data-zoom><img src="<{$item.image_L}>" alt="<{$item.name}>" border="0" class="M_cl_img"></a>',
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

/* 追加画像3枚 → add_image のループ。元は1枚ずつ書かれています。 */
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

/* --- 説明文 ---------------------------------------------------------------- */
body = body.replace("[DETAIL_EXT]", "");
body = body.replace("[DETAIL]<!-- 商品詳細説明 -->", "<{$item.description}>");
/* 🔴 description2 は description と完全一致するので出しません。 */
/* 🔴 [ITEMCAPTION_2] / [ITEMCAPTION_3] は「追加商品画像の説明文」でした
 *
 *    元テンプレートのコメントのとおりです（追加画像説明文2／3）。
 *    クリエイターモードでは `$item.add_image.list[i].description` に
 *    当たりますが、**画像が登録されている商品でしか取り出せません。**
 *    この店舗は画像を入れずに説明文だけ使っています。
 *
 *      $item.add_image.has_item      なし
 *      $item.add_image.list          空
 *
 *    実データで確かめました（003001000005）。商品詳細のタグ123個を
 *    すべて出させて調べ、この2つの中身を返すものは**1つもありません**でした。
 *
 *      $item.description    707文字  品番・品名の説明文
 *      $item.description2     0文字
 *      $item.description3   706文字  ← description と同じ中身
 *      $item.description4     0文字
 *
 *    description3 を当てていたので、**同じ説明文が2回出ていました。**
 *    山口様のご指摘そのものです。
 *
 *    description2 / description4 に切り替えます。いまは空なので
 *    **何も出ません（重複は消えます）。** 商品CSVで
 *    「追加画像説明文2/3 → 商品説明2/4」を移していただければ、
 *    テンプレートを触らずにそのまま出るようになります。
 *
 *    ⚠️ 現行サイトでは、この2枠に販売単位の表と名入れ料金の表が出ています。
 *       保存した8商品すべてに中身がありました。**移行後は空になります。**
 *       docs/client-defects-2026-09-08.md に書いてあります。 */
body = body.replace("[ITEMCAPTION_2]<!-- 追加画像説明文2 -->", "<{$item.description2}>");
body = body.replace("[ITEMCAPTION_3]<!-- 追加画像説明文3 -->", "<{$item.description4}>");

/* --- 価格・数量・特殊表示 -------------------------------------------------- */
body = body.replace("<span>[TAXPRICE]</span>円（税込）", "<span><{$item.price_html}></span>円（税込）");

const QTY = [
  /* 🔴 「X」は特殊表示があるときだけ出します
   *
   *    元テンプレートは [ITEMCAPTION_1] X [QUANTITY] と決め打ちで、
   *    特殊表示が空の商品では「数量： X 1」と X だけが残ります。
   *    この店舗はほとんどの商品に「1200個」「100個入り」などが入って
   *    いるので滅多に出ませんが、出たときに意味不明です。
   *
   *    入っている商品では元と1文字も変わりません。 */
  '<{if $item.special_display}><{$item.special_display}> X<{/if}>',
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
/* 🔴 商品グループが丸ごと出ていませんでした（2026-09-10 実測）
 *
 *    `<{$item.group}>` と書いていました。これは配列なので、そのまま
 *    出そうとすると **画面に "Array" という文字だけ**が出ます。
 *    実際そうなっていて、「人気ボールペン、名入れ可能です」の枠に
 *    **商品50点が1件も出ていませんでした。**
 *
 *    見出しは出るので、検査も目視も通り抜けました。数えて初めて分かります
 *      現行  この枠に 税込50件・画像141件
 *      移植  この枠に 税込 0件・画像  0件
 *
 *    実データで確かめたら、中身はちゃんと来ていました（40件・名前・
 *    価格・URL・画像すべて）。回して出すだけです。
 *    現行は table#M_group に4列で並べています。同じ形にします。 */
const GROUP = [
  '<{if $item.group.has_item}>',
  '<h3><{$item.group.name}></h3>',
  '<table id="M_group"><tr>',
  '<{section name=g loop=$item.group.list}>',
  '<{if $smarty.section.g.index > 0 and $smarty.section.g.index % 4 == 0}></tr><tr><{/if}>',
  '<td class="itemBox">',
  '<table width="100%">',
  '<tr><td height="100" class="itemImg">',
  '<a href="<{$item.group.list[g].url}>"><img alt="<{$item.group.list[g].name}>" src="<{$item.group.list[g].image_S}>" border="0" width="220"></a>',
  '</td></tr>',
  '<tr><td>',
  '<p class="name"><a href="<{$item.group.list[g].url}>"><{$item.group.list[g].name}></a></p>',
  '<{if $item.group.list[g].special_display}><p class="spe"><{$item.group.list[g].special_display}></p><{/if}>',
  '<p class="price"><{$item.group.list[g].price}>円（税込）</p>',
  '</td></tr>',
  '</table>',
  '</td>',
  '<{/section}>',
  '</tr></table>',
  '<{/if}>'
].join("");
body = body.replace("[BRANDGROUP]", GROUP);

/* --- レビュー（u-komi） ---------------------------------------------------- */
body = body.replace(/\[REVIEW_BUTTON\]|\[REVIEW_WRITE\]/g, "");
/* 🔴 u-komi の枠は、元テンプレートに**すでにあります**（コメントの外）。
 *
 *      <!--<div class="Review"> … [REVIEW_VIEW_ALL] … </div>-->   ← 旧レビュー、無効
 *      <div class="review-container" data-gname="[SYSTEM_CODE]" …>  ← これが本体
 *
 *    最初は [REVIEW_VIEW_ALL] を u-komi の枠に置き換えていました。**その結果、
 *    コメントの中に2つ目の枠ができました。** コメントの中なので描画は
 *    されませんが、次に読む人が「なぜ2つ？」と迷います。[SYSTEM_CODE] は
 *    下の一括置換で本体のほうに入るので、ここは空にするのが正しいです。 */
body = body.replace("[REVIEW_VIEW_ALL]", "");
body = body.replace(/\[SYSTEM_CODE\]/g, "<{$item.system_code}>");

/* 残った制御タグ（コメントアウト部分の中身など）を掃除 */
body = body.replace(/\[(IF|END|ELSE|ENDIF|IF_PREV|ENDIF_PREV|IF_NEXT|ENDIF_NEXT|PREV|NEXT|RESERVE|IF_RECENT|ENDIF_RECENT|RECENT)\]/g, "");

/* 🔴 .tab-area が閉じられていません。ベーシックは自動挿入のテーブルで
     帳尻が合っていました。ここで閉じます。 */
body = body.trimEnd() + "\n</div><!-- /.tab-area -->";

/* 🔴 カテゴリ別の商品詳細テンプレートが3件ありました（C28・2026-09-10）
 *
 *    ベーシックには標準のほかに ct261 / ct646 / ct664 専用の商品詳細
 *    テンプレートがあります。移植では標準の1枚しか見ていませんでした。
 *    行単位で比べたところ、**実質の違いは文言だけ**でした。
 *
 *      ct261  見出しに「粗品におすすめタオル類」を足す
 *             セール名が「在庫一掃特別セール」（標準は「早割りセール」）
 *      ct646  タブの名前が3つとも違う
 *      ct664  文言の違いなし（構造だけ・標準で足ります）
 *
 *    クリエイターの商品詳細は1枚だけですが、`$item.base_category.code`
 *    が実データで効くことを確かめました（003001000005 → ct5）。
 *    カテゴリで切り替えて、3カテゴリぶんの文言を戻します。 */
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
  if (body.indexOf(from) < 0) { console.log('  🔴 タブが見つかりません: ' + btn); }
  body = body.split(from).join(to);
}

const r = rewrite(body);
body = r.html;

/* 🔴 id="O_itemDetail" も同じく落としていました。現行の骨格に戻します。 */
/* 🔴 og:image を戻します。現行はプラットフォームが商品画像を入れています */
const out = shell({ name: "商品詳細", from: "detailpage", slider: false, mainId: "O_itemDetail",
                    ogImage: "<{$item.image_L}>", ogType: "product", body: body.trim() });
fs.writeFileSync("templates/creator/mode/detail.tpl", out);

console.log("商品詳細: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{2,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));
