<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title><{$page.title}></title>
<meta name="description" content="<{$page.description}>">
<link rel="canonical" href="<{$page.canonical_url}>">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta property="og:type" content="website">
<meta property="og:title" content="<{$page.title}>">
<meta property="og:description" content="<{$page.description}>">
<meta property="og:site_name" content="<{$shop.name}>">
<meta name="twitter:card" content="Summary with Large Image">
<link rel="shortcut icon" type="image/ico" href="<{$shop.favicon_url}>">
<link rel="stylesheet" href="<{$page.css}>">
<{$makeshop.head}>
</head>

<body>
<{$makeshop.body_top}>

    <div class="wrapper">
        <div class="verify">
            <{if $member_verification.is_enabled}>
                <h1>【<{$shop.name}>】会員確認</h1>
                <p class="description-text">会員登録がお済みの方はログインしてください。<br>
                <a href="<{$url.login}>" class="verify-btn">会員ログイン</a></p>
                <{if $shop.is_member_entry_enabled}>
                <p class="description-text">会員でない方は会員登録することで当サイトをご利用いただけます。<br>
                <a href="<{$url.member_entry}>" class="verify-btn">新規会員登録</a></p>
                <{/if}>
            <{/if}>
            <{if $age_verification.is_enabled}>
                <h1>【<{$shop.name}>】年齢確認</h1>
                <p class="description-text">あなたは<{$age_verification.age}>歳以上ですか？</p>
                <p class="description-text"><a href="<{$age_verification.url}>" class="verify-btn">はい</a></p>
                <p class="description-text"><a href="javascript:void(0);" onclick="history.go(-1);" class="verify-btn">いいえ</a></p>
            <{/if}>
            <p class="copyright"><{$shop.copyright}></p>
        </div>
    </div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
<script src="<{$page.javascript}>"></script>
<{$makeshop.body_bottom}>
</body>
</html>