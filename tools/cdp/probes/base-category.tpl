<{* base_category が実データで値を返すかを見ます。
     probe.js は ZQ<名前>START … ZQ<名前>END で囲んだところを拾います。 *}>
ZQcodeSTART<{$item.base_category.code}>ZQcodeEND
ZQnameSTART<{$item.base_category.name}>ZQnameEND
ZQurlSTART<{$item.base_category.url}>ZQurlEND
ZQsysSTART<{$item.system_code}>ZQsysEND
ZQmatchSTART<{if $item.base_category.code == 'ct261'}>ct261と一致<{else}>ct261とは違う<{/if}>ZQmatchEND
ZQbreadSTART<{if $item.breadcrumb_list_group.has_item}>パンくずあり<{else}>パンくず無し<{/if}>ZQbreadEND
