/* ---------------------------------------------------------------------------
   build-search.js — 商品検索結果ページを移植する

   🔴 キーワード欄をここにも置きます

      以前は「ヘッダーの検索窓と同じIDが2つ出るから」と外していました。
      **外す必要はありませんでした。** system.js はこう書いています。

        count === $('[data-id="' + keywordId + '"]').length ? index : 0

      トリガー（[href="#makeshop-common-search-url"]）の数と欄の数が一致
      すれば、**N番目のトリガーはN番目の欄を読みます。** ヘッダー1本＋この
      フォーム1本で2対2なので、それぞれ自分の欄を読みます。元の7項目
      フォームがそのまま戻せます。

      ただし HTML の id は重複させられないので、こちらは data-id だけに
      します。プラットフォームが見ているのは data-id です。

   🔴 商品単価だけは戻せません

      [PRODUCT]（商品単価）に対応する data-id-* がありません。公開されて
      いるのは keyword / name / price-low / price-high / category /
      original-code の6つだけです。**並び替えの単価順はあるので、そちらで
      代用**していただく形になります。山口様にお伝えする事項です。

   🔴 <form> にしません（C44）
--------------------------------------------------------------------------- */
const fs = require("fs");
const { shell } = require("./shell.js");
const { rewrite } = require("./url-map.js");

let body = fs.readFileSync("templates/basic-utf8/design_searchpage.html", "utf8");
body = body.replace(/^\s*<div class="M_mainContents">\s*/, "");
body = body.replace(/<\/div><!--\.M_mainContents-->\s*$/, "");

const IT = "$search.item.list[i]";

/* --- 検索語の表示 ---------------------------------------------------------- */
body = body.replace("[SEARCHNAME]", "<{$search.keyword}>");

/* --- 絞り込みフォーム ------------------------------------------------------ */
body = body.replace("[CATEGORY][SUB_CATEGORY]",
`<select data-id="<{$search_form.category_id}>" aria-label="カテゴリー">
			  <{section name=c loop=$search_form.category_list}>
			    <option value="<{$search_form.category_list[c].code}>"<{if $search.category.code == $search_form.category_list[c].code}> selected<{/if}>><{$search_form.category_list[c].name}></option>
			  <{/section}>
			</select>`);
body = body.replace("[BRANDNAME] ", `<input type="text" data-id="<{$search_form.name_id}>" value="<{$search.name}>" aria-label="商品名">`);
body = body.replace("[MINPRICE]", `<input type="number" inputmode="numeric" data-id="<{$search_form.price_low_id}>" value="<{$search.price_low}>" aria-label="価格の下限">`);
body = body.replace("[MAXPRICE]", `<input type="number" inputmode="numeric" data-id="<{$search_form.price_high_id}>" value="<{$search.price_high}>" aria-label="価格の上限">`);
body = body.replace("[CONTENT]", `<input type="text" data-id="<{$search_form.keyword_id}>" value="<{$search.keyword}>" aria-label="キーワード">`);
body = body.replace("[ORIGINALCODE]", `<input type="text" data-id="<{$search_form.original_code_id}>" value="<{$search.original_code}>" aria-label="商品コード">`);
/* 商品単価は受け口がありません。欄を出すと「入れても効かない」ことになるので、
   その旨を書いておきます。空欄より不親切ではありません。 */
body = body.replace("[PRODUCT]", `<span class="minikome">単価での絞り込みは、並び替えの「単価順」をお使いください</span>`);

body = body.replace("<a href=[OK]>検索</a>", `<a href="<{$search_form.search_url}>" role="button">検索</a>`);

/* --- 件数と並び替え -------------------------------------------------------- */
body = body.replace("[TOTAL]", "<{$search.total_count}>");
body = body.replace("href=[NEWSORT]",       'href="<{$search.sort_new_url}>"')
           .replace("href=[SORTRECOMMEND]", 'href="<{$search.sort_recommend_url}>"')
           .replace("href=[SORTPRODUCT]",   'href="<{$search.sort_manufacturer_url}>"')
           .replace("href=[SORTPRICE]",     'href="<{$search.sort_low_price_url}>"')
           .replace("href=[SORTBRANDNAME]", 'href="<{$search.sort_name_url}>"');

/* --- 結果の繰り返し -------------------------------------------------------- */
const s = body.indexOf("[SEARCH_RESULT]");
const e = body.indexOf("[/SEARCH_RESULT]") + "[/SEARCH_RESULT]".length;
if (s < 0 || e < 0) { console.error("結果ループの範囲が取れません"); process.exit(1); }
const items = `<{section name=i loop=$search.item.list}>
			<li>
				<div class="M_innerBox">
					<div class="M_cl_imgWrap">
					<a href="<{${IT}.url}>"><img src="<{${IT}.image_S}>" alt="<{${IT}.name}>" border="0"></a>
					</div>
					<p class="soldout"><{if ${IT}.is_soldout}>＝ 品切れ中 ＝<{/if}></p>
					<div class="M_cl_detail">品番：<{${IT}.original_code}>
						<p class="M_cl_name"><a href="<{${IT}.url}>"><{${IT}.name}></a></p>
						<p><span class="M_cl_taxadd"><{${IT}.special_display}></span></p>
						<p class="M_cl_price"><span class="M_cl_taxPrice"><{${IT}.price}>円（税込）</span></p>
						<{* 🔴 カートボタンは元テンプレートでもコメントアウトされています。 *}>
					</div>
					<br class="clear">
				</div>
			</li>
<{/section}>`;
body = body.slice(0, s) + items + body.slice(e);

/* --- ページャー ------------------------------------------------------------ */
body = body.replace("[PAGER]",
`<div id="pager">
	<{if $search.pager.has_item}>
	  <{if not $search.pager.is_first}><a href="<{$search.pager.first_url}>">最初へ</a> <a href="<{$search.pager.prev_url}>" rel="prev">前へ</a><{/if}>
	  <{section name=p loop=$search.pager.list}>
	    <{if $search.pager.list[p].is_current_page}><span><{$search.pager.list[p].number}></span>
	    <{else}><a href="<{$search.pager.list[p].url}>"><{$search.pager.list[p].number}></a><{/if}>
	  <{/section}>
	  <{if not $search.pager.is_last}><a href="<{$search.pager.next_url}>" rel="next">次へ</a> <a href="<{$search.pager.last_url}>">最後へ</a><{/if}>
	<{/if}>
	</div>`);

const r = rewrite(body);
body = r.html;

const out = shell({ name: "商品検索結果", from: "searchpage", slider: false, body: body.trim() });
fs.writeFileSync("templates/creator/mode/search.tpl", out);

console.log("検索: " + out.split("\n").length + " 行");
console.log("  URL書換 " + r.rewritten + " 本 / 未対応 " + r.missing.length);
const leftover = out.match(/\[[A-Z_0-9\/]{2,}\]/g);
console.log("  未変換のベーシックタグ: " + (leftover ? [...new Set(leftover)].join(" ") : "なし"));
