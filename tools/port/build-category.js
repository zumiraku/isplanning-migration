/* ---------------------------------------------------------------------------
   build-category.js — 商品カテゴリーページを移植する

   🔴 実物で確かめたタグの対応

      元テンプレートには [ADDCODE] としか書かれていません。公開ページを見ると
      ここに出ていたのは **<p class="red">単価 462円（税別） 40個入</p>**
      でした。山口様の「商品特殊表示がない（＠100円（税別）100個入）」は
      これで、Creator では $…special_display です。

      [DETAIL] も「追加の説明」ではなく、**のし可能／包装可能の枠**
      （<div class="box21">）でした。description です。

   🔴 「カートに入れる」「お気に入り」は元からコメントアウトされています

      山口様の「不要」はご要望ではなく**元に戻せ**という意味でした。
      こちらが良かれと思って足したものです。コメントのまま持ってきます。

   🔴 画像は image_S

      実物: itemimages/0000000247463_….jpg（末尾3）。こちらは image_M
      （末尾2）を出していました。
--------------------------------------------------------------------------- */
const fs = require("fs");
const { shell } = require("./shell.js");
const { rewrite } = require("./url-map.js");

let body = fs.readFileSync("templates/basic-utf8/design_brandpage.html", "utf8");
body = body.replace(/^\s*<div class="M_mainContents"[^>]*>\s*/, "");
body = body.replace(/<!--\.mainContents--><\/div>\s*$/, "");

const IT = "$category.item.list[i]";

/* --- パンくず。[LIST] はプラットフォームが吐いていました ------------------- */
body = body.replace('<a href="/index.html">ホーム</a>&nbsp;&gt;[LIST]',
`<a href="<{$url.top}>">ホーム</a>&nbsp;&gt;
	<{section name=b loop=$category.breadcrumb_list.list}>
	  <{if $category.breadcrumb_list.list[b].is_current}><span><{$category.breadcrumb_list.list[b].name}></span>
	  <{else}><a href="<{$category.breadcrumb_list.list[b].url}>"><{$category.breadcrumb_list.list[b].name}></a>&nbsp;&gt;<{/if}>
	<{/section}>`);

/* --- カテゴリ名・サブカテゴリ・カテゴリ画像 -------------------------------- */
body = body.replace("[NAMECURRENT]", "<{$category.name}>");
body = body.replace("[GROUP4_0]",
`<{if $category.child_category.has_item}>
	<ul class="subcats">
	<{section name=c loop=$category.child_category.list}>
	  <li><a href="<{$category.child_category.list[c].url}>"><{$category.child_category.list[c].name}></a></li>
	<{/section}>
	</ul>
	<{/if}>`);
body = body.replace("[CATEGORY_IMAGE]", "<{if $category.image_url}><img src=\"<{$category.image_url}>\" alt=\"<{$category.name}>\"><{/if}>");

/* --- 件数と並び替え。単価順は 製造元順（C37） ------------------------------- */
body = body.replace("[TOTAL]", "<{$category.total_count}>");
body = body.replace("href=[NEWSORT]",       'href="<{$category.sort_new_url}>"')
           .replace("href=[SORTRECOMMEND]", 'href="<{$category.sort_recommend_url}>"')
           .replace("href=[SORTPRODUCT]",   'href="<{$category.sort_manufacturer_url}>"')
           .replace("href=[SORTPRICE]",     'href="<{$category.sort_low_price_url}>"')
           .replace("href=[SORTBRANDNAME]", 'href="<{$category.sort_name_url}>"');

/* --- 商品の繰り返し -------------------------------------------------------- */
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
							<{${IT}.description}>
							<p class="soldout2"><{if ${IT}.is_soldout}>＝ 品切れ中 ＝<{/if}></p>
							<p class="M_mgnT5"><{if ${IT}.icon.has_item}><{section name=ic loop=${IT}.icon.list}><img src="<{${IT}.icon.list[ic].image_url}>" align="absmiddle" border="0"><{/section}><{/if}></p>
							<p class="M_mgnT5">品番：<{${IT}.original_code}></p>
							<p class="item-name"><span>品名：</span><a href="<{${IT}.url}>"><{${IT}.name}></a></p>
							<p class="red"><{${IT}.special_display}></p>
							<p class="M_cl_price red">販売価格<span class="M_cl_taxPrice"><{${IT}.price}></span>円<span class="M_outtax">（税込）</span></p>
						</div>
						<{* 🔴 「カートに入れる」「お気に入り」は元テンプレートでも
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

/* --- ページャー ------------------------------------------------------------ */
body = body.replace("[PAGER]",
`<{if $category.pager.has_item}>
	  <{if not $category.pager.is_first}><a href="<{$category.pager.first_url}>">最初へ</a> <a href="<{$category.pager.prev_url}>" rel="prev">前へ</a><{/if}>
	  <{section name=p loop=$category.pager.list}>
	    <{if $category.pager.list[p].is_current_page}><span><{$category.pager.list[p].number}></span>
	    <{else}><a href="<{$category.pager.list[p].url}>"><{$category.pager.list[p].number}></a><{/if}>
	  <{/section}>
	  <{if not $category.pager.is_last}><a href="<{$category.pager.next_url}>" rel="next">次へ</a> <a href="<{$category.pager.last_url}>">最後へ</a><{/if}>
	<{/if}>`);

/* --- おすすめ商品 ---------------------------------------------------------- */
const RC = "$category.recommend_item.list[rc]";
body = body.replace("[SUISEN4_2]",
`<{if $category.recommend_item.has_item}>
	<table class="tbl02"><tr>
	<{section name=rc loop=$category.recommend_item.list}>
	  <{if $smarty.section.rc.index > 0 and $smarty.section.rc.index % 4 == 0}></tr><tr><{/if}>
	  <td class="categorylist">
	    <a href="<{${RC}.url}>"><img src="<{${RC}.image_S}>" alt="<{${RC}.name}>" border="0" class="M_cl_img"></a>
	    <p class="item-name"><a href="<{${RC}.url}>"><{${RC}.name}></a></p>
	    <{if ${RC}.special_display}><p class="red"><{${RC}.special_display}></p><{/if}>
	    <p class="M_cl_price red">販売価格<span class="M_cl_taxPrice"><{${RC}.price}></span>円<span class="M_outtax">（税込）</span></p>
	  </td>
	<{/section}>
	</tr></table>
	<{/if}>`);

const r = rewrite(body);
body = r.html;

const out = shell({ name: "商品カテゴリー", from: "brandpage", slider: false, body: body.trim() });
fs.writeFileSync("templates/creator/mode/category.tpl", out);

console.log("カテゴリ: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length + (r.missing.length ? " " + r.missing.join(" ") : ""));
const leftover = out.match(/\[[A-Z_0-9]{3,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));
