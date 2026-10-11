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

