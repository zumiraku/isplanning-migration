/* _tiles.js — 「商品グループ」「最近チェックした商品」の並び */

const LINE = '<td class="line"><img height="100" width="4" border="0" ' +
  'src="https://shop1-makeshop.akamaized.net/images/01/mk_main_p_line.gif"></td>';

function tiles(opts) {
  const L = opts.list;
  const n = opts.name;
  const it = L + "[" + n + "]";
  const per = opts.perRow || 0;
  const wrap = per
    ? "<{if $smarty.section." + n + ".index == 0}><{elseif $smarty.section." + n +
      ".index % " + per + " == 0}></tr><tr><{else}>" + LINE + "<{/if}>"
    : "<{if $smarty.section." + n + ".index > 0}>" + LINE + "<{/if}>";

  return [
    '<table id="' + opts.tableId + '"><tr>',
    "<{section name=" + n + " loop=" + L + "}>",
    wrap,
    '<td class="itemBox">',
    '<table width="100%">',
    '<tr><td height="100" class="itemImg">',
    '<a href="<{' + it + '.url}>"><img alt="<{' + it + '.name}>" src="<{' + it + '.image_S}>" border="0" width="220"></a>',
    "</td></tr>",
    "<tr><td>",
    '<p class="name"><a href="<{' + it + '.url}>"><{' + it + ".name}></a>",
    opts.icons
      ? "<{if " + it + ".icon.has_item}><{section name=" + n + "i loop=" + it + ".icon.list}> " +
        '<img src="<{' + it + ".icon.list[" + n + 'i].image_url}>" align="absmiddle" border="0"><{/section}><{/if}>'
      : "",
    "</p>",
    opts.spe ? "<{if " + it + '.special_display}><p class="spe"><{' + it + ".special_display}></p><{/if}>" : "",
    '<p class="price"><{' + it + ".price|number_format}>円（税込）</p>",
    "</td></tr>",
    "</table>",
    "</td>",
    "<{/section}>",
    "</tr></table>"
  ].filter(Boolean).join("");
}

module.exports = { tiles, LINE };

