/* ---------------------------------------------------------------------------
   _tiles.js — 「商品グループ」「最近チェックした商品」の並び

   ※ 3か所とも、現行と別のマークアップで出していました（2026-09-10 実測）

      公開ページのこの2つは、**同じ形**です。

        <table id="M_group">  /  <table id="recent">
         <tr>
          <td class="itemBox">
            <table width="100%">
              <tr><td height="100" class="itemImg">
                <a href="…"><img alt="名前" src="…3_….jpg" border="0" width="220"></a>
              </td></tr>
              <tr><td>
                <p class="name"><a href="…">名前</a> <img …iconAN.gif …></p>
                <p class="spe">単価 228円（税別） 200個入</p>
                <p class="price">50,160円（税込）</p>
              </td></tr>
            </table>
          </td>
          <td class="line"><img height="100" width="4" border="0" src="…mk_main_p_line.gif"></td>
          <td class="itemBox"> …

      こちらが落としていたもの:

        ・商品と商品のあいだの区切り（mk_main_p_line.gif）。
          画像名の突き合わせで **3枚 → 0枚** と出ました
        ・名前のうしろのアイコン（iconAC / iconAN など）。
          商品詳細で **iconAC 17枚 → 0枚、iconAL 6枚 → 0枚**
        ・画像の大きさ。現行は image_S（末尾3）です。こちらは image_M
          （末尾2）でした。山口様の「商品画像がすべてLサイズ」はこれです

      image_S も icon も、実データで出ることを確かめてあります
      （tools/cdp/probes/tiles.tpl）。
--------------------------------------------------------------------------- */

const LINE = '<td class="line"><img height="100" width="4" border="0" ' +
  'src="https://shop1-makeshop.akamaized.net/images/01/mk_main_p_line.gif"></td>';

/* opts:
     list     並べる配列（例 "$item.group.list"）
     name     section の名前（例 "g"）
     tableId  表のid（"M_group" / "recent"）
     spe      特殊表示（単価○円 ○個入）を出すか
     perRow   1行に何個で折り返すか（0なら折り返さない） */
function tiles(opts) {
  const L = opts.list;
  const n = opts.name;
  const it = L + "[" + n + "]";
  const per = opts.perRow || 0;
  /* ※ 1件目の前にも区切りが入っていました
   *    `<{if index > 0 and index % 4 == 0}>行を変える<{else}>区切り<{/if}>`
   *    と書いたので、index 0 は「偽 → else → 区切り」になります。
   *    区切りが3本のところ4本出ていました（画像名の突き合わせで判明）。
   *    1件目だけを先に外します。 */
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
    /* ※ アイコンが付くのは商品グループだけです（実測・2026-09-10）
     *    最近チェックした商品には、現行でも付いていません。両方に付けたら
     *    トップで iconAC が 6枚 → 7枚 に増えました。 */
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
