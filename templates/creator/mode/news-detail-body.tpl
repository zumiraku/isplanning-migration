<{* ==========================================================================
     お知らせ詳細 — Creator Mode（本文部分）

     本文は $news.content にHTMLとして入っているので、そのまま出します。
     ベーシックモード時代の96件で、検索結果に出る説明文にHTMLタグが
     そのまま混ざっていました。テンプレート側でタグを剥がす処理を入れると
     本文まで壊れるので、descriptionは $page.description に任せます。
   ========================================================================== *}>

<nav class="breadcrumb" aria-label="現在位置">
  <ol>
    <li><a href="<{$url.top}>">ホーム</a></li>
    <li><a href="<{$url.news}>">お知らせ</a></li>
    <li><span aria-current="page"><{$news.title}></span></li>
  </ol>
</nav>

<article class="article">
  <time class="newsmeta"><{$news.date.year}>年<{$news.date.month}>月<{$news.date.day}>日</time>
  <h1 class="h-page"><{$news.title}></h1>
  <{$news.content}>
</article>

<nav class="newsnav" aria-label="前後のお知らせ">
  <{if $news.prev_url}>
    <a class="newsnav__prev" href="<{$news.prev_url}>"><small>前のお知らせ</small></a>
  <{/if}>
  <a class="btn btn--ghost" href="<{$url.news}>">お知らせ一覧へ</a>
  <{if $news.next_url}>
    <a class="newsnav__next" href="<{$news.next_url}>"><small>次のお知らせ</small></a>
  <{/if}>
</nav>

<p class="u-center" style="margin-top:var(--s-10)">
  <a class="btn btn--primary" href="<{$url.top}>">粗品・景品をさがす</a>
</p>
