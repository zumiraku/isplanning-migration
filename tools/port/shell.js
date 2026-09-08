/* ---------------------------------------------------------------------------
   shell.js — 全ページ共通の文書の外側

   各ページのHTML欄は「完全なHTML文書」です。本文の断片ではありません。

   🔴 $makeshop.head / body_top / body_bottom は必須
      これが無いと GA4（G-BK1PPN5MEV）も u-komi もカゴ投入も動きません。

   🔴 旧サイトの 共通head管理 にあったものを全部持ってきます
      Google の所有権確認3本、Noto Sans JP と Mochiy Pop One、そして
      **gigaplus の default.css**。default.css は22KBのユーティリティCSSで、
      m_sys_common.css とは別物です。**片方だけ移すと余白と文字サイズが
      全部ずれます。**
--------------------------------------------------------------------------- */
const HEAD_EXTRA = `<meta name="googlebot" content="NOODP">
<meta name="google-site-verification" content="L9LBYhUrWwhjZ0gO7jQg6ET8BNBqWbwWlCkeo2ZyP_s">
<meta name="google-site-verification" content="D6YaDg_WQObAhN2-bDzeZpr-rdLLeCzVZFLi1-MuCPo">
<meta name="google-site-verification" content="LvZm_KlYvKyFf9HCkCnvyRUTHeNFcweS7S6_I1qJ9pw">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://gigaplus.makeshop.jp/isplanning/css/default.css">`;

/* トップだけスライダーが入ります。旧テンプレートでは 上段メニュー の中に
   [TOPIMAGE] がありましたが、モジュールは全ページ共通なので、ここで
   ページ側に持たせています。 */
function shell(opts) {
  const slider = opts.slider
    ? '\n<div class="slider">\n<{$shop.mainvisual}>\n</div>\n'
    : "";
  return `<{* ==========================================================================
     ${opts.name} — ベーシックモードからの移植

     生成物です。直すときは tools/port/build-pages.js を直してください。
     マークアップは design_${opts.from}.txt のままで、タグとURLだけ
     置き換えています。class も id も並び順も変えていません。
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
${HEAD_EXTRA}
<link rel="stylesheet" href="<{$page.css}>">
<{$makeshop.head}>
</head>
<body>
<{$makeshop.body_top}>
<{$module.header}>
${slider}
<div id="wrapper">
  <div id="O_container">
    <{$module.leftmenu}>
    <div class="M_mainContents">

${opts.body}

    </div><!-- /.M_mainContents -->
  </div><!-- /#O_container -->
</div><!-- /#wrapper -->
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
`;
}

module.exports = { shell, HEAD_EXTRA };
