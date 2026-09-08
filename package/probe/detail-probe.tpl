<{* ==========================================================================
     タグ調査ページ（商品詳細）— 1回のプレビューで決着させるためのもの

     🔴 これは公開用ではありません。デザインセット「発見マーケット_移行版」の
        商品詳細に貼って、プレビューを1回押すためだけの使い捨てです。
        ショップには影響しません（ショップに適用を押さない限り反映されない、
        とプラットフォームが明記しています）。

     目的は3つ。

       A. $item に実際どんなキーがあるのかを、全部出させる
       B. 「＠100円（税別）100個入」に当たるタグ名を突き止める
       C. $recently_item（最近見た商品）が実在するか

     A が効けば B は不要になります。効かない環境の場合に備えて両方入れて
     います。**空欄と「ページが描画されていない」を区別できるように**、
     先頭に確実に出るタグを置いています。ここが空なら調査自体が失敗です。
   ========================================================================== *}>
<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>タグ調査</title>
<style>
  body { font-family: "Noto Sans JP", system-ui, sans-serif; margin: 16px; font-size: 15px; line-height: 1.7; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 22px 0 6px; padding: 4px 8px; background: #222; color: #fff; }
  .ok { padding: 8px 10px; background: #dff5e1; border: 2px solid #2a7; margin-bottom: 8px; }
  .keys { border: 2px solid #333; padding: 8px; background: #fafafa; }
  .keys span { display: inline-block; border: 1px solid #999; background: #fff; padding: 1px 6px; margin: 2px; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #666; padding: 4px 8px; vertical-align: top; }
  th { background: #eee; text-align: left; width: 16em; white-space: nowrap; }
  td.v { background: #fffbe6; min-height: 1.6em; }
  td.v:empty::after { content: "（空）"; color: #c00; }
</style>
<{$makeshop.head}>
</head>
<body>
<{$makeshop.body_top}>

<h1>タグ調査ページ</h1>

<div class="ok">
  ここが埋まっていれば、ページは正しく描画されています。<br>
  商品名：<b><{$item.name}></b>　／　品番：<b><{$item.original_code}></b>
</div>

<h2>A. $item のキー一覧</h2>
<div class="keys">
<{foreach from=$item key=probe_key item=probe_val}><span><{$probe_key}></span><{/foreach}>
</div>
<p>↑ ここが空なら foreach が使えない環境です。その場合は B を見てください。</p>

<h2>B. 「＠単価」候補（数量欄に出ていた文字）</h2>
<table>
  <tr><th>$item.caption_1</th><td class="v"><{$item.caption_1}></td></tr>
  <tr><th>$item.caption_2</th><td class="v"><{$item.caption_2}></td></tr>
  <tr><th>$item.caption_3</th><td class="v"><{$item.caption_3}></td></tr>
  <tr><th>$item.caption</th><td class="v"><{$item.caption}></td></tr>
  <tr><th>$item.item_caption_1</th><td class="v"><{$item.item_caption_1}></td></tr>
  <tr><th>$item.itemcaption_1</th><td class="v"><{$item.itemcaption_1}></td></tr>
  <tr><th>$item.unit</th><td class="v"><{$item.unit}></td></tr>
  <tr><th>$item.unit_name</th><td class="v"><{$item.unit_name}></td></tr>
  <tr><th>$item.sale_unit</th><td class="v"><{$item.sale_unit}></td></tr>
  <tr><th>$item.quantity_caption</th><td class="v"><{$item.quantity_caption}></td></tr>
  <tr><th>$item.quantity_unit</th><td class="v"><{$item.quantity_unit}></td></tr>
  <tr><th>$item.description5</th><td class="v"><{$item.description5}></td></tr>
</table>

<{* 🔴 修飾子（|@count_characters など）は使いません。**その修飾子が無い環境だと
     テンプレート全体がコンパイルに失敗し、調査そのものが空振りします。**
     有無を知りたいだけなので if で十分です。 *}>
<h2>C. 参考（すでに判っているもの）</h2>
<table>
  <tr><th>$item.description</th><td class="v"><{if $item.description}>あり<{else}>なし<{/if}></td></tr>
  <tr><th>$item.description2</th><td class="v"><{if $item.description2}>あり<{else}>なし<{/if}></td></tr>
  <tr><th>$item.description3</th><td class="v"><{if $item.description3}>あり<{else}>なし<{/if}></td></tr>
  <tr><th>$item.description4</th><td class="v"><{if $item.description4}>あり<{else}>なし<{/if}></td></tr>
</table>

<h2>D. $recently_item（最近見た商品）</h2>
<div class="keys">
<{foreach from=$recently_item key=probe_key2 item=probe_val2}><span><{$probe_key2}></span><{/foreach}>
</div>
<table>
  <tr><th>$recently_item.has_item</th><td class="v"><{if $recently_item.has_item}>true<{else}>（偽または未定義）<{/if}></td></tr>
</table>

<{$makeshop.body_bottom}>
</body>
</html>
