<{* 商品グループが現行50点・移植版40点です。上限を動かせるタグがないか。 *}>
ZQcountSTART<{$item.group.list|@count}>ZQcountEND
ZQtotalSTART<{$item.group.total_count}>ZQtotalEND
ZQdispSTART<{$item.group.display_count}>ZQdispEND
ZQurlSTART<{$item.group.url}>ZQurlEND
ZQmoreSTART<{if $item.group.has_next}>あり<{else}>無し<{/if}>ZQmoreEND
ZQpagerSTART<{$item.group.pager.list|@count}>ZQpagerEND
ZQcodeSTART<{$item.group.code}>ZQcodeEND
