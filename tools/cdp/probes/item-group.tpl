<{* $item.group の中身を実データで見ます。
     いまは <{$item.group}> と書いていて "Array" が出ています。
     商品50点が丸ごと出ていません。 *}>
ZQhasSTART<{if $item.group.has_item}>あり<{else}>無し<{/if}>ZQhasEND
ZQnameSTART<{$item.group.name}>ZQnameEND
ZQcountSTART<{$item.group.list|@count}>ZQcountEND
ZQfirstSTART<{section name=g loop=$item.group.list}><{if $smarty.section.g.index < 2}>[<{$item.group.list[g].name}>|<{$item.group.list[g].price}>|<{$item.group.list[g].url}>|<{$item.group.list[g].image_S}>]<{/if}><{/section}>ZQfirstEND
