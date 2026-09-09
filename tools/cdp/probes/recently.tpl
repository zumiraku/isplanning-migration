<div class="ZQ">
ZQrecent_hasSTART<{if $recently_item.has_item}>あり<{else}>なし<{/if}>ZQrecent_hasEND
<{section name=z loop=$recently_item.list}>
ZQrecent<{$smarty.section.z.index}>_nameSTART<{$recently_item.list[z].name}>ZQrecent<{$smarty.section.z.index}>_nameEND
ZQrecent<{$smarty.section.z.index}>_urlSTART<{$recently_item.list[z].url}>ZQrecent<{$smarty.section.z.index}>_urlEND
<{/section}>
ZQcheckedSTART<{$module.checked}>ZQcheckedEND
</div>
