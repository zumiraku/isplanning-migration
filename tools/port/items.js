/* 🔴 一覧の価格に桁区切りがありません（実測・2026-09-10）
 *
 *      現行    販売価格39,600円（税込）
 *      移植版  販売価格39600円（税込）
 *
 *    商品詳細には $item.price_html（55,000）がありますが、**一覧の
 *    タグには price_html がありません。** 試しに書くと空になり、
 *    価格そのものが消えました。
 *
 *    Smarty の修飾子は使えます（$item.group.list|@count で確認済み）。
 *    number_format を通すと現行と1文字も違わなくなりました。 */
/* ---------------------------------------------------------------------------
   items.js — 商品一覧のマークアップ

   🔴 推測で書きません

      [NEW1NN] や [SUISEN1NN] はプラットフォームがマークアップごと吐くタグで、
      元テンプレートには**タグ1文字しか書かれていません。** どんなHTMLが出て
      いたかは、公開ページを見るしかありません。下のマークアップは
      公開中のトップページから写したものです（class=lims / class=woong /
      class="M_displayImg" / width=25% の4列）。

   🔴 画像は image_S です

      実測: 旧サイトの一覧は itemimages/…3_….jpg で **220×220**、
      width=220 の指定つき。こちらは image_M（…2_….jpg）を寸法指定なしで
      出していました。山口様の「商品画像がすべてLサイズになっている」は
      これです。ランキングだけは別で、image_M を width=100 で出しています。

   🔴 商品特殊表示は、ここ（トップの一覧）には入れません

      山口様のご指摘「商品特殊表示がない（＠100円（税別）100個入）」は
      カテゴリ・検索・商品詳細・買い物かごの話です。**トップの一覧は元から
      出していません**（公開ページの #r_new は画像・商品名＋アイコン・価格の
      3行だけ）。元に無いものを足さないのが移植です。
      カテゴリ側は build-category.js で $…special_display を入れています。

   🔴 トップの一覧は image_M です（image_S ではありません）

      $new_item.list[i] 系の**個別フィールドはリファレンスに載っていません。**
      common に書いてあるのは $new_item.has_item だけです。切替中の実ページで
      .name .url .price .image_M が出ることは確認済みですが、image_S は
      未確認で、外れれば**トップの画像が全部消えます。** 見た目の大きさは
      width/height で合わせられるので、確実なほうを取ります。

      カテゴリと検索の一覧は $category.item.list[i].image_S が正式に
      載っているので、そちらは image_S を使います。

   🔴 トップの一覧に特殊表示は出しません

      公開ページの #r_new を見ると、画像・商品名＋アイコン・価格の3行だけで、
      特殊表示の行がありません。**元に無いものを足さない**のが移植です。
--------------------------------------------------------------------------- */

/* 4列の表。Smarty の section で4件ごとに行を折り返します。 */
/* 🔴 現行と件数が違いました（実測・2026-09-10）
 *
 *              現行  移植版
 *    ランキング   5     10
 *    新着商品    16     20
 *    定番の商品   12     20
 *    最近チェック  4      4   ← 12商品見ても両方4件。上限は同じです
 *
 *    現行の [NEW1NN] や [SUISEN1NN] は、件数を管理画面の設定で決めています。
 *    テンプレートには数字が書いてありません。クリエイターの
 *    $new_item.list はその設定を見ずに20件返します。
 *    **並びが4列なので、16→20 は行が1つ増えます。** 見た目が変わるので、
 *    いま公開ページに出ている件数で止めます。件数を変えたくなったら
 *    ここの数字だけ直してください。 */
function grid(listVar, name, max) {
  const it = listVar + ".list[" + name + "]";
  const cap = max ? " max=" + max : "";
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
<{section name=${name} loop=${listVar}.list${cap}}>
  <{if $smarty.section.${name}.index > 0 and $smarty.section.${name}.index % 4 == 0}></tr><tr><{/if}>
  <td align="center" class="lims" width="25%" valign="top">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" height="80">
      <tr><td align="center" class="M_displayImg">
        <a href="<{$${it}.url}>"><img src="<{${it}.image_M}>" border="0" alt="<{${it}.name}>" width="220" height="220"></a>
      </td></tr>
      <tr class="woong"><td valign="top" align="center">
        <a href="<{$${it}.url}>"><{$${it}.name}></a>
        <{if $${it}.icon.has_item}>
          <{section name=${name}i loop=$${it}.icon.list}><img src="<{$${it}.icon.list[${name}i].image_url}>" align="absmiddle" border="0"><{/section}>
        <{/if}>
      </td></tr>
      <tr class="woong"><td valign="top" align="center"><{$${it}.price|number_format}>円（税込）</td></tr>
    </table>
  </td>
<{/section}>
</tr></table>`;
}

/* ランキング。元テンプレートに <li class="rankList"> の形が書いてあるので、
   そちらはそのまま使い、中のタグだけ置き換えます。 */
function ranking() {
  const it = "$ranking_item.list[r]";
  return `<{section name=r loop=$ranking_item.list max=5}>
        <li class="rankList" id="rank<{$smarty.section.r.index_next}>">
            <em><{$smarty.section.r.index_next}></em>
            <div class="rankImg"><a href="<{${it}.url}>"><img src="<{${it}.image_M}>" alt="<{${it}.name}>" width="100" border="0"></a></div>
            <div class="rankDetail">
            	<p class="rankName"><a href="<{${it}.url}>"><{${it}.name}></a></p>
            	<p class="rankPrice"><{${it}.price}>円（税込）</p>
            </div>
        </li>
<{/section}>`;
}

/* お知らせ。公開ページから写したマークアップ（1件1テーブル、class=woong）。 */
function news() {
  const it = "$latest_news.list[nw]";
  return `<{section name=nw loop=$latest_news.list}>
<table border="0" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td width="80" class="woong" height="22" valign="top">[<{${it}.date.year}>/<{${it}.date.month}>/<{${it}.date.day}>]</td>
  <td class="woong" valign="top"><a href="<{${it}.url}>"><{${it}.title}></a></td>
</tr></table>
<{/section}>`;
}

module.exports = { grid, ranking, news };
