ZQenabledSTART<{if $item.review.is_enabled}>有効<{else}>無効<{/if}>ZQenabledEND
ZQhasSTART<{if $item.review.has_item}>あり<{else}>無し<{/if}>ZQhasEND
ZQtotalSTART<{$item.review.total_count}>ZQtotalEND
ZQavgSTART<{$item.review.average}>ZQavgEND
ZQstarSTART<{$item.review.star_html}>ZQstarEND
ZQlistUrlSTART<{$item.review.list_url}>ZQlistUrlEND
ZQpostUrlSTART<{$item.review.post_url}>ZQpostUrlEND
ZQfirstSTART<{section name=r loop=$item.review.list}><{if $smarty.section.r.index < 2}>[<{$item.review.list[r].reviewer_name}>|<{$item.review.list[r].score}>|<{$item.review.list[r].date.year}>/<{$item.review.list[r].date.month}>/<{$item.review.list[r].date.day}>|<{$item.review.list[r].content}>]<{/if}><{/section}>ZQfirstEND
ZQcatSTART<{$item.base_category.code}>|<{$item.base_category.name}>ZQcatEND
