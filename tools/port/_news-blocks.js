/* ---------------------------------------------------------------------------
   _news-blocks.js — お知らせ一覧・詳細のマークアップ

   🔴 骨格ごと違っていました（実測・2026-09-10）

      こちらは <ul class="infoList"> を使っていましたが、**infoList は
      公開中のサイトのどこにも出てきません。** こちらで付けた名前です。
      現行のお知らせは、こういう作りでした。

        <div class="rightContents" id="news">
          <h2 class="middle-ttl">お知らせ一覧</h2>
          <div class="section" id="r_news">
            <div id="newsList"> …2列の表（左に題名・右に日付）… </div>
            <div id="pager"> …[1] [2] … [最後]… </div>

      どれも m_sys_common に指定があります。

        #r_news 19本 / #newsListBtn 5本 / #newsHead 2本 /
        #newsContents 1本 / #newsNext 1本 / .middle-ttl 1本 / .rightContents 1本

      **文言の突き合わせは通っていました。** 文字は同じで、囲みだけが
      違ったからです。だから class と id を数える検査を足しました
      （tools/port/check-class-parity.js）。

      日付は現行が 2026/07/28 と0埋め2桁です。$news.date.month が最初から
      "07" を返すので、そのまま出せばそろいます（string_format は使えません）。
--------------------------------------------------------------------------- */

/* 🔴 string_format は使えません（実測・2026-09-10）
 *    <{...|string_format:"%02d"}> と書いたら、ページが
 *    「ショップを表示する際にエラーが発生しているため…」になりました。
 *    number_format は通るので、修飾子ぜんぶが駄目なわけではありません。
 *    ゼロ埋めは if で書きます。 */
/* 🔴 ゼロ埋めも要りませんでした。$news.date.month は最初から "07" を返します。
 *    if で足したら 2026/007/28 になりました。そのまま出します。 */
function pad(expr) { return "<{" + expr + "}>"; }

const N = "$news.list[n]";
const P = "$news.pager";

const newsList = [
  '<div class="rightContents" id="news">',
  '\t<h2 class="middle-ttl">お知らせ一覧</h2>',
  '\t<div class="section" id="r_news">',
  '\t<{if $news.has_item}>',
  '\t<div id="newsList">',
  '\t<table border="0" cellpadding="0" cellspacing="0" width="100%">',
  '\t<tr><td class="line" height="1" bgcolor="#dadada" colspan="2">&nbsp;</td></tr>',
  '\t<{section name=n loop=$news.list}>',
  '\t<tr bgcolor="#ffffff" height="25">',
  '\t\t<td class="lims" width="80%">&nbsp;<a href="<{' + N + '.url}>"><{' + N + '.title}></a></td>',
  '\t\t<td class="lims" align="center" width="20%"><{' + N + '.date.year}>/' + pad(N + ".date.month") + "/" + pad(N + ".date.day") + '</td>',
  '\t</tr>',
  '\t<{/section}>',
  '\t</table>',
  '\t</div>',
  '',
  '\t<div id="pager">',
  '\t<table border="0" cellpadding="0" cellspacing="0" width="368">',
  '\t<tr><td class="line" height="10">&nbsp;</td></tr>',
  '\t<tr><td align="center">',
  '\t<{if not ' + P + '.is_first}><a href="<{' + P + '.first_url}>"><font class="woong" color="#0000FF">[最初]</font></a>&nbsp;&nbsp;<{/if}>',
  '\t<{section name=p loop=' + P + '.list}>',
  '\t<{if ' + P + '.list[p].is_current_page}><font class="woong">[<{' + P + '.list[p].number}>]</font>&nbsp;&nbsp;',
  '\t<{else}><a href="<{' + P + '.list[p].url}>"><font class="woong" color="#0000FF">[<{' + P + '.list[p].number}>]</font></a>&nbsp;&nbsp;<{/if}>',
  '\t<{/section}>',
  '\t<{if not ' + P + '.is_last}><a href="<{' + P + '.last_url}>"><font class="woong" color="#0000FF">[最後]</font></a>&nbsp;&nbsp;<{/if}>',
  '\t</td></tr>',
  '\t</table>',
  '\t</div>',
  '\t<{else}>',
  '\t<p>お知らせはまだありません。</p>',
  '\t<{/if}>',
  '\t</div>',
  '</div>'
].join("\n");

/* 🔴 現行は見出しが「お知らせ」で固定、題名は #newsHead の中です。
 *    次のお知らせは #newsNext、一覧へ戻るボタンは #newsListBtn。
 *    題名を <h2> に置いていたので、CSSが1本も当たっていませんでした。
 *
 *    ⚠️ 現行の #newsNext には**次のお知らせの題名**が出ますが、
 *       クリエイターに題名を返すタグがありません（$news.next_url だけ）。
 *       ここだけは「次のお知らせ」という文字にしています。 */
const newsDetail = [
  '<div class="rightContents" id="news">',
  '\t<h2 class="middle-ttl">お知らせ</h2>',
  '\t<div class="section" id="r_news">',
  '\t\t<div id="newsHead"><span class="date"><{$news.date.year}>/' + pad("$news.date.month") + "/" + pad("$news.date.day") + '</span><{$news.title}></div>',
  '\t\t<div id="newsContents"><{$news.content}></div>',
  '\t\t<hr>',
  '\t\t<{if $news.prev_url}><p id="newsPrev"><a href="<{$news.prev_url}>" rel="prev">前のお知らせ</a></p><{/if}>',
  '\t\t<{if $news.next_url}><p id="newsNext"><a href="<{$news.next_url}>" rel="next">次のお知らせ</a></p><{/if}>',
  '\t\t<div id="newsListBtn"><a class="link_green-bg linkbar" href="<{$url.news}>">お知らせ一覧へ</a></div>',
  '\t</div>',
  '</div>'
].join("\n");

module.exports = { newsList, newsDetail };
