/* items.js — 商品一覧のマークアップ */

function grid(listVar, name, max) {
  const it = listVar + ".list[" + name + "]";
  const cap = max ? " max=" + max : "";
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<{section name=${name} loop=${listVar}.list${cap}}>
  <{if $smarty.section.${name}.index > 0 and $smarty.section.${name}.index % 4 == 0}></tr><tr><{/if}>
  <td align="center" class="lims" width="25%" valign="top">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" height="80">
      <tr><td align="center" class="M_displayImg">
        <a href="<{$${it}.url}>"><img src="<{${it}.image_S}>" border="0" alt="<{${it}.name}>" width="220" height="220"></a>
      </td></tr>
      <tr class="woong"><td valign="top" align="center">
        <a href="<{$${it}.url}>"><{$${it}.name}></a>
        <{if $${it}.icon.has_item}>
          <{section name=${name}i loop=$${it}.icon.list}><img src="<{$${it}.icon.list[${name}i].image_url}>" align="absmiddle" border="0"><{/section}>
        <{/if}>
      </td></tr>
      <tr class="woong"><td valign="top" align="center"><{$${it}.price|number_format}>円（税込）</td></tr>
      <{* ※ 4行目が丸ごと抜けていました（実測・2026-09-10）

           現行のタイルは4行です。最後の行は**その商品の基本カテゴリーへの
           リンク**で、角かっこ付きの太字です。

             <tr height="20" class="woong"><td valign="top" align="center">
               <a href="/shopbrand/003/002/X/"><b>[50円～99円]</b></a>
             </td></tr>

           現行と移植版の文言を突き合わせて出ました。
           [50円～99円] [100円～199円] [200円～299円] [300円～399円]
           [1000円～1499円] の5種類が、移植版に1つもありませんでした。
           トップの新着16件と定番12件、全部のタイルに付いています。 *}>
      <tr height="20" class="woong"><td valign="top" align="center">
        <a href="<{$${it}.base_category.url}>"><b>[<{$${it}.base_category.name}>]</b></a>
      </td></tr>
    </table>
  </td>
<{/section}>
</tr></table>`;
}

function ranking() {
  const it = "$ranking_item.list[r]";
  return `<{section name=r loop=$ranking_item.list max=5}>
        <li class="rankList" id="rank<{$smarty.section.r.index_next}>">
            <em><{$smarty.section.r.index_next}></em>
            <div class="rankImg"><a href="<{${it}.url}>"><img src="<{${it}.image_M}>" alt="<{${it}.name}>" width="100" border="0"></a></div>
            <div class="rankDetail">
            	<p class="rankName"><a href="<{${it}.url}>"><{${it}.name}></a></p>
            	<p class="rankPrice"><{${it}.price|number_format}>円（税込）</p>
            </div>
        </li>
<{/section}>`;
}

function news() {
  const it = "$latest_news.list[nw]";
  return `<{section name=nw loop=$latest_news.list}>
<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td width="80" class="woong" height="22" valign="top">[<{${it}.date.year}>/<{${it}.date.month}>/<{${it}.date.day}>]</td>
  <td class="woong" valign="top"><a href="<{${it}.url}>"><{${it}.title}></a></td>
</tr></table>
<{/section}>
<{* ※ お知らせの枠の「底」を落としていました（2026-09-10 実測）

     現行はお知らせの一覧のあとに、角丸の下辺が入ります。

       <td class="line" width="5" height="5"><img src="/images/left_edge.gif"></td>
       <td class="line" height="5">&nbsp;</td>
       <td class="line" width="5" height="5"><img src="/images/right_edge.gif"></td>

     画像名の突き合わせで left_edge.gif と right_edge.gif が
     **1枚 → 0枚** と出ました。枠の下だけが開いて見えます。 *}>
<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td class="line" width="5" height="5"><img src="/images/left_edge.gif"></td>
  <td class="line" height="5">&nbsp;</td>
  <td class="line" width="5" height="5"><img src="/images/right_edge.gif"></td>
</tr></table>
<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td class="line" height="7" bgcolor="#ffffff">&nbsp;</td>
</tr></table>`;
}

module.exports = { grid, ranking, news };

