# The actual Creator Mode templates

Everything else under `templates/creator/` is a **mock**: real content in plain
HTML, built to agree a design and to prove the components work. These are the
templates themselves — what gets pasted into ショップデザイン in the admin.

## The syntax, confirmed rather than assumed

Creator Mode is **Smarty with `<{ }>` delimiters**, not the default `{ }`.

| | |
|---|---|
| output | `<{$item.name}>` |
| condition | `<{if $item.has_option}>…<{elseif …}>…<{else}>…<{/if}>` |
| loop | `<{section name=i loop=$category.item.list}>…<{/section}>` |
| inside a loop | `<{$category.item.list[i].name}>` |
| loop position | `<{$smarty.section.i.first}>` / `.last` / `.index` |

The `list[i]` notation in MakeShop's tag reference is not shorthand — it is
literally how the element is addressed, because `name=i` names the section.

Operators: `==` `!=` `||` `&&`. MakeShop disallows some Smarty operators and
does not support Smarty logic as a product, so the templates here stay to the
subset above.

Sources: the tag reference at `reference.makeshop.jp/taglist/creator-mode/`,
and MakeShop's own 「基本的な書き方と真偽値を覚えよう」.

## Files

| file | admin screen |
|---|---|
| `category.tpl` | 商品カテゴリーページ |
| `detail.tpl` | 商品詳細ページ |

## Before pasting anything

**Export the current version of the template first.** The console has no version
history; this repository is the only undo button. That rule has held all
project and it is not worth breaking for a quick test.

## What is deliberately not in these files

- **The old review tags.** MakeShop retires 商品レビュー at the end of November
  2026 and the client has moved to u-komi (C30). The u-komi mount is here, bound
  with `$item.system_code`.
- **`[SORTPRODUCT]` / 単価順.** It has no Creator Mode equivalent (C36 in the tag
  register). Its absence is a decision the client has not yet been asked to make,
  so nothing here pretends to replace it.
- **The listing-layout tags.** `[PRODUCTION_START]`, `[GROUP4_0]`, `[SUISEN4_2]`
  and the rest dissolve into `<{section}>` plus CSS.

## The 20 assumed tags

`sh tools/check-smarty.sh` reports every variable these templates use against
`inventory/creator-tags-known.tsv`, which records **where each one came from**:

```
confirmed against the reference : 41
assumed from a naming pattern   : 20
not in the ledger at all        :  0
```

**41 were read off MakeShop's tag reference. 20 were inferred**, mostly by
symmetry — `$item.cart_entry_url` because the listing has
`$category.item.list[i].cart_entry_url`, `$item.multi_image.has_item` because
`icon.has_item` exists, `$item.breadcrumb_list` because the category and search
pages have one.

Several are probably right. That is not the same as knowing. **A wrong tag in
Smarty renders as nothing at all** — no error, no gap in the layout, just a
missing price or a missing cart button on 9,514 pages — so the checker lists all
20 every time it runs rather than letting them settle into the background.

`$item.caption_1` was removed for exactly this reason. Basic Mode's
`[ITEMCAPTION_1]` clearly has a counterpart, the reference does not name it, and
a guessed tag in the one field that carries per-product CSS (C24) is worse than
an empty space with a note in it.

**Verify the 20 on the rehearsal site before cutover**, not on the live shop.
The checker's list is the checklist.
