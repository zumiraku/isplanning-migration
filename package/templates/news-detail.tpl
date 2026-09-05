<{* ==========================================================================
     文書の頭 — すべてのページ種別で共通
     各ページのHTML欄は「完全なHTML文書」です。本文の断片ではありません。

     🔴 $makeshop.head / $makeshop.body_top / $makeshop.body_bottom は必須。
        リファレンスに「必ず記載」と書かれており、これが無いと
        プラットフォームが差し込んでいるものが一切読み込まれません。
        この店舗の場合、具体的には次が消えます。

          - Googleアナリティクス（G-BK1PPN5MEV）
          - u-komi のレビュー読み込みスクリプト
          - かご投入などプラットフォーム側の挙動

        C32 で「GA4はプラットフォーム側から出ているので移行で消えない」と
        書いたのは正しいのですが、それは**このタグを書いていれば**の話です。
        書き忘れれば、壊れようがないと思っていたものが壊れます。
   ========================================================================== *}>
<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><{$page.title}></title>
<meta name="description" content="<{$page.description}>">
<link rel="canonical" href="<{$page.canonical_url}>">
<meta property="og:type" content="website">
<meta property="og:title" content="<{$page.title}>">
<meta property="og:description" content="<{$page.description}>">
<meta property="og:site_name" content="<{$shop.name}>">
<link rel="icon" href="<{$shop.favicon_url}>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Mochiy+Pop+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="<{$page.css}>">
<{$makeshop.head}>
</head>
<body>
<{$makeshop.body_top}>
<{$module.header}>
<main class="container">
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
</main>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
