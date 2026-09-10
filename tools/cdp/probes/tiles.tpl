<{* グループのアイコンと、最近チェックした商品の image_S があるか *}>
ZQgIconSTART<{section name=g loop=$item.group.list}><{if $smarty.section.g.index < 3}>[<{if $item.group.list[g].icon.has_item}>有<{else}>無<{/if}>|<{section name=gi loop=$item.group.list[g].icon.list}><{$item.group.list[g].icon.list[gi].image_url}> <{/section}>]<{/if}><{/section}>ZQgIconEND
ZQgImgSSTART<{section name=g2 loop=$item.group.list}><{if $smarty.section.g2.index < 1}><{$item.group.list[g2].image_S}><{/if}><{/section}>ZQgImgSEND
ZQrecSSTART<{section name=r loop=$recently_item.list}><{if $smarty.section.r.index < 1}><{$recently_item.list[r].image_S}><{/if}><{/section}>ZQrecSEND
ZQrecMSTART<{section name=r2 loop=$recently_item.list}><{if $smarty.section.r2.index < 1}><{$recently_item.list[r2].image_M}><{/if}><{/section}>ZQrecMEND
ZQrecIconSTART<{section name=r3 loop=$recently_item.list}><{if $smarty.section.r3.index < 2}>[<{if $recently_item.list[r3].icon.has_item}>有<{else}>無<{/if}>]<{/if}><{/section}>ZQrecIconEND
