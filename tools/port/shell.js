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
/* 🔴 本文の入れ物の id を落としていました（2026-09-10 実測）
 *
 *    現行のかごページは <div class="M_mainContents" id="M_basket"> です。
 *    移植では先頭のこの行を捨てて、シェルの <div class="M_mainContents"> に
 *    任せていました。**id が消えます。**
 *
 *    元CSSには id を前提にしたルールがあります。
 *
 *      #M_basket .btnWrap.clear { width: 100% }
 *      #r_basket .btnWrap .btnOrder { float: right }
 *
 *    width が効かないので、右に流したボタンが親からはみ出していました
 *    （実測 右227px）。「ご購入手続きへ進む」がずれて見えます。
 *    商品詳細も同じで、id="O_itemDetail" を落としていました。
 *
 *    シェルに id を渡せるようにします。 */
/* 🔴 お知らせ一覧のタイトルが、店名に化けていました（2026-09-10 実測）
 *
 *      現行    お知らせ一覧ページ
 *      移植版  粗品と景品の発見マーケット　ISPLANNING
 *
 *    `$page.title` は、お知らせ一覧では**店名しか返しません。** 現行の
 *    「お知らせ一覧ページ」は管理画面の設定から来ていて、デザインの
 *    ファイルには入っていません。ページ種別ごとに持たせます。
 *
 * 🔴 空の meta description を出していました
 *
 *    現行はカゴとお知らせ一覧に description がありません。こちらは
 *    `content=""` の空タグを出していました。中身が無いなら出しません。
 */

/* 🔴 商品ページの og:image が消えていました（2026-09-10 実測）
 *
 *    現行の商品ページには、プラットフォームが og:image を入れています。
 *
 *      https://makeshop-multi-images.akamaized.net/isplanning/itemimages/…jpg
 *
 *    こちらのシェルは og:title / og:description / og:site_name / og:type は
 *    出していましたが、**og:image を出していませんでした。**
 *    SNSやLINEで商品ページを共有したときに、画像が出ません。
 *    お客様の販促に直結します。画面に出ないので、見た目の検査では
 *    永久に見つかりませんでした。
 *
 *    ページ種別ごとに出す画像が違うので、シェルに渡す形にします。 */
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
<title>${opts.title || "<{$page.title}>"}</title>
<{if $page.description}><meta name="description" content="<{$page.description}>"><{/if}>
<link rel="canonical" href="<{$page.canonical_url}>">
<meta property="og:type" content="${opts.ogType || "website"}">
<meta property="og:title" content="${opts.title || "<{$page.title}>"}">
<meta property="og:description" content="<{$page.description}>">
<meta property="og:site_name" content="<{$shop.name}>">
${opts.ogImage ? `<meta property="og:image" content="${opts.ogImage}">
` : ""}
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
    <div class="M_mainContents"${opts.mainId ? ` id="${opts.mainId}"` : ""}>

${opts.body}

<{* 🔴 フッターは .M_mainContents の**中**です

     最初は外に出していました。#colum-wrap は幅指定の無いブロックなので、
     float:left の左メニューと float:right の .M_mainContents のあいだに
     割り込み、**本文がまるごと左メニューの下（top=5516px）に落ちました。**
     ヘッダーも左メニューもコラムも正しく出ているのに本文だけ無い、という
     見え方になります。

     公開ページの骨格を取り直したら、#colum-wrap も #footer_guideWrap も
     .M_mainContents の中にありました。元の入れ子に合わせます。

     .M_mainContents / #O_container / #wrapper / #bgMain / #wrap を閉じるのは
     フッターのモジュール側です。 *}>
<{$module.footer}>
<{$makeshop.body_bottom}>
<script src="<{$page.javascript}>"></script>
</body>
</html>
`;
}

module.exports = { shell, HEAD_EXTRA };
