ZQcodeSTART<{$item.base_category.code}>ZQcodeEND
ZQnameSTART<{$item.base_category.name}>ZQnameEND
ZQurlSTART<{$item.base_category.url}>ZQurlEND
ZQsysSTART<{$item.system_code}>ZQsysEND
ZQmatchSTART<{if $item.base_category.code == 'ct261'}>ct261と一致<{else}>ct261とは違う<{/if}>ZQmatchEND
ZQbreadSTART<{if $item.breadcrumb_list_group.has_item}>パンくずあり<{else}>パンくず無し<{/if}>ZQbreadEND
