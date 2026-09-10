/* build-category.js — 商品カテゴリーページを移植する */
const fs = require("fs");
const { shell } = require("./shell.js");
const { rewrite } = require("./url-map.js");

let body = fs.readFileSync("templates/basic-utf8/design_brandpage.html", "utf8");
body = body.replace(/^\s*<div class="M_mainContents"[^>]*>\s*/, "");
body = body.replace(/<!--\.mainContents--><\/div>\s*$/, "");

const IT = "$category.item.list[i]";

body = body.replace('<a href="/index.html">ホーム</a>&nbsp;&gt;[LIST]',
`<a href="<{$url.top}>">ホーム</a>&nbsp;&gt;
	<{section name=b loop=$category.breadcrumb_list.list}>
	  <{if $category.breadcrumb_list.list[b].is_current}><span><{$category.breadcrumb_list.list[b].name}></span>
	  <{else}><a href="<{$category.breadcrumb_list.list[b].url}>"><{$category.breadcrumb_list.list[b].name}></a>&nbsp;&gt;<{/if}>
	<{/section}>`);

body = body.replace("[NAMECURRENT]", "<{$module.category_title1}>");
body = body.replace("[GROUP4_0]",
`<{if $category.child_category.has_item}>
	<ul class="subcats">
	<{section name=c loop=$category.child_category.list}>
	  <{* ※ 件数を落としていました。現行は「熱中症対策(387)」のように出ます。
	       $category.child_category.list[c].item_count というタグがあるのに、
	       名前だけを出していました。 *}>
	  <li><a href="<{$category.child_category.list[c].url}>"><{$category.child_category.list[c].name}>(<{$category.child_category.list[c].item_count}>)</a></li>
	<{/section}>
	</ul>
	<{/if}>`);
body = body.replace('\t<div id="O_categotyBnr">[CATEGORY_IMAGE]</div>\n', "");

body = body.replace(/<!-- 管理画面「カテゴリー別イメージの登録」画像 -->[\s\S]*?<\/div>\n/, "");

body = body.replace('<div class="O_ItemLine">',
  "<{$module.category_extra1}><{$module.category_extra2}><{$module.category_extra3}>\n\n\t<div class=\"O_ItemLine\">");

body = body.replace("[TOTAL]", "<{$category.total_count}>");
body = body.replace("href=[NEWSORT]",       'href="<{$category.sort_new_url}>"')
           .replace("href=[SORTRECOMMEND]", 'href="<{$category.sort_recommend_url}>"')
           .replace("href=[SORTPRODUCT]",   'href="<{$category.sort_manufacturer_url}>"')
           .replace("href=[SORTPRICE]",     'href="<{$category.sort_low_price_url}>"')
           .replace("href=[SORTBRANDNAME]", 'href="<{$category.sort_name_url}>"');

const s = body.indexOf("[PRODUCTION_START]");
const e = body.indexOf("[PRODUCTION_END]") + "[PRODUCTION_END]".length;
if (s < 0 || e < 0) { console.error("商品ループの範囲が取れません"); process.exit(1); }

const rows = `<{section name=i loop=$category.item.list}>
	<{if $smarty.section.i.index % 4 == 0}><tr><{/if}>
		<td class="categorylist">
			<table>
				<tr>
					<td class="itemimg">
						<a href="<{${IT}.url}>"><img border="0" align="middle" alt="<{${IT}.name}>"
						src="<{${IT}.image_S}>" class="M_cl_img"></a>
					</td>
					<td class="itemtext">
						<div style="padding-left:10px;">
							<{* ※ ここは description ではありません（実測・2026-09-10）
							     一覧の ［DETAIL］ は「商品カテゴリー用商品説明文」です（角かっこは全角にしてあります。半角だと未変換タグの検査が拾います）。
							     商品CSVに専用の列（商品カテゴリー用商品説明文／
							     同 表示可否）があります。description を出していたので、
							     **1件ごとに商品仕様の全文**が並んでいました。

							     現行    名入れ可能 品番：ND-P3841 品名：…
							     移植版  ■品番 ND-P3841 ■品名 … ■形態 OPP袋入
							             ■形態サイズ ■商品サイズ 直径10×140mm
							             ■色 ■材質 … ■内容 1個 ■通常単価 …

							     40件ぶん並ぶので、カテゴリページが別物になります。
							     606カテゴリ全部です。 *}>
							<{${IT}.category_description}>
							<p class="soldout2"><{if ${IT}.is_soldout}>＝ 品切れ中 ＝<{/if}></p>
							<p class="M_mgnT5"><{if ${IT}.icon.has_item}><{section name=ic loop=${IT}.icon.list}><img src="<{${IT}.icon.list[ic].image_url}>" align="absmiddle" border="0"><{/section}><{/if}></p>
							<p class="M_mgnT5">品番：<{${IT}.original_code}></p>
							<p class="item-name"><span>品名：</span><a href="<{${IT}.url}>"><{${IT}.name}></a></p>
							<p class="red"><{${IT}.special_display}></p>
							<p class="M_cl_price red">販売価格<span class="M_cl_taxPrice"><{${IT}.price|number_format}></span>円<span class="M_outtax">（税込）</span></p>
						</div>
						<{* ※ 「カートに入れる」「お気に入り」は元テンプレートでも
						     コメントアウトされています。山口様の「不要」は、
						     こちらが足したものを外せという意味でした。 *}>
					</td>
				</tr>
			</table>
		</td>
	<{if $smarty.section.i.index % 4 == 3}></tr><{/if}>
<{/section}>
	<{if $category.total_count % 4 != 0}></tr><{/if}>`;
body = body.slice(0, s) + rows + body.slice(e);

body = body.replace("[PAGER]",
`<{if $category.pager.has_item}>
	  <{if not $category.pager.is_first}><a href="<{$category.pager.first_url}>">最初へ</a> <a href="<{$category.pager.prev_url}>" rel="prev">前へ</a><{/if}>
	  <{section name=p loop=$category.pager.list}>
	    <{if $category.pager.list[p].is_current_page}><span><{$category.pager.list[p].number}></span>
	    <{else}><a href="<{$category.pager.list[p].url}>"><{$category.pager.list[p].number}></a><{/if}>
	  <{/section}>
	  <{* ※ 文言を現行に合わせます。現行は「次の40件 »」「« 前の40件」です。
	       「次へ」だと、何件ずつ進むのかが読めません。 *}>
	  <{if not $category.pager.is_last}><a href="<{$category.pager.next_url}>" rel="next">次の<{$category.display_count}>件 &raquo;</a> <a href="<{$category.pager.last_url}>">最後へ</a><{/if}>
	<{/if}>`);
body = body.replace("<a href=\"<{$category.pager.prev_url}>\" rel=\"prev\">前へ</a>",
  "<a href=\"<{$category.pager.prev_url}>\" rel=\"prev\">&laquo; 前の<{$category.display_count}>件</a>");

const H2_BOTTOM = '<h2 class="categorybottom">';
const H3_RECOMMEND = "<h3>こちらの商品もおすすめです。</h3>";
const dbs = body.indexOf(H2_BOTTOM);
const dbe = body.indexOf(H3_RECOMMEND);
if (dbs < 0 || dbe < 0 || dbs > dbe) {
  console.log("  ※ 既定の下部ブロックが見つかりません（そのままにします）");
} else {
  body = body.slice(0, dbs) + "<{$module.category_bottom1}>" +
    String.fromCharCode(10) + String.fromCharCode(10) + body.slice(dbe);
}

const RC = "$category.recommend_item.list[rc]";
body = body.replace("[SUISEN4_2]",
`<{if $category.recommend_item.has_item}>
	<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr>
	<{section name=rc loop=$category.recommend_item.list}>
	  <{if $smarty.section.rc.index == 0}><{elseif $smarty.section.rc.index % 5 == 0}></tr><tr><{else}><td class="line" width="4" align="center"><img src="/images/common/sero.gif"></td><{/if}>
	  <td align="center">
	    <table border="0" cellpadding="0" cellspacing="0" width="130">
	      <tr><td align="center" height="100">
	        <a href="<{${RC}.url}>"><img src="<{${RC}.image_S}>" border="0" width="100" align="center" alt="<{${RC}.name}>"></a><img src="https://shop1-makeshop.akamaized.net/images/white.gif" width="5" height="10">
	      </td></tr>
	      <tr><td class="line" height="3">&nbsp;</td></tr>
	      <tr><td align="center" height="30" valign="top">
	        <a href="<{${RC}.url}>"><{${RC}.name}></a>
	        <{if ${RC}.icon.has_item}><{section name=ri loop=${RC}.icon.list}> <img src="<{${RC}.icon.list[ri].image_url}>" align="absmiddle" border="0"><{/section}><{/if}>
	      </td></tr>
	      <tr><td align="center"><font color="#F89B22"><b><{${RC}.price|number_format}>円（税込）</b></font></td></tr>
	    </table>
	  </td>
	<{/section}>
	</tr></table>
	<{/if}>`);

const r = rewrite(body);
body = r.html;

const out = shell({ name: "商品カテゴリー", from: "brandpage", slider: false, mainId: "M_category", body: body.trim() });
fs.writeFileSync("templates/creator/mode/category.tpl", out);

console.log("カテゴリ: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{3,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));

