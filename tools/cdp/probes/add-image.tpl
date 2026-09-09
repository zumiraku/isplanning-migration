<div class="ZQ">
ZQhas_itemSTART<{if $item.add_image.has_item}>あり<{else}>なし<{/if}>ZQhas_itemEND
<{section name=z loop=$item.add_image.list}>
ZQadd<{$smarty.section.z.index}>_descSTART<{$item.add_image.list[z].description}>ZQadd<{$smarty.section.z.index}>_descEND
ZQadd<{$smarty.section.z.index}>_urlSTART<{$item.add_image.list[z].image_url}>ZQadd<{$smarty.section.z.index}>_urlEND
<{/section}>
ZQmultiSTART<{if $item.multi_image.has_item}>あり<{else}>なし<{/if}>ZQmultiEND
ZQnameprintSTART<{$item.name_print.description}>ZQnameprintEND
</div>
