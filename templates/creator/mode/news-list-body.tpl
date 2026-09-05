<{* ==========================================================================
     お知らせ一覧 — Creator Mode（本文部分）

     100記事、2013年から。年7件ほどのペースで2026年も更新されており、
     53件がカタログ案内、1件あたり平均250文字。「中身が薄い」ページ群では
     ありません（news-plan.md）。

     🔴 URLが変わります。/new/index.html?mode=list → /view/news/list、
        個別記事は /view/news/yymmddhhmmss。日時形式なので旧URLから
        導出できず、URL一括設定の対象外です（C33）。13年分の被リンクを
        持つ100URLについて、まだ打ち手がありません。

     ページャーは $news.pager が構造体で返るので、カテゴリ側の
     $category.pager（HTMLがそのまま返る）とは扱いが違います。
   ========================================================================== *}>

<h1 class="h-page">お知らせ</h1>

<{if $news.has_item}>

  <p class="listbar__count">全 <b><{$news.total_count}></b> 件</p>

  <ul class="newslist">
    <{section name=i loop=$news.list}>
      <li>
        <a href="<{$news.list[i].url}>">
          <time class="newsmeta"><{$news.list[i].date.year}>.<{$news.list[i].date.month}>.<{$news.list[i].date.day}></time>
          <span class="card__name"><{$news.list[i].title}></span>
        </a>
      </li>
    <{/section}>
  </ul>

  <{* ページャー。数字だけでなく前後のリンクも出します。100記事あるので
       「次へ」が無いと読み進められません。 *}>
  <nav class="pager" aria-label="ページ送り">
    <{if $news.pager.is_first}>
    <{else}>
      <a href="<{$news.pager.first_url}>">最初へ</a>
      <a href="<{$news.pager.prev_url}>">前へ</a>
    <{/if}>

    <{section name=p loop=$news.pager.list}>
      <{if $news.pager.list[p].is_current_page}>
        <span aria-current="page"><{$news.pager.list[p].number}></span>
      <{else}>
        <a href="<{$news.pager.list[p].url}>"><{$news.pager.list[p].number}></a>
      <{/if}>
    <{/section}>

    <{if $news.pager.is_last}>
    <{else}>
      <a href="<{$news.pager.next_url}>">次へ</a>
      <a href="<{$news.pager.last_url}>">最後へ</a>
    <{/if}>
  </nav>

<{else}>
  <p class="notice">現在お知らせはございません。</p>
<{/if}>
