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
     プライバシーポリシー — Creator Mode（本文部分）

     独自ページではなく専用のページ種別です。中身は変換済みの
     templates/creator/freepages/privacy.html と同一で、次を通っています。
       タグ整合 0件 / 本文無傷 / レスポンシブ 375・768・1440px 合格
   ========================================================================== *}>

<h1 class="h-page">プライバシーポリシー</h1>

<div class="notice notice--warn">
  <p><b>このページは独自ページではありません（調査中）。</b></p>
  <p>管理画面の独自ページ一覧（82件）に <code>privacy.html</code> は含まれていません。
    独自ページの画面に記載されている利用可能なタグに
    <code>&lt;a href=[EMAIL]&gt;</code> があり、<code>/html/email.html</code> が
    システム生成ページであることが分かりました。
    <code>privacy.html</code> も同種のシステムページである可能性が高いと考えています。</p>
  <p>フッターの JavaScript から開かれており、通常のリンクが無いため、
    サイトマップにもクロールにも現れませんでした。
    どの機能が生成しているかを管理画面で確認したうえで対応します。</p>
  <p class="note-kome">※リンク先URLは正しく設定済みですので、判明しだいそのままつながります。</p>
</div>
</main>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
