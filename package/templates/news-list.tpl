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
     お知らせ一覧 — Creator Mode（本文部分）

     100記事、2013年から。年7件ほどのペースで2026年も更新されており、
     53件がカタログ案内、1件あたり平均250文字。「中身が薄い」ページ群では
     ありません（news-plan.md）。

     🔴 URLが変わります。/new/index.html?mode=list → /view/news/list、
        個別記事は /view/news/yymmddhhmmss。日時形式なので旧URLから
        導出できず、URL一括設定の対象外です（C33）。13年分の被リンクを
        持つ100URLについて、まだ打ち手がありません。

     ページャーは $news.pager が構造体で返ります。

     🔴 ここには「カテゴリ側の $category.pager はHTMLがそのまま返るので
        扱いが違う」と書いてありました。**確かめずに書いた一文でした。**
        $category.pager も同じ構造体で、カテゴリ側はそれを値として出して
        いたため607ページに「Array」と表示されていました。いまは3つとも
        同じ書き方に揃えてあります。
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
</main>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
